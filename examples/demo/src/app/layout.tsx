import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tidewell — one schedule, read the same way by everyone",
  description:
    "Tidewell turns scattered planning docs into one schedule everyone on the team reads the same way.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
