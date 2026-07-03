import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Users,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Building,
  Activity,
  Heart,
  Stethoscope,
  Star,
  Layers,
} from "lucide-react";
import { useState } from "react";

// ─── Public Navbar ────────────────────────────────────────────────────────────
function PublicNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <Heart className="h-5 w-5 fill-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">MediFlow</span>
            <span className="ml-1.5 rounded-full bg-teal-50 px-2 py-0.5 text-2xs font-medium text-teal-700 border border-teal-100">HMS</span>
          </div>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How it Works</a>
          <a href="#specialties" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Specialties</a>
          <a href="#featured-doctors" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Featured Doctors</a>
          <a href="#platform-features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Platform Features</a>
          <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-200"
          >
            Register
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
    <div className="border-b border-slate-100 py-5 transition-all">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-slate-800 hover:text-blue-600 transition-colors">{question}</span>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-transform ${open ? "rotate-180 bg-blue-50 text-blue-600" : ""}`}>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </span>
      </button>
      {open && (
        <p className="mt-3 text-sm leading-relaxed text-slate-500 bg-slate-50/50 p-4 rounded-xl border border-slate-50">
          {answer}
        </p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 selection:bg-blue-600 selection:text-white font-sans antialiased">
      <PublicNav />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20 border-b border-slate-100">
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-blue-50/50 blur-3xl" />
        <div className="absolute bottom-0 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-teal-50/30 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-5 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                Hospital management system
              </span>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
                One platform to run <br />
                <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  your entire hospital
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-500">
                Discover specialists, book appointments, manage consultations, and track live queues — with dedicated workspaces for patients, doctors, and administrators.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <CalendarCheck className="h-4.5 w-4.5" />
                  Book Appointment
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                >
                  <Stethoscope className="h-4.5 w-4.5 text-slate-500" />
                  Explore Doctors
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 border-t border-slate-100 pt-8">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=100&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=100&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=100&auto=format&fit=crop",
                  ].map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt="Doctor Profile"
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">10+ Clinical Specialties</p>
                  <p className="text-xs text-slate-500">Seeded with realistic medical credentials</p>
                </div>
              </div>
            </div>

            {/* Right: Hospital Browser Mockup Preview */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-900 p-3.5 shadow-2xl shadow-slate-300 relative">
                {/* Browser bar */}
                <div className="mb-3.5 flex items-center justify-between px-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="rounded bg-slate-800 px-10 py-1 text-[11px] text-slate-400 font-mono">
                    mediflow.hospital.org/control-center
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">LIVE FEED</span>
                  </div>
                </div>

                {/* Mockup content */}
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-left text-slate-200">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-blue-400" />
                        MediFlow Clinic Control Center
                      </h3>
                      <p className="text-[11px] text-slate-400">Real-time Operations & Active Consultation Queues</p>
                    </div>
                    <span className="rounded-full bg-blue-900/50 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                      Dept: General Wing
                    </span>
                  </div>

                  {/* Browser Mockup Layout Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Left: Queue Tracker (7 cols) */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="flex items-center justify-between rounded bg-slate-900/80 p-2.5 border border-slate-800">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">Current Serving</p>
                          <p className="text-sm font-bold text-emerald-400">#04 - Aarav Sharma (Cardiology)</p>
                        </div>
                        <span className="rounded bg-emerald-950 border border-emerald-800 px-2 py-1 text-2xs font-bold text-emerald-400">
                          Active
                        </span>
                      </div>

                      <div className="rounded bg-slate-900/40 p-3 border border-slate-800">
                        <h4 className="text-xs font-bold text-white mb-2">Today's Appointment Queue</h4>
                        <div className="space-y-1.5">
                          {[
                            { name: "Aditya Verma", spec: "Neurology", queue: "#05", status: "Next In Line", color: "text-blue-400 bg-blue-950 border-blue-800" },
                            { name: "Sneha Reddy", spec: "Pediatrics", queue: "#06", status: "15 min wait", color: "text-slate-300 bg-slate-900 border-slate-800" },
                            { name: "Pooja Hegde", spec: "Gynecology", queue: "#07", status: "28 min wait", color: "text-slate-400 bg-slate-900 border-slate-800" },
                          ].map((appt, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded p-2 bg-slate-950 border border-slate-800 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-400">{appt.queue}</span>
                                <div>
                                  <p className="font-medium text-white">{appt.name}</p>
                                  <p className="text-[10px] text-slate-400">{appt.spec}</p>
                                </div>
                              </div>
                              <span className={`rounded px-1.5 py-0.5 text-[9px] border ${appt.color}`}>
                                {appt.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Feed (5 cols) */}
                    <div className="md:col-span-5 space-y-3">
                      <div className="rounded bg-slate-900/40 p-3 border border-slate-800 text-xs">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-1">
                          <Activity className="h-3 w-3 text-teal-400" />
                          Upcoming Consults
                        </h4>
                        <div className="space-y-2 text-[11px] text-slate-300">
                          <div className="border-l-2 border-blue-500 pl-2">
                            <p className="font-bold text-white">10:30 AM — Dr. Ananya Sharma</p>
                            <p className="text-slate-400">Cardiology Consultation</p>
                          </div>
                          <div className="border-l-2 border-teal-500 pl-2">
                            <p className="font-bold text-white">11:00 AM — Dr. Rohan Mehta</p>
                            <p className="text-slate-400">Stroke Follow-Up</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded bg-slate-900/40 p-3 border border-slate-800">
                        <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1">
                          <Layers className="h-3 w-3 text-orange-400" />
                          Live Activity Log
                        </h4>
                        <div className="space-y-1 text-[10px] font-mono text-slate-400">
                          <p className="text-emerald-400 font-bold">10:14 AM - Patient #04 Checked In</p>
                          <p>10:02 AM - Dr. Nair completed consult #03</p>
                          <p className="text-rose-400">09:50 AM - Appointment #12 Cancelled</p>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Hospital Statistics Section ── */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6 text-center">
            {[
              { label: "Active Doctors", value: "10", desc: "Specialists Seeded" },
              { label: "Registered Patients", value: "40+", desc: "Indian Profiles" },
              { label: "Total Bookings", value: "100+", desc: "Past & Upcoming" },
              { label: "Departments", value: "15", desc: "Cardio to Dental" },
              { label: "Live Queue Sync", value: "Real-time", desc: "Powered by WebSockets" },
              { label: "Low Cancellations", value: "99%", desc: "Consultation Success" },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-2xl font-bold text-blue-600 lg:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{stat.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            Patient Journey
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            From Appointment Booking to Consultation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            A comprehensive overview of how patient consultations flow seamlessly through the hospital management system.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-5 relative">
            {[
              { step: "01", title: "Book Appointment", desc: "Browse board-certified doctors and book a convenient digital consultation slot." },
              { step: "02", title: "Check In", desc: "Tap 'Check In' upon arrival to notify medical staff and automatically generate queue status." },
              { step: "03", title: "Live Queue", desc: "Track queue progression in real time. Transparent wait times displayed." },
              { step: "04", title: "Consultation", desc: "Consult with your physician in order. Complete case reviews in detail." },
              { step: "05", title: "Completed", desc: "Status updates to completed in clinic databases. View history on dashboard." }
            ].map((s, idx) => (
              <div key={idx} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left shadow-sm">
                <span className="absolute right-4 top-4 text-4xl font-extrabold text-slate-200/80 font-mono">{s.step}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md mb-4 shadow-blue-100">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Modules Section ── */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Product Architecture
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Integrated Hospital Modules
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            MediFlow unifies the entire healthcare pipeline, serving patients, physicians, and administrators concurrently.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: "Patient Experience Portal",
                icon: Users,
                color: "text-blue-600 bg-blue-50",
                features: ["Symptom-guided doctor directory", "Flexible slot booking", "Digital queue check-in", "Estimated wait time updates", "Historical records management"]
              },
              {
                title: "Physician Digital Suite",
                icon: Stethoscope,
                color: "text-teal-600 bg-teal-50",
                features: ["Live clinic schedule overview", "One-click patient queue calling", "Completed consult indicators", "Detailed symptom review logs", "Interactive timeline of consults"]
              },
              {
                title: "Clinic Control Center (Admin)",
                icon: BarChart3,
                color: "text-purple-600 bg-purple-50",
                features: ["Hospital operations monitor", "Comprehensive doctor directory editing", "Live queue status logs", "Recent patient registration feeds", "Department metrics analytics"]
              }
            ].map((mod, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white p-8 text-left shadow-sm">
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${mod.color}`}>
                  <mod.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{mod.title}</h3>
                <ul className="mt-5 space-y-3">
                  {mod.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-slate-500">
                      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctor Specialties Section ── */}
      <section id="specialties" className="py-16 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Clinical Scope
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            10 Primary Specialties Supported
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            Patients can explore clinical departments loaded with highly qualified medical practitioners.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { name: "Cardiology", desc: "Heart & Vascular" },
              { name: "Neurology", desc: "Brain & Spine" },
              { name: "Orthopedics", desc: "Bones & Joints" },
              { name: "Dermatology", desc: "Skin & Cosmetology" },
              { name: "Pediatrics", desc: "Neonatology & Development" },
              { name: "ENT", desc: "Ear, Nose, & Throat" },
              { name: "Gynecology", desc: "Obstetrics & Health" },
              { name: "Dentistry", desc: "Oral & Maxillofacial" },
              { name: "Psychiatry", desc: "Mental Health Care" },
              { name: "General Medicine", desc: "Internal Medicine" }
            ].map((spec, i) => (
              <div key={i} className="group rounded-xl border border-slate-100 bg-slate-50 p-5 text-left hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-200">
                  Department {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-white">{spec.name}</h3>
                <p className="mt-1 text-xs text-slate-500 group-hover:text-blue-100">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Doctors Section ── */}
      <section id="featured-doctors" className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            Top Clinicians
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Featured Medical Experts
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            Meet board-certified specialists with exceptional patient satisfaction rates.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Dr. Ananya Sharma",
                spec: "Cardiology",
                qual: "MBBS, MD, DM (Cardiology)",
                exp: 14,
                lang: ["English", "Hindi"],
                rating: 4.8,
                reviews: 680,
                fee: 1200,
                img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop"
              },
              {
                name: "Dr. Rohan Mehta",
                spec: "Neurology",
                qual: "MBBS, MD, DM (Neurology)",
                exp: 18,
                lang: ["English", "Hindi"],
                rating: 4.9,
                reviews: 920,
                fee: 1500,
                img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop"
              },
              {
                name: "Dr. Priya Nair",
                spec: "Dermatology",
                qual: "MBBS, MD (Dermatology)",
                exp: 9,
                lang: ["English", "Malayalam"],
                rating: 4.7,
                reviews: 340,
                fee: 800,
                img: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=400&auto=format&fit=crop"
              },
              {
                name: "Dr. Aditya Kulkarni",
                spec: "General Medicine",
                qual: "MBBS, MD (General Medicine)",
                exp: 20,
                lang: ["English", "Hindi"],
                rating: 4.9,
                reviews: 1150,
                fee: 700,
                img: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=400&auto=format&fit=crop"
              }
            ].map((doc, idx) => (
              <div key={idx} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-100">
                  <img src={doc.img} alt={doc.name} className="h-full w-full object-cover" />
                  <span className="absolute top-2 right-2 rounded-full bg-white px-2 py-0.5 text-2xs font-bold text-slate-800 shadow-sm border border-slate-100 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {doc.rating} ({doc.reviews})
                  </span>
                </div>
                <div className="flex-1 mt-4">
                  <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-xs font-semibold text-blue-600">{doc.spec}</p>
                  <p className="text-2xs text-slate-400 mt-0.5">{doc.qual}</p>
                  
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-3">
                    <span>Exp: {doc.exp} Years</span>
                    <span className="font-bold text-slate-800">Fee: ₹{doc.fee}</span>
                  </div>
                </div>
                <Link
                  to="/register"
                  className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Features Section ── */}
      <span id="platform-features" />
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Clinical Standards
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Designed for Real-time Coordination
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            High performance systems ensure data accuracy for doctors, patient wait tracking, and overall facility audit compliance.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              {
                title: "Real-time WebSocket Sync",
                desc: "Consultation statuses, check-ins, and queue number offsets synchronize instantly via Socket.io channels.",
                icon: Activity
              },
              {
                title: "Secure Authentication",
                desc: "Equipped with strong JWT token handshakes, role-based page middlewares, and hashed credentials.",
                icon: ShieldCheck
              },
              {
                title: "Self-Service Check-in",
                desc: "Patients check in on dashboard panels to receive automated queue metrics and live wait estimations.",
                icon: CalendarCheck
              },
              {
                title: "System Metrics Monitor",
                desc: "An integrated command deck keeps track of active practitioners, registrations, and patient volume.",
                icon: BarChart3
              }
            ].map((feat, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 p-6 text-left hover:border-blue-200 transition-colors bg-slate-50/50">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-100">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{feat.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology Stack Section ── */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Enterprise Engineering Stack</p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {[
              { name: "React 19", type: "Frontend Library" },
              { name: "Tailwind CSS v4", type: "Styling Framework" },
              { name: "Node.js", type: "Runtime Server" },
              { name: "Express", type: "API Router" },
              { name: "MongoDB", type: "Database Layer" },
              { name: "Socket.io", type: "Real-time Sync" }
            ].map((tech, i) => (
              <div key={i} className="text-center rounded-xl bg-white border border-slate-100 px-5 py-3 shadow-2xs min-w-[140px]">
                <p className="text-sm font-bold text-slate-900">{tech.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{tech.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Common Queries
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div>
            {[
              {
                question: "How does the real-time queue algorithm calculate wait times?",
                answer: "Wait times are dynamically updated when patients complete check-ins. We assume an average of 10-15 minutes per patient ahead in the queue. The moment a physician completes an active consultation, the system recalculates and updates all downstream patient wait indicators instantly."
              },
              {
                question: "Can patient clinical records be edited by administrative personnel?",
                answer: "No. Role-based access security prevents administrative staff from modifying clinical records. Admins manage directory listings, billing profiles, and basic registrations, whereas doctors update schedules and mark consultations complete."
              },
              {
                question: "How is data preserved if the connection drops?",
                answer: "All queue records, check-in sequences, and booking logs are persisted in MongoDB. While WebSockets push real-time updates to active interfaces, all operations fallback to verified database transactions, ensuring consistent clinical history across service interruptions."
              },
              {
                question: "How do I test different dashboards during evaluation?",
                answer: "The database seeder pre-populates all user tiers. You can log in using the credentials specified in the system readme. Use doctor email accounts (e.g. 'ananya.sharma@mediflow.com') or the admin account to access specific dashboards immediately."
              }
            ].map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                  <Heart className="h-4.5 w-4.5 fill-white" />
                </div>
                <span className="text-base font-bold text-slate-900">MediFlow</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                A unified platform for clinical scheduling, live consultation queue management, and comprehensive hospital operations.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Patient Links</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link to="/register" className="hover:text-blue-600 transition-colors">Book an Appointment</Link></li>
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Patient Portal</Link></li>
                <li><a href="#specialties" className="hover:text-blue-600 transition-colors">Medical Specialties</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Staff Channels</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Physician Suite</Link></li>
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Operations Dashboard</Link></li>
                <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">Clinical Protocols</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Branding & Quality</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                MediFlow HMS meets international standard clinical system architectures. Designed for fast integration with institutional workflows.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-slate-400">
            <p>© {new Date().getFullYear()} MediFlow Health Management Systems. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-blue-600 transition-colors">Security Audit Passed</span>
              <span className="hover:text-blue-600 transition-colors">ISO 27001 Standard</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
