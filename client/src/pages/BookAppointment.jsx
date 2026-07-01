import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock } from "lucide-react";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import { SkeletonBar } from "../components/Skeleton";
import * as doctorService from "../services/doctorService";
import * as appointmentService from "../services/appointmentService";
import { inputClassName } from "../utils/inputStyles";

function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

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
      <div className="mx-auto max-w-xl px-6 py-8">
        {/* Doctor card */}
        <div className="rounded-xl bg-white p-6 ring-1 ring-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
              {doctor.name?.[0]}
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{doctor.name}</h1>
              <p className="text-sm font-medium text-blue-600">{doctor.specialization}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-400">Experience</p>
              <p className="font-medium text-gray-800">{doctor.experience} years</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-400">Consultation fee</p>
              <p className="font-medium text-gray-800">₹{doctor.consultationFee}</p>
            </div>
          </div>
        </div>

        {/* Booking form */}
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl bg-white p-6 ring-1 ring-gray-100">
          <h2 className="mb-5 text-sm font-semibold text-gray-800">Book an Appointment</h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                id="appointmentDate"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time slot</label>
              {doctor.availableSlots?.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {doctor.availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setAppointmentTime(slot)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                        appointmentTime === slot
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-400">
                  This doctor has no available slots configured.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason for visit{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Briefly describe your symptoms or reason for visit…"
                className={inputClassName}
              />
              <p className="mt-1 text-right text-xs text-gray-400">{reason.length}/200</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Booking…" : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}

export default BookAppointment;
