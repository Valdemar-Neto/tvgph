const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando Seeding de Áreas e Usuários...');

  // 1. Criar as áreas caso o banco esteja vazio
  const preDefinedAreas = ['CURSOS', 'PROJETOS', 'EVENTOS', 'MARKETING'];
  const createdAreas = [];

  for (const areaName of preDefinedAreas) {
    const exists = await prisma.area.findFirst({ where: { name: areaName } });
    if (!exists) {
      const area = await prisma.area.create({ data: { name: areaName } });
      createdAreas.push(area);
      console.log(`Área ${areaName} criada com sucesso.`);
    } else {
      createdAreas.push(exists);
      console.log(`Área ${areaName} já existia.`);
    }
  }

  // 2. Gato (Workaround) pros testes: Víncular TODOS os usuários órfãos a todas as áreas!
  const users = await prisma.user.findMany();
  for (const user of users) {
    for (const area of createdAreas) {
      const relationExists = await prisma.userArea.findUnique({
        where: { userId_areaId: { userId: user.id, areaId: area.id } }
      });

      if (!relationExists) {
        await prisma.userArea.create({
          data: {
            userId: user.id,
            areaId: area.id
          }
        });
        console.log(`Usuário ${user.name} vinculado à Área ${area.name}.`);
      }
    }
    
    // Já aproveitamos e ativamos a conta dele e damos poder de gerente
    await prisma.user.update({
      where: { id: user.id },
      data: { active: true, role: 'MANAGER' }
    });
  }

  console.log('Seeding finalizado!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
