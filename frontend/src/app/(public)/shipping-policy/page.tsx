import type { Metadata } from "next";
import CommercePolicyPage from "@/components/storefront/CommercePolicyPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Shipping policy",
  description: "Shipping terms for orders placed with The Print Planet, Bengaluru.",
  alternates: { canonical: `${SITE_URL}/shipping-policy` },
};

export default function Page() {
  return <CommercePolicyPage title="Shipping policy" field="shipping_policy_text" />;
}
