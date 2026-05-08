import { Metadata } from 'next';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

const validAreas = ['CURSOS', 'PROJETOS', 'EVENTOS', 'MARKETING'] as const;

const areaDisplayNames: Record<string, string> = {
  CURSOS: 'Courses',
  PROJETOS: 'Projects',
  EVENTOS: 'Events',
  MARKETING: 'Marketing',
};

export async function generateMetadata({ params }: { params: { area: string } }): Promise<Metadata> {
  const areaName = areaDisplayNames[params.area.toUpperCase()] || params.area;
  return {
    title: `${areaName} Board | TvGPH`,
    description: `Kanban board for ${areaName} department activities`,
  };
}

export default async function KanbanPage({ params }: { params: { area: string } }) {
  const areaSlug = params.area.toUpperCase();

  if (!validAreas.includes(areaSlug as typeof validAreas[number])) {
    notFound();
  }

  // Get auth info
  const token = cookies().get('auth_token')?.value;
  let role = 'MEMBER';

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { role: string; userId: string };
      role = payload.role;
    } catch {
      // Invalid token
    }
  }

  // Get the area record
  const area = await prisma.area.findFirst({
    where: { name: areaSlug as 'CURSOS' | 'PROJETOS' | 'EVENTOS' | 'MARKETING' },
  });

  if (!area) {
    notFound();
  }

  // Fetch tasks for this area
  const tasks = await prisma.task.findMany({
    where: { areaId: area.id },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      area: { select: { id: true, name: true } },
    },
    orderBy: { position: 'asc' },
  });

  // Fetch members for the assignee dropdown
  const members = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, avatarUrl: true },
    orderBy: { name: 'asc' },
  });

  // Serialize dates for client component
  const serializedTasks = tasks.map((t: typeof tasks[number]) => ({
    ...t,
    deadline: t.deadline?.toISOString() || null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <KanbanBoard
      initialTasks={serializedTasks}
      areaId={area.id}
      areaName={areaDisplayNames[areaSlug] || areaSlug}
      role={role}
      members={members}
    />
  );
}
