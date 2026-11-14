import { SiteSettings } from "./types";

export const HERO_DEFAULTS = {
  badge: "Factory direct from Bengaluru",
  title: "PVC cards, lanyards & ID machines.",
  subtitle: "Factory direct.",
  caption: "CR-80 PVC cards, dragon sheets, satin lanyard rolls, RFID and card fusing machines.",
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

/** One rule for the public hero and the owner preview, so both always match with next-level scale. */
export function heroHeadlineClass(copy: HeroCopy) {
  const length = copy.title.length + copy.subtitle.length;
  if (length > 90) return "text-[1.875rem] sm:text-[2.25rem] lg:text-[2.75rem] xl:text-[3.125rem]";
  if (length > HERO_LIMITS.headline) return "text-3xl sm:text-4xl lg:text-[3.25rem]";
  return "text-4xl sm:text-5xl lg:text-6xl";
}
