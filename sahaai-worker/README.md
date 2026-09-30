# Sahaai Partner - Field Technician & Emergency Dispatch Portal

The **Sahaai Partner** application is a dedicated frontend tailored for field technicians, emergency responders, and service workers. It operates independently from the customer web application on a separate port and origin to enable concurrent real-time testing.

---

## 🚀 Running Side-by-Side in Real Time

| Application | Role | Port & URL | Description |
| :--- | :--- | :--- | :--- |
| **Sahaai Backend** | API & SignalR Hubs | `http://localhost:51386` | ASP.NET Core 10.0 Web API |
| **Sahaai Web** | Customer / Admin | `http://localhost:5176` | Request creation, tracking, user catalog |
| **Sahaai Partner** | Field Technician / Worker | `http://localhost:5174` | Dispatch radar, GPS, job accept/start/complete |

---

## 🔑 Default Technician Test Credentials

- **Username**: `rameshworker`
- **Password**: `WorkerPassword@123`
- *(Or use the "Quick Fill" button on the login screen to sign in with one click)*
- New field technicians can also onboard via `/register` with their 12-digit Aadhaar number and profile photo.

---

## ⚡ Core Operational Features

1. **Dedicated Authentication & Role Guard**:
   - Only accounts with `role === "Worker"` can log in. Customer credentials will be rejected.
2. **Duty Availability Switch**:
   - One-click toggle between **ON DUTY (Online)** and **OFF DUTY (Offline)**.
3. **GPS Geolocation Manager & Haversine Radar**:
   - Streams live coordinates to backend cache (`/api/WorkerProfile/location`).
   - Includes a coordinate simulator modal for easy desktop testing without mobile GPS.
   - Calculates distance in km using the Haversine formula.
   - Adjustable dispatch radius filter (5km, 15km, 25km, 50km).
4. **Live Dispatch Feed**:
   - Auto-refreshes every 8 seconds.
   - Displays customer emergency details, photos, and customer voice notes.
   - One-click "Accept Job" with confirmation modal.
5. **Mission Control (Active Job)**:
   - "Open Turn-by-Turn Directions in Google Maps" link.
   - One-click phone call button to customer (`tel:`).
   - "Start Job (I Have Arrived)" -> transitions to `InProgress` and alerts customer.
   - "Mark Job Completed" -> opens completion notes dialog and resolves ticket.
   - "Decline / Release Request" -> returns request back to search pool.
6. **Partner Dashboard & History**:
   - Metrics cards (Completed, Active, Assigned, Duty Status).
   - Archived logs of all resolved calls.

---

## 🛠 Commands

```bash
# Install dependencies
npm install

# Start development server on port 5174
npm run dev

# Production build
npm run build
```

