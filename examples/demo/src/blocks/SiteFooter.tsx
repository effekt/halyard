import type { z } from "zod";
import type { siteFooterSchema } from "./SiteFooter.schema";

type SiteFooterProps = z.infer<typeof siteFooterSchema>;

const TONE_STYLES = {
  light: { section: "bg-canvas text-marine", muted: "text-marine/60" },
  dark: { section: "bg-marine text-canvas", muted: "text-canvas/50" },
} as const;

export function SiteFooter({ tagline, tone, columns, legal }: SiteFooterProps) {
  const styles = TONE_STYLES[tone];
  return (
    <footer className={`${styles.section} border-brass/30 border-t px-6 py-16`}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <p className="max-w-xs text-sm">{tagline}</p>
          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wide">{column.heading}</h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm hover:underline">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={`mt-12 text-xs ${styles.muted}`}>{legal}</p>
      </div>
    </footer>
  );
}
