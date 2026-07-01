import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import * as doctorService from "../services/doctorService";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (specialization) params.specialization = specialization;
        const response = await doctorService.getDoctors(params);
        setDoctors(response.data.doctors);
        setError("");
      } catch {
        setError("Could not load doctors. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(debounce);
  }, [search, specialization]);

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-800">Find a Doctor</h1>
        <p className="mt-1 text-sm text-gray-500">Browse available doctors and book an appointment.</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search doctors by name"
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <input
            type="search"
            placeholder="Filter by specialization…"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            aria-label="Filter doctors by specialization"
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-gray-500">Loading doctors…</p>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        ) : doctors.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-600 font-medium">No doctors found</p>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800">{doctor.name}</h2>
                  <p className="mt-0.5 text-sm font-medium text-blue-600">{doctor.specialization}</p>
                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    <p>{doctor.experience} years experience</p>
                    <p>Consultation fee: ₹{doctor.consultationFee}</p>
                    <p>
                      {doctor.availableSlots?.length > 0
                        ? `${doctor.availableSlots.length} slot${doctor.availableSlots.length === 1 ? "" : "s"} available`
                        : "No slots available"}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/doctors/${doctor._id}/book`}
                  className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

export default Doctors;
