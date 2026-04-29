CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"image_url" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" text,
	"product_id" uuid NOT NULL,
	"duration" integer,
	"source" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text,
	"product_id" uuid NOT NULL,
	"action" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text,
	"product_id" uuid NOT NULL,
	"action" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" text,
	"query" text NOT NULL,
	"filters" jsonb,
	"result_count" integer,
	"selected_product_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"user_id" uuid,
	"user_agent" text,
	"ip_address" text,
	"device_type" text,
	"metadata" jsonb,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_affinities" jsonb,
	"avg_order_value" real,
	"preferred_price_range" jsonb,
	"total_views" integer DEFAULT 0,
	"total_purchases" integer DEFAULT 0,
	"total_searches" integer DEFAULT 0,
	"total_cart_adds" integer DEFAULT 0,
	"total_wishlist_adds" integer DEFAULT 0,
	"behavioral_tags" jsonb,
	"top_occasions" jsonb,
	"top_recipients" jsonb,
	"segment" text,
	"last_active_at" timestamp,
	"profile_version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "product_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"embedding" vector(384) NOT NULL,
	"model" text NOT NULL,
	"dimensions" integer NOT NULL,
	"input_text" text,
	"metadata" jsonb,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_embeddings_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "user_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"embedding" vector(384) NOT NULL,
	"model" text NOT NULL,
	"dimensions" integer NOT NULL,
	"input_summary" text,
	"metadata" jsonb,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_embeddings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "recommendation_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"strategy" text NOT NULL,
	"recommendations" jsonb NOT NULL,
	"context" jsonb,
	"score" real,
	"version" integer DEFAULT 1,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "user_events" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "user_events" ADD COLUMN "anonymous_id" text;--> statement-breakpoint
ALTER TABLE "user_events" ADD COLUMN "event_id" text;--> statement-breakpoint
ALTER TABLE "user_events" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "user_events" ADD COLUMN "occurred_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_events" ADD CONSTRAINT "cart_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_events" ADD CONSTRAINT "cart_events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_events" ADD CONSTRAINT "wishlist_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_events" ADD CONSTRAINT "wishlist_events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_logs" ADD CONSTRAINT "search_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_embeddings" ADD CONSTRAINT "product_embeddings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_embeddings" ADD CONSTRAINT "user_embeddings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_cache" ADD CONSTRAINT "recommendation_cache_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "product_views_user_idx" ON "product_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "product_views_product_idx" ON "product_views" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_views_session_idx" ON "product_views" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "product_views_created_idx" ON "product_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cart_events_user_idx" ON "cart_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cart_events_product_idx" ON "cart_events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "cart_events_action_idx" ON "cart_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "cart_events_created_idx" ON "cart_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "wishlist_events_user_idx" ON "wishlist_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_events_product_idx" ON "wishlist_events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "wishlist_events_action_idx" ON "wishlist_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "wishlist_events_created_idx" ON "wishlist_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "search_logs_user_idx" ON "search_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_logs_session_idx" ON "search_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "search_logs_query_idx" ON "search_logs" USING btree ("query");--> statement-breakpoint
CREATE INDEX "search_logs_created_idx" ON "search_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_sessions_session_idx" ON "user_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "user_sessions_user_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sessions_start_idx" ON "user_sessions" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "user_sessions_last_activity_idx" ON "user_sessions" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "user_profiles_user_idx" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_profiles_segment_idx" ON "user_profiles" USING btree ("segment");--> statement-breakpoint
CREATE INDEX "product_embeddings_product_idx" ON "product_embeddings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_embeddings_model_idx" ON "product_embeddings" USING btree ("model");--> statement-breakpoint
CREATE INDEX "user_embeddings_user_idx" ON "user_embeddings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_embeddings_model_idx" ON "user_embeddings" USING btree ("model");--> statement-breakpoint
CREATE INDEX "rec_cache_user_idx" ON "recommendation_cache" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rec_cache_strategy_idx" ON "recommendation_cache" USING btree ("strategy");--> statement-breakpoint
CREATE INDEX "rec_cache_expires_idx" ON "recommendation_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "rec_cache_user_strategy_idx" ON "recommendation_cache" USING btree ("user_id","strategy");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_events_session_idx" ON "user_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "user_events_event_id_idx" ON "user_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "user_events_occurred_idx" ON "user_events" USING btree ("occurred_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_embeddings_vector_idx"
ON "product_embeddings" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_embeddings_vector_idx"
ON "user_embeddings" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);