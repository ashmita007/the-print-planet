export interface CategorySeo {
  h1: string;
  title: string;
  description: string;
  lead: string;
  about: string[];
  questions: { question: string; answer: string }[];
}

const DELIVERY = {
  question: "Do you deliver across India?",
  answer: "Yes. We dispatch from Bengaluru to every state, with a GST invoice on each order.",
};

/** Buyer-facing copy for the main product families. Facts only, no rankings or counts. */
export const CATEGORY_SEO: Record<string, CategorySeo> = {
  machines: {
    h1: "ID card and lanyard machines",
    title: "ID Card Making Machines & Lanyard Machines in India",
    description:
      "ID card making machines, card laminators, punch cutters, hot stamping and lanyard heat press machines from The Print Planet, Bengaluru. See prices online.",
    lead: "Laminators, card cutters, hot stamping and lanyard press machines.",
    about: [
      "A card line usually needs a fusing or laminating machine to bond the sheets, then a cutter to punch finished CR-80 cards. Lanyard printers need a heat press for sublimation.",
      "We supply manual machines for small shops, and automatic lines for card bureaus running high volumes.",
    ],
    questions: [
      {
        question: "Which machine do I need to start making PVC ID cards?",
        answer: "A fusing machine and a card cutter are the basic pair. Tell us your daily card count and we will suggest a setup.",
      },
      {
        question: "Can I see a machine working before I pay?",
        answer: "Yes. Ask for a live video demo on WhatsApp at +91 97418 08034.",
      },
      DELIVERY,
    ],
  },
  "id-card-holder": {
    h1: "ID card holders",
    title: "ID Card Holder Manufacturer & Wholesale Supplier",
    description:
      "Wholesale PVC ID card holders from The Print Planet, Bengaluru: crystal clear, semi-transparent, executive, aluminium and sticker pasting holders.",
    lead: "Crystal clear, semi-transparent, executive and sticker pasting holders.",
    about: [
      "Our holders fit standard CR-80 cards, which measure 85.6 by 54 mm. Choose a clear holder when the whole card must show, or a rigid one for daily use on a lanyard.",
      "Holders are sold in bulk for schools, offices, hospitals and ID card printers.",
    ],
    questions: [
      {
        question: "What size card fits these holders?",
        answer: "Standard CR-80 cards of 85.6 by 54 mm, unless the product page says otherwise.",
      },
      {
        question: "Can I get a sample first?",
        answer: "Yes. Ask for a sample kit with your quote.",
      },
      DELIVERY,
    ],
  },
  "indian-satin-digital-lanyard-roll": {
    h1: "Satin lanyard rolls",
    title: "Satin Lanyard Roll Manufacturer & Wholesale Supplier",
    description:
      "Satin lanyard rolls for sublimation and digital printing in 12, 16, 20 and 25 mm, white and colour, from The Print Planet, Bengaluru. See wholesale prices.",
    lead: "White and colour satin rolls in 12, 16, 20 and 25 mm.",
    about: [
      "White rolls are made for full-colour sublimation printing. Colour rolls suit screen printing with spot colours.",
      "Pick the width by what the lanyard carries: 12 or 16 mm for light badges, 20 or 25 mm when you want a larger logo.",
    ],
    questions: [
      {
        question: "Which lanyard widths are available?",
        answer: "12, 16, 20 and 25 mm.",
      },
      {
        question: "Can you match a Pantone colour?",
        answer: "Yes. Send us the Pantone code with your quote request.",
      },
      DELIVERY,
    ],
  },
  "pvc-id-card-consumable": {
    h1: "PVC ID card sheets and materials",
    title: "PVC ID Card Fusing Sheets, Core & Overlay Supplier",
    description:
      "PVC core sheets, coated overlay sheets, inkjet and digital fusing sheets for ID card printing from The Print Planet, Bengaluru. See wholesale prices.",
    lead: "Core sheets, overlays, and inkjet and digital fusing sheets.",
    about: [
      "A PVC card is built in layers: a printed core sheet with an overlay on each side, fused under heat and pressure.",
      "Choose inkjet or digital fusing sheets to match your printer. Ask us if you are not sure which one fits.",
    ],
    questions: [
      {
        question: "Which sheet do I need for my printer?",
        answer: "Inkjet sheets for inkjet printers, digital sheets for digital presses. Send us your printer model to confirm.",
      },
      DELIVERY,
    ],
  },
  "rfid-cansumables": {
    h1: "RFID cards and prelam sheets",
    title: "RFID Cards, Mifare Cards & Prelam Sheet Supplier",
    description:
      "RFID smart cards, Mifare 1K cards and RFID inlay prelam sheets for ID card makers, from The Print Planet, Bengaluru. See wholesale prices.",
    lead: "Mifare cards, smart cards and inlay prelam sheets.",
    about: [
      "We supply finished RFID cards for access and attendance, and inlay prelam sheets for card makers who laminate their own.",
      "Tell us your reader type and frequency so we can match the right chip.",
    ],
    questions: [
      {
        question: "Which RFID card works with my reader?",
        answer: "It depends on the reader frequency. Send us the reader model and we will confirm the chip.",
      },
      DELIVERY,
    ],
  },
  "id-card-lanyard-consumables": {
    h1: "Lanyard hooks, clamps and printing supplies",
    title: "Lanyard Hooks, Clamps, Sublimation Paper & Ink Supplier",
    description:
      "Lanyard hooks, metal clamps, side lever hooks, sublimation paper and ink for lanyard makers, from The Print Planet, Bengaluru. See wholesale prices.",
    lead: "Hooks, metal clamps, sublimation paper and sublimation ink.",
    about: [
      "Everything a lanyard maker needs after the ribbon: oval fish hooks, wire and twist hooks, side lever hooks, plastic clips and metal clamps.",
      "We also stock the sublimation paper and ink used to print lanyard rolls.",
    ],
    questions: [
      {
        question: "Which hook suits my lanyard?",
        answer: "Metal hooks suit daily wear, and plastic clips suit events. Tell us the width and we will match the fitting.",
      },
      DELIVERY,
    ],
  },
};
