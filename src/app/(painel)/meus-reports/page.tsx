import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Paperclip, CalendarDays, ExternalLink, CalendarClock, Pencil } from 'lucide-react';
import { ClientSearchInput } from '@/components/search/ClientSearchInput';
import { DeleteReportButton } from '@/components/reports/DeleteReportButton';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export const dynamic = 'force-dynamic'; // Garante que a listagem carregue novos dados instantaneamente (Server Action behavior)

export default async function MeusReportsPage({ searchParams }: { searchParams: { q?: string } }) {
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

  // Busca apenas os reports desse author (usuário logado) com suporte a busca
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
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Meus Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Seu histórico pessoal de entregas do grupo de pesquisa.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
           <ClientSearchInput placeholder="Buscar nos meus reports..." />
           <Link href="/tvgph/novo" className="w-full md:w-auto">
             <Button size="lg" className="w-full shadow-lg hover:-translate-y-1 transition-all duration-300">
               + Escrever Relatório
             </Button>
           </Link>
        </div>
      </div>

      {myReports.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/20">
          <CalendarClock className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <CardTitle className="text-xl">Nenhuma entrega realizada ainda.</CardTitle>
          <CardDescription className="max-w-md mt-2">
            Você não possui nenhum relatório enviado para o banco de dados. Os relatórios semanais que você mandar e seus arquivos anexos vão residir de forma imutável aqui.
          </CardDescription>
          <Link href="/tvgph/novo" className="mt-6">
            <Button variant="outline">Começar o meu primeiro de agora</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myReports.map((report: any) => (
            <Card key={report.id} className="relative group overflow-hidden border-border/50 hover:border-primary/50 transition-colors duration-300 shadow-sm hover:shadow-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="font-mono text-xs">{report.isoWeek}</Badge>
                  <Badge variant={report.status === 'SUBMITTED' ? 'default' : 'outline'} className="text-[10px] uppercase">
                    {report.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-1">{report.area.name}</CardTitle>
                <CardDescription className="flex items-center text-xs mt-1">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(report.createdAt))}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-muted/40 p-3 rounded-md min-h-[60px] text-sm text-foreground/80 line-clamp-3 overflow-hidden text-ellipsis prose prose-sm dark:prose-invert" 
                     dangerouslySetInnerHTML={{ __html: report.content }} />
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                     {report.attachments.length > 0 ? (
                       <span className="flex items-center"><Paperclip className="h-3.5 w-3.5 mr-1 text-primary"/> {report.attachments.length} Mídias</span>
                     ) : (
                       <span className="flex items-center opacity-60"><FileText className="h-3.5 w-3.5 mr-1"/> Texto Puro</span>
                     )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/tvgph/${report.id}/editar`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                        <Pencil className="h-3 w-3 mr-1" /> Editar
                      </Button>
                    </Link>
                    <DeleteReportButton reportId={report.id} />
                    <Link href={`/tvgph/${report.id}`}>
                      <Button variant="ghost" size="sm" className="font-semibold text-primary group-hover:translate-x-1 transition-transform h-8 text-xs">
                        Abrir <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
