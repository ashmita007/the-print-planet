import type { Metadata } from "next";
import CommercePolicyPage from "@/components/storefront/CommercePolicyPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "Refunds terms for orders placed with The Print Planet, Bengaluru.",
  alternates: { canonical: `${SITE_URL}/refund-policy` },
};

export default function Page() {
  return <CommercePolicyPage title="Refund policy" field="refund_policy_text" />;
}
