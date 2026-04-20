import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  FileText,
  Paperclip,
  CalendarDays,
  CalendarClock,
  Pencil,
  FlaskConical,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientSearchInput } from '@/components/search/ClientSearchInput';
import { DeleteReportButton } from '@/components/reports/DeleteReportButton';
import { getISOWeekString, cn } from '@/lib/utils';
import { TimelineGraph } from '@/components/reports/TimelineGraph';

interface Report {
  id: string;
  title: string | null;
  content: string;
  isoWeek: string;
  status: string;
  area: {
    name: string;
  };
  attachments: {
    id: string;
  }[];
}

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export default async function MyReportsPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams?.q || '';
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    userId = decoded.userId;
  } catch {
    redirect('/login');
  }

  const myReports = await prisma.report.findMany({
    where: {
      authorId: userId,
      ...(query ? { content: { contains: query, mode: 'insensitive' } } : {})
    },
    include: {
      area: true,
      attachments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FlaskConical className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Personal Assets</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-2xl px-1">
            Immutable log of your technical contributions, progress reports, and experimental data submissions.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <ClientSearchInput placeholder="Filter your reports..." />
          <Link href="/tvgph/novo" className="w-full md:w-auto">
            <Button className="w-full h-11 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center gap-2 px-6">
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats/Graph Overlay */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-slate-100 ring-1 ring-slate-100/50">
        <TimelineGraph reports={myReports} />
      </div>

      {myReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <CalendarClock className="h-12 w-12 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No research history found</h2>
          <p className="text-slate-500 max-w-sm mb-10 font-medium">
            Your repository is currently empty. Initialize your first research report to populate your personal log.
          </p>
          <Link href="/tvgph/novo">
            <Button className="bg-primary text-white font-bold hover:bg-primary/90 h-12 px-8 rounded-xl shadow-lg shadow-primary/20">
              Initialize First Report
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myReports.map((report: Report) => {
            const isEditable = report.status === 'SUBMITTED' && report.isoWeek === getISOWeekString(new Date());
            const isReviewed = report.status === 'REVIEWED';

            return (
              <div key={report.id} className="group flex flex-col bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-lg">
                      WEEK {report.isoWeek.split('-')[1]}
                    </Badge>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight",
                      isReviewed ? "bg-emerald-50 text-emerald-600" : "bg-primary/5 text-primary"
                    )}>
                      {isReviewed ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {isReviewed ? 'REVIEWED' : 'PENDING'}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight truncate">
                    {report.title || "Weekly Lab Report"}
                  </h3>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div
                    className="text-slate-500 text-xs font-medium line-clamp-3 leading-relaxed mb-6"
                    dangerouslySetInnerHTML={{ __html: report.content.substring(0, 150) + '...' }}
                  />

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {report.attachments.length > 0 ? (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] gap-1 px-2">
                          <Plus className="h-3 w-3" /> {report.attachments.length} BLOCKS
                        </Badge>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">RAW TX</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditable ? (
                        <Link href={`/tvgph/${report.id}/editar`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <div className="h-9 w-9 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-slate-200" />
                        </div>
                      )}

                      <DeleteReportButton reportId={report.id} />

                      <div className="w-px h-6 bg-slate-100 mx-1" />

                      <Link href={`/tvgph/${report.id}`}>
                        <Button variant="ghost" className="h-9 px-3 text-primary font-bold hover:bg-primary/5 rounded-xl text-xs uppercase tracking-tight">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
