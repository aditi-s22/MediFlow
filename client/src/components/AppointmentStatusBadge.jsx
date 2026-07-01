const statusConfig = {
  confirmed: { classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200", label: "Confirmed" },
  completed: { classes: "bg-green-50 text-green-700 ring-1 ring-green-200", label: "Completed" },
  cancelled: { classes: "bg-gray-100 text-gray-500 ring-1 ring-gray-200", label: "Cancelled" },
};

function AppointmentStatusBadge({ status }) {
  const config = statusConfig[status] ?? statusConfig.confirmed;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}

export default AppointmentStatusBadge;
