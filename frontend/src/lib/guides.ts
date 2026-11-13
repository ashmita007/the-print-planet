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
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
