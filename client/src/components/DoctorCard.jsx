import { Link } from "react-router-dom";
import { Star, Globe, Clock, Building, ArrowRight } from "lucide-react";
import formatDoctorName from "../utils/formatDoctorName";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function DoctorCard({ doctor, variant = "directory", isBestMatch = false, predictionLogId }) {
  const todayDay = DAYS_OF_WEEK[new Date().getDay()];
  const isAvailableToday = doctor.availableDays?.includes(todayDay);

  return (
    <div
      className={`flex flex-col md:flex-row gap-6 rounded-2xl bg-white p-6 shadow-sm border transition-all hover:shadow-md text-left ${
        isBestMatch ? "border-blue-200 bg-blue-50/5 ring-2 ring-blue-600/10" : "border-slate-100"
      }`}
    >
      {/* Photo */}
      <div className="w-full md:w-40 shrink-0">
        <div className="h-40 w-full md:w-40 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 relative">
          <img
            src={doctor.profilePicture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400"}
            alt={formatDoctorName(doctor.name)}
            className="h-full w-full object-cover"
          />
          {isAvailableToday && (
            <span className="absolute bottom-2 left-2 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              Available today
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                {formatDoctorName(doctor.name)}
              </h2>
              {isBestMatch && (
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Best match
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">{doctor.specialization}</p>
            <p className="text-xs text-slate-400 mt-0.5">{doctor.qualification}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{doctor.rating ? doctor.rating.toFixed(1) : "4.8"}</span>
            <span className="text-slate-400 font-normal">({doctor.reviewCount || 200})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 border-t border-slate-50 pt-3">
          <div>
            <span className="font-medium text-slate-400">Experience:</span> {doctor.experience} years
          </div>
          <div>
            <span className="font-medium text-slate-400">Fee:</span>{" "}
            <span className="font-semibold text-slate-800">₹{doctor.consultationFee}</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 mt-1">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-400">Languages:</span> {doctor.languagesSpoken?.join(", ") || "English, Hindi"}
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-400">Hospital:</span> {doctor.hospitalName || "MediFlow General Hospital"}
          </div>
        </div>

        {doctor.aboutDoctor && (
          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 border border-slate-100/50 p-3 rounded-lg">
            &ldquo;{doctor.aboutDoctor}&rdquo;
          </p>
        )}
      </div>

      {/* CTA panel */}
      <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col justify-end md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-3">
        <div className="flex-1 md:flex-none text-left md:text-center">
          <p className="text-[10px] font-medium text-slate-400">Availability</p>
          <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1 md:justify-center">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {doctor.availableSlots?.length || 0} slots
          </p>
          {variant === "recommendation" && doctor.queueLength > 0 && (
            <p className="text-[11px] text-slate-400 mt-0.5 md:text-center">
              Today's queue: {doctor.queueLength} waiting
            </p>
          )}
        </div>
        <Link
          to={`/doctors/${doctor._id}/book`}
          state={predictionLogId ? { predictionLogId } : undefined}
          className="rounded-xl bg-blue-600 px-5 py-3 text-center text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 group shrink-0"
        >
          Book appointment
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

export default DoctorCard;
