import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MonitorPlay, FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export default async function DetalheReportPage({ params }: { params: { id: string } }) {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    redirect('/login');
  }

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { name: true, role: true } },
      area: true,
      attachments: true
    }
  });

  if (!report) return notFound();

  // Constantes formatadas
  const dataPostagem = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(report.createdAt));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/tvgph">
        <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Feed
        </Button>
      </Link>

      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
             <div>
               <div className="flex items-center gap-2 mb-3">
                 <Badge variant="outline" className="font-mono text-xs text-primary bg-primary/5">{report.isoWeek}</Badge>
                 <Badge variant="secondary" className="text-xs uppercase">{report.area.name}</Badge>
               </div>
               <CardTitle className="text-2xl font-bold tracking-tight">Report Individual</CardTitle>
               <CardDescription className="text-sm mt-1">
                 O pesquisador <strong>{report.author.name}</strong> submeteu esse status.
               </CardDescription>
             </div>
             <div className="md:text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Status de Fluxo</p>
                <Badge variant={report.status === 'SUBMITTED' ? 'default' : 'secondary'} className="text-xs uppercase">
                  {report.status}
                </Badge>
                <p className="text-[10px] text-muted-foreground mt-2">{dataPostagem}</p>
             </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
           {/* CONTEÚDO TIPTAP - Estilização Tiptap usa classe 'prose' (Typography plugin) pra se ajeitar sozinho */}
           <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed 
                           prose-headings:font-bold prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80" 
                dangerouslySetInnerHTML={{ __html: report.content }} />
        </CardContent>
      </Card>

      {/* GALERIA E EVIDÊNCIAS DE HARDWARE */}
      {report.attachments.length > 0 && (
         <div className="space-y-4">
           <h3 className="text-lg font-bold tracking-tight flex items-center px-1">
             <FileText className="mr-2 h-5 w-5 text-primary" /> 
             Arquivos e Mídia do Processo ({report.attachments.length})
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.attachments.map((att: any) => (
                 <Card key={att.id} className="overflow-hidden border-border bg-muted/10 shadow-none">
                    <CardHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
                       <span className="text-sm font-semibold truncate mr-4 flex items-center">
                          {att.type === 'VIDEO' ? <MonitorPlay className="h-4 w-4 mr-2" /> : 
                           att.type === 'IMAGE' ? <ImageIcon className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                          {att.filename}
                       </span>
                       <Badge variant="outline" className="text-[10px]">
                          {(att.sizeBytes / 1024 / 1024).toFixed(2)} MB
                       </Badge>
                    </CardHeader>
                    <CardContent className="p-0 relative group">
                       {att.type === 'VIDEO' && (
                         <video controls preload="metadata" className="w-full aspect-video bg-black/5" src={att.url}>
                            Seu navegador não suporta a tag de vídeo.
                         </video>
                       )}

                       {att.type === 'IMAGE' && (
                         <div className="w-full aspect-video bg-muted/20 relative flex items-center justify-center overflow-hidden">
                            <img src={att.url} alt={att.filename} className="object-contain h-full w-full" />
                         </div>
                       )}

                       {att.type === 'PDF' && (
                         <div className="flex flex-col items-center justify-center p-8 bg-muted/10 aspect-video">
                            <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                               <Button variant="outline"><ExternalLink className="h-4 w-4 mr-2" /> Visualizar Documento</Button>
                            </a>
                         </div>
                       )}
                    </CardContent>
                 </Card>
              ))}
           </div>
         </div>
      )}
    </div>
  );
}
