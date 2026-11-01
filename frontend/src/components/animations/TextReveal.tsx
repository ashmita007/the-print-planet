import React from "react";

interface TextRevealProps {
  text: string;
  className?: string;
}

/** Word masks for the hero timeline in ProductHeroShowcase, which targets [data-word]. */
export default function TextReveal({ text, className = "" }: TextRevealProps) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((word, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em] mr-[0.26em]"
        >
          <span data-word className="inline-block will-change-transform">
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
