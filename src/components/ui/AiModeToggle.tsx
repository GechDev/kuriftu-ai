"use client";

export function AiModeToggle({
  enabled,
  onChange,
  label = "AI Mode",
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-14 rounded-full transition-colors duration-300 ${
          enabled ? "bg-accent" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ${
            enabled ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
      <span className={`text-xs font-semibold ${enabled ? "text-accent" : "text-muted"}`}>
        {enabled ? "ON" : "OFF"}
      </span>
    </div>
  );
}
