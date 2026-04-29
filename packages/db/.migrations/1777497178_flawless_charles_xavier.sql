CREATE TABLE "product_tag_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"tag" text NOT NULL,
	"category" text NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"purchase_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag" text NOT NULL,
	"category" text NOT NULL,
	"product_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"purchase_count" integer DEFAULT 0 NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"product_count" integer DEFAULT 0 NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_tag_signals" ADD CONSTRAINT "product_tag_signals_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_tag_signals_product_tag_unique" ON "product_tag_signals" USING btree ("product_id","category","tag");--> statement-breakpoint
CREATE INDEX "product_tag_signals_product_idx" ON "product_tag_signals" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_tag_signals_tag_idx" ON "product_tag_signals" USING btree ("tag");--> statement-breakpoint
CREATE INDEX "product_tag_signals_category_idx" ON "product_tag_signals" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_insights_category_tag_unique" ON "tag_insights" USING btree ("category","tag");--> statement-breakpoint
CREATE INDEX "tag_insights_tag_idx" ON "tag_insights" USING btree ("tag");--> statement-breakpoint
CREATE INDEX "tag_insights_category_idx" ON "tag_insights" USING btree ("category");--> statement-breakpoint
CREATE INDEX "tag_insights_computed_idx" ON "tag_insights" USING btree ("computed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "category_insights_category_unique" ON "category_insights" USING btree ("category");--> statement-breakpoint
CREATE INDEX "category_insights_category_idx" ON "category_insights" USING btree ("category");--> statement-breakpoint
CREATE INDEX "category_insights_computed_idx" ON "category_insights" USING btree ("computed_at");