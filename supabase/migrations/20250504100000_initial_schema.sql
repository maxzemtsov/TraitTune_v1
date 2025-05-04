

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


CREATE SCHEMA IF NOT EXISTS "auth";


ALTER SCHEMA "auth" OWNER TO "supabase_admin";


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "auth"."aal_level" AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE "auth"."aal_level" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."code_challenge_method" AS ENUM (
    's256',
    'plain'
);


ALTER TYPE "auth"."code_challenge_method" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_status" AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE "auth"."factor_status" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_type" AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE "auth"."factor_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."one_time_token_type" AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE "auth"."one_time_token_type" OWNER TO "supabase_auth_admin";


CREATE OR REPLACE FUNCTION "auth"."email"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION "auth"."email"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."email"() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';



CREATE OR REPLACE FUNCTION "auth"."jwt"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION "auth"."jwt"() OWNER TO "supabase_auth_admin";


CREATE OR REPLACE FUNCTION "auth"."role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION "auth"."role"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."role"() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';



CREATE OR REPLACE FUNCTION "auth"."uid"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION "auth"."uid"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."uid"() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';



CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP; -- Update the timestamp
    RETURN NEW; -- Return the modified row
END;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "auth"."audit_log_entries" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "payload" "json",
    "created_at" timestamp with time zone,
    "ip_address" character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE "auth"."audit_log_entries" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."audit_log_entries" IS 'Auth: Audit trail for user actions.';



CREATE TABLE IF NOT EXISTS "auth"."flow_state" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid",
    "auth_code" "text" NOT NULL,
    "code_challenge_method" "auth"."code_challenge_method" NOT NULL,
    "code_challenge" "text" NOT NULL,
    "provider_type" "text" NOT NULL,
    "provider_access_token" "text",
    "provider_refresh_token" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "authentication_method" "text" NOT NULL,
    "auth_code_issued_at" timestamp with time zone
);


ALTER TABLE "auth"."flow_state" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."flow_state" IS 'stores metadata for pkce logins';



CREATE TABLE IF NOT EXISTS "auth"."identities" (
    "provider_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "identity_data" "jsonb" NOT NULL,
    "provider" "text" NOT NULL,
    "last_sign_in_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "email" "text" GENERATED ALWAYS AS ("lower"(("identity_data" ->> 'email'::"text"))) STORED,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "auth"."identities" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."identities" IS 'Auth: Stores identities associated to a user.';



COMMENT ON COLUMN "auth"."identities"."email" IS 'Auth: Email is a generated column that references the optional email property in the identity_data';



CREATE TABLE IF NOT EXISTS "auth"."instances" (
    "id" "uuid" NOT NULL,
    "uuid" "uuid",
    "raw_base_config" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "auth"."instances" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."instances" IS 'Auth: Manages users across multiple sites.';



CREATE TABLE IF NOT EXISTS "auth"."mfa_amr_claims" (
    "session_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "authentication_method" "text" NOT NULL,
    "id" "uuid" NOT NULL
);


ALTER TABLE "auth"."mfa_amr_claims" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_amr_claims" IS 'auth: stores authenticator method reference claims for multi factor authentication';



CREATE TABLE IF NOT EXISTS "auth"."mfa_challenges" (
    "id" "uuid" NOT NULL,
    "factor_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "verified_at" timestamp with time zone,
    "ip_address" "inet" NOT NULL,
    "otp_code" "text",
    "web_authn_session_data" "jsonb"
);


ALTER TABLE "auth"."mfa_challenges" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_challenges" IS 'auth: stores metadata about challenge requests made';



CREATE TABLE IF NOT EXISTS "auth"."mfa_factors" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "friendly_name" "text",
    "factor_type" "auth"."factor_type" NOT NULL,
    "status" "auth"."factor_status" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "secret" "text",
    "phone" "text",
    "last_challenged_at" timestamp with time zone,
    "web_authn_credential" "jsonb",
    "web_authn_aaguid" "uuid"
);


ALTER TABLE "auth"."mfa_factors" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_factors" IS 'auth: stores metadata about factors';



CREATE TABLE IF NOT EXISTS "auth"."one_time_tokens" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token_type" "auth"."one_time_token_type" NOT NULL,
    "token_hash" "text" NOT NULL,
    "relates_to" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "one_time_tokens_token_hash_check" CHECK (("char_length"("token_hash") > 0))
);


ALTER TABLE "auth"."one_time_tokens" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."refresh_tokens" (
    "instance_id" "uuid",
    "id" bigint NOT NULL,
    "token" character varying(255),
    "user_id" character varying(255),
    "revoked" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "parent" character varying(255),
    "session_id" "uuid"
);


ALTER TABLE "auth"."refresh_tokens" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."refresh_tokens" IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';



CREATE SEQUENCE IF NOT EXISTS "auth"."refresh_tokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "auth"."refresh_tokens_id_seq" OWNER TO "supabase_auth_admin";


ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNED BY "auth"."refresh_tokens"."id";



CREATE TABLE IF NOT EXISTS "auth"."saml_providers" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "entity_id" "text" NOT NULL,
    "metadata_xml" "text" NOT NULL,
    "metadata_url" "text",
    "attribute_mapping" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "name_id_format" "text",
    CONSTRAINT "entity_id not empty" CHECK (("char_length"("entity_id") > 0)),
    CONSTRAINT "metadata_url not empty" CHECK ((("metadata_url" = NULL::"text") OR ("char_length"("metadata_url") > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK (("char_length"("metadata_xml") > 0))
);


ALTER TABLE "auth"."saml_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_providers" IS 'Auth: Manages SAML Identity Provider connections.';



CREATE TABLE IF NOT EXISTS "auth"."saml_relay_states" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "request_id" "text" NOT NULL,
    "for_email" "text",
    "redirect_to" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "flow_state_id" "uuid",
    CONSTRAINT "request_id not empty" CHECK (("char_length"("request_id") > 0))
);


ALTER TABLE "auth"."saml_relay_states" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_relay_states" IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';



CREATE TABLE IF NOT EXISTS "auth"."schema_migrations" (
    "version" character varying(255) NOT NULL
);


ALTER TABLE "auth"."schema_migrations" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."schema_migrations" IS 'Auth: Manages updates to the auth system.';



CREATE TABLE IF NOT EXISTS "auth"."sessions" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "factor_id" "uuid",
    "aal" "auth"."aal_level",
    "not_after" timestamp with time zone,
    "refreshed_at" timestamp without time zone,
    "user_agent" "text",
    "ip" "inet",
    "tag" "text"
);


ALTER TABLE "auth"."sessions" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sessions" IS 'Auth: Stores session data associated to a user.';



COMMENT ON COLUMN "auth"."sessions"."not_after" IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';



CREATE TABLE IF NOT EXISTS "auth"."sso_domains" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "domain" "text" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK (("char_length"("domain") > 0))
);


ALTER TABLE "auth"."sso_domains" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_domains" IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';



CREATE TABLE IF NOT EXISTS "auth"."sso_providers" (
    "id" "uuid" NOT NULL,
    "resource_id" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK ((("resource_id" = NULL::"text") OR ("char_length"("resource_id") > 0)))
);


ALTER TABLE "auth"."sso_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_providers" IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';



COMMENT ON COLUMN "auth"."sso_providers"."resource_id" IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';



CREATE TABLE IF NOT EXISTS "auth"."users" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "aud" character varying(255),
    "role" character varying(255),
    "email" character varying(255),
    "encrypted_password" character varying(255),
    "email_confirmed_at" timestamp with time zone,
    "invited_at" timestamp with time zone,
    "confirmation_token" character varying(255),
    "confirmation_sent_at" timestamp with time zone,
    "recovery_token" character varying(255),
    "recovery_sent_at" timestamp with time zone,
    "email_change_token_new" character varying(255),
    "email_change" character varying(255),
    "email_change_sent_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "raw_app_meta_data" "jsonb",
    "raw_user_meta_data" "jsonb",
    "is_super_admin" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "phone" "text" DEFAULT NULL::character varying,
    "phone_confirmed_at" timestamp with time zone,
    "phone_change" "text" DEFAULT ''::character varying,
    "phone_change_token" character varying(255) DEFAULT ''::character varying,
    "phone_change_sent_at" timestamp with time zone,
    "confirmed_at" timestamp with time zone GENERATED ALWAYS AS (LEAST("email_confirmed_at", "phone_confirmed_at")) STORED,
    "email_change_token_current" character varying(255) DEFAULT ''::character varying,
    "email_change_confirm_status" smallint DEFAULT 0,
    "banned_until" timestamp with time zone,
    "reauthentication_token" character varying(255) DEFAULT ''::character varying,
    "reauthentication_sent_at" timestamp with time zone,
    "is_sso_user" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    CONSTRAINT "users_email_change_confirm_status_check" CHECK ((("email_change_confirm_status" >= 0) AND ("email_change_confirm_status" <= 2)))
);


ALTER TABLE "auth"."users" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."users" IS 'Auth: Stores user login data within a secure schema.';



COMMENT ON COLUMN "auth"."users"."is_sso_user" IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';



CREATE TABLE IF NOT EXISTS "public"."answer_embedding" (
    "answer_option_id" integer NOT NULL,
    "model" character varying(100) NOT NULL,
    "vector" "public"."vector"
);


ALTER TABLE "public"."answer_embedding" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."answer_options" (
    "id" integer NOT NULL,
    "question_id" integer NOT NULL,
    "code" character varying(5) NOT NULL,
    "score_value" integer NOT NULL,
    "text_en" "text" NOT NULL,
    "text_ru" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."answer_options" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."answer_options_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."answer_options_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."answer_options_id_seq" OWNED BY "public"."answer_options"."id";



CREATE TABLE IF NOT EXISTS "public"."consistency_prompts" (
    "id" integer NOT NULL,
    "dimension_id" integer,
    "prompt_type" character varying(50),
    "text_en" "text" NOT NULL,
    "text_ru" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."consistency_prompts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."consistency_prompts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."consistency_prompts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."consistency_prompts_id_seq" OWNED BY "public"."consistency_prompts"."id";



CREATE TABLE IF NOT EXISTS "public"."dimensions" (
    "id" integer NOT NULL,
    "code" character varying(50) NOT NULL,
    "name_en" "text" NOT NULL,
    "name_ru" "text" NOT NULL,
    "high_label_en" "text",
    "high_label_ru" "text",
    "low_label_en" "text",
    "low_label_ru" "text",
    "description_en" "text",
    "description_ru" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."dimensions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."dimensions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."dimensions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."dimensions_id_seq" OWNED BY "public"."dimensions"."id";



CREATE TABLE IF NOT EXISTS "public"."generated_questions" (
    "id" integer NOT NULL,
    "dimension_id" integer,
    "segment_level" integer,
    "context_metadata_id" integer,
    "question_en" "text",
    "question_ru" "text",
    "answers" "jsonb",
    "context_embedding" "public"."vector"(384),
    "irt_difficulty" double precision,
    "irt_discrimination" double precision,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone,
    CONSTRAINT "generated_questions_segment_level_check" CHECK ((("segment_level" >= 1) AND ("segment_level" <= 5)))
);


ALTER TABLE "public"."generated_questions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."generated_questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."generated_questions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."generated_questions_id_seq" OWNED BY "public"."generated_questions"."id";



CREATE TABLE IF NOT EXISTS "public"."interpretation_templates" (
    "id" integer NOT NULL,
    "dimension_id" integer,
    "segment_level" smallint,
    "usecase_tag" character varying(50),
    "template_text_en" "text" NOT NULL,
    "template_text_ru" "text" NOT NULL,
    CONSTRAINT "interpretation_templates_segment_level_check" CHECK ((("segment_level" >= 0) AND ("segment_level" <= 5)))
);


ALTER TABLE "public"."interpretation_templates" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."interpretation_templates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."interpretation_templates_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."interpretation_templates_id_seq" OWNED BY "public"."interpretation_templates"."id";



CREATE TABLE IF NOT EXISTS "public"."open_questions" (
    "id" integer NOT NULL,
    "dimension_id" integer NOT NULL,
    "segment_level" smallint NOT NULL,
    "text_en" "text" NOT NULL,
    "text_ru" "text" NOT NULL,
    "usecase_tag" character varying(50),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone,
    CONSTRAINT "open_questions_segment_level_check" CHECK ((("segment_level" >= 1) AND ("segment_level" <= 5))),
    CONSTRAINT "open_questions_usecase_tag_check" CHECK ((("usecase_tag")::"text" = ANY ((ARRAY[NULL::character varying, 'startup'::character varying, 'corporate'::character varying, 'student'::character varying, 'careerist'::character varying])::"text"[])))
);


ALTER TABLE "public"."open_questions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."open_questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."open_questions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."open_questions_id_seq" OWNED BY "public"."open_questions"."id";



CREATE TABLE IF NOT EXISTS "public"."open_responses" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "open_question_id" integer,
    "generated_open_question_id" integer,
    "context_metadata_id" integer,
    "answer_text_en" "text",
    "answer_text_ru" "text",
    "input_mode" character varying(10),
    "answer_word_count" integer,
    "answer_duration_sec" integer,
    "llm_confidence" numeric(5,2),
    "llm_interpretation_en" "text",
    "llm_interpretation_ru" "text",
    "attempt_number" smallint,
    "session_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone,
    CONSTRAINT "open_responses_check" CHECK ((("open_question_id" IS NOT NULL) OR ("generated_open_question_id" IS NOT NULL)))
);


ALTER TABLE "public"."open_responses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."open_responses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."open_responses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."open_responses_id_seq" OWNED BY "public"."open_responses"."id";



CREATE TABLE IF NOT EXISTS "public"."question_embeddings" (
    "question_id" integer NOT NULL,
    "model" character varying(100) NOT NULL,
    "vector" "public"."vector"
);


ALTER TABLE "public"."question_embeddings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_templates" (
    "id" integer NOT NULL,
    "dimension_id" integer,
    "segment_level" integer,
    "template_text_en" "text",
    "template_text_ru" "text",
    "trait_polarity" character varying(20)
);


ALTER TABLE "public"."question_templates" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."question_templates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."question_templates_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."question_templates_id_seq" OWNED BY "public"."question_templates"."id";



CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" integer NOT NULL,
    "dimension_id" integer NOT NULL,
    "segment_level" smallint NOT NULL,
    "question_type" character varying(30) NOT NULL,
    "is_reverse" boolean DEFAULT false NOT NULL,
    "text_en" "text" NOT NULL,
    "text_ru" "text" NOT NULL,
    "usecase_tag" character varying(50),
    "irt_difficulty" numeric(5,2),
    "irt_discriminativeness" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone,
    CONSTRAINT "questions_question_type_check" CHECK ((("question_type")::"text" = ANY ((ARRAY['likert'::character varying, 'forced'::character varying, 'scenario'::character varying, 'check_consistency'::character varying, 'check_social'::character varying])::"text"[]))),
    CONSTRAINT "questions_segment_level_check" CHECK ((("segment_level" >= 1) AND ("segment_level" <= 5))),
    CONSTRAINT "questions_usecase_tag_check" CHECK ((("usecase_tag")::"text" = ANY ((ARRAY[NULL::character varying, 'startup'::character varying, 'corporate'::character varying, 'student'::character varying, 'careerist'::character varying])::"text"[])))
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."questions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."questions_id_seq" OWNED BY "public"."questions"."id";



CREATE TABLE IF NOT EXISTS "public"."segments" (
    "id" integer NOT NULL,
    "dimension_id" integer NOT NULL,
    "segment_level" smallint NOT NULL,
    "name_en" character varying(50) NOT NULL,
    "name_ru" character varying(50) NOT NULL,
    "theta_min" double precision,
    "theta_max" double precision,
    CONSTRAINT "segments_segment_level_check" CHECK ((("segment_level" >= 1) AND ("segment_level" <= 5)))
);


ALTER TABLE "public"."segments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."segments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."segments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."segments_id_seq" OWNED BY "public"."segments"."id";



CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "team_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(50)
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_results" (
    "team_id" integer NOT NULL,
    "dimension_id" integer NOT NULL,
    "average_score" double precision
);


ALTER TABLE "public"."team_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."teams_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."teams_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."teams_id_seq" OWNED BY "public"."teams"."id";



CREATE TABLE IF NOT EXISTS "public"."user_context_metadata" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "first_name" character varying(100),
    "last_name" character varying(100),
    "headline" character varying(255),
    "linkedin_profile_url" character varying(255),
    "profile_picture_url" character varying(255),
    "profession" character varying(100),
    "age" integer,
    "gender" character varying(20),
    "residence" character varying(100),
    "race" character varying(50),
    "religion" character varying(50),
    "diversity_identification" character varying(50),
    "summary" "text",
    "industry" character varying(100),
    "location_country" character varying(50),
    "location_city" character varying(100),
    "positions" "jsonb",
    "educations" "jsonb",
    "skills" "jsonb",
    "certifications" "jsonb",
    "languages" "jsonb",
    "email_address" character varying(255),
    "phone_number" character varying(50),
    "use_sensitive_data" boolean DEFAULT false,
    "source" character varying(50) DEFAULT 'linkedin'::character varying,
    "linkedin_id" character varying(50),
    "extra_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."user_context_metadata" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_context_metadata_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_context_metadata_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_context_metadata_id_seq" OWNED BY "public"."user_context_metadata"."id";



CREATE TABLE IF NOT EXISTS "public"."user_contexts" (
    "user_id" "uuid" NOT NULL,
    "role" character varying(50),
    "industry" "text",
    "experience_years" integer,
    "context_text" "text"
);


ALTER TABLE "public"."user_contexts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_responses" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "question_id" integer,
    "generated_question_id" integer,
    "context_metadata_id" integer,
    "selected_option_id" integer,
    "likert_value" smallint,
    "response_time" timestamp with time zone,
    "response_duration_ms" integer,
    "session_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone,
    CONSTRAINT "user_responses_check" CHECK ((("question_id" IS NOT NULL) OR ("generated_question_id" IS NOT NULL)))
);


ALTER TABLE "public"."user_responses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_responses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_responses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_responses_id_seq" OWNED BY "public"."user_responses"."id";



CREATE TABLE IF NOT EXISTS "public"."user_results" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "dimension_id" integer NOT NULL,
    "session_id" "uuid",
    "context_metadata_id" integer,
    "estimated_theta" double precision,
    "theta_standard_error" double precision,
    "normalized_score" numeric(5,2),
    "assigned_segment_id" integer,
    "confidence_score" numeric(5,2),
    "reliability_score" numeric(5,2),
    "reliability_flag" boolean DEFAULT false,
    "retake_recommended" boolean DEFAULT false,
    "question_count" integer,
    "usecase_tag" character varying(50),
    "test_version" character varying(20),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."user_results" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_results_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_results_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_results_id_seq" OWNED BY "public"."user_results"."id";



ALTER TABLE ONLY "auth"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT "nextval"('"auth"."refresh_tokens_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."answer_options" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."answer_options_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."consistency_prompts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."consistency_prompts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."dimensions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."dimensions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."generated_questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."generated_questions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."interpretation_templates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."interpretation_templates_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."open_questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."open_questions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."open_responses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."open_responses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."question_templates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."question_templates_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."questions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."segments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."segments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."teams" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."teams_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_context_metadata" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_context_metadata_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_responses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_responses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_results" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_results_id_seq"'::"regclass");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "amr_id_pk" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."audit_log_entries"
    ADD CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."flow_state"
    ADD CONSTRAINT "flow_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_provider_id_provider_unique" UNIQUE ("provider_id", "provider");



ALTER TABLE ONLY "auth"."instances"
    ADD CONSTRAINT "instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE ("session_id", "authentication_method");



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_last_challenged_at_key" UNIQUE ("last_challenged_at");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_token_unique" UNIQUE ("token");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_entity_id_key" UNIQUE ("entity_id");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_providers"
    ADD CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."answer_embedding"
    ADD CONSTRAINT "answer_embedding_pkey" PRIMARY KEY ("answer_option_id", "model");



ALTER TABLE ONLY "public"."answer_options"
    ADD CONSTRAINT "answer_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consistency_prompts"
    ADD CONSTRAINT "consistency_prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dimensions"
    ADD CONSTRAINT "dimensions_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."dimensions"
    ADD CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."generated_questions"
    ADD CONSTRAINT "generated_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interpretation_templates"
    ADD CONSTRAINT "interpretation_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."open_questions"
    ADD CONSTRAINT "open_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."open_responses"
    ADD CONSTRAINT "open_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_embeddings"
    ADD CONSTRAINT "question_embeddings_pkey" PRIMARY KEY ("question_id", "model");



ALTER TABLE ONLY "public"."question_templates"
    ADD CONSTRAINT "question_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."segments"
    ADD CONSTRAINT "segments_dimension_id_segment_level_key" UNIQUE ("dimension_id", "segment_level");



ALTER TABLE ONLY "public"."segments"
    ADD CONSTRAINT "segments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("team_id", "user_id");



ALTER TABLE ONLY "public"."team_results"
    ADD CONSTRAINT "team_results_pkey" PRIMARY KEY ("team_id", "dimension_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_context_metadata"
    ADD CONSTRAINT "user_context_metadata_linkedin_id_key" UNIQUE ("linkedin_id");



ALTER TABLE ONLY "public"."user_context_metadata"
    ADD CONSTRAINT "user_context_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_context_metadata"
    ADD CONSTRAINT "user_context_metadata_user_id_created_at_key" UNIQUE ("user_id", "created_at");



ALTER TABLE ONLY "public"."user_contexts"
    ADD CONSTRAINT "user_contexts_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_user_id_generated_question_id_session_id_key" UNIQUE ("user_id", "generated_question_id", "session_id");



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_user_id_question_id_session_id_key" UNIQUE ("user_id", "question_id", "session_id");



ALTER TABLE ONLY "public"."user_results"
    ADD CONSTRAINT "user_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_results"
    ADD CONSTRAINT "user_results_user_id_dimension_id_session_id_key" UNIQUE ("user_id", "dimension_id", "session_id");



CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" USING "btree" ("instance_id");



CREATE UNIQUE INDEX "confirmation_token_idx" ON "auth"."users" USING "btree" ("confirmation_token") WHERE (("confirmation_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_current_idx" ON "auth"."users" USING "btree" ("email_change_token_current") WHERE (("email_change_token_current")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_new_idx" ON "auth"."users" USING "btree" ("email_change_token_new") WHERE (("email_change_token_new")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors" USING "btree" ("user_id", "created_at");



CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state" USING "btree" ("created_at" DESC);



CREATE INDEX "identities_email_idx" ON "auth"."identities" USING "btree" ("email" "text_pattern_ops");



COMMENT ON INDEX "auth"."identities_email_idx" IS 'Auth: Ensures indexed queries on the email column';



CREATE INDEX "identities_user_id_idx" ON "auth"."identities" USING "btree" ("user_id");



CREATE INDEX "idx_auth_code" ON "auth"."flow_state" USING "btree" ("auth_code");



CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state" USING "btree" ("user_id", "authentication_method");



CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" USING "btree" ("created_at" DESC);



CREATE UNIQUE INDEX "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" USING "btree" ("friendly_name", "user_id") WHERE (TRIM(BOTH FROM "friendly_name") <> ''::"text");



CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors" USING "btree" ("user_id");



CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("relates_to");



CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("token_hash");



CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens" USING "btree" ("user_id", "token_type");



CREATE UNIQUE INDEX "reauthentication_token_idx" ON "auth"."users" USING "btree" ("reauthentication_token") WHERE (("reauthentication_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "recovery_token_idx" ON "auth"."users" USING "btree" ("recovery_token") WHERE (("recovery_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id");



CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id", "user_id");



CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" USING "btree" ("parent");



CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" USING "btree" ("session_id", "revoked");



CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" USING "btree" ("updated_at" DESC);



CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" USING "btree" ("sso_provider_id");



CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" USING "btree" ("created_at" DESC);



CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" USING "btree" ("for_email");



CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" USING "btree" ("sso_provider_id");



CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions" USING "btree" ("not_after" DESC);



CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" USING "btree" ("lower"("domain"));



CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" USING "btree" ("sso_provider_id");



CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" USING "btree" ("lower"("resource_id"));



CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors" USING "btree" ("user_id", "phone");



CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions" USING "btree" ("user_id", "created_at");



CREATE UNIQUE INDEX "users_email_partial_key" ON "auth"."users" USING "btree" ("email") WHERE ("is_sso_user" = false);



COMMENT ON INDEX "auth"."users_email_partial_key" IS 'Auth: A partial unique index that applies only when is_sso_user is false';



CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" USING "btree" ("instance_id", "lower"(("email")::"text"));



CREATE INDEX "users_instance_id_idx" ON "auth"."users" USING "btree" ("instance_id");



CREATE INDEX "users_is_anonymous_idx" ON "auth"."users" USING "btree" ("is_anonymous");



CREATE INDEX "idx_consistency_prompts_dimension_id" ON "public"."consistency_prompts" USING "btree" ("dimension_id");



CREATE INDEX "idx_generated_questions_context_metadata_id" ON "public"."generated_questions" USING "btree" ("context_metadata_id");



CREATE INDEX "idx_generated_questions_dimension_id" ON "public"."generated_questions" USING "btree" ("dimension_id");



CREATE INDEX "idx_generated_questions_segment_level" ON "public"."generated_questions" USING "btree" ("segment_level");



CREATE INDEX "idx_open_responses_context_metadata_id" ON "public"."open_responses" USING "btree" ("context_metadata_id");



CREATE INDEX "idx_open_responses_generated_open_question_id" ON "public"."open_responses" USING "btree" ("generated_open_question_id");



CREATE INDEX "idx_open_responses_open_question_id" ON "public"."open_responses" USING "btree" ("open_question_id");



CREATE INDEX "idx_open_responses_session_id" ON "public"."open_responses" USING "btree" ("session_id");



CREATE INDEX "idx_open_responses_user_id" ON "public"."open_responses" USING "btree" ("user_id");



CREATE INDEX "idx_user_context_metadata_created_at" ON "public"."user_context_metadata" USING "btree" ("created_at");



CREATE INDEX "idx_user_context_metadata_linkedin_id" ON "public"."user_context_metadata" USING "btree" ("linkedin_id");



CREATE INDEX "idx_user_context_metadata_source" ON "public"."user_context_metadata" USING "btree" ("source");



CREATE INDEX "idx_user_context_metadata_user_id" ON "public"."user_context_metadata" USING "btree" ("user_id");



CREATE INDEX "idx_user_responses_context_metadata_id" ON "public"."user_responses" USING "btree" ("context_metadata_id");



CREATE INDEX "idx_user_responses_generated_question_id" ON "public"."user_responses" USING "btree" ("generated_question_id");



CREATE INDEX "idx_user_responses_question_id" ON "public"."user_responses" USING "btree" ("question_id");



CREATE INDEX "idx_user_responses_session_id" ON "public"."user_responses" USING "btree" ("session_id");



CREATE INDEX "idx_user_responses_user_id" ON "public"."user_responses" USING "btree" ("user_id");



CREATE INDEX "idx_user_results_context_metadata_id" ON "public"."user_results" USING "btree" ("context_metadata_id");



CREATE INDEX "idx_user_results_dimension_id" ON "public"."user_results" USING "btree" ("dimension_id");



CREATE INDEX "idx_user_results_session_id" ON "public"."user_results" USING "btree" ("session_id");



CREATE INDEX "idx_user_results_user_id" ON "public"."user_results" USING "btree" ("user_id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."answer_embedding"
    ADD CONSTRAINT "answer_embedding_answer_option_id_fkey" FOREIGN KEY ("answer_option_id") REFERENCES "public"."answer_options"("id");



ALTER TABLE ONLY "public"."answer_options"
    ADD CONSTRAINT "answer_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consistency_prompts"
    ADD CONSTRAINT "consistency_prompts_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id");



ALTER TABLE ONLY "public"."generated_questions"
    ADD CONSTRAINT "generated_questions_context_metadata_id_fkey" FOREIGN KEY ("context_metadata_id") REFERENCES "public"."user_context_metadata"("id");



ALTER TABLE ONLY "public"."generated_questions"
    ADD CONSTRAINT "generated_questions_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id");



ALTER TABLE ONLY "public"."open_responses"
    ADD CONSTRAINT "open_responses_context_metadata_id_fkey" FOREIGN KEY ("context_metadata_id") REFERENCES "public"."user_context_metadata"("id");



ALTER TABLE ONLY "public"."open_responses"
    ADD CONSTRAINT "open_responses_generated_open_question_id_fkey" FOREIGN KEY ("generated_open_question_id") REFERENCES "public"."generated_questions"("id");



ALTER TABLE ONLY "public"."open_responses"
    ADD CONSTRAINT "open_responses_open_question_id_fkey" FOREIGN KEY ("open_question_id") REFERENCES "public"."open_questions"("id");



ALTER TABLE ONLY "public"."open_responses"
    ADD CONSTRAINT "open_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."question_embeddings"
    ADD CONSTRAINT "question_embeddings_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."segments"
    ADD CONSTRAINT "segments_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."team_results"
    ADD CONSTRAINT "team_results_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."user_context_metadata"
    ADD CONSTRAINT "user_context_metadata_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_contexts"
    ADD CONSTRAINT "user_contexts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_context_metadata_id_fkey" FOREIGN KEY ("context_metadata_id") REFERENCES "public"."user_context_metadata"("id");



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_generated_question_id_fkey" FOREIGN KEY ("generated_question_id") REFERENCES "public"."generated_questions"("id");



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id");



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "public"."answer_options"("id");



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_results"
    ADD CONSTRAINT "user_results_assigned_segment_id_fkey" FOREIGN KEY ("assigned_segment_id") REFERENCES "public"."segments"("id");



ALTER TABLE ONLY "public"."user_results"
    ADD CONSTRAINT "user_results_context_metadata_id_fkey" FOREIGN KEY ("context_metadata_id") REFERENCES "public"."user_context_metadata"("id");



ALTER TABLE ONLY "public"."user_results"
    ADD CONSTRAINT "user_results_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "public"."dimensions"("id");



ALTER TABLE ONLY "public"."user_results"
    ADD CONSTRAINT "user_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE "auth"."audit_log_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."flow_state" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."identities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_amr_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_challenges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_factors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."one_time_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."refresh_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_relay_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."schema_migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "auth" TO "anon";
GRANT USAGE ON SCHEMA "auth" TO "authenticated";
GRANT USAGE ON SCHEMA "auth" TO "service_role";
GRANT ALL ON SCHEMA "auth" TO "supabase_auth_admin";
GRANT ALL ON SCHEMA "auth" TO "dashboard_user";
GRANT ALL ON SCHEMA "auth" TO "postgres";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "auth"."email"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."jwt"() TO "postgres";
GRANT ALL ON FUNCTION "auth"."jwt"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."role"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."uid"() TO "dashboard_user";



GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "service_role";



GRANT ALL ON TABLE "auth"."audit_log_entries" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."audit_log_entries" TO "postgres";
GRANT SELECT ON TABLE "auth"."audit_log_entries" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."flow_state" TO "postgres";
GRANT SELECT ON TABLE "auth"."flow_state" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."flow_state" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."identities" TO "postgres";
GRANT SELECT ON TABLE "auth"."identities" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."identities" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."instances" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."instances" TO "postgres";
GRANT SELECT ON TABLE "auth"."instances" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."mfa_amr_claims" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_amr_claims" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_amr_claims" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."mfa_challenges" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_challenges" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_challenges" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."mfa_factors" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_factors" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_factors" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."one_time_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."one_time_tokens" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."one_time_tokens" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."refresh_tokens" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."refresh_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."refresh_tokens" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "dashboard_user";
GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "postgres";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."saml_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_providers" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."saml_relay_states" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_relay_states" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_relay_states" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."schema_migrations" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."schema_migrations" TO "postgres";
GRANT SELECT ON TABLE "auth"."schema_migrations" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."sessions" TO "postgres";
GRANT SELECT ON TABLE "auth"."sessions" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sessions" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."sso_domains" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_domains" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_domains" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."sso_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_providers" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."users" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "auth"."users" TO "postgres";
GRANT SELECT ON TABLE "auth"."users" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "public"."answer_embedding" TO "anon";
GRANT ALL ON TABLE "public"."answer_embedding" TO "authenticated";
GRANT ALL ON TABLE "public"."answer_embedding" TO "service_role";



GRANT ALL ON TABLE "public"."answer_options" TO "anon";
GRANT ALL ON TABLE "public"."answer_options" TO "authenticated";
GRANT ALL ON TABLE "public"."answer_options" TO "service_role";



GRANT ALL ON SEQUENCE "public"."answer_options_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."answer_options_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."answer_options_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."consistency_prompts" TO "anon";
GRANT ALL ON TABLE "public"."consistency_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."consistency_prompts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."consistency_prompts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."consistency_prompts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."consistency_prompts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."dimensions" TO "anon";
GRANT ALL ON TABLE "public"."dimensions" TO "authenticated";
GRANT ALL ON TABLE "public"."dimensions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."dimensions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dimensions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dimensions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."generated_questions" TO "anon";
GRANT ALL ON TABLE "public"."generated_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."generated_questions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."generated_questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."generated_questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."generated_questions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interpretation_templates" TO "anon";
GRANT ALL ON TABLE "public"."interpretation_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."interpretation_templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interpretation_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interpretation_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interpretation_templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."open_questions" TO "anon";
GRANT ALL ON TABLE "public"."open_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."open_questions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."open_questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."open_questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."open_questions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."open_responses" TO "anon";
GRANT ALL ON TABLE "public"."open_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."open_responses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."open_responses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."open_responses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."open_responses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."question_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."question_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."question_embeddings" TO "service_role";



GRANT ALL ON TABLE "public"."question_templates" TO "anon";
GRANT ALL ON TABLE "public"."question_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."question_templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."question_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."question_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."question_templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."segments" TO "anon";
GRANT ALL ON TABLE "public"."segments" TO "authenticated";
GRANT ALL ON TABLE "public"."segments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."segments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."segments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."segments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."team_results" TO "anon";
GRANT ALL ON TABLE "public"."team_results" TO "authenticated";
GRANT ALL ON TABLE "public"."team_results" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_context_metadata" TO "anon";
GRANT ALL ON TABLE "public"."user_context_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."user_context_metadata" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_context_metadata_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_context_metadata_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_context_metadata_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_contexts" TO "anon";
GRANT ALL ON TABLE "public"."user_contexts" TO "authenticated";
GRANT ALL ON TABLE "public"."user_contexts" TO "service_role";



GRANT ALL ON TABLE "public"."user_responses" TO "anon";
GRANT ALL ON TABLE "public"."user_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_responses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_responses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_responses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_responses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_results" TO "anon";
GRANT ALL ON TABLE "public"."user_results" TO "authenticated";
GRANT ALL ON TABLE "public"."user_results" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_results_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_results_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_results_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES  TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS  TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES  TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
