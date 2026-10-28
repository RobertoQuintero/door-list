import { EventDashboardView } from "./event-dashboard-view";

export default async function EventDashboardPage({ params }: PageProps<"/dashboard/eventos/[eventId]">) {
  const { eventId } = await params;
  return <EventDashboardView eventId={eventId} />;
}
