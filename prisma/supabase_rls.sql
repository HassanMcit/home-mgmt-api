-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor
-- Enables Row-Level Security (RLS) on all public tables to secure data
-- and prevent public API exposure (resolving Supabase Advisor alerts)
-- ============================================================

-- Enable RLS on all public tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RegistrationRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Saving" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Bill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Reminder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PasswordReset" ENABLE ROW LEVEL SECURITY;

-- Note: No SELECT/INSERT/UPDATE/DELETE policies are created. This blocks all public/anonymous access to these tables 
-- via the Supabase PostgREST API, while allowing the Express backend (Prisma) to access the tables normally 
-- since it connects as the superuser/database owner (postgres), which bypasses Row-Level Security by default.
