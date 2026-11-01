export type OrgType = "corporate" | "school" | "college" | "reseller";

export interface VolumeTier {
  id: string;
  name: string;
  slab: string;
  volume: string;
  discount: string;
  turnaround: string;
  minQty: number;
  sampleQty: number;
  features: string[];
}

export const VOLUME_TIERS: VolumeTier[] = [
  {
    id: "tier-1",
    name: "Commercial Starter",
    slab: "Tier 1: Commercial Starter",
    volume: "500 – 2,500",
    discount: "Standard wholesale rate",
    turnaround: "3 – 4 business days",
    minQty: 0,
    sampleQty: 1000,
    features: [
      "Digital pre-press proof",
      "Standard stock colours and widths",
      "Nickel-plated steel dog hooks",
      "Standard courier across India",
    ],
  },
  {
    id: "tier-2",
    name: "Business Enterprise",
    slab: "Tier 2: Business Enterprise",
    volume: "2,500 – 10,000",
    discount: "Up to 20% volume discount",
    turnaround: "2 – 3 business days, priority",
    minQty: 2500,
    sampleQty: 5000,
    features: [
      "Free physical pilot sample",
      "Exact Pantone yarn matching",
      "Dedicated account manager",
      "Free barcode serialisation and sorting",
      "Priority manufacturing slot",
    ],
  },
  {
    id: "tier-3",
    name: "Institutional Contract",
    slab: "Tier 3: Institutional Contract",
    volume: "10,000+ a year",
    discount: "Maximum factory-direct pricing",
    turnaround: "Scheduled staggered dispatches",
    minQty: 10000,
    sampleQty: 15000,
    features: [
      "Custom tooling and mould fabrication",
      "Reserved quarterly buffer stock",
      "Pre-approved credit terms",
      "Annual price freeze agreement",
      "Custom branded packaging and kits",
    ],
  },
];

export function tierForQuantity(quantity: number): VolumeTier {
  return [...VOLUME_TIERS].reverse().find((tier) => quantity >= tier.minQty) ?? VOLUME_TIERS[0];
}

export const QUANTITY_PRESETS = [500, 1000, 2500, 5000, 10000, 15000];
export const MIN_QUANTITY = 100;

export const ORG_TYPES: { value: OrgType; label: string; nameLabel: string; namePlaceholder: string }[] = [
  { value: "corporate", label: "Company", nameLabel: "Company name", namePlaceholder: "e.g. Tech Corp Pvt Ltd" },
  { value: "school", label: "School", nameLabel: "School name", namePlaceholder: "e.g. Greenwood High School" },
  { value: "college", label: "College", nameLabel: "College or university name", namePlaceholder: "e.g. RV College of Engineering" },
  { value: "reseller", label: "Print shop", nameLabel: "Business name", namePlaceholder: "e.g. Sri Sai ID Cards" },
];

export interface SpecOption {
  label: string;
  options: string[];
}

export interface ProductLine {
  value: string;
  label: string;
  detail: string;
  specs: SpecOption[];
}

const LANYARD_SPECS: SpecOption[] = [
  { label: "Width", options: ["12 mm", "16 mm", "20 mm", "25 mm"] },
  { label: "Fitting", options: ["Dog hook", "Oval hook", "Crocodile clip", "Breakaway clasp"] },
];

const HOLDER_SPECS: SpecOption[] = [
  { label: "Orientation", options: ["Vertical", "Horizontal"] },
  { label: "Finish", options: ["Crystal clear", "Semi-transparent", "Executive"] },
];

const SCHOOL_LINES: ProductLine[] = [
  { value: "school_lanyards", label: "Satin lanyards", detail: "Printed rolls and finished lanyards", specs: LANYARD_SPECS },
  { value: "student_pvc_cards", label: "Student ID cards", detail: "CR-80 PVC identity cards", specs: [{ label: "Print", options: ["Single side", "Both sides"] }] },
  { value: "school_holders", label: "Card holders", detail: "Rigid PVC badge holders", specs: HOLDER_SPECS },
  { value: "rfid_school", label: "RFID cards", detail: "Attendance and library access", specs: [{ label: "Frequency", options: ["125 kHz", "13.56 MHz", "Not sure"] }] },
  { value: "breakaway_hooks", label: "Safety hooks", detail: "Breakaway clasps and fittings", specs: [] },
];

const CORPORATE_LINES: ProductLine[] = [
  { value: "corporate_lanyards", label: "Branded lanyards", detail: "Custom printed satin lanyards", specs: LANYARD_SPECS },
  { value: "corporate_holders", label: "Badge holders", detail: "Executive PVC and acrylic", specs: HOLDER_SPECS },
  { value: "rfid_corporate", label: "Access cards", detail: "13.56 MHz Mifare and turnstile", specs: [{ label: "Frequency", options: ["125 kHz", "13.56 MHz", "Not sure"] }] },
  { value: "die_cutters", label: "Card machines", detail: "ID card cutters and fusing units", specs: [] },
  { value: "commercial_printing", label: "Commercial print", detail: "Printing and lens packaging", specs: [] },
];

export function productLinesFor(orgType: OrgType): ProductLine[] {
  return orgType === "school" || orgType === "college" ? SCHOOL_LINES : CORPORATE_LINES;
}

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const ATTACHMENT_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt",
  ".jpg", ".jpeg", ".png", ".webp", ".zip", ".rar", ".ai", ".eps", ".cdr",
];
export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

export const validators = {
  required: (value: string, label: string) => (value.trim() ? "" : `Enter ${label}`),
  email: (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Enter a valid email, like name@company.com",
  phone: (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13 ? "" : "Enter a 10-digit mobile number";
  },
  gst: (value: string) =>
    !value.trim() || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value.trim())
      ? ""
      : "GSTIN has 15 characters, like 29AAAAA0000A1Z5",
  password: (value: string) => (value.length >= 8 ? "" : "Use at least 8 characters"),
};
