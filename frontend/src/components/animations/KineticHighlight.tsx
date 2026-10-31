"use client";

import React from "react";
import { motion } from "motion/react";

interface KineticHighlightProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function KineticHighlight({
  children,
  className = "",
  glowColor = "rgba(37, 99, 235, 0.4)",
}: KineticHighlightProps) {
  return (
    <span className={`relative inline-block font-black ${className}`}>
      {/* Animated highlighter stroke */}
      <motion.span
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-1 left-0 h-[35%] -z-10 rounded-sm bg-gradient-to-r from-blue-600/35 via-blue-500/45 to-sky-400/35"
        style={{
          boxShadow: `0 0 16px ${glowColor}`,
        }}
      />
      {children}
    </span>
  );
}
