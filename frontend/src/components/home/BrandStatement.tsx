import React from "react";

/** Big uppercase statement with small notes set between the words. */
export default function BrandStatement() {
  return (
    <section aria-labelledby="statement-heading" className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 text-center">
      <p className="eyebrow text-[#5B6877] mb-6">About The Print Planet</p>
      <h2 id="statement-heading" className="display-xl text-[#22272E]">
        <span data-reveal className="block">Welcome to</span>
        <span data-reveal className="block">
          the print
          <span className="display-note hidden md:inline-block text-[#5B6877]">Factory-direct from Sunkadakatte, Bengaluru</span>
          floor.
        </span>
        <span data-reveal className="block">
          Cards
          <span className="display-note hidden md:inline-block text-[#5B6877]">GST invoice on every order</span>
          made
        </span>
        <span data-reveal className="block">to order.</span>
      </h2>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10 max-w-3xl mx-auto mt-14 text-left text-[15px] leading-relaxed text-[#4E5A67]">
        <p data-reveal>
          We print PVC and RFID cards, satin lanyards and badge holders for schools, offices,
          hospitals and events, and sell the machines and consumables to print your own.
        </p>
        <p data-reveal>
          Orders ship from our own floor in Bengaluru to every state in India. Send us a quantity
          and an artwork file, and you get a digital proof before anything is printed.
        </p>
      </div>

      <div data-rule className="rule-dashed text-[#22272E] max-w-3xl mx-auto mt-14" />
    </section>
  );
}
