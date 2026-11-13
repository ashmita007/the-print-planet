import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import PageHero from "@/components/PageHero";
import PageCta from "@/components/PageCta";
import { GUIDES, getGuide } from "@/lib/guides";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theprintplanet.co.in";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return { title: { absolute: "Guide not found | The Print Planet" }, robots: { index: false } };
  const url = `${SITE_URL}/guides/${guide.slug}`;
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      type: "article",
      siteName: "The Print Planet",
      images: [{ url: `${SITE_URL}/logo.png`, width: 1200, height: 600, alt: guide.h1 }],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  const url = `${SITE_URL}/guides/${guide.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.h1,
        description: guide.description,
        datePublished: guide.updated,
        dateModified: guide.updated,
        mainEntityOfPage: url,
        image: `${SITE_URL}/logo.png`,
        author: { "@type": "Organization", name: "The Print Planet", url: SITE_URL },
        publisher: {
          "@type": "Organization",
          name: "The Print Planet",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
          { "@type": "ListItem", position: 3, name: guide.h1, item: url },
        ],
      },
    ],
  };
  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        title={guide.h1}
        lead={guide.lead}
        crumbs={[{ label: "Guides", href: "/guides" }, { label: guide.h1 }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-[1fr_300px] gap-10">
        <article className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs text-[#353C45]">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {guide.readMinutes} min read · Updated{" "}
            <time dateTime={guide.updated}>
              {new Date(guide.updated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </time>
          </p>

          {guide.sections.map((section) => (
            <section key={section.heading} className="mt-9">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#121418]">{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="mt-3 text-[16px] leading-relaxed text-[#2B323B]">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 space-y-2 list-disc pl-5 text-[16px] leading-relaxed text-[#2B323B] marker:text-[#F26B1D]">
                  {section.bullets.map((b) => (
                    <li key={b.slice(0, 40)}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 self-start">
          <div className="bg-white border border-[#DFE6EE] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#121418]">Shop for this</h2>
            <ul className="mt-3 space-y-2">
              {guide.related.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="group flex items-start gap-2 text-sm font-semibold text-[#121418] hover:text-[#F26B1D]"
                  >
                    <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#EDF1F6] border border-[#DFE6EE] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#121418]">More guides</h2>
            <ul className="mt-3 space-y-2">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="text-sm text-[#2B323B] hover:text-[#121418] hover:underline underline-offset-2">
                    {g.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <PageCta title="Need these supplies? Get a wholesale price today." whatsappText={guide.whatsappText} />
    </>
  );
}
