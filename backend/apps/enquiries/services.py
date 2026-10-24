import os
import json
import base64
import logging
import threading
import urllib.request
import urllib.parse
import socket
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)


def build_enquiry_payload(enquiry_or_id):
    """Safely extracts all email fields while still in the main request/database context."""
    if isinstance(enquiry_or_id, dict):
        return enquiry_or_id

    from .models import Enquiry
    from apps.settings_app.models import SiteSettings

    if hasattr(enquiry_or_id, 'id'):
        enquiry = enquiry_or_id
    else:
        try:
            enquiry = Enquiry.objects.select_related('product').get(id=enquiry_or_id)
        except Exception as e:
            logger.error(f"Enquiry with id {enquiry_or_id} not found: {e}")
            return None

    prod_name = enquiry.product_name_text or (enquiry.product.name if enquiry.product else 'Industrial Wholesale Product')

    try:
        site_settings = SiteSettings.get_settings()
        b_name = site_settings.business_name
        s_phone = site_settings.phone
        s_email = site_settings.email
        s_address = site_settings.address
    except Exception:
        b_name = "The Print Planet"
        s_phone = "+91 97418 08034"
        s_email = "theprintplanet01@gmail.com"
        s_address = "No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091"

    attachment_url = getattr(enquiry, 'attachment_url', '') or ''
    attachment_path = ''
    attachment_name = ''
    if getattr(enquiry, 'attachment', None):
        try:
            attachment_file = enquiry.attachment
            if attachment_file and hasattr(attachment_file, 'name') and attachment_file.name:
                attachment_name = os.path.basename(attachment_file.name)
                if hasattr(attachment_file, 'path') and os.path.exists(attachment_file.path):
                    attachment_path = attachment_file.path
                if not attachment_url and hasattr(attachment_file, 'url'):
                    attachment_url = attachment_file.url
        except Exception as att_err:
            logger.warning(f"Could not resolve attachment metadata: {att_err}")

    # Ensure absolute URL for attachment if relative
    if attachment_url and attachment_url.startswith('/'):
        attachment_url = f"https://theprintplanet.co.in{attachment_url}"

    return {
        'id': enquiry.id,
        'full_name': enquiry.full_name,
        'company_name': enquiry.company_name or 'Individual',
        'email': enquiry.email,
        'phone': enquiry.phone,
        'product_name': prod_name,
        'requested_quantity': enquiry.requested_quantity,
        'source_page': enquiry.source_page or '/',
        'message': enquiry.message,
        'attachment_url': attachment_url,
        'attachment_path': attachment_path,
        'attachment_name': attachment_name,
        'business_name': b_name,
        'site_phone': s_phone,
        'site_email': s_email,
        'site_address': s_address,
    }


def _send_whatsapp_callmebot(text):
    """
    Dispatches automated WhatsApp message to owner phone via CallMeBot.
    Phone: +919741808034
    """
    if getattr(settings, 'TESTING', False):
        return True

    apikey = os.environ.get('CALLMEBOT_API_KEY', '').strip()
    phone = os.environ.get('OWNER_WHATSAPP_PHONE', '919741808034').strip().replace('+', '')
    if not apikey:
        return False
    try:
        encoded_text = urllib.parse.quote(text)
        url = f"https://api.callmebot.com/whatsapp.php?phone={phone}&text={encoded_text}&apikey={apikey}"
        req = urllib.request.Request(url, headers={'User-Agent': 'ThePrintPlanet/1.0'})
        with urllib.request.urlopen(req, timeout=6) as resp:
            logger.info(f"Dispatched automated WhatsApp alert via CallMeBot: HTTP {resp.status}")
            return True
    except Exception as e:
        logger.warning(f"Could not dispatch automated WhatsApp via CallMeBot: {e}")
        return False


def _send_email_via_https(to_email, subject, text, html, attachment_path='', attachment_name=''):
    """
    Dispatches email via HTTPS REST API (Port 443) to bypass Render Free Tier SMTP port blocking.
    Supports Resend, Brevo, FormSubmit, Web3Forms, or generic Webhooks.
    Includes base64 encoded attachments where supported.
    """
    if getattr(settings, 'TESTING', False):
        return True

    ssl_context = None
    try:
        import ssl
        import certifi
        ssl_context = ssl.create_default_context(cafile=certifi.where())
    except Exception:
        ssl_context = None

    # Prepare base64 attachment if available and <= 5MB
    b64_content = None
    if attachment_path and os.path.exists(attachment_path):
        try:
            if os.path.getsize(attachment_path) <= 5 * 1024 * 1024:
                with open(attachment_path, 'rb') as af:
                    b64_content = base64.b64encode(af.read()).decode('utf-8')
        except Exception as e_b64:
            logger.warning(f"Could not base64 encode attachment {attachment_path}: {e_b64}")

    # 1. Brevo (Sendinblue) Primary API (HTTPS Port 443 — Priority Transactional Provider)
    brevo_key = os.environ.get('BREVO_API_KEY', getattr(settings, 'BREVO_API_KEY', '')).strip().strip('"\'')
    if brevo_key.startswith('BREVO_API_KEY='):
        brevo_key = brevo_key.split('BREVO_API_KEY=', 1)[1].strip().strip('"\'')

    if brevo_key:
        try:
            sender_email = (
                os.environ.get('BREVO_SENDER_EMAIL', '') or
                getattr(settings, 'BREVO_SENDER_EMAIL', '') or
                'theprintplanet01@gmail.com'
            ).strip().strip('"\'')
            sender_name = os.environ.get('BREVO_SENDER_NAME', 'The Print Planet').strip()

            brevo_headers = {
                'api-key': brevo_key,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'ThePrintPlanet/1.0',
            }

            brevo_body = {
                'sender': {'name': sender_name, 'email': sender_email},
                'to': [{'email': to_email}],
                'subject': subject,
                'htmlContent': html,
                'textContent': text,
            }
            if b64_content and attachment_name:
                brevo_body['attachment'] = [{
                    'name': attachment_name,
                    'content': b64_content,
                }]

            req = urllib.request.Request(
                'https://api.brevo.com/v3/smtp/email',
                data=json.dumps(brevo_body).encode('utf-8'),
                headers=brevo_headers,
                method='POST'
            )
            with urllib.request.urlopen(req, context=ssl_context, timeout=10) as resp:
                logger.info(f"Dispatched email via Brevo HTTPS API to {to_email} (HTTP {resp.status})")
                return True
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8', errors='ignore')
            logger.error(f"Brevo HTTPS dispatch HTTP {e.code}: {err_msg}")
            # If rejected due to attachment size or format, retry once without attachment
            if b64_content:
                try:
                    logger.info("Retrying Brevo dispatch without attachment...")
                    brevo_body_no_att = {
                        'sender': {'name': sender_name, 'email': sender_email},
                        'to': [{'email': to_email}],
                        'subject': subject,
                        'htmlContent': html,
                        'textContent': text,
                    }
                    req_retry = urllib.request.Request(
                        'https://api.brevo.com/v3/smtp/email',
                        data=json.dumps(brevo_body_no_att).encode('utf-8'),
                        headers=brevo_headers,
                        method='POST'
                    )
                    with urllib.request.urlopen(req_retry, context=ssl_context, timeout=10) as retry_resp:
                        logger.info(f"Dispatched email via Brevo HTTPS API (without attachment) to {to_email}")
                        return True
                except Exception as retry_err:
                    logger.warning(f"Brevo retry without attachment also failed: {retry_err}")
        except Exception as e:
            logger.warning(f"Brevo HTTPS dispatch failed: {e}")

    # 2. Resend API (HTTPS Port 443 — Secondary Fallback)
    resend_key = os.environ.get('RESEND_API_KEY', getattr(settings, 'RESEND_API_KEY', '')).strip().strip('"\'')
    if resend_key.startswith('RESEND_API_KEY='):
        resend_key = resend_key.split('RESEND_API_KEY=', 1)[1].strip().strip('"\'')

    if resend_key:
        try:
            resend_body = {
                'from': os.environ.get('RESEND_FROM_EMAIL', 'The Print Planet <onboarding@resend.dev>'),
                'to': [to_email],
                'subject': subject,
                'text': text,
                'html': html,
            }
            if b64_content and attachment_name:
                resend_body['attachments'] = [{
                    'filename': attachment_name,
                    'content': b64_content,
                }]

            req = urllib.request.Request(
                'https://api.resend.com/emails',
                data=json.dumps(resend_body).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {resend_key}',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'ThePrintPlanet/1.0'
                },
                method='POST'
            )
            with urllib.request.urlopen(req, context=ssl_context, timeout=8) as resp:
                logger.info(f"Dispatched email via Resend HTTPS API to {to_email}")
                return True
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8', errors='ignore')
            logger.error(f"Resend HTTPS dispatch HTTP {e.code}: {err_msg}")
        except Exception as e:
            logger.warning(f"Resend HTTPS dispatch failed: {e}")

    # 3. Custom Webhook Relay (e.g. Google Apps Script Webhook or Pipedream over HTTPS)
    webhook_url = os.environ.get('EMAIL_WEBHOOK_URL', getattr(settings, 'EMAIL_WEBHOOK_URL', '')).strip()
    if webhook_url:
        try:
            req = urllib.request.Request(
                webhook_url,
                data=json.dumps({
                    'to': to_email,
                    'subject': subject,
                    'text': text,
                    'html': html,
                }).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'ThePrintPlanet/1.0'
                }
            )
            with urllib.request.urlopen(req, context=ssl_context, timeout=8) as resp:
                logger.info(f"Dispatched email via Webhook to {to_email}")
                return True
        except Exception as e:
            logger.warning(f"Email Webhook dispatch failed: {e}")

    # 4. FormSubmit HTTPS Relay (Auto-fallback to theprintplanet01@gmail.com)
    if 'theprintplanet' in to_email.lower():
        try:
            clean_subject = subject.replace('\n', ' ').strip()
            req = urllib.request.Request(
                'https://formsubmit.co/ajax/theprintplanet01@gmail.com',
                data=json.dumps({
                    'name': 'The Print Planet Wholesale RFQ',
                    'email': 'theprintplanet01@gmail.com',
                    '_subject': clean_subject,
                    'message': text,
                    '_template': 'table',
                }).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Referer': 'https://theprintplanet.co.in',
                    'Origin': 'https://theprintplanet.co.in',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ThePrintPlanet/1.0'
                }
            )
            with urllib.request.urlopen(req, context=ssl_context, timeout=8) as resp:
                resp_data = resp.read().decode('utf-8', errors='ignore')
                logger.info(f"FormSubmit HTTPS relay response: {resp_data}")
                if '"success":"true"' in resp_data:
                    return True
        except Exception as e:
            logger.warning(f"FormSubmit relay failed: {e}")

    return False


def _send_enquiry_emails_worker(payload):
    """
    Worker executed in a non-blocking background thread.
    Uses purely in-memory data with zero DB queries, preventing SQLite concurrency locks.
    Dispatches via HTTPS REST APIs (Port 443) and falls back to fast SMTP with strict 5s timeout.
    Layout is styled with spacious 680px container, large typography, and 1-click action buttons.
    """
    if not payload:
        return

    enquiry_id = payload.get('id', 'N/A')
    try:
        owner_recipient = getattr(settings, 'OWNER_NOTIFICATION_EMAIL', '') or 'theprintplanet01@gmail.com'
        business_name = payload.get('business_name', 'The Print Planet')
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '') or f"{business_name} <{owner_recipient}>"
        prod_name = payload.get('product_name', 'Industrial Wholesale Product')
        full_name = payload.get('full_name', 'Customer')
        company_name = payload.get('company_name', 'Individual')
        email = payload.get('email', '')
        phone = payload.get('phone', '')
        requested_quantity = payload.get('requested_quantity') or 'Bulk Requirement'
        source_page = payload.get('source_page', '/')
        message = payload.get('message', 'Please provide bulk quotation and dispatch timelines.')
        attachment_url = payload.get('attachment_url', '')
        attachment_path = payload.get('attachment_path', '')
        attachment_name = payload.get('attachment_name', '')
        site_phone = payload.get('site_phone', '+91 97418 08034')
        site_email = payload.get('site_email', 'theprintplanet01@gmail.com')
        site_address = payload.get('site_address', 'No. 33, 34, Srigandhadakaval, Byraveshwaranagar, Near Hanumanthnagar, Sunkadakatte, Bangalore - 560091')

        # Clean phone for WhatsApp international link
        clean_phone = ''.join(c for c in phone if c.isdigit())
        if clean_phone.startswith('0'):
            clean_phone = clean_phone[1:]
        if len(clean_phone) == 10:
            clean_phone = '91' + clean_phone

        wa_lead_text = urllib.parse.quote(
            f"Hello {full_name}, thank you for contacting The Print Planet regarding your inquiry for {prod_name} ({requested_quantity} units). How can we assist you today?"
        )

        attachment_section_html = ""
        if attachment_url:
            attachment_section_html = f"""
            <div style="margin: 22px 0; padding: 18px 20px; background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 10px;">
              <div style="font-weight: 800; color: #92400e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                📎 Customer File Attachment Included
              </div>
              <div style="font-size: 13px; color: #78350f; margin-bottom: 12px;">
                File: <strong>{attachment_name or 'Uploaded Customer Document'}</strong>
              </div>
              <a href="{attachment_url}" target="_blank" style="background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">
                ⬇️ Download / Inspect Attached File
              </a>
            </div>
            """

        # =========================================================================
        # 1. Executive HTML Email to Owner / Technical Sales Desk (Spacious 680px)
        # =========================================================================
        owner_subject = f"🔔 [NEW RFQ LEAD #{enquiry_id}] {prod_name} ({requested_quantity} qty) - {full_name}"
        owner_text = f"""
===============================================================================
🔔 PRIORITY RFQ LEAD #{enquiry_id} - THE PRINT PLANET WHOLESALE PORTAL
===============================================================================

CLIENT & INQUIRY OVERVIEW:
-------------------------------------------------------------------------------
• Customer Name : {full_name}
• Company Name  : {company_name}
• Phone Number  : {phone}
• Email Address : {email}
• Product       : {prod_name}
• Quantity      : {requested_quantity} units
• Source Page   : {source_page}
{f'• Attachment   : {attachment_url}' if attachment_url else ''}

CUSTOMER MESSAGE & SPECIFICATIONS:
-------------------------------------------------------------------------------
{message}

INSTANT QUICK ACTIONS:
-------------------------------------------------------------------------------
• WhatsApp Customer : https://wa.me/{clean_phone}?text={wa_lead_text}
• Call Customer     : tel:{phone}
• Owner Portal      : https://theprintplanet.co.in/owner/enquiries
===============================================================================
"""

        owner_html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 25px 10px; color: #1e293b; margin: 0;">
  <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);">
    
    <!-- Header -->
    <div style="background-color: #0d1f36; padding: 30px 28px; text-align: left; border-bottom: 5px solid #e87832;">
      <div style="display: inline-block; background-color: #e87832; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 5px 12px; border-radius: 4px; margin-bottom: 12px;">
        🚨 Priority RFQ Lead #{enquiry_id}
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.25;">
        {prod_name}
      </h1>
      <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">
        Direct Wholesale Quotation Request from <strong>{full_name}</strong>
      </p>
    </div>

    <div style="padding: 32px 28px;">
      
      <!-- Primary 1-Click Action Bar -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 26px; text-align: center;">
        <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
          ⚡ Rapid Response Quick Actions
        </div>
        <div>
          <a href="https://wa.me/{clean_phone}?text={wa_lead_text}" target="_blank" style="background-color: #25d366; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 800; font-size: 13px; display: inline-block; margin: 4px 6px;">
            💬 Reply on WhatsApp
          </a>
          <a href="tel:{phone}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 800; font-size: 13px; display: inline-block; margin: 4px 6px;">
            📞 Call Customer Now
          </a>
          <a href="https://theprintplanet.co.in/owner/enquiries" style="background-color: #0d1f36; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 800; font-size: 13px; display: inline-block; margin: 4px 6px;">
            ⚙️ Open in Owner Portal
          </a>
        </div>
      </div>

      <!-- Customer Details Table -->
      <h2 style="color: #0d1f36; margin: 0 0 14px 0; font-size: 16px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
        Order &amp; Client Overview
      </h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #64748b; width: 150px;">Customer Name:</td>
          <td style="padding: 10px 0; font-weight: 800; color: #0f172a; font-size: 15px;">{full_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Company / Studio:</td>
          <td style="padding: 10px 0; font-weight: 600; color: #334155;">{company_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Contact Phone:</td>
          <td style="padding: 10px 0;"><a href="tel:{phone}" style="color: #0284c7; text-decoration: none; font-weight: 800; font-size: 15px;">{phone}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Email Address:</td>
          <td style="padding: 10px 0;"><a href="mailto:{email}" style="color: #0d1f36; text-decoration: none; font-weight: 700;">{email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Requested Item:</td>
          <td style="padding: 10px 0; color: #e87832; font-weight: 800; font-size: 15px;">{prod_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Requested Quantity:</td>
          <td style="padding: 10px 0; font-weight: 800; color: #0d1f36;">
            <span style="background-color: #e2e8f0; padding: 3px 10px; border-radius: 6px;">{requested_quantity} units</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Page Origin:</td>
          <td style="padding: 10px 0; color: #64748b; font-family: monospace; font-size: 12px;">{source_page}</td>
        </tr>
      </table>

      <!-- Optional Attachment Section -->
      {attachment_section_html}

      <!-- Customer Message Block -->
      <div style="background-color: #f8fafc; border-left: 5px solid #0d1f36; border-radius: 8px; padding: 18px 20px; margin-top: 20px;">
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          Customer Inquiry &amp; Specifications:
        </div>
        <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">{message}</p>
      </div>

      <!-- Footer Info -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        The Print Planet Automated Commercial Sales Dispatcher • Sunkadakatte, Bengaluru 560091
      </div>
    </div>
  </div>
</body>
</html>
"""

        # Try HTTPS REST dispatch first (bypasses Render SMTP port blocking)
        dispatched_https = _send_email_via_https(
            owner_recipient,
            owner_subject,
            owner_text,
            owner_html,
            attachment_path=attachment_path,
            attachment_name=attachment_name
        )

        # Fallback to SMTP with strict 5-second socket timeout (never hangs worker)
        if not dispatched_https:
            try:
                socket.setdefaulttimeout(5)
                msg_owner = EmailMultiAlternatives(owner_subject, owner_text, from_email, [owner_recipient])
                msg_owner.attach_alternative(owner_html, "text/html")
                if attachment_path and os.path.exists(attachment_path):
                    try:
                        msg_owner.attach_file(attachment_path)
                    except Exception as att_attach_err:
                        logger.warning(f"Could not attach file to SMTP email: {att_attach_err}")
                msg_owner.send(fail_silently=False)
                logger.info(f"Dispatched owner notification email via SMTP for enquiry #{enquiry_id} to {owner_recipient}")
            except Exception as e_smtp:
                logger.warning(f"SMTP dispatch to owner failed (expected on Render without HTTPS key): {e_smtp}")

        # =========================================================================
        # 2. Executive Confirmation Receipt to Customer (Spacious 680px)
        # =========================================================================
        if email and '@' in email:
            cust_subject = f"Wholesale Quotation Request Registered: {prod_name} - The Print Planet"
            cust_text = f"""
Dear {full_name},

Thank you for contacting The Print Planet. We have successfully registered your Request for Quotation (RFQ Ref #{enquiry_id}):

Requirement Summary:
- Item             : {prod_name}
- Requested Volume : {requested_quantity} units
- Official Tax     : 100% GST Tax Invoices Provided for Input Tax Credit (ITC)

Our technical commercial engineers at our Sunkadakatte, Bengaluru facility are currently reviewing your requirement and calculating trade discount slabs.

An official commercial quotation with delivery timelines will be provided to you within 2 to 4 business hours via WhatsApp / Phone.

Best Regards,
Commercial Sales Desk | The Print Planet
Direct Phone : {site_phone}
Official Email: {site_email}
Facility     : {site_address}
GSTIN        : 29AAQFT3909B1ZZ
"""

            cust_html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 25px 10px; color: #1e293b; margin: 0;">
  <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);">
    
    <!-- Header -->
    <div style="background-color: #0d1f36; padding: 28px; text-align: center; border-bottom: 5px solid #e87832;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">The Print Planet™</h1>
      <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
        Wholesale ID Card Consumables, Lanyard Rolls &amp; Fabrication Machinery
      </p>
    </div>

    <div style="padding: 32px 28px; font-size: 14px; line-height: 1.65; color: #334155;">
      
      <p style="margin-top: 0; font-size: 16px;">
        Dear <strong>{full_name}</strong>,
      </p>
      
      <p>
        Thank you for submitting your Request for Quotation (RFQ). We have registered your wholesale requirement in our system under Reference <strong>#{enquiry_id}</strong>.
      </p>

      <!-- Order Summary Card -->
      <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 20px; margin: 22px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          Registered Product Inquiry
        </div>
        <div style="color: #e87832; font-weight: 800; font-size: 18px; margin-bottom: 4px;">
          {prod_name}
        </div>
        <div style="font-size: 14px; color: #475569;">
          Requested Volume: <strong style="color: #0f172a;">{requested_quantity} units</strong>
        </div>
        <div style="margin-top: 10px; font-size: 12px; color: #16a34a; font-weight: 700;">
          ✓ 100% Tax Compliant GST Invoices with Input Tax Credit (ITC)
        </div>
      </div>

      <p>
        Our commercial engineering team is calculating current factory bulk slabs and dispatch logistics. An official trade quotation will be shared with you via WhatsApp or Email within <strong>2 to 4 business hours</strong>.
      </p>

      <!-- Contact Banner -->
      <div style="margin-top: 28px; padding: 20px; background-color: #f1f5f9; border-radius: 10px; font-size: 13px; color: #475569;">
        <div style="font-weight: 800; color: #0d1f36; font-size: 14px; margin-bottom: 6px;">
          The Print Planet Commercial Sales Desk
        </div>
        <div>📞 Phone / WhatsApp: <strong>{site_phone}</strong></div>
        <div>✉️ Email: <strong>{site_email}</strong></div>
        <div>🏭 Facility: {site_address}</div>
        <div style="margin-top: 4px; font-size: 11px; color: #64748b;">GSTIN: 29AAQFT3909B1ZZ</div>
      </div>

    </div>
  </div>
</body>
</html>
"""

            dispatched_cust_https = _send_email_via_https(email, cust_subject, cust_text, cust_html)
            if not dispatched_cust_https:
                try:
                    socket.setdefaulttimeout(5)
                    msg_cust = EmailMultiAlternatives(cust_subject, cust_text, from_email, [email])
                    msg_cust.attach_alternative(cust_html, "text/html")
                    msg_cust.send(fail_silently=False)
                    logger.info(f"Dispatched customer confirmation email via SMTP to {email}")
                except Exception as e_cust_smtp:
                    logger.warning(f"SMTP dispatch to customer failed: {e_cust_smtp}")

        # 3. Automated WhatsApp Dispatch via CallMeBot (if enabled)
        wa_text = f"🔔 *New RFQ Enquiry #{enquiry_id} - The Print Planet*\nCustomer: {full_name}\nPhone: {phone}\nEmail: {email}\nProduct: {prod_name}\nQty: {requested_quantity}\nMsg: {message}"
        if attachment_url:
            wa_text += f"\nAttachment: {attachment_url}"
        _send_whatsapp_callmebot(wa_text)

    except Exception as e:
        logger.exception(f"Could not complete enquiry notification worker for enquiry #{enquiry_id}: {e}")


def trigger_enquiry_notifications(enquiry_or_id):
    """
    Extracts data safely in the caller's thread (avoiding SQLite concurrency lock),
    then dispatches emails and WhatsApp in a non-blocking background thread.
    """
    payload = build_enquiry_payload(enquiry_or_id)
    if payload:
        thread = threading.Thread(target=_send_enquiry_emails_worker, args=(payload,), daemon=True)
        thread.start()
