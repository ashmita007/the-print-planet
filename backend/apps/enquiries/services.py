import os
import json
import base64
import logging
import html
import threading

from .email_templates import customer_enquiry_email, owner_enquiry_email
import urllib.request
import urllib.parse
import socket
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)



def _email_thumb(url, size=400):
    """Square JPEG thumbnail that every mail client can show (Cloudinary transform when possible)."""
    if not url:
        return ''
    if url.startswith('/'):
        url = f"https://theprintplanet.co.in{url}"
    if 'res.cloudinary.com' in url and '/image/upload/' in url:
        return url.replace('/image/upload/', f'/image/upload/f_jpg,q_auto,w_{size},h_{size},c_pad,b_white/', 1)
    return url


def _primary_image_url(product):
    images = list(product.images.all())
    primary = next((img for img in images if img.is_primary), None) or (images[0] if images else None)
    return primary.secure_url if primary else ''


def _product_email_extras(product):
    """Photo, link, price and a few related products for the enquiry emails."""
    if not product:
        return {}
    site = 'https://theprintplanet.co.in'
    extras = {
        'product_url': f"{site}/products/{product.slug}",
        'product_image': _email_thumb(_primary_image_url(product)),
        'product_sku': product.sku or '',
        'product_category': product.category.name if product.category_id else '',
        'product_price': (product.price_display or (f"\u20b9{product.price:,.0f}" if product.price else ''))
                         if product.price_visibility else '',
        'product_moq': product.minimum_order_quantity or '',
        'related_products': [],
    }
    try:
        from apps.catalog.models import Product
        related = (Product.objects.filter(category_id=product.category_id, is_active=True)
                   .exclude(id=product.id).prefetch_related('images').order_by('-is_featured', 'display_order')[:3])
        extras['related_products'] = [
            {'name': r.name, 'url': f"{site}/products/{r.slug}", 'image': _email_thumb(_primary_image_url(r), 240)}
            for r in related
        ]
    except Exception as rel_err:
        logger.warning(f"Could not load related products for email: {rel_err}")
    return extras


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
        'lead_source': enquiry.lead_source or 'direct',
        'landing_page': enquiry.landing_page or '',
        'message': enquiry.message,
        'attachment_url': attachment_url,
        'attachment_path': attachment_path,
        'attachment_name': attachment_name,
        'business_name': b_name,
        'site_phone': s_phone,
        'site_email': s_email,
        'site_address': s_address,
        **(_product_email_extras(enquiry.product) if enquiry.product_id else {}),
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


def _send_email_via_https(to_email, subject, text, html, attachment_path='', attachment_name='', attachment_bytes=None):
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
    if attachment_bytes:
        try:
            if len(attachment_bytes) <= 5 * 1024 * 1024:
                b64_content = base64.b64encode(attachment_bytes).decode('utf-8')
            else:
                logger.warning("Attachment exceeds 5MB HTTPS provider limit; sending without it.")
        except Exception as e_b64:
            logger.warning(f"Could not base64 encode in-memory attachment: {e_b64}")
    elif attachment_path and os.path.exists(attachment_path):
        try:
            if os.path.getsize(attachment_path) <= 5 * 1024 * 1024:
                with open(attachment_path, 'rb') as af:
                    b64_content = base64.b64encode(af.read()).decode('utf-8')
        except Exception as e_b64:
            logger.warning(f"Could not base64 encode attachment {attachment_path}: {e_b64}")

    provider_pref = (
        os.environ.get('EMAIL_PROVIDER', '') or
        getattr(settings, 'EMAIL_PROVIDER', '')
    ).strip().lower()
    owner_email = (
        os.environ.get('OWNER_NOTIFICATION_EMAIL', '') or
        getattr(settings, 'OWNER_NOTIFICATION_EMAIL', '')
    ).strip().strip('"\'')

    # 1. Brevo (Sendinblue) API (HTTPS Port 443)
    brevo_key = os.environ.get('BREVO_API_KEY', getattr(settings, 'BREVO_API_KEY', '')).strip().strip('"\'')
    if brevo_key.startswith('BREVO_API_KEY='):
        brevo_key = brevo_key.split('BREVO_API_KEY=', 1)[1].strip().strip('"\'')

    if brevo_key and provider_pref != 'resend':
        try:
            sender_email = (
                os.environ.get('BREVO_SENDER_EMAIL', '') or
                getattr(settings, 'BREVO_SENDER_EMAIL', '') or
                'theprintplanet01@gmail.com'
            ).strip().strip('"\'')
            sender_name = os.environ.get('BREVO_SENDER_NAME', 'The Print Planet').strip()
            reply_to_email = (
                os.environ.get('BREVO_REPLY_TO_EMAIL', '') or
                getattr(settings, 'OWNER_NOTIFICATION_EMAIL', '') or
                'theprintplanet01@gmail.com'
            ).strip().strip('"\'')

            brevo_headers = {
                'api-key': brevo_key,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'ThePrintPlanet/1.0',
            }

            brevo_body = {
                'sender': {'name': sender_name, 'email': sender_email},
                'to': [{'email': to_email}],
                'replyTo': {'name': 'The Print Planet', 'email': reply_to_email},
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
                        'replyTo': {'name': 'The Print Planet', 'email': reply_to_email},
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

    # 2. Resend API (HTTPS Port 443)
    resend_key = os.environ.get('RESEND_API_KEY', getattr(settings, 'RESEND_API_KEY', '')).strip().strip('"\'')
    if resend_key.startswith('RESEND_API_KEY='):
        resend_key = resend_key.split('RESEND_API_KEY=', 1)[1].strip().strip('"\'')
    resend_from = (
        os.environ.get('RESEND_FROM_EMAIL', '') or
        getattr(settings, 'RESEND_FROM_EMAIL', '') or
        'The Print Planet <onboarding@resend.dev>'
    ).strip().strip('"\'')

    def _resend_post(sender):
        body = {
            'from': sender,
            'to': [to_email],
            'subject': subject,
            'text': text,
            'html': html,
        }
        if owner_email:
            body['reply_to'] = owner_email
        if b64_content and attachment_name:
            body['attachments'] = [{
                'filename': attachment_name,
                'content': b64_content,
            }]
        req = urllib.request.Request(
            'https://api.resend.com/emails',
            data=json.dumps(body).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {resend_key}',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'ThePrintPlanet/1.0'
            },
            method='POST'
        )
        with urllib.request.urlopen(req, context=ssl_context, timeout=10) as resp:
            logger.info(f"Dispatched email via Resend HTTPS API to {to_email} (HTTP {resp.status})")
            return True

    if resend_key and provider_pref != 'brevo':
        try:
            return _resend_post(resend_from)
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8', errors='ignore')
            logger.error(f"Resend HTTPS dispatch HTTP {e.code}: {err_msg}")
            # Sandbox fallback: onboarding@resend.dev can deliver to the account owner
            # even before a custom sending domain is verified.
            if 'onboarding@resend.dev' not in resend_from and owner_email and to_email.lower() == owner_email.lower():
                try:
                    logger.info("Retrying owner email via Resend sandbox sender onboarding@resend.dev...")
                    return _resend_post('The Print Planet <onboarding@resend.dev>')
                except urllib.error.HTTPError as retry_err:
                    retry_msg = retry_err.read().decode('utf-8', errors='ignore')
                    logger.error(f"Resend sandbox retry HTTP {retry_err.code}: {retry_msg}")
                except Exception as retry_err:
                    logger.warning(f"Resend sandbox retry failed: {retry_err}")
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
        lead_source = payload.get('lead_source', 'direct')
        landing_page = payload.get('landing_page', '')
        message = payload.get('message', 'Please provide bulk quotation and dispatch timelines.')
        attachment_url = payload.get('attachment_url', '')
        attachment_path = payload.get('attachment_path', '')
        attachment_name = payload.get('attachment_name', '')
        site_phone = payload.get('site_phone', '+91 97418 08034')
        site_email = payload.get('site_email', 'theprintplanet01@gmail.com')
        product_extras = {k: payload.get(k) for k in (
            'product_url', 'product_image', 'product_sku', 'product_category',
            'product_price', 'product_moq', 'related_products') if payload.get(k)}
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


        # =========================================================================
        # 1. Executive HTML Email to Owner / Technical Sales Desk (Spacious 680px)
        # =========================================================================
        owner_subject = f"🔔 New enquiry #{enquiry_id}: {prod_name} ({requested_quantity} qty) from {full_name}"
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
• Came From     : {lead_source}{f' (landed on {landing_page})' if landing_page else ''}
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

        owner_html = owner_enquiry_email({
            'enquiry_id': enquiry_id, 'full_name': full_name, 'company_name': company_name,
            'phone': phone, 'email': email, 'prod_name': prod_name, 'requested_quantity': requested_quantity,
            'message': message, 'source_page': source_page, 'lead_source': lead_source,
            'landing_page': landing_page, 'attachment_url': attachment_url, 'attachment_name': attachment_name,
            'clean_phone': clean_phone, 'wa_lead_text': wa_lead_text,
            **product_extras,
        })

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
            cust_subject = f"We received your enquiry #{enquiry_id} - The Print Planet"
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

            cust_html = customer_enquiry_email({
                'enquiry_id': enquiry_id, 'full_name': full_name, 'prod_name': prod_name,
                'requested_quantity': requested_quantity, 'site_phone': site_phone,
                'site_email': site_email, 'site_address': site_address,
                'company_name': company_name, 'phone': phone, 'email': email, 'message': message,
                **product_extras,
            })

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
