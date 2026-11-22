CREATE TABLE "albums" (
	"id" text PRIMARY KEY,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_chapters" (
	"id" text PRIMARY KEY,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" text PRIMARY KEY,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stage_settings" (
	"id" text PRIMARY KEY,
	"value" jsonb NOT NULL
);
