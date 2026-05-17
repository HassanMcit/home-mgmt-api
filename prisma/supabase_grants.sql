-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor
-- Fixes the new Supabase Data API grant policy (May 30, 2026)
-- ============================================================

-- ⚠️ Replace table names below with YOUR actual table names from Prisma schema

-- === Users Table ===
GRANT SELECT, INSERT, UPDATE, DELETE ON public."User" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."User" TO service_role;

-- === Transaction Table ===
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Transaction" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Transaction" TO service_role;

-- === RegistrationRequest Table ===
GRANT SELECT, INSERT, UPDATE, DELETE ON public."RegistrationRequest" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."RegistrationRequest" TO service_role;

-- === Bill Table ===
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Bill" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Bill" TO service_role;

-- === SavingsGoal Table ===
GRANT SELECT, INSERT, UPDATE, DELETE ON public."SavingsGoal" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."SavingsGoal" TO service_role;

-- === PasswordReset Table ===
GRANT SELECT, INSERT, UPDATE, DELETE ON public."PasswordReset" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."PasswordReset" TO service_role;

-- NOTE: Since your backend uses Prisma with a direct connection string (DIRECT_URL),
-- you are largely NOT affected by this change. Your backend bypasses the Data API.
-- This SQL is a precaution for any future supabase-js direct calls.
