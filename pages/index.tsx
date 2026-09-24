import Head from "next/head";
import Link from "next/link";
import InstallPWAButton from "@/components/Common/InstallPWAButton";
import { useCurrentUser } from "@/hooks/useAuth";
import { homeRouteForRole } from "@/lib/roles";
import { TRIAL_DAYS } from "@/lib/constants";

// Heroicons (outline) paths, inlined so the landing page has no icon dependency.
const ICONS = {
  attendance:
    "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  marks:
    "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342",
  timetable: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  fees: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
  messages:
    "M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  roles:
    "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  check: "M4.5 12.75l6 6 9-13.5",
};

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const FEATURES = [
  { icon: ICONS.attendance, title: "Attendance", text: "Mark a whole class in seconds and see who's missing at a glance." },
  { icon: ICONS.marks, title: "Marks & report cards", text: "Enter marks, auto-calculate grades and GPA, publish results." },
  { icon: ICONS.timetable, title: "Timetables", text: "Build class timetables with clash detection and quick substitutes." },
  { icon: ICONS.fees, title: "Fees & invoices", text: "Generate invoices, record payments and track what's outstanding." },
  { icon: ICONS.messages, title: "Messages & notices", text: "Reach teachers, students and parents with announcements and chat." },
  { icon: ICONS.roles, title: "Roles & permissions", text: "Give every staff member exactly the access their job needs." },
];

const PORTALS = [
  { name: "Admins", text: "Run the whole school" },
  { name: "Teachers", text: "Attendance, marks, timetable" },
  { name: "Students", text: "Results and schedule" },
  { name: "Parents", text: "Progress, attendance and fees" },
];

// Placeholder pricing — edit here when final plans are decided.
const PLANS = [
  {
    name: "Free trial",
    price: "Rs 0",
    period: `for ${TRIAL_DAYS} days`,
    features: ["Every feature included", "Unlimited users", "No credit card needed"],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Starter",
    price: "Rs 4,999",
    period: "per month",
    features: ["Up to 300 students", "All four portals", "Email support"],
    cta: "Get started",
    highlight: true,
  },
  {
    name: "Pro",
    price: "Rs 9,999",
    period: "per month",
    features: ["Unlimited students", "Custom roles", "Priority support"],
    cta: "Get started",
    highlight: false,
  },
];

// A lightweight, static picture of the product for the hero section.
function DashboardPreview() {
  const bars = [72, 88, 64, 95, 81, 90, 76];
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-3xl bg-brand-600/10 blur-2xl" />
      <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Good morning</p>
            <p className="font-display text-sm font-bold text-slate-900">Greenfield School</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Live</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Students", value: "1,240" },
            { label: "Present", value: "96%" },
            { label: "Fees paid", value: "82%" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">{s.label}</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-slate-100 p-3">
          <p className="mb-3 text-xs font-medium text-slate-500">Attendance this week</p>
          <div className="flex h-24 items-end gap-2">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-brand-600/85" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {["Mid-term results published", "Fee reminder sent to 38 parents"].map((t) => (
            <div key={t} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: user } = useCurrentUser();
  const dashboardHref = user ? homeRouteForRole(user.role.key) : null;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Head>
        <title>SchoolHub — Simple school management software</title>
        <meta
          name="description"
          content="Attendance, marks, timetables, fees and parent communication in one simple app for your whole school."
        />
      </Head>

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              S
            </span>
            <span className="font-display text-lg font-bold">SchoolHub</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            {dashboardHref ? (
              <Link
                href={dashboardHref}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-105 w-180 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
            <div className="animate-fade-in-up text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                {TRIAL_DAYS}-day free trial · no card needed
              </span>
              <h1 className="font-display mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Run your whole school from <span className="text-brand-600">one simple app</span>.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 lg:mx-0">
                Attendance, marks, timetables, fees and parent messages, all in one place for admins, teachers,
                students and parents.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/auth/signup"
                  className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700"
                >
                  Start your free trial
                </Link>
                <a
                  href="#features"
                  className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  See features
                </a>
              </div>
              <p className="mt-5 text-sm text-slate-500">Set up in minutes · Works on phone and desktop</p>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* Portals strip */}
        <section className="border-y border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
            {PORTALS.map((p) => (
              <div key={p.name} className="text-center">
                <p className="font-display text-base font-bold text-slate-900">{p.name}</p>
                <p className="mt-1 text-sm text-slate-500">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight">Everything your school needs</h2>
            <p className="mt-3 text-slate-600">No more spreadsheets, registers and WhatsApp groups. One app does it all.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="cms-card-hover rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon path={f.icon} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight">Simple, fair pricing</h2>
              <p className="mt-3 text-slate-600">Try everything free. Pick a plan when you&apos;re ready.</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-xl border bg-white p-6 ${
                    plan.highlight ? "border-brand-600 shadow-lg shadow-brand-600/10" : "border-slate-200"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-semibold text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                  <p className="mt-4">
                    <span className="font-display text-3xl font-bold">{plan.price}</span>
                    <span className="ml-1 text-sm text-slate-500">{plan.period}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Icon path={ICONS.check} className="h-4 w-4 shrink-0 text-brand-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/signup"
                    className={`mt-8 rounded-md px-4 py-2.5 text-center text-sm font-semibold ${
                      plan.highlight
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-brand-600 px-6 py-14 text-center text-white">
            <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10" />
            <h2 className="font-display relative text-3xl font-bold">Ready to simplify your school?</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-brand-50">
              Create your school in under two minutes and invite your staff today.
            </p>
            <Link
              href="/auth/signup"
              className="relative mt-8 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              Start your free trial
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} SchoolHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hover:text-slate-900">Sign in</Link>
            <Link href="/auth/register" className="hover:text-slate-900">Join your school</Link>
            <InstallPWAButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
