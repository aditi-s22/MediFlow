function AppointmentStatusBadge({ appointment, status, queueNumber, isServing }) {
  const stat = appointment?.status || status || "confirmed";
  const qNum = appointment?.queueNumber !== undefined && appointment?.queueNumber !== null
    ? appointment.queueNumber
    : (queueNumber !== undefined ? queueNumber : null);

  if (stat === "cancelled") {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 ring-1 ring-red-200">
        Cancelled
      </span>
    );
  }

  if (stat === "completed") {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
        Completed
      </span>
    );
  }

  if (qNum === null) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 ring-1 ring-blue-150">
        Booked
      </span>
    );
  }

  if (isServing) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 ring-1 ring-teal-200 animate-pulse">
        Currently Serving
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 ring-1 ring-amber-200">
      Waiting
    </span>
  );
}

export default AppointmentStatusBadge;
