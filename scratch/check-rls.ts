import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Fetching public tables and checking Row-Level Security (RLS) status...');
  
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
  
  console.log('\n--- Database Tables RLS Status ---');
  console.table(tables);
  console.log('----------------------------------\n');
}

main().finally(async () => {
  await prisma.$disconnect();
});
