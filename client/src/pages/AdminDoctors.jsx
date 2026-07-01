import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Stethoscope, Plus, X } from "lucide-react";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import EmptyState from "../components/EmptyState";
import { SkeletonBar } from "../components/Skeleton";
import * as doctorService from "../services/doctorService";
import { inputClassName } from "../utils/inputStyles";

const emptyForm = {
  name: "", email: "", password: "", phone: "",
  specialization: "", experience: "", consultationFee: "", availableSlots: "",
};

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorService.getDoctors();
        setDoctors(response.data.doctors);
      } catch {
        toast.error("Could not load doctors");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const openCreateForm = () => {
    setEditingDoctor(null);
    setFormData(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name, email: doctor.email, password: "", phone: doctor.phone,
      specialization: doctor.specialization || "",
      experience: doctor.experience ?? "",
      consultationFee: doctor.consultationFee ?? "",
      availableSlots: (doctor.availableSlots || []).join(", "),
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingDoctor(null); };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const payload = {
      name: formData.name, phone: formData.phone,
      specialization: formData.specialization,
      experience: Number(formData.experience),
      consultationFee: Number(formData.consultationFee),
      availableSlots: formData.availableSlots.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingDoctor) {
        const response = await doctorService.updateDoctor(editingDoctor._id, payload);
        setDoctors((prev) =>
          prev.map((d) => (d._id === editingDoctor._id ? response.data.doctor : d))
        );
        toast.success("Doctor updated successfully");
      } else {
        const response = await doctorService.createDoctor({ ...payload, email: formData.email, password: formData.password });
        setDoctors((prev) => [...prev, response.data.doctor]);
        toast.success("Doctor account created");
      }
      closeForm();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save doctor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doctorId) => {
    setDeletingId(doctorId);
    try {
      await doctorService.deleteDoctor(doctorId);
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
      toast.success("Doctor removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove doctor");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Manage Doctors</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {isLoading ? "" : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} registered`}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Add Doctor
          </button>
        </div>

        {/* Slide-in form */}
        {showForm && (
          <div className="mt-6 rounded-xl bg-white p-6 ring-1 ring-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                {editingDoctor ? "Edit Doctor" : "New Doctor"}
              </h2>
              <button type="button" onClick={closeForm} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full name</label>
                  <input name="name" value={formData.name} onChange={handleChange} className={inputClassName} placeholder="Dr. Jane Smith" />
                </div>
                {!editingDoctor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClassName} placeholder="doctor@hospital.com" />
                  </div>
                )}
                {!editingDoctor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputClassName} placeholder="Minimum 6 characters" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone number</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} className={inputClassName} placeholder="10-digit number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <input name="specialization" value={formData.specialization} onChange={handleChange} className={inputClassName} placeholder="e.g. Cardiology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                  <input name="experience" type="number" min="0" value={formData.experience} onChange={handleChange} className={inputClassName} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consultation fee (₹)</label>
                  <input name="consultationFee" type="number" min="0" value={formData.consultationFee} onChange={handleChange} className={inputClassName} placeholder="500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Available slots (comma-separated)</label>
                  <input name="availableSlots" value={formData.availableSlots} onChange={handleChange} className={inputClassName} placeholder="10:00 AM, 11:00 AM, 2:00 PM" />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving…" : editingDoctor ? "Save Changes" : "Create Doctor"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 ring-1 ring-gray-100">
                  <SkeletonBar className="h-4 w-36" />
                  <SkeletonBar className="h-4 w-24" />
                  <SkeletonBar className="ml-auto h-4 w-16" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="No doctors registered"
              description="Add the first doctor to get started."
            />
          ) : (
            <div>
              {/* Mobile cards */}
              <div className="space-y-3 sm:hidden">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="rounded-xl bg-white p-5 ring-1 ring-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                        {doctor.name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{doctor.name}</p>
                        <p className="truncate text-xs text-gray-400">{doctor.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400">Specialty</p>
                        <p className="font-medium text-gray-700">{doctor.specialization || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Exp</p>
                        <p className="font-medium text-gray-700">{doctor.experience} yr</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Fee</p>
                        <p className="font-medium text-gray-700">₹{doctor.consultationFee}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {doctor.availableSlots?.length || 0} slots
                      </span>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => openEditForm(doctor)} className="text-xs font-medium text-blue-600 hover:underline">Edit</button>
                        <button type="button" onClick={() => handleDelete(doctor._id)} disabled={deletingId === doctor._id} className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50">
                          {deletingId === doctor._id ? "Removing…" : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl bg-white ring-1 ring-gray-100 sm:block">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Name", "Specialization", "Experience", "Fee", "Slots", ""].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {doctors.map((doctor) => (
                      <tr key={doctor._id} className="transition-colors hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                              {doctor.name?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doctor.name}</p>
                              <p className="text-xs text-gray-400">{doctor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{doctor.specialization}</td>
                        <td className="px-5 py-4 text-gray-600">{doctor.experience} yr</td>
                        <td className="px-5 py-4 text-gray-600">₹{doctor.consultationFee}</td>
                        <td className="px-5 py-4 text-gray-600">
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {doctor.availableSlots?.length || 0} slots
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button type="button" onClick={() => openEditForm(doctor)} className="text-xs font-medium text-blue-600 hover:underline">Edit</button>
                            <button type="button" onClick={() => handleDelete(doctor._id)} disabled={deletingId === doctor._id} className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50">
                              {deletingId === doctor._id ? "Removing…" : "Remove"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default AdminDoctors;
