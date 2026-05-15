CREATE TYPE "public"."preference_category" AS ENUM('food', 'culture', 'outdoor', 'nightlife', 'shopping');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" "preference_category" NOT NULL,
	"duration_minutes" integer NOT NULL,
	"cost_usd" real NOT NULL,
	"address" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"display_name" text NOT NULL,
	"country" text NOT NULL,
	CONSTRAINT "cities_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_city_idx" ON "activities" USING btree ("city_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activities_city_name_idx" ON "activities" USING btree ("city_id","name");