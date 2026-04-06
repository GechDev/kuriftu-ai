import Link from "next/link";
import type { ComponentProps } from "react";

function cn(...parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(" ");
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-9 w-9 animate-spin rounded-full border-2 border-t-accent",
        className?.includes("text-white") 
          ? "border-white/30 border-t-gold-400" 
          : "border-border border-t-accent",
        className
      )}
      aria-label="Loading"
    />
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const isDark = className?.includes("text-white");
  
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
            isDark ? "text-gold-400" : "text-muted"
          }`}>
            {eyebrow}
          </p>
        ) : null}
        <h1 className={`font-display text-[2rem] font-semibold tracking-tight ${
          isDark ? "text-white" : "text-foreground"
        } sm:text-[2.5rem]`}>
          {title}
        </h1>
        {description ? (
          <p className={`max-w-xl text-[15px] leading-relaxed ${
            isDark ? "text-white/70" : "text-muted"
          }`}>{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const isDark = className?.includes("bg-black") || className?.includes("border-white");
  
  return (
    <div
      className={cn(
        "rounded-sm p-6 shadow-xl transition-all duration-300",
        isDark 
          ? "border border-white/10 bg-black/40 backdrop-blur-xl hover:border-gold-400/30 hover:shadow-2xl"
          : "border border-border bg-white shadow-[var(--shadow-card)] hover:border-border hover:shadow-[var(--shadow-card-hover)]",
        hover && "duration-200 ease-out",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "muted" | "accent" | "secondary";
  className?: string;
}) {
  const styles = {
    default:
      "bg-surface-2 text-foreground ring-1 ring-border/60",
    success:
      "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200",
    warning:
      "bg-amber-50 text-amber-950 ring-1 ring-amber-200",
    muted: "bg-border/40 text-muted ring-1 ring-border/60",
    accent: "bg-accent-muted text-accent ring-1 ring-accent/25",
    secondary:
      "bg-white/10 text-white ring-1 ring-white/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  disabled,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
}) {
  const v = {
    primary:
      "bg-accent text-accent-fg shadow-sm hover:bg-accent-hover active:scale-[0.99]",
    secondary:
      "border border-border bg-white text-foreground shadow-sm hover:bg-surface-2",
    outline:
      "border border-border bg-transparent text-foreground hover:border-accent/50 hover:bg-accent-muted/50",
    ghost: "text-muted hover:bg-surface-2 hover:text-foreground",
    danger: "bg-danger text-white hover:opacity-90",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-medium tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45",
        v[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const linkFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Next.js `<Link>` styled as a button — avoids invalid `<a><button>` nesting. */
export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
}) {
  const v = {
    primary:
      "bg-accent text-accent-fg shadow-sm hover:bg-accent-hover active:scale-[0.99]",
    secondary:
      "border border-border bg-white text-foreground shadow-sm hover:bg-surface-2",
    outline:
      "border border-border bg-transparent text-foreground hover:border-accent/50 hover:bg-accent-muted/50",
    ghost: "text-muted hover:bg-surface-2 hover:text-foreground",
    danger: "bg-danger text-white hover:opacity-90",
  };
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-medium tracking-wide transition",
        linkFocus,
        v[variant],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
  }
) {
  const { label, className, id, ...rest } = props;
  const inputId = id ?? rest.name;
  const isDark = className?.includes("text-white");
  
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className={`text-sm font-medium ${
            isDark ? "text-white/80" : "text-foreground/90"
          }`}
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "rounded-sm border px-3.5 py-2.5 text-sm shadow-inner shadow-black/[0.04] outline-none transition",
          "placeholder:text-muted/70 focus:ring-2 focus:ring-accent/25",
          isDark 
            ? "border-white/20 bg-black/50 text-white placeholder:text-white/30 focus:border-gold-400 focus:ring-gold-400/25"
            : "border-border bg-white text-foreground focus:border-accent",
          className
        )}
        {...rest}
      />
    </div>
  );
}

export function SelectField(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
  }
) {
  const { label, className, id, children, ...rest } = props;
  const selectId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-foreground/90"
        >
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={cn(
          "rounded-sm border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition",
          "focus:border-accent focus:ring-2 focus:ring-accent/25",
          className
        )}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
  }
) {
  const { label, className, id, ...rest } = props;
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground/90"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className={cn(
          "min-h-[120px] rounded-sm border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition",
          "placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/25",
          className
        )}
        {...rest}
      />
    </div>
  );
}

export function Alert({
  children,
  variant = "error",
}: {
  children: React.ReactNode;
  variant?: "error" | "info";
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        variant === "error" &&
          "border-danger/25 bg-danger-muted text-danger",
        variant === "info" &&
          "border-accent/25 bg-accent-muted/50 text-foreground"
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-white/20 bg-black/30 py-16 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

export function TableWrap({ children, className }: { children: React.ReactNode, className?: string }) {
  const isDark = className?.includes("border-white") || className?.includes("bg-black") || className?.includes("text-white");
  return (
    <div className={cn(
      "overflow-hidden rounded-sm border shadow-sm",
      isDark 
        ? "border-white/10 bg-black/40 backdrop-blur-xl" 
        : "border-border bg-white",
      className
    )}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
