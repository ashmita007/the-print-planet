import React from "react";
import { Star } from "lucide-react";

interface ReviewItem {
  id: string;
  author: string;
  role: string;
  city: string;
  rating: number;
  text: string;
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Rajesh M. Gowda",
    role: "Proprietor, Gowda Digital Cards & ID Bureau",
    city: "Bangalore, Karnataka",
    rating: 5,
    text: "The Print Planet is truly India's specialist in PVC cards. We have been purchasing their 0.15+0.46+0.15mm inkjet fusing sheets and crystal-clear PVC holders in bulk cartons for our Bangalore university convocation contracts. Not a single card delaminated after lamination. Genuine factory price and same-day delivery to our Rajajinagar shop.",
  },
  {
    id: "rev-2",
    author: "Suresh Kumar Nair",
    role: "Production In-Charge, Apex ID Solutions",
    city: "Bangalore, Karnataka",
    rating: 5,
    text: "Before buying our motorized PVC card die cutter and hydraulic fusing machine, their engineer gave us a live WhatsApp video inspection showing cutting tolerance and heat stability on test cards. Dispatched with wooden crate packing and official GST tax invoice. Machine is running 8 hours every day with zero issues.",
  },
  {
    id: "rev-3",
    author: "Priya Sundaram",
    role: "Director, Sundaram Corporate Merchandise",
    city: "Chennai, Tamil Nadu",
    rating: 5,
    text: "Ordered 12,000 meters of 20mm royal blue Indian satin digital lanyard rolls with metal dog hooks for an IT conference. Exact Pantone blue shade match and zero joint tears in the entire roll. Consignment reached Chennai via VRL Logistics within 36 hours. Exceptional B2B supplier.",
  },
  {
    id: "rev-4",
    author: "Anand Verma",
    role: "Founder, Verma Graphic Press",
    city: "Bangalore, Karnataka",
    rating: 5,
    text: "Very reliable supplier in Sunkadakatte. We place our orders in the morning and pick up stock directly at their counter or receive it via Porter in 2 hours. Their semi-transparent PVC ID card holders are crystal clear, flexible, and never crack under winter temperatures.",
  },
  {
    id: "rev-5",
    author: "Venkat Ramanan",
    role: "General Manager, Ramanan Access & Security",
    city: "Hyderabad, Telangana",
    rating: 5,
    text: "Procured 8,000 Mifare 1K Classic 13.56MHz RFID cards along with retractable badge reels for our corporate tech park client. All cards passed NFC reading distance checks with zero defective units. Best wholesale rates in South India.",
  },
  {
    id: "rev-6",
    author: "Manoj Patwardhan",
    role: "Proprietor, Shivraj Graphics & Sublimations",
    city: "Pune, Maharashtra",
    rating: 5,
    text: "Their dual-platen lanyard heat press machine and sublimation transfer rolls boosted our output from 400 lanyards/day to over 2,000/day. Prompt technical guidance on WhatsApp for temperature and pressure calibration. Complete peace of mind.",
  },
];

export default function GoogleReviews() {
  return (
    <section aria-labelledby="reviews-heading" className="bg-[#F3F5F7] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-end justify-between gap-4">
        <h2 id="reviews-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#16324F]">
          What buyers say
        </h2>
        <p className="shrink-0 flex items-center gap-2 text-sm text-[#475565]">
          <Star className="w-5 h-5 fill-[#D9601A] text-[#D9601A]" aria-hidden="true" />
          <span>
            <strong data-count className="text-lg font-extrabold text-[#16324F] tabular-nums">4.9</strong> on Google
          </span>
        </p>
      </div>

      <ul
        tabIndex={0}
        aria-label="Customer reviews, scroll sideways"
        className="mt-6 flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 px-4 sm:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      >
        {REVIEWS_DATA.map((rev) => (
          <li
            key={rev.id}
            data-no-reveal
            className="snap-center sm:snap-start shrink-0 w-[85vw] sm:w-[380px] bg-white border border-[#D8DEE5] rounded-lg p-5 flex flex-col"
          >
            <div className="flex gap-0.5" aria-label={`${rev.rating} out of 5`}>
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D9601A] text-[#D9601A]" aria-hidden="true" />
              ))}
            </div>
            <p className="mt-3 text-sm text-[#1C2733] leading-relaxed line-clamp-5 flex-1">{rev.text}</p>
            <p className="mt-4 text-sm font-bold text-[#16324F]">{rev.author}</p>
            <p className="text-xs text-[#566373]">{rev.city}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
