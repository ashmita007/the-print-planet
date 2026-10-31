"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  highlightWords?: string[];
  highlightClassName?: string;
}

export default function TextReveal({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.04,
  as: Tag = "span",
  highlightWords = [],
  highlightClassName = "text-transparent bg-clip-text bg-gradient-to-r from-[#FFA868] via-[#E87832] to-[#FF8C38]",
}: TextRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const container = {
    hidden: { opacity: 0 },
    visible: (custom = 1) => ({
      opacity: 1,
      transition: { staggerChildren: staggerDelay, delayChildren: delay * custom },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: "35%",
      rotateX: -25,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: "0%",
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 140,
      },
    },
  };

  return (
    <motion.span
      className={`inline-block overflow-hidden ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {words.map((word, index) => {
        const isHighlighted = highlightWords.some(
          (hw) => hw.toLowerCase() === word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
        );

        return (
          <motion.span
            key={index}
            variants={child}
            className={`inline-block mr-[0.28em] will-change-transform ${
              isHighlighted ? highlightClassName : ""
            }`}
            style={{ transformOrigin: "50% 100%" }}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
