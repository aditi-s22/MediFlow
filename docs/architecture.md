# MediFlow — Architecture

## Folder Structure

```
MediFlow/
├── client/                     # React + Vite frontend
│   └── src/
│       ├── components/         # Shared UI components
│       ├── context/            # React Context (auth state)
│       ├── layouts/            # Page wrapper with Navbar
│       ├── pages/              # One file per route
│       ├── services/           # Axios calls + socket instance
│       └── utils/              # Helpers (styles, routing)
│
└── server/                     # Express + Node.js backend
    ├── config/                 # MongoDB connection
    ├── controllers/            # Route handler functions
    ├── middleware/             # JWT protect + role guard
    ├── models/                 # Mongoose schemas
    ├── routes/                 # Express routers
    ├── scripts/                # One-off admin seed
    ├── socket/                 # Socket.io initialisation
    └── utils/                  # Shared helpers
```

---

## Backend Architecture

### Request lifecycle

```
HTTP request
  → Express router
    → protect middleware (verify JWT, attach req.user)
      → authorizeRoles middleware (check role)
        → controller (business logic + DB write)
          → response
```

### Models

**User** — single model for all three roles. Doctor-only fields (`specialization`, `experience`, `consultationFee`, `availableSlots`) are optional and ignored for patient/admin documents.

**Appointment** — links a patient and a doctor. Holds `status` (confirmed / completed / cancelled), `queueNumber` (null until check-in), and `estimatedWait` (field exists but is always calculated dynamically — never written to DB).

### Key utilities

| File | Purpose |
|---|---|
| `utils/buildQueuePayload.js` | Builds the full queue snapshot from DB + in-memory store. Used by the REST endpoint and every socket emit. |
| `utils/queueStore.js` | In-memory Map: `doctorId → { currentServing, lastUpdated }`. Not persisted. |
| `utils/getPopulatedAppointments.js` | Shared Mongoose query with `.populate()` for patient/doctor names. |
| `utils/formatUserResponse.js` | Strips password and normalises user shape before sending to the frontend. |
| `utils/isSameUser.js` | Safe ObjectId string comparison for ownership checks. |

---

## Frontend Architecture

### Auth flow

```
App loads
  → AuthContext mounts
    → reads token from localStorage
      → calls GET /api/users/profile (if token exists)
        → sets user + isAuthenticated
          → ProtectedRoute allows or redirects
```

Login / Register → `AuthContext.login()` / `.register()` → stores token in localStorage → sets user state.

Logout → clears localStorage → sets user to null → redirects to `/login`.

### Data flow

- Every page fetches its own data on mount via service functions (`src/services/`).
- After mutations (cancel, complete, check-in), the component updates state in place — no full refetch.
- Auth token is auto-attached to every Axios request via a request interceptor in `services/api.js`.

### Routing

```
/                    → Landing (public)
/login               → Login (public)
/register            → Register (public)
/patient/dashboard   → PatientDashboard [patient only]
/doctor/dashboard    → DoctorDashboard  [doctor only]
/admin/dashboard     → AdminDashboard   [admin only]
/admin/doctors       → AdminDoctors     [admin only]
/doctors             → Doctors          [patient only]
/doctors/:id/book    → BookAppointment  [patient only]
/appointments        → Appointments     [any role]
/profile             → Profile          [any role]
```

Role gating is enforced by `ProtectedRoute`, which redirects to `/login` if unauthenticated or to `/` if the role does not match.

---

## Queue Flow

```
1. Patient books appointment
   → status: "confirmed", queueNumber: null

2. Patient arrives, clicks Check In
   → PATCH /api/appointments/:id/checkin
   → Backend counts existing checked-in appointments for same doctor + date
   → Assigns queueNumber = count + 1
   → Emits queueUpdated with full queue snapshot

3. Doctor clicks Call Next
   → POST /api/queue/:doctorId/next
   → Backend finds next appointment in sorted queue
   → Writes appointmentId to in-memory queueStore only (no DB write)
   → Emits queueUpdated with currentServing set

4. Doctor completes appointment
   → PATCH /api/appointments/:id/complete
   → status: "completed" saved to DB
   → Appointment disappears from confirmed queue
   → Emits queueUpdated

5. Cancel works the same as Complete from the queue's perspective
```

### estimatedWait calculation

```
peopleAhead × 15 minutes
```

Calculated in `buildQueuePayload.js` at request/emit time. Never stored in MongoDB.

---

## Socket.io Flow

### Connection

- Client creates one shared socket instance (`services/socket.js`) with `autoConnect: false`.
- Doctor Dashboard and Patient Dashboard call `socket.connect()` on mount and `socket.disconnect()` on unmount.

### Room naming

```
doctor_<doctorId>
```

Every client watching a doctor's queue joins this room by emitting `joinDoctorRoom`.

### Events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `joinDoctorRoom` | `doctorId` (string) |
| Server → Client | `queueUpdated` | `{ currentServing, queue: [...] }` |

The `queueUpdated` payload is a complete queue snapshot. The frontend applies it directly to state — no follow-up HTTP request needed.

### Emit triggers

`queueUpdated` is emitted after:
- Check In (`PATCH /api/appointments/:id/checkin`)
- Complete Appointment (`PATCH /api/appointments/:id/complete`)
- Cancel Appointment (`PATCH /api/appointments/:id/cancel`)
- Call Next (`POST /api/queue/:doctorId/next`)

No business logic runs inside socket handlers. The server-side socket module (`socket/socket.js`) only handles `joinDoctorRoom` and `disconnect`.
