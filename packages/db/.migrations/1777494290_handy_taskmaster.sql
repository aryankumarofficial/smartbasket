ALTER TABLE "products" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "manual_tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "ai_tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "final_tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
CREATE INDEX "products_manual_tags_idx" ON "products" USING btree ("manual_tags");--> statement-breakpoint
CREATE INDEX "products_ai_tags_idx" ON "products" USING btree ("ai_tags");--> statement-breakpoint
CREATE INDEX "products_final_tags_idx" ON "products" USING btree ("final_tags");