/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      name: {
        in: ['Siria Cabral', 'Samaherni Dias', 'Lisandry Azuaje', 'Vinicius Oliveira']
      }
    },
    select: { id: true, name: true }
  });

  const areas = await prisma.area.findMany();

  console.log(JSON.stringify({ users, areas }, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
