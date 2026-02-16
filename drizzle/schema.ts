import { integer, pgEnum, pgTable, text, timestamp, varchar, serial, uuid, doublePrecision, bigint } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["contactado", "en_progreso", "cerrado", "perdido"]);
export const activityTypeEnum = pgEnum("type", ["llamada", "email", "reunion", "nota", "propuesta"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Oportunidades de venta
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  companyType: varchar("companyType", { length: 100 }).notNull(),
  status: statusEnum("status").default("contactado").notNull(),
  opportunityScore: integer("opportunityScore").notNull(),
  strategyId: varchar("strategyId", { length: 255 }),
  contactDate: timestamp("contactDate"),
  lastActivityDate: timestamp("lastActivityDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

// Actividades y notas de seguimiento
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunityId").notNull(),
  type: activityTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  notes: text("notes"),
  result: varchar("result", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

export const dealershipStatusEnum = pgEnum("dealership_status", ["activo", "inactivo", "pendiente"]);

export const dealerships = pgTable("dealerships", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  location_lat: varchar("location_lat", { length: 50 }),
  location_lng: varchar("location_lng", { length: 50 }),
  status: dealershipStatusEnum("status").default("activo").notNull(),
  notes: text("notes"),
  osmId: bigint("osm_id", { mode: "number" }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Dealership = typeof dealerships.$inferSelect;
export type InsertDealership = typeof dealerships.$inferInsert;

// Concesionarios de Europa (European Dealerships from OSM)
export const europeanDealerships = pgTable("concesionarios_europa", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("nombre").notNull(),
  brand: text("marca"),
  country: text("pais"),
  city: text("ciudad"),
  address: text("direccion"),
  postalCode: text("codigo_postal"),
  phone: text("telefono"),
  website: text("sitio_web"),
  latitude: doublePrecision("latitud"), // mapped to DOUBLE PRECISION
  longitude: doublePrecision("longitud"), // mapped to DOUBLE PRECISION
  osmId: bigint("osm_id", { mode: "number" }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type EuropeanDealership = typeof europeanDealerships.$inferSelect;
export type InsertEuropeanDealership = typeof europeanDealerships.$inferInsert;
