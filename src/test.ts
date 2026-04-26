import "dotenv/config";
import { db } from "./db/client.js";
import { sql } from "drizzle-orm";

async function testConnection() {
  try {
    const result = await db.execute(sql`SELECT NOW()`);
    console.log("✅ Database connected successfully!", result.rows[0]);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } process.exit(0);
}

testConnection();