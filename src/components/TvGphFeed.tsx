'use client';

import React from 'react';

interface Attachment {
  id: string;
  type: 'VIDEO' | 'PDF' | 'IMAGE';
  url: string;
}

interface Report {
  id: string;
  author: { name: string; avatarUrl: string | null };
  area: { name: string };
  content: string;
  attachments: Attachment[];
  createdAt: string;
}

export default function TvGphFeed({ initialReports }: { initialReports: Report[] }) {
  return (
    <div className="flex flex-col space-y-8 max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">TV GPH 📺</h1>
        <p className="text-muted-foreground">O feed de pesquisa e reports da semana.</p>
      </div>

      {initialReports.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
          <p className="text-muted-foreground">Nenhum report publicado ainda.</p>
        </div>
      ) : (
        initialReports.map(report => (
          <article key={report.id} className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b bg-muted/10">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                  {report.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold leading-none">{report.author.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {report.area.name} • {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Rich Text Content */}
            <div className="p-5">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: report.content }} 
              />
            </div>

            {/* Media/Video Player */}
            {report.attachments.map(attachment => {
              if (attachment.type === 'VIDEO') {
                return (
                  <div key={attachment.id} className="relative aspect-video bg-black w-full">
                    <video 
                      controls 
                      className="w-full h-full object-contain" 
                      src={attachment.url} 
                      preload="none"
                      poster="/video-placeholder.png"
                    >
                      Seu navegador não suporta a visualização deste vídeo.
                    </video>
                  </div>
                );
              }
              if (attachment.type === 'PDF') {
                 return (
                   <div key={attachment.id} className="p-4 bg-muted/20 border-t flex items-center justify-center">
                     <a href={attachment.url} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline flex items-center">
                       📄 Visualizar Anexo PDF
                     </a>
                   </div>
                 )
              }
              return null;
            })}
          </article>
        ))
      )}
    </div>
  );
}
