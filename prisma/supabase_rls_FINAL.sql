-- ============================================================
-- SUPABASE SECURITY FIX — Row-Level Security (RLS)
-- Run this ENTIRE script in: Supabase Dashboard > SQL Editor
-- 
-- Purpose:
--   1. Enable RLS on ALL tables (blocks anonymous/public PostgREST access)
--   2. The Express/Prisma backend connects as "postgres" (superuser)
--      which BYPASSES RLS → so your API keeps working 100% normally.
--   3. This resolves Supabase Advisor alerts:
--      - rls_disabled_in_public
--      - sensitive_columns_exposed
-- ============================================================

-- ─── Step 1: Enable RLS on ALL tables ─────────────────────────────────────────

ALTER TABLE public."User"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RegistrationRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Transaction"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Budget"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Saving"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Bill"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Reminder"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PasswordReset"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SplitBill"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SplitParticipant"    ENABLE ROW LEVEL SECURITY;

-- ─── Step 2: Drop any old/conflicting policies (safe to run) ──────────────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ─── Step 3: DENY all access to anon role (public internet) ───────────────────
-- No SELECT/INSERT/UPDATE/DELETE policies for "anon" role.
-- This means: anyone hitting your Supabase URL without auth gets NOTHING.

-- ─── Step 4: Revoke anon access from sensitive tables ─────────────────────────

REVOKE ALL ON public."User"                FROM anon;
REVOKE ALL ON public."RegistrationRequest" FROM anon;
REVOKE ALL ON public."Transaction"         FROM anon;
REVOKE ALL ON public."Budget"              FROM anon;
REVOKE ALL ON public."Saving"              FROM anon;
REVOKE ALL ON public."Bill"                FROM anon;
REVOKE ALL ON public."Reminder"            FROM anon;
REVOKE ALL ON public."PasswordReset"       FROM anon;
REVOKE ALL ON public."Account"             FROM anon;
REVOKE ALL ON public."SplitBill"           FROM anon;
REVOKE ALL ON public."SplitParticipant"    FROM anon;

-- ─── Step 5: Ensure service_role keeps full access (used by Prisma) ───────────

GRANT ALL ON public."User"                TO service_role;
GRANT ALL ON public."RegistrationRequest" TO service_role;
GRANT ALL ON public."Transaction"         TO service_role;
GRANT ALL ON public."Budget"              TO service_role;
GRANT ALL ON public."Saving"              TO service_role;
GRANT ALL ON public."Bill"                TO service_role;
GRANT ALL ON public."Reminder"            TO service_role;
GRANT ALL ON public."PasswordReset"       TO service_role;
GRANT ALL ON public."Account"             TO service_role;
GRANT ALL ON public."SplitBill"           TO service_role;
GRANT ALL ON public."SplitParticipant"    TO service_role;

-- ─── Verification Query (run after to confirm) ────────────────────────────────
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
-- Expected: rowsecurity = true for all tables above.

-- ============================================================
-- ✅ Done! Your backend API (Prisma/Express) works unchanged.
-- ❌ Anonymous HTTP access to your data is now fully blocked.
-- ============================================================
