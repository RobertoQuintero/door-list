export default function Home() {
  return (
    <main className="event-shell">
      <article className="event-ticket" aria-labelledby="event-title">
        <h1 id="event-title">Noches de Mercurio</h1>
        <time dateTime="2026-11-14T20:00:00-06:00">
          Sábado · 14 noviembre 2026 · 20:00
        </time>
        <address>Foro Indie Rocks! · Ciudad de México</address>
        <button type="button">Regístrame</button>
      </article>
    </main>
  );
}