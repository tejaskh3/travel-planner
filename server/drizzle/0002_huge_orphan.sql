CREATE TYPE "public"."pace" AS ENUM('relaxed', 'balanced', 'packed');--> statement-breakpoint
CREATE TYPE "public"."travel_group" AS ENUM('Solo', 'Couple', 'Friends', 'Family');--> statement-breakpoint
CREATE TYPE "public"."travel_style" AS ENUM('Foodie', 'Culture', 'Adventure', 'Nature', 'Nightlife', 'Shopping', 'Relaxed');--> statement-breakpoint
CREATE TABLE "preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"default_city_key" text,
	"default_days" integer,
	"default_budget_inr" integer,
	"default_pace" "pace",
	"default_group" "travel_group",
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_style_preferences" (
	"user_id" uuid NOT NULL,
	"style" "travel_style" NOT NULL,
	CONSTRAINT "user_style_preferences_user_id_style_pk" PRIMARY KEY("user_id","style")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_default_city_key_cities_key_fk" FOREIGN KEY ("default_city_key") REFERENCES "public"."cities"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_style_preferences" ADD CONSTRAINT "user_style_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_style_preferences_user_idx" ON "user_style_preferences" USING btree ("user_id");