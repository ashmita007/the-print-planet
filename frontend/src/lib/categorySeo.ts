export interface CategorySeo {
  h1: string;
  title: string;
  description: string;
  lead: string;
  about: string[];
  questions: { question: string; answer: string }[];
}

const DELIVERY = {
  question: "How fast do you dispatch ID card materials and machinery across India?",
  answer:
    "All stock consumables, lanyard rolls, card holders, and machinery are dispatched within 24 to 48 hours directly from our central facility in Sunkadakatte, Bengaluru (Pin 560091) via DTDC, Blue Dart, VRL Logistics, and TCI Express with 100% GST tax invoices.",
};

/** Buyer-facing copy and Google People-Also-Ask (PAA) question bank for the main product families. */
export const CATEGORY_SEO: Record<string, CategorySeo> = {
  machines: {
    h1: "ID card and lanyard machines",
    title: "ID Card Fusing Machine, PVC Card Cutter & Heat Press India",
    description:
      "ID card fusing machines, PVC card cutters (manual and motorized) and lanyard heat press machines from The Print Planet, Bengaluru. Live video demo before dispatch.",
    lead: "Heavy-duty fusing laminators, motorized card cutters, hot foil stamping, and rotary lanyard press machinery.",
    about: [
      "A commercial ID card manufacturing line consists of two core units: a heated fusing laminator to bond multi-layer printed PVC sheets under pressure, and an industrial die-cutter to punch burr-free ISO CR-80 cards with standard 3.18mm rounded corners.",
      "Lanyard printing operations utilize roll-to-roll or flatbed heat press machines to transfer multi-colour sublimation graphics at 190°C–210°C onto polyester satin ribbons.",
      "The Print Planet supplies manual tabletop equipment for startup print studios as well as heavy-duty motorized production lines capable of 1,200 cards per hour for commercial card bureaus.",
    ],
    questions: [
      {
        question: "What machines are required to start a PVC ID card printing business?",
        answer:
          "A commercial PVC card production setup requires: 1) a dual-plate heated PVC fusing laminator (to fuse inkjet/digital core sheets with protective overlay film under 135°C–155°C heat and hydraulic pressure), and 2) a motorized or manual CR-80 card die cutter (to punch finished 85.6 × 54 mm cards with rounded corners). For lanyard making, a heat-press sublimation machine is added.",
      },
      {
        question: "What is an ID card fusing machine and what temperature should be used?",
        answer:
          "An ID card fusing machine bonds multi-layer PVC sandwich sheets (printed core plus front and back magnetic or clear overlay films) into a solid 0.76mm (30 mil) composite card. The optimal fusing temperature is between 135°C and 155°C maintained for 12–15 minutes under 6–8 MPa pressure, followed by a water-cooled plate cycle to prevent card distortion.",
      },
      {
        question: "How many cards can an A4 PVC fusing machine produce per cycle?",
        answer:
          "An industrial A4 fusing laminator accommodates multiple steel lamination trays simultaneously (typically 5 to 10 openings). Each A4 sheet yields 10 standard CR-80 cards. A standard 10-layer machine therefore produces up to 100 finished ID cards per 25–30 minute heating and cooling cycle.",
      },
      {
        question: "What is the difference between a manual hand cutter and a motorized PVC card die cutter?",
        answer:
          "A manual desktop punch uses a hand lever to cut one card at a time (suitable for 50–200 cards/day). A motorized electric die cutter uses a hardened alloy punch powered by an electric motor with foot pedal operation, punching up to 1,200 cards per hour with consistent ISO-standard burr-free edge quality and zero operator fatigue.",
      },
      {
        question: "Which heat press machine is used for lanyard printing?",
        answer:
          "Lanyards are printed by sublimation: the design is printed on sublimation paper, then a heat press transfers it onto white satin ribbon. A flatbed press such as the DCT250 suits smaller batches, while a continuous roll press such as the DCT450 prints long ribbon runs for bulk lanyard orders. Both use the same sublimation paper rolls and inks we stock.",
      },
      {
        question: "Can I inspect the machine working on live video before dispatch?",
        answer:
          "Yes. The Print Planet conducts live WhatsApp video machine testing (+91 97418 08034) with every buyer prior to packaging, demonstrating operational heating, smooth hydraulic pressure, and sample card punch accuracy before timber crating.",
      },
      DELIVERY,
    ],
  },

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

  "indian-satin-digital-lanyard-roll": {
    h1: "Satin lanyard rolls",
    title: "Satin Lanyard Roll Manufacturer & Wholesale Supplier India",
    description:
      "12mm, 16mm, 20mm, 25mm virgin polyester satin lanyard ribbon rolls for sublimation heat transfer and screen printing from The Print Planet, Bengaluru. Factory prices.",
    lead: "Ultra-white sublimation rolls and pre-dyed Indian satin ribbon rolls in 12mm, 16mm, 20mm, and 25mm widths.",
    about: [
      "White digital sublimation lanyard rolls feature a high-density, calendar-finished virgin continuous polyester weave that resists heat up to 220°C, ensuring sharp line definition and brilliant Pantone color reproduction with zero dye migration.",
      "Pre-dyed Indian satin ribbon rolls are formulated for silk-screen printing with spot colors, available in Royal Blue, Navy, Black, Crimson Red, Forest Green, Golden Yellow, and Maroon.",
      "Supplied in continuous industrial spools of 50m, 100m, and 500m with thermally-sealed burr-free edges that will not fray during automated cutting.",
    ],
    questions: [
      {
        question: "What is the standard ribbon width for corporate and student lanyards?",
        answer:
          "The industry standard widths are: 12 mm and 16 mm (ideal for lightweight visitor badges and school neckbands), 20 mm (the most popular corporate standard for multi-color company logos), and 25 mm (wide format for premium executive lanyards and conference branding).",
      },
      {
        question: "How many finished neck lanyards can be produced from a 100-meter spool?",
        answer:
          "A standard adult lanyard measures 90 cm (36 inches) in finished ribbon length. Allowing for heat-cutting, stitching, and hardware fold margins (approx. 92–94 cm per lanyard), a single 100-meter continuous spool yields approximately 105 to 110 completed lanyards.",
      },
      {
        question: "Which satin ribbon roll is best for sublimation heat-transfer printing?",
        answer:
          "White Digital Sublimation Lanyard Rolls woven from 100% virgin continuous-filament polyester with a calendar-pressed smooth surface. They withstand 200°C–215°C heat press exposure without melting or shrinking, delivering deep ink absorption and photographic print clarity.",
      },
      {
        question: "Can you match specific Pantone Hexachrome brand colours?",
        answer:
          "Yes. Our digital sublimation grade ribbon has a 99.2% CIE whiteness index, calibrated specifically for accurate Pantone color matching when paired with quality sublimation transfer inks.",
      },
      DELIVERY,
    ],
  },

  "pvc-id-card-consumable": {
    h1: "PVC ID card sheets (dragon sheets) and materials",
    title: "PVC Card Sheets, Dragon Sheets & Overlay Film Supplier India",
    description:
      "Inkjet PVC card sheets (dragon sheets), PVC core sheets, overlay films and lamination plates for ID card fusing, from The Print Planet, Bengaluru. Bulk packs.",
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

  "rfid-cansumables": {
    h1: "RFID cards and prelam sheets",
    title: "RFID Smart Cards, Mifare 1K & Proximity Cards Supplier India",
    description:
      "RFID cards: 13.56MHz Mifare 1K, 125kHz EM proximity cards, RFID and NTAG216 NFC prelam sheets from The Print Planet, Bengaluru. Bulk supply with GST invoice.",
    lead: "High-frequency Mifare 1K smart cards, 125kHz proximity access cards, and embedded antenna prelam sheets.",
    about: [
      "The Print Planet supplies finished contactless smart cards compliant with ISO/IEC 14443 Type A (13.56MHz) and EM4100/EM4200 (125kHz) standards for enterprise physical access, attendance turnstiles, and cashless campus management.",
      "Manufactured with premium ultra-flat PVC faces suitable for dye-sublimation direct-to-card printers (Fargo, Zebra, Evolis, Magicard) and high-volume offset printing.",
      "We also supply RFID inlay prelam sheets containing embedded microchips and copper wire antennas for card manufacturers laminating their own proprietary badges.",
    ],
    questions: [
      {
        question: "What is the difference between a Mifare 1K card and an EM-Marin proximity card?",
        answer:
          "Mifare 1K operates at 13.56 MHz high frequency with 1KB EEPROM read/write memory organized into 16 secure sectors with dual encryption keys, making it suitable for multi-application campus IDs, cashless payments, and secure access. EM-Marin operates at 125 kHz low frequency with a 64-bit factory pre-programmed read-only ID, primarily used for basic building entry turnstiles.",
      },
      {
        question: "Can I print on RFID smart cards using desktop ID card printers?",
        answer:
          "Yes. Our Mifare 1K and EM-Marin proximity cards are manufactured with flawless, mirror-smooth laminated PVC surfaces specifically engineered for thermal dye-sublimation and reverse-transfer card printers like Zebra ZC300, Fargo HDP5000, and Evolis Primacy without printhead damage.",
      },
      {
        question: "What is the typical read range of contactless RFID cards?",
        answer:
          "For 13.56 MHz Mifare 1K ISO cards, the typical read range is 2.5 cm to 10 cm. For 125 kHz EM-Marin proximity cards, standard read range is 5 cm to 12 cm depending on the reader antenna power and environment.",
      },
      {
        question: "What is an RFID inlay prelam sheet and how is it used by card factories?",
        answer:
          "An RFID prelam (pre-laminated) sheet contains multiple RFID microchips and wire antennas embedded into a PVC core layer in multi-up grid formats (e.g. 2×5 or 3×8 cards per sheet). Card manufacturers place printed artwork sheets above and below the prelam and fuse them in a heated press to create custom-branded smart cards.",
      },
      DELIVERY,
    ],
  },

  "id-card-lanyard-consumables": {
    h1: "Lanyard hooks, clips and printing supplies",
    title: "Lanyard Hooks, Swivel Dog Hooks & Breakaway Buckles Supplier",
    description:
      "Nickel-plated 360° swivel dog hooks, oval fish hooks, crocodile clips, safety breakaway buckles, and metal ribbon crimp clamps from The Print Planet, Bengaluru.",
    lead: "Precision alloy swivel hooks, oval fish hooks, alligator badge clips, safety breakaway buckles, and crimp clamps.",
    about: [
      "High-durability mechanical hardware and fittings required for lanyard manufacturing, badge attachment, and promotional event merchandise.",
      "Die-cast from Zamak-3 zinc alloy and high-tensile spring steel with electroplated trivalent bright nickel finish, rigorously tested against corrosion, tarnishing, and mechanical fatigue.",
      "Breakaway safety clasps are injection-molded from polyoxymethylene (POM) engineering plastic, designed to separate under tension to meet industrial workplace safety regulations.",
    ],
    questions: [
      {
        question: "What is the difference between a dog hook and an oval fish hook?",
        answer:
          "A swivel dog hook features a spring-loaded snap lever and a 360-degree rotating base ring, allowing smooth card rotation without twisting the neck ribbon. An oval fish hook has a push-gate closure with a sleeker oval silhouette, widely preferred for minimalist corporate identity badges.",
      },
      {
        question: "Why are safety breakaway buckles required on school and factory lanyards?",
        answer:
          "Safety breakaway buckles decouple automatically when pulled with 3.5–5 kg of force, preventing serious neck injury or strangulation if the lanyard is caught in machinery, elevator doors, or during playground sports. Once separated, the buckle easily snaps back together for continuous reuse.",
      },
      {
        question: "What metal alloy is used for lanyard hooks to prevent rusting?",
        answer:
          "Our lanyard hooks and clips are die-cast from Zamak-3 zinc alloy with an electroplated bright nickel barrier layer, salt-spray tested to prevent corrosion and surface oxidization caused by skin perspiration and humid climates.",
      },
      {
        question: "What width fittings should I order for my ribbon rolls?",
        answer:
          "Hardware fittings are sized to match the ribbon width: 12mm fittings for 12mm ribbon, 16mm for 16mm ribbon, 20mm for 20mm ribbon, and 25mm for 25mm ribbon. Clamps and breakaway buckles must match the ribbon width exactly for secure crimping.",
      },
      DELIVERY,
    ],
  },
};
