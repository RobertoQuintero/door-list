import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./unified-ui.css";

export const metadata: Metadata = {
  title: {
    default: "Door List",
    template: "%s | Door List",
  },
  description: "Publica eventos, registra asistentes y gestiona el acceso en puerta.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
