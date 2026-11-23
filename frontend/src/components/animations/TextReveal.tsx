import React from "react";
import type { CSSProperties } from "react";

interface TextRevealProps {
  text: string;
  className?: string;
  /** Index of the first word in the hero's stagger, so a second line follows the first. */
  offset?: number;
}

/** Word masks for the hero entrance. The rise is CSS (`[data-enter] [data-word]` in globals.css), so it
 *  plays at first paint; the words are plain text, readable without script and under reduced motion. */
export default function TextReveal({ text, className = "", offset = 0 }: TextRevealProps) {
  return (
    <span className={className}>
      {text.split(" ").map((word, index) => (
        <React.Fragment key={index}>
          {index > 0 && " "}
          <span className="inline-block overflow-hidden align-bottom pb-[0.2em] -mb-[0.2em]">
            <span data-word className="inline-block" style={{ ["--w" as string]: offset + index } as CSSProperties}>
              {word}
            </span>
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}
