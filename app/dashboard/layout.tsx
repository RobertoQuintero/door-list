import type { ReactNode } from "react";
import { DashboardSessionProvider } from "@/components/dashboard-session-provider";
import "./dashboard.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardSessionProvider>{children}</DashboardSessionProvider>;
}
