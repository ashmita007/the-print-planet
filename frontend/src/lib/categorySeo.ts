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
    title: "ID Card Fusing Machine, PVC Card Cutter Manufacturer Bangalore",
    description:
      "Direct factory supplier of ID card fusing machines, motorized PVC card die-cutters, and lanyard heat press machinery in Bangalore. Live WhatsApp video demo before dispatch.",
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
    title: "Satin Lanyard Roll Wholesale Manufacturer Bangalore & India",
    description:
      "Direct manufacturer of 12mm, 16mm, 20mm, 25mm virgin polyester satin lanyard rolls for sublimation heat-transfer printing in Bangalore. Bulk factory rates from ₹185/roll.",
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

  "rfid-consumables": {
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

/**
 * Categories added after the first batch. Every price, size, MOQ and model named here comes from
 * the live catalogue; general facts (CR-80 card size, RFID frequencies) are industry standards.
 */
const MORE_CATEGORY_SEO: Record<string, CategorySeo> = {
  "id-card-manufacturing-machines": {
    h1: "ID card manufacturing machines",
    title: "ID Card Making Machines: Fusing, Cutting, Lamination",
    description:
      "PVC card fusing machines, ID card cutters, industrial card laminators, punching and hot stamping machines. Prices from ₹48,000. Bengaluru supplier, GST invoice.",
    lead: "From a ₹48,000 A4+ fusing machine for a new ID card shop to fully automatic laminators and punchers for card factories.",
    about: [
      "A PVC ID card is made in two machine steps: the printed core sheet and overlay film are fused into one solid sheet in a fusing machine (laminator), and the sheet is then cut or punched into CR-80 cards (85.6 × 54 mm). Lanyard units add a heat press to transfer sublimation prints onto ribbon.",
      "For a starting ID card shop, the DCT150 A4+ fusing machine (up to 10 cards per sheet) pairs with the DCT2000 double-die cutter (up to 2,000 cards an hour) or the DCT4500 automatic cutter (up to 4,500 cards an hour).",
      "For card factories we supply WENLIN industrial laminators with 7 to 10 hot and cold daylights, servo and hydraulic card punching machines, hot stamping, magnetic stripe mounting, sheet collating machines and water chillers. Each listing shows the maker's rated speed, platen size and power supply.",
    ],
    questions: [
      {
        question: "Which machines do I need to start making PVC ID cards?",
        answer:
          "Two: a fusing machine to laminate the printed core sheet with overlay film, and a cutter to punch the sheet into CR-80 cards. A small shop can start with the DCT150 A4+ fusing machine and the DCT2000 double-die cutter.",
      },
      {
        question: "What is the price range of ID card machines?",
        answer:
          "Listed prices run from ₹48,000 for the DCT150 A4+ fusing machine and ₹65,000 for the DCT2000 cutter up to ₹28,50,000 for a fully automatic 10-daylight industrial laminator. Prices are before GST.",
      },
      {
        question: "How do I choose between a manual and an automatic card cutter?",
        answer:
          "Go by daily volume. The DCT2000 double-die cutter is rated up to 2,000 cards an hour; the DCT4500 automatic cutter up to 4,500. Industrial servo punchers in this range are rated from 3,000 to 18,000 cards an hour.",
      },
      {
        question: "Do industrial laminators need three-phase power?",
        answer:
          "Most of the large WENLIN laminators listed here run on 380V three-phase supply at 26 to 36 kW. Check the power rating on each product page against your site supply before ordering.",
      },
    ],
  },
  "aluminium-metal-holder": {
    h1: "Aluminium metal ID card holders",
    title: "Aluminium Metal ID Card Holder Wholesale, ₹17.50",
    description:
      "Aluminium ID card holders in silver, gold, black, blue and red, horizontal and vertical. ₹17.50 per piece, MOQ 100. Wholesale from Bengaluru with GST invoice.",
    lead: "Metal ID card holders in five colours and both orientations, at ₹17.50 a piece from 100 pieces.",
    about: [
      "Aluminium holders give an ID card a rigid metal frame, so they suit staff badges where a plastic pouch looks too plain: offices, hotels, hospitals and front-desk teams.",
      "We stock them in silver, gold, black, blue and red, each in a horizontal and a vertical version, at ₹17.50 per piece with a minimum order of 100 pieces.",
      "Order the orientation that matches how your cards are printed, and pair the holder with a lanyard or clip from our hooks and fittings range.",
    ],
    questions: [
      {
        question: "What is the price of an aluminium ID card holder?",
        answer: "₹17.50 per piece before GST, with a minimum order of 100 pieces. Larger quantities can be quoted on WhatsApp.",
      },
      {
        question: "Which colours are available?",
        answer: "Silver, gold, black, blue and red, each in horizontal and vertical versions.",
      },
      {
        question: "Can I mix colours in one order?",
        answer: "Send the split you need with your enquiry and we will confirm what can be combined against the minimum order.",
      },
    ],
  },
  "crystal-clear-pvc-id-card-holder": {
    h1: "Crystal clear PVC ID card holders",
    title: "Crystal Clear ID Card Holder Wholesale Price India",
    description:
      "Transparent PVC ID card holders, horizontal and vertical, with lanyard slot. From ₹4.43 a piece in bulk. Models H2T, V2T, HS2T, VS2T and more. Bengaluru supplier.",
    lead: "Fully transparent holders that show the whole card, in horizontal and vertical models with a lanyard slot.",
    about: [
      "Crystal clear holders are the most common choice for school and office ID cards because nothing hides the photo or the printed details. They take a standard CR-80 card (85.6 × 54 mm).",
      "Models include H2T, H4T and HS2T (horizontal) and V2T, V4T and VS2T (vertical), plus sticker-pasting versions (HST-B, VST-B) for self-adhesive cards. Listed prices run from ₹4.43 to ₹5.58 per piece, with minimum orders from 1,000 pieces on most models.",
      "Not sure which model you use now? Send a photo of your current holder on WhatsApp and we will match it.",
    ],
    questions: [
      {
        question: "What is the wholesale price of a transparent ID card holder?",
        answer: "Listed prices run from ₹4.43 to ₹5.58 per piece before GST, depending on the model. Most models have a minimum order of 1,000 to 1,500 pieces.",
      },
      {
        question: "What is the difference between H and V models?",
        answer: "H models hold the card horizontally (landscape) and V models vertically (portrait). Order the one that matches your card layout.",
      },
      {
        question: "What size card fits these holders?",
        answer: "They are made for the standard CR-80 ID card, 85.6 × 54 mm.",
      },
    ],
  },
  "color-id-card-lanyard-roll": {
    h1: "Colour satin lanyard rolls",
    title: "Colour Satin Lanyard Roll 16mm & 20mm, 100 m",
    description:
      "Indian satin lanyard rolls in black, red, royal blue, orange, purple and yellow. 16 mm and 20 mm, 100 m per roll, from ₹270. For screen-printed lanyards.",
    lead: "Coloured satin ribbon on 100 m rolls, in 16 mm and 20 mm widths, for screen-printed lanyards.",
    about: [
      "These Indian satin rolls come in solid colours for screen printing: black, red, royal blue, orange, purple and yellow. Each roll is 100 m on a plastic core, in 16 mm or 20 mm width.",
      "Prices are ₹270 to ₹300 per roll. A 100 m roll makes roughly 100 lanyards at about 90 cm each, before allowing for joins and wastage.",
      "For full-colour photo printing use white sublimation ribbon instead; coloured satin is for one- or two-colour screen printed logos and text.",
    ],
    questions: [
      {
        question: "How many lanyards can I make from one 100 m roll?",
        answer: "About 100 at roughly 90 cm per lanyard, a little less once you allow for joins and trimming.",
      },
      {
        question: "Which widths and colours are in stock?",
        answer: "16 mm and 20 mm, in black, red, royal blue, orange, purple and yellow.",
      },
      {
        question: "Can coloured satin be sublimation printed?",
        answer: "These rolls are listed for screen printing. For sublimation, use white digital satin ribbon so the printed colours come out true.",
      },
    ],
  },
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
  "semi-transparent-pvc-id-card-holder": {
    h1: "Semi-transparent PVC ID card holders",
    title: "Semi Transparent ID Card Holder Wholesale India",
    description:
      "Frosted semi-transparent PVC ID card holders, horizontal and vertical, with lanyard slot. Models H2, H4, V2, V4, C2. Wholesale from Bengaluru with GST invoice.",
    lead: "Frosted holders with a clear window, in horizontal and vertical models with a lanyard slot.",
    about: [
      "Semi-transparent holders have a frosted body, so the card edges look neat while the window shows the photo and name. They are a budget option for schools, events and factories.",
      "Models include H2, H4 and H2H (horizontal), V2, V4 and V2H (vertical) and C2, mostly with a lanyard slot. The V4 is also listed in white at ₹3.50 a piece.",
      "Send a photo of the holder you use now and we will match the model.",
    ],
    questions: [
      {
        question: "What is a semi-transparent ID card holder?",
        answer: "A PVC holder with a frosted body and a clear window over the card, so the photo and details stay visible.",
      },
      {
        question: "Which models are available?",
        answer: "H2, H4 and H2H (horizontal), V2, V4 and V2H (vertical), and C2.",
      },
      {
        question: "How are they priced?",
        answer: "By model and quantity. The V4 white is listed at ₹3.50 a piece; send your model and quantity for a quote on the others.",
      },
    ],
  },
  "executive-pvc-id-card-holder": {
    h1: "Executive ID card holders",
    title: "Executive ID Card Holder Wholesale, Crystal & Pasting",
    description:
      "Executive ID card holders with badge clip: crystal clear (₹11.10) and pasting (₹5.22) models, horizontal and vertical. MOQ from 700. Bengaluru wholesale.",
    lead: "Rigid executive holders with a badge clip, in crystal clear and pasting versions.",
    about: [
      "Executive holders are stiffer and clearer than standard pouches and clip straight onto a shirt pocket or lanyard. They suit corporate staff, management and visitor badges.",
      "The EH-T and EV-T crystal clear models are listed at ₹11.10 a piece; the EH-W and EV-W pasting models, for self-adhesive cards, at ₹5.22. H models are horizontal and V models vertical. Minimum orders start at 700 pieces.",
    ],
    questions: [
      {
        question: "What is the difference between EH-T and EH-W?",
        answer: "T models are crystal clear holders the card slides into; W models are pasting holders for self-adhesive sticker cards.",
      },
      {
        question: "What is the price of executive ID card holders?",
        answer: "₹11.10 per piece for crystal clear models and ₹5.22 for pasting models, before GST. Minimum orders start at 700 pieces.",
      },
      {
        question: "How do executive holders attach?",
        answer: "They are listed with a badge clip, so they clip onto clothing or a lanyard.",
      },
    ],
  },
  "rfid-inlay-prelam-sheet-for-smart-id-card": {
    h1: "RFID inlay prelam sheets",
    title: "RFID Prelam Sheet A4: MIFARE 1K, NFC, UHF, 125 kHz",
    description:
      "A4 RFID prelam sheets, 5×2 layout (10 cards): 13.56 MHz 1K and 4K, NTAG216 NFC, 125 kHz proximity, UHF and combo chips. From ₹57 a sheet, MOQ 50 to 100.",
    lead: "A4 prelam sheets with 10 chips each (5 × 2 layout), for making RFID and NFC cards in your own fusing machine.",
    about: [
      "A prelam sheet has the RFID chips and antennas already sealed inside a PVC layer. You put it between your printed core and overlay, fuse, and punch out finished smart cards, without handling bare chips.",
      "Every sheet here is A4 with a 5 × 2 layout, so 10 cards per sheet. Chip options: 13.56 MHz 1K (₹57), 13.56 MHz 4K (₹170), NTAG216 NFC (₹120), 125 kHz proximity (₹58), UHF (₹105), and UHF combined with 1K or with 125 kHz proximity (₹154 to ₹155). Minimum orders are 50 to 100 sheets.",
      "Match the chip to the reader: 125 kHz for older proximity access systems, 13.56 MHz 1K or 4K for most modern access and attendance systems, NFC for phone-readable cards, and UHF for long-range reading such as vehicle or warehouse gates.",
    ],
    questions: [
      {
        question: "How many cards does one prelam sheet make?",
        answer: "10. Every sheet listed is A4 with a 5 × 2 layout.",
      },
      {
        question: "Which chip should I choose?",
        answer: "Use the frequency your reader supports: 125 kHz proximity, 13.56 MHz (1K, 4K or NFC) or UHF. Combo sheets carry two chips per card for sites running two systems.",
      },
      {
        question: "What is the price of RFID prelam sheets?",
        answer: "From ₹57 per sheet for 13.56 MHz 1K up to ₹170 for 4K, before GST. Minimum orders are 50 to 100 sheets.",
      },
    ],
  },
  "sublimation-paper-roll-for-lanyard-printing": {
    h1: "Sublimation paper rolls for lanyard printing",
    title: "Sublimation Paper Roll 80 GSM for Lanyard Printing",
    description:
      "80 GSM sublimation paper rolls in 8, 12, 24, 40, 48 and 72 inch widths, 50 to 150 m long. From ₹380 a roll. For lanyard heat press printing. Bengaluru supplier.",
    lead: "80 GSM transfer paper in widths from 8 to 72 inches, for printing lanyard designs before heat transfer.",
    about: [
      "In sublimation lanyard printing the design is first printed in mirror image onto sublimation paper, then the heat press transfers the ink from the paper into white polyester ribbon.",
      "All rolls listed are 80 GSM, in 8, 12, 24, 40, 48 and 72 inch widths and 50, 100 or 150 m lengths, from ₹380 (8 inch × 100 m) to ₹2,505 (72 inch × 150 m).",
      "Pick a width that fits your printer and lets you print several lanyard lanes side by side; narrow rolls suit dedicated lanyard printers.",
    ],
    questions: [
      {
        question: "What GSM sublimation paper is used for lanyards?",
        answer: "The rolls we stock are 80 GSM.",
      },
      {
        question: "Which widths are available?",
        answer: "8, 12, 24, 40, 48 and 72 inch, in 50, 100 or 150 m lengths depending on width.",
      },
      {
        question: "What is the price of a sublimation paper roll?",
        answer: "From ₹380 for an 8 inch × 100 m roll up to ₹2,505 for 72 inch × 150 m, before GST.",
      },
    ],
  },
  "pvc-id-card-sticker-pasting-holder": {
    h1: "PVC sticker pasting ID card holders",
    title: "Sticker Pasting ID Card Holder Wholesale, from ₹2.48",
    description:
      "PVC sticker pasting ID card holders, horizontal and vertical (HS, VS, VS-L). From ₹2.48 a piece, MOQ 1,500 to 1,800. Low-cost school ID cards. Bengaluru.",
    lead: "The lowest-cost ID card format: a printed sticker pasted onto a PVC holder.",
    about: [
      "Sticker pasting holders are used for low-cost school and event ID cards. The card is printed on self-adhesive sticker paper and pasted onto the holder, so no fusing machine is needed.",
      "Models include HS (horizontal), VS (vertical) and VS-L (single side). Listed prices run from ₹2.48 to ₹2.81 per piece, with minimum orders of 1,500 to 1,800 pieces.",
      "Pair them with gumming rolls for the adhesive sticker sheets.",
    ],
    questions: [
      {
        question: "How does a sticker pasting ID card work?",
        answer: "You print the card on self-adhesive sticker sheet, cut it to size and paste it onto the PVC holder. No fusing machine is needed.",
      },
      {
        question: "What is the price of sticker pasting holders?",
        answer: "₹2.48 to ₹2.81 per piece before GST, depending on the model, with minimum orders of 1,500 to 1,800 pieces.",
      },
      {
        question: "What does VS-L mean?",
        answer: "VS-L is the single-side vertical sticker holder, listed at ₹2.48 a piece.",
      },
    ],
  },
  "digital-lanyard-white-roll": {
    h1: "White digital sublimation lanyard rolls",
    title: "White Sublimation Lanyard Roll Wholesale Manufacturer Bangalore",
    description:
      "Direct manufacturer of 12mm, 16mm, 20mm, 25mm white digital satin lanyard rolls for sublimation heat-transfer printing in Bangalore. Heat resistant to 220°C.",
    lead: "Virgin continuous-filament polyester sublimation rolls in 12mm, 16mm, 20mm, and 25mm widths.",
    about: [
      "White digital sublimation lanyard rolls feature a calendar-pressed continuous polyester weave engineered to withstand heat-press transfer temperatures up to 220°C without melting, yellowing, or shrinking.",
      "The 99.2% CIE whiteness index ensures vivid Pantone hexachrome reproduction and photographic gradient clarity with zero dye bleeding across long event and corporate lanyard runs.",
      "Supplied on 100-meter industrial plastic spools with ultrasonic heat-sealed edges preventing fraying during sewing and hardware assembly.",
    ],
    questions: [
      {
        question: "What is the wholesale price of white digital sublimation lanyard rolls?",
        answer: "Wholesale factory pricing starts from ₹185 to ₹255 per 100m spool for bulk volume orders, depending on ribbon width (12mm, 16mm, 20mm, or 25mm).",
      },
      {
        question: "What temperature should be used for sublimation transfer?",
        answer: "Optimal heat press settings are 200°C to 215°C with a dwell time of 25 to 35 seconds under medium-high pneumatic or manual pressure.",
      },
      {
        question: "How many lanyards can be produced from one 100m spool?",
        answer: "One 100-meter spool produces approximately 100 standard 90 cm adult neck lanyards, allowing for loop stitching and hardware cut-off allowances.",
      },
      DELIVERY,
    ],
  },
  "motorized-pvc-id-card-cutting-machine-for-id-card": {
    h1: "Motorized PVC ID card cutting machines",
    title: "Motorized Electric PVC Card Die Cutter Machine Bangalore",
    description:
      "Commercial motorized electric PVC ID card die-cutters (DCT2000, DCT4500). Up to 1,200 to 4,500 cards/hr burr-free ISO CR-80 punching. Live WhatsApp video demo.",
    lead: "High-speed electric motorized card die cutters capable of punching burr-free ISO CR-80 cards at production speeds.",
    about: [
      "A motorized card cutter replaces slow manual lever punches with high-torque electric gearboxes and hardened tool-steel cutting dies to punch finished cards with standard 3.18mm rounded corners.",
      "Electric foot pedal or continuous push-button actuation allows the operator to maintain continuous feeding, reaching output speeds from 1,200 cards up to 4,500 cards per hour with zero hand fatigue.",
      "Every machine is pre-calibrated and tested via live WhatsApp video inspection before wooden crating and pan-India dispatch.",
    ],
    questions: [
      {
        question: "What is the production capacity of a motorized PVC card die cutter?",
        answer: "Standard motorized workshop units like the DCT2000 punch up to 1,200–2,000 cards per hour, while high-throughput automatic models like the DCT4500 achieve up to 4,500 cards per hour.",
      },
      {
        question: "Does the motorized cutter create standard rounded corners?",
        answer: "Yes. The hardened alloy punch and die set strictly cuts the standard ISO/IEC 7810 CR-80 radius of 3.18 mm (1/8 inch), matching bank ATM cards and driving licenses.",
      },
      {
        question: "Can I inspect the machine working live before paying?",
        answer: "Yes. We arrange a live WhatsApp video call (+91 97418 08034) to test card punching with your preferred PVC sheet thickness before crating.",
      },
      DELIVERY,
    ],
  },
  "pvc-id-card-inkjet-fusing-sheets": {
    h1: "Inkjet PVC card fusing sheets (dragon sheets)",
    title: "Inkjet PVC ID Card Dragon Sheets Wholesale Supplier Bangalore",
    description:
      "A4 inkjet PVC dragon sheets (50 sets/box = 500 cards) for ID card fusing. Direct manufacturer pricing from Sunkadakatte, Bangalore with 24–48h dispatch.",
    lead: "High-porosity silica-coated A4 PVC core sheets with front and back clear overlay films for desktop inkjet card printing.",
    about: [
      "Inkjet dragon sheets feature a chemically treated microporous receiver layer that locks in aqueous dye or pigment inks from desktop Epson or Canon printers without smudging or feathering.",
      "Each 3-part set consists of one printable PVC core sheet (0.46mm) sandwiched between two clear coated overlay films (0.08mm each). After heat fusing at 135°C–150°C, the composite forms a rock-solid 0.76mm (30 mil) waterproof card.",
      "Packed in heavy-duty moisture-proof boxes of 50 sets yielding 500 finished CR-80 cards at a raw material cost under ₹2.00 per card.",
    ],
    questions: [
      {
        question: "How many cards does one box of dragon sheets make?",
        answer: "One standard box contains 50 sets of A4 sheets. With 10 cards per A4 sheet (2 × 5 layout), one box produces exactly 500 finished CR-80 ID cards.",
      },
      {
        question: "Which desktop printers are compatible with inkjet dragon sheets?",
        answer: "All standard 4-color and 6-color desktop inkjet printers (including Epson L8050, L18050, L805, L3250, and Canon G-series) using standard dye or pigment inks.",
      },
      {
        question: "What fusing temperature should be used for inkjet PVC sheets?",
        answer: "Between 135°C and 150°C maintained under pressure for 12–15 minutes, followed by gradual water cooling down to below 45°C to ensure cards stay flat.",
      },
      DELIVERY,
    ],
  },
  "sublimation-ink-for-lanyard-printing": {
    h1: "Sublimation ink for lanyard printing",
    title: "Sublimation Ink 1000ml for Lanyard Printing Wholesale Bangalore",
    description:
      "1000ml bottle dye-sublimation ink (CMYK + Light Cyan) for polyester lanyard printing. High-chroma transfer, zero nozzle clogging, factory rates.",
    lead: "High-density dye-sublimation inks formulated specifically for continuous polyester lanyard ribbon heat-transfer printing.",
    about: [
      "Our dye-sublimation inks utilize micro-encapsulated disperse dyes that convert directly from solid to gas at 190°C–210°C, bonding permanently into the polyester molecular fibers of satin lanyards.",
      "Formulated with anti-clogging surfactants tested over continuous 8-hour print runs on Epson PrecisionCore and DX5 printheads, preventing nozzle bandings and head cleanings.",
      "Delivers high optical density for deep corporate blacks, rich Pantone blues, and vibrant school reds that resist skin oils, water, and UV fading.",
    ],
    questions: [
      {
        question: "What bottle sizes are available for sublimation ink?",
        answer: "We supply 1000ml (1 Litre) industrial bottles in Cyan, Magenta, Yellow, Black, and Light Cyan for commercial bulk lanyard printing operations.",
      },
      {
        question: "Will this ink clog Epson desktop or wide-format printheads?",
        answer: "No. The ink is multi-stage nano-filtered below 0.2 microns to guarantee smooth droplet jetting without nozzle deflection or clogging on Epson printheads.",
      },
      DELIVERY,
    ],
  },
};

Object.assign(CATEGORY_SEO, MORE_CATEGORY_SEO);
