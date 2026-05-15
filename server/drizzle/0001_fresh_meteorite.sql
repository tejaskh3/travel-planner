CREATE TABLE "itineraries" (
	"id" text PRIMARY KEY NOT NULL,
	"city_id" uuid NOT NULL,
	"request" jsonb NOT NULL,
	"response" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "itineraries_created_at_idx" ON "itineraries" USING btree ("created_at");