require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch(e) {}
dns.setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const DIRECT_ATLAS_URI = "mongodb://myakalanagarjun_db_user:l6Z0tIMvmLBKA5s2@ac-jtvveox-shard-00-00.ohz6rw2.mongodb.net:27017,ac-jtvveox-shard-00-01.ohz6rw2.mongodb.net:27017,ac-jtvveox-shard-00-02.ohz6rw2.mongodb.net:27017/healthconnect?ssl=true&replicaSet=atlas-13oecy-shard-0&authSource=admin&retryWrites=true&w=majority";
const ATLAS_URI = "mongodb+srv://myakalanagarjun_db_user:l6Z0tIMvmLBKA5s2@health-connect-hub.ohz6rw2.mongodb.net/healthconnect?retryWrites=true&w=majority&appName=Health-Connect-Hub";
const MONGO_URI = process.env.MONGO_URI || DIRECT_ATLAS_URI;

const seedHospitals = [
  {
    name: "Apollo Hospital",
    location: "Film Nagar, Hyderabad",
    address: "Road No 72, Jubilee Hills, Hyderabad, Telangana",
    phone: "+91 40 2360 7777",
    rating: 4.8,
    departments: ["Cardiology", "Orthopedics", "Neurology", "Oncology"]
  },
  {
    name: "Rainbow Children's Hospital",
    location: "Banjara Hills, Hyderabad",
    address: "Road No 2, Banjara Hills, Hyderabad, Telangana",
    phone: "+91 40 2331 9191",
    rating: 4.9,
    departments: ["Pediatrics", "Neonatology", "Pediatric Surgery"]
  },
  {
    name: "KIMS Hospital",
    location: "Begumpet, Secunderabad",
    address: "Minister Road, Secunderabad, Telangana",
    phone: "+91 40 4488 5000",
    rating: 4.7,
    departments: ["Cardiology", "Gastroenterology", "Pulmonology"]
  },
  {
    name: "NIMS Hospital",
    location: "Punjagutta, Hyderabad",
    address: "Punjagutta Main Road, Hyderabad, Telangana",
    phone: "+91 40 2348 9000",
    rating: 4.6,
    departments: ["Neurology", "Nephrology", "General Medicine"]
  },
  {
    name: "Sunshine Hospital",
    location: "Gachibowli, Hyderabad",
    address: "Financial District, Gachibowli, Hyderabad, Telangana",
    phone: "+91 40 4455 0000",
    rating: 4.5,
    departments: ["Orthopedics", "Trauma Care", "Rheumatology"]
  },
  {
    name: "City Hospital",
    location: "Downtown, Hyderabad",
    address: "Abids Main Road, Hyderabad, Telangana",
    phone: "+91 40 2473 1111",
    rating: 4.3,
    departments: ["General Medicine", "ENT", "Dermatology"]
  },
  {
    name: "One Care Hospital",
    location: "Madhapur, Hyderabad",
    address: "Hitec City, Madhapur, Hyderabad, Telangana",
    phone: "+91 40 4000 8000",
    rating: 4.4,
    departments: ["General Surgery", "Cardiology", "Orthopedics"]
  },
  {
    name: "Gandhi Hospital",
    location: "Musheerabad, Secunderabad",
    address: "Bhoiguda, Secunderabad, Telangana",
    phone: "+91 40 2750 5566",
    rating: 4.2,
    departments: ["General Medicine", "Pediatrics", "Emergency Care"]
  }
];

function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const seedDoctors = [
  {
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
    name: "Dr. Priya Sharma",
    specialty: "Pediatrics",
    hospitals: ["Rainbow Children's Hospital", "City Hospital"],
    experience: "10 years",
    consultationFee: 700,
    rating: 4.9,
    slots: [
      { date: getFutureDate(0), time: "11:00-12:00", available: true },
      { date: getFutureDate(1), time: "10:00-11:00", available: true },
      { date: getFutureDate(2), time: "16:00-17:00", available: true },
      { date: getFutureDate(3), time: "11:30-12:30", available: true }
    ]
  },
  {
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
    name: "Dr. Ravi Kumar",
    specialty: "Neurology",
    hospitals: ["NIMS Hospital", "City Hospital"],
    experience: "12 years",
    consultationFee: 900,
    rating: 4.7,
    slots: [
      { date: getFutureDate(0), time: "10:30-11:30", available: true },
      { date: getFutureDate(1), time: "14:00-15:00", available: true },
      { date: getFutureDate(2), time: "15:00-16:00", available: true }
    ]
  },
  {
    name: "Dr. Sunitha Rao",
    specialty: "Dermatology",
    hospitals: ["One Care Hospital", "City Hospital"],
    experience: "8 years",
    consultationFee: 600,
    rating: 4.6,
    slots: [
      { date: getFutureDate(0), time: "09:30-10:30", available: true },
      { date: getFutureDate(1), time: "15:30-16:30", available: true },
      { date: getFutureDate(2), time: "11:00-12:00", available: true }
    ]
  },
  {
    name: "Dr. Vikram Varma",
    specialty: "General Medicine",
    hospitals: ["Gandhi Hospital", "NIMS Hospital"],
    experience: "15 years",
    consultationFee: 10,
    rating: 4.5,
    slots: [
      { date: getFutureDate(0), time: "08:00-09:00", available: true },
      { date: getFutureDate(1), time: "14:00-15:00", available: true },
      { date: getFutureDate(2), time: "10:00-11:00", available: true }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas!");

    // Clear existing collections
    console.log("Clearing existing collections...");
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});
    await Appointment.deleteMany({});

    // Seed Hospitals
    console.log("Seeding Hospitals...");
    const insertedHospitals = await Hospital.insertMany(seedHospitals);
    console.log(`✅ Seeded ${insertedHospitals.length} Hospitals`);

    // Seed Doctors
    console.log("Seeding Doctors...");
    const insertedDoctors = await Doctor.insertMany(seedDoctors);
    console.log(`✅ Seeded ${insertedDoctors.length} Doctors`);

    // Seed Demo User
    console.log("Seeding Demo Patient User...");
    const hashedPassword = await bcrypt.hash("Password123!", 10);
    const demoUser = new User({
      name: "Nagarjun Myakala",
      email: "myakalanagarjun09@gmail.com",
      password: hashedPassword,
      phone: "+91 9876543210",
      role: "patient"
    });
    await demoUser.save();
    console.log(`✅ Seeded Demo User: ${demoUser.email} (Password: Password123!)`);

    // Seed Demo Appointment
    console.log("Seeding Demo Appointment...");
    const sampleDoctor = insertedDoctors[0];
    const sampleSlot = sampleDoctor.slots[0];
    sampleSlot.available = false;
    await sampleDoctor.save();

    const demoAppointment = new Appointment({
      userId: demoUser._id,
      doctorId: sampleDoctor._id,
      slot: `${sampleSlot.date} ${sampleSlot.time}`,
      status: "booked",
      paymentStatus: "paid"
    });
    await demoAppointment.save();
    console.log(`✅ Seeded Demo Appointment for ${sampleDoctor.name}`);

    console.log("\n=========================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=========================================\n");

  } catch (err) {
    console.error("❌ Error Seeding Database:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected.");
    process.exit(0);
  }
}

seedDatabase();
