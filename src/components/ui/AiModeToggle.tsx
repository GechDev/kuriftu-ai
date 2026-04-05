"use client";

export function AiModeToggle({
  enabled,
  onChange,
  label = "AI Mode",
  onDark = false,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  /** Light text / border for use on photography or dark gradients */
  onDark?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm ${
        onDark
          ? "border border-white/20 bg-white/10 backdrop-blur-md"
          : "border border-border bg-card"
      }`}
    >
      <span className={`text-sm font-medium ${onDark ? "text-white" : "text-primary"}`}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-14 rounded-full transition-colors duration-300 ${
          enabled ? "bg-accent" : onDark ? "bg-white/25" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ${
            enabled ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
      <span
        className={`text-xs font-semibold ${
          enabled ? (onDark ? "text-[#e8dcc8]" : "text-accent") : onDark ? "text-white/60" : "text-muted"
        }`}
      >
        {enabled ? "ON" : "OFF"}
      </span>
    </div>
  );
}
