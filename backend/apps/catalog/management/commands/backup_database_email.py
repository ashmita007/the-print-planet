import io
import json
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.catalog.models import Category, Product, ProductImage
from apps.enquiries.models import Enquiry
from apps.settings_app.models import SiteSettings


def generate_full_database_excel_bytes():
    """Generates a complete multi-sheet Excel workbook backup of all database tables."""
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter

    wb = openpyxl.Workbook()

    header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
    border_thin = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )

    # ----------------------------------------------------
    # Sheet 1: Products
    # ----------------------------------------------------
    ws_prod = wb.active
    ws_prod.title = 'Products'
    headers_prod = [
        'ID', 'SKU', 'Name', 'Slug', 'Category', 'Price (INR)', 'Price Display',
        'MOQ', 'Material', 'Dimensions', 'Color', 'Is Featured', 'Is Active',
        'Image URL', 'Short Description', 'Full Description', 'Specifications JSON',
        'SEO Title', 'SEO Description', 'Created At'
    ]
    ws_prod.append(headers_prod)
    for col_idx in range(1, len(headers_prod) + 1):
        cell = ws_prod.cell(row=1, column=col_idx)
        cell.fill = PatternFill(start_color='102742', end_color='102742', fill_type='solid')
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')

    for p in Product.objects.select_related('category').prefetch_related('images').all().order_by('id'):
        img = p.images.filter(is_primary=True).first() or p.images.first()
        ws_prod.append([
            p.id,
            p.sku,
            p.name,
            p.slug,
            p.category.name if p.category else '',
            float(p.price) if p.price is not None else '',
            p.price_display or '',
            p.minimum_order_quantity or '',
            p.material or '',
            p.dimensions or '',
            p.color or '',
            'Yes' if p.is_featured else 'No',
            'Yes' if p.is_active else 'No',
            img.secure_url if img else '',
            p.short_description or '',
            p.description or '',
            json.dumps(p.specifications) if p.specifications else '',
            p.seo_title or '',
            p.seo_description or '',
            p.created_at.strftime('%Y-%m-%d %H:%M:%S') if p.created_at else ''
        ])

    for col in ws_prod.columns:
        col_letter = get_column_letter(col[0].column)
        ws_prod.column_dimensions[col_letter].width = 22

    # ----------------------------------------------------
    # Sheet 2: Categories
    # ----------------------------------------------------
    ws_cat = wb.create_sheet(title='Categories')
    headers_cat = ['ID', 'Name', 'Slug', 'Description', 'Display Order', 'Is Active', 'SEO Title', 'SEO Description']
    ws_cat.append(headers_cat)
    for col_idx in range(1, len(headers_cat) + 1):
        cell = ws_cat.cell(row=1, column=col_idx)
        cell.fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')

    for c in Category.objects.all().order_by('display_order'):
        ws_cat.append([
            c.id, c.name, c.slug, c.description or '',
            c.display_order, 'Yes' if c.is_active else 'No',
            c.seo_title or '', c.seo_description or ''
        ])

    for col in ws_cat.columns:
        col_letter = get_column_letter(col[0].column)
        ws_cat.column_dimensions[col_letter].width = 25

    # ----------------------------------------------------
    # Sheet 3: Customer Enquiries
    # ----------------------------------------------------
    ws_enq = wb.create_sheet(title='Customer Enquiries')
    headers_enq = [
        'ID', 'Customer Name', 'Company Name', 'Email', 'Phone',
        'Product Name', 'Requested Quantity', 'Message', 'Status',
        'Source Page', 'Admin Notes', 'Date Submitted'
    ]
    ws_enq.append(headers_enq)
    for col_idx in range(1, len(headers_enq) + 1):
        cell = ws_enq.cell(row=1, column=col_idx)
        cell.fill = PatternFill(start_color='E87832', end_color='E87832', fill_type='solid')
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')

    for e in Enquiry.objects.all().order_by('-id'):
        ws_enq.append([
            e.id, e.full_name, e.company_name or '', e.email, e.phone,
            e.product_name_text or (e.product.name if e.product else ''),
            e.requested_quantity or '', e.message, e.status,
            e.source_page or '', e.admin_notes or '',
            e.created_at.strftime('%Y-%m-%d %H:%M:%S') if e.created_at else ''
        ])

    for col in ws_enq.columns:
        col_letter = get_column_letter(col[0].column)
        ws_enq.column_dimensions[col_letter].width = 24

    # ----------------------------------------------------
    # Sheet 4: Site Settings
    # ----------------------------------------------------
    ws_set = wb.create_sheet(title='Store Settings')
    ws_set.append(['Setting Field', 'Configured Value'])
    ws_set.cell(row=1, column=1).font = header_font
    ws_set.cell(row=1, column=1).fill = PatternFill(start_color='2E75B6', end_color='2E75B6', fill_type='solid')
    ws_set.cell(row=1, column=2).font = header_font
    ws_set.cell(row=1, column=2).fill = PatternFill(start_color='2E75B6', end_color='2E75B6', fill_type='solid')

    st = SiteSettings.get_settings()
    ws_set.append(['Business Name', st.business_name])
    ws_set.append(['Tagline', st.tagline])
    ws_set.append(['Contact Email', st.email])
    ws_set.append(['Phone', st.phone])
    ws_set.append(['WhatsApp', st.whatsapp])
    ws_set.append(['GST Number', st.gst_number])
    ws_set.append(['Physical Address', st.address])

    for col in ws_set.columns:
        col_letter = get_column_letter(col[0].column)
        ws_set.column_dimensions[col_letter].width = 35

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


class Command(BaseCommand):
    help = 'Generates an Excel database backup and emails it to the store owner.'

    def add_arguments(self, parser):
        parser.add_argument('--recipient', type=str, default='', help='Destination email address')

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Generating complete database Excel backup..."))

        excel_bytes = generate_full_database_excel_bytes()
        now_str = datetime.now().strftime('%Y-%m-%d_%H-%M')
        filename = f"The_Print_Planet_DB_Backup_{now_str}.xlsx"

        site_settings = SiteSettings.get_settings()
        recipient = (
            options.get('recipient') or
            getattr(settings, 'OWNER_NOTIFICATION_EMAIL', '') or
            site_settings.email or
            'theprintplanet01@gmail.com'
        )

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '') or f"{site_settings.business_name} <{recipient}>"

        subject = f"📦 [Database Backup] The Print Planet - {now_str}"
        body = f"""
Hello,

Attached is your complete automated database backup for The Print Planet.

Backup Summary:
- Products: {Product.objects.count()} active items
- Categories: {Category.objects.count()} categories
- Enquiries: {Enquiry.objects.count()} customer leads
- Date Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
- Backup File: {filename} ({round(len(excel_bytes) / 1024, 1)} KB)

This file contains all products, prices, images, specifications, client enquiries, and store settings.
You can open it in Microsoft Excel, Apple Numbers, or Google Sheets.

Best Regards,
The Print Planet Automated Backup Shield
"""

        html_body = f"""
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#263445;line-height:1.6">
  <h2 style="color:#17365D;margin:0 0 8px">Database backup</h2>
  <p style="margin:0 0 16px;color:#687586">The Print Planet automated backup for {now_str}</p>
  <p style="font-size:14px">Products: {Product.objects.count()} &middot; Categories: {Category.objects.count()} &middot; Enquiries: {Enquiry.objects.count()}</p>
  <p style="color:#687586;font-size:12px">Open the attached workbook in Excel, Numbers, or Google Sheets.</p>
</div>
"""

        from apps.enquiries.services import _send_email_via_https
        sent = _send_email_via_https(
            recipient,
            subject,
            body,
            html_body,
            attachment_bytes=excel_bytes,
            attachment_name=filename,
        )
        if sent:
            self.stdout.write(self.style.SUCCESS(f"Successfully dispatched database backup to {recipient}!"))
        else:
            self.stdout.write(self.style.ERROR("No HTTPS email provider could deliver the backup. Configure BREVO_API_KEY or RESEND_API_KEY."))
