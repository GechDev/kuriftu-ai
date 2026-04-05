"use client";

interface HeatmapCell {
  day: string;
  slot: string;
  value: number;
}

function intensity(v: number): string {
  if (v >= 85) return "bg-accent text-white";
  if (v >= 65) return "bg-accent/70 text-white";
  if (v >= 45) return "bg-secondary/60 text-primary";
  return "bg-slate-200 text-primary";
}

export function DemandHeatmap({ data }: { data: HeatmapCell[] }) {
  const days = [...new Set(data.map((d) => d.day))];
  const slots = [...new Set(data.map((d) => d.slot))];
  const map = new Map(data.map((d) => [`${d.day}|${d.slot}`, d.value]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-center text-xs">
        <thead>
          <tr>
            <th className="p-2 text-left font-semibold text-muted">Time</th>
            {days.map((d) => (
              <th key={d} className="p-2 font-semibold text-primary">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot}>
              <td className="p-2 text-left font-medium text-muted">{slot}</td>
              {days.map((day) => {
                const v = map.get(`${day}|${slot}`) ?? 0;
                return (
                  <td key={`${day}-${slot}`} className="p-1">
                    <div
                      className={`rounded-lg px-2 py-3 font-bold transition ${intensity(v)}`}
                      title={`Demand ${v}`}
                    >
                      {v}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
