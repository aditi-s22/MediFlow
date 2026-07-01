import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import * as userService from "../services/userService";
import { inputClassName } from "../utils/inputStyles";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}

function Profile() {
  const { user, updateUser } = useAuth();
  const isDoctor = user?.role === "doctor";

  const [phone, setPhone] = useState(user?.phone || "");
  const [consultationFee, setConsultationFee] = useState(user?.consultationFee ?? "");
  const [availableSlots, setAvailableSlots] = useState((user?.availableSlots || []).join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { phone };
    if (isDoctor) {
      payload.consultationFee = Number(consultationFee);
      payload.availableSlots = availableSlots
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    setIsSubmitting(true);
    try {
      const response = await userService.updateProfile(payload);
      updateUser(response.data.user);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel = { patient: "Patient", doctor: "Doctor", admin: "Administrator" };

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-xl px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        <p className="mt-0.5 text-sm text-gray-500">Manage your account details.</p>

        {/* Read-only info */}
        <div className="mt-6 rounded-xl bg-white p-6 ring-1 ring-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-400">{roleLabel[user?.role]}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5">
            <Field label="Email" value={user?.email} />
            <Field label="Role" value={roleLabel[user?.role]} />
            {isDoctor && (
              <>
                <Field label="Specialization" value={user?.specialization} />
                <Field label="Experience" value={user?.experience ? `${user.experience} years` : null} />
              </>
            )}
          </div>
        </div>

        {/* Editable fields */}
        <div className="mt-4 rounded-xl bg-white p-6 ring-1 ring-gray-100">
          <h2 className="mb-5 text-sm font-semibold text-gray-800">Edit Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClassName}
                placeholder="10-digit number"
              />
            </div>

            {isDoctor && (
              <>
                <div>
                  <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                    Consultation fee (₹)
                  </label>
                  <input
                    id="consultationFee"
                    type="number"
                    min="0"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className={inputClassName}
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label htmlFor="availableSlots" className="block text-sm font-medium text-gray-700">
                    Available time slots
                  </label>
                  <input
                    id="availableSlots"
                    type="text"
                    value={availableSlots}
                    onChange={(e) => setAvailableSlots(e.target.value)}
                    className={inputClassName}
                    placeholder="e.g. 10:00 AM, 11:00 AM, 2:00 PM"
                  />
                  <p className="mt-1 text-xs text-gray-400">Separate multiple slots with commas.</p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default Profile;
