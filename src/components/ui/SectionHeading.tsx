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
  const a = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`mb-12 max-w-3xl ${a}`}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-4 text-lg text-muted">{subtitle}</p> : null}
    </div>
  );
}
