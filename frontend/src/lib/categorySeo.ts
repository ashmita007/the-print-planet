export interface CategorySeo {
  h1: string;
  title: string;
  description: string;
  lead: string;
  about: string[];
  questions: { question: string; answer: string }[];
}

const DELIVERY = {
  question: "How fast do you dispatch ID card materials across India?",
  answer:
    "All stock consumables, lanyards and card holders are dispatched within 24 to 48 hours directly from our central facility in Sunkadakatte, Bengaluru (Pin 560091) via DTDC, Blue Dart, VRL Logistics, and TCI Express with 100% GST tax invoices.",
};

/** Buyer-facing copy and Google People-Also-Ask (PAA) question bank for the main product families. */
export const CATEGORY_SEO: Record<string, CategorySeo> = {
  "id-card-holder": {
    h1: "ID card holders and covers",
    title: "ID Card Holder & ID Card Cover Wholesale Supplier India",
    description:
      "Wholesale ID card holders and ID card covers from The Print Planet, Bengaluru: crystal clear, frosted, thumb-notch and dual-pocket. Bulk cartons for schools and offices.",
    lead: "Crystal clear, semi-transparent frosted, thumb-notch sliding, and dual-slot proximity card holders.",
    about: [
      "Our ID card holders are injection-molded from virgin optical-grade polymer and shatterproof polycarbonate, strictly engineered to fit standard ISO/IEC 7810 ID-1 (CR-80) credentials measuring 85.60 mm by 53.98 mm.",
      "Clear rigid holders display photo IDs without color distortion, while frosted thumb-notch holders allow users to slide cards out quickly for RFID tap sensors or magnetic stripe swipe readers.",
      "Manufactured in high-volume production batches for schools, IT corporate campuses, hospitals, and security contractors across India.",
    ],
    questions: [
      {
        question: "Is an ID card holder the same as an ID card cover?",
        answer:
          "Yes. Buyers in India use both names for the same thing: a clear or frosted case that holds a CR-80 ID card and hangs from a lanyard or clips to clothing. Rigid holders protect the card best; soft covers are cheaper for short-term use such as events. A retractable yoyo reel can be added for staff who tap or swipe their card often.",
      },
      {
        question: "What is the standard size for rigid PVC ID card holders?",
        answer:
          "Standard ID card holders are calibrated for ISO CR-80 cards measuring 85.6 mm × 54 mm (3.375 × 2.125 inches) with a 0.76 mm (30 mil) card thickness. Both Vertical (Portrait: 54 × 86 mm) and Horizontal (Landscape: 86 × 54 mm) configurations are stocked.",
      },
      {
        question: "What is the difference between crystal clear and semi-transparent frosted holders?",
        answer:
          "Crystal clear holders are made from high-transparency polycarbonate to ensure full visibility of employee barcodes, holographic seals, and photos. Semi-transparent frosted holders feature an anti-glare matte finish with a curved thumb-notch cutout, allowing convenient one-handed card extraction for turnstiles and swipe readers.",
      },
      {
        question: "Can an ID card holder protect RFID and proximity smart cards?",
        answer:
          "Yes. Rigid holders protect internal RFID copper antenna coils and silicon microchips from bending, cracking, and water exposure. We also supply dual-slot holders designed to hold an RFID access badge in the rear pocket and a visual photo badge in the front pocket simultaneously.",
      },
      {
        question: "Can I get physical samples before placing a bulk institutional order?",
        answer:
          "Yes. Physical sample packs containing vertical, horizontal, frosted, and dual-card holders can be dispatched immediately to educational institutions, gifting firms, and corporate buyers upon request.",
      },
      DELIVERY,
    ],
  },

  "pvc-id-card-consumable": {
    h1: "PVC ID card sheets (dragon sheets) and materials",
    title: "PVC Cards, Dragon Sheets & ID Card Materials Wholesale Bangalore",
    description:
      "Direct factory wholesale supplier of PVC cards, CR-80 blank card sheets, dragon sheets, magnetic overlays, and card fusing materials in Bangalore. 24–48h pan-India dispatch.",
    lead: "Inkjet and digital printable PVC core sheets, coated magnetic overlays, and mirror/frosted lamination plates.",
    about: [
      "A standard 0.76 mm (30 mil) laminated PVC ID card is engineered as a multi-layer composite: a printed PVC core sheet (typically 300 to 460 microns) sandwiched between two transparent protective coated overlay films (60 to 100 microns each), fused under heat and pressure.",
      "Inkjet printable PVC sheets feature a specialized silica receptive coating that accepts liquid dye or pigment inks from desktop printers without bleeding, while digital sheets are optimized for toner and liquid electrophotographic presses.",
      "We supply high-coercivity (Hi-Co 2750 Oe) and low-coercivity (Lo-Co 300 Oe) magnetic stripe overlay sheets and hardened stainless steel lamination plates in mirror and frosted finishes.",
    ],
    questions: [
      {
        question: "What is a dragon sheet for ID cards?",
        answer:
          "\"Dragon sheet\" is the common trade name in India for A4 inkjet printable PVC sheets. You print the card design on the sheet with an inkjet printer, cover it with overlay film, fuse it in an ID card fusing machine, and punch out finished cards with a PVC card cutter. One A4 sheet gives 10 standard CR-80 cards.",
      },
      {
        question: "What is the layer structure of a standard 0.76mm (30 mil) PVC ID card?",
        answer:
          "A standard CR-80 card is typically built as a 3-layer or 5-layer composite sandwich: a central printed PVC core sheet (0.32mm to 0.46mm thick) sandwiched between two clear protective coated overlay films (0.06mm to 0.10mm thick each). When heat-fused in a laminator, the layers melt together into a solid 0.76mm (30 mil) credit-card thickness.",
      },
      {
        question: "What is the difference between inkjet PVC sheets and digital fusing sheets?",
        answer:
          "Inkjet PVC sheets have a micro-porous silica coating that absorbs liquid water-based dye or pigment inks from desktop printers (such as Epson L8050 or Canon). Digital PVC fusing sheets have heat-resistant surface treatments calibrated for digital toner presses (Konica Minolta, Xerox, Ricoh) and will not blister during high-temperature fusion.",
      },
      {
        question: "What is the function of coated overlay film with magnetic stripe?",
        answer:
          "Coated overlay film provides scratch protection, UV resistance, and water resistance for the printed image beneath it. When pre-applied with a magnetic stripe (Hi-Co 2750 Oe), it allows ID card bureaus to produce access control and swipe-card credentials without secondary stamping.",
      },
      {
        question: "What lamination plates are best for card finishing?",
        answer:
          "Hardened stainless steel lamination plates. Mirror finish plates produce ultra-glossy, credit-card style reflective cards, while frosted (matte) plates produce non-reflective, anti-scratch satin texture cards favored for corporate executive badges.",
      },
      DELIVERY,
    ],
  },

};

/**
 * Categories added after the first batch. Every price, size, MOQ and model named here comes from
 * the live catalogue; general facts (CR-80 card size, RFID frequencies) are industry standards.
 */
const MORE_CATEGORY_SEO: Record<string, CategorySeo> = {
  "coated-overlay-sheets-for-pvc-id-card": {
    h1: "Coated overlay sheets for PVC ID cards",
    title: "Coated Overlay Sheet for PVC ID Card, A4 & A3",
    description:
      "Coated overlay film for PVC ID card fusing in 60, 80 and 100 micron, A4, A3 and large formats. From ₹3.50 a sheet, MOQ 500 to 1,000. Bengaluru supplier.",
    lead: "Clear overlay film in 60, 80 and 100 micron, fused over the printed core to protect the card face.",
    about: [
      "Overlay is the clear top and bottom layer of a fused PVC card. It goes over the printed core sheet in the fusing machine and protects the print from scratches and wear.",
      "We stock coated overlay in 60, 80 and 100 micron, in A4 and A3, plus 310 × 470 mm and 297 × 480 mm sheets for larger laminators. Listed prices run from ₹3.50 (60 micron A4) to ₹9.50 (80 micron large sheets), with minimum orders of 500 or 1,000 sheets.",
      "Thicker overlay gives a stiffer, longer-lasting card. Match the sheet size to your laminator plates and core sheets.",
    ],
    questions: [
      {
        question: "Which overlay thickness should I use?",
        answer: "60, 80 and 100 micron are all stocked. Thicker overlay makes a stiffer, more durable card; match it to the total card thickness you want.",
      },
      {
        question: "What sheet sizes are available?",
        answer: "A4, A3, 310 × 470 mm and 297 × 480 mm.",
      },
      {
        question: "What is the price of overlay sheets?",
        answer: "From ₹3.50 per sheet for 60 micron A4 up to ₹9.50 for 80 micron large-format sheets, before GST.",
      },
    ],
  },
};

Object.assign(CATEGORY_SEO, MORE_CATEGORY_SEO);

// Ranges added from the owner's product sheet (Nov 2026). Prices and specs are quoted per order,
// so this copy sticks to what each range is for and what to send for a quote.
const SHIPS = {
  question: "Do you supply outside Bengaluru?",
  answer: "Yes. Orders ship from Sunkadakatte, Bengaluru to anywhere in India, with a GST invoice.",
};

const SHEET_CATEGORY_SEO: Record<string, CategorySeo> = {
  "pvc-and-smart-cards": {
    h1: "PVC and smart cards",
    title: "PVC Cards, RFID and Smart Cards Supplier Bangalore",
    description:
      "Blank and printed PVC cards, RFID, NFC and proximity cards, ID, membership, loyalty and gift cards. Bulk quotes from Bengaluru with GST invoice.",
    lead: "Plain cards for your own card printer, or cards printed to your design, with RFID, NFC, QR codes or serial numbers when you need them.",
    about: [
      "Plain PVC cards suit offices and card shops that print in-house on a desktop ID card printer. Pre-printed cards are made to your artwork and arrive ready to use.",
      "Chip cards come in the common frequencies: 125 kHz proximity cards for older access systems, 13.56 MHz MIFARE and NFC cards for newer readers, and UHF for long-range reading. Check which one your reader uses before ordering.",
      "Membership, loyalty, gift and warranty cards can carry a QR code, barcode or running serial number so each card is unique.",
    ],
    questions: [
      { question: "What size is a standard PVC ID card?", answer: "The standard is CR-80: 85.6 x 54 mm, the same size as a bank card." },
      { question: "Which RFID card works with my access system?", answer: "It depends on your reader: 125 kHz for proximity readers, 13.56 MHz for MIFARE and NFC readers. Share your reader model on WhatsApp (+91 97418 08034) and we confirm the match." },
      { question: "Can each card carry a different number or QR code?", answer: "Yes. Send the list of numbers or data with your artwork and each card is printed with its own code." },
      SHIPS,
    ],
  },
  "lens-packaging-products": {
    h1: "Lens packaging for optical stores",
    title: "Lens Envelopes and Optical Bags Supplier Bangalore",
    description:
      "M-fold lens envelopes (plain, printed, glassine lined), optical bags, lens pouches and biodegradable ziplock covers. Wholesale from Bengaluru.",
    lead: "Envelopes, bags and pouches that keep spectacle lenses clean and scratch-free from the lab to the customer.",
    about: [
      "M-fold lens envelopes are the standard way to store and hand over lenses. Glassine-lined envelopes add a smooth inner layer against scratches.",
      "Printed envelopes and optical bags carry your shop name and contact details, so every pair that leaves the store promotes it.",
      "Biodegradable ziplock covers are an option for stores that want to cut plastic.",
    ],
    questions: [
      { question: "Can lens envelopes be printed with my shop name?", answer: "Yes. Send your logo and shop details with the quantity and we quote for printed envelopes or bags." },
      { question: "What is the difference between plain and glassine M-fold envelopes?", answer: "Glassine envelopes have a smooth, lint-free inner layer that gives the lens surface extra protection. Plain envelopes are the economical everyday choice." },
      SHIPS,
    ],
  },
  "lens-cleaning-solutions": {
    h1: "Lens cleaning solutions",
    title: "Lens Wipes, Cleaning Spray and Microfiber Cloth Supplier",
    description:
      "Pre-moistened lens wipes, lens cleaning and anti-fog sprays, microfiber cloths, optical tissues and cleaning kits, plain or with your brand.",
    lead: "Lens care products for optical stores to use, sell or give away with every pair of glasses.",
    about: [
      "Pre-moistened wipes and sprays clean spectacles, sunglasses and screens. Anti-fog solutions help glasses stay clear when wearing a mask or moving between cold and warm air.",
      "Microfiber cloths can be printed with your store name, which makes them a low-cost giveaway customers keep for years.",
      "Cleaning kits combine a spray, a cloth and a pouch in one pack for retail counters.",
    ],
    questions: [
      { question: "Can microfiber cloths be printed with our logo?", answer: "Yes. Custom-branded cloths are available. Send the size, quantity and your logo for a quote." },
      { question: "Do you supply in bulk to optical stores and chains?", answer: "Yes. Send the products and quantities you need and we reply with a wholesale quote." },
      SHIPS,
    ],
  },
  "id-card-printers-and-consumables": {
    h1: "ID card printers and consumables",
    title: "ID Card Printer, Ribbons and Consumables Supplier Bangalore",
    description:
      "Direct-to-card and retransfer ID card printers, ribbons, blank cards, overlays, laminators, encoders, card readers and software, with setup support.",
    lead: "Everything for printing ID cards in-house: the printer, the ribbons and cards it uses, and help getting it running.",
    about: [
      "Direct-to-card printers print straight onto the card and suit most office and school ID cards. Retransfer printers print onto a film first, which covers the card edge to edge and works better on uneven chip cards.",
      "Single-sided printers handle photo ID cards; dual-sided printers add details or a barcode on the back. RFID and smart card printers can encode the chip while printing.",
      "Ribbons, cleaning kits, holographic overlays, laminators, design software, encoders and USB readers complete the setup.",
    ],
    questions: [
      { question: "Should I buy a direct-to-card or a retransfer printer?", answer: "Direct-to-card is the economical choice for standard PVC ID cards. Retransfer gives edge-to-edge print and better results on chip and proximity cards." },
      { question: "Do you help with installation and training?", answer: "Yes. Installation, training and technical support are available. Tell us your location and the printer model." },
      { question: "Which ribbon does my card printer use?", answer: "Ribbons are specific to each printer model. Share your printer model on WhatsApp (+91 97418 08034) and we confirm the right ribbon." },
      SHIPS,
    ],
  },
  "id-card-accessories": {
    h1: "ID card accessories",
    title: "ID Card Accessories: Lanyards, Clips, Hooks and Reels",
    description:
      "Lanyards, ID card sleeves, badge clips, metal, snap and swivel hooks, card reels, neck and wrist straps for offices, schools and events.",
    lead: "The parts that hold an ID card: lanyards, clips, hooks, reels, straps and sleeves.",
    about: [
      "Choose the attachment by how the card is worn: a lanyard with a hook for daily wear, a badge clip for shirts and coats, or a retractable reel for cards that are swiped often.",
      "Sleeves protect printed cards from scratches and bending.",
      "ID card printers and resellers buy these in bulk to supply complete ID card kits.",
    ],
    questions: [
      { question: "Do you sell lanyard hooks and clips separately?", answer: "Yes. Hooks, clips and reels are sold on their own for lanyard makers and ID card printers." },
      SHIPS,
    ],
  },
  lanyards: {
    h1: "Lanyards",
    title: "Printed and Plain Lanyards Supplier Bangalore",
    description:
      "Polyester, nylon, satin, woven and eco-friendly lanyards, printed with your logo, with hook, clip, buckle, breakaway and badge reel options.",
    lead: "Finished lanyards for staff, students and events, plain or printed with your logo.",
    about: [
      "Polyester and satin lanyards take full-colour printed logos. Woven and tubular lanyards suit simple, long-lasting designs.",
      "Breakaway lanyards release under a sharp pull, a safety feature for schools, hospitals and factories. Double-ended lanyards hold the card flat at both corners.",
      "Fittings include metal hooks, plastic clips, buckles and retractable badge reels.",
    ],
    questions: [
      { question: "Can you print our logo on the lanyards?", answer: "Yes. Send your logo, the lanyard width, colour and quantity, and we share a quote and a digital proof." },
      { question: "What is a breakaway lanyard?", answer: "A lanyard with a safety clasp that opens when pulled hard, so it cannot choke the wearer if caught in a machine or door." },
      SHIPS,
    ],
  },
  "commercial-printing-solutions": {
    h1: "Commercial printing in Bengaluru",
    title: "Offset and Digital Printing Services Bangalore",
    description:
      "Offset and digital printing for brochures, business cards, stationery, packaging, labels and event material, with lamination, foiling and binding.",
    lead: "Print jobs from short digital runs to large offset runs, finished and packed for delivery.",
    about: [
      "Offset printing has a set-up cost but a low cost per piece, so it suits large quantities of brochures, books, calendars and packaging.",
      "Digital printing has no plate set-up, so it suits short runs, urgent jobs and prints where every piece is different (names, numbers, addresses).",
      "Finishing such as lamination, spot UV, foiling, die-cutting and binding can be added before the job is packed.",
    ],
    questions: [
      { question: "Should I choose offset or digital printing?", answer: "For a few hundred pieces or personalised prints, digital is usually cheaper and faster. For large quantities, offset gives a lower price per piece. Send your quantity and we suggest the better option." },
      { question: "What file should I send for printing?", answer: "A print-ready PDF at the final size with bleed. If you only have a design idea or a logo, send that and we can guide you." },
      SHIPS,
    ],
  },
  "offset-printing": {
    h1: "Offset printing",
    title: "Offset Printing Services Bangalore",
    description:
      "Offset printing for brochures, catalogues, flyers, business cards, letterheads, books, calendars, packaging boxes and labels. Quotes from Bengaluru.",
    lead: "Offset printing for larger runs where consistent colour and a low price per piece matter.",
    about: [
      "Offset suits brochures, catalogues, company profiles, magazines, books, calendars, diaries and stationery printed in hundreds or thousands.",
      "Packaging boxes, cartons, labels and tags are also printed offset and then die-cut to shape.",
      "Send the size, paper, quantity and artwork for a quote.",
    ],
    questions: [
      { question: "What is the minimum quantity for offset printing?", answer: "Offset becomes economical at larger quantities. Share your quantity and we tell you whether offset or digital is the better choice." },
      SHIPS,
    ],
  },
  "digital-printing": {
    h1: "Digital printing",
    title: "Digital Printing Services Bangalore",
    description:
      "Short-run brochures and flyers, business cards, stickers, posters, banners, certificates, invitations, photo books and variable-data printing.",
    lead: "Digital printing for short runs, quick jobs and personalised prints.",
    about: [
      "Digital printing needs no printing plates, so small quantities cost less and jobs are ready sooner.",
      "Variable-data printing puts a different name, number, QR code or address on each piece, used for direct mail, certificates and event passes.",
      "Proofs and sample prints let you check colour and layout before a large run.",
    ],
    questions: [
      { question: "Can each print carry a different name or number?", answer: "Yes. Variable-data printing prints each piece with its own details from your Excel list." },
      SHIPS,
    ],
  },
  "finishing-and-conversion": {
    h1: "Print finishing and conversion",
    title: "Lamination, Spot UV, Foiling and Binding Services",
    description:
      "Lamination, UV and spot UV, foiling, embossing, die-cutting, binding, folding, perforation, cutting and packing for printed jobs in Bengaluru.",
    lead: "The steps after printing that make a job look finished and ready to hand out.",
    about: [
      "Lamination and UV coating protect printed surfaces. Spot UV, foiling and embossing add shine or texture to logos and headings.",
      "Die-cutting gives custom shapes for boxes, tags and cards. Folding, creasing, perforation, collating and binding turn sheets into leaflets, booklets and calendars.",
      "Jobs are cut, trimmed and packed for dispatch.",
    ],
    questions: [
      { question: "Do you finish jobs printed elsewhere?", answer: "Send the details of the printed sheets and the finish you need, and we confirm whether we can take it on." },
      SHIPS,
    ],
  },
};

Object.assign(CATEGORY_SEO, SHEET_CATEGORY_SEO);
