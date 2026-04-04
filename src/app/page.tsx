import { IconMic, IconRooms, IconSpark } from "@/components/icons";
import { VoiceHomePromo } from "@/components/voice-home-promo";
import { Card, LinkButton } from "@/components/ui";

const features = [
  {
    title: "Voice concierge",
    body: "Speak naturally about rooms, resorts, and services—our agent answers in real time, then you book on the web.",
    icon: IconMic,
  },
  {
    title: "Reservations, clearly",
    body: "Live availability, transparent rates, and a calm path from browsing to confirmed dates.",
    icon: IconRooms,
  },
  {
    title: "Guest services",
    body: "Housekeeping, dining, and on-property requests flow through one refined dashboard.",
    icon: IconSpark,
  },
];

const highlights = [
  { label: "Voice-first", detail: "Conversational help before you tap another screen" },
  { label: "Lakeside settings", detail: "Quiet waterfront and garden properties" },
  { label: "Spa & dining", detail: "Wellness and regional cuisine on site" },
  { label: "Private occasions", detail: "Celebrations and retreats, curated" },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 sm:pt-16 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Kuriftu · Voice & stays
          </p>
          <div className="hotel-rule mx-auto mt-6 max-w-[12rem] animate-fade-up-delay-1" />
          <h1 className="animate-fade-up-delay-1 mt-8 font-display text-[2.75rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
            Your resort host
            <span className="mt-2 block font-normal italic text-muted sm:mt-3">
              speaks with you first
            </span>
          </h1>
          <p className="animate-fade-up-delay-2 mx-auto mt-8 max-w-xl text-[15px] leading-[1.7] text-muted">
            Start with our voice agent for questions about the collection—then view rooms, lock in
            dates, and manage guest services on the site whenever you like.
          </p>
          <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/voice" className="min-w-[200px] px-8 py-3.5 text-[15px]">
              Open voice agent
            </LinkButton>
            <LinkButton
              href="/rooms"
              variant="secondary"
              className="min-w-[168px] px-7 py-3.5 text-[15px]"
            >
              View rooms & suites
            </LinkButton>
            <LinkButton
              href="/resorts"
              variant="outline"
              className="min-w-[160px] px-6 py-3.5 text-[15px]"
            >
              Our resorts
            </LinkButton>
          </div>
        </div>

        <VoiceHomePromo />

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-px border border-border bg-border sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map(({ label, detail }) => (
            <div
              key={label}
              className="bg-white px-5 py-8 text-center sm:text-left lg:px-7"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                {label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-4xl text-center sm:mt-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            How we help
          </p>
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Voice, web, and guest care together
          </h2>
        </div>

        <div className="mx-auto mt-12 grid gap-6 sm:grid-cols-3 lg:mt-14 lg:gap-8">
          {features.map(({ title, body, icon: Icon }, i) => (
            <Card
              key={title}
              hover
              className={`relative overflow-hidden border-t-2 border-t-accent/40 p-7 lg:p-8 ${
                i === 1 ? "sm:translate-y-3 lg:translate-y-5" : ""
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center border border-border bg-surface-2 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-2xl rounded-sm border border-dashed border-border bg-surface-2/40 px-6 py-10 text-center sm:mt-24">
          <p className="font-display text-lg font-medium text-foreground sm:text-xl">
            Save your stays
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            Create an account to keep reservations, guest services, and messages in one place.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton href="/register" variant="outline" className="px-6 py-3">
              Create account
            </LinkButton>
            <LinkButton href="/login" variant="ghost" className="px-6 py-3">
              Sign in
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
