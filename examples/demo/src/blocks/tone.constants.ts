/**
 * The half of every block's tone map that is the same in every block.
 *
 * The accent pair is the reason this is shared rather than repeated. Halyard Teal measures
 * 1.91:1 against Deep Marine and is unreadable there, so a dark section needs the lighter
 * teal — a substitution easy to forget when each block carries its own copy, and invisible
 * once it is wrong. Centralising it means a block picks a tone rather than picking a colour.
 */
export const TONE_SURFACE = {
  light: "bg-canvas text-marine",
  dark: "bg-marine text-canvas",
} as const;

/** Accent text. light: 7.04:1 on canvas. dark: 6.11:1 on marine, where plain teal is 1.91:1. */
export const TONE_ACCENT = {
  light: "text-teal",
  dark: "text-teal-light",
} as const;
