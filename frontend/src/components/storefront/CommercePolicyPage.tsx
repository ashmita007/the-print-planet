import Link from "next/link";
import PageHero from "@/components/storefront/PageHero";
import { getCommercePolicies } from "@/lib/api";
import type { CommercePolicies } from "@/lib/types";

type PolicyKey = "return_policy_text" | "refund_policy_text" | "shipping_policy_text";

/** Owner-written policy text from Commerce settings; a blank text shows a contact prompt instead. */
export default async function CommercePolicyPage({ title, field }: { title: string; field: PolicyKey }) {
  const policies: CommercePolicies | null = await getCommercePolicies();
  const text = policies?.[field]?.trim() ?? "";
  return (
    <div>
      <PageHero title={title} lead="" crumbs={[{ label: title }]} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-sm text-[#121418] leading-relaxed">
        {text ? (
          <div className="space-y-3 whitespace-pre-line">{text}</div>
        ) : (
          <p>
            We have not published this policy online yet. Please{" "}
            <Link href="/contact" className="font-bold underline">contact us</Link>{" "}
            and we will tell you the terms for your order.
          </p>
        )}
      </div>
    </div>
  );
}
