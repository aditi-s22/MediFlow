function DashboardCard({ label, value, icon: Icon, accent = "blue" }) {
  const accentMap = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    red: "bg-red-50 text-red-500",
    amber: "bg-amber-50 text-amber-500",
    purple: "bg-purple-50 text-purple-500",
    gray: "bg-gray-100 text-gray-400",
  };

  return (
    <div className="flex items-start justify-between rounded-xl bg-white p-5 ring-1 ring-gray-100">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-800">{value ?? "—"}</p>
      </div>
      {Icon && (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
      )}
    </div>
  );
}

export default DashboardCard;
