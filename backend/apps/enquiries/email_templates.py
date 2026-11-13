"""
Responsive HTML emails for enquiries: the owner alert and the buyer confirmation.

Built the way email clients need it: table layout, inline styles, a 600px fluid container,
and a small <style> block whose media query stacks buttons and tightens padding on phones
(Gmail, Apple Mail, iOS and Android mail honour it; clients that ignore it still get a
readable single-column layout). Every value a buyer typed goes through esc().
"""
import html
import urllib.parse

SITE = 'https://theprintplanet.co.in'
LOGO = f'{SITE}/icon.png'
INK = '#121418'
ORANGE = '#F26B1D'
MUTED = '#6B7280'
LINE = '#E7EBF0'
BG = '#EDF1F6'
SHOP_WHATSAPP = '919741808034'


def esc(value) -> str:
    return html.escape(str(value if value is not None else ''), quote=True)


def _received_ist() -> str:
    try:
        from zoneinfo import ZoneInfo
        from django.utils import timezone
        return timezone.now().astimezone(ZoneInfo('Asia/Kolkata')).strftime('%d %b %Y, %I:%M %p IST')
    except Exception:
        return ''


def _qty_label(qty) -> str:
    return f'{qty} units' if str(qty).strip().isdigit() else str(qty or 'Bulk quantity')


GREEN = '#1FAF55'
HERO_BG = (f'background-color:{INK};'
           'background-image:radial-gradient(circle at 100% 0%, rgba(242,107,29,0.55) 0%, rgba(242,107,29,0) 55%),'
           'linear-gradient(135deg, #1B1F27 0%, #0B0D11 100%);')


def _shell(title: str, preheader: str, hero: str, body_rows: str, footer: str) -> str:
    """Shared page: dark glowing hero, white body, dark footer, responsive rules."""
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
    .px {{ padding-left: 20px !important; padding-right: 20px !important; }}
    .stack {{ display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; box-sizing: border-box; }}
    .full {{ width: 100% !important; }}
    .btn a {{ display: block !important; }}
    .h1 {{ font-size: 25px !important; }}
    .ref {{ font-size: 30px !important; }}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:{INK};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">{esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{BG};">
  <tr><td align="center" class="outer" style="padding:28px 12px;">
    <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0"
           style="width:600px;max-width:600px;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(18,20,24,0.10);">
      <tr><td class="px" style="{HERO_BG}padding:22px 32px 30px 32px;">
        <a href="{SITE}" target="_blank" style="color:#FFFFFF;">
          <img src="{LOGO}" width="24" height="24" alt="" style="vertical-align:middle;background:#FFFFFF;border-radius:6px;padding:2px;">
          <span style="vertical-align:middle;font-size:13px;font-weight:800;letter-spacing:0.12em;color:#FFFFFF;">&nbsp;THE PRINT PLANET</span>
        </a>
        {hero}
      </td></tr>
      {body_rows}
      <tr><td class="px" style="background:{INK};padding:22px 32px;font-size:12px;line-height:1.7;color:#9CA3AF;">
        {footer}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>'''


def _pill(text: str, bg: str, fg: str) -> str:
    return (f'<span style="display:inline-block;background:{bg};color:{fg};padding:5px 12px;border-radius:999px;'
            f'font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">{text}</span>')


def _button(href: str, label: str, bg: str, fg: str = '#FFFFFF', border: str = '', big: bool = False) -> str:
    edge = f'border:1px solid {border or bg};'
    pad, size = ('17px 24px', '17px') if big else ('13px 18px', '15px')
    return (
        f'<a href="{esc(href)}" target="_blank" style="display:block;background:{bg};color:{fg};{edge}'
        f'font-size:{size};font-weight:800;line-height:20px;text-align:center;padding:{pad};border-radius:12px;">{label}</a>'
    )


def _buttons_row(buttons: list[str]) -> str:
    """Equal-width buttons side by side on desktop, stacked full width on phones."""
    w = f'{100 // len(buttons)}%'
    cells = ''.join(
        f'<td class="stack btn" width="{w}" style="padding:0 {8 if i < len(buttons) - 1 else 0}px 0 0;vertical-align:top;">{b}</td>'
        for i, b in enumerate(buttons)
    )
    return f'<table role="presentation" class="full" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{cells}</tr></table>'


def _tiles(items: list[tuple[str, str]]) -> str:
    """Stat tiles in a row on desktop, stacked on phones."""
    w = f'{100 // len(items)}%'
    cells = ''.join(
        f'''<td class="stack" width="{w}" style="padding:0 {8 if i < len(items) - 1 else 0}px 0 0;vertical-align:top;">
          <div style="background:#F6F8FB;border:1px solid {LINE};border-radius:14px;padding:14px 16px;">
            <div style="font-size:11px;font-weight:700;color:{MUTED};text-transform:uppercase;letter-spacing:0.08em;">{label}</div>
            <div style="margin-top:6px;font-size:16px;font-weight:800;color:{INK};word-break:break-word;">{value}</div>
          </div></td>'''
        for i, (label, value) in enumerate(items)
    )
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>{cells}</tr></table>'


def _detail_rows(rows: list[tuple[str, str]]) -> str:
    out = []
    for i, (label, value_html) in enumerate(rows):
        border = '' if i == len(rows) - 1 else f'border-bottom:1px solid {LINE};'
        out.append(
            f'<tr><td style="width:110px;padding:12px 12px 12px 0;{border}font-size:13px;color:{MUTED};vertical-align:top;">{label}</td>'
            f'<td style="padding:12px 0;{border}font-size:14px;color:{INK};font-weight:600;word-break:break-word;">{value_html}</td></tr>'
        )
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{"".join(out)}</table>'


def _section_label(text: str) -> str:
    return (f'<div style="font-size:11px;font-weight:800;color:{ORANGE};text-transform:uppercase;'
            f'letter-spacing:0.12em;margin:0 0 10px 0;">{text}</div>')


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


HOURS = 'Mon to Sat, 10 AM to 7 PM IST'
POPULAR = (
    ('PVC ID card sheets', '/categories/pvc-id-card-consumable'),
    ('Lanyard rolls', '/categories/indian-satin-digital-lanyard-roll'),
    ('ID card holders', '/categories/id-card-holder'),
    ('RFID cards', '/categories/rfid-cansumables'),
    ('Machines', '/categories/machines'),
    ('Sample kit', '/categories/sample-kit'),
)


def _chip_link(label: str, href: str) -> str:
    return (f'<a href="{esc(href)}" target="_blank" style="display:inline-block;margin:0 6px 8px 0;background:#FFF4EC;'
            f'color:#B4470F;border:1px solid #FBD5BC;padding:8px 13px;border-radius:999px;font-size:13px;font-weight:700;">{label}</a>')


def owner_enquiry_email(ctx: dict) -> str:
    """Lead card for the owner: who, what, how many, and one tap to reply."""
    name, company = ctx.get('full_name') or 'Customer', ctx.get('company_name') or ''
    product, qty = ctx.get('prod_name') or 'Product enquiry', _qty_label(ctx.get('requested_quantity'))
    phone, email = ctx.get('phone') or '', ctx.get('email') or ''
    has_company = company and company.lower() not in ('individual', 'none', '')
    ref = esc(ctx.get('enquiry_id'))
    wa_text = urllib.parse.quote(
        f'Hello {name}, thank you for your enquiry #{ctx.get("enquiry_id")} for {product} ({qty}) with The Print Planet. '
    )
    mail_subject = urllib.parse.quote(f'Quote for {product} - The Print Planet (enquiry #{ctx.get("enquiry_id")})')
    mail_body = urllib.parse.quote(f'Hello {name},\n\nThank you for your enquiry for {product} ({qty}).\n\n')
    source = ctx.get('lead_source') or 'direct'
    landing = ctx.get('landing_page') or ''
    source_page = str(ctx.get('source_page') or '/')
    received = _received_ist()

    hero = f'''
        <div style="margin-top:26px;">{_pill('&#9679; New lead #' + ref, ORANGE, '#FFFFFF')}</div>
        <h1 class="h1" style="margin:14px 0 0 0;font-size:28px;line-height:1.25;font-weight:800;color:#FFFFFF;">{esc(product)}</h1>
        <div style="margin-top:10px;font-size:15px;line-height:1.5;color:#D1D5DB;">
          <strong style="color:#FFFFFF;">{esc(name)}</strong>{(' &middot; ' + esc(company)) if has_company else ''} wants a quote
        </div>'''

    attachment = ''
    if ctx.get('attachment_url'):
        attachment = f'''
      <tr><td class="px" style="padding:0 32px 24px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:14px;">
          <tr><td style="padding:14px 16px;font-size:14px;color:#92400E;">
            &#128206; <strong>{esc(ctx.get('attachment_name') or 'Customer file')}</strong><br>
            <a href="{esc(ctx['attachment_url'])}" target="_blank" style="display:inline-block;margin-top:8px;color:#92400E;font-weight:800;text-decoration:underline;">Download the file</a>
          </td></tr>
        </table>
      </td></tr>'''

    details = _detail_rows([
        ('Phone', f'<a href="tel:{esc(_tel(phone))}" style="color:{INK};">{esc(phone)}</a>'),
        ('Email', f'<a href="mailto:{esc(email)}" style="color:{INK};">{esc(email)}</a>'),
        ('Company', esc(company) if has_company else f'<span style="color:{MUTED};font-weight:400;">Not given</span>'),
        ('Asked from', f'<a href="{esc(SITE + source_page)}" target="_blank" style="color:{ORANGE};font-weight:600;font-size:13px;">{esc(source_page)}</a>'),
        ('First visit', f'<span style="font-weight:400;font-size:13px;">{esc(landing)}</span>' if landing else f'<span style="color:{MUTED};font-weight:400;">Not tracked</span>'),
    ])

    body = f'''
      <tr><td class="px" style="padding:26px 32px 6px 32px;">
        {_tiles([('Quantity', esc(qty)), ('Source', esc(source)), ('Received', esc(received.replace(' IST', '')) or 'Just now')])}
      </td></tr>
      <tr><td class="px" style="padding:20px 32px 6px 32px;">
        {_section_label('Reply while they are hot')}
        {_button(f'https://wa.me/{_wa_number(phone)}?text={wa_text}', '&#128172;&nbsp; Reply on WhatsApp', GREEN, big=True)}
        <div style="height:10px;line-height:10px;font-size:0;">&nbsp;</div>
        {_buttons_row([
            _button(f'tel:{_tel(phone)}', '&#128222;&nbsp; Call', INK),
            _button(f'mailto:{email}?subject={mail_subject}&body={mail_body}', '&#9993;&nbsp; Email quote', '#FFFFFF', INK, '#CBD2DB'),
        ])}
      </td></tr>
      <tr><td class="px" style="padding:24px 32px 24px 32px;">
        {_section_label('Their message')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="width:28px;vertical-align:top;font-size:44px;line-height:36px;font-weight:800;color:{ORANGE};font-family:Georgia,serif;">&ldquo;</td>
          <td style="vertical-align:top;font-size:16px;line-height:1.6;color:{INK};white-space:pre-wrap;word-break:break-word;">{esc(ctx.get('message')) or f'<span style="color:{MUTED};">No message</span>'}</td>
        </tr></table>
      </td></tr>
      {attachment}
      <tr><td class="px" style="padding:0 32px 8px 32px;">
        {_section_label('Contact card')}
        <div style="border:1px solid {LINE};border-radius:14px;padding:4px 18px;">
          <div style="padding:14px 0 6px 0;font-size:17px;font-weight:800;color:{INK};">{esc(name)}</div>
          {details}
        </div>
      </td></tr>
      <tr><td class="px" style="padding:22px 32px 30px 32px;">
        {_button(f'{SITE}/owner/enquiries', 'Open enquiry dashboard &rarr;', '#FFF4EC', '#B4470F', '#FBD5BC')}
      </td></tr>'''
    footer = (f'Lead alert from <a href="{SITE}" target="_blank" style="color:#FFFFFF;font-weight:700;">theprintplanet.co.in</a>. '
              'Buyers who get a reply within an hour are far more likely to order.')
    preheader = f"{name}{' (' + company + ')' if has_company else ''} wants {qty} of {product}"
    return _shell(f'New lead #{ctx.get("enquiry_id")}', preheader, hero, body, footer)


def customer_enquiry_email(ctx: dict) -> str:
    """Confirmation ticket for the buyer: what we received, what happens next, ways to act now."""
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
    share_text = urllib.parse.quote(f'Wholesale ID card supplies from The Print Planet, Bengaluru: {SITE}')

    hero = f'''
        <div style="margin-top:26px;">{_pill('&#10003; Enquiry received', GREEN, '#FFFFFF')}</div>
        <h1 class="h1" style="margin:14px 0 0 0;font-size:30px;line-height:1.2;font-weight:800;color:#FFFFFF;">Thanks, {esc(first)}.<br>Your quote is on its way.</h1>
        <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#D1D5DB;">Our sales desk replies within 2 to 4 business hours ({HOURS}).</p>'''

    ticket = f'''
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid {LINE};border-radius:16px;background:#FFFFFF;">
          <tr><td style="padding:18px 20px 16px 20px;border-left:5px solid {ORANGE};border-radius:16px 16px 0 0;">
            <div style="font-size:11px;font-weight:800;color:{MUTED};letter-spacing:0.12em;text-transform:uppercase;">Your reference</div>
            <div class="ref" style="margin-top:4px;font-size:34px;font-weight:800;color:{INK};font-family:'SF Mono',Menlo,Consolas,monospace;letter-spacing:0.02em;">#{esc(ref)}</div>
          </td></tr>
          <tr><td style="font-size:0;line-height:0;border-top:2px dashed {LINE};">&nbsp;</td></tr>
          <tr><td style="padding:16px 20px 18px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td class="stack" width="65%" style="vertical-align:top;padding-right:12px;">
                <div style="font-size:11px;font-weight:700;color:{MUTED};letter-spacing:0.08em;text-transform:uppercase;">Product</div>
                <div style="margin-top:4px;font-size:16px;font-weight:800;color:{INK};word-break:break-word;">{esc(product)}</div>
              </td>
              <td class="stack" width="35%" style="vertical-align:top;">
                <div style="font-size:11px;font-weight:700;color:{MUTED};letter-spacing:0.08em;text-transform:uppercase;">Quantity</div>
                <div style="margin-top:4px;font-size:16px;font-weight:800;color:{INK};">{esc(qty)}</div>
              </td>
            </tr></table>
          </td></tr>
        </table>'''

    def step(icon, title, text, done=False):
        dot_bg, dot_fg = (GREEN, '#FFFFFF') if done else ('#FFF4EC', ORANGE)
        return f'''<td class="stack" width="33%" style="vertical-align:top;padding:0 10px 0 0;">
          <div style="width:34px;height:34px;line-height:34px;border-radius:17px;background:{dot_bg};color:{dot_fg};font-size:16px;font-weight:800;text-align:center;">{icon}</div>
          <div style="margin-top:8px;font-size:14px;font-weight:800;color:{INK};">{title}</div>
          <div style="margin-top:3px;font-size:13px;line-height:1.5;color:{MUTED};">{text}</div>
        </td>'''

    timeline = (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        + step('&#10003;', 'Received', 'We have your enquiry. Nothing more needed.', done=True)
        + step('2', 'Quotation', 'Best price for your quantity, plus delivery time, on WhatsApp or email.')
        + step('3', 'Dispatch', 'Confirm and we ship across India with a GST invoice.')
        + '</tr></table>'
    )

    you_sent = _detail_rows([
        ('Name', esc(name)),
        ('Company', esc(ctx.get('company_name')) if str(ctx.get('company_name') or '').lower() not in ('', 'individual', 'none')
                    else f'<span style="color:{MUTED};font-weight:400;">Not given</span>'),
        ('Phone', esc(ctx.get('phone') or '')),
        ('Email', esc(ctx.get('email') or '')),
        ('Message', f'<span style="font-weight:400;white-space:pre-wrap;">{esc(ctx.get("message") or "")}</span>'),
    ])

    body = f'''
      <tr><td class="px" style="padding:26px 32px 6px 32px;">{ticket}</td></tr>
      <tr><td class="px" style="padding:26px 32px 6px 32px;">
        {_section_label('What happens next')}
        {timeline}
      </td></tr>
      <tr><td class="px" style="padding:22px 32px 6px 32px;">
        {_section_label('Want it faster?')}
        {_button(f'https://wa.me/{SHOP_WHATSAPP}?text={wa_text}', '&#128172;&nbsp; Chat with us on WhatsApp', GREEN, big=True)}
        <div style="height:10px;line-height:10px;font-size:0;">&nbsp;</div>
        {_buttons_row([
            _button(f'tel:{tel}', f'&#128222;&nbsp; Call {esc(site_phone)}', INK),
            _button(f'https://wa.me/{SHOP_WHATSAPP}?text={add_text}', '&#10133;&nbsp; Add more items', '#FFFFFF', INK, '#CBD2DB'),
        ])}
      </td></tr>
      <tr><td class="px" style="padding:26px 32px 6px 32px;">
        {_section_label('What you sent us')}
        <div style="background:#F6F8FB;border:1px solid {LINE};border-radius:14px;padding:2px 18px;">{you_sent}</div>
        <div style="margin-top:8px;font-size:12px;color:{MUTED};">Something wrong? Just reply to this email and we will fix it.</div>
      </td></tr>
      <tr><td class="px" style="padding:26px 32px 6px 32px;">
        {_section_label('Browse while you wait')}
        {''.join(_chip_link(label, SITE + path) for label, path in POPULAR)}
        <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#374151;">
          <a href="{SITE}/pricing" target="_blank" style="color:{ORANGE};font-weight:800;">Wholesale price list &rarr;</a>
          &nbsp;&nbsp;<a href="{SITE}/guides" target="_blank" style="color:{ORANGE};font-weight:800;">Buyer guides &rarr;</a>
        </div>
      </td></tr>
      <tr><td class="px" style="padding:22px 32px 30px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F8FB;border-radius:14px;">
          <tr><td style="padding:16px 18px;font-size:14px;line-height:1.5;color:#374151;">
            <strong style="color:{INK};">Know someone who buys ID card supplies?</strong><br>
            <a href="https://wa.me/?text={share_text}" target="_blank" style="display:inline-block;margin-top:6px;color:{GREEN};font-weight:800;">Share The Print Planet on WhatsApp &rarr;</a>
          </td></tr>
        </table>
      </td></tr>'''
    footer = f'''<strong style="color:#FFFFFF;font-size:13px;">The Print Planet</strong> &middot; Wholesale ID card supplies<br>
        {esc(site_address)} &middot; {HOURS}<br>
        <a href="tel:{esc(tel)}" style="color:#FFFFFF;">{esc(site_phone)}</a> &middot;
        <a href="mailto:{esc(site_email)}" style="color:#FFFFFF;">{esc(site_email)}</a> &middot;
        <a href="{SITE}" target="_blank" style="color:#FFFFFF;">theprintplanet.co.in</a><br>
        GSTIN 29AAQFT3909B1ZZ'''
    return _shell(f'Enquiry #{ref} received', f'Reference #{ref}: {product}, {qty}. Your quote comes within 2 to 4 business hours.', hero, body, footer)
