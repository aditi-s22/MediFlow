import { Link } from "react-router-dom";
import { CalendarCheck, Users, ShieldCheck, Zap } from "lucide-react";

const techStack = [
  { label: "Frontend", items: "React 19, Vite, Tailwind CSS v4, React Router v7" },
  { label: "Backend", items: "Node.js, Express, MongoDB, Mongoose" },
  { label: "Real-time", items: "Socket.io (WebSocket rooms, event-driven updates)" },
  { label: "Auth", items: "JWT, bcryptjs, role-based access control" },
];

const highlights = [
  { icon: CalendarCheck, title: "Appointment booking", desc: "Patients browse doctors, pick time slots, and book in under a minute." },
  { icon: Zap, title: "Real-time queue", desc: "Socket.io pushes live queue updates to every connected client — zero polling." },
  { icon: Users, title: "Three user roles", desc: "Patient, Doctor, and Admin each have a dedicated experience and restricted API access." },
  { icon: ShieldCheck, title: "Secure by design", desc: "JWT authentication, bcrypt hashing, and strict role enforcement on every endpoint." },
];

function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
              <span className="text-xs font-bold text-white">M</span>
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900">MediFlow</span>
          </Link>
          <div className="flex gap-3">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Sign in</Link>
            <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-14">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">About MediFlow</p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">A full-stack portfolio project</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
            MediFlow is a Hospital Queue &amp; Appointment Management System built to demonstrate
            end-to-end product engineering — from a JWT-secured REST API to a real-time Socket.io
            queue that updates every connected client without a single page refresh.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {highlights.map((h) => (
            <div key={h.title} className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <h.icon className="h-5 w-5 text-blue-600" strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{h.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{h.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="mt-12 rounded-2xl bg-white p-8 ring-1 ring-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Tech stack</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {techStack.map((t) => (
              <div key={t.label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.label}</p>
                <p className="mt-1 text-sm text-gray-700">{t.items}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/register"
            className="inline-block rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try it now
          </Link>
          <p className="mt-3 text-sm text-gray-400">
            No credit card required. Register as a patient in seconds.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
