import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Entrada digital | Door list",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function TicketLayout({ children }: { children: ReactNode }) {
  return children;
}
