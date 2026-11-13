"""
Responsive HTML emails for enquiries: the owner alert and the buyer confirmation.

Styled like an e-commerce order confirmation: a product photo card, clear actions and
related products. Built the way email clients need it: table layout, inline styles, a 600px
fluid container and a small <style> block whose media query stacks buttons on phones
(clients that ignore it still get a readable single column). Every value a buyer typed
goes through esc().
"""
import html
import urllib.parse

SITE = 'https://theprintplanet.co.in'
LOGO = f'{SITE}/icon.png'
INK = '#121418'
ORANGE = '#F26B1D'
ORANGE_SOFT = '#FFF4EC'
GREEN = '#1FAF55'
MUTED = '#6B7280'
LINE = '#E7EBF0'
BG = '#F1F3F6'
SHOP_WHATSAPP = '919741808034'
HOURS = 'Mon to Sat, 10 AM to 7 PM IST'
POPULAR = (
    ('PVC ID card sheets', '/categories/pvc-id-card-consumable'),
    ('Lanyard rolls', '/categories/indian-satin-digital-lanyard-roll'),
    ('ID card holders', '/categories/id-card-holder'),
    ('RFID cards', '/categories/rfid-consumables'),
    ('Machines', '/categories/machines'),
    ('Sample kit', '/categories/sample-kit'),
)


def esc(value) -> str:
    return html.escape(str(value if value is not None else ''), quote=True)


def _received_ist() -> str:
    try:
        from zoneinfo import ZoneInfo
        from django.utils import timezone
        return timezone.now().astimezone(ZoneInfo('Asia/Kolkata')).strftime('%d %b %Y, %I:%M %p')
    except Exception:
        return ''


def _qty_label(qty) -> str:
    return f'{qty} units' if str(qty).strip().isdigit() else str(qty or 'Bulk quantity')


def _tel(phone: str) -> str:
    """tel: links must not contain spaces or some phones will not dial them."""
    return ''.join(c for c in str(phone or '') if c.isdigit() or c == '+')


def _wa_number(phone: str) -> str:
    digits = ''.join(c for c in str(phone or '') if c.isdigit())
    if digits.startswith('0'):
        digits = digits[1:]
    if len(digits) == 10:
        digits = '91' + digits
    return digits


def _safe_url(url: str) -> str:
    """Only http(s) links from our own data end up in href/src."""
    url = str(url or '')
    return url if url.startswith(('https://', 'http://')) else ''


# ----------------------------------------------------------------------------- building blocks

def _shell(title: str, preheader: str, body_rows: str, footer: str) -> str:
    return f'''<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{esc(title)}</title>
<style>
  body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
  table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
  img {{ border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }}
  a {{ text-decoration: none; }}
  @media only screen and (max-width: 600px) {{
    .container {{ width: 100% !important; border-radius: 0 !important; }}
    .outer {{ padding: 0 !important; }}
    .px {{ padding-left: 18px !important; padding-right: 18px !important; }}
    .stack {{ display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; box-sizing: border-box; }}
    .btn a {{ display: block !important; }}
    .h1 {{ font-size: 22px !important; }}
    .pimg {{ width: 104px !important; height: 104px !important; }}
    .pcell {{ width: 104px !important; }}
    .tagline {{ display: none !important; }}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:{INK};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">{esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{BG};">
  <tr><td align="center" class="outer" style="padding:24px 12px;">
    <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0"
           style="width:600px;max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;border-top:4px solid {ORANGE};">
      <tr><td class="px" style="padding:18px 28px;border-bottom:1px solid {LINE};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="vertical-align:middle;">
            <a href="{SITE}" target="_blank" style="color:{INK};">
              <img src="{LOGO}" width="32" height="32" alt="The Print Planet" style="vertical-align:middle;border-radius:8px;">
              <span style="vertical-align:middle;font-size:15px;font-weight:800;letter-spacing:0.04em;color:{INK};">&nbsp;The Print Planet</span>
            </a>
          </td>
          <td class="tagline" align="right" style="vertical-align:middle;font-size:12px;color:{MUTED};">Wholesale ID card supplies</td>
        </tr></table>
      </td></tr>
      {body_rows}
      <tr><td class="px" style="background:#F8FAFC;border-top:1px solid {LINE};padding:20px 28px;font-size:12px;line-height:1.7;color:{MUTED};">
        {footer}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>'''


def _button(href: str, label: str, bg: str, fg: str = '#FFFFFF', border: str = '', big: bool = False) -> str:
    pad, size = ('16px 22px', '16px') if big else ('13px 16px', '15px')
    return (
        f'<a href="{esc(href)}" target="_blank" style="display:block;background:{bg};color:{fg};border:1px solid {border or bg};'
        f'font-size:{size};font-weight:800;line-height:20px;text-align:center;padding:{pad};border-radius:10px;">{label}</a>'
    )


def _buttons_row(buttons: list[str]) -> str:
    w = f'{100 // len(buttons)}%'
    cells = ''.join(
        f'<td class="stack btn" width="{w}" style="padding:0 {8 if i < len(buttons) - 1 else 0}px 0 0;vertical-align:top;">{b}</td>'
        for i, b in enumerate(buttons)
    )
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{cells}</tr></table>'


def _detail_rows(rows: list[tuple[str, str]]) -> str:
    out = []
    for i, (label, value_html) in enumerate(rows):
        border = '' if i == len(rows) - 1 else f'border-bottom:1px solid {LINE};'
        out.append(
            f'<tr><td style="width:100px;padding:11px 12px 11px 0;{border}font-size:13px;color:{MUTED};vertical-align:top;">{label}</td>'
            f'<td style="padding:11px 0;{border}font-size:14px;color:{INK};font-weight:600;word-break:break-word;">{value_html}</td></tr>'
        )
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{"".join(out)}</table>'


def _section_label(text: str) -> str:
    return f'<div style="font-size:16px;font-weight:800;color:{INK};margin:0 0 12px 0;">{text}</div>'


def _initials_tile(name: str, size: int) -> str:
    letters = ''.join(w[0] for w in str(name).split()[:2]).upper() or 'TPP'
    return (f'<div class="pimg" style="width:{size}px;height:{size}px;line-height:{size}px;border-radius:12px;background:{ORANGE_SOFT};'
            f'color:{ORANGE};font-size:{size // 3}px;font-weight:800;text-align:center;">{esc(letters)}</div>')


def _product_card(ctx: dict, product: str, qty: str, show_sku: bool = True) -> str:
    """Photo on the left, product facts and a link on the right. Side by side even on phones."""
    url = _safe_url(ctx.get('product_url'))
    img = _safe_url(ctx.get('product_image'))
    photo = (f'<img class="pimg" src="{esc(img)}" width="140" height="140" alt="{esc(product)}" '
             f'style="display:block;width:140px;height:140px;border-radius:12px;border:1px solid {LINE};background:#FFFFFF;">'
             if img else _initials_tile(product, 140))
    if url:
        photo = f'<a href="{esc(url)}" target="_blank">{photo}</a>'
    name_html = (f'<a href="{esc(url)}" target="_blank" style="color:{INK};">{esc(product)}</a>' if url else esc(product))
    facts = [f'<span style="color:{MUTED};">Quantity:</span> <strong>{esc(qty)}</strong>']
    if ctx.get('product_price'):
        facts.append(f'<span style="color:{MUTED};">Listed price:</span> <strong>{esc(ctx["product_price"])}</strong>')
    if ctx.get('product_moq'):
        facts.append(f'<span style="color:{MUTED};">Min. order:</span> {esc(ctx["product_moq"])}')
    if show_sku and ctx.get('product_sku'):
        facts.append(f'<span style="color:{MUTED};">SKU:</span> {esc(ctx["product_sku"])}')
    category = (f'<div style="font-size:11px;font-weight:800;color:{ORANGE};letter-spacing:0.08em;text-transform:uppercase;">'
                f'{esc(ctx["product_category"])}</div>' if ctx.get('product_category') else '')
    view = (f'<a href="{esc(url)}" target="_blank" style="display:inline-block;margin-top:10px;font-size:13px;font-weight:800;color:{ORANGE};">'
            f'View product &rarr;</a>' if url else '')
    return f'''
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid {LINE};border-radius:14px;">
          <tr>
            <td class="pcell" width="140" style="width:140px;padding:14px;vertical-align:top;">{photo}</td>
            <td style="padding:14px 16px 14px 2px;vertical-align:top;">
              {category}
              <div style="margin-top:4px;font-size:17px;line-height:1.35;font-weight:800;color:{INK};word-break:break-word;">{name_html}</div>
              <div style="margin-top:8px;font-size:13px;line-height:1.7;color:{INK};">{'<br>'.join(facts)}</div>
              {view}
            </td>
          </tr>
        </table>'''


def _related_grid(items: list) -> str:
    """Three small product tiles; stays three across, even on phones."""
    cells = []
    for item in (items or [])[:3]:
        url, img = _safe_url(item.get('url')), _safe_url(item.get('image'))
        if not url:
            continue
        pic = (f'<img src="{esc(img)}" width="160" alt="{esc(item.get("name"))}" style="display:block;width:100%;max-width:160px;height:auto;'
               f'border-radius:10px;border:1px solid {LINE};background:#FFFFFF;">' if img
               else f'<div style="height:100px;border-radius:10px;background:{ORANGE_SOFT};"></div>')
        cells.append(
            f'<td width="33%" style="width:33%;padding:0 5px;vertical-align:top;">'
            f'<a href="{esc(url)}" target="_blank" style="color:{INK};">{pic}'
            f'<div style="margin-top:7px;font-size:12px;line-height:1.4;font-weight:700;color:{INK};word-break:break-word;">{esc(item.get("name"))}</div>'
            f'<div style="margin-top:3px;font-size:12px;font-weight:800;color:{ORANGE};">Get price &rarr;</div></a></td>'
        )
    if not cells:
        return ''
    while len(cells) < 3:
        cells.append('<td width="33%" style="width:33%;padding:0 5px;">&nbsp;</td>')
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{"".join(cells)}</tr></table>'


def _chip_link(label: str, href: str) -> str:
    return (f'<a href="{esc(href)}" target="_blank" style="display:inline-block;margin:0 6px 8px 0;background:{ORANGE_SOFT};'
            f'color:#B4470F;border:1px solid #FBD5BC;padding:8px 13px;border-radius:999px;font-size:13px;font-weight:700;">{label}</a>')


def _progress(active: int) -> str:
    """Three-step tracker: Received, Quote, Dispatch."""
    steps = ('Received', 'Quotation', 'Dispatch')
    cells = []
    for i, label in enumerate(steps):
        on = i < active
        bar = GREEN if on else LINE
        colour = INK if on else MUTED
        mark = '&#10003; ' if on else ''
        cells.append(
            f'<td width="33%" style="width:33%;padding:0 3px;vertical-align:top;">'
            f'<div style="height:6px;line-height:6px;font-size:0;border-radius:3px;background:{bar};">&nbsp;</div>'
            f'<div style="margin-top:8px;font-size:12px;font-weight:800;color:{colour};">{mark}{label}</div></td>'
        )
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{"".join(cells)}</tr></table>'


# ----------------------------------------------------------------------------- emails

def owner_enquiry_email(ctx: dict) -> str:
    """Lead alert for the owner: the product with its photo, the buyer, and one tap to reply."""
    name, company = ctx.get('full_name') or 'Customer', ctx.get('company_name') or ''
    product, qty = ctx.get('prod_name') or 'Product enquiry', _qty_label(ctx.get('requested_quantity'))
    phone, email = ctx.get('phone') or '', ctx.get('email') or ''
    has_company = company and company.lower() not in ('individual', 'none', '')
    ref = ctx.get('enquiry_id')
    wa_text = urllib.parse.quote(
        f'Hello {name}, thank you for your enquiry #{ref} for {product} ({qty}) with The Print Planet. '
    )
    mail_subject = urllib.parse.quote(f'Quote for {product} - The Print Planet (enquiry #{ref})')
    mail_body = urllib.parse.quote(f'Hello {name},\n\nThank you for your enquiry for {product} ({qty}).\n\n')
    source = ctx.get('lead_source') or 'direct'
    landing = ctx.get('landing_page') or ''
    source_page = str(ctx.get('source_page') or '/')

    attachment = ''
    if _safe_url(ctx.get('attachment_url')):
        attachment = f'''
      <tr><td class="px" style="padding:0 28px 22px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;">
          <tr><td style="padding:14px 16px;font-size:14px;color:#92400E;">
            &#128206; <strong>{esc(ctx.get('attachment_name') or 'Customer file')}</strong>
            &nbsp;<a href="{esc(ctx['attachment_url'])}" target="_blank" style="color:#92400E;font-weight:800;text-decoration:underline;">Download</a>
          </td></tr>
        </table>
      </td></tr>'''

    details = _detail_rows([
        ('Name', esc(name)),
        ('Company', esc(company) if has_company else f'<span style="color:{MUTED};font-weight:400;">Not given</span>'),
        ('Phone', f'<a href="tel:{esc(_tel(phone))}" style="color:{INK};">{esc(phone)}</a>'),
        ('Email', f'<a href="mailto:{esc(email)}" style="color:{INK};">{esc(email)}</a>'),
        ('Came from', f'<span style="display:inline-block;background:{ORANGE_SOFT};color:#B4470F;padding:3px 10px;border-radius:999px;font-size:12px;">{esc(source)}</span>'
                      + (f'<div style="margin-top:5px;font-size:12px;font-weight:400;color:{MUTED};">First page: {esc(landing)}</div>' if landing else '')),
        ('Asked on', f'<a href="{esc(SITE + source_page)}" target="_blank" style="color:{ORANGE};font-size:13px;">{esc(source_page)}</a>'),
    ])

    body = f'''
      <tr><td class="px" style="padding:24px 28px 4px 28px;">
        <div style="font-size:13px;color:{MUTED};">
          <span style="display:inline-block;background:{ORANGE};color:#FFFFFF;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.06em;">NEW ENQUIRY #{esc(ref)}</span>
          &nbsp;{esc(_received_ist())}
        </div>
        <h1 class="h1" style="margin:12px 0 0 0;font-size:24px;line-height:1.3;font-weight:800;color:{INK};">{esc(name)} wants {esc(qty)}</h1>
        <div style="margin-top:6px;font-size:14px;color:{MUTED};">{esc(company) + ' &middot; ' if has_company else ''}via {esc(source)}</div>
      </td></tr>
      <tr><td class="px" style="padding:18px 28px 4px 28px;">{_product_card(ctx, product, qty)}</td></tr>
      <tr><td class="px" style="padding:18px 28px 4px 28px;">
        {_button(f'https://wa.me/{_wa_number(phone)}?text={wa_text}', '&#128172;&nbsp; Reply on WhatsApp', GREEN, big=True)}
        <div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>
        {_buttons_row([
            _button(f'tel:{_tel(phone)}', '&#128222;&nbsp; Call', INK),
            _button(f'mailto:{email}?subject={mail_subject}&body={mail_body}', '&#9993;&nbsp; Email quote', '#FFFFFF', INK, '#CBD2DB'),
        ])}
      </td></tr>
      <tr><td class="px" style="padding:24px 28px 22px 28px;">
        {_section_label('Message')}
        <div style="background:#F8FAFC;border-left:4px solid {ORANGE};border-radius:8px;padding:14px 16px;font-size:15px;line-height:1.6;color:{INK};white-space:pre-wrap;word-break:break-word;">{esc(ctx.get('message')) or f'<span style="color:{MUTED};">No message</span>'}</div>
      </td></tr>
      {attachment}
      <tr><td class="px" style="padding:0 28px 8px 28px;">
        {_section_label('Buyer')}
        {details}
      </td></tr>
      <tr><td class="px" style="padding:20px 28px 26px 28px;">
        {_button(f'{SITE}/owner/enquiries', 'Open enquiry dashboard &rarr;', ORANGE_SOFT, '#B4470F', '#FBD5BC')}
      </td></tr>'''
    footer = (f'Lead alert from <a href="{SITE}" target="_blank" style="color:{INK};font-weight:700;">theprintplanet.co.in</a>. '
              'Reply within the hour: fast replies win most wholesale orders.')
    preheader = f"{name}{' (' + company + ')' if has_company else ''} wants {qty} of {product}"
    return _shell(f'New enquiry #{ref}', preheader, body, footer)


def customer_enquiry_email(ctx: dict) -> str:
    """Order-style confirmation for the buyer: the product with its photo, next steps, ways to act now."""
    name = ctx.get('full_name') or 'there'
    first = str(name).split()[0] if str(name).strip() else 'there'
    product, qty = ctx.get('prod_name') or 'your requirement', _qty_label(ctx.get('requested_quantity'))
    ref = ctx.get('enquiry_id')
    site_phone = ctx.get('site_phone') or '+91 97418 08034'
    site_email = ctx.get('site_email') or 'theprintplanet01@gmail.com'
    site_address = ctx.get('site_address') or 'Sunkadakatte, Bengaluru 560091'
    tel = _tel(site_phone)
    wa_text = urllib.parse.quote(f'Hi The Print Planet, this is about my enquiry #{ref} for {product} ({qty}).')
    add_text = urllib.parse.quote(f'Hi The Print Planet, please add these items to my enquiry #{ref}: ')
    company = str(ctx.get('company_name') or '')

    related = _related_grid(ctx.get('related_products') or [])
    more = (f'''
      <tr><td class="px" style="padding:26px 28px 4px 28px;">
        {_section_label('You may also need')}
        {related}
      </td></tr>''' if related else f'''
      <tr><td class="px" style="padding:26px 28px 4px 28px;">
        {_section_label('Popular with our buyers')}
        {''.join(_chip_link(label, SITE + path) for label, path in POPULAR)}
      </td></tr>''')

    you_sent = _detail_rows([
        ('Name', esc(name)),
        ('Company', esc(company) if company.lower() not in ('', 'individual', 'none')
                    else f'<span style="color:{MUTED};font-weight:400;">Not given</span>'),
        ('Phone', esc(ctx.get('phone') or '')),
        ('Email', esc(ctx.get('email') or '')),
        ('Message', f'<span style="font-weight:400;white-space:pre-wrap;">{esc(ctx.get("message") or "")}</span>'),
    ])

    body = f'''
      <tr><td class="px" style="padding:26px 28px 4px 28px;">
        <div style="font-size:13px;font-weight:800;color:{GREEN};">&#10003; Enquiry received &middot; Ref #{esc(ref)}</div>
        <h1 class="h1" style="margin:8px 0 0 0;font-size:26px;line-height:1.25;font-weight:800;color:{INK};">Thanks {esc(first)}, we&rsquo;re on it!</h1>
        <p style="margin:8px 0 0 0;font-size:15px;line-height:1.6;color:#374151;">You will get the best wholesale price and delivery time within 2 to 4 business hours.</p>
      </td></tr>
      <tr><td class="px" style="padding:18px 28px 4px 28px;">{_product_card(ctx, product, qty, show_sku=False)}</td></tr>
      <tr><td class="px" style="padding:18px 28px 4px 28px;">{_progress(1)}</td></tr>
      <tr><td class="px" style="padding:20px 28px 4px 28px;">
        {_button(f'https://wa.me/{SHOP_WHATSAPP}?text={wa_text}', '&#128172;&nbsp; Chat on WhatsApp for a faster quote', GREEN, big=True)}
        <div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>
        {_buttons_row([
            _button(f'tel:{tel}', f'&#128222;&nbsp; Call {esc(site_phone)}', INK),
            _button(f'https://wa.me/{SHOP_WHATSAPP}?text={add_text}', '&#10133;&nbsp; Add more items', '#FFFFFF', INK, '#CBD2DB'),
        ])}
      </td></tr>
      {more}
      <tr><td class="px" style="padding:22px 28px 4px 28px;">
        <a href="{SITE}/pricing" target="_blank" style="font-size:14px;font-weight:800;color:{ORANGE};">Wholesale price list &rarr;</a>
        &nbsp;&nbsp;&nbsp;<a href="{SITE}/guides" target="_blank" style="font-size:14px;font-weight:800;color:{ORANGE};">Buyer guides &rarr;</a>
      </td></tr>
      <tr><td class="px" style="padding:26px 28px 26px 28px;">
        {_section_label('Your details')}
        <div style="background:#F8FAFC;border:1px solid {LINE};border-radius:12px;padding:2px 16px;">{you_sent}</div>
        <div style="margin-top:8px;font-size:12px;color:{MUTED};">Something wrong? Reply to this email and we will correct it.</div>
      </td></tr>'''
    footer = f'''<strong style="color:{INK};font-size:13px;">The Print Planet</strong> &middot; {HOURS}<br>
        {esc(site_address)}<br>
        <a href="tel:{esc(tel)}" style="color:{INK};">{esc(site_phone)}</a> &middot;
        <a href="mailto:{esc(site_email)}" style="color:{INK};">{esc(site_email)}</a> &middot;
        <a href="{SITE}" target="_blank" style="color:{INK};">theprintplanet.co.in</a><br>
        GSTIN 29AAQFT3909B1ZZ'''
    return _shell(f'Enquiry #{ref} received', f'Ref #{ref}: {product}, {qty}. Your quote comes within 2 to 4 business hours.', body, footer)
