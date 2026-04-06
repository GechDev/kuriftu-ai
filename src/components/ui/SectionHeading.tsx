export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const a = align === "center" ? "mx-auto text-center" : "text-left";
  const isDark = className.includes("text-white");
  
  return (
    <div className={`mb-14 max-w-3xl ${a} ${className}`}>
      {eyebrow ? (
        <p className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${isDark ? "text-gold-400" : "text-accent"}`}>{eyebrow}</p>
      ) : null}
      <h2 className={`text-[1.75rem] font-semibold leading-tight tracking-tight ${isDark ? "text-white" : "text-primary"} sm:text-4xl md:text-[2.35rem]`}>
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed ${isDark ? "text-white/85" : "text-muted"} md:text-lg ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
