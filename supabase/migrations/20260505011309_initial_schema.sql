


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "color" "text" DEFAULT '#6b7280'::"text",
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "categories_type_check" CHECK (("type" = ANY (ARRAY['income'::"text", 'expense'::"text"])))
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."savings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "target_amount" numeric(15,2) DEFAULT 0 NOT NULL,
    "current_amount" numeric(15,2) DEFAULT 0 NOT NULL,
    "deadline" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."savings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "text" NOT NULL,
    "type" "text" NOT NULL,
    "amount" numeric(15,2) DEFAULT 0 NOT NULL,
    "category" "text" DEFAULT 'Lainnya'::"text" NOT NULL,
    "description" "text",
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['income'::"text", 'expense'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "user_id" "text" NOT NULL,
    "tier" "text" DEFAULT 'free'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "valid_until" timestamp with time zone,
    "xendit_invoice_id" "text",
    CONSTRAINT "user_subscriptions_tier_check" CHECK (("tier" = ANY (ARRAY['free'::"text", 'pro'::"text"])))
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."savings"
    ADD CONSTRAINT "savings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "idx_categories_type" ON "public"."categories" USING "btree" ("type");



CREATE INDEX "idx_categories_user_id" ON "public"."categories" USING "btree" ("user_id");



CREATE INDEX "idx_savings_user_id" ON "public"."savings" USING "btree" ("user_id");



CREATE INDEX "idx_transactions_category" ON "public"."transactions" USING "btree" ("category");



CREATE INDEX "idx_transactions_date" ON "public"."transactions" USING "btree" ("date");



CREATE INDEX "idx_transactions_type" ON "public"."transactions" USING "btree" ("type");



CREATE INDEX "idx_transactions_user_date" ON "public"."transactions" USING "btree" ("user_id", "date");



CREATE INDEX "idx_transactions_user_id" ON "public"."transactions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_savings_updated_at" BEFORE UPDATE ON "public"."savings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_transactions_updated_at" BEFORE UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE POLICY "Service or Users can insert subscription" ON "public"."user_subscriptions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can delete own categories" ON "public"."categories" FOR DELETE USING ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can delete own savings" ON "public"."savings" FOR DELETE USING ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can delete own transactions" ON "public"."transactions" FOR DELETE USING ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can insert own categories" ON "public"."categories" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can insert own savings" ON "public"."savings" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can insert own transactions" ON "public"."transactions" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can update own savings" ON "public"."savings" FOR UPDATE USING ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can update own transactions" ON "public"."transactions" FOR UPDATE USING ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can view own categories" ON "public"."categories" FOR SELECT USING ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can view own savings" ON "public"."savings" FOR SELECT USING ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can view own transactions" ON "public"."transactions" FOR SELECT USING ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



CREATE POLICY "Users can view their own subscription" ON "public"."user_subscriptions" FOR SELECT USING ((("auth"."jwt"() ->> 'sub'::"text") = "user_id"));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."savings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."savings" TO "anon";
GRANT ALL ON TABLE "public"."savings" TO "authenticated";
GRANT ALL ON TABLE "public"."savings" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


