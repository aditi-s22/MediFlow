import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  Mail,
  Stethoscope,
  Award,
  Building,
  Globe,
  Clock,
  MapPin,
  FileText,
  Calendar,
  Heart,
  CalendarCheck,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import * as userService from "../services/userService";
import * as appointmentService from "../services/appointmentService";
import { inputClassName } from "../utils/inputStyles";
import formatDoctorName from "../utils/formatDoctorName";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ALL_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM"
];

function Field({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon && <Icon className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{value || "—"}</p>
      </div>
    </div>
  );
}

function Profile() {
  const { user, updateUser } = useAuth();
  const isDoctor = user?.role === "doctor";
  const isPatient = user?.role === "patient";

  const [phone, setPhone] = useState(user?.phone || "");
  const [age, setAge] = useState(user?.age ?? "");
  const [consultationFee, setConsultationFee] = useState(user?.consultationFee ?? "");
  const [availableSlots, setAvailableSlots] = useState(user?.availableSlots || []);
  const [availableDays, setAvailableDays] = useState(user?.availableDays || []);
  const [aboutDoctor, setAboutDoctor] = useState(user?.aboutDoctor || "");
  const [biography, setBiography] = useState(user?.biography || "");
  const [languagesSpoken, setLanguagesSpoken] = useState((user?.languagesSpoken || []).join(", "));
  const [clinicAddress, setClinicAddress] = useState(user?.clinicAddress || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (isPatient) {
      const fetchAppts = async () => {
        try {
          const response = await appointmentService.getAppointments();
          setAppointments(response.data.appointments || []);
        } catch {
          // non-fatal
        }
      };
      fetchAppts();
    }
  }, [isPatient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { phone };
    if (age) payload.age = Number(age);
    
    if (isDoctor) {
      payload.consultationFee = Number(consultationFee);
      payload.availableSlots = availableSlots;
      payload.availableDays = availableDays;
      payload.aboutDoctor = aboutDoctor;
      payload.biography = biography;
      payload.languagesSpoken = languagesSpoken
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      payload.clinicAddress = clinicAddress;
    }

    setIsSubmitting(true);
    try {
      const response = await userService.updateProfile(payload);
      updateUser(response.data.user);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel = { patient: "Patient", doctor: "Doctor", admin: "Administrator" };

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 mb-8 text-left">
          <span className="rounded bg-blue-50 border border-blue-100 px-3 py-1 text-2xs font-bold text-blue-700">
            MY ACCOUNT
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Manage Profile Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review personal credentials, hospital affiliations, and contact information.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 text-left">
          
          {/* Left Wing: Profile Card Summary (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Clinical Profile Page for Doctors */}
            {isDoctor && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
                <div className="flex flex-wrap items-start gap-5 pb-5 border-b border-slate-50">
                  <img
                    src={user?.profilePicture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400"}
                    alt={user?.name}
                    className="h-24 w-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div className="space-y-1">
                    <span className="rounded bg-blue-50 px-2.5 py-0.5 text-3xs font-bold text-blue-700 uppercase tracking-wider">
                      {roleLabel[user?.role]}
                    </span>
                    <h2 className="text-xl font-black text-slate-900">{user?.name}</h2>
                    <p className="text-sm font-semibold text-blue-600">{user?.specialization}</p>
                    <p className="text-xs text-slate-500">{user?.qualification}</p>
                  </div>
                </div>

                {/* About snippet & Biography */}
                {user?.biography && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Professional Biography</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-150/40">
                      {user.biography}
                    </p>
                  </div>
                )}

                {/* Grid details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-50 pt-5">
                  <Field label="Clinical Specialty" value={user?.specialization} icon={Stethoscope} />
                  <Field label="Clinical Experience" value={user?.experience ? `${user.experience} Years` : null} icon={Award} />
                  <Field label="Hospital Affiliation" value={user?.hospitalName} icon={Building} />
                  <Field label="Registration Number" value={user?.medicalRegistrationNumber} icon={FileText} />
                  <Field label="Languages" value={user?.languagesSpoken?.join(", ")} icon={Globe} />
                  <Field label="Consultation Fee" value={user?.consultationFee ? `₹${user.consultationFee}` : null} icon={Heart} />
                  <Field label="Clinic Address" value={user?.clinicAddress} icon={MapPin} />
                  <Field label="Contact Phone" value={user?.phone} icon={Phone} />
                  <Field label="Contact Email" value={user?.email} icon={Mail} />
                  <Field label="Available Days" value={user?.availableDays?.join(", ")} icon={Calendar} />
                </div>

                <div className="border-t border-slate-50 pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Today's Availability Windows</h3>
                  <div className="flex flex-wrap gap-2">
                    {user?.availableSlots?.length > 0 ? (
                      user.availableSlots.map((slot) => (
                        <span key={slot} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {slot}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No slots configured.</span>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Patient Profile Page */}
            {isPatient && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl shadow-md shadow-blue-100">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-3xs font-bold text-teal-700 uppercase tracking-wider">
                        Patient Profile
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-1">{user?.name}</h2>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Email Address" value={user?.email} icon={Mail} />
                    <Field label="Primary Phone" value={user?.phone} icon={Phone} />
                    <Field label="Gender Identity" value={user?.gender || <span className="text-amber-600 font-bold italic text-xs">Complete Profile</span>} icon={User} />
                    <Field label="Patient Age" value={user?.age ? `${user.age} Years` : <span className="text-amber-600 font-bold italic text-xs">Complete Profile</span>} icon={Calendar} />
                  </div>
                </div>

                {/* Patient Upcoming Bookings */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-4 mb-4">Upcoming Consultations</h3>
                  {appointments.filter(a => a.status === "confirmed").length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No upcoming consultations on file.</p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.filter(a => a.status === "confirmed").map((appt) => (
                        <div key={appt._id} className="flex justify-between items-center text-xs border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                          <div>
                            <p className="font-bold text-slate-800">{formatDoctorName(appt.doctor?.name)}</p>
                            <p className="text-3xs text-blue-600 uppercase tracking-wider">{appt.doctor?.specialization}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800">{new Date(appt.appointmentDate).toLocaleDateString("en-IN")}</p>
                            <p className="text-3xs text-slate-400">{appt.appointmentTime}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Patient Historical Bookings */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-4 mb-4">Consultation History</h3>
                  {appointments.filter(a => a.status === "completed" || a.status === "cancelled").length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No historical consultations recorded.</p>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {appointments.filter(a => a.status === "completed" || a.status === "cancelled").slice(0, 5).map((appt) => (
                        <div key={appt._id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{formatDoctorName(appt.doctor?.name)} ({appt.doctor?.specialization})</p>
                            <p className="text-3xs text-slate-400">Date: {new Date(appt.appointmentDate).toLocaleDateString("en-IN")}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                            appt.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Read-Only Admin Card */}
            {user?.role === "admin" && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-xl shadow-md shadow-rose-100">
                    A
                  </div>
                  <div>
                    <span className="rounded bg-rose-50 px-2 py-0.5 text-3xs font-bold text-rose-700 uppercase tracking-wider">
                      Administrator
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{user?.name}</h2>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="System Role" value={roleLabel[user?.role]} icon={User} />
                  <Field label="Access Level" value="Full Operational Privileges" icon={Award} />
                  <Field label="Operations Phone" value={user?.phone} icon={Phone} />
                  <Field label="Administrative Email" value={user?.email} icon={Mail} />
                </div>
              </div>
            )}

          </div>

          {/* Right Wing: Editable Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-400">Edit Settings</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Contact phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Primary Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClassName}
                    placeholder="10-digit primary number"
                  />
                </div>

                {/* Patient Age */}
                {isPatient && (
                  <div>
                    <label htmlFor="age" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Age
                    </label>
                    <input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className={inputClassName}
                      placeholder="e.g. 28"
                    />
                  </div>
                )}

                {/* Doctor-only forms */}
                {isDoctor && (
                  <>
                    <div>
                      <label htmlFor="consultationFee" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Consultation fee (₹)
                      </label>
                      <input
                        id="consultationFee"
                        type="number"
                        min="0"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        className={inputClassName}
                        placeholder="e.g. 1000"
                      />
                    </div>

                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Available Consultation Days
                      </span>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mt-2">
                        {ALL_DAYS.map((day) => {
                          const isChecked = availableDays.includes(day);
                          return (
                            <label key={day} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setAvailableDays((prev) =>
                                    isChecked ? prev.filter((d) => d !== day) : [...prev, day]
                                  );
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500/20 h-4 w-4"
                              />
                              {day}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Available Time Slots
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ALL_SLOTS.map((slot) => {
                          const isSelected = availableSlots.includes(slot);
                          return (
                            <button
                              type="button"
                              key={slot}
                              onClick={() => {
                                setAvailableSlots((prev) =>
                                  isSelected ? prev.filter((s) => s !== slot) : [...prev, slot]
                                );
                              }}
                              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-100"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="aboutDoctor" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Clinic Subheading (About Snippet)
                      </label>
                      <input
                        id="aboutDoctor"
                        type="text"
                        value={aboutDoctor}
                        onChange={(e) => setAboutDoctor(e.target.value)}
                        className={inputClassName}
                        placeholder="e.g. Dedicated Cardiologist focusing on non-invasive imaging."
                      />
                    </div>

                    <div>
                      <label htmlFor="clinicAddress" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Clinic Address
                      </label>
                      <input
                        id="clinicAddress"
                        type="text"
                        value={clinicAddress}
                        onChange={(e) => setClinicAddress(e.target.value)}
                        className={inputClassName}
                        placeholder="e.g. Suite 302, Cardio Wing, Noida"
                      />
                    </div>

                    <div>
                      <label htmlFor="languagesSpoken" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Languages Spoken
                      </label>
                      <input
                        id="languagesSpoken"
                        type="text"
                        value={languagesSpoken}
                        onChange={(e) => setLanguagesSpoken(e.target.value)}
                        className={inputClassName}
                        placeholder="e.g. English, Hindi, Punjabi"
                      />
                    </div>

                    <div>
                      <label htmlFor="biography" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Detailed Biography
                      </label>
                      <textarea
                        id="biography"
                        value={biography}
                        onChange={(e) => setBiography(e.target.value)}
                        rows={4}
                        className={inputClassName}
                        placeholder="Provide details about clinical history, medical credentials, fellowships, etc..."
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 focus:outline-none shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving changes…" : "Save Changes"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default Profile;
