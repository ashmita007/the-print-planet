import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Print Planet | Wholesale ID Card Solutions & Lanyards",
  description:
    "Industrial manufacturer and wholesale supplier of color satin lanyard rolls, rigid PVC ID card holders, crystal clear sleeves, dog hooks, clamps, and card cutting machinery.",
  keywords: [
    "color id card lanyard roll",
    "semi transparent pvc id card holder",
    "crystal clear pvc id card holder",
    "id card lanyard hooks",
    "id card cutting machine",
    "fusing machine",
    "rfid smart cards",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-white text-[#263445] antialiased selection:bg-[#E87832] selection:text-white">
        {children}
      </body>
    </html>
  );
}
