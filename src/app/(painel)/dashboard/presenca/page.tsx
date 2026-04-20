import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, ArrowLeft, ArrowRight, Download, BarChart3 } from 'lucide-react';
import { CreateMeetingForm } from './components/CreateMeetingForm';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';
export const dynamic = 'force-dynamic';

export default async function PresencaPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    if (payload.role !== 'MANAGER') redirect('/tvgph');
  } catch {
    redirect('/login');
  }

  const meetings = await prisma.meeting.findMany({
    orderBy: { date: 'desc' },
    include: {
      attendance: true
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
       <Link href="/dashboard">
         <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 -ml-2">
           <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Painel
         </Button>
       </Link>

       <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
             <ListChecks className="mr-3 h-8 w-8 text-primary" />
             Quadro de Presenças
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
             Inicie uma pauta física e acompanhe o registro dos comparecimentos na sede da Equipe.
          </p>
       </div>
       <div className="flex gap-3">
         <Link href="/dashboard/presenca/relatorio">
           <Button variant="outline" size="sm" className="gap-2">
             <BarChart3 className="h-4 w-4" /> Relatório Completo
           </Button>
         </Link>
         <Link href="/api/attendance/export">
           <Button variant="outline" size="sm" className="gap-2">
             <Download className="h-4 w-4" /> Exportar CSV
           </Button>
         </Link>
       </div>

       <div className="pt-2">
          <CreateMeetingForm />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {meetings.length === 0 && (
             <div className="col-span-full border border-dashed rounded-lg p-12 text-center bg-muted/10 opacity-70">
                <p>Nenhuma Reunião Encontrada.</p>
             </div>
          )}
          {meetings.map((meet: any) => {
             const dataFormatada = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(meet.date));
             const totalSize = meet.attendance.length;
             const totalPresent = meet.attendance.filter((a: any) => a.present).length;
             const taxaPresenca = totalSize > 0 ? ((totalPresent / totalSize) * 100).toFixed(0) : 0;
             
             return (
               <Card key={meet.id} className="relative group hover:border-primary/50 transition-colors shadow-sm">
                  <CardHeader className="pb-3 border-b bg-muted/10">
                    <CardTitle className="text-lg truncate">{meet.title}</CardTitle>
                    <p className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider">{dataFormatada}</p>
                  </CardHeader>
                  <CardContent className="pt-4 flex flex-col gap-4">
                     <div className="flex justify-between items-center bg-background rounded-md border p-3">
                        <span className="text-xs text-muted-foreground font-semibold uppercase">Engajamento de Freq.</span>
                        <span className="text-sm font-bold text-primary">{taxaPresenca}% ({totalPresent}/{totalSize})</span>
                     </div>
                     <Link href={`/dashboard/presenca/${meet.id}`} className="w-full">
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground font-semibold">
                           Realizar Chamada <ArrowRight className="h-3 w-3 ml-2" />
                        </Button>
                     </Link>
                  </CardContent>
               </Card>
             );
          })}
       </div>
    </div>
  )
}
