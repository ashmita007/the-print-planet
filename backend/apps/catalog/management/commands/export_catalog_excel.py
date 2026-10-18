import os
import json
from pathlib import Path
from django.core.management.base import BaseCommand
from apps.catalog.models import Category, Product, ProductImage


class Command(BaseCommand):
    help = 'Exports verified products, categories, specifications, and image URLs to styled Excel and CSV files.'

    def add_arguments(self, parser):
        parser.add_argument('--output-dir', type=str, default='', help='Directory to save the exported files')

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Exporting catalogue and images to Excel..."))

        try:
            import openpyxl
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
            from openpyxl.utils import get_column_letter
        except ImportError:
            self.stdout.write(self.style.ERROR("openpyxl is not installed. Run 'pip install openpyxl' first."))
            return

        wb = openpyxl.Workbook()

        # Sheet 1: Products & Images
        ws1 = wb.active
        ws1.title = 'Products & Images'

        headers1 = [
            'ID', 'SKU', 'Product Name', 'Category', 'Primary Image URL',
            'Local Image Path', 'Image File Size (KB)', 'Price (INR)', 'Price Display',
            'MOQ', 'Material', 'Dimensions', 'Color', 'Is Featured',
            'Short Description', 'Full Description', 'Specifications (JSON)',
            'SEO Title', 'SEO Description'
        ]

        header_fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')
        header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
        border_thin = Border(
            left=Side(style='thin', color='D9D9D9'),
            right=Side(style='thin', color='D9D9D9'),
            top=Side(style='thin', color='D9D9D9'),
            bottom=Side(style='thin', color='D9D9D9')
        )

        ws1.append(headers1)
        for col_num in range(1, len(headers1) + 1):
            cell = ws1.cell(row=1, column=col_num)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)

        from django.conf import settings
        media_products_dir = Path(settings.MEDIA_ROOT) / 'products'

        products = Product.objects.select_related('category').prefetch_related('images').all().order_by('id')

        for p in products:
            primary_img = p.images.filter(is_primary=True).first() or p.images.first()
            img_url = primary_img.secure_url if primary_img else ''
            
            file_size_kb = ''
            local_path = ''
            if primary_img and primary_img.secure_url:
                fname = os.path.basename(primary_img.secure_url)
                fpath = media_products_dir / fname
                if fpath.exists():
                    local_path = f'media/products/{fname}'
                    file_size_kb = round(fpath.stat().st_size / 1024, 1)

            specs_str = json.dumps(p.specifications) if p.specifications else ''

            row = [
                p.id,
                p.sku,
                p.name,
                p.category.name if p.category else '',
                img_url,
                local_path,
                file_size_kb,
                float(p.price) if p.price is not None else '',
                p.price_display or '',
                p.minimum_order_quantity or '',
                p.material or '',
                p.dimensions or '',
                p.color or '',
                'Yes' if p.is_featured else 'No',
                p.short_description or '',
                p.description or '',
                specs_str,
                p.seo_title or '',
                p.seo_description or ''
            ]
            ws1.append(row)

        for row in ws1.iter_rows(min_row=2, max_row=ws1.max_row, min_col=1, max_col=len(headers1)):
            for cell in row:
                cell.font = Font(name='Calibri', size=10)
                cell.border = border_thin
                cell.alignment = Alignment(vertical='top')

        for col in ws1.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val = str(cell.value or '')
                if len(val) > max_len:
                    max_len = len(val)
            ws1.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

        # Sheet 2: Categories
        ws2 = wb.create_sheet(title='Categories')
        headers2 = ['ID', 'Category Name', 'Slug', 'Display Order', 'Active', 'Products Count', 'SEO Title', 'SEO Description']
        ws2.append(headers2)
        for col_num in range(1, len(headers2) + 1):
            cell = ws2.cell(row=1, column=col_num)
            cell.fill = PatternFill(start_color='2E75B6', end_color='2E75B6', fill_type='solid')
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center')

        for c in Category.objects.all().order_by('display_order'):
            ws2.append([
                c.id,
                c.name,
                c.slug,
                c.display_order,
                'Yes' if c.is_active else 'No',
                c.products.count(),
                c.seo_title or '',
                c.seo_description or ''
            ])

        for row in ws2.iter_rows(min_row=2, max_row=ws2.max_row, min_col=1, max_col=len(headers2)):
            for cell in row:
                cell.font = Font(name='Calibri', size=10)
                cell.border = border_thin

        for col in ws2.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val = str(cell.value or '')
                if len(val) > max_len:
                    max_len = len(val)
            ws2.column_dimensions[col_letter].width = min(max(max_len + 3, 14), 50)

        # Determine output location
        if options.get('output_dir'):
            out_dir = Path(options['output_dir'])
        else:
            candidates = [
                Path(settings.BASE_DIR).parent / 'data',
                Path(settings.BASE_DIR) / 'data',
                Path('/app/data'),
            ]
            out_dir = candidates[0]
            for c in candidates:
                if c.exists():
                    out_dir = c
                    break

        out_dir.mkdir(parents=True, exist_ok=True)
        xlsx_path = out_dir / 'The_Print_Planet_Products_and_Images.xlsx'
        wb.save(xlsx_path)

        import csv
        csv_path = out_dir / 'The_Print_Planet_Products_and_Images.csv'
        with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            for row in ws1.iter_rows(values_only=True):
                writer.writerow(row)

        self.stdout.write(self.style.SUCCESS(f"Saved Excel file: {xlsx_path}"))
        self.stdout.write(self.style.SUCCESS(f"Saved CSV file:   {csv_path}"))
