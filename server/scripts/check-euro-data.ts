import "dotenv/config";
import { getDb } from "../db";
import { europeanDealerships } from "../../drizzle/schema";
import { sql } from "drizzle-orm";

async function check() {
    const db = await getDb();
    if (!db) {
        console.error("DB not connected");
        return;
    }

    const count = await db.select({ count: sql<number>`count(*)` }).from(europeanDealerships);
    console.log("Total European Dealerships:", count[0].count);

    const sample = await db.select().from(europeanDealerships).limit(5);
    console.log("Sample Data:", JSON.stringify(sample, null, 2));
}

check();
