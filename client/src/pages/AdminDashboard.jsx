import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, Stethoscope, Calendar, CalendarCheck, CheckCircle, CalendarX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import DashboardCard from "../components/DashboardCard";
import { SkeletonCard } from "../components/Skeleton";
import * as adminService from "../services/adminService";

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats();
        setStats(response.data);
      } catch {
        toast.error("Could not load dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Admin Overview</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Welcome back, {user?.name}. Here&apos;s the system at a glance.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/doctors"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Doctors
            </Link>
            <Link
              to="/appointments"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View Appointments
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : stats ? (
          <>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Users</p>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-2">
                <DashboardCard label="Total Patients" value={stats.totalPatients} icon={Users} accent="blue" />
                <DashboardCard label="Total Doctors" value={stats.totalDoctors} icon={Stethoscope} accent="purple" />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Appointments</p>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <DashboardCard label="Total" value={stats.totalAppointments} icon={Calendar} accent="gray" />
                <DashboardCard label="Confirmed" value={stats.confirmed} icon={CalendarCheck} accent="blue" />
                <DashboardCard label="Completed" value={stats.completed} icon={CheckCircle} accent="green" />
                <DashboardCard label="Cancelled" value={stats.cancelled} icon={CalendarX} accent="red" />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AuthenticatedLayout>
  );
}

export default AdminDashboard;
