import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  AlertCircle,
  MessageSquare,
  ChevronDown,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, getISOWeekString, getISOWeekRange } from '@/lib/utils';
import { ReportCardImage } from '@/components/reports/ReportCardImage';
import { LikeButton } from '@/components/reports/LikeButton';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export const dynamic = 'force-dynamic';

export default async function TvgphGlobalFeedPage({
  searchParams
}: {
  searchParams: { q?: string; area?: string; limit?: string }
}) {
  const query = searchParams?.q || '';
  const areaFilter = searchParams?.area || '';
  const limit = Number(searchParams?.limit) || 20;

  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  let userId = '';
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = payload.userId;
  } catch {
    redirect('/login');
  }

  // Check if reported this week
  const currentWeek = getISOWeekString(new Date());
  const reportCount = await prisma.report.count({
    where: { authorId: userId, isoWeek: currentWeek }
  });
  const hasReported = reportCount > 0;

  // Fetch reports
  const reports = await prisma.report.findMany({
    where: {
      ...(query ? {
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { author: { name: { contains: query, mode: 'insensitive' } } }
        ]
      } : {}),
      ...(areaFilter && areaFilter !== 'TODOS' ? { area: { name: areaFilter as any } } : {})
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      area: true,
      attachments: true,
      _count: {
        select: { likes: true, comments: true }
      },
      likes: {
        where: { userId },
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Member Feed</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time laboratory updates and research summaries.</p>
        </div>

        <Button variant="outline" className="bg-white border-slate-100 shadow-sm rounded-xl h-11 px-5 flex items-center gap-3 text-slate-600 font-bold">
          <span>Week {currentWeek.split('W')[1]}: {getISOWeekRange()}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </div>

      {/* Alert Banner */}
      {!hasReported && (
        <div className="bg-primary rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-xl shadow-primary/20 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">Missing report this week</h3>
              <p className="text-white/80 font-medium text-sm mt-1">Your weekly laboratory synthesis is due. Submit it today to maintain your streak.</p>
            </div>
          </div>
          <Link href="/tvgph/novo">
            <Button className="bg-white text-primary font-bold hover:bg-slate-50 px-8 h-12 rounded-xl shadow-lg ring-4 ring-white/10 transition-all active:scale-95">
              Submit Now
            </Button>
          </Link>
        </div>
      )}

      {/* Masonry-like Feed Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {reports.map((report: any) => {
          const areaName = (report.area?.name || 'GENERAL').toUpperCase();
          const isProject = areaName.includes('PROJET') || areaName.includes('COORD');
          const isEvent = areaName.includes('EVEN');
          const isCourse = areaName.includes('CURS');
          const isMarketing = areaName.includes('MARK');

          return (
            <div key={report.id} className="break-inside-avoid group relative bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              {/* Featured Image Logic */}
              {(() => {
                const imageAttachment = report.attachments.find((a: any) => a.type === 'IMAGE');
                const featuredUrl = imageAttachment ? imageAttachment.url :
                  isEvent ? "/eventos.png" :
                    isProject ? "/projetos.png" :
                      isMarketing ? "/marketing.png" :
                        isCourse ? "/cursos.png" :
                          null;

                if (!featuredUrl) return null;

                return <ReportCardImage src={featuredUrl} alt={report.title} />;
              })()}

              <div className="p-7 space-y-5">
                {/* Meta Header */}
                <div className="flex items-center justify-between">
                  <Badge className={cn(
                    "px-3 py-1 text-[10px] font-extrabold tracking-widest rounded-lg border-none",
                    isProject ? "bg-blue-100 text-blue-600" :
                      isEvent ? "bg-orange-100 text-orange-600" :
                        isCourse ? "bg-indigo-100 text-indigo-600" :
                          "bg-slate-100 text-slate-500"
                  )}>
                    {areaName}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                    <Clock className="h-3 w-3" />
                    <span>RECENT</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Link href={`/tvgph/${report.id}`}>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">
                      {report.title || "Weekly Lab Report"}
                    </h3>
                  </Link>
                  <div
                    className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: report.content.substring(0, 180) + '...' }}
                  />
                </div>

                {/* Footer Meta */}
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm ring-offset-0">
                      <img
                        src={report.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${report.author.name || 'User'}`}
                        alt={report.author.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 leading-tight">
                        {report.author.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {report.area?.name || 'Member'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400">
                    <Link href={`/tvgph/${report.id}`}>
                      <div className="flex items-center gap-1.5 h-8 px-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                        <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-500">{report._count.comments}</span>
                      </div>
                    </Link>

                    <LikeButton
                      reportId={report.id}
                      initialLikes={report._count.likes}
                      initialIsLiked={report.likes.length > 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
