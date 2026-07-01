import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock, Star, Award, Building, MapPin, FileText, CalendarCheck } from "lucide-react";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import { SkeletonBar } from "../components/Skeleton";
import * as doctorService from "../services/doctorService";
import * as appointmentService from "../services/appointmentService";
import { inputClassName } from "../utils/inputStyles";

function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const predictionLogId = location.state?.predictionLogId || null;

  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await doctorService.getDoctorById(id);
        setDoctor(response.data.doctor);
      } catch {
        setLoadError("Could not load doctor details. Please go back and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentDate || !appointmentTime) {
      toast.error("Please select a date and time slot.");
      return;
    }
    setIsSubmitting(true);
    try {
      await appointmentService.createAppointment({
        doctor: id,
        appointmentDate,
        appointmentTime,
        reason,
        predictionLogId,
      });
      toast.success("Appointment booked successfully!");
      navigate("/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="mx-auto max-w-xl px-6 py-8">
          <div className="rounded-xl bg-white p-6 ring-1 ring-gray-100">
            <SkeletonBar className="h-6 w-48" />
            <SkeletonBar className="mt-2 h-4 w-32" />
            <SkeletonBar className="mt-2 h-4 w-56" />
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (loadError || !doctor) {
    return (
      <AuthenticatedLayout>
        <div className="mx-auto max-w-xl px-6 py-8">
          <div className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700 ring-1 ring-red-200">
            {loadError || "Doctor not found."}
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-100 pb-6 mb-8 text-left">
          <span className="rounded bg-blue-50 border border-blue-100 px-3 py-1 text-2xs font-bold text-blue-700">
            APPOINTMENT BOOKING
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Schedule Your Consultation</h1>
          <p className="text-xs text-slate-500 mt-0.5">Please review the specialist's profile and choose an available consultation window.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 text-left">
          
          {/* Left Column: Doctor Clinical Profile (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              
              {/* Doctor Details Header */}
              <div className="flex gap-4">
                <img
                  src={doctor.profilePicture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400"}
                  alt={doctor.name}
                  className="h-20 w-20 rounded-xl object-cover border border-slate-100"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{doctor.name}</h2>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{doctor.specialization}</p>
                  <p className="text-2xs text-slate-400 mt-0.5">{doctor.qualification}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded mt-2.5 w-max">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{doctor.rating ? doctor.rating.toFixed(1) : "4.8"}</span>
                    <span className="text-slate-400 font-normal">({doctor.reviewCount || 200} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Bio Summary */}
              {doctor.biography && (
                <div className="border-t border-slate-50 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Physician Biography</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {doctor.biography}
                  </p>
                </div>
              )}

              {/* Clinical Specifics */}
              <div className="border-t border-slate-50 pt-4 space-y-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-400 shrink-0" />
                  <span><strong>Experience:</strong> {doctor.experience} Years active in clinic practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400 shrink-0" />
                  <span><strong>Facility:</strong> {doctor.hospitalName || "MediFlow General Hospital"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span><strong>Address:</strong> {doctor.clinicAddress || "General Wing, Sector 62, Noida"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                  <span><strong>Languages Spoken:</strong> {doctor.languagesSpoken?.join(", ") || "English, Hindi"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <span><strong>Medical Reg Number:</strong> {doctor.medicalRegistrationNumber || "MCI-48902"}</span>
                </div>
              </div>

              {/* Fee */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultation Fee</span>
                <span className="text-lg font-black text-slate-800">₹{doctor.consultationFee}</span>
              </div>

            </div>
          </div>

          {/* Right Column: Scheduling Calendar & Slots (7 cols) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              
              <div className="border-b border-slate-50 pb-4 mb-4">
                <h3 className="text-base font-bold text-slate-900">Select Date & Time Slot</h3>
                <p className="text-xs text-slate-400 mt-0.5">Appointments must be scheduled at least 1 day in advance.</p>
              </div>

              <div className="space-y-5">
                
                {/* Date Input */}
                <div>
                  <label htmlFor="appointmentDate" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Consultation Date
                  </label>
                  <input
                    id="appointmentDate"
                    type="date"
                    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                  />
                </div>

                {/* Slots picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Available Consultation Windows
                  </label>
                  {doctor.availableSlots?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {doctor.availableSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setAppointmentTime(slot)}
                          className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
                            appointmentTime === slot
                              ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-100"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No availability windows configured for this physician.
                    </p>
                  )}
                </div>

                {/* Reason description */}
                <div>
                  <label htmlFor="reason" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Reason for Consultation <span className="font-normal text-slate-400">(Symptom Summary)</span>
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    maxLength={200}
                    placeholder="Briefly describe symptoms (e.g. fever, migraine, blood pressure review)..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                  />
                  <p className="mt-1 text-right text-3xs text-slate-400 font-mono">{reason.length}/200</p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="h-4.5 w-4.5" />
                  {isSubmitting ? "Booking Appointment…" : "Confirm Medical Appointment"}
                </button>

              </div>
            </form>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default BookAppointment;
