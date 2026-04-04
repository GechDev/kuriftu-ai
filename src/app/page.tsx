import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Kuriftu
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Book rooms, manage stays, request services, and talk to the voice
          concierge — all on one platform.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/rooms">
            <Button>Browse rooms</Button>
          </Link>
          <Link href="/voice">
            <Button variant="secondary">Voice concierge</Button>
          </Link>
          <Link href="/register">
            <Button variant="ghost">Create account</Button>
          </Link>
        </div>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-3">
        <Card>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Book & pay preview
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            See nightly rates, availability calendar, and total for your dates
            before you confirm.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Stays & requests
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Upcoming and past bookings, housekeeping requests, and in-app
            notifications.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Staff dashboard
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Admins see revenue, active stays, check-in/out, and service queue.
          </p>
        </Card>
      </div>
    </div>
  );
}
