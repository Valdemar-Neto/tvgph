import { cookies } from 'next/headers';
import Image from 'next/image';
import { redirect, notFound } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MonitorPlay, FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReviewButton } from './components/ReviewButton';
import { ReopenButton } from './components/ReopenButton';
import { LikeButton } from '@/components/reports/LikeButton';
import { CommentSection } from '@/components/reports/CommentSection';
import { DeleteReportButton } from '@/components/reports/DeleteReportButton';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  let role = 'MEMBER';
  let userId = '';
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string; userId: string };
    role = payload.role;
    userId = payload.userId;
  } catch {
    redirect('/login');
  }

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, role: true } },
      area: true,
      attachments: true,
      _count: {
        select: { likes: true, comments: true }
      },
      likes: {
        where: { userId },
        select: { id: true }
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, role: true } }
        }
      }
    }
  });

  if (!report) return notFound();

  // Formatted constants
  const submissionDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(report.createdAt));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 font-mono">
      <div className="flex items-center justify-between gap-4">
        <Link href="/tvgph">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5 -ml-2 text-[10px] uppercase tracking-widest font-bold">
            <ArrowLeft className="h-3 w-3 mr-2" /> <span className="opacity-70">RETURN TO FEED</span>

          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <LikeButton
            reportId={report.id}
            initialLikes={report._count.likes}
            initialIsLiked={report.likes.length > 0}
            variant="detail"
          />

          {['MANAGER', 'PROFESSOR'].includes(role) && report.status === 'SUBMITTED' && (
            <ReviewButton reportId={report.id} />
          )}
          {['MANAGER', 'PROFESSOR'].includes(role) && report.status === 'REVIEWED' && (
            <ReopenButton reportId={report.id} />
          )}
          {role === 'PROFESSOR' && (
            <DeleteReportButton 
              reportId={report.id} 
              authorName={report.author.name}
              likesCount={report._count.likes}
              commentsCount={report._count.comments}
              redirectAfterDelete={true} 
            />
          )}
          {role === 'MEMBER' && report.authorId === userId && report.status === 'SUBMITTED' && (
            <Link href={`/tvgph/${report.id}/editar`}>
              <Button className="circuit-border border-primary text-primary bg-primary/5 hover:bg-primary/10 text-[10px] font-bold uppercase tracking-widest h-8 px-4">
                MODIFY_BUFFER
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="circuit-border bg-card relative overflow-hidden">
        {/* Header Block */}
        <div className="bg-primary/5 border-b border-border p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-2 py-0.5 circuit-border border-primary/40 text-[9px] text-primary font-bold bg-primary/10 uppercase tracking-widest">
                  {report.isoWeek}
                </div>
                <div className="px-2 py-0.5 circuit-border border-muted text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                  {report.area.name}
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tighter text-foreground uppercase">
                REPORT <span className="text-primary opacity-50">{report.id.slice(0, 8)}</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                AUTHOR: <span className="text-foreground font-bold">{report.author.name}</span>
              </div>
            </div>

            <div className="md:text-right space-y-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">STATE TELEMETRY</p>
              <div className={cn(
                "inline-block px-3 py-1 circuit-border font-bold text-xs uppercase tracking-widest",
                report.status === 'REVIEWED' ? "border-success text-success bg-success/5" : "border-primary text-primary bg-primary/5"
              )}>
                {report.status === 'REVIEWED' ? 'REVD_SUCCESS' : report.status}
              </div>
              <p className="text-[9px] text-muted-foreground font-mono mt-2">{submissionDate.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10 bg-background/30">
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/80 leading-relaxed uppercase tracking-tighter
                            prose-headings:font-bold prose-headings:tracking-tighter prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{ __html: report.content }} />
        </div>
      </div>

      {/* GALLERY AND HARDWARE EVIDENCE */}
      {report.attachments.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-sm font-bold tracking-widest flex items-center px-1 uppercase text-primary/80">
            <FileText className="mr-3 h-4 w-4" />
            ATTACHMENTS REPORT ({report.attachments.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.attachments.map((att: { id: string, type: string, filename: string, url: string, sizeBytes: number }) => (
              <div key={att.id} className="circuit-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate mr-4 flex items-center">
                    {att.type === 'VIDEO' ? <MonitorPlay className="h-3 w-3 mr-2 text-primary" /> :
                      att.type === 'IMAGE' ? <ImageIcon className="h-3 w-3 mr-2 text-primary" /> : <Download className="h-3 w-3 mr-2 text-primary" />}
                    {att.filename}
                  </span>
                  <div className="text-[9px] text-muted-foreground font-mono">
                    {(att.sizeBytes / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <div className="p-0 relative group">
                  {att.type === 'VIDEO' && (
                    <video controls preload="metadata" className="w-full aspect-video bg-black rounded-none" src={att.url}>
                      ERR_VIDEO_UNSUPPORTED
                    </video>
                  )}

                  {att.type === 'IMAGE' && (
                    <div className="w-full aspect-video bg-background relative flex items-center justify-center overflow-hidden circuit-border border-0">
                      <Image 
                        src={att.url} 
                        alt={att.filename} 
                        fill
                        className="object-contain opacity-90 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  )}

                  {att.type === 'PDF' && (
                    <div className="flex flex-col items-center justify-center p-12 bg-background aspect-video border-y border-border">
                      <FileText className="h-12 w-12 text-primary/20 mb-6" />
                      <a href={att.url} target="_blank" rel="noopener noreferrer">
                        <Button className="circuit-border border-primary text-primary bg-primary/5 hover:bg-primary/10 text-[10px] font-bold uppercase tracking-widest h-8 px-6">
                          <ExternalLink className="h-3 w-3 mr-2" /> PEEK_SCHEMATIC_PDF
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TECHNICAL DISCUSSION AND FEEDBACK */}
      <CommentSection
        reportId={report.id}
        initialComments={report.comments}
        currentUserId={userId}
        currentUserRole={role}
      />
    </div>

  );
}
