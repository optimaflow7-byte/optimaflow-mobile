import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, opportunities, activities, InsertOpportunity, InsertActivity, dealerships, InsertDealership, europeanDealerships } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Oportunidades
export async function createOpportunity(data: InsertOpportunity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(opportunities).values(data).returning({ insertedId: opportunities.id });
  return result[0]?.insertedId || 0;
}

export async function getUserOpportunities(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(opportunities)
    .where(eq(opportunities.userId, userId))
    .orderBy(desc(opportunities.createdAt));
}

export async function getOpportunityById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(opportunities).where(eq(opportunities.id, id));
  return result[0] || null;
}

export async function updateOpportunity(id: number, data: Partial<InsertOpportunity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(opportunities).set(data).where(eq(opportunities.id, id));
}

export async function deleteOpportunity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(opportunities).where(eq(opportunities.id, id));
}

export async function getOpportunityMetrics(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, byStatus: [] };

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(opportunities)
    .where(eq(opportunities.userId, userId));

  const statusCounts = await db
    .select({
      status: opportunities.status,
      count: sql<number>`count(*)`
    })
    .from(opportunities)
    .where(eq(opportunities.userId, userId))
    .groupBy(opportunities.status);

  // Calculate average score
  const scoreResult = await db
    .select({ avg: sql<number>`avg(${opportunities.opportunityScore})` })
    .from(opportunities)
    .where(eq(opportunities.userId, userId));

  return {
    total: totalResult[0]?.count || 0,
    byStatus: statusCounts,
    averageScore: Number(scoreResult[0]?.avg || 0).toFixed(1),
  };
}

// Actividades
export async function createActivity(data: InsertActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(activities).values(data).returning({ insertedId: activities.id });
  await updateOpportunity(data.opportunityId, { lastActivityDate: new Date() });
  return result[0]?.insertedId || 0;
}

export async function getOpportunityActivities(opportunityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(activities)
    .where(eq(activities.opportunityId, opportunityId))
    .orderBy(desc(activities.createdAt));
}

export async function deleteActivity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(activities).where(eq(activities.id, id));
}

// Concesionarios (Dealerships)
export async function createDealership(data: InsertDealership) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dealerships).values(data).returning({ id: dealerships.id });
  return result[0]?.id || 0;
}

export async function getDealerships() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dealerships)
    .orderBy(desc(dealerships.createdAt));
}

export async function getDealershipById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dealerships).where(eq(dealerships.id, id));
  return result[0] || null;
}

export async function updateDealership(id: number, data: Partial<InsertDealership>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(dealerships).set(data).where(eq(dealerships.id, id));
  return getDealershipById(id);
}

export async function deleteDealership(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(dealerships).where(eq(dealerships.id, id));
}

// European Dealerships (OSM Data)
export async function getEuropeanDealerships(limit = 50, offset = 0, search = "") {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(europeanDealerships).limit(limit).offset(offset);

  if (search) {
    const searchPattern = `%${search}%`;
    query = query.where(
      sql`${europeanDealerships.name} ILIKE ${searchPattern} OR 
          ${europeanDealerships.city} ILIKE ${searchPattern} OR 
          ${europeanDealerships.country} ILIKE ${searchPattern}`
    ) as any;
  }

  return query;
}

export async function getEuropeanDealershipById(id: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(europeanDealerships).where(eq(europeanDealerships.id, id));
  return result[0] || null;
}

export async function createDealershipFromEuropean(europeanId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 1. Get the European Dealership
  const euroDealership = await getEuropeanDealershipById(europeanId);
  if (!euroDealership) throw new Error("European Dealership not found");

  // 2. Check if already imported (optional, based on osmId if desired, but for now just create)
  // Check using osmId if available
  if (euroDealership.osmId) {
    const existing = await db.select().from(dealerships).where(eq(dealerships.osmId, euroDealership.osmId));
    if (existing.length > 0) {
      return existing[0].id; // Already imported
    }
  }

  // 3. Insert into dealerships
  const newDealership: InsertDealership = {
    name: euroDealership.name,
    address: euroDealership.address || undefined,
    city: euroDealership.city || undefined,
    country: euroDealership.country || undefined,
    phone: euroDealership.phone || undefined,
    website: euroDealership.website || undefined,
    location_lat: euroDealership.latitude ? String(euroDealership.latitude) : undefined,
    location_lng: euroDealership.longitude ? String(euroDealership.longitude) : undefined,
    status: "pendiente", // Default to pending review
    notes: `Importado de OSM (ID: ${euroDealership.osmId})`,
    osmId: euroDealership.osmId || undefined,
  };

  const result = await db.insert(dealerships).values(newDealership).returning({ id: dealerships.id });
  return result[0]?.id || 0;
}

