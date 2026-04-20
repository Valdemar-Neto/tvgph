import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { getISOWeekString, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { UserX, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    redirect('/login');
  }

  // Pegar os usuários ativos
  const users = await prisma.user.findMany({
    where: { active: true },
    include: {
      userAreas: {
        include: { area: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Gerar as últimas 8 semanas
  const now = new Date();
  const weeks: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getTime());
    d.setDate(d.getDate() - (i * 7));
    weeks.push(getISOWeekString(d));
  }

  // Pegar todos os reports dessas semanas
  const reports = await prisma.report.findMany({
    where: {
      isoWeek: { in: weeks }
    },
    select: {
      authorId: true,
      isoWeek: true,
      status: true
    }
  });

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Attendance</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-2xl px-1">
            Consolidated cross-tabular view of squad presence and submission consistency based on weekly laboratory synthesis.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[11px] uppercase font-bold tracking-widest text-slate-500 w-80 border-r border-slate-50">Research Entity</th>
                {weeks.map(w => (
                  <th key={w} className="p-4 text-[11px] uppercase font-bold tracking-widest text-slate-400 text-center border-r border-slate-50 last:border-0 min-w-[90px]">
                    Week {w.split('-')[1]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                  <td className="p-6 border-r border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <img
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{user.name}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.userAreas.map((ua: { area: { id: string, name: string } }) => (
                            <Badge key={ua.area.id} variant="secondary" className="px-1.5 py-0 text-[9px] bg-slate-100 text-slate-500 rounded font-bold uppercase tracking-tighter">
                              {ua.area.name.slice(0, 8)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  {weeks.map(w => {
                    const weekReports = reports.filter(r => r.authorId === user.id && r.isoWeek === w);
                    const isReviewed = weekReports.some(r => r.status === 'REVIEWED');
                    const isSubmitted = weekReports.length > 0;

                    return (
                      <td key={w} className="p-4 text-center border-r border-slate-50 last:border-0">
                        <div className="flex justify-center">
                          {isReviewed ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                            </div>
                          ) : isSubmitted ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                                <Clock className="h-5 w-5" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                                <UserX className="h-5 w-5 opacity-40" />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-wrap gap-12">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Status</p>
            <p className="text-sm font-bold text-slate-700">Verified Submission</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Status</p>
            <p className="text-sm font-bold text-slate-700">Awaiting Review</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
            <UserX className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Status</p>
            <p className="text-sm font-bold text-slate-700">Missing Transmission</p>
          </div>
        </div>
      </div>
    </div>
  );
}
