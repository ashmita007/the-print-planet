import React from "react";

/** Printer's crop marks at each corner of the parent, which must be position: relative. */
export function CropMarks({ color = "rgba(255,255,255,0.45)" }: { color?: string }) {
  const corners = [
    "-top-3 -left-3 border-t border-l",
    "-top-3 -right-3 border-t border-r",
    "-bottom-3 -left-3 border-b border-l",
    "-bottom-3 -right-3 border-b border-r",
  ];

  return (
    <>
      {corners.map((corner) => (
        <span
          key={corner}
          data-crop
          aria-hidden="true"
          className={`absolute w-5 h-5 pointer-events-none ${corner}`}
          style={{ borderColor: color }}
        />
      ))}
    </>
  );
}

const SWATCHES = ["#00A0DC", "#D6127E", "#F7D117", "#000000"];

/** Press colour bar, taken from the CMYK planet in the logo. */
export function ColorBar({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex gap-px ${className}`}>
      {SWATCHES.map((color) => (
        <span key={color} data-swatch className="block w-3 h-3 ring-1 ring-white/15" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}
