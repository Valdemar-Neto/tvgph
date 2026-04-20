import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Paperclip, CalendarDays, ExternalLink, SatelliteDish } from 'lucide-react';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

import { ClientSearchInput } from '@/components/search/ClientSearchInput';
import { AreaFilterChips } from '@/components/search/AreaFilterChips';
import { LoadMoreButton } from '@/components/search/LoadMoreButton';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function TvgphGlobalFeedPage({ 
  searchParams 
}: { 
  searchParams: { q?: string; area?: string; limit?: string } 
}) {
  const query = searchParams?.q || '';
  const areaFilter = searchParams?.area || '';
  const limit = Number(searchParams?.limit) || 12;

  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    redirect('/login');
  }

  // Busca com filtro de texto e de área + limit (pegamos 1 a mais para saber se tem mais)
  const globalReports = await prisma.report.findMany({
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
      author: { select: { id: true, name: true } },
      area: true,
      attachments: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1
  });

  const hasMore = globalReports.length > limit;
  const items = globalReports.slice(0, limit);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 bg-muted/30 p-6 rounded-lg border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
             <SatelliteDish className="mr-3 h-8 w-8 text-primary" />
             TV GPH (Time-Line)
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Acompanhe o que os outros pesquisadores de todos os squads andam construindo e enfrentando de problemas ao longo desta jornada semanal.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <ClientSearchInput placeholder="Buscar report ou autor..." />
          <Link href="/tvgph/novo" className="w-full md:w-auto">
            <Button size="lg" className="w-full shadow-lg hover:-translate-y-1 transition-all duration-300 bg-primary/90">
              Novo Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Chips de Área */}
      <AreaFilterChips />
      {items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/10 shadow-none">
          <CardTitle className="text-xl opacity-70">A Rede de Transmissão está silenciosa...</CardTitle>
          <CardDescription className="max-w-md mt-2">
            Ninguém realizou um report na plataforma TvGPH ainda. Que tal ser o primeiro desbravador?
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((report: any) => (
              <Card key={report.id} className="relative group overflow-hidden border-border hover:border-primary/50 transition-colors duration-300">
                <CardHeader className="pb-3 border-b bg-muted/10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {report.author.name.substring(0,2).toUpperCase()}
                       </div>
                       <div>
                          <p className="text-sm font-semibold">{report.author.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{report.area?.name || 'Geral'} • {report.isoWeek}</p>
                       </div>
                    </div>
                    <Badge 
                      variant={report.status === 'SUBMITTED' ? 'default' : 'secondary'} 
                      className={cn(
                        "text-[10px] uppercase",
                        report.status === 'REVIEWED' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200"
                      )}
                    >
                      {report.status === 'REVIEWED' ? 'Revisado' : report.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-4">
                  <div className="bg-background min-h-[60px] text-sm text-foreground/80 line-clamp-4 overflow-hidden text-ellipsis prose prose-sm dark:prose-invert" 
                       dangerouslySetInnerHTML={{ __html: report.content }} />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                       {report.attachments.length > 0 ? (
                         <span className="flex items-center font-medium bg-muted px-2 py-1 rounded-md"><Paperclip className="h-3.5 w-3.5 mr-1 text-primary"/> {report.attachments.length} Anexos</span>
                       ) : (
                         <span className="flex items-center opacity-60 bg-muted px-2 py-1 rounded-md"><FileText className="h-3.5 w-3.5 mr-1"/> Puramente Textual</span>
                       )}
                    </div>
                    <Link href={`/tvgph/${report.id}`}>
                      <Button variant="outline" size="sm" className="font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                         Visualizar <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && <LoadMoreButton currentLimit={limit} />}
        </div>
      )}
    </div>
  );
}
