import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, Activity, ShieldAlert, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { ReportChart } from './components/ReportChart';
import { PresenceChart } from './components/PresenceChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';
export const dynamic = 'force-dynamic';

function getISOWeekString(d: Date) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000) / 7);
  return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}

export default async function DashboardPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    if (payload.role !== 'MANAGER') redirect('/tvgph');
  } catch {
    redirect('/login');
  }

  const currentWeek = getISOWeekString(new Date());

  const [totalUsers, totalReports, areas, activeUsers, meetings] = await Promise.all([
    prisma.user.count({ where: { active: true } }),
    prisma.report.count(),
    prisma.area.findMany(),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true } }),
    prisma.meeting.findMany({
      orderBy: { date: 'desc' },
      take: 8,
      include: { attendance: true }
    })
  ]);

  // Dados para gráfico de barras (reports por área)
  const reportsData = await Promise.all(
    areas.map(async (area: any) => {
      const total = await prisma.report.count({ where: { areaId: area.id } });
      return { area: area.name, total };
    })
  );

  // Dados para gráfico de linha (% presença por reunião)
  const presenceData = meetings.reverse().map((m: any) => {
    const total = m.attendance.length;
    const present = m.attendance.filter((a: any) => a.present).length;
    const taxa = total > 0 ? Math.round((present / total) * 100) : 0;
    const label = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(m.date));
    return { label, taxa };
  });

  // Membros ativos sem report esta semana
  const reportersThisWeek = await prisma.report.findMany({
    where: { isoWeek: currentWeek },
    select: { authorId: true },
    distinct: ['authorId']
  });
  const reporterIds = new Set(reportersThisWeek.map((r: any) => r.authorId));
  const pendingMembers = activeUsers.filter((u: any) => !reporterIds.has(u.id));

  // Taxa de presença da última reunião
  const lastMeeting = meetings[0];
  let lastPresenceTaxa = null;
  if (lastMeeting) {
    const total = (lastMeeting as any).attendance.length;
    const present = (lastMeeting as any).attendance.filter((a: any) => a.present).length;
    lastPresenceTaxa = total > 0 ? Math.round((present / total) * 100) : 0;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
            <ShieldAlert className="mr-3 h-8 w-8 text-primary" />
            Posto de Comando
          </h1>
          <p className="text-muted-foreground mt-1">Visão holística do engajamento, métricas de relatórios e presenças.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/membros">
            <Button variant="outline">Membros & Permissões</Button>
          </Link>
          <Link href="/dashboard/presenca">
            <Button>Gerenciar Frequências</Button>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pesquisadores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Cadastros válidos na base.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Relatórios</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground mt-1">Entregas globais registradas.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Última Reunião</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {lastPresenceTaxa !== null ? `${lastPresenceTaxa}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Taxa de presença no último encontro.</p>
          </CardContent>
        </Card>

        <Card className={`shadow-sm ${pendingMembers.length > 0 ? 'border-destructive/40 bg-destructive/5' : 'border-green-500/30 bg-green-500/5'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendências da Semana</CardTitle>
            {pendingMembers.length > 0
              ? <AlertTriangle className="h-4 w-4 text-destructive" />
              : <CheckCircle2 className="h-4 w-4 text-green-600" />}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${pendingMembers.length > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {pendingMembers.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingMembers.length === 0 ? 'Todos entregaram esta semana!' : 'Membros sem report esta semana.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção: Membros com pendência */}
      {pendingMembers.length > 0 && (
        <Card className="border-destructive/30 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Membros sem relatório esta semana ({currentWeek})
            </CardTitle>
            <CardDescription>
              Os pesquisadores abaixo ainda não enviaram nenhum report nesta semana.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {pendingMembers.map((m: any) => (
                <Badge key={m.id} variant="outline" className="border-destructive/40 text-destructive font-medium">
                  {m.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Reports por Área</CardTitle>
            <CardDescription>Volume histórico de entregas por pilar de pesquisa.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportChart data={reportsData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tendência de Presença</CardTitle>
                <CardDescription>% de comparecimento nas últimas {presenceData.length} reuniões.</CardDescription>
              </div>
              <Link href="/api/attendance/export">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Download className="h-3.5 w-3.5" /> Exportar CSV
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <PresenceChart data={presenceData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
