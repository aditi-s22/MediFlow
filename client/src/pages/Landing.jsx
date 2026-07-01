import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Clock,
  Users,
  BarChart3,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

// ─── Public Navbar ────────────────────────────────────────────────────────────
function PublicNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
            <span className="text-xs font-bold text-white">M</span>
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900">MediFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 py-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-800">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="mt-3 text-sm leading-relaxed text-gray-500">{answer}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-14 pb-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Real-time queue management for hospitals
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Hospital queues,{" "}
            <span className="text-blue-600">reimagined</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
            MediFlow replaces paper tokens and crowded waiting rooms with a
            digital queue that updates in real time — so patients wait smarter
            and doctors work better.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="w-full rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="w-full rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="mx-auto mt-10 max-w-4xl px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-100">
            <div className="mb-4 flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-gray-400">Doctor Dashboard — Live Queue</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Today's Appointments", value: "12", valueClass: "text-blue-600" },
                { label: "Checked In", value: "7", valueClass: "text-green-600" },
                { label: "Completed", value: "4", valueClass: "text-gray-600" },
                { label: "Waiting", value: "3", valueClass: "text-amber-600" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {s.label}
                  </p>
                  <p className={`mt-2 text-2xl font-bold ${s.valueClass}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[
                { name: "Priya Sharma", time: "10:00 AM", queue: "#1", status: "Serving", serving: true },
                { name: "Arjun Mehta", time: "10:30 AM", queue: "#2", status: "1 ahead", serving: false },
                { name: "Neha Patel", time: "11:00 AM", queue: "#3", status: "2 ahead", serving: false },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                    p.serving ? "border border-blue-200 bg-blue-50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${p.serving ? "text-blue-600" : "text-gray-400"}`}>
                      {p.queue}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.time}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.serving
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">3</p>
              <p className="mt-1 text-sm text-gray-500">User roles supported</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">&lt;1s</p>
              <p className="mt-1 text-sm text-gray-500">Queue update latency</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="mt-1 text-sm text-gray-500">No page refresh needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">From booking to consultation in three steps</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: CalendarCheck,
                title: "Book an appointment",
                desc: "Patients browse doctors by specialization, pick an available time slot, and confirm their booking — all from their phone or desktop.",
              },
              {
                step: "02",
                icon: CheckCircle2,
                title: "Check in on arrival",
                desc: "On the day of the appointment, patients tap Check In. The system instantly assigns a queue number and notifies the doctor.",
              },
              {
                step: "03",
                icon: Clock,
                title: "Track the queue live",
                desc: "Both the patient and the doctor see the queue update in real time as each consultation completes — no refreshing required.",
              },
            ].map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                <span className="absolute right-5 top-5 text-3xl font-black text-gray-50">{s.step}</span>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <s.icon className="h-5 w-5 text-blue-600" strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features by role ── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Built for everyone</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Every role has what it needs</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                role: "Patients",
                icon: Smartphone,
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
                features: [
                  "Book appointments in under a minute",
                  "Real-time queue position tracking",
                  "Estimated wait time updates",
                  "Full appointment history",
                  "One-tap cancellation",
                ],
              },
              {
                role: "Doctors",
                icon: Users,
                iconBg: "bg-green-50",
                iconColor: "text-green-600",
                features: [
                  "Live queue dashboard",
                  "Call the next patient with one click",
                  "Mark consultations complete instantly",
                  "View all scheduled appointments",
                  "Queue auto-updates without refresh",
                ],
              },
              {
                role: "Administrators",
                icon: BarChart3,
                iconBg: "bg-purple-50",
                iconColor: "text-purple-600",
                features: [
                  "System-wide appointment overview",
                  "Create and manage doctor accounts",
                  "Set doctor availability and fees",
                  "Search and filter all appointments",
                  "Platform health at a glance",
                ],
              },
            ].map((r) => (
              <div key={r.role} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${r.iconBg}`}>
                  <r.icon className={`h-5 w-5 ${r.iconColor}`} strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-semibold text-gray-900">{r.role}</h3>
                <ul className="mt-4 space-y-2.5">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real-time highlight ── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-2xl bg-blue-600">
            <div className="grid grid-cols-1 items-center gap-0 md:grid-cols-2">
              <div className="p-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                  Powered by Socket.io
                </p>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  Live updates. Zero polling.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-blue-100">
                  When a patient checks in, the doctor's dashboard updates
                  instantly. When the doctor calls the next patient, every
                  waiting patient's position refreshes automatically — without
                  a single page reload.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    "Patient checks in → doctor notified instantly",
                    "Doctor calls next → all patients see update",
                    "Appointment completed → queue shrinks live",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-blue-100">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center bg-blue-700 p-10">
                <div className="w-full max-w-xs space-y-3">
                  {[
                    { name: "Meera Iyer", queue: "#1", status: "Currently serving", active: true },
                    { name: "Ravi Kumar", queue: "#2", status: "~15 min wait", active: false },
                    { name: "Anjali Singh", queue: "#3", status: "~30 min wait", active: false },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                        p.active ? "bg-white" : "bg-blue-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${p.active ? "text-blue-600" : "text-blue-200"}`}>
                          {p.queue}
                        </span>
                        <div>
                          <p className={`text-sm font-medium ${p.active ? "text-gray-900" : "text-white"}`}>
                            {p.name}
                          </p>
                          <p className={`text-xs ${p.active ? "text-blue-600" : "text-blue-300"}`}>
                            {p.status}
                          </p>
                        </div>
                      </div>
                      {p.active && (
                        <span className="flex h-2 w-2 rounded-full bg-green-400">
                          <span className="h-2 w-2 animate-ping rounded-full bg-green-400" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Testimonials</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">What people are saying</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "I used to spend 45 minutes waiting just to find out I was next. Now I sit in my car and check in from my phone.",
                name: "Sonia Reddy",
                role: "Patient",
              },
              {
                quote:
                  "The live queue has completely changed how I manage my clinic day. No more nurses shouting names — patients come in when they're called.",
                name: "Dr. Vikram Naidu",
                role: "General Physician",
              },
              {
                quote:
                  "Setting up doctors and managing appointments used to take our staff hours. Now it takes minutes.",
                name: "Rohan Das",
                role: "Clinic Administrator",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm leading-relaxed text-gray-600">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust / security ── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-10 text-center shadow-sm">
            <ShieldCheck className="h-8 w-8 text-green-500" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-gray-900">Built with security in mind</h3>
            <p className="max-w-md text-sm text-gray-500">
              JWT-based authentication, role-based access control, and bcrypt
              password hashing ensure only the right people see the right
              data — always.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Common questions</h2>
          </div>
          <div>
            {[
              {
                question: "Is MediFlow free to use?",
                answer:
                  "MediFlow is an open-source project built as a portfolio demonstration. You can run it locally for free or deploy it to your preferred cloud provider.",
              },
              {
                question: "How does the real-time queue work?",
                answer:
                  "MediFlow uses Socket.io to push queue updates from the server to all connected clients. When a patient checks in, completes, or cancels, every relevant dashboard updates instantly — without any polling or page refresh.",
              },
              {
                question: "Can doctors set their own availability?",
                answer:
                  "Yes. Doctors can update their available time slots from their Profile page. Patients can only book appointments in those declared slots.",
              },
              {
                question: "Who can see patient information?",
                answer:
                  "Patients see only their own appointments. Doctors see appointments assigned to them. Admins have a system-wide view. Access control is enforced on every API endpoint.",
              },
              {
                question: "What happens if the server restarts mid-queue?",
                answer:
                  "The queue order (check-in numbers) is stored in MongoDB and persists across restarts. Only the 'currently serving' pointer lives in server memory — the doctor simply presses Call Next once to restore it.",
              },
            ].map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to try it?</h2>
          <p className="mt-4 text-gray-500">
            Create a patient account in seconds. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="w-full rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
            >
              Create free account
            </Link>
            <Link
              to="/login"
              className="w-full rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <span className="text-sm font-bold text-gray-900">MediFlow</span>
              <span className="text-sm text-gray-400">— Hospital Queue Management</span>
            </div>
            <div className="flex items-center gap-5 text-sm text-gray-500">
              <Link to="/login" className="hover:text-gray-900">Sign in</Link>
              <Link to="/register" className="hover:text-gray-900">Register</Link>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
