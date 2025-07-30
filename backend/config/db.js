// const { PrismaClient } = require('@prisma/client');

// // Handle environments where `globalThis` might not exist (rare)
// const globalForPrisma = globalThis || {};

// // Singleton pattern: Reuse Prisma Client in development
// const prisma = globalForPrisma.prisma || new PrismaClient({
//   log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
// });

// // Cache in globalThis only in development (avoid production memory issues)
// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma;
// }

// // Connect to DB immediately and handle errors
// async function connectDB() {
//   try {
//     await prisma.$connect();
//     console.log('✅ Database connected successfully');
//   } catch (error) {
//     console.error('❌ Connection error:', error);
//     process.exit(1); // Crash the app if DB is unreachable
//   }
// }

// // Graceful shutdown
// process.on('beforeExit', async () => {
//   await prisma.$disconnect();
//   console.log('🛑 Prisma Client disconnected');
// });

// // Initialize
// connectDB();

// module.exports = prisma;