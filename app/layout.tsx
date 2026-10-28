import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./unified-ui.css";

export const metadata: Metadata = {
  title: "Noches de Mercurio | door-list",
  description: "Registro para Noches de Mercurio en Ciudad de México.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
