import "dotenv/config";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import { hashPassword } from "./password.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const name = "Library Admin";
const email = "admin@shrikrishnalibrary.com";
const password = "Admin@12345";

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const passwordHash = await hashPassword(password);

    await Admin.create({
      name,
      email,
      passwordHash,
      role: "admin",
      isActive: true
    });

    console.log("✅ Admin created successfully");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin");
    console.error(error.message);
    process.exit(1);
  }
}

createAdmin();

