from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.catalog.models import Category, Product
from apps.enquiries.models import Enquiry
from apps.settings_app.models import SiteSettings
from apps.catalog.excel_backup import generate_full_database_excel_bytes


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
