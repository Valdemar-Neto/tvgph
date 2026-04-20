import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Download,
  LayoutDashboard,
  Users2,
  CalendarCheck
} from 'lucide-react';
import { ReportChart } from './components/ReportChart';
import { PresenceChart } from './components/PresenceChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getISOWeekString, cn } from '@/lib/utils';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    if (!['MANAGER', 'PROFESSOR'].includes(payload.role)) redirect('/tvgph');
  } catch {
    redirect('/login');
  }

  const currentWeek = getISOWeekString(new Date());

  const [totalUsers, totalReports, totalReportsThisWeek, areas, activeUsers, meetings] = await Promise.all([
    prisma.user.count({ where: { active: true } }),
    prisma.report.count(),
    prisma.report.count({ where: { isoWeek: currentWeek } }),
    prisma.area.findMany(),
    prisma.user.findMany({ 
      where: { active: true }, 
      select: { 
        id: true, 
        name: true,
        avatarUrl: true,
        userAreas: { include: { area: true } }
      } 
    }),
    prisma.meeting.findMany({
      orderBy: { date: 'desc' },
      take: 8,
      include: { attendance: true }
    })
  ]);

  // Dados para gráfico de barras (reports por área)
  const reportsData = await Promise.all(
    areas.map(async (area: any) => {
      const total = await prisma.report.count({ 
        where: { 
          areaId: area.id,
          isoWeek: currentWeek
        } 
      });
      return { area: area.name, total };
    })
  );

  // Dados para gráfico de linha (% presença por reunião)
  const presenceData = meetings.reverse().map((m: any) => {
    const total = m.attendance.length;
    const present = m.attendance.filter((a: any) => a.present).length;
    const taxa = total > 0 ? Math.round((present / total) * 100) : 0;
    const label = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(m.date));
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
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Command Center</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-2xl px-1">
            Centralized intelligence and analytics orchestration for monitoring squad performance and research delivery.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/dashboard/members">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-100 bg-white shadow-sm font-bold text-slate-600 gap-2">
              <Users2 className="h-4 w-4" />
              Member Registry
            </Button>
          </Link>
          <Link href="/dashboard/presence">
            <Button className="h-11 px-6 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 gap-2">
              <CalendarCheck className="h-4 w-4" />
              Presence Control
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Entities', value: totalUsers, icon: Users, sub: 'Verified members' },
          { label: 'Weekly Packets', value: totalReportsThisWeek, icon: FileText, sub: `Of ${totalReports} Total` },
          { label: 'Presence Sync', value: lastPresenceTaxa !== null ? `${lastPresenceTaxa}%` : '---', icon: Activity, sub: 'Latest session' },
          { 
            label: 'Alert Stack', 
            value: pendingMembers.length, 
            icon: pendingMembers.length > 0 ? AlertTriangle : CheckCircle2, 
            sub: pendingMembers.length === 0 ? 'All TX Received' : 'Pending submissions',
            color: pendingMembers.length > 0 ? 'text-red-500' : 'text-emerald-500',
            bg: pendingMembers.length > 0 ? 'bg-red-50' : 'bg-emerald-50'
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
              <stat.icon className={cn("h-5 w-5 opacity-40", stat.color)} />
            </div>
            <div className="flex flex-col mt-2">
              <span className={cn("text-4xl font-extrabold tracking-tighter", stat.color || "text-slate-900")}>
                {stat.value}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-1">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Alerts for Pending Members */}
      {pendingMembers.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-3xl overflow-hidden shadow-sm shadow-red-100">
          <div className="px-6 py-4 border-b border-red-100 bg-red-100/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-red-600 leading-none">
                Missing Transmissions // Week {currentWeek.split('-')[1]}
              </h2>
            </div>
            <Badge variant="outline" className="bg-white border-red-200 text-red-600 font-bold px-2 rounded-lg">
              REQUIRED_ACTION
            </Badge>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {pendingMembers.map((m: any) => (
                <div key={m.id} className="group px-4 py-2 bg-white border border-red-50 rounded-xl shadow-sm hover:border-red-200 transition-all cursor-default">
                  <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-slate-100 overflow-hidden">
                        <img 
                          src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} 
                          alt={m.name}
                          className="h-full w-full object-cover" 
                        />
                      </div>
                     <span className="text-xs font-bold text-red-700">{m.name}</span>
                     <span className="text-[10px] font-medium text-slate-300">
                       / {m.userAreas?.map((ua: any) => ua.area?.name.slice(0, 3)).join(', ') || 'NONE'}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Packet Volume By Area</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Distribution of active research payloads in this week.</p>
          </div>
          <ReportChart data={reportsData} />
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Presence Sync Trend</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Consistency metrics across last {presenceData.length} sessions.</p>
            </div>
            <Link href="/api/attendance/export">
              <Button variant="outline" className="h-9 border-slate-100 bg-slate-50 text-[11px] uppercase font-bold px-4 gap-2 rounded-xl text-slate-500 hover:text-primary transition-all shadow-sm">
                <Download className="h-3 w-3" /> Export CSV
              </Button>
            </Link>
          </div>
          <PresenceChart data={presenceData} />
        </div>
      </div>
    </div>
  );
}
