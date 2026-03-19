/**
 * seed.js  –  Populate the DB with dummy data for development.
 * Usage:  node seed.js
 */

import mongoose from "mongoose";
import "dotenv/config";

import Admin from "./models/admin.js";
import Registration from "./models/user.js";
import UserDetail from "./models/userDetail.js";

const MONGO_URI =
  process.env.MONGO_DB_URI || "mongodb://localhost:27017/bsgindia";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB:", MONGO_URI);

  // ── Wipe existing data ───────────────────────────────────────────────
  await Admin.deleteMany({});
  await Registration.deleteMany({});
  await UserDetail.deleteMany({});
  
  try {
    await Registration.collection.dropIndexes();
  } catch (e) {
    console.log("⚠️ No indexes to drop or collection doesn't exist");
  }
  
  console.log("🗑️  Cleared previous records and reset indexes");

  // ── Create 2 Admins ──────────────────────────────────────────────────
  const admins = [
    {
      email: "deep.bsgindia@gmail.com",
      password: "Admin@1234",
      role: "admin",
      bsg_uid: "BSG-ADM-001",
      otp_verified: true,
    },
    {
      email: "admin2@bsgindia.com",
      password: "Admin@1234",
      role: "admin",
      bsg_uid: "BSG-ADM-002",
      otp_verified: true,
    },
  ];

  const createdAdmins = await Admin.insertMany(admins);
  console.log(`👤 ${createdAdmins.length} Admins created`);

  // ── Create 7 Dummy Users (Registration + UserDetail) ─────────────────
  const userSeeds = [
    { name: "Yash Kumar", email: "yash@example.com", status: "PENDING", section: "Scout" },
    { name: "Anita Sharma", email: "anita@example.com", status: "APPROVED", section: "Guide", appNo: "BSG/2024/01" },
    { name: "Rahul Singh", email: "rahul@example.com", status: "REJECTED", section: "Rover", remarks: "Photo not clear. Please re-upload." },
    { name: "Priya Das", email: "priya@example.com", status: "PENDING", section: "Ranger" },
    { name: "Vikram Mehra", email: "vikram@example.com", status: "PENDING", section: "Scout" },
    { name: "Sneha Kapur", email: "sneha@example.com", status: "APPROVED", section: "Guide", appNo: "BSG/2024/02" },
    { name: "Amit Patel", email: "amit@example.com", status: "PENDING", section: "Rover" },
  ];

  for (const seed of userSeeds) {
    // 1. Create Registration
    const reg = await Registration.create({
      email: seed.email,
      name: seed.name,
      password: "User@1234",
      role: "user",
      mobile_no: `900000000${userSeeds.indexOf(seed)}`,
      section: seed.section,
      otp_verified: true,
      status: seed.status,
      admin_remarks: seed.remarks || null,
      application_no: seed.appNo || null,
      registration_date: new Date(),
      application_submission_date: new Date(),
      admin_id: seed.status !== "PENDING" ? createdAdmins[0]._id : null,
    });

    // 2. Create UserDetail
    await UserDetail.create({
      account: reg._id,
      name: seed.name,
      email: reg.email,
      mobile_no: reg.mobile_no,
      dob: "2000-01-01",
      address: {
        pincode: "110001",
        revenue_state: "Delhi",
        revenue_district: "Central Delhi",
        house_no: "Street No. 1, Block A",
      },
      bsg_state: "Delhi",
      bsg_district: "Central Delhi",
      highest_qualification: "Graduate",
      professional_qualification: "Student",
      tshirt_size: "M",
      section: seed.section,
      year_of_rastrapati: "2023",
      certificate_no: `CERT-${reg._id.toString().slice(-5)}`,
      souvenir: "Yes",
      aadhaar_no: `1234567890${userSeeds.indexOf(seed)}0`,
    });

    console.log(`🙋 User created: ${seed.email} (${seed.status})`);
  }

  // ── Summary ───────────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║              SEED DATA SUMMARY                  ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log("║  ADMINS                                         ║");
  console.log("║    1. deep.bsgindia@gmail.com / Admin@1234      ║");
  console.log("║    2. admin2@bsgindia.com / Admin@1234          ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log("║  USERS (7 seeded)                               ║");
  console.log("║    All users have password: User@1234           ║");
  console.log("║    Status mix: PENDING, APPROVED, REJECTED      ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
