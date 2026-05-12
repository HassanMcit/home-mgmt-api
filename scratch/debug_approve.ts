import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debugApprove(email: string) {
  console.log(`\n--- Debugging Approval for ${email} ---`);
  
  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`❌ User already exists:`, existingUser);
    } else {
      console.log(`✅ User does not exist in User table.`);
    }

    // 2. Find registration requests
    const requests = await prisma.registrationRequest.findMany({ where: { email } });
    console.log(`Found ${requests.length} requests for this email.`);
    
    const pendingRequest = requests.find(r => r.status === 'pending');
    
    if (!pendingRequest) {
      console.log(`❌ No pending request found. Current statuses:`, requests.map(r => r.status));
      
      // If no pending, let's try to CREATE a dummy pending request to test the flow
      console.log(`Creating a dummy pending request for testing...`);
      const dummyRequest = await prisma.registrationRequest.create({
        data: {
          name: 'Test Debug',
          email: email,
          password: 'hashed_password_placeholder',
          status: 'pending'
        }
      });
      console.log(`✅ Created dummy request ID: ${dummyRequest.id}`);
      return await approveFlow(dummyRequest.id);
    } else {
      console.log(`✅ Found pending request ID: ${pendingRequest.id}`);
      return await approveFlow(pendingRequest.id);
    }
  } catch (err) {
    console.error(`🔴 Critical Error in debug script:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function approveFlow(id: string) {
  console.log(`\n--- Starting Approval Flow for ID: ${id} ---`);
  try {
    const request = await prisma.registrationRequest.findUnique({ where: { id } });
    if (!request) throw new Error("Request not found");

    console.log(`Executing transaction...`);
    const result = await prisma.$transaction([
      prisma.user.create({
        data: {
          name: request.name,
          email: request.email,
          password: request.password,
          role: 'member',
        },
      }),
      prisma.registrationRequest.update({
        where: { id },
        data: { status: 'approved' },
      })
    ]);
    
    console.log(`✅ Transaction Success! User created and request updated.`);
    console.log(`User ID: ${result[0].id}`);
    
    // Now test email logic (mocked here but shows if it would fail)
    console.log(`Attempting to simulate email send...`);
    // (In the real app, this is where sendEmail is called)
    console.log(`✅ Email simulation complete (it would be called here).`);
    
  } catch (err: any) {
    console.error(`❌ Transaction FAILED:`, err.message);
    if (err.code) console.error(`Prisma Error Code: ${err.code}`);
    if (err.meta) console.error(`Prisma Error Meta:`, err.meta);
  }
}

const targetEmail = process.argv[2] || 'hassan.a173784@gmail.com';
debugApprove(targetEmail);
