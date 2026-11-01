import React from "react";

interface TextRevealProps {
  text: string;
  className?: string;
}

/** Word masks for hero timelines, which target [data-word]. Spaces stay real text so
 *  headings read correctly to screen readers and search engines. */
export default function TextReveal({ text, className = "" }: TextRevealProps) {
  return (
    <span className={className}>
      {text.split(" ").map((word, index) => (
        <React.Fragment key={index}>
          {index > 0 && " "}
          <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
            <span data-word className="inline-block will-change-transform">
              {word}
            </span>
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}
