#  MediCare Hospital Management System  

A full-stack MERN Hospital Management System with workflow-driven appointment booking, doctor verification, dynamic slot generation and role-based access control.

## Live Demo

live link = https://hospital-management-gilt-nu.vercel.app/ 

<!--👉 To explore the full application, please use the frontend link below:

🔗 Frontend (User Interface):   https://hospital-management-gilt-nu.vercel.app/   
🔗 Backend API: https://hospital-management-3-gapz.onrender.com  -->

##  Screenshots

### Home Page
![Home](hospital-mgmt-v2-enhanced/hospital-mgmt-v2/screenshots/home.png)

### Admin Dashboard
![Admin Dashboard](hospital-mgmt-v2-enhanced/hospital-mgmt-v2/screenshots/admin_dashboard.png)

### Doctor Verification Management
![Manage Doctors](hospital-mgmt-v2-enhanced/hospital-mgmt-v2/screenshots/admin_doc.png)

### Doctor Schedule & Slot Generation
![Doctor Schedule](hospital-mgmt-v2-enhanced/hospital-mgmt-v2/screenshots/doc_shecdule.png)

### Patient Appointment Booking
![Book Appointment](hospital-mgmt-v2-enhanced/hospital-mgmt-v2/screenshots/book_appointment.png)

### Prescription Management
![Prescription Management](hospital-mgmt-v2-enhanced/hospital-mgmt-v2/screenshots/doc_pris.png)

##  Tech Stack
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT
- **Frontend:** React.js (JavaScript), React Router DOM, Axios

---

##  Docker Support

Docker images are available on Docker Hub:

* Backend: `durgeshgowda/hospital-mgmt:backend-v1`
* Frontend: `durgeshgowda/hospital-mgmt:frontend-v1`

Run the application using Docker Compose:

```bash
docker compose up -d
```
Docker Hub Repository:
https://hub.docker.com/r/durgeshgowda/hospital-mgmt/tags

---

##  Key Features

### Doctor Verification Workflow
- Doctors self-register publicly via the Doctor Portal
- Newly registered doctors are **invisible to patients** until admin approves them
- Admin dashboard shows a dedicated **Pending Verifications** section
- Admin can **Approve** or **Reject** any doctor

### Dynamic Slot Generation
- No more hardcoded time slots
- Each doctor defines: Available Days, Start Time, End Time, Slot Duration
- Backend dynamically generates valid slots
- Already-booked slots are automatically excluded
- Doctor leave dates block booking entirely

### Appointment Workflow (5 statuses)
```
Patient books → pending
Admin approves → approved
Doctor completes → completed
Admin/Patient cancels → cancelled
Admin rejects → rejected
```

### Role Capabilities
| Feature | Admin | Doctor | Patient |
|---|---|---|---|
| Verify doctors | ✅ | ❌ | ❌ |
| Approve/reject appointments | ✅ | ❌ | ❌ |
| Edit own schedule | ❌ | ✅ | ❌ |
| Manage leave dates | ❌ | ✅ | ❌ |
| Book appointment | ❌ | ❌ | ✅ |
| Cancel appointment | ✅ | ❌ | ✅ |

---

##  Project Structure

```
hospital-mgmt/
├── backend/
│   ├── models/
│   │   ├── User.js          # JWT auth, roles
│   │   ├── Doctor.js        # Verification, schedule, leave dates
│   │   ├── Patient.js       # Patient records
│   │   └── Appointment.js   # 5-status workflow
│   ├── routes/
│   │   ├── auth.js          # Login, register (all roles)
│   │   ├── admin.js         # Admin: verify doctors, approve apts
│   │   ├── doctors.js       # Public doctor list + slot generation
│   │   ├── doctorRoutes.js  # Doctor: profile, schedule, leave
│   │   ├── patientRoutes.js # Patient: book, slots, appointments
│   │   ├── appointments.js  # General appointments CRUD
│   │   ├── patients.js      # Patient records
│   │   └── profile.js       # General profile
│   ├── middleware/
│   │   └── auth.js          # JWT protect, role guards
│   ├── server.js
│   ├── createAdmin.js       # One-time admin seed script
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── admin/       # Dashboard, ManageDoctors, ManageAppointments, ManageUsers
        │   ├── doctor/      # Dashboard, Appointments, Schedule, Prescriptions, Login+Register
        │   └── patient/     # Dashboard, BookAppointment (dynamic slots), Appointments, Profile
        ├── services/api.js  # All Axios API calls
        └── context/         # AuthContext with JWT persistence
```

---

## ⚙️ Setup Instructions

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
node createAdmin.js    # Creates default admin user (run once)
npm run dev            # Starts on port 5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start              # Starts on port 3000
```

Make sure `frontend/package.json` has:
```json
"proxy": "http://localhost:5000"
```

---

##  Default Credentials

After running `node createAdmin.js`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@hospital.com | admin123456 |

Doctors and patients register themselves through their respective portals.

---

##  Key API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register patient or doctor |
| POST | /api/auth/admin/login | Admin login |
| POST | /api/auth/doctor/login | Doctor login |
| POST | /api/auth/patient/login | Patient login |
| GET | /api/admin/doctors/pending | Pending doctor verifications |
| PUT | /api/admin/doctors/:id/verify | Approve or reject doctor |
| GET | /api/admin/appointments | All appointments |
| PUT | /api/admin/appointments/:id/status | Approve/reject appointment |
| GET | /api/patient/doctors | Verified doctors list |
| GET | /api/patient/doctors/:id/slots?date=YYYY-MM-DD | Dynamic available slots |
| POST | /api/patient/appointments | Book appointment |
| GET | /api/doctor/profile | Doctor own profile |
| PUT | /api/doctor/profile | Update schedule + profile |
| POST | /api/doctor/leave | Add leave dates |
| DELETE | /api/doctor/leave | Remove a leave date |
