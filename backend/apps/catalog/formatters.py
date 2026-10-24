import re

ACRONYMS = {
    'PVC', 'ID', 'RFID', 'GSM', 'A4', 'A3', 'CR80', 'CR-80', 'USB', 'LED',
    'MOQ', 'SKU', 'GST', 'PAN', 'HD', 'UV', 'CNC', 'PC', 'PET', 'ABS',
    'PP', 'NFC', 'IC', 'ISO', 'V4', '1K', '4K', 'MIFARE', 'SMART',
    'TIN', 'RGB', 'CMYK', 'EH-T', 'HIPH', 'M1', 'M2'
}

UNITS = {
    'mm': 'mm', 'cm': 'cm', 'm': 'm', 'gsm': 'GSM', 'mic': 'Mic',
    'micron': 'Micron', 'inch': 'Inch', 'inches': 'Inches', 'kg': 'kg',
    'g': 'g', 'mhz': 'MHz', 'ghz': 'GHz', 'v': 'V', 'w': 'W'
}

LOWERCASE_WORDS = {
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of',
    'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with', 'x', '×'
}


def format_category_name(name: str) -> str:
    """Format category name strictly in UPPERCASE."""
    if not name:
        return ''
    return re.sub(r'\s+', ' ', name).strip().upper()


def format_product_name(name: str) -> str:
    """
    Format product name into clean, professional Title Case while preserving
    technical acronyms (PVC, RFID, ID), dimension multipliers (x), and unit casings.
    """
    if not name:
        return ''

    # Clean multiple spaces and replace underscores with single space
    cleaned = re.sub(r'[\s_]+', ' ', name).strip()

    # Clean spaced brackets e.g. ( 300 +100 ) -> (300 + 100)
    cleaned = re.sub(r'\(\s+', '(', cleaned)
    cleaned = re.sub(r'\s+\)', ')', cleaned)

    words = cleaned.split(' ')
    formatted_words = []

    for i, word in enumerate(words):
        m = re.match(r'^([(\[\{\"\'<]*)(.*?)([)\]\}\"\'>,.:;!?]*)$', word)
        prefix, core, suffix = m.groups() if m else ('', word, '')

        if not core:
            formatted_words.append(word)
            continue

        upper_core = core.upper()
        lower_core = core.lower()

        # 1. Exact acronym match (e.g. PVC, ID, RFID)
        if upper_core in ACRONYMS:
            c = upper_core
        # 2. Dimension multiplier 'x' (e.g. 100m x 80 GSM)
        elif lower_core in ('x', '×'):
            c = 'x'
        # 3. Number + Unit (e.g. 20MM -> 20mm, 80GSM -> 80 GSM)
        elif re.match(r'^\d+(\.\d+)?[A-Za-z]+$', core):
            num_part = re.match(r'^\d+(\.\d+)?', core).group(0)
            unit_part = core[len(num_part):].lower()
            unit_formatted = UNITS.get(unit_part, unit_part.upper() if len(unit_part) <= 3 and unit_part in ('gsm', 'pvc', 'mic') else unit_part)
            c = f'{num_part}{unit_formatted}'
        # 4. Standalone unit
        elif lower_core in UNITS:
            c = UNITS[lower_core]
        # 5. Prepositions / conjunctions (keep lowercase unless first word)
        elif i > 0 and lower_core in LOWERCASE_WORDS:
            c = lower_core
        # 6. Hyphenated word (e.g. EH-T or Semi-Transparent)
        elif '-' in core:
            sub_parts = []
            for sub in core.split('-'):
                sub_upper = sub.upper()
                if sub_upper in ACRONYMS:
                    sub_parts.append(sub_upper)
                else:
                    sub_parts.append(sub.capitalize())
            c = '-'.join(sub_parts)
        else:
            c = core.capitalize()

        formatted_words.append(f'{prefix}{c}{suffix}')

    return ' '.join(formatted_words)
