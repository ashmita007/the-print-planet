import React from "react";
import { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PageCta from "@/components/PageCta";
import GalleryWall, { GalleryPiece } from "@/components/GalleryWall";

export const metadata: Metadata = {
  alternates: { canonical: "https://theprintplanet.co.in/gallery" },
  title: "Product Gallery: Lanyards, ID Cards & Machines",
  description:
    "Photos of our sublimation lanyards, PVC holders, RFID cards, lamination plates and card manufacturing machines.",
};

const PIECES: GalleryPiece[] = [
  { title: "WENLIN full-auto 7500Y-10 laminator", group: "Machines", image: "/media/products/MCH-WL-FA7500Y10.jpg" },
  { title: "20 mm sublimation lanyard", group: "Lanyards", image: "/media/products/LAN-ROY-20M.png" },
  { title: "Crystal clear badge holders", group: "Cards", image: "/media/products/HLD-VST.png" },
  { title: "WL-HSA-3C servo card puncher", group: "Machines", image: "/media/products/MCH-WL-HSA3C.jpg" },
  { title: "Frosted PVC ID holders", group: "Cards", image: "/media/products/HLD-V4.png" },
  { title: "Frosted steel lamination plates", group: "Machines", image: "/media/products/CNS-WL-FROST-PLT.jpg" },
  { title: "Lanyard metal clamps", group: "Lanyards", image: "/media/products/CLP-M16MM.jpg" },
  { title: "White satin ribbon rolls", group: "Lanyards", image: "/media/products/LAN-WHI-20M.png" },
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
