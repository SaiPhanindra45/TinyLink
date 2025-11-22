import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'; // NEW: Driver Adapter
import { Pool } from 'pg'; // NEW: PG Pool Driver
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Ensure the connection string exists before proceeding
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// 1. Initialize the Pool and Adapter
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);


// This trick ensures that in development mode, Next.js hot-reloading 
// doesn't create dozens of active database connections, which causes errors.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 2. Pass the adapter to the Prisma Client
    adapter,
    // Enable logging to see actual SQL queries being sent and help with debugging
    log: ['query', 'error', 'warn'], 
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma