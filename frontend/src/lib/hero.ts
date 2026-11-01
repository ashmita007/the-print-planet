import { SiteSettings } from "./types";

export const HERO_DEFAULTS = {
  badge: "Factory direct from Bengaluru",
  title: "Everything for ID cards.",
  subtitle: "Factory direct.",
  caption: "Cards, lanyards, holders, RFID and machines.",
};

/** Word counts that keep the hero tidy. Longer text still shows, at a smaller size. */
export const HERO_LIMITS = { headline: 60, caption: 90 };

export interface HeroCopy {
  badge: string;
  title: string;
  subtitle: string;
  caption: string;
}

export function heroCopy(settings?: Partial<SiteSettings> | null): HeroCopy {
  return {
    badge: settings?.hero_badge?.trim() || HERO_DEFAULTS.badge,
    title: settings?.hero_title?.trim() || HERO_DEFAULTS.title,
    subtitle: settings?.hero_subtitle?.trim() || HERO_DEFAULTS.subtitle,
    caption: settings?.hero_caption?.trim() || HERO_DEFAULTS.caption,
  };
}

/** One rule for the public hero and the owner preview, so both always match. */
export function heroHeadlineClass(copy: HeroCopy) {
  const length = copy.title.length + copy.subtitle.length;
  if (length > 90) return "text-[1.625rem] sm:text-[2rem] lg:text-[2.25rem]";
  if (length > HERO_LIMITS.headline) return "text-[2rem] sm:text-4xl lg:text-[2.75rem]";
  return "text-[2.5rem] sm:text-5xl lg:text-[4rem]";
}
