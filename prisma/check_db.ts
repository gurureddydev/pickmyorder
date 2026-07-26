import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load dotenv
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pickmyorder"
    }
  }
});

async function main() {
  try {
    console.log("Using MONGODB_URI:", process.env.MONGODB_URI);
    const users = await prisma.user.findMany();
    const output = JSON.stringify(users, null, 2);
    fs.writeFileSync(path.join(__dirname, "check_db_output.txt"), `URI: ${process.env.MONGODB_URI}\nUsers:\n${output}`);
    console.log("Written output to check_db_output.txt");
  } catch (error: any) {
    fs.writeFileSync(path.join(__dirname, "check_db_output.txt"), `URI: ${process.env.MONGODB_URI}\nError: ${error?.message || String(error)}`);
    console.error("Error fetching users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
