import type { CSSProperties } from "react";

/** Position in a hero's entrance stagger (60ms a step); read by `[data-enter-item]` in globals.css. */
export const enterStep = (index: number): CSSProperties => ({ ["--i" as string]: index }) as CSSProperties;
