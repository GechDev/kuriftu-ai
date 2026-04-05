import { VoiceConcierge } from "@/components/VoiceConcierge";
import { IconMic, IconRooms, IconSpark } from "@/components/icons";
import { LinkButton } from "@/components/ui";

const benefits = [
  {
    title: "Rooms & availability",
    body: "Ask what is open for your dates and how categories differ before you confirm on the web.",
    Icon: IconRooms,
  },
  {
    title: "Resort & services",
    body: "Dining, spa, directions, and housekeeping—explained clearly in one flowing conversation.",
    Icon: IconSpark,
  },
  {
    title: "Always hands-free",
    body: "Designed for busy moments: walking the grounds, unpacking, or planning tomorrow’s outing.",
    Icon: IconMic,
  },
];

export default function VoicePage() {
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="mb-10 text-center lg:mb-12 lg:text-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
            Primary experience
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Voice agent
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted lg:mx-0">
            The fastest way to explore Kuriftu is to speak with your host. Use the panel below,
            then browse or book on the site whenever you need a written record.
          </p>
        </div>

        <div className="flex flex-col gap-12 xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start xl:gap-14">
          <div className="order-1 w-full min-w-0 xl:order-1">
            <VoiceConcierge />
          </div>

          <aside className="order-2 space-y-8 xl:sticky xl:top-28 xl:order-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                What you can ask
              </p>
              <ul className="mt-5 space-y-6">
                {benefits.map(({ title, body, Icon }) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-white text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-surface-2/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                Tip
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Sign in on this site first so reservations and guest services stay linked to your
                account.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <LinkButton href="/rooms" variant="secondary" className="justify-center py-3">
                Browse rooms
              </LinkButton>
              <LinkButton href="/" variant="ghost" className="justify-center py-3">
                Home
              </LinkButton>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
