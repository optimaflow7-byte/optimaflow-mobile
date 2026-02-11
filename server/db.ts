import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, opportunities, activities, InsertOpportunity, InsertActivity } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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
  const result = await db.insert(opportunities).values(data);
  return result[0]?.insertId || 0;
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
  const result = await db.insert(activities).values(data);
  await updateOpportunity(data.opportunityId, { lastActivityDate: new Date() });
  return result[0]?.insertId || 0;
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
