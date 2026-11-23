import type { Metadata } from "next";
import CommercePolicyPage from "@/components/storefront/CommercePolicyPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

export const metadata: Metadata = {
  title: "Return policy",
  description: "Returns terms for orders placed with The Print Planet, Bengaluru.",
  alternates: { canonical: `${SITE_URL}/return-policy` },
};

export default function Page() {
  return <CommercePolicyPage title="Return policy" field="return_policy_text" />;
}
