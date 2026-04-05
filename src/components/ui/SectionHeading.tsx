export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const a = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <div className={`mb-14 max-w-3xl ${a}`}>
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
      ) : null}
      <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-primary sm:text-4xl md:text-[2.35rem]">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
