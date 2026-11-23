import React from "react";
import { Metadata } from "next";
import PageHero from "@/components/storefront/PageHero";
import PageCta from "@/components/storefront/PageCta";
import GalleryWall, { GalleryPiece } from "@/components/GalleryWall";

export const metadata: Metadata = {
  alternates: { canonical: "https://theprintplanet.co.in/gallery" },
  title: "Product Gallery: Lanyards & ID Cards",
  description:
    "Photos of our lanyards, PVC holders and RFID cards.",
};

const PIECES: GalleryPiece[] = [
  { title: "20 mm sublimation lanyard", group: "Lanyards", image: "/media/products/LAN-ROY-20M.png" },
  { title: "Crystal clear badge holders", group: "Cards", image: "/media/products/HLD-VST.png" },
  { title: "Frosted PVC ID holders", group: "Cards", image: "/media/products/HLD-V4.png" },
];

export default function GalleryPage() {
  return (
    <div>
      <PageHero title="Product gallery" lead="Tap any piece to ask for a price." crumbs={[{ label: "Gallery" }]} />
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10">
        <GalleryWall pieces={PIECES} />
      </div>
      <PageCta title="Want to check samples first?" whatsappText="Hi, I would like a physical sample kit." />
    </div>
  );
}
