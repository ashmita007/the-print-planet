import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "pricing.txt");
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    content = `# Wholesale B2B Pricing Tariff — The Print Planet™\n\nPlease visit https://theprintplanet.co.in/corporate or WhatsApp +91 97418 08034.`;
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "all",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
