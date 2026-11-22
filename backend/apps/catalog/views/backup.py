import logging
from django.conf import settings
from django.http import HttpResponse
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.catalog.models import Category, Product
from apps.catalog.excel_backup import generate_full_database_excel_bytes
from datetime import datetime
from apps.settings_app.models import SiteSettings
from apps.enquiries.models import Enquiry

logger = logging.getLogger(__name__)


class OwnerDatabaseBackupEmailView(APIView):
    """Owner endpoint to generate full database Excel backup and email it to owner."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        try:
            excel_bytes = generate_full_database_excel_bytes()
            now_str = datetime.now().strftime('%Y-%m-%d_%H-%M')
            filename = f"The_Print_Planet_DB_Backup_{now_str}.xlsx"

            site_settings = SiteSettings.get_settings()
            recipient = (
                request.data.get('recipient') or
                getattr(settings, 'OWNER_NOTIFICATION_EMAIL', '') or
                site_settings.email or
                'theprintplanet01@gmail.com'
            )
            subject = f"[Database Backup] The Print Planet - {now_str}"
            body = f"""Hello,

Attached is your complete automated database backup for The Print Planet.

Backup Summary:
- Products: {Product.objects.count()} active items
- Categories: {Category.objects.count()} categories
- Enquiries: {Enquiry.objects.count()} customer leads
- Date Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
- Backup File: {filename} ({round(len(excel_bytes) / 1024, 1)} KB)

This file contains all products, prices, images, specifications, client enquiries, and store settings.

Best Regards,
The Print Planet Automated Backup
"""
            html_body = f"""
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#263445;line-height:1.6">
  <h2 style="color:#17365D;margin:0 0 8px">Database backup</h2>
  <p style="margin:0 0 16px;color:#687586">The Print Planet automated backup for {now_str}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:8px 0;border-bottom:1px solid #E2E8F0">Products</td><td style="text-align:right">{Product.objects.count()}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #E2E8F0">Categories</td><td style="text-align:right">{Category.objects.count()}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #E2E8F0">Enquiries</td><td style="text-align:right">{Enquiry.objects.count()}</td></tr>
    <tr><td style="padding:8px 0">Attachment</td><td style="text-align:right">{filename}</td></tr>
  </table>
  <p style="margin:20px 0 0;color:#687586;font-size:12px">Open the attached workbook in Excel, Numbers, or Google Sheets.</p>
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
            if not sent:
                return Response(
                    {'error': 'No HTTPS email provider could deliver the backup. Configure BREVO_API_KEY or RESEND_API_KEY and retry.'},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            return Response({
                'message': f'Database backup successfully sent to {recipient}',
                'recipient': recipient,
                'filename': filename,
                'file_size_kb': round(len(excel_bytes) / 1024, 1)
            }, status=status.HTTP_200_OK)
        except Exception as e:  # excel build + email provider can fail many ways; owner gets the message
            logger.exception('Database backup email failed')
            return Response({'error': f'Failed to email backup: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OwnerDatabaseBackupDownloadView(APIView):
    """Owner endpoint to download full database Excel backup directly in browser."""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        try:
            excel_bytes = generate_full_database_excel_bytes()
            now_str = datetime.now().strftime('%Y-%m-%d_%H-%M')
            filename = f"The_Print_Planet_DB_Backup_{now_str}.xlsx"
            response = HttpResponse(
                excel_bytes,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            logger.exception('Database backup download failed')
            return Response({'error': f'Failed to generate backup: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
