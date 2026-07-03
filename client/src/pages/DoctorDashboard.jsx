import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Calendar,
  CalendarCheck,
  CheckCircle,
  CalendarX,
  Users,
  ChevronRight,
  Clock,
  User,
  Activity,
  FileText,
  CheckSquare,
  Award,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import DashboardCard from "../components/DashboardCard";
import AppointmentStatusBadge from "../components/AppointmentStatusBadge";
import { SkeletonCard, SkeletonRow } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import * as appointmentService from "../services/appointmentService";
import * as queueService from "../services/queueService";
import socket from "../services/socket";
import formatDoctorName from "../utils/formatDoctorName";

const isToday = (dateString) => {
  const d = new Date(dateString);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
};

function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [callingNext, setCallingNext] = useState(false);

  const [queue, setQueue] = useState([]);
  const [currentServing, setCurrentServing] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [apptRes, queueRes] = await Promise.all([
          appointmentService.getAppointments(),
          queueService.getQueue(user._id).catch(() => null),
        ]);
        const sorted = [...apptRes.data.appointments].sort(
          (a, b) =>
            new Date(a.appointmentDate) - new Date(b.appointmentDate) ||
            a.appointmentTime.localeCompare(b.appointmentTime)
        );
        setAppointments(sorted);
        if (queueRes) {
          setQueue(queueRes.data.queue);
          setCurrentServing(queueRes.data.currentServing);
        }
      } catch {
        toast.error("Could not load your clinic dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();

    socket.connect();
    socket.emit("joinDoctorRoom", user._id);

    const handleQueueUpdated = (payload) => {
      setQueue(payload.queue);
      setCurrentServing(payload.currentServing);
    };

    const handleReconnect = () => {
      socket.emit("joinDoctorRoom", user._id);
    };

    socket.on("queueUpdated", handleQueueUpdated);
    socket.on("connect", handleReconnect);
    return () => {
      socket.off("queueUpdated", handleQueueUpdated);
      socket.off("connect", handleReconnect);
      socket.disconnect();
    };
  }, [user._id]);

  const handleComplete = async (appointmentId) => {
    setCompletingId(appointmentId);
    try {
      await appointmentService.completeAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: "completed" } : a))
      );
      toast.success("Consultation complete. Record updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not complete appointment");
    } finally {
      setCompletingId(null);
    }
  };

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      await queueService.callNext(user._id);
      toast.success("Calling next patient in queue.");
    } catch (err) {
      toast.error(err.response?.data?.message || "No more checked-in patients");
    } finally {
      setCallingNext(false);
    }
  };

  // Computations
  const todayAppointments = appointments.filter((a) => isToday(a.appointmentDate));
  
  const todayCompletedCount = todayAppointments.filter((a) => a.status === "completed").length;
  const todayCheckedInQueue = queue.length;

  const upcomingConsultations = appointments.filter(
    (a) => a.status === "confirmed" && !isToday(a.appointmentDate) && new Date(a.appointmentDate) > new Date()
  );

  const recentConsultActivity = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );
  
  // Patients waiting are those in queue but NOT currently being served
  const patientsWaitingCount = queue.filter(q => q._id?.toString() !== currentServing).length;

  const currentServingEntry = currentServing
    ? queue.find((q) => q._id?.toString() === currentServing.toString())
    : null;

  // Detailed info of current serving patient from appointments
  const currentPatientAppointment = currentServingEntry
    ? appointments.find(a => a._id?.toString() === currentServingEntry._id?.toString())
    : null;

  // Upcoming consultations are today's confirmed appointments that are not checked in, OR checked in but waiting
  const todayUpcomingList = todayAppointments.filter(
    a => a.status === "confirmed" && a._id?.toString() !== currentServing
  );

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
          <div>
            <span className="rounded bg-teal-50 border border-teal-100 px-3 py-1 text-2xs font-bold text-teal-700">
              CLINICAL DASHBOARD
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Welcome, {formatDoctorName(user?.name)}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Specialization: <span className="font-semibold text-slate-700">{user?.specialization}</span> · {user?.hospitalName}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-bold text-slate-900">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <p className="text-xs text-slate-500">Live queue sync active</p>
          </div>
        </div>

        {/* Clinical Statistics strip */}
        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-2xs text-left">
              <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Today's Schedule</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{todayAppointments.length} Bookings</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-2xs text-left">
              <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Completed Today</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{todayCompletedCount} Patients</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-2xs text-left">
              <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Checked In Queue</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{todayCheckedInQueue} Active</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-2xs text-left">
              <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">Patients Waiting</p>
              <p className="text-2xl font-black text-orange-600 mt-1">{patientsWaitingCount} in lobby</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Left Column: Active Queue & Serving Pane (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Current Serving Banner */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/20 p-6 shadow-2xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                  Currently Consulting Patient
                </h2>
                
                {currentPatientAppointment ? (
                  <div className="mt-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-600 border border-blue-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-100">
                          #{currentServingEntry?.queueNumber}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {currentPatientAppointment.patient?.name}
                          </h3>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                            <span>Age: {currentPatientAppointment.patient?.age || "—"}</span>
                            <span>Gender: {currentPatientAppointment.patient?.gender || "—"}</span>
                            <span>Time: {currentPatientAppointment.appointmentTime}</span>
                          </div>
                          {currentPatientAppointment.reason && (
                            <div className="mt-3 rounded bg-slate-50 border border-slate-100 px-3 py-2 text-xs italic text-slate-600 max-w-lg">
                              Symptom: &ldquo;{currentPatientAppointment.reason}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0">
                        <button
                          type="button"
                          onClick={() => handleComplete(currentPatientAppointment._id)}
                          disabled={completingId === currentPatientAppointment._id}
                          className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {completingId === currentPatientAppointment._id ? "Completing…" : "Complete Consultation"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-white p-8 text-center">
                    <User className="mx-auto h-8 w-8 text-blue-400" />
                    <p className="text-sm font-bold text-slate-800 mt-2">No Active Consultation</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Call the next checked-in patient from your lobby queue.
                    </p>
                  </div>
                )}
              </div>

              {/* Lobby Queue Tracker */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Lobby Waiting Queue</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{queue.length} checked-in patients</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCallNext}
                    disabled={callingNext || queue.length === 0}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                    {callingNext ? "Calling…" : "Call Next"}
                  </button>
                </div>

                {queue.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No patients checked in at this time.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queue.map((entry) => {
                      const isServing = entry._id.toString() === currentServing;
                      return (
                        <div
                          key={entry._id}
                          className={`flex items-center justify-between rounded-xl px-5 py-4 border transition-all ${
                            isServing
                              ? "border-blue-200 bg-blue-50/50 shadow-2xs"
                              : "border-slate-100 bg-white hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`text-lg font-black ${isServing ? "text-blue-600" : "text-slate-300"}`}>
                              #{entry.queueNumber}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{entry.patientName}</p>
                              <p className="text-xs text-slate-500">Scheduled: {entry.appointmentTime}</p>
                            </div>
                          </div>
                          <div>
                            {isServing ? (
                              <span className="flex items-center gap-1 rounded bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-3xs font-bold text-blue-700">
                                <span className="h-1 w-1 rounded-full bg-blue-600 animate-pulse" />
                                Servicing
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-300" />
                                ~{entry.estimatedWait} min wait
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-8 text-left">
              
              {/* Doctor Quick Actions */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleCallNext}
                    disabled={queue.length === 0}
                    className="w-full rounded-xl bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all flex items-center gap-2"
                  >
                    <ChevronRight className="h-4.5 w-4.5 text-slate-500" />
                    Call Next Patient
                  </button>
                  <Link
                    to="/profile"
                    className="w-full rounded-xl bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all flex items-center gap-2 block"
                  >
                    <Clock className="h-4.5 w-4.5 text-slate-500" />
                    Update Profile & Slots
                  </Link>
                </div>
              </div>

              {/* Today's Schedule Timeline */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Today's Schedule Timeline</h3>
                
                {todayAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400">No appointments scheduled for today.</p>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map((appt) => {
                      const isCompleted = appt.status === "completed";
                      const isServing = appt._id.toString() === currentServing;
                      return (
                        <div key={appt._id} className="flex gap-3 text-xs border-l-2 border-slate-100 pl-4 relative ml-1">
                          {/* Dot indicator */}
                          <span className={`absolute -left-[6px] top-1.5 h-2.5 w-2.5 rounded-full ${
                            isCompleted ? "bg-emerald-500" : isServing ? "bg-blue-600 animate-pulse" : "bg-slate-300"
                          }`} />
                          
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">{appt.appointmentTime}</span>
                              <span className={`text-4xs px-1 rounded uppercase font-bold ${
                                isCompleted ? "bg-emerald-50 text-emerald-700" : isServing ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
                              }`}>
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-slate-900 mt-1">Patient: {appt.patient?.name}</p>
                            {appt.reason && (
                              <p className="text-3xs text-slate-400 italic">Symptom: &ldquo;{appt.reason}&rdquo;</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming Consultations */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Upcoming Consultations</h3>
                {upcomingConsultations.length === 0 ? (
                  <p className="text-xs text-slate-400">No upcoming consultations.</p>
                ) : (
                  <div className="space-y-4 pr-1">
                    {upcomingConsultations.slice(0, 4).map((appt) => (
                      <div key={appt._id} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-800">{appt.patient?.name}</p>
                          <p className="text-3xs text-slate-400">
                            {new Date(appt.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {appt.appointmentTime}
                          </p>
                        </div>
                        <AppointmentStatusBadge appointment={appt} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Activity</h3>
                {recentConsultActivity.length === 0 ? (
                  <p className="text-xs text-slate-400">No completed/cancelled consultations.</p>
                ) : (
                  <div className="space-y-4 pr-1">
                    {recentConsultActivity.slice(0, 4).map((appt) => (
                      <div key={appt._id} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-800">{appt.patient?.name}</p>
                          <p className="text-3xs text-slate-400">
                            {new Date(appt.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {appt.appointmentTime}
                          </p>
                        </div>
                        <AppointmentStatusBadge appointment={appt} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

export default DoctorDashboard;
