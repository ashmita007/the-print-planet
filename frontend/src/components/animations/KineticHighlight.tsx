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
  glowColor = "rgba(232, 120, 50, 0.35)",
}: KineticHighlightProps) {
  return (
    <span className={`relative inline-block font-black ${className}`}>
      {/* Animated highlighter stroke */}
      <motion.span
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-1 left-0 h-[35%] -z-10 rounded-sm bg-gradient-to-r from-[#E87832]/35 via-[#FFA868]/45 to-[#FF8C38]/35"
        style={{
          boxShadow: `0 0 16px ${glowColor}`,
        }}
      />
      {children}
    </span>
  );
}
