import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  Stethoscope,
  Calendar,
  CalendarCheck,
  CheckCircle,
  CalendarX,
  ShieldAlert,
  Plus,
  RefreshCw,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import DashboardCard from "../components/DashboardCard";
import { SkeletonCard } from "../components/Skeleton";
import AppointmentStatusBadge from "../components/AppointmentStatusBadge";
import * as adminService from "../services/adminService";
import * as doctorService from "../services/doctorService";
import * as mlService from "../services/mlService";
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

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [mlAnalytics, setMlAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [statsRes, apptsRes, docsRes, mlAnalyticsRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllAppointments(),
        doctorService.getDoctors(),
        mlService.getMLAnalytics().catch(() => null),
      ]);
      setStats(statsRes.data);
      setAppointments(apptsRes.data.appointments || []);
      setDoctors(docsRes.data.doctors || []);
      if (mlAnalyticsRes) {
        setMlAnalytics(mlAnalyticsRes.data);
      }
    } catch {
      toast.error("Could not load operational control logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const todayAppointments = appointments.filter((a) => isTodayDate(a.appointmentDate));

  const upcomingCount = appointments.filter(
    (a) => a.status === "confirmed" && !isTodayDate(a.appointmentDate)
  ).length;

  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;

  const deptCounts = {};
  appointments.forEach((a) => {
    const dept = a.doctor?.specialization;
    if (dept) deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const mostBookedDept = Object.keys(deptCounts).sort((a, b) => deptCounts[b] - deptCounts[a])[0] || "General Medicine";

  const activeDoctorsCount = doctors.filter((d) => d.status !== "inactive").length;

  const recentActivities = [];
  appointments.slice(0, 5).forEach((appt) => {
    if (appt.status === "completed") {
      recentActivities.push({
        title: "Consultation Completed",
        desc: `${appt.patient?.name || "Patient"} with ${formatDoctorName(appt.doctor?.name) || "Doctor"}`,
        color: "bg-emerald-500",
      });
    } else if (appt.status === "cancelled") {
      recentActivities.push({
        title: "Appointment Cancelled",
        desc: `${appt.patient?.name || "Patient"} with ${formatDoctorName(appt.doctor?.name) || "Doctor"}`,
        color: "bg-rose-500",
      });
    } else if (appt.status === "confirmed") {
      recentActivities.push({
        title: appt.queueNumber ? "Patient Checked In" : "Appointment Booked",
        desc: `${appt.patient?.name || "Patient"} with ${formatDoctorName(appt.doctor?.name) || "Doctor"}`,
        color: appt.queueNumber ? "bg-amber-500" : "bg-blue-500",
      });
    }
  });

  if (recentActivities.length === 0) {
    recentActivities.push({
      title: "System Initialized",
      desc: "Waiting for clinical bookings...",
      color: "bg-teal-500",
    });
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Header Control Panel */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6 mb-8">
          <div className="border-l-4 border-slate-900 pl-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Hospital control center</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Operations supervisor: <span className="font-semibold text-slate-700">{user?.name}</span> · System status: healthy
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-2xs"
              aria-label="Refresh Dashboard Metrics"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Link
              to="/admin/doctors"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Manage doctors
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : stats ? (
          <div className="space-y-8">
            
            {/* Operational Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
              <DashboardCard label="Today's appointments" value={todayAppointments.length} icon={Calendar} accent="blue" />
              <DashboardCard label="Upcoming bookings" value={upcomingCount} icon={CalendarCheck} accent="purple" />
              <DashboardCard label="Completed consults" value={completedCount} icon={CheckCircle} accent="green" />
              <DashboardCard label="Cancelled bookings" value={cancelledCount} icon={CalendarX} accent="red" />
              <DashboardCard label="Most booked dept" value={mostBookedDept} icon={Stethoscope} accent="green" />
              <DashboardCard label="Active doctors" value={activeDoctorsCount} icon={Users} accent="amber" />
            </div>

            {/* Layout Split */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              
              {/* Left Side: Queues & Bookings (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Doctor Clinic Queue Status */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-50 pb-4 mb-4">
                    Department activity
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doctors.slice(0, 6).map((doc) => (
                      <div key={doc._id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-left">
                        <div className="flex items-center gap-3">
                          <img
                            src={doc.profilePicture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100"}
                            alt={doc.name}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{doc.name}</h4>
                            <p className="text-3xs font-semibold text-blue-600 uppercase tracking-wider">{doc.specialization}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-2xs text-slate-500 pt-2 border-t border-slate-100/50">
                          <span>Slots: {doc.availableSlots?.length || 0}</span>
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-3xs font-bold text-blue-700">
                            Duty Status: Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System-wide Recent Appointments */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-50 pb-4 mb-4">
                    Today's appointments
                  </h2>
                  
                  {appointments.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No system-wide bookings found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                            <th className="pb-3 font-semibold">Patient</th>
                            <th className="pb-3 font-semibold">Doctor / Dept</th>
                            <th className="pb-3 font-semibold">Scheduled Date</th>
                            <th className="pb-3 font-semibold">Time</th>
                            <th className="pb-3 font-semibold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {appointments.slice(0, 6).map((appt) => (
                            <tr key={appt._id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 font-bold text-slate-800">{appt.patient?.name}</td>
                              <td className="py-3.5">
                                <p className="font-medium text-slate-800">{formatDoctorName(appt.doctor?.name)}</p>
                                <p className="text-3xs text-blue-600 uppercase tracking-wider">{appt.doctor?.specialization}</p>
                              </td>
                              <td className="py-3.5 text-slate-500">
                                {new Date(appt.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </td>
                              <td className="py-3.5 font-mono text-slate-500">{appt.appointmentTime}</td>
                              <td className="py-3.5 text-right">
                                <AppointmentStatusBadge status={appt.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Specialist Routing Assistant Insights */}
                {mlAnalytics && (
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm mt-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Specialist Routing Assistant Insights</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Operational statistics from the symptom guidance workflow</p>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <div className="text-right">
                          <p className="text-slate-400 text-3xs uppercase font-bold">Total Search Queries</p>
                          <p className="font-extrabold text-slate-900 text-sm">{mlAnalytics.totalPredictions}</p>
                        </div>
                        <div className="text-right border-l border-slate-100 pl-4">
                          <p className="text-slate-400 text-3xs uppercase font-bold">Average Match Rate</p>
                          <p className="font-extrabold text-blue-600 text-sm">{(mlAnalytics.averageConfidence * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Top Suggested Specialties */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Top suggested specialties</h3>
                        {mlAnalytics.mostPredictedDepartments?.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No search logs available.</p>
                        ) : (
                          <div className="space-y-2">
                            {mlAnalytics.mostPredictedDepartments?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 rounded-xl px-3 py-2 border border-slate-100/50">
                                <span className="font-bold text-slate-700">❤️ {item.department}</span>
                                <span className="rounded-full bg-slate-200/60 px-2 py-0.5 font-bold text-slate-800 text-3xs">{item.count} queries</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Top Booked Specialists */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Top booked specialists</h3>
                        {mlAnalytics.mostRecommendedDoctors?.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No bookings recorded via recommendations yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {mlAnalytics.mostRecommendedDoctors?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 rounded-xl px-3 py-2 border border-slate-100/50">
                                <div>
                                  <p className="font-bold text-slate-700">{item.name}</p>
                                  <p className="text-[10px] text-blue-600 font-semibold uppercase">{item.specialization}</p>
                                </div>
                                <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 font-bold text-emerald-700 text-3xs">{item.count} bookings</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Search Volume Over Time */}
                    <div className="border-t border-slate-50 pt-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Search volume over time</h3>
                      {mlAnalytics.predictionVolumeOverTime?.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No timeline logs recorded yet.</p>
                      ) : (
                        <div className="flex items-end gap-3 h-28 pt-4 pb-2 border-b border-slate-100/60 max-w-xl">
                          {mlAnalytics.predictionVolumeOverTime?.map((item, idx) => {
                            const maxVal = Math.max(...mlAnalytics.predictionVolumeOverTime.map(d => d.count), 1);
                            const barHeightPct = `${(item.count / maxVal) * 100}%`;
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                                <span className="absolute -top-6 hidden group-hover:block bg-slate-800 text-white text-[9px] font-bold rounded px-1.5 py-0.5 shadow shrink-0 z-10 whitespace-nowrap">
                                  {item.count} queries
                                </span>
                                <div 
                                  style={{ height: barHeightPct }}
                                  className="w-full rounded-t-md bg-blue-500 hover:bg-blue-600 transition-all min-h-[4px]"
                                />
                                <span className="text-[9px] text-slate-400 font-semibold truncate max-w-full">
                                  {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Recent symptom queries */}
                    <div className="border-t border-slate-50 pt-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Recent symptom queries</h3>
                      {mlAnalytics.mostSearchedSymptoms?.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No symptom queries logged yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {mlAnalytics.mostSearchedSymptoms?.map((item, idx) => (
                            <div key={idx} className="text-xs border border-slate-100 rounded-xl p-3 bg-slate-50/20 hover:bg-slate-50/50 transition-colors">
                              <p className="italic text-slate-700 font-medium">&ldquo;{item.symptoms}&rdquo;</p>
                              <div className="flex gap-4 text-3xs font-semibold text-slate-400 mt-2">
                                <span>Suggested Wing: <strong className="text-blue-600">{item.predictedDepartment}</strong></span>
                                <span>Match: <strong className="text-slate-705">{(item.confidence * 100).toFixed(0)}%</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Side: Logs & Actions (4 cols) */}
              <div className="lg:col-span-4 space-y-8 text-left">
                
                {/* Control Actions */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick actions</h3>
                  <div className="space-y-2">
                    <Link
                      to="/admin/doctors"
                      className="w-full rounded-xl bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all flex items-center gap-2 block"
                    >
                      <Stethoscope className="h-4.5 w-4.5 text-slate-500" />
                      Doctor Account Management
                    </Link>
                    <Link
                      to="/appointments"
                      className="w-full rounded-xl bg-slate-50 border border-slate-100 py-3 px-4 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all flex items-center gap-2 block"
                    >
                      <Calendar className="h-4.5 w-4.5 text-slate-500" />
                      System-wide Booking Logs
                    </Link>
                  </div>
                </div>

                {/* Live System Activity Log */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent registrations &amp; activity</h3>
                  <div className="space-y-4 text-2xs font-mono text-slate-500">
                    {recentActivities.map((act, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full mt-1 shrink-0 ${act.color}`} />
                        <div>
                          <p className="text-slate-800 font-bold">{act.title}</p>
                          <p className="text-[10px] text-slate-400">{act.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations Notifications */}
                <div className="rounded-2xl border border-yellow-100 bg-yellow-50/20 p-6 shadow-2xs">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Bell className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-sm font-semibold">System notifications</h3>
                  </div>
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-yellow-100 shadow-2xs">
                      <ShieldAlert className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-2xs text-slate-600">
                        <strong>Cardiology Wing</strong> experiencing high volume today. 8 appointments scheduled.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : null}
      </div>
    </AuthenticatedLayout>
  );
}

export default AdminDashboard;
