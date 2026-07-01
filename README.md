# MediFlow

A full-stack Hospital Queue & Appointment Management System built with the MERN stack and Socket.io.

Patients book appointments, check in on the day, and watch their queue position update in real time. Doctors manage their queue and mark consultations complete. Admins oversee the entire system.

---

## Features

**Patients**
- Register and log in
- Browse doctors by name or specialization
- Book appointments from available time slots
- Check in on the day of the appointment
- Watch live queue position, people ahead, and estimated wait time

**Doctors**
- View all assigned appointments
- See today's live check-in queue
- Call the next patient
- Mark appointments as complete

**Admins**
- View system-wide stats (patients, doctors, appointments)
- Create, edit, and delete doctor accounts
- View all appointments with search and status filter

**Real-time**
- Queue updates via Socket.io — no polling, no page refreshes
- Doctor Dashboard and Patient Dashboard both update live when any queue action occurs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7 |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas, Mongoose 8 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Real-time | Socket.io 4 |
| HTTP client | Axios |
| State management | React Context API |

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for a full breakdown of:
- Folder structure
- Backend request lifecycle
- Frontend auth and data flow
- Queue flow (check-in → call next → complete)
- Socket.io room and event design

---

## Installation

**Prerequisites:** Node.js 18+, a MongoDB Atlas cluster (free tier works)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd MediFlow

# 2. Install server dependencies
cd server && npm install

# 3. Install client dependencies
cd ../client && npm install
```

---

## Environment Variables

### Server — `server/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mediflow
JWT_SECRET=<long-random-string-minimum-32-chars>

# Used only by scripts/createAdmin.js
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@mediflow.com
ADMIN_PASSWORD=<strong-password>
ADMIN_PHONE=9999999999
```

### Client — `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Copy `client/.env.example` to `client/.env` and fill in your values.

---

## Running Locally

**Seed the admin account** (run once):

```bash
cd server
node scripts/createAdmin.js
```

**Start the backend:**

```bash
cd server
npm run dev
```

**Start the frontend** (separate terminal):

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

---

## Screenshots

_Add screenshots after first deployment._

| Page | Description |
|---|---|
| Login | Auth screen with role-based redirect |
| Patient Dashboard | Stats + live queue card after check-in |
| Doctor Dashboard | Live queue with "Call Next" + appointment list |
| Admin Dashboard | System-wide stats overview |
| Book Appointment | Doctor info + date picker + available slot buttons |

---

## Future Improvements

- SMS / email notifications when the doctor calls the next patient
- Mobile-responsive Navbar with hamburger menu for small screens
- Appointment rescheduling — currently patients must cancel and rebook
- Doctor availability calendar — per-day slot configuration
- Pagination on the Appointments and Admin Doctors pages
- Charts for appointment trends over time
- Multi-language support

---

## Deployment

### Before deploying

**1. Harden the JWT secret**

Replace `JWT_SECRET` in `server/.env` with a cryptographically random string (32+ characters). Never commit `.env`.

**2. Restrict CORS**

In `server/server.js`:
```js
app.use(cors({ origin: "https://your-frontend-domain.com" }));
```

In `server/socket/socket.js`:
```js
const io = new Server(httpServer, {
  cors: { origin: "https://your-frontend-domain.com" },
});
```

**3. Update client env**

Set `VITE_API_BASE_URL` and `VITE_SOCKET_URL` to your production server URL in the hosting platform's env dashboard.

**4. Build the frontend**

```bash
cd client
npm run build
```

The `dist/` folder is the static build ready for any static host.

### Recommended platforms

| Service | What to deploy |
|---|---|
| Railway / Render | Express + Node.js server |
| Vercel / Netlify | React frontend (`client/dist`) |
| MongoDB Atlas | Already cloud-hosted |

---

## License

MIT
