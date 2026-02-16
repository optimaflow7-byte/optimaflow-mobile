CREATE TYPE "public"."type" AS ENUM('llamada', 'email', 'reunion', 'nota', 'propuesta');--> statement-breakpoint
CREATE TYPE "public"."dealership_status" AS ENUM('activo', 'inactivo', 'pendiente');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('contactado', 'en_progreso', 'cerrado', 'perdido');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunityId" integer NOT NULL,
	"type" "type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"notes" text,
	"result" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealerships" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"phone" varchar(50),
	"website" varchar(255),
	"location_lat" varchar(50),
	"location_lng" varchar(50),
	"status" "dealership_status" DEFAULT 'activo' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"companyName" varchar(255) NOT NULL,
	"country" varchar(100) NOT NULL,
	"companyType" varchar(100) NOT NULL,
	"status" "status" DEFAULT 'contactado' NOT NULL,
	"opportunityScore" integer NOT NULL,
	"strategyId" varchar(255),
	"contactDate" timestamp,
	"lastActivityDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
