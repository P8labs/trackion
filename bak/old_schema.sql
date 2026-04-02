\restrict WzBIusTTLbfhVqnzfbcYEPWDr902AALhQNZV1vVBm7GaUdAY09rjPBANycqaeC2
CREATE TABLE "events" (
    "id" bigint NOT NULL,
    "project_id" "uuid" NOT NULL,
    "event_name" "text" NOT NULL,
    "session_id" "text",
    "page_path" "text",
    "page_title" "text",
    "referrer" "text",
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "properties" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_agent" "text"
);
CREATE SEQUENCE "events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "events_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "events_id_seq" OWNED BY "public"."events"."id";
CREATE TABLE "projects" (
    "id" "uuid" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "api_key" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "auto_pageview" boolean DEFAULT true NOT NULL,
    "track_time_spent" boolean DEFAULT true NOT NULL,
    "track_campaign" boolean DEFAULT true NOT NULL,
    "track_clicks" boolean DEFAULT false NOT NULL,
    "domains" "text"[],
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "deleted_at" timestamp with time zone
);
CREATE TABLE "sessions" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);
CREATE TABLE "subscriptions" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan" "text" DEFAULT 'free'::"text" NOT NULL,
    "monthly_event_limit" integer DEFAULT 10000 NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
CREATE TABLE "users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "github_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "avatar_url" "text",
    "google_id" "text"
);
ALTER TABLE ONLY "events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."events_id_seq"'::"regclass");
ALTER TABLE ONLY "events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "projects"
    ADD CONSTRAINT "projects_api_key_key" UNIQUE ("api_key");
ALTER TABLE ONLY "projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "sessions"
    ADD CONSTRAINT "sessions_token_key" UNIQUE ("token");
ALTER TABLE ONLY "subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");
ALTER TABLE ONLY "users"
    ADD CONSTRAINT "users_github_id_key" UNIQUE ("github_id");
ALTER TABLE ONLY "users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
CREATE INDEX "idx_events_created_at" ON "events" USING "btree" ("created_at");
CREATE INDEX "idx_events_event_name" ON "events" USING "btree" ("event_name");
CREATE INDEX "idx_events_project_event" ON "events" USING "btree" ("project_id", "event_name");
CREATE INDEX "idx_events_project_time" ON "events" USING "btree" ("project_id", "created_at");
CREATE INDEX "idx_projects_deleted_at" ON "projects" USING "btree" ("deleted_at");
CREATE INDEX "idx_projects_owner_id" ON "projects" USING "btree" ("owner_id");
CREATE INDEX "idx_projects_status" ON "projects" USING "btree" ("status");
CREATE INDEX "idx_sessions_token" ON "sessions" USING "btree" ("token");
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING "btree" ("user_id");
CREATE UNIQUE INDEX "idx_users_google_id_unique" ON "users" USING "btree" ("google_id") WHERE ("google_id" IS NOT NULL);
ALTER TABLE ONLY "events"
    ADD CONSTRAINT "events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "projects"
    ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
\unrestrict WzBIusTTLbfhVqnzfbcYEPWDr902AALhQNZV1vVBm7GaUdAY09rjPBANycqaeC2
