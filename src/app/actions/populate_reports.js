const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getISOWeekString(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

async function main() {
  const currentWeek = getISOWeekString(new Date());

  const data = [
    { name: 'Lisandry Azuaje', areaName: 'CURSOS', content: 'Advanced robotic automation course planning completed.' },
    { name: 'Vinicius Oliveira', areaName: 'PROJETOS', content: 'Computer vision prototype development at 80%.' },
    { name: 'Samaherni Dias', areaName: 'EVENTOS', content: 'Logistics for the AI in healthcare workshop defined with suppliers.' },
    { name: 'Siria Cabral', areaName: 'MARKETING', content: 'Social media campaign for the new laboratory launched successfully.' }
  ];

  for (const item of data) {
    const user = await prisma.user.findFirst({ where: { name: item.name } });
    const area = await prisma.area.findFirst({ where: { name: item.areaName } });

    if (user && area) {
      // 1. Activate and Link
      await prisma.user.update({
        where: { id: user.id },
        data: { active: true }
      });

      await prisma.userArea.upsert({
        where: { userId_areaId: { userId: user.id, areaId: area.id } },
        create: { userId: user.id, areaId: area.id },
        update: {}
      });

      // 2. Create PENDING Report (SUBMITTED)
      await prisma.report.upsert({
        where: {
          authorId_areaId_isoWeek: {
            authorId: user.id,
            areaId: area.id,
            isoWeek: currentWeek
          }
        },
        create: {
          authorId: user.id,
          areaId: area.id,
          isoWeek: currentWeek,
          title: `Weekly Synthesis - ${item.areaName}`,
          content: item.content,
          status: 'SUBMITTED'
        },
        update: {
          status: 'SUBMITTED'
        }
      });

      console.log(`Success for ${item.name}: Activated, linked to ${item.areaName} and report created.`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
