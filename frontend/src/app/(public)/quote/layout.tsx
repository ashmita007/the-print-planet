import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Get a Wholesale Quote",
  description:
    "Get wholesale prices for lanyard rolls, PVC ID card holders, RFID cards and card machines from The Print Planet, Bengaluru.",
  alternates: {
    canonical: `${SITE_URL}/quote`,
  },
  openGraph: {
    title: "Get a Wholesale Quote | The Print Planet",
    description: "Fast 1-hour response desk for wholesale and corporate ID card orders.",
    url: `${SITE_URL}/quote`,
    siteName: "The Print Planet",
    type: "website",
  },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
