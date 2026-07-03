import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Star,
  Globe,
  Clock,
  ArrowRight,
  Heart,
  Calendar,
  Building,
  Brain,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import * as doctorService from "../services/doctorService";
import * as mlService from "../services/mlService";
import toast from "react-hot-toast";
import formatDoctorName from "../utils/formatDoctorName";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEPT_EXPLANATIONS = {
  Cardiology: "cardiovascular evaluation, blood pressure monitoring, or heart health assessment",
  Neurology: "neurological screening, nerve response evaluations, or brain/spine consultations",
  Dermatology: "dermatological exams, skin rash treatments, or hair and nail health checkups",
  Orthopedics: "musculoskeletal joint evaluations, bone alignment checks, or spine care",
  ENT: "ear, nose, and throat screenings, hearing reviews, or sinus pressure relief",
  Pediatrics: "specialized care, developmental checkups, or pediatric fever/infection reviews",
  Gynecology: "obstetric care, menstrual checkups, or hormonal screenings",
  Psychiatry: "mental wellness assessments, anxiety/stress support, or sleep therapy",
  Dentistry: "dental hygiene checkups, cavity screenings, or oral nerve care",
  "General Medicine": "general health screenings, viral fever checks, or abdominal review"
};

const DEPT_SINGULAR = {
  Cardiology: "Cardiologist",
  Neurology: "Neurologist",
  Dermatology: "Dermatologist",
  Orthopedics: "Orthopedic Specialist",
  ENT: "ENT Specialist",
  Pediatrics: "Pediatrician",
  Gynecology: "Gynecologist",
  Psychiatry: "Psychiatrist",
  Dentistry: "Dentist",
  "General Medicine": "General Physician"
};

function Doctors() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";

  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");

  // Symptom routing states
  const [showRecommendationFlow, setShowRecommendationFlow] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendationResults, setRecommendationResults] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (specialization) params.specialization = specialization;
        const response = await doctorService.getDoctors(params);
        setDoctors(response.data.doctors);
        setError("");
      } catch {
        setError("Could not load doctor directory. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(debounce);
  }, [search, specialization]);

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms first");
      return;
    }

    setIsRecommending(true);
    try {
      const response = await mlService.getRecommendation(symptoms);
      setRecommendationResults(response.data);
    } catch (err) {
      toast.error("Unable to generate a recommendation right now.");
      setShowRecommendationFlow(false);
    } finally {
      setIsRecommending(false);
    }
  };

  const todayDay = DAYS_OF_WEEK[new Date().getDay()];

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        
        {/* Header */}
        <div className="text-left flex justify-between items-start border-b border-slate-100 pb-6 mb-8">
          <div>
            <span className="rounded bg-blue-50 border border-blue-100 px-3 py-1 text-2xs font-bold text-blue-700">
              DIRECTORY
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Search Board-Certified Doctors</h1>
            <p className="text-xs text-slate-500 mt-0.5">Find clinics, book consultations, and consult live with specialists.</p>
          </div>
        </div>

        {/* ─── STAGE 1: SYMPTOM GUIDE INPUT ─── */}
        {showRecommendationFlow && !recommendationResults && (
          <div className="max-w-xl mx-auto text-left">
            
            <button
              onClick={() => setShowRecommendationFlow(false)}
              className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to doctor list
            </button>

            <div className="rounded-2xl border border-slate-150 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Tell us what brings you in today</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Describe what symptoms you are experiencing, and we will guide you to the correct department.
                </p>
              </div>

              <form onSubmit={handleRecommendationSubmit} className="space-y-4">
                <div>
                  <label htmlFor="symptoms-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Describe symptoms
                  </label>
                  <textarea
                    id="symptoms-desc"
                    rows={4}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Example: I've had chest pressure and shortness of breath for two days..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isRecommending || !symptoms.trim()}
                    className="flex-1 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {isRecommending ? "Analyzing..." : "Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRecommendationFlow(false)}
                    className="rounded-xl border border-slate-200 bg-white py-3.5 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── STAGE 2: RECOMMENDATION RESULTS ─── */}
        {showRecommendationFlow && recommendationResults && (
          <div className="space-y-8 text-left">
            
            {/* Recommendation Explanation */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-50 pb-4">
                <div>
                  <span className="text-3xs uppercase font-bold tracking-wider text-slate-400">Recommended Specialty</span>
                  <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                    ❤️ {recommendationResults.department}
                    <span className={`rounded-xl px-2.5 py-0.5 text-4xs font-black uppercase tracking-wider ${
                      recommendationResults.matchCategory === "High Match"
                        ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                        : recommendationResults.matchCategory === "Medium Match"
                        ? "bg-amber-50 border border-amber-100 text-amber-700"
                        : "bg-rose-50 border border-rose-100 text-rose-700"
                    }`}>
                      {recommendationResults.matchCategory}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => setShowRecommendationFlow(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Browse All Doctors
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-700 font-medium">
                  Based on the symptoms you described, we recommend consulting a <span className="font-bold text-blue-600">{DEPT_SINGULAR[recommendationResults.department] || "specialist"}</span>.
                </p>

                {/* Why we recommended this specialist */}
                <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 space-y-2 max-w-2xl">
                  <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400">Why we recommended this specialist</h4>
                  <div className="mt-2 space-y-1.5 font-normal">
                    <p className="text-2xs text-slate-400 mb-1">Your symptoms mention:</p>
                    {recommendationResults.matchedSymptoms?.map((sym, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
                        <span className="capitalize">{sym}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-3xs text-slate-400 mt-2 border-t border-slate-200/50 pt-2 font-normal">
                    These symptoms are commonly evaluated by {DEPT_EXPLANATIONS[recommendationResults.department] || "specialists in this department"}.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="border-t border-slate-50 pt-4 flex gap-2 text-3xs text-slate-400 leading-normal font-normal">
                <AlertCircle className="h-4 w-4 text-slate-450 shrink-0 mt-0.5" />
                <p>
                  This recommendation is intended to help you choose an appropriate specialist and should not be considered medical advice.
                </p>
              </div>
            </div>

            {/* Recommended Specialists */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">Available Specialists</h3>
              
              {recommendationResults.doctors.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
                  <Stethoscope className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="text-sm font-bold text-slate-800 mt-3">No specialists available</p>
                  <p className="text-xs mt-1">There are no doctors currently registered under the recommended specialty.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recommendationResults.doctors.map((doctor, idx) => {
                    const isAvailable = doctor.availableDays?.includes(todayDay);
                    const isBestMatch = idx === 0;
                    return (
                      <div
                        key={doctor._id}
                        className={`flex flex-col md:flex-row gap-6 rounded-2xl bg-white p-6 shadow-sm border transition-all ${
                          isBestMatch 
                            ? "border-blue-200 bg-blue-50/5 ring-2 ring-blue-600/10" 
                            : "border-slate-100"
                        }`}
                      >
                        {/* Photo */}
                        <div className="w-full md:w-40 shrink-0">
                          <div className="h-40 w-full md:w-40 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 relative">
                            <img
                              src={doctor.profilePicture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400"}
                              alt={formatDoctorName(doctor.name)}
                              className="h-full w-full object-cover"
                            />
                            {isAvailable && (
                              <span className="absolute bottom-2 left-2 rounded bg-emerald-500 px-2 py-0.5 text-3xs font-black text-white uppercase shadow-sm">
                                Available Today
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h2 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                                    {formatDoctorName(doctor.name)}
                                  </h2>
                                  {isBestMatch && (
                                    <span className="rounded bg-blue-600 px-2 py-0.5 text-4xs font-black text-white uppercase tracking-wider shadow-xs">
                                      Best Match
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-blue-600 mt-0.5">{doctor.specialization}</p>
                                <p className="text-2xs text-slate-400 mt-0.5">{doctor.qualification}</p>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded shrink-0">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span>{doctor.rating ? doctor.rating.toFixed(1) : "4.8"}</span>
                                <span className="text-slate-400 font-normal">({doctor.reviewCount || 200} reviews)</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 border-t border-slate-50 pt-3">
                            <div>
                              <span className="font-medium text-slate-400">Experience:</span> {doctor.experience} Years
                            </div>
                            <div>
                              <span className="font-medium text-slate-400">Consultation Fee:</span> <span className="font-bold text-slate-800">₹{doctor.consultationFee}</span>
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5 mt-1">
                              <Globe className="h-3.5 w-3.5 text-slate-400" />
                              <span className="font-medium text-slate-400">Languages:</span> {doctor.languagesSpoken?.join(", ") || "English, Hindi"}
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5">
                              <Building className="h-3.5 w-3.5 text-slate-400" />
                              <span className="font-medium text-slate-400">Hospital:</span> {doctor.hospitalName || "MediFlow General Hospital"}
                            </div>
                          </div>

                          {doctor.aboutDoctor && (
                            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 border border-slate-100/50 p-3 rounded-lg">
                              &ldquo;{doctor.aboutDoctor}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* CTA Panel */}
                        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col justify-end md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-3">
                          <div className="flex-1 md:flex-none text-left md:text-center">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Availability</p>
                            <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1 md:justify-center">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {doctor.availableSlots?.length || 0} Slots
                            </p>
                            {doctor.queueLength > 0 && (
                              <p className="text-3xs text-slate-400 mt-0.5 md:text-center">
                                Today's Queue: {doctor.queueLength} waiting
                              </p>
                            )}
                          </div>
                          <Link
                            to={`/doctors/${doctor._id}/book`}
                            state={{ predictionLogId: recommendationResults.predictionLogId }}
                            className="rounded-xl bg-blue-600 px-5 py-3 text-center text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 group shrink-0"
                          >
                            Book Appointment
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ─── STAGE 3: MANUAL DIRECTORY BROWSING (DEFAULT) ─── */}
        {!showRecommendationFlow && (
          <div className="space-y-6">
            
            {/* Guide assist shortcut card */}
            {isPatient && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/15 p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-600 border border-blue-500 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                    <Brain className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Need help choosing a doctor?</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-normal">Describe what symptoms you are experiencing and we will recommend the correct specialist department.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRecommendationResults(null);
                    setSymptoms("");
                    setShowRecommendationFlow(true);
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-all shrink-0 flex items-center gap-1 font-bold"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Guide Me to a Specialist
                </button>
              </div>
            )}

            {/* Search controls */}
            <div className="flex flex-col gap-3 sm:flex-row bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
              <div className="flex-1 relative">
                <input
                  type="search"
                  placeholder="Search doctors by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search doctors by name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                />
              </div>
              <div className="flex-1 relative">
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  aria-label="Filter doctors by specialization"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">All Specialties</option>
                  <option value="Cardiology">Cardiology (Heart)</option>
                  <option value="Neurology">Neurology (Brain & Spine)</option>
                  <option value="Orthopedics">Orthopedics (Bones)</option>
                  <option value="Dermatology">Dermatology (Skin)</option>
                  <option value="Pediatrics">Pediatrics (Children)</option>
                  <option value="ENT">ENT (Ear, Nose, Throat)</option>
                  <option value="Gynecology">Gynecology (Women)</option>
                  <option value="Dentistry">Dentistry (Oral)</option>
                  <option value="Psychiatry">Psychiatry (Mental Health)</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
            </div>

            {/* Directory Listings */}
            {isLoading ? (
              <div className="text-center text-sm text-slate-400 py-12">Searching active medical profiles…</div>
            ) : error ? (
              <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-200 text-left">
                {error}
              </div>
            ) : doctors.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center shadow-2xs border border-slate-100">
                <Stethoscope className="h-10 w-10 text-slate-300" />
                <p className="text-slate-700 font-bold mt-3">No specialists match your search criteria</p>
                <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {doctors.map((doctor) => {
                  const isAvailableToday = doctor.availableDays?.includes(todayDay);
                  return (
                    <div
                      key={doctor._id}
                      className="flex flex-col md:flex-row gap-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-left"
                    >
                      {/* Photo */}
                      <div className="w-full md:w-40 shrink-0">
                        <div className="h-40 w-full md:w-40 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 relative">
                          <img
                            src={doctor.profilePicture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400"}
                            alt={formatDoctorName(doctor.name)}
                            className="h-full w-full object-cover"
                          />
                          {isAvailableToday && (
                            <span className="absolute bottom-2 left-2 rounded bg-emerald-500 px-2 py-0.5 text-3xs font-black text-white uppercase shadow-sm">
                              Available Today
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h2 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                                {formatDoctorName(doctor.name)}
                              </h2>
                              <p className="text-xs font-semibold text-blue-600 mt-0.5">{doctor.specialization}</p>
                              <p className="text-2xs text-slate-400 mt-0.5">{doctor.qualification}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span>{doctor.rating ? doctor.rating.toFixed(1) : "4.8"}</span>
                              <span className="text-slate-400 font-normal">({doctor.reviewCount || 200} reviews)</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 border-t border-slate-50 pt-3">
                          <div>
                            <span className="font-medium text-slate-400">Experience:</span> {doctor.experience} Years
                          </div>
                          <div>
                            <span className="font-medium text-slate-400">Consultation Fee:</span> <span className="font-bold text-slate-800">₹{doctor.consultationFee}</span>
                          </div>
                          <div className="col-span-2 flex items-center gap-1.5 mt-1">
                            <Globe className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-medium text-slate-400">Languages:</span> {doctor.languagesSpoken?.join(", ") || "English, Hindi"}
                          </div>
                          <div className="col-span-2 flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-medium text-slate-400">Hospital:</span> {doctor.hospitalName || "MediFlow General Hospital"}
                          </div>
                        </div>

                        {doctor.aboutDoctor && (
                          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 border border-slate-100/50 p-3 rounded-lg">
                            &ldquo;{doctor.aboutDoctor}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* CTA Panel */}
                      <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col justify-end md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-3">
                        <div className="flex-1 md:flex-none text-left md:text-center">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Availability</p>
                          <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1 md:justify-center">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {doctor.availableSlots?.length || 0} Slots Configured
                          </p>
                        </div>
                        <Link
                          to={`/doctors/${doctor._id}/book`}
                          className="rounded-xl bg-blue-600 px-5 py-3 text-center text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 group shrink-0"
                        >
                          Book Appointment
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}

export default Doctors;
