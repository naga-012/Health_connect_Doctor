# Health Connect Appointment Hub 🏥

A full-stack web application built with **Node.js, Express, MongoDB Atlas, and Vanilla HTML/CSS/JS** for booking hospital appointments and discovering doctors.

---

## 🏗️ Project Architecture & Structure

```text
new health connect hub/
├── .env                  # Environment configuration (MongoDB Atlas URI, Port, Mailer credentials)
├── package.json          # Project metadata and dependencies
├── server/
│   ├── server.js         # Express backend API server
│   ├── seed.js           # Database mock data seeding script
│   └── models/           # Mongoose Data Models
│       ├── User.js       # User / Patient schema
│       ├── Hospital.js   # Hospital schema
│       ├── Doctor.js     # Doctor & Slot schema
│       └── Appointment.js# Appointment booking schema
├── public/               # Frontend Static Assets & Web Pages
│   ├── index.html        # Landing page
│   ├── login.html        # User login
│   ├── register.html     # User registration
│   ├── hospitals.html    # Hospitals directory & search
│   ├── doctors.html      # Doctors directory & slot booking
│   ├── my-appointment.html # User appointments dashboard
│   └── style.css         # Main modern UI stylesheet
├── js/                   # Legacy / Modular JS scripts
└── css/                  # Backup CSS stylesheets
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Clone & Navigate to Project Directory
Open your terminal / command prompt and navigate to the project directory:
```bash
cd "new health connect hub"
```

### Step 2: Configure Environment Variables (`.env`)
Create or verify the `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGO_URI=mongodb+srv://myakalanagarjun_db_user:l6Z0tIMvmLBKA5s2@health-connect-hub.ohz6rw2.mongodb.net/healthconnect?retryWrites=true&w=majority&appName=Health-Connect-Hub

EMAIL_USER=myakalanagarjun09@gmail.com
EMAIL_PASS=ajpgnvyjrbkrecua
```

### Step 3: Install Node.js Dependencies
Install Express, Mongoose, Dotenv, Bcrypt, CORS, and Nodemailer:
```bash
npm install
```

### Step 4: Seed MongoDB Atlas Database with Mock Data
Populate MongoDB Atlas with initial hospitals, doctors, dynamic available time slots, test user accounts, and appointments:
```bash
npm run seed
```
*Expected Output:* `🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!`

### Step 5: Start the Application Server
Run the Express backend server:
```bash
# Production / Normal Start
npm start

# Development Mode (auto-reloads on code changes)
npm run dev
```

### Step 6: Access Frontend in Web Browser
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo Login Credentials

- **Email**: `myakalanagarjun09@gmail.com`
- **Password**: `Password123!`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/register` | Register a new patient account |
| `POST` | `/login` | Authenticate user & return session details |
| `GET` | `/hospitals?search=:query` | Retrieve list of hospitals with optional search filter |
| `GET` | `/doctors?hospital=:name` | Retrieve list of doctors with slot availability |
| `GET` | `/my-appointments/:userId` | Get booked appointments for a given user |
| `POST` | `/book` | Book a doctor appointment slot & send confirmation email |
| `DELETE`| `/cancel-appointment/:id`| Cancel appointment and free up doctor slot |
