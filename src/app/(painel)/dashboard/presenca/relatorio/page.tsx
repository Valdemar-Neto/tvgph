import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';
export const dynamic = 'force-dynamic';

export default async function RelatorioPresencaPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    if (payload.role !== 'MANAGER') redirect('/tvgph');
  } catch {
    redirect('/login');
  }

  const [meetings, users] = await Promise.all([
    prisma.meeting.findMany({
      orderBy: { date: 'asc' },
      include: { attendance: true }
    }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ]);

  // Monta mapa: userId → Set<meetingId> onde está presente
  const presenceMap = new Map<string, Set<string>>();
  for (const user of users) presenceMap.set(user.id, new Set());
  for (const meeting of meetings) {
    for (const att of (meeting as any).attendance) {
      if (att.present) presenceMap.get(att.userId)?.add(meeting.id);
    }
  }

  return (
    <div className="max-w-full mx-auto p-4 md:p-8 space-y-6 overflow-x-auto">
      <Link href="/dashboard/presenca">
        <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar às Presenças
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center">
            <BarChart3 className="mr-3 h-7 w-7 text-primary" />
            Relatório Completo de Presenças
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cruzamento de todos os membros ativos com todas as reuniões registradas.
          </p>
        </div>
        <Link href="/api/attendance/export">
          <Button variant="outline" size="sm">📥 Exportar CSV</Button>
        </Link>
      </div>

      {meetings.length === 0 || users.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">
          Nenhuma reunião ou membro ativo encontrado.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground sticky left-0 bg-muted/40 min-w-[180px]">
                  Membro
                </th>
                {meetings.map((m: any) => (
                  <th key={m.id} className="px-3 py-3 font-semibold text-muted-foreground text-center min-w-[90px] leading-tight">
                    <div className="text-xs">{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(m.date))}</div>
                    <div className="text-[10px] font-normal opacity-70 mt-0.5 truncate max-w-[80px]">{m.title}</div>
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold text-muted-foreground text-center">% Presença</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any, idx: number) => {
                const presentSet = presenceMap.get(user.id) || new Set();
                const taxa = meetings.length > 0 ? Math.round((presentSet.size / meetings.length) * 100) : 0;
                return (
                  <tr key={user.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}>
                    <td className="px-4 py-3 font-medium sticky left-0 bg-inherit border-r">{user.name}</td>
                    {meetings.map((m: any) => (
                      <td key={m.id} className="px-3 py-3 text-center text-base">
                        {presentSet.has(m.id) ? '✅' : '❌'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-bold">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        taxa >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : taxa >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {taxa}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
