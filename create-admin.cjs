const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@mediconnect.dz';
  const rawPassword = 'mediadmin123'; // You can change this
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { 
      role: 'admin', 
      passwordHash 
    },
    create: {
      email,
      role: 'admin',
      fullName: 'Admin MediConnect',
      passwordHash,
      verified: true
    }
  });

  console.log('----------------------------------------------------');
  console.log('Admin account created/updated successfully!');
  console.log('Email: ' + admin.email);
  console.log('Password: ' + rawPassword);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
