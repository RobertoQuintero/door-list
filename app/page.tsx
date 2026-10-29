import type { Metadata } from "next";
import PublicEventsClient from "./public-events-client";

export const metadata: Metadata = {
  title: "Eventos con registro abierto",
  description: "Consulta próximos eventos con lugares disponibles y registra tu entrada.",
};

export default function PublicEventsPage() {
  return <PublicEventsClient />;
}
