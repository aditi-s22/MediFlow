import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Calendar,
  Clock,
  Stethoscope,
  Heart,
  User,
  Plus,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import { SkeletonCard } from "../components/Skeleton";
import * as appointmentService from "../services/appointmentService";
import * as queueService from "../services/queueService";
import * as doctorService from "../services/doctorService";
import socket from "../services/socket";
import formatDoctorName from "../utils/formatDoctorName";

const isTodayDate = (dateString) => {
  const d = new Date(dateString);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
};

const getRelativeDayName = (dateString) => {
  const d = new Date(dateString);
  const t = new Date();
  const diffTime = d.setHours(0,0,0,0) - t.setHours(0,0,0,0);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [todayAppointment, setTodayAppointment] = useState(null);
  const [queueList, setQueueList] = useState([]);
  const [currentServing, setCurrentServing] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const todayApptIdRef = useRef(null);
  const doctorIdRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, docRes] = await Promise.all([
          appointmentService.getAppointments(),
          doctorService.getDoctors(),
        ]);
        
        const all = apptRes.data.appointments;
        setAppointments(all);
        setDoctors(docRes.data.doctors || []);

        const todayAppt = all.find(
          (a) => a.status === "confirmed" && isTodayDate(a.appointmentDate)
        );

        if (todayAppt) {
          setTodayAppointment(todayAppt);
          todayApptIdRef.current = todayAppt._id;
          doctorIdRef.current = todayAppt.doctor?._id;
          if (todayAppt.doctor?._id) {
            try {
              const qRes = await queueService.getQueue(todayAppt.doctor._id);
              setQueueList(qRes.data.queue);
              setCurrentServing(qRes.data.currentServing);
            } catch {
              // non-fatal
            }
            socket.connect();
            socket.emit("joinDoctorRoom", todayAppt.doctor._id);
          }
        }
      } catch {
        toast.error("Could not load your health information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const handleReconnect = () => {
      if (doctorIdRef.current) {
        socket.emit("joinDoctorRoom", doctorIdRef.current);
      }
    };

    const handleQueueUpdated = (payload) => {
      setQueueList(payload.queue);
      setCurrentServing(payload.currentServing);
      if (todayApptIdRef.current) {
        const myEntry = payload.queue.find(
          (q) => q._id.toString() === todayApptIdRef.current.toString()
        );
        if (myEntry) {
          setTodayAppointment((prev) =>
            prev ? { ...prev, queueNumber: myEntry.queueNumber } : prev
          );
        }
      }
    };

    socket.on("queueUpdated", handleQueueUpdated);
    socket.on("connect", handleReconnect);
    return () => {
      socket.off("queueUpdated", handleQueueUpdated);
      socket.off("connect", handleReconnect);
      socket.disconnect();
    };
  }, []);

  const handleCheckIn = async () => {
    if (!todayAppointment) return;
    setIsCheckingIn(true);
    try {
      const response = await appointmentService.checkInAppointment(todayAppointment._id);
      setTodayAppointment((prev) =>
        prev ? { ...prev, queueNumber: response.data.appointment.queueNumber } : prev
      );
      toast.success("Checked in successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not check in. Please try again.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const upcomingAppointments = appointments
    .filter((a) => a.status === "confirmed" && !isTodayDate(a.appointmentDate))
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const previousAppointments = appointments
    .filter((a) => a.status === "completed" || a.status === "cancelled")
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  // Determine Favorite Doctor based on completed consultations
  const completedAppts = appointments.filter((a) => a.status === "completed");
  const doctorConsultCounts = {};
  completedAppts.forEach((appt) => {
    const docId = appt.doctor?._id;
    if (docId) {
      doctorConsultCounts[docId] = (doctorConsultCounts[docId] || 0) + 1;
    }
  });

  let favoriteDoctor = null;
  const favoriteDocId = Object.keys(doctorConsultCounts).sort(
    (a, b) => doctorConsultCounts[b] - doctorConsultCounts[a]
  )[0];

  if (favoriteDocId && doctors.length > 0) {
    favoriteDoctor = doctors.find((d) => d._id === favoriteDocId);
  } else if (doctors.length > 0) {
    // Default to first cardiologist or general physician if no consults yet
    favoriteDoctor = doctors.find(d => d.specialization === "General Medicine") || doctors[0];
  }

  // Recommended specialists are doctors of other specialties
  const recommendedSpecialists = doctors
    .filter((d) => d._id !== favoriteDoctor?._id)
    .slice(0, 3);

  // Generate Recent Activity feed
  const recentActivity = [];
  appointments.slice(0, 4).forEach((appt) => {
    if (appt.status === "completed") {
      recentActivity.push({
        title: `Consultation completed`,
        desc: `With ${formatDoctorName(appt.doctor?.name)} (${appt.doctor?.specialization})`,
        time: getRelativeDayName(appt.appointmentDate),
        type: "completed",
      });
    } else if (appt.status === "confirmed") {
      recentActivity.push({
        title: `Appointment scheduled`,
        desc: `With ${formatDoctorName(appt.doctor?.name)} at ${appt.appointmentTime}`,
        time: getRelativeDayName(appt.appointmentDate),
        type: "confirmed",
      });
    } else if (appt.status === "cancelled") {
      recentActivity.push({
        title: `Appointment cancelled`,
        desc: `With ${formatDoctorName(appt.doctor?.name)} on ${new Date(appt.appointmentDate).toLocaleDateString("en-IN")}`,
        time: getRelativeDayName(appt.appointmentDate),
        type: "cancelled",
      });
    }
  });

  if (recentActivity.length === 0) {
    recentActivity.push({
      title: "Welcome to MediFlow Portal",
      desc: "Complete your profile to discover specialists and schedule consultations.",
      time: "Just now",
      type: "welcome",
    });
  }

  const myQueueEntry = todayAppointment
    ? queueList.find((q) => q._id?.toString() === todayAppointment._id?.toString())
    : null;
  const servingEntry = currentServing
    ? queueList.find((q) => q._id?.toString() === currentServing.toString())
    : null;

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Good {getGreeting()}, {user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · Here's an overview of your care
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/doctors"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Book appointment
            </Link>
          </div>
        </div>

        {(!user?.age || !user?.gender) && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-amber-800">Complete Your Profile</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Please add your age and gender in settings to receive personalized specialist recommendations.
              </p>
            </div>
            <Link
              to="/profile"
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors shadow-sm"
            >
              Complete Profile
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Left Wing: Appointments & Records (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Today's Appointment / Live Queue Tracking */}
              {todayAppointment ? (
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/40 to-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-600">Today's appointment</p>
                        <h3 className="mt-0.5 text-lg font-bold text-slate-900">
                          {formatDoctorName(todayAppointment.doctor?.name)}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {todayAppointment.doctor?.specialization} · {todayAppointment.appointmentTime}
                        </p>
                      </div>
                    </div>
                    {todayAppointment.queueNumber !== null && (
                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-blue-100">
                        Queue #{todayAppointment.queueNumber}
                      </span>
                    )}
                  </div>

                  {todayAppointment.queueNumber === null ? (
                    <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-bold text-slate-800">Hospital Check-in Required</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tap Check-In upon arriving at the clinic to get your live queue number.
                        </p>
                      </div>
                      <button
                        onClick={handleCheckIn}
                        disabled={isCheckingIn}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 shadow-sm"
                      >
                        {isCheckingIn ? "Checking in…" : "Check In Now"}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-blue-600 p-4 text-center text-white shadow-md shadow-blue-100">
                          <p className="text-2xs font-semibold uppercase tracking-wider text-blue-100">Your Number</p>
                          <p className="mt-1 text-2xl font-bold">#{todayAppointment.queueNumber}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                          <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">Now Serving</p>
                          <p className="mt-1 text-2xl font-bold text-slate-800">
                            {servingEntry ? `#${servingEntry.queueNumber}` : "—"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                          <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">People Ahead</p>
                          <p className="mt-1 text-2xl font-bold text-slate-800">
                            {myQueueEntry ? myQueueEntry.peopleAhead : "—"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                          <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">Est. Wait</p>
                          <p className="mt-1 text-2xl font-bold text-slate-800">
                            {myQueueEntry ? `${myQueueEntry.estimatedWait} min` : "—"}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 flex items-center gap-1.5 text-2xs text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live tracking active. Please remain in the patient waiting bay.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Upcoming Appointments List */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming appointments</h2>
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-100">
                    {upcomingAppointments.length} scheduled
                  </span>
                </div>

                {upcomingAppointments.length === 0 ? (
                  <div className="py-6 text-center">
                    <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="text-sm font-bold text-slate-600 mt-2">No other upcoming consultations</p>
                    <p className="text-xs text-slate-400 mt-0.5">Need a checkup? Search doctors and secure a slot.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {upcomingAppointments.map((appt) => (
                      <div key={appt._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={appt.doctor?.profilePicture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100"}
                            alt={formatDoctorName(appt.doctor?.name)}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-100"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{formatDoctorName(appt.doctor?.name)}</h4>
                            <p className="text-xs text-slate-500">
                              {appt.doctor?.specialization} · {getRelativeDayName(appt.appointmentDate)} · {appt.appointmentTime}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-2xs font-bold text-slate-600">
                          Confirmed
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Previous Consultations History */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-50 pb-4 mb-4">
                  Consultation history
                </h2>
                
                {previousAppointments.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No historical consultations on file.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {previousAppointments.slice(0, 5).map((appt) => (
                      <div key={appt._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{formatDoctorName(appt.doctor?.name)}</h4>
                          <p className="text-xs text-slate-500">
                            {appt.doctor?.specialization} · {new Date(appt.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          {appt.reason && (
                            <p className="text-2xs italic text-slate-400 mt-0.5">Symptom: &ldquo;{appt.reason}&rdquo;</p>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-2xs font-bold ${
                            appt.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {appt.status === "completed" ? "Completed" : "Cancelled"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Wing: Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-8 text-left">
              
              {/* Quick Actions Panel */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/doctors"
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-4 text-center hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                  >
                    <Stethoscope className="h-6 w-6 text-blue-600 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 mt-2">Find Doctor</span>
                  </Link>
                  <Link
                    to="/appointments"
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-4 text-center hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                  >
                    <CalendarCheck className="h-6 w-6 text-teal-600 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 mt-2">Bookings</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-4 text-center hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                  >
                    <User className="h-6 w-6 text-purple-600 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 mt-2">My Profile</span>
                  </Link>
                  <a
                    href="#health-tips"
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-4 text-center hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                  >
                    <Heart className="h-6 w-6 text-rose-600 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 mt-2">Health Tips</span>
                  </a>
                </div>
              </div>

              {/* Health Advisory Tips */}
              <div id="health-tips" className="rounded-2xl border border-rose-100 bg-rose-50/30 p-6 shadow-2xs">
                <div className="flex items-center gap-2 text-rose-700">
                  <Heart className="h-5 w-5 fill-rose-600 text-rose-600" />
                  <h3 className="text-sm font-semibold">Health reminder</h3>
                </div>
                <p className="text-sm font-bold text-slate-800 mt-3">Preventive cardiac health tip</p>
                <p className="text-xs leading-relaxed text-slate-500 mt-1">
                  Drinking 3 liters of filtered water daily assists circulatory blood volume. Maintaining at least 7-8 hours of sleep regulates autonomic heart rates and prevents chronic cardiovascular fatigue.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-2xs font-bold text-rose-700">
                  <Shield className="h-3.5 w-3.5" />
                  Approved by MediFlow Medical Board
                </div>
              </div>

              {/* Favorite Doctor highlight */}
              {favoriteDoctor && (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Your favorite clinician</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={favoriteDoctor.profilePicture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200"}
                      alt={formatDoctorName(favoriteDoctor.name)}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-100"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{formatDoctorName(favoriteDoctor.name)}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{favoriteDoctor.specialization}</p>
                      <p className="text-2xs text-slate-400 mt-0.5">{favoriteDoctor.qualification}</p>
                    </div>
                  </div>
                  <Link
                    to={`/doctors/${favoriteDoctor._id}/book`}
                    className="mt-4 w-full rounded-xl bg-slate-50 border border-slate-100 py-2.5 text-center text-xs font-bold text-blue-600 hover:bg-blue-50/50 hover:text-blue-700 transition-colors block"
                  >
                    Quick Consult again
                  </Link>
                </div>
              )}

              {/* Recommended Specialists */}
              {recommendedSpecialists.length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Recommended specialists</h3>
                  <div className="space-y-4">
                    {recommendedSpecialists.map((doc) => (
                      <div key={doc._id} className="flex items-center justify-between gap-3 border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={doc.profilePicture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100"}
                            alt={formatDoctorName(doc.name)}
                            className="h-9 w-9 rounded-lg object-cover border border-slate-100"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{formatDoctorName(doc.name)}</h4>
                            <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">{doc.specialization}</p>
                          </div>
                        </div>
                        <Link
                          to={`/doctors/${doc._id}/book`}
                          className="rounded bg-blue-50 px-2.5 py-1 text-3xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          Book
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity Log */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((act, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-bold text-slate-800">{act.title}</p>
                        <p className="text-slate-500 text-3xs leading-relaxed mt-0.5">{act.desc}</p>
                        <span className="text-4xs text-slate-400 font-mono block mt-1">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default PatientDashboard;
