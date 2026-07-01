// In-memory map: doctorId (string) → { currentServing: appointmentId | null, lastUpdated: Date }
// Intentionally NOT persisted to MongoDB — transient runtime state only.
// If the server restarts, the doctor presses "Call Next" to restore it.
const queueStore = new Map();

export const getQueueEntry = (doctorId) =>
  queueStore.get(doctorId) ?? { currentServing: null, lastUpdated: null };

export const setCurrentServing = (doctorId, appointmentId) => {
  queueStore.set(doctorId, { currentServing: appointmentId, lastUpdated: new Date() });
};
