import os
import json
import logging
import threading
import urllib.request
import urllib.parse
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
        s_address = "Bengaluru, Karnataka, India"

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
    apikey = os.environ.get('CALLMEBOT_API_KEY', '').strip()
    phone = os.environ.get('OWNER_WHATSAPP_PHONE', '919741808034').strip().replace('+', '')
    if not apikey:
        return False
    try:
        encoded_text = urllib.parse.quote(text)
        url = f"https://api.callmebot.com/whatsapp.php?phone={phone}&text={encoded_text}&apikey={apikey}"
        req = urllib.request.Request(url, headers={'User-Agent': 'ThePrintPlanet/1.0'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            logger.info(f"Dispatched automated WhatsApp alert via CallMeBot: HTTP {resp.status}")
            return True
    except Exception as e:
        logger.warning(f"Could not dispatch automated WhatsApp via CallMeBot: {e}")
        return False


def _send_email_via_https(to_email, subject, text, html):
    """
    Dispatches email via HTTPS REST API (Port 443) to bypass Render Free Tier SMTP port blocking.
    Supports Resend, Brevo, or Web3Forms.
    """
    # 1. Resend API
    resend_key = os.environ.get('RESEND_API_KEY', '').strip()
    if resend_key:
        try:
            req = urllib.request.Request(
                'https://api.resend.com/emails',
                data=json.dumps({
                    'from': os.environ.get('RESEND_FROM_EMAIL', 'The Print Planet <onboarding@resend.dev>'),
                    'to': [to_email],
                    'subject': subject,
                    'text': text,
                    'html': html,
                }).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {resend_key}',
                    'Content-Type': 'application/json',
                    'User-Agent': 'ThePrintPlanet/1.0'
                }
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                logger.info(f"Dispatched email via Resend HTTPS API to {to_email}")
                return True
        except Exception as e:
            logger.warning(f"Resend HTTPS dispatch failed: {e}")

    # 2. Brevo (Sendinblue) API
    brevo_key = os.environ.get('BREVO_API_KEY', '').strip()
    if brevo_key:
        try:
            req = urllib.request.Request(
                'https://api.brevo.com/v3/smtp/email',
                data=json.dumps({
                    'sender': {'name': 'The Print Planet', 'email': 'theprintplanet01@gmail.com'},
                    'to': [{'email': to_email}],
                    'subject': subject,
                    'htmlContent': html,
                    'textContent': text,
                }).encode('utf-8'),
                headers={
                    'api-key': brevo_key,
                    'Content-Type': 'application/json',
                    'User-Agent': 'ThePrintPlanet/1.0'
                }
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                logger.info(f"Dispatched email via Brevo HTTPS API to {to_email}")
                return True
        except Exception as e:
            logger.warning(f"Brevo HTTPS dispatch failed: {e}")

    # 3. Web3Forms API
    web3_key = os.environ.get('WEB3FORMS_ACCESS_KEY', '').strip()
    if web3_key:
        try:
            req = urllib.request.Request(
                'https://api.web3forms.com/submit',
                data=json.dumps({
                    'access_key': web3_key,
                    'subject': subject,
                    'email': to_email,
                    'message': text,
                }).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'ThePrintPlanet/1.0'
                }
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                logger.info(f"Dispatched email via Web3Forms HTTPS API to {to_email}")
                return True
        except Exception as e:
            logger.warning(f"Web3Forms HTTPS dispatch failed: {e}")

    return False


def _send_enquiry_emails_worker(payload):
    """
    Worker executed in a non-blocking background thread.
    Uses purely in-memory data with zero DB queries, preventing SQLite concurrency locks.
    Dispatches via HTTPS REST APIs (Port 443) and falls back to SMTP.
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
        requested_quantity = payload.get('requested_quantity', 1)
        source_page = payload.get('source_page', '/')
        message = payload.get('message', '')
        site_phone = payload.get('site_phone', '+91 97418 08034')
        site_email = payload.get('site_email', 'theprintplanet01@gmail.com')
        site_address = payload.get('site_address', 'Bengaluru, Karnataka, India')

        # 1. Email to Owner / Sales Desk
        owner_subject = f"🔔 [New RFQ Enquiry] {prod_name} from {full_name}"
        owner_text = f"""
A new customer RFQ enquiry has been submitted on The Print Planet:

Customer Details:
- Customer Name: {full_name}
- Company: {company_name}
- Email: {email}
- Phone: {phone}
- Product: {prod_name}
- Requested Quantity: {requested_quantity}
- Source Page: {source_page}

Customer Message:
{message}

---
View and manage this enquiry in the Owner Dashboard:
https://theprintplanet.co.in/owner/enquiries
"""
        owner_html = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px; color: #263445; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #dce3eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #102742; padding: 24px; text-align: center; border-bottom: 4px solid #e87832;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: -0.5px;">New RFQ Customer Enquiry</h2>
      <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 13px;">The Print Planet Wholesale Portal</p>
    </div>
    <div style="padding: 24px;">
      <h3 style="color: #17365d; margin-top: 0; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Order & Client Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 140px; color: #64748b;">Customer:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #1e293b;">{full_name}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Company:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">{company_name}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Email:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:{email}" style="color: #17365d; text-decoration: none; font-weight: bold;">{email}</a></td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Phone:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><a href="tel:{phone}" style="color: #17365d; text-decoration: none; font-weight: bold;">{phone}</a></td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Product:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #e87832; font-weight: bold;">{prod_name}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Quantity:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">{requested_quantity} units</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Page Origin:</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">{source_page}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 14px 16px; background: #f8fafc; border-left: 4px solid #17365d; border-radius: 6px;">
        <strong style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Customer Message:</strong>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #334155; white-space: pre-wrap;">{message}</p>
      </div>
      <div style="margin-top: 24px; text-align: center;">
        <a href="https://theprintplanet.co.in/owner/enquiries" style="background-color: #e87832; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">Manage in Owner Portal</a>
      </div>
    </div>
  </div>
</body>
</html>
"""
        # Try HTTPS REST dispatch first (bypasses Render SMTP port blocking)
        dispatched_https = _send_email_via_https(owner_recipient, owner_subject, owner_text, owner_html)

        # Fallback to SMTP
        if not dispatched_https:
            try:
                msg_owner = EmailMultiAlternatives(owner_subject, owner_text, from_email, [owner_recipient])
                msg_owner.attach_alternative(owner_html, "text/html")
                msg_owner.send(fail_silently=False)
                logger.info(f"Dispatched owner notification email via SMTP for enquiry #{enquiry_id} to {owner_recipient}")
            except Exception as e_smtp:
                logger.warning(f"SMTP dispatch to owner failed: {e_smtp}")

        # 2. Confirmation Email to Customer
        if email and '@' in email:
            cust_subject = f"Enquiry Received: {prod_name} - The Print Planet"
            cust_text = f"""
Dear {full_name},

Thank you for contacting The Print Planet. We have received your wholesale RFQ enquiry regarding:
Product: {prod_name}
Quantity: {requested_quantity} units

Our technical sales and wholesale pricing desk is reviewing your requirement. An official quotation with bulk slab discounts and dispatch timelines will be shared with you shortly.

Best Regards,
The Print Planet Commercial Sales Team
Phone: {site_phone}
Email: {site_email}
Bengaluru, Karnataka, India
"""
            cust_html = f"""
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px; color: #263445; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #dce3eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #102742; padding: 24px; text-align: center; border-bottom: 4px solid #e87832;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px;">The Print Planet</h2>
      <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 13px;">Wholesale ID Supplies & Commercial Printing Solutions</p>
    </div>
    <div style="padding: 24px; font-size: 14px; line-height: 1.6;">
      <p style="margin-top: 0;">Dear <strong>{full_name}</strong>,</p>
      <p>Thank you for submitting your Request for Quotation (RFQ). We have successfully registered your inquiry regarding:</p>
      <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 14px 18px; margin: 18px 0;">
        <p style="margin: 0; color: #e87832; font-weight: bold; font-size: 15px;">{prod_name}</p>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Requested Quantity: <strong style="color: #1e293b;">{requested_quantity} units</strong></p>
      </div>
      <p>Our commercial sales engineers are calculating trade pricing, GST invoices, and dispatch logistics for your order. We will reach out via WhatsApp / Email with an official quote within 2 to 4 business hours.</p>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        <strong>The Print Planet</strong><br />
        Support: {site_phone} | {site_email}<br />
        {site_address}
      </div>
    </div>
  </div>
</body>
</html>
"""
            dispatched_cust_https = _send_email_via_https(email, cust_subject, cust_text, cust_html)
            if not dispatched_cust_https:
                try:
                    msg_cust = EmailMultiAlternatives(cust_subject, cust_text, from_email, [email])
                    msg_cust.attach_alternative(cust_html, "text/html")
                    msg_cust.send(fail_silently=False)
                    logger.info(f"Dispatched customer confirmation email via SMTP to {email}")
                except Exception as e_cust_smtp:
                    logger.warning(f"SMTP dispatch to customer failed: {e_cust_smtp}")

        # 3. Automated WhatsApp Dispatch via CallMeBot (if enabled)
        wa_text = f"🔔 *New RFQ Enquiry - The Print Planet*\nCustomer: {full_name}\nPhone: {phone}\nEmail: {email}\nProduct: {prod_name}\nQty: {requested_quantity}\nMsg: {message}"
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
