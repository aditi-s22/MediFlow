import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarCheck, CalendarX, Calendar, CheckCircle, Clock, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import DashboardCard from "../components/DashboardCard";
import { SkeletonCard } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import * as appointmentService from "../services/appointmentService";
import * as queueService from "../services/queueService";
import socket from "../services/socket";

const isTodayDate = (dateString) => {
  const d = new Date(dateString);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
};

function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
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
        const response = await appointmentService.getAppointments();
        const all = response.data.appointments;
        setAppointments(all);

        const todayAppt = all.find(
          (a) => a.status === "confirmed" && isTodayDate(a.appointmentDate)
        );

        if (todayAppt) {
          setTodayAppointment(todayAppt);
          todayApptIdRef.current = todayAppt._id;
          doctorIdRef.current = todayAppt.doctor._id;
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
      } catch {
        toast.error("Could not load your appointments");
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const total = appointments.length;
  const upcoming = appointments.filter((a) => a.status === "confirmed").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  const myQueueEntry = todayAppointment
    ? queueList.find((q) => q._id.toString() === todayAppointment._id.toString())
    : null;
  const servingEntry = currentServing
    ? queueList.find((q) => q._id.toString() === currentServing.toString())
    : null;

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Good {getGreeting()}, {user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">Here's your health overview.</p>
          </div>
          <Link
            to="/doctors"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Book Appointment
          </Link>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : total === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={Calendar}
              title="No appointments yet"
              description="Book your first appointment with one of our doctors."
              action={{ to: "/doctors", label: "Find a Doctor" }}
            />
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <DashboardCard label="Total" value={total} icon={Calendar} accent="blue" />
              <DashboardCard label="Upcoming" value={upcoming} icon={CalendarCheck} accent="green" />
              <DashboardCard label="Completed" value={completed} icon={CheckCircle} accent="gray" />
              <DashboardCard label="Cancelled" value={cancelled} icon={CalendarX} accent="red" />
            </div>

            {/* Queue card */}
            {todayAppointment && (
              <div className="mt-8 rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Today&apos;s Appointment</h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Dr. {todayAppointment.doctor?.name}
                      <span className="mx-1.5 text-gray-300">·</span>
                      {todayAppointment.appointmentTime}
                    </p>
                  </div>
                  {todayAppointment.queueNumber !== null && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      Queue #{todayAppointment.queueNumber}
                    </span>
                  )}
                </div>

                {todayAppointment.queueNumber === null ? (
                  <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">You haven&apos;t checked in yet</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Check in when you arrive at the hospital to get your queue number.
                      </p>
                    </div>
                    <button
                      onClick={handleCheckIn}
                      disabled={isCheckingIn}
                      className="ml-4 shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isCheckingIn ? "Checking in…" : "Check In"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <QueueStat
                        label="Your Number"
                        value={`#${todayAppointment.queueNumber}`}
                        highlight
                      />
                      <QueueStat
                        label="Now Serving"
                        value={servingEntry ? `#${servingEntry.queueNumber}` : "—"}
                      />
                      <QueueStat
                        label="People Ahead"
                        value={myQueueEntry ? myQueueEntry.peopleAhead : "—"}
                      />
                      <QueueStat
                        label="Est. Wait"
                        value={myQueueEntry ? `${myQueueEntry.estimatedWait} min` : "—"}
                        icon={Clock}
                      />
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                      Live — updates automatically. Please remain near the consultation room.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

function QueueStat({ label, value, highlight, icon: Icon }) {
  return (
    <div
      className={`rounded-xl p-4 text-center ${
        highlight ? "bg-blue-600" : "bg-gray-50"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wide ${highlight ? "text-blue-200" : "text-gray-400"}`}>
        {label}
      </p>
      <p className={`mt-1.5 text-2xl font-bold ${highlight ? "text-white" : "text-gray-800"}`}>
        {value}
      </p>
      {Icon && <Icon className="mx-auto mt-1 h-3.5 w-3.5 text-gray-300" />}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default PatientDashboard;
