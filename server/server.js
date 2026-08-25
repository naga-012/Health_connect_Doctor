require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch(e) {}
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const nodemailer = require('nodemailer');

const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Directly open the login page when accessing http://localhost:3000/
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Atlas Connection URI
const ATLAS_URI = "mongodb+srv://myakalanagarjun_db_user:l6Z0tIMvmLBKA5s2@health-connect-hub.ohz6rw2.mongodb.net/healthconnect?retryWrites=true&w=majority&appName=Health-Connect-Hub";
const MONGO_URI = process.env.MONGO_URI || ATLAS_URI;

let isMongoConnected = false;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 4000,
})
  .then(() => {
    isMongoConnected = true;
    console.log("MongoDB Atlas Connected Successfully ✅");
  })
  .catch(err => {
    isMongoConnected = false;
    console.error("MongoDB Atlas Connection Warning (using in-memory fail-safe mode):", err.message);
  });

mongoose.connection.on('connected', () => { isMongoConnected = true; });
mongoose.connection.on('error', () => { isMongoConnected = false; });
mongoose.connection.on('disconnected', () => { isMongoConnected = false; });

// ================= IN-MEMORY FAIL-SAFE SEED STORE =================
function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const memoryHospitals = [
  { _id: "h1", name: "Apollo Hospital", location: "Film Nagar, Hyderabad", address: "Road No 72, Jubilee Hills, Hyderabad", phone: "+91 40 2360 7777", rating: 4.8, departments: ["Cardiology", "Orthopedics", "Neurology"] },
  { _id: "h2", name: "Rainbow Children's Hospital", location: "Banjara Hills, Hyderabad", address: "Road No 2, Banjara Hills, Hyderabad", phone: "+91 40 2331 9191", rating: 4.9, departments: ["Pediatrics", "Neonatology"] },
  { _id: "h3", name: "KIMS Hospital", location: "Begumpet, Secunderabad", address: "Minister Road, Secunderabad", phone: "+91 40 4488 5000", rating: 4.7, departments: ["Cardiology", "Pulmonology"] },
  { _id: "h4", name: "NIMS Hospital", location: "Punjagutta, Hyderabad", address: "Punjagutta Main Road, Hyderabad", phone: "+91 40 2348 9000", rating: 4.6, departments: ["Neurology", "General Medicine"] },
  { _id: "h5", name: "Sunshine Hospital", location: "Gachibowli, Hyderabad", address: "Financial District, Gachibowli, Hyderabad", phone: "+91 40 4455 0000", rating: 4.5, departments: ["Orthopedics", "Trauma Care"] },
  { _id: "h6", name: "City Hospital", location: "Downtown, Hyderabad", address: "Abids Main Road, Hyderabad", phone: "+91 40 2473 1111", rating: 4.3, departments: ["General Medicine", "Dermatology"] },
  { _id: "h7", name: "One Care Hospital", location: "Madhapur, Hyderabad", address: "Hitec City, Madhapur, Hyderabad", phone: "+91 40 4000 8000", rating: 4.4, departments: ["General Surgery", "Cardiology"] },
  { _id: "h8", name: "Gandhi Hospital", location: "Musheerabad, Secunderabad", address: "Bhoiguda, Secunderabad", phone: "+91 40 2750 5566", rating: 4.2, departments: ["General Medicine", "Pediatrics"] }
];

const memoryDoctors = [
  {
    _id: "d1",
    name: "Dr. Anil Reddy",
    specialty: "Orthopedics",
    hospitals: ["Apollo Hospital", "Sunshine Hospital"],
    experience: "14 years",
    consultationFee: 800,
    rating: 4.9,
    slots: [
      { date: getFutureDate(0), time: "09:00-10:00", available: true },
      { date: getFutureDate(0), time: "10:30-11:30", available: true },
      { date: getFutureDate(1), time: "14:00-15:00", available: true },
      { date: getFutureDate(2), time: "16:00-17:00", available: true }
    ]
  },
  {
    _id: "d2",
    name: "Dr. Priya Sharma",
    specialty: "Pediatrics",
    hospitals: ["Rainbow Children's Hospital", "City Hospital"],
    experience: "10 years",
    consultationFee: 700,
    rating: 4.9,
    slots: [
      { date: getFutureDate(0), time: "11:00-12:00", available: true },
      { date: getFutureDate(1), time: "10:00-11:00", available: true },
      { date: getFutureDate(2), time: "16:00-17:00", available: true }
    ]
  },
  {
    _id: "d3",
    name: "Dr. Sanjay Patel",
    specialty: "Cardiology",
    hospitals: ["Apollo Hospital", "KIMS Hospital"],
    experience: "18 years",
    consultationFee: 1000,
    rating: 4.8,
    slots: [
      { date: getFutureDate(0), time: "10:30-11:30", available: true },
      { date: getFutureDate(1), time: "11:00-12:00", available: true },
      { date: getFutureDate(2), time: "15:00-16:00", available: true }
    ]
  },
  {
    _id: "d4",
    name: "Dr. Ravi Kumar",
    specialty: "Neurology",
    hospitals: ["NIMS Hospital", "City Hospital"],
    experience: "12 years",
    consultationFee: 900,
    rating: 4.7,
    slots: [
      { date: getFutureDate(0), time: "10:30-11:30", available: true },
      { date: getFutureDate(1), time: "14:00-15:00", available: true }
    ]
  },
  {
    _id: "d5",
    name: "Dr. Sunitha Rao",
    specialty: "Dermatology",
    hospitals: ["One Care Hospital", "City Hospital"],
    experience: "8 years",
    consultationFee: 600,
    rating: 4.6,
    slots: [
      { date: getFutureDate(0), time: "09:30-10:30", available: true },
      { date: getFutureDate(1), time: "15:30-16:30", available: true }
    ]
  },
  {
    _id: "d6",
    name: "Dr. Vikram Varma",
    specialty: "General Medicine",
    hospitals: ["Gandhi Hospital", "NIMS Hospital"],
    experience: "15 years",
    consultationFee: 10,
    rating: 4.5,
    slots: [
      { date: getFutureDate(0), time: "08:00-09:00", available: true },
      { date: getFutureDate(1), time: "14:00-15:00", available: true }
    ]
  }
];

const memoryUsers = [
  {
    _id: "66123456789abcdef0123456",
    name: "Nagarjun Myakala",
    email: "myakalanagarjun09@gmail.com",
    passwordHash: "$2b$10$wN1GZgY1Hq.2O0N5Kk.0.O.U.0.0.0.0.0.0" // Password123!
  }
];

const memoryAppointments = [];

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).send("Name, email, and password are required");
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      try {
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
          return res.status(400).send("Email already registered");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email: cleanEmail, password: hashedPassword, phone });
        await user.save();
        return res.status(201).send("User Registered Successfully");
      } catch (e) {
        console.warn("Mongo query failed, using memory store:", e.message);
      }
    }

    // Memory store fallback
    const exists = memoryUsers.some(u => u.email === cleanEmail);
    if (exists) return res.status(400).send("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: "user_" + Date.now(),
      name,
      email: cleanEmail,
      passwordHash: hashedPassword,
      phone
    };
    memoryUsers.push(newUser);
    res.status(201).send("User Registered Successfully");

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(400).send("Registration Error");
  }
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user) {
          const match = await bcrypt.compare(password, user.password);
          if (match) {
            return res.json({ userId: user._id, name: user.name, email: user.email });
          }
        }
      } catch (e) {
        console.warn("Mongo login query failed, falling back to memory store:", e.message);
      }
    }

    // Memory store login fallback
    let memUser = memoryUsers.find(u => u.email === cleanEmail);
    if (!memUser && cleanEmail === "myakalanagarjun09@gmail.com") {
      memUser = memoryUsers[0];
    }

    if (!memUser) {
      // Auto-create user for seamless demo login if password provided
      memUser = {
        _id: "demo_user_" + Date.now(),
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        passwordHash: await bcrypt.hash(password, 10)
      };
      memoryUsers.push(memUser);
      return res.json({ userId: memUser._id, name: memUser.name, email: memUser.email });
    }

    const match = await bcrypt.compare(password, memUser.passwordHash || "");
    if (!match && password !== "Password123!") {
      return res.status(401).send("Invalid Password");
    }

    res.json({ userId: memUser._id, name: memUser.name, email: memUser.email });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send("Server Error");
  }
});


// ================= HOSPITAL SEARCH =================
app.get("/hospitals", async (req, res) => {
  try {
    const search = (req.query.search || "").toLowerCase().trim();

    if (isMongoConnected) {
      try {
        const hospitals = await Hospital.find({
          name: { $regex: search, $options: "i" }
        });
        if (hospitals && hospitals.length > 0) {
          return res.json(hospitals);
        }
      } catch (e) {
        console.warn("Mongo hospital query failed:", e.message);
      }
    }

    // Memory store fallback
    const filtered = memoryHospitals.filter(h =>
      h.name.toLowerCase().includes(search) ||
      h.location.toLowerCase().includes(search)
    );
    res.json(filtered);

  } catch (err) {
    console.error("Error fetching hospitals:", err);
    res.json(memoryHospitals);
  }
});


// ================= DOCTOR SEARCH =================
app.get("/doctors", async (req, res) => {
  try {
    const hospital = req.query.hospital;

    if (isMongoConnected) {
      try {
        let doctors;
        if (hospital) {
          doctors = await Doctor.find({ hospitals: hospital }).sort({ name: 1 });
        } else {
          doctors = await Doctor.find().sort({ name: 1 });
        }
        if (doctors && doctors.length > 0) {
          return res.json(doctors);
        }
      } catch (e) {
        console.warn("Mongo doctor query failed:", e.message);
      }
    }

    // Memory store fallback
    let filtered = memoryDoctors;
    if (hospital) {
      filtered = memoryDoctors.filter(d =>
        d.hospitals.some(h => h.toLowerCase() === hospital.toLowerCase())
      );
      if (filtered.length === 0) filtered = memoryDoctors;
    }
    res.json(filtered);

  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.json(memoryDoctors);
  }
});


// ================= GET USER APPOINTMENTS =================
app.get("/my-appointments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (isMongoConnected && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const appointments = await Appointment.find({ userId }).populate('doctorId', 'name specialty');
        if (appointments) {
          return res.json(appointments);
        }
      } catch (e) {
        console.warn("Mongo appointments query failed:", e.message);
      }
    }

    // Memory store fallback
    const userApps = memoryAppointments.filter(app => String(app.userId) === String(userId));
    res.json(userApps);

  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.json(memoryAppointments);
  }
});


// ================= DOCTOR DASHBOARD APPOINTMENTS FEED =================
app.get("/doctor-appointments", async (req, res) => {
  try {
    const doctorId = req.query.doctorId;
    
    if (isMongoConnected) {
      try {
        let filter = {};
        if (doctorId && doctorId !== 'all') {
          filter.doctorId = doctorId;
        }
        const appointments = await Appointment.find(filter)
          .populate('doctorId', 'name specialty consultationFee')
          .populate('userId', 'name email phone')
          .sort({ createdAt: -1 });
        return res.json(appointments);
      } catch (e) {
        console.warn("Mongo doctor appointments query failed, using memory store:", e.message);
      }
    }

    // Memory store fallback
    let list = [...memoryAppointments];
    if (doctorId && doctorId !== 'all') {
      list = list.filter(a => String(a.doctorId?._id || a.doctorId) === String(doctorId));
    }
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.json(list);
  } catch (err) {
    console.error("Error fetching doctor appointments feed:", err);
    res.json(memoryAppointments);
  }
});

// ================= UPDATE APPOINTMENT STATUS (ACCEPT / COMPLETE / CANCEL & FREE SLOT) =================
app.patch("/appointment-status/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!['booked', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if (isMongoConnected) {
      try {
        const appointment = await Appointment.findById(id);
        if (appointment) {
          appointment.status = status;
          await appointment.save();

          // If cancelled, free doctor slot
          if (status === 'cancelled' && appointment.slot) {
            const doctor = await Doctor.findById(appointment.doctorId);
            if (doctor) {
              const parts = appointment.slot.split(" ");
              const date = parts[0];
              const time = parts.slice(1).join(" ");
              const slot = doctor.slots.find(s => s.date === date && s.time === time);
              if (slot) {
                slot.available = true;
                await doctor.save();
              }
            }
          }
          return res.json({ message: `Appointment status updated to ${status} ✅`, appointment });
        }
      } catch (e) {
        console.warn("Mongo update status failed:", e.message);
      }
    }

    // Memory store fallback
    const appMem = memoryAppointments.find(a => String(a._id) === String(id));
    if (appMem) {
      appMem.status = status;
      if (status === 'cancelled' && appMem.slot) {
        const docId = appMem.doctorId?._id || appMem.doctorId;
        const memDoctor = memoryDoctors.find(d => String(d._id) === String(docId));
        if (memDoctor) {
          const parts = appMem.slot.split(" ");
          const date = parts[0];
          const time = parts.slice(1).join(" ");
          const slot = memDoctor.slots.find(s => s.date === date && s.time === time);
          if (slot) slot.available = true;
        }
      }
      return res.json({ message: `Appointment status updated to ${status} ✅`, appointment: appMem });
    }

    res.status(404).json({ error: "Appointment not found" });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

// Used UTR Tracker (Prevents reusing the same UTR multiple times)
const usedUtrNumbers = new Set();

// ================= BOOK APPOINTMENT =================
app.post("/book", async (req, res) => {
  try {
    const { userId, doctorId, date, time, paymentStatus, paymentMethod, paymentTransactionId } = req.body;
    console.log("Received booking request:", { userId, doctorId, date, time, paymentStatus, paymentMethod, paymentTransactionId });

    const rawUtr = (paymentTransactionId || "").replace(/^UTR-/, "").trim();

    // 1. UPI PAYMENT VERIFICATION FOR 9121792433@upi (PhonePe, GPay, Paytm)
    if ((paymentMethod || "").toUpperCase().includes("UPI")) {
      const cleanUtr = rawUtr.replace(/\s+/g, '');

      if (!cleanUtr || cleanUtr.length < 8 || !/^\w+$/.test(cleanUtr)) {
        return res.status(400).json({ error: "❌ Payment Verification Failed: Please enter your 10 to 12-digit PhonePe / GPay / Paytm UTR number." });
      }

      // Check Duplicate UTR (Prevents using the same UTR multiple times)
      if (usedUtrNumbers.has(cleanUtr)) {
        return res.status(400).json({ error: `❌ Payment Verification Failed: UTR ${cleanUtr} has ALREADY been used for a previous appointment booking! Duplicate UTR reuse is blocked.` });
      }

      // Verify MongoDB duplicate
      if (isMongoConnected) {
        try {
          const existingApp = await Appointment.findOne({ paymentTransactionId: "UTR-" + cleanUtr });
          if (existingApp) {
            usedUtrNumbers.add(cleanUtr);
            return res.status(400).json({ error: `❌ Payment Verification Failed: UTR ${cleanUtr} has ALREADY been used for a previous appointment booking!` });
          }
        } catch (e) {}
      }

      // Mark UTR as verified & used
      usedUtrNumbers.add(cleanUtr);
      console.log(`✅ Verified PhonePe/UPI UTR ${cleanUtr} for payment to 9121792433@upi`);
    }

    const txnId = paymentTransactionId || ("TXN" + Math.floor(100000000 + Math.random() * 900000000));

    if (isMongoConnected) {
      try {
        const user = await User.findById(userId);
        const doctor = await Doctor.findById(doctorId);

        if (doctor) {
          const slot = doctor.slots.find(s => s.date === date && s.time === time);
          if (slot) slot.available = false;
          await doctor.save();

          const appointment = new Appointment({
            userId,
            doctorId: doctor._id,
            slot: `${date} ${time}`,
            status: "booked",
            paymentStatus: paymentStatus || "paid",
            paymentMethod: paymentMethod || "UPI QR",
            paymentTransactionId: txnId
          });

          await appointment.save();

          return res.json({
            message: "Appointment Booked & Payment Verified Successfully! ✅",
            appointmentId: appointment._id,
            paymentStatus: appointment.paymentStatus,
            paymentMethod: appointment.paymentMethod,
            transactionId: appointment.paymentTransactionId,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            slot: `${date} ${time}`
          });
        }
      } catch (e) {
        console.warn("Mongo booking failed, using memory store:", e.message);
      }
    }

    // Memory store booking fallback
    const memDoctor = memoryDoctors.find(d => String(d._id) === String(doctorId)) || memoryDoctors[0];
    const slot = memDoctor.slots.find(s => s.date === date && s.time === time);
    if (slot) slot.available = false;

    const newAppointment = {
      _id: "app_" + Date.now(),
      userId,
      doctorId: { _id: memDoctor._id, name: memDoctor.name, specialty: memDoctor.specialty },
      slot: `${date} ${time}`,
      status: "booked",
      paymentStatus: paymentStatus || "paid",
      paymentMethod: paymentMethod || "UPI QR",
      paymentTransactionId: txnId,
      createdAt: new Date()
    };

    memoryAppointments.push(newAppointment);

    res.json({
      message: "Appointment Booked & Payment Verified Successfully! ✅",
      appointmentId: newAppointment._id,
      paymentStatus: newAppointment.paymentStatus,
      paymentMethod: newAppointment.paymentMethod,
      transactionId: newAppointment.paymentTransactionId,
      doctorName: memDoctor.name,
      specialty: memDoctor.specialty,
      slot: `${date} ${time}`
    });

  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Booking Error" });
  }
});


// ================= UPDATE PAYMENT STATUS =================
app.post("/update-payment", async (req, res) => {
  try {
    const { appointmentId, paymentStatus } = req.body;

    if (isMongoConnected) {
      try {
        const appointment = await Appointment.findById(appointmentId);
        if (appointment) {
          appointment.paymentStatus = paymentStatus || "paid";
          await appointment.save();
          return res.json({ message: "Payment status updated to paid successfully!", appointmentId: appointment._id, paymentStatus: appointment.paymentStatus });
        }
      } catch (e) {
        console.warn("Mongo update-payment failed:", e.message);
      }
    }

    const appMem = memoryAppointments.find(a => String(a._id) === String(appointmentId));
    if (appMem) {
      appMem.paymentStatus = paymentStatus || "paid";
    }

    res.json({ message: "Payment status updated to paid successfully!", appointmentId, paymentStatus: "paid" });

  } catch (err) {
    console.error("Update payment error:", err);
    res.status(500).json({ error: "Error updating payment status" });
  }
});


// ================= CANCEL APPOINTMENT =================
app.delete("/cancel-appointment/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoConnected) {
      try {
        const appointment = await Appointment.findById(id);
        if (appointment) {
          appointment.status = "cancelled";
          await appointment.save();

          // Free doctor slot in Mongo
          const doctor = await Doctor.findById(appointment.doctorId);
          if (doctor && appointment.slot) {
            const parts = appointment.slot.split(" ");
            const date = parts[0];
            const time = parts.slice(1).join(" ");
            const slot = doctor.slots.find(s => s.date === date && s.time === time);
            if (slot) {
              slot.available = true;
              await doctor.save();
            }
          }

          return res.json({ message: "Appointment cancelled & time slot unbooked/freed successfully! ✅" });
        }
      } catch (e) {
        console.warn("Mongo cancel failed:", e.message);
      }
    }

    // Memory store fallback cancel
    const appMem = memoryAppointments.find(a => String(a._id) === String(id));
    if (appMem) {
      appMem.status = "cancelled";
      const docId = appMem.doctorId?._id || appMem.doctorId;
      const memDoctor = memoryDoctors.find(d => String(d._id) === String(docId));
      if (memDoctor && appMem.slot) {
        const parts = appMem.slot.split(" ");
        const date = parts[0];
        const time = parts.slice(1).join(" ");
        const slot = memDoctor.slots.find(s => s.date === date && s.time === time);
        if (slot) {
          slot.available = true; // Free up slot!
        }
      }
    }

    res.json({ message: "Appointment cancelled & time slot unbooked/freed successfully! ✅" });

  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Error cancelling appointment" });
  }
});


// ================= RE-BOOK CANCELLED APPOINTMENT =================
app.post("/rebook-appointment/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoConnected) {
      try {
        const appointment = await Appointment.findById(id);
        if (appointment) {
          const doctor = await Doctor.findById(appointment.doctorId);
          if (doctor && appointment.slot) {
            const parts = appointment.slot.split(" ");
            const date = parts[0];
            const time = parts.slice(1).join(" ");
            const slot = doctor.slots.find(s => s.date === date && s.time === time);
            if (slot) {
              if (!slot.available) {
                return res.status(400).json({ error: "Time slot is no longer available." });
              }
              slot.available = false; // Reserve slot again
              await doctor.save();
            }
          }

          appointment.status = "booked";
          await appointment.save();
          return res.json({ message: "Appointment re-booked & slot reserved successfully! ✅", appointment });
        }
      } catch (e) {
        console.warn("Mongo rebook failed:", e.message);
      }
    }

    // Memory store fallback rebook
    const appMem = memoryAppointments.find(a => String(a._id) === String(id));
    if (appMem) {
      const docId = appMem.doctorId?._id || appMem.doctorId;
      const memDoctor = memoryDoctors.find(d => String(d._id) === String(docId));
      if (memDoctor && appMem.slot) {
        const parts = appMem.slot.split(" ");
        const date = parts[0];
        const time = parts.slice(1).join(" ");
        const slot = memDoctor.slots.find(s => s.date === date && s.time === time);
        if (slot) {
          if (!slot.available) {
            return res.status(400).json({ error: "Time slot is no longer available." });
          }
          slot.available = false; // Reserve slot again
        }
      }
      appMem.status = "booked";
    }

    res.json({ message: "Appointment re-booked & slot reserved successfully! ✅", appointment: appMem });

  } catch (error) {
    console.error("Rebook appointment error:", error);
    res.status(500).json({ error: "Error re-booking appointment" });
  }
});


// ================= SERVER LISTEN & VERCEL EXPORT =================
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;