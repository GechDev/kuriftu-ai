import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-bold">Kuriftu NEXORA</p>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Where Hospitality Meets Intelligence. Built for Kuriftu Resort and forward-thinking hotel teams.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>
                <Link href="/intellirate" className="hover:text-white">
                  IntelliRate Engine
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white">
                  Service Optimizer
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white">
                  Features
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>
                <a href="mailto:hello@kuriftu.nexora" className="hover:text-white">
                  hello@kuriftu.nexora
                </a>
              </li>
              <li>
                <span>+251 11 555 0142</span>
              </li>
              <li>
                <span>Bishoftu, Ethiopia</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Kuriftu NEXORA. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
