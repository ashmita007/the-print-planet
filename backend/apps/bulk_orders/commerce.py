"""Pure commerce rules (no database access): status transitions, quote maths, financial year."""
import re
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

CENT = Decimal('0.01')

# Order of the happy path; used to tell "before" from "after" for cancellation.
FLOW = ['submitted', 'reviewing', 'quoted', 'paid', 'proofing', 'in_production', 'dispatched', 'completed']

TRANSITIONS = {
    'submitted': {'reviewing', 'quoted', 'cancelled'},
    'reviewing': {'quoted', 'cancelled'},
    'quoted': {'reviewing', 'paid', 'cancelled'},
    'paid': {'proofing', 'cancelled'},
    'proofing': {'in_production', 'cancelled'},
    'in_production': {'dispatched', 'cancelled'},
    'dispatched': {'completed'},
    'completed': {'returned'},
    'cancelled': set(),
    'returned': set(),
}

DEFAULT_CANCELLATION_LIMIT = 'in_production'


class QuoteError(ValueError):
    """The quote cannot be computed; the message is safe to show to the owner."""


def can_transition(old, new):
    return new in TRANSITIONS.get(old, set())


def cancellable(status, allowed_until):
    """True while `status` is still before `allowed_until` on the happy path."""
    limit = allowed_until if allowed_until in FLOW else DEFAULT_CANCELLATION_LIMIT
    return status in FLOW and FLOW.index(status) < FLOW.index(limit)


def money(value):
    return Decimal(value).quantize(CENT, rounding=ROUND_HALF_UP)


# GST state / union territory codes (the first two digits of a GSTIN).
INDIAN_STATES = {
    '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
    '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
    '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
    '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra', '29': 'Karnataka',
    '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh',
    '97': 'Other Territory',
}
# 36 states and UTs plus GST's "Other Territory" code; a few common spellings map onto them.
_ALIASES = {'orissa': 'Odisha', 'pondicherry': 'Puducherry', 'new delhi': 'Delhi', 'nct of delhi': 'Delhi',
            'uttaranchal': 'Uttarakhand', 'jammu & kashmir': 'Jammu and Kashmir',
            'andaman & nicobar islands': 'Andaman and Nicobar Islands',
            'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
            'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
            'dadra & nagar haveli and daman & diu': 'Dadra and Nagar Haveli and Daman and Diu'}
_BY_NAME = {name.lower(): name for name in INDIAN_STATES.values()}


def normalize_state(value):
    """Canonical state name for a name, alias or 2-digit GST code; '' when it is not a known state."""
    text = ' '.join(str(value or '').lower().split())
    if text in INDIAN_STATES:
        return INDIAN_STATES[text]
    return _ALIASES.get(text) or _BY_NAME.get(text, '')


def state_of_gstin(gstin):
    match = re.match(r'^(\d{2})', str(gstin or '').strip())
    return INDIAN_STATES.get(match.group(1), '') if match else ''


def compute_quote(subtotal, *, gst_rate, shipping_flat_fee, free_shipping_above, seller_state, buyer_state):
    """Shipping + GST on top of the owner's subtotal. GST applies to goods and shipping alike.

    Same state: CGST + SGST (CGST rounded half up, SGST the remainder so they add up to the tax). Different state: IGST.
    """
    subtotal = money(subtotal)
    if subtotal <= 0:
        raise QuoteError('Subtotal must be greater than zero.')
    if gst_rate is None:
        raise QuoteError('Set the default GST rate in Commerce settings before quoting.')
    gst_rate = Decimal(gst_rate)
    seller = normalize_state(seller_state)
    if not seller:
        raise QuoteError('Set a valid seller state in Commerce settings before quoting.')
    buyer = normalize_state(buyer_state)
    if not buyer:
        raise QuoteError('The order has no recognised shipping state, so GST cannot be split.')

    fee = money(shipping_flat_fee or 0)
    free = free_shipping_above is not None and subtotal >= Decimal(free_shipping_above)
    shipping = Decimal('0.00') if free else fee
    taxable = subtotal + shipping
    tax = money(taxable * gst_rate / 100)
    zero = Decimal('0.00')
    if seller == buyer:
        cgst = money(tax / 2)
        sgst, igst = tax - cgst, zero
    else:
        cgst = sgst = zero
        igst = tax
    return {
        'subtotal': subtotal, 'shipping': shipping, 'gst_rate': gst_rate.quantize(CENT),
        'tax': tax, 'cgst': cgst, 'sgst': sgst, 'igst': igst, 'total': taxable + tax,
    }


def financial_year(day: date):
    """Indian financial year (April to March) as '2026-27'."""
    start = day.year if day.month >= 4 else day.year - 1
    return f'{start}-{(start + 1) % 100:02d}'
