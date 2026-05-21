import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔒 Enabling Row-Level Security (RLS) on all public tables...');
  
  // PL/pgSQL block to find all tables in the public schema and enable RLS
  await prisma.$executeRawUnsafe(`
    DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
        END LOOP;
    END;
    $$;
  `);

  console.log('✅ RLS enabled on all tables.');

  // Fetch updated RLS status to confirm
  const tables: any[] = await prisma.$queryRaw`
    SELECT 
        c.relname AS table_name,
        c.relrowsecurity AS rls_enabled
    FROM 
        pg_class c
    JOIN 
        pg_namespace n ON n.oid = c.relnamespace
    WHERE 
        n.nspname = 'public' 
        AND c.relkind = 'r'
    ORDER BY table_name;
  `;
  
  console.log('\n--- Updated Database Tables RLS Status ---');
  console.table(tables);
  console.log('------------------------------------------\n');
}

main().catch(error => {
  console.error('❌ Error enabling RLS:', error);
}).finally(async () => {
  await prisma.$disconnect();
});
