/**
 * Buyer guides that answer the informational searches around our products
 * (keyword data from OpenSEO, India, Nov 2026) and send readers to the matching category.
 */
export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string; // <title>, kept under 60 characters
  description: string; // meta description, under 155 characters
  h1: string;
  lead: string;
  updated: string; // ISO date
  readMinutes: number;
  sections: GuideSection[];
  related: { href: string; label: string }[];
  whatsappText: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "what-is-dragon-sheet-pvc-id-card",
    title: "What Is a Dragon Sheet? How PVC ID Cards Are Made",
    description:
      "Dragon sheets are A4 inkjet PVC sheets used to make PVC ID cards. See the layers, the fusing temperature and how one sheet becomes 10 cards.",
    h1: "What is a dragon sheet, and how are PVC ID cards made from it?",
    lead: "Most PVC ID cards printed in Indian shops start as an A4 sheet that the trade calls a dragon sheet. Here is what it is and how it turns into a finished card.",
    updated: "2026-11-13",
    readMinutes: 5,
    sections: [
      {
        heading: "What a dragon sheet is",
        paragraphs: [
          "\"Dragon sheet\" is the everyday trade name in India for an A4 PVC sheet with a coating that accepts ink from an ordinary inkjet printer. You print the card design on it, protect it with overlay film, fuse the layers together under heat and pressure, and punch out the cards.",
          "The coating is the important part. A plain PVC sheet would let ink run; the printable coating on an inkjet PVC sheet holds dye or pigment ink in place so photos and small text stay sharp.",
        ],
      },
      {
        heading: "The layers inside a finished PVC card",
        paragraphs: [
          "A standard ID card is 0.76 mm (30 mil) thick and the same size as a bank card: 85.60 × 53.98 mm, known as CR-80. It is built as a sandwich:",
        ],
        bullets: [
          "A printed PVC core sheet in the middle, usually 0.32 to 0.46 mm thick.",
          "A clear coated overlay film on the front and on the back, about 0.06 to 0.10 mm each, which protects the print from scratches and water.",
          "Optionally, a magnetic stripe already applied to the back overlay for swipe cards.",
        ],
      },
      {
        heading: "From sheet to card, step by step",
        paragraphs: [
          "One A4 sheet holds 10 CR-80 cards (2 across, 5 down), so print your layout at 100% scale, never \"fit to page\".",
        ],
        bullets: [
          "Print the front and back designs on the dragon sheet with an inkjet printer and let the ink dry completely.",
          "Place the printed sheet between overlay films and steel lamination plates. Mirror plates give a glossy finish, frosted plates a matte one.",
          "Fuse the stack in an ID card fusing machine at about 135 to 155 °C under pressure, then let it cool under pressure so the sheet stays flat.",
          "Punch the cards out with a PVC card cutter, which also forms the standard rounded corners.",
        ],
      },
      {
        heading: "Common problems and their causes",
        paragraphs: [
          "Peeling or bubbles usually mean the ink was not dry, the temperature was too low, or the cooling step was cut short. Cards that come out the wrong size almost always come from printer scaling. Warped cards point to uneven plates or cooling without pressure.",
        ],
      },
    ],
    related: [
      { href: "/categories/pvc-id-card-consumable", label: "PVC card sheets, overlays and plates" },
      { href: "/categories/machines", label: "Fusing machines and card cutters" },
      { href: "/guides/start-id-card-printing-business", label: "Guide: starting an ID card business" },
    ],
    whatsappText: "Hi The Print Planet, I need dragon sheets / PVC card sheets. Please share price and pack sizes.",
  },
  {
    slug: "start-id-card-printing-business",
    title: "Start an ID Card Printing Business: Machines & Materials",
    description:
      "What you need to start making PVC ID cards: printer, fusing machine, PVC card cutter, sheets and overlays, plus how many cards each setup can make.",
    h1: "Starting an ID card printing business: the machines and materials you need",
    lead: "Schools, offices, hospitals and factories reorder ID cards every year. This is the equipment list for making laminated PVC cards yourself instead of outsourcing them.",
    updated: "2026-11-13",
    readMinutes: 6,
    sections: [
      {
        heading: "The core setup",
        paragraphs: [
          "A laminated PVC card line needs three things: something to print the design, something to fuse the layers into one solid card, and something to cut the cards out cleanly.",
        ],
        bullets: [
          "An inkjet printer for printing on inkjet PVC (dragon) sheets.",
          "An ID card fusing machine, which bonds the printed sheet and overlay films with heat and pressure. A4 machines with several trays fuse multiple sheets per cycle.",
          "A PVC card cutter. A manual cutter punches one card at a time and suits 50 to 200 cards a day; a motorized cutter with a foot pedal handles up to about 1,200 cards an hour.",
        ],
      },
      {
        heading: "Consumables you will keep reordering",
        paragraphs: ["These are the running costs of the business, so buy them where you can reorder quickly in bulk."],
        bullets: [
          "Inkjet PVC sheets (dragon sheets) for the card core.",
          "Coated overlay film for the front and back, with or without a magnetic stripe.",
          "Stainless steel lamination plates, mirror or frosted.",
          "ID card holders, lanyards, hooks and yoyo reels, which most customers order together with the cards.",
        ],
      },
      {
        heading: "How much a setup can produce",
        paragraphs: [
          "Each A4 sheet gives 10 cards. A 10-tray fusing machine can therefore fuse up to 100 cards per cycle, and a cycle including cooling takes roughly 25 to 30 minutes. In practice the cutter and printing speed decide your daily output, which is why bureaus doing large school and corporate orders move to motorized cutters.",
        ],
      },
      {
        heading: "Adding lanyards and RFID cards",
        paragraphs: [
          "Most ID card customers also want lanyards. A lanyard heat press and sublimation paper let you print logo lanyards in-house. For access-control customers, RFID prelam sheets let you make printed smart cards with the same fusing machine.",
        ],
      },
      {
        heading: "Before you buy a machine",
        paragraphs: [
          "Ask to see the exact machine running on a live video call: the heating, the pressure and a test card being cut. Check that you get a GST invoice and that spare parts such as silicon pads are available.",
        ],
      },
    ],
    related: [
      { href: "/categories/machines", label: "ID card fusing machines, cutters and heat presses" },
      { href: "/categories/pvc-id-card-consumable", label: "PVC sheets and overlay film" },
      { href: "/guides/how-lanyards-are-printed", label: "Guide: how lanyards are printed" },
    ],
    whatsappText: "Hi The Print Planet, I want to start an ID card business. Please suggest a machine setup with prices.",
  },
  {
    slug: "how-lanyards-are-printed",
    title: "How Lanyards Are Printed: Sublimation Explained",
    description:
      "How logo lanyards are printed with sublimation: satin ribbon, sublimation paper and ink, heat press temperatures, widths and yield per 100 m roll.",
    h1: "How lanyards are printed: sublimation lanyard printing explained",
    lead: "Full-colour logo lanyards are almost always printed by sublimation. This guide covers the materials, the heat press settings and how much ribbon an order needs.",
    updated: "2026-11-13",
    readMinutes: 5,
    sections: [
      {
        heading: "How sublimation works",
        paragraphs: [
          "The design is printed in mirror image on sublimation paper with sublimation ink. The paper is pressed against white polyester satin ribbon in a heat press, and the heat turns the ink into a gas that bonds into the polyester. The print becomes part of the fabric, so it does not crack or peel.",
          "Sublimation only works on polyester and on white or very light ribbon, which is why lanyard printers use white digital satin rolls.",
        ],
      },
      {
        heading: "What you need",
        bullets: [
          "White satin lanyard ribbon rolls made for sublimation, in 12, 16, 20 or 25 mm widths.",
          "Sublimation paper rolls in a width that matches your press and printer.",
          "Sublimation ink in cyan, magenta, yellow and black.",
          "A lanyard heat press: a flatbed press for smaller batches, or a continuous roll press for long runs.",
          "Hooks, clamps and safety breakaway buckles to finish each lanyard.",
        ],
        paragraphs: [],
      },
      {
        heading: "Heat press settings",
        paragraphs: [
          "Lanyard sublimation is typically done at about 190 to 210 °C. Good sublimation ribbon is made to withstand this without shrinking or melting. Too little heat gives pale colours; too much can yellow the white areas.",
        ],
      },
      {
        heading: "Choosing a width, and how much ribbon to order",
        paragraphs: [
          "20 mm is the most popular corporate width and has room for a logo and text. 12 and 16 mm suit school and visitor lanyards, and 25 mm is used for premium event lanyards.",
          "A finished adult lanyard uses about 90 cm of ribbon plus a few centimetres for folding and fittings, so a 100 m roll makes roughly 105 to 110 lanyards.",
        ],
      },
    ],
    related: [
      { href: "/categories/indian-satin-digital-lanyard-roll", label: "Satin lanyard rolls" },
      { href: "/categories/id-card-lanyard-consumables", label: "Lanyard hooks, clamps and buckles" },
      { href: "/categories/machines", label: "Lanyard heat press machines" },
    ],
    whatsappText: "Hi The Print Planet, I need lanyard printing supplies (ribbon, sublimation paper and ink). Please share prices.",
  },
  {
    slug: "id-card-holder-types-sizes",
    title: "ID Card Holder Types & Sizes: Choosing the Right Cover",
    description:
      "ID card holders and covers compared: clear, frosted, thumb-notch, dual-pocket and yoyo reels. Sizes for CR-80 cards, portrait and landscape.",
    h1: "ID card holder types and sizes: how to choose the right holder or cover",
    lead: "Buyers call them ID card holders, ID card covers or badge holders. Here is how the common types differ and which one suits schools, offices, hospitals and events.",
    updated: "2026-11-13",
    readMinutes: 4,
    sections: [
      {
        heading: "Sizes first",
        paragraphs: [
          "Almost every ID card is CR-80: 85.6 × 54 mm, the size of a bank card. Holders come in two orientations, so match the holder to how the card is printed:",
        ],
        bullets: [
          "Vertical (portrait), about 54 × 86 mm inside, the usual choice for employee and student cards.",
          "Horizontal (landscape), about 86 × 54 mm inside, common for visitor and event badges.",
        ],
      },
      {
        heading: "The main holder types",
        paragraphs: [],
        bullets: [
          "Crystal clear rigid holders: the card stays fully visible, including photos, barcodes and holograms.",
          "Frosted or semi-transparent holders: matte, less glare, and they hide wear.",
          "Thumb-notch holders: a cut-out lets the wearer slide the card out with one thumb, useful for swipe readers.",
          "Dual-pocket holders: an RFID access card at the back and a photo ID at the front.",
          "Soft covers: cheaper and lighter, fine for short events, but they protect the card less than rigid holders.",
        ],
      },
      {
        heading: "Where yoyo reels fit in",
        paragraphs: [
          "A yoyo (retractable badge reel) clips to a belt or pocket and pulls out for scanning, then snaps back. Staff who tap an access card many times a day, such as hospital and factory workers, usually prefer a holder on a yoyo reel to a neck lanyard.",
        ],
      },
      {
        heading: "Do holders protect RFID cards?",
        paragraphs: [
          "Yes. A rigid holder stops the card from bending, which is what usually breaks the thin antenna and chip inside an RFID card. Cards still read normally through a plastic holder.",
        ],
      },
    ],
    related: [
      { href: "/categories/id-card-holder", label: "ID card holders and covers" },
      { href: "/categories/id-card-lanyard-consumables", label: "Hooks, clips and badge accessories" },
      { href: "/categories/rfid-consumables", label: "RFID cards" },
    ],
    whatsappText: "Hi The Print Planet, I need ID card holders / covers in bulk. Please share types and prices.",
  },
  {
    slug: "employee-id-card-design-size",
    title: "Employee ID Card: Size, Design Details & Print Settings",
    description:
      "What to put on an employee ID card, the exact CR-80 size in mm and pixels, bleed, print settings, and which card and holder to choose.",
    h1: "Employee ID card guide: size, what to include, and how to print it",
    lead: "Whether you print cards for your own company or for clients, these are the dimensions, design details and materials that make an employee ID card look professional and last.",
    updated: "2026-11-13",
    readMinutes: 5,
    sections: [
      {
        heading: "The standard size",
        paragraphs: [
          "Employee ID cards use the CR-80 size: 85.60 × 53.98 mm (3.375 × 2.125 inches), 0.76 mm thick, with 3.18 mm rounded corners. It is the same as a bank card, so it fits standard holders, wallets and card readers.",
        ],
      },
      {
        heading: "What to put on the card",
        paragraphs: [],
        bullets: [
          "Company name and logo.",
          "A clear, recent passport-style photo of the employee.",
          "Full name, designation and department.",
          "Employee ID number, ideally also as a barcode or QR code for attendance systems.",
          "Blood group and an emergency contact number, usually on the back.",
          "Validity or issue date, and the company address with a \"if found, please return\" line on the back.",
        ],
      },
      {
        heading: "Design and print settings",
        paragraphs: [
          "Design at 300 DPI: 1012 × 638 pixels for the card, or 1050 × 675 pixels if you add a 2 mm bleed for edge-to-edge colour. Keep text and the photo at least 3 mm inside the edge so nothing is cut off.",
          "When printing, set scaling to 100% or \"actual size\". \"Fit to page\" is the most common reason cards come out the wrong size.",
        ],
      },
      {
        heading: "Choosing the card",
        paragraphs: [],
        bullets: [
          "Laminated PVC cards (printed inkjet PVC sheet fused with overlay film) are durable, water resistant and economical in bulk.",
          "RFID cards (Mifare 1K at 13.56 MHz, or 125 kHz proximity cards) add door access and attendance tapping. They can be printed the same way using RFID prelam sheets.",
          "A magnetic stripe overlay adds swipe access without a separate step.",
        ],
      },
      {
        heading: "Holder and lanyard",
        paragraphs: [
          "Use a vertical holder for portrait cards and a dual-pocket holder if staff carry an access card as well as a photo ID. A 20 mm printed lanyard with the company logo is the usual corporate choice; add a safety breakaway buckle for factory floors.",
        ],
      },
    ],
    related: [
      { href: "/categories/pvc-id-card-consumable", label: "PVC card sheets and overlays" },
      { href: "/categories/rfid-consumables", label: "RFID and Mifare cards" },
      { href: "/categories/id-card-holder", label: "ID card holders" },
    ],
    whatsappText: "Hi The Print Planet, I need materials for employee ID cards. Please share price for bulk quantity.",
  },
  {
    slug: "inkjet-vs-digital-pvc-sheets",
    title: "Inkjet vs Digital PVC Sheets: Which Dragon Sheet to Choose?",
    description:
      "Comparison guide between inkjet dragon sheets and digital PVC sheets for ID card fusing. Learn thickness (0.76mm), print coatings, temperature, and cost.",
    h1: "Inkjet vs Digital PVC Sheets: Which Dragon Sheet is Right for You?",
    lead: "Choosing the wrong PVC card sheet leads to peeling, fading ink, or jammed printers. Here is how inkjet dragon sheets compare to digital/HP Indigo PVC sheets and which one to pick.",
    updated: "2026-11-14",
    readMinutes: 6,
    sections: [
      {
        heading: "The fundamental difference in coatings",
        paragraphs: [
          "Both inkjet dragon sheets and digital PVC sheets produce standard ISO CR-80 laminated ID cards (85.60 × 53.98 mm, 0.76 mm thickness), but they use completely different chemical coatings engineered for different printer inks.",
          "Inkjet dragon sheets feature a microporous chemical coating designed to absorb aqueous dye or pigment inks from desktop printers (Epson L8050, L18050, Canon G-series). Digital PVC sheets feature an electrophotographic priming layer formulated for liquid electro-inks (HP Indigo) or dry toners (Konica Minolta, Xerox, Ricoh).",
        ],
      },
      {
        heading: "Print quality and resolution comparison",
        paragraphs: [
          "Inkjet dragon sheets achieve up to 5760 × 1440 DPI, providing photographic gradients, skin tones, and sharp micro-text for small ID card volumes. However, the ink requires 10 to 15 minutes of complete drying time before laminating, or moisture will cause micro-bubbles during heat fusing.",
          "Digital PVC sheets cure instantly via heat fusers or laser drums. They deliver superior color consistency across long runs of 10,000+ cards and allow instantaneous collation into laminators without drying wait times.",
        ],
      },
      {
        heading: "Fusing parameters and heat tolerance",
        paragraphs: [
          "Both sheet types are fused under hydraulic or manual pressure between stainless steel lamination plates. Standard fusing parameters:",
        ],
        bullets: [
          "Fusing Temperature: 135°C to 150°C (275°F to 302°F) depending on machine plate thickness.",
          "Fusing Pressure: 0.08 to 0.12 MPa on hydraulic card laminators.",
          "Cooling Cycle: Must be cooled under pressure down to below 45°C before removing plates to prevent warping.",
        ],
      },
      {
        heading: "Cost per card and equipment investment",
        paragraphs: [
          "For commercial printers starting out, inkjet dragon sheets require minimal upfront investment—a basic 6-color photo printer, a heated fusing machine, and a manual card punch. The raw material cost comes to roughly ₹1.80 to ₹2.50 per finished laminated card.",
          "Digital press sheets require high-end production digital presses costing tens of lakhs, but scale down unit production time for mega-runs in universities and state government ID projects.",
        ],
      },
    ],
    related: [
      { href: "/categories/pvc-id-card-consumable", label: "PVC card dragon sheets and overlays" },
      { href: "/categories/machines", label: "ID card fusing machines & cutters" },
      { href: "/pvc-card-manufacturer-bangalore", label: "Bangalore PVC card manufacturing" },
    ],
    whatsappText: "Hi The Print Planet, I need wholesale pricing for Inkjet Dragon Sheets and PVC materials.",
  },
  {
    slug: "mifare-1k-vs-125khz-proximity-cards",
    title: "Mifare 1K vs 125kHz Proximity Cards: RFID Comparison Guide",
    description:
      "Understand the difference between 13.56MHz Mifare 1K smart cards and 125kHz EM-Marin proximity cards. Frequency, memory, encryption, and applications.",
    h1: "Mifare 1K vs 125kHz Proximity Cards: Which RFID Card Do You Need?",
    lead: "When setting up office attendance, biometric turnstiles, or college campus ID cards, choosing between Mifare 1K and 125kHz RFID is a critical security and hardware decision.",
    updated: "2026-11-14",
    readMinutes: 6,
    sections: [
      {
        heading: "Operating frequency: High Frequency vs Low Frequency",
        paragraphs: [
          "The core difference is operating frequency: 125 kHz is Low Frequency (LF), while 13.56 MHz (Mifare) is High Frequency (HF).",
          "125 kHz EM-Marin proximity cards operate like a broadcast beacon. When brought within 5–10 cm of an RFID reader, the card powers up via induction and transmits a factory-burned 64-bit identification number (UID).",
          "Mifare 1K cards conform to ISO/IEC 14443 Type A at 13.56 MHz. Rather than just transmitting an ID number, they establish a two-way encrypted handshake with the reader before granting access or writing data.",
        ],
      },
      {
        heading: "Memory architecture and encryption",
        paragraphs: [
          "125 kHz cards contain no user-writable memory. The number cannot be changed, encrypted, or reprogrammed. If someone copies the card with an inexpensive handheld cloner, the system cannot distinguish the duplicate from the original.",
          "Mifare 1K chips feature 1,024 bytes (1 KB) of EEPROM organized into 16 distinct sectors, each protected by two independent secret encryption keys (Key A and Key B). This allows different systems (e.g. canteen payments, library checkouts, and door locks) to access dedicated sectors securely on the same physical card.",
        ],
      },
      {
        heading: "Which card should you specify for your project?",
        paragraphs: [
          "Specification checklist based on application requirements:",
        ],
        bullets: [
          "Choose 125 kHz Proximity Cards for: Basic employee attendance logging, parking barrier boom gates, residential apartment turnstiles, and legacy door controllers where budget is the primary driver.",
          "Choose 13.56 MHz Mifare 1K for: University multi-application campus cards, cashless cafeteria payments, secure server room access, hotel guest keycards, and transit ticketing.",
        ],
      },
      {
        heading: "Printing and manufacturing RFID cards",
        paragraphs: [
          "Both chip types can be manufactured as pre-laminated plain white glossy CR-80 cards suitable for thermal ID card printers (Zebra, Fargo, Magicard), or supplied as RFID prelams (inlays) that you fuse with printed PVC dragon sheets in-house at The Print Planet.",
        ],
      },
    ],
    related: [
      { href: "/categories/rfid-consumables", label: "Mifare 1K and 125kHz RFID cards" },
      { href: "/categories/pvc-id-card-consumable", label: "CR-80 PVC core sheets and overlays" },
      { href: "/pricing", label: "Wholesale RFID card price slabs" },
    ],
    whatsappText: "Hi The Print Planet, I need a quotation for Mifare 1K / 125kHz proximity cards in bulk.",
  },
  {
    slug: "pvc-card-and-lanyard-artwork-templates-dimensions",
    title: "PVC Card & Lanyard Dimensions: Prepress Artwork Guidelines",
    description:
      "Exact CR-80 card dimensions in mm, inches, and 300 DPI pixels (1012x638). Lanyard templates for 12mm, 16mm, 20mm, and 25mm spools with stitching bleed.",
    h1: "PVC Card & Lanyard Artwork Dimensions & Prepress Template Guide",
    lead: "Avoid rejected prints and cut-off text. Here are the exact pixel dimensions, bleeds, safe margins, and resolution formulas for standard CR-80 ID cards and satin lanyards.",
    updated: "2026-11-14",
    readMinutes: 6,
    sections: [
      {
        heading: "CR-80 PVC ID Card Standard Dimensions (ISO/IEC 7810)",
        paragraphs: [
          "Commercial PVC ID cards follow the global ISO/IEC 7810 ID-1 (CR-80) specification—identical to standard bank credit cards, Aadhaar PVC cards, and driving licenses.",
        ],
        bullets: [
          "Physical Trim Size: 85.60 mm × 53.98 mm (3.370 × 2.125 inches).",
          "Thickness: 0.76 mm (30 mil / 760 microns).",
          "Corner Radius: 3.18 mm (1/8 inch rounded corners).",
          "Canvas Resolution: Strictly 300 DPI minimum for crisp text and barcodes.",
          "Trim Canvas (No Bleed): 1012 × 638 pixels.",
          "Production Canvas (With 2mm Bleed): 1050 × 675 pixels (89.60 × 57.98 mm).",
          "Safe Text Margin: Keep all essential text, logos, and photos at least 3.5 mm (42 pixels) inside the trim line.",
        ],
      },
      {
        heading: "Satin Lanyard Prepress Dimensions & Repeat Step",
        paragraphs: [
          "Sublimation and screen printed lanyards require continuous repeat graphic setups calibrated to the physical ribbon width and finished neck loop circumference.",
        ],
        bullets: [
          "Finished Adult Lanyard Length: 900 mm (450 mm folded drop length).",
          "Total Artwork Strip Length: 920 mm to 940 mm (including 20–40mm sewing and clamp seam allowances).",
          "12 mm Width Canvas: 12 mm printable width (artwork width 12mm, canvas 14mm with 1mm edge bleed on top and bottom).",
          "16 mm Width Canvas: 16 mm printable width (artwork width 16mm, canvas 18mm with 1mm bleed).",
          "20 mm Width Canvas: 20 mm printable width (artwork width 20mm, canvas 22mm with 1mm bleed).",
          "25 mm Width Canvas: 25 mm printable width (artwork width 25mm, canvas 27mm with 1mm bleed).",
          "Logo Spacing & Repeat: Typical corporate logo interval is 80 mm to 120 mm center-to-center repeat.",
        ],
      },
      {
        heading: "Color Modes & Vector Prepress Rules",
        paragraphs: [
          "All artwork files submitted for production must adhere to prepress commercial standards:",
        ],
        bullets: [
          "Color Space: Convert all vector files to CMYK mode (FOGRA39 or US Web Coated SWOP). Avoid RGB color spaces to prevent muddy color shifts on press.",
          "Font Handling: Outline all typography (Convert to Curves in CorelDRAW Ctrl+Q, or Create Outlines in Illustrator Shift+Ctrl+O) to avoid missing font errors.",
          "Barcodes & QR Codes: Barcodes must be pure 100% Black (K:100, C:0, M:0, Y:0) and generated as vector elements with quiet zones.",
          "Supported File Types: Vector PDF, Adobe Illustrator (.AI), CorelDRAW (.CDR up to version 2024), or uncompressed TIFF (300 DPI).",
        ],
      },
      {
        heading: "Multi-Up A4 Dragon Sheet Layout (Inkjet Printing)",
        paragraphs: [
          "When printing on A4 inkjet dragon sheets (210 × 297 mm), set up a 10-up layout (2 columns × 5 rows) with 2 mm horizontal and vertical gutter spacing. Always print at 100% scale with printer margins set to 'Zero Margins' or 'Borderless'—never select 'Fit to Printable Area', which shrinks cards by 3–5%.",
        ],
      },
    ],
    related: [
      { href: "/categories/pvc-id-card-consumable", label: "PVC card core sheets and overlays" },
      { href: "/categories/indian-satin-digital-lanyard-roll", label: "Satin lanyard ribbon spools" },
      { href: "/quote", label: "Submit artwork for quotation" },
    ],
    whatsappText: "Hi The Print Planet, I need artwork templates and wholesale material pricing for CR-80 cards and lanyards.",
  },
  {
    slug: "how-to-print-pvc-id-cards-epson-printer-settings",
    title: "How to Print PVC ID Cards on Epson Printers: Settings Guide",
    description:
      "Complete guide to printing PVC ID cards and dragon sheets on Epson L8050, L18050, and L805. Paper type, driver settings, tray vs fusing, and resolution.",
    h1: "How to Print PVC ID Cards on Epson Printers: Driver Settings & Paper Guide",
    lead: "Whether printing on direct PVC card trays or A4 dragon sheets for lamination, these exact Epson driver settings prevent smudging, faded colors, and card misalignment.",
    updated: "2026-11-14",
    readMinutes: 6,
    sections: [
      {
        heading: "Two Methods: Direct PVC Card Tray vs A4 Fusing Dragon Sheets",
        paragraphs: [
          "Commercial print shops and cyber cafes print PVC cards using one of two methods on Epson 6-colour EcoTank printers (such as Epson L8050, L18050, and L805):",
          "Method 1: Direct PVC Card Tray Printing. You insert a dedicated PVC card tray holding two pre-cut inkjet-coated PVC cards directly into the printer's CD/DVD tray slot.",
          "Method 2: Multi-Layer A4 Dragon Sheet Fusing. You print a 10-up card layout onto an A4 inkjet PVC core sheet, laminate it with protective overlay film in a heated fusing machine (140°C), and punch out finished cards with a die-cutter. This method produces cards that are 100% waterproof, scratch-proof, and identical to bank ATM cards.",
        ],
      },
      {
        heading: "Recommended Epson Driver Settings for Dragon Sheets",
        paragraphs: [
          "When printing on A4 inkjet dragon sheets (printable PVC core), configure your Epson printer driver as follows:",
        ],
        bullets: [
          "Paper Type: Select 'Epson Ultra Glossy' or 'Epson Premium Glossy'. Do not select 'Plain Paper' (which deposits too little ink) or 'Matte' (which oversaturates and causes ink bleeding).",
          "Print Quality: Set to 'High' or 'Best Photo' (Photo RPM 5760 × 1440 DPI).",
          "Mirror Image: Leave OFF unless your specific brand of reverse-print overlay instructs mirror printing. (The Print Planet dragon sheets print right-reading on the coated side).",
          "High Speed / Bi-Directional: Turn OFF 'High Speed' in More Options. Unidirectional printing prevents micro-banding and ensures crisp micro-text on employee ID badges.",
          "Color Correction: Select 'Color Controls' → 'Adobe RGB' or 'Epson Vivid' with Gamma 2.2 for photographic skin tone reproduction.",
        ],
      },
      {
        heading: "Drying Time and Fusing Temperature Protocol",
        paragraphs: [
          "After printing on the dragon sheet, allow the ink to dry completely for 10 to 15 minutes in a low-humidity room. Rushing the sheet into the fusing laminator while ink moisture remains will cause micro-bubbles and cloudy patches under the overlay.",
          "Set the heated fusing laminator to 135°C to 148°C. Maintain pressure for 12 to 14 minutes, then transfer to the water-cooled platen under continuous pressure down to 40°C to guarantee mirror-flat finished cards.",
        ],
      },
      {
        heading: "Epson Direct PVC Card Tray Printing Settings",
        paragraphs: [
          "If using a 2-card PVC tray on Epson L8050 or L805:",
        ],
        bullets: [
          "Document Size: Select 'A4' or custom tray layout matching your PVC tray software.",
          "Paper Source: Select 'CD/DVD Tray'.",
          "Media Type: 'CD/DVD Premium Surface' or 'Epson Matte'.",
          "Card Surface Requirement: Only pre-cut PVC cards with a factory-applied inkjet receiver coating can be used. Thermal or plain blank plastic cards will not hold inkjet ink and will smudge immediately.",
        ],
      },
    ],
    related: [
      { href: "/categories/pvc-id-card-inkjet-fusing-sheets", label: "A4 inkjet dragon sheets (50 sets/box)" },
      { href: "/categories/motorized-pvc-id-card-cutting-machine-for-id-card", label: "Motorized PVC card die cutters" },
      { href: "/categories/machines", label: "ID card fusing laminator machines" },
      { href: "/pvc-card-manufacturer-bangalore", label: "Bangalore PVC card manufacturing facility" },
    ],
    whatsappText: "Hi The Print Planet, I need wholesale pricing for inkjet dragon sheets and ID card printing consumables.",
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
