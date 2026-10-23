import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Request Wholesale Quotation Online | The Print Planet India",
  description:
    "Request custom wholesale quotes for satin lanyard rolls, PVC ID card holders, RFID access cards, and card machinery directly from The Print Planet (theprintplanet.co.in). Rapid 1-hour sales engineering response.",
  alternates: {
    canonical: `${SITE_URL}/quote`,
  },
  openGraph: {
    title: "Request Wholesale Quotation Online | The Print Planet India",
    description: "Fast 1-hour response desk for wholesale and corporate ID card orders.",
    url: `${SITE_URL}/quote`,
    siteName: "The Print Planet",
    type: "website",
  },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
