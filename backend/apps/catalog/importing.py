import csv
import io
import json
import logging
import re
from django.db.models import Q
from django.utils.text import slugify
from apps.catalog.models import Category, Product, ProductImage

logger = logging.getLogger(__name__)


PRICE_KEYS = (
    'client_revised_price_(inr)', 'client_revised_price', 'trade_price_(inr)',
    'trade_price', 'price_(inr)', 'price_inr', 'price',
)


def _normalize_key(key):
    """'Product Name' / 'Price (INR)' / BOM-prefixed headers -> 'product_name' / 'price_(inr)'."""
    return (
        str(key or '').replace('\ufeff', '').strip().lower()
        .replace(' ', '_').replace('/', '_').replace('-', '_')
    )


# Column names owners use in their own price lists, mapped onto the importer's keys.
HEADER_ALIASES = {
    'product_name': ('item_name', 'item', 'product', 'products', 'product_title', 'particulars',
                     'name_of_product', 'name_of_item', 'item_description', 'description_of_goods'),
    'price': ('rate', 'mrp', 'selling_price', 'sale_price', 'unit_price', 'price_per_unit', 'rate_(inr)',
              'mrp_(inr)', 'rate_(rs)', 'price_(rs)', 'price_(rs.)', 'rate_(rs.)', 'wholesale_price', 'dealer_price'),
    'sku': ('code', 'product_code', 'model', 'model_no', 'model_number', 'part_no', 'part_number', 'item_no'),
    'category_name': ('product_category', 'group', 'product_group', 'item_group'),
    'minimum_order_quantity': ('min_qty', 'min_order', 'minimum_qty', 'min_order_qty', 'minimum_order'),
}
NAME_KEYS = ('client_revised_name', 'product_name', 'name', 'title')


def _clean_cell(v):
    if v is None:
        return ''
    if isinstance(v, str):
        return v.strip()
    if isinstance(v, float) and v.is_integer():
        return int(v)  # 1001.0 from Excel -> 1001, so SKUs and MOQs read naturally
    if hasattr(v, 'isoformat'):
        return v.isoformat()  # dates must survive the JSON round trip to the execute step
    return v


def _normalize_row(row):
    if not isinstance(row, dict):
        return {}
    out = {}
    for k, v in row.items():
        nk = _normalize_key(k)
        if nk:
            out[nk] = _clean_cell(v)
    for canonical, aliases in HEADER_ALIASES.items():
        if str(out.get(canonical, '')).strip():
            continue
        for alias in aliases:
            if str(out.get(alias, '')).strip():
                out[canonical] = out[alias]
                break
    return out


def _is_header_row(cells):
    keys = {_normalize_key(c) for c in cells if c not in (None, '')}
    name_like = set(NAME_KEYS) | set(HEADER_ALIASES['product_name'])
    return bool(keys & name_like)


def _rows_from_table(table):
    """Turn a list of row lists into dicts, finding the header row within the first 20 rows."""
    for idx, cells in enumerate(table[:20]):
        if _is_header_row(cells):
            headers = [_normalize_key(c) for c in cells]
            rows = []
            for cells_row in table[idx + 1:]:
                if not any(str(c).strip() for c in cells_row if c is not None):
                    continue
                rows.append({h: (cells_row[i] if i < len(cells_row) else '') for i, h in enumerate(headers) if h})
            return rows
    return None


def _raw_price(data):
    for key in PRICE_KEYS:
        val = data.get(key)
        if val is not None and str(val).strip():
            return val
    return None


def _parse_price(val):
    """Accepts 280, '280.50', '1,250', '₹ 280', '280/roll'. Returns float or None."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    match = re.search(r'\d+(?:\.\d+)?', str(val).replace(',', ''))
    return float(match.group(0)) if match else None


def _parse_moq(val):
    """MOQ is an integer column: '1 Roll' -> 1, '50 pcs' -> 50, '' -> None."""
    if val is None or isinstance(val, bool):
        return None
    if isinstance(val, (int, float)):
        return int(val) if val >= 0 else None
    match = re.search(r'\d+', str(val).replace(',', ''))
    return int(match.group(0)) if match else None


def _decode_upload(uploaded_file):
    raw = uploaded_file.read()
    for enc in ('utf-8-sig', 'cp1252'):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            continue
    return raw.decode('utf-8', errors='ignore')


class ImportFileError(ValueError):
    """The uploaded file cannot be turned into product rows; the message is shown to the owner."""


def rows_from_upload(uploaded_file):
    """Read an .xlsx / .csv / .json upload into a list of raw row dicts."""
    filename = uploaded_file.name.lower()

    if filename.endswith('.xls'):
        raise ImportFileError('This is an old Excel .xls file. Open it in Excel or Google Sheets and save it as .xlsx, then upload again.')
    if filename.endswith(('.xlsx', '.xlsm')):
        try:
            import openpyxl
            wb = openpyxl.load_workbook(uploaded_file, data_only=True, read_only=True)
            # Use the active sheet first, then any other sheet that has a product-name column.
            sheets = [wb.active] + [ws for ws in wb.worksheets if ws is not wb.active]
            found = None
            for ws in sheets:
                found = _rows_from_table([list(r) for r in ws.iter_rows(values_only=True)])
                if found is not None:
                    break
            wb.close()
        except Exception as e:  # openpyxl raises many unrelated types for corrupt files
            logger.warning('Excel import read failed: %s', e)
            raise ImportFileError(f'Could not read this Excel file: {str(e)}')
        if found is None:
            raise ImportFileError('No product name column found. Add a header such as "Product Name", "Item Name" or "Name" above your rows.')
        rows = found
    elif filename.endswith('.json'):
        content = _decode_upload(uploaded_file)
        try:
            data = json.loads(content)
            rows = data.get('products', data) if isinstance(data, dict) else data
        except ValueError as e:
            raise ImportFileError(f'Invalid JSON: {str(e)}')
    elif filename.endswith('.csv'):
        content = _decode_upload(uploaded_file)
        try:
            dialect = csv.Sniffer().sniff(content[:4096], delimiters=',;\t')
        except csv.Error:
            dialect = csv.excel
        table = list(csv.reader(io.StringIO(content), dialect=dialect))
        found = _rows_from_table(table)
        if found is None:
            raise ImportFileError('No product name column found. Add a header such as "Product Name", "Item Name" or "Name" above your rows.')
        rows = found
    else:
        raise ImportFileError('Unsupported file format. Provide .xlsx, .csv or .json')
    return rows


def build_import_preview(rows):
    """Check every row and report what an import would do; returns the response payload."""
    rows = [_normalize_row(r) for r in rows]

    # Validate rows
    valid_rows = []
    errors = []
    existing_skus = set(Product.objects.values_list('sku', flat=True))
    existing_slugs = set(Product.objects.values_list('slug', flat=True))

    for idx, row in enumerate(rows):
        name = (
            str(row.get('client_revised_name') or '').strip() or
            str(row.get('product_name') or '').strip() or
            str(row.get('name') or '').strip() or
            str(row.get('title') or '').strip()
        )
        sku = (str(row.get('sku') or row.get('item_code') or '')).strip()
        cat_slug = (
            str(row.get('category_slug') or '').strip() or
            slugify(str(row.get('category_name') or '').strip()) or
            slugify(str(row.get('category') or '').strip()) or
            'general-supplies'
        )
        price_val = _raw_price(row)
        if price_val is not None and _parse_price(price_val) is None:
            errors.append({'row': idx + 1, 'sku': sku, 'error': f'Price "{price_val}" is not a number'})
            continue

        if not name:
            errors.append({'row': idx + 1, 'sku': sku, 'error': 'Product name is required'})
            continue

        status_flag = 'new'
        if sku in existing_skus:
            status_flag = 'existing_sku'
        elif (row.get('slug') or '') in existing_slugs:
            status_flag = 'existing_slug'

        valid_rows.append({
            'row_index': idx + 1,
            'name': name,
            'sku': sku or f"GEN-{idx+1:04d}",
            'category_slug': cat_slug,
            'price': price_val,
            'material': row.get('material'),
            'dimensions': row.get('dimensions'),
            'status': status_flag,
            'raw_data': row
        })

    return {
        'total_rows': len(rows),
        'valid_count': len(valid_rows),
        'new_count': sum(1 for r in valid_rows if r['status'] == 'new'),
        'existing_count': sum(1 for r in valid_rows if r['status'].startswith('existing')),
        'error_count': len(errors),
        'errors': errors,
        'preview': valid_rows[:50],
        # Full list for the execute step; preview is only what the UI shows.
        'rows': [r['raw_data'] for r in valid_rows],
    }


def import_rows(rows, strategy):
    """Create or update products from validated rows; returns the response payload."""
    imported_count = 0
    updated_count = 0
    skipped_count = 0
    errors = []

    for item in rows:
        data = _normalize_row(item.get('raw_data', item) if isinstance(item, dict) else {})
        name = (
            str(data.get('client_revised_name') or '').strip() or
            str(data.get('product_name') or '').strip() or
            str(data.get('name') or '').strip() or
            str(data.get('title') or '').strip()
        )
        sku = (str(data.get('sku') or data.get('item_code') or '')).strip()
        cat_name = str(data.get('category_name') or data.get('category') or 'General Supplies').strip()
        cat_slug = (
            str(data.get('category_slug') or '').strip() or
            slugify(cat_name) or
            'general-supplies'
        )

        if not name:
            continue

        # Ensure category exists
        category, _ = Category.objects.get_or_create(
            slug=cat_slug,
            defaults={'name': cat_name, 'display_order': 10}
        )

        existing_prod = Product.objects.filter(Q(sku=sku) | Q(slug=data.get('slug', ''))).first() if sku else None

        if existing_prod:
            if strategy == 'update':
                existing_prod.name = name
                existing_prod.category = category
                if data.get('short_description'):
                    existing_prod.short_description = data['short_description']
                full_desc = data.get('description') or data.get('full_description')
                if full_desc:
                    existing_prod.description = full_desc
                parsed_price = _parse_price(_raw_price(data))
                if parsed_price is not None:
                    existing_prod.price = parsed_price
                if data.get('material'):
                    existing_prod.material = data['material']
                if data.get('dimensions'):
                    existing_prod.dimensions = data['dimensions']
                if data.get('color'):
                    existing_prod.color = data['color']
                price_display_val = data.get('display_price_text') or data.get('price_display') or data.get('display_price')
                if price_display_val:
                    existing_prod.price_display = price_display_val
                moq_val = _parse_moq(data.get('minimum_order_quantity') or data.get('moq'))
                if moq_val is not None:
                    existing_prod.minimum_order_quantity = moq_val
                if data.get('seo_title'):
                    existing_prod.seo_title = str(data['seo_title'])[:255]
                if data.get('seo_description'):
                    existing_prod.seo_description = data['seo_description']
                specs_raw = data.get('specifications_(json)') or data.get('specifications_json') or data.get('specs') or data.get('specifications')
                if specs_raw:
                    if isinstance(specs_raw, dict):
                        existing_prod.specifications = specs_raw
                    elif isinstance(specs_raw, str) and specs_raw.strip().startswith('{'):
                        try:
                            existing_prod.specifications = json.loads(specs_raw)
                        except ValueError:
                            pass
                existing_prod.save()
                updated_count += 1
            else:
                skipped_count += 1
        else:
            try:
                price_raw = _raw_price(data)
                price_val = _parse_price(price_raw)

                price_display_val = data.get('display_price_text') or data.get('price_display') or data.get('display_price') or (f"₹ {price_raw}" if price_raw else '')
                moq_val = _parse_moq(data.get('minimum_order_quantity') or data.get('moq'))
                specs_dict = {}
                specs_raw = data.get('specifications_(json)') or data.get('specifications_json') or data.get('specs') or data.get('specifications')
                if specs_raw:
                    if isinstance(specs_raw, dict):
                        specs_dict = specs_raw
                    elif isinstance(specs_raw, str) and specs_raw.strip().startswith('{'):
                        try:
                            specs_dict = json.loads(specs_raw)
                        except ValueError:
                            pass

                new_prod = Product.objects.create(
                    name=name,
                    sku=sku or f"SKU-{Product.objects.count()+1:04d}",
                    category=category,
                    short_description=data.get('short_description', ''),
                    description=data.get('description') or data.get('full_description') or '',
                    material=data.get('material'),
                    dimensions=data.get('dimensions'),
                    color=data.get('color'),
                    price=price_val,
                    price_display=price_display_val,
                    minimum_order_quantity=moq_val,
                    specifications=specs_dict,
                    seo_title=str(data.get('seo_title') or '')[:255],
                    seo_description=data.get('seo_description') or '',
                    reference_source_url=data.get('url') or data.get('reference_source_url'),
                    verification_status=data.get('verification_status', 'verified')
                )

                # Add image if provided
                img_url = data.get('image_url') or data.get('primary_image_url') or data.get('image')
                if not img_url and data.get('image_filename'):
                    img_url = f"/media/products/{data.get('image_filename')}"
                if img_url:
                    ProductImage.objects.create(
                        product=new_prod,
                        secure_url=str(img_url).strip(),
                        alt_text=name,
                        is_primary=True
                    )
                imported_count += 1
            except Exception as e:  # one bad row must not abort the batch; it is reported back
                logger.exception('Bulk import failed for row %r', name)
                errors.append({'name': name, 'sku': sku, 'error': str(e)})

    return {
        'message': 'Bulk import completed',
        'imported_count': imported_count,
        'updated_count': updated_count,
        'skipped_count': skipped_count,
        'errors': errors,
    }
