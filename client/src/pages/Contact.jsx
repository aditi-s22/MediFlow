import { Link } from "react-router-dom";
import { ExternalLink, Mail } from "lucide-react";

function Contact() {
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

      <div className="mx-auto max-w-lg px-6 py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Contact</p>
        <h1 className="mt-3 text-4xl font-bold text-gray-900">Get in touch</h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-gray-500">
          MediFlow is an open-source portfolio project. Questions, feedback, and
          contributions are all welcome.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex w-full max-w-xs items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ExternalLink className="h-5 w-5" />
            View on GitHub
          </a>
          <a
            href="mailto:contact@mediflow.dev"
            className="flex w-full max-w-xs items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Mail className="h-5 w-5" />
            Send an email
          </a>
        </div>

        <p className="mt-10 text-sm text-gray-400">
          Found a bug? Open an issue on GitHub — that&apos;s the fastest path to a fix.
        </p>
      </div>
    </div>
  );
}

export default Contact;
