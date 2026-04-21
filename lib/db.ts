
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClientSingleton = () => {
  // 1. Tomamos la URL de Neon desde el archivo de nuestras variables de entorno
  const connectionString = `${process.env.DATABASE_URL}`;
  
  // 2. Creamos un "Pool"
  const pool = new Pool({ connectionString });
  
  // 3. Lo envolvemos en el adaptador de Prisma
  const adapter = new PrismaPg(pool as any);
  
  // 4. Se lo pasamos al cliente
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;