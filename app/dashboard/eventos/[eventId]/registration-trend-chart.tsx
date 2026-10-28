import type { CSSProperties } from "react";
import { formatRegistrationDay, formatRegistrationDayShort } from "@/lib/format";
import type { RegistrationTrendPoint } from "@/lib/types";

export function RegistrationTrendChart({ points }: { points: RegistrationTrendPoint[] }) {
  const peak = Math.max(...points.map((point) => point.count));
  const total = points.reduce((sum, point) => sum + point.count, 0);
  const labelStep = points.length <= 7 ? 1 : Math.ceil(points.length / 6);

  return <div className="registration-chart-panel">
    <div className="registration-chart-summary" aria-label={`Resumen: ${total} registros, pico de ${peak} en un día`}>
      <p><span>Total del periodo</span><strong>{total}</strong></p>
      <p><span>Pico diario</span><strong>{peak}</strong></p>
    </div>
    <div className="registration-chart-scroll" tabIndex={points.length > 14 ? 0 : undefined}>
      <div
        className="registration-chart"
        role="img"
        aria-label={`Gráfica de barras de registros diarios desde la publicación. El pico es de ${peak} registros en un día.`}
        style={{ "--chart-days": points.length } as CSSProperties}
      >
        {points.map((point, index) => {
          const showLabel = index === 0 || index === points.length - 1 || index % labelStep === 0;
          const label = `${formatRegistrationDay(point.date)}: ${point.count} ${point.count === 1 ? "registro" : "registros"}`;
          return <div className="registration-chart-day" aria-hidden="true" key={point.date}>
            <div className="registration-chart-bar" title={label}>
              <span style={{ height: `${point.count / peak * 100}%` }} />
            </div>
            <time dateTime={point.date}>{showLabel ? formatRegistrationDayShort(point.date) : ""}</time>
          </div>;
        })}
      </div>
    </div>
    <details className="registration-chart-data">
      <summary>Ver datos diarios</summary>
      <dl>{points.map((point) => <div key={point.date}>
        <dt><time dateTime={point.date}>{formatRegistrationDay(point.date)}</time></dt>
        <dd>{point.count}</dd>
      </div>)}</dl>
    </details>
  </div>;
}
