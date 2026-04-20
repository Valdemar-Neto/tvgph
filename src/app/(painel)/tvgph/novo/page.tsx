'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Paperclip, Loader2, X } from 'lucide-react';

// Função utilitária para pegar a ISO Week atual (Ex: 2026-W16)
function getCurrentIsoWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

interface UserArea { areaId: string; area: { id: string; name: string } }
interface UploadableFile { file: File; progress: number; }

export default function NovoReportPage() {
  const router = useRouter();
  
  const [loadingContext, setLoadingContext] = useState(true);
  const [userAreas, setUserAreas] = useState<UserArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [isoWeek, setIsoWeek] = useState(getCurrentIsoWeek());
  
  const [filesToUpload, setFilesToUpload] = useState<UploadableFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Módulo Tiptap do Editor (Toolbar básica minimalista por enquanto)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Escreva seu report semanal detalhando o que foi feito, impasses e próximos passos...' })
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[250px] p-4 bg-muted/20 border rounded-md',
      },
    },
  });

  // 1. Busca as áreas do Usuário (se ele possui vínculos na base)
  useEffect(() => {
    async function fetchAreas() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user.userAreas && data.user.userAreas.length > 0) {
          setUserAreas(data.user.userAreas);
          // Força a primeira disciplina como padrão logo de cara pra não bugar o componente
          setSelectedArea(data.user.userAreas[0].areaId);
        }
      } catch (err) {
        toast.error('Geral: Falha de comunicação.');
      } finally {
        setLoadingContext(false);
      }
    }
    fetchAreas();
  }, []);

  // 2. Manipula inclusão de arquivos pela Janela de Seleção
  function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, progress: 0 }));
      setFilesToUpload(prev => [...prev, ...newFiles]);
    }
  }

  function removeFile(index: number) {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  }

  // 3. Orquestrador "Mestre": Envia anexos pro R2, e depois manda o formulário pra API Node!
  async function handleSubmit() {
    if (!selectedArea) return toast.warning('Selecione uma área de atuação.');
    if (!editor || editor.isEmpty) return toast.warning('O report não pode ser vazio.');

    setIsSubmitting(true);
    const finalAttachments: Array<{ type: string; url: string; filename: string; sizeBytes: number }> = [];

    // FASE A: Upload Direto (R2 Cloudflare via Pre-Signed)
    for (let i = 0; i < filesToUpload.length; i++) {
        const item = filesToUpload[i];
        const { file } = item;

        try {
            // Pede a URL pra API
            const presignRes = await fetch('/api/reports/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, contentType: file.type })
            });
            const presignData = await presignRes.json();

            if (!presignRes.ok) throw new Error(presignData.error);

            // Abre transporte real (XHR nativo permite escutar o XML progress event!)
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const prog = Math.round((e.loaded / e.total) * 100);
                        setFilesToUpload(current => {
                            const newArray = [...current];
                            newArray[i].progress = prog;
                            return newArray;
                        });
                    }
                };
                xhr.open('PUT', presignData.url);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        // Classificador Simples de tipo
                        let attachmentType = 'IMAGE';
                        if (file.type.includes('video')) attachmentType = 'VIDEO';
                        if (file.type.includes('pdf')) attachmentType = 'PDF';
                        
                        finalAttachments.push({
                            type: attachmentType,
                            url: `https://${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || ''}/${presignData.objectKey}`, // Na Fase 3 você configuará o domínio público (CORS) das midias!
                            filename: file.name,
                            sizeBytes: file.size
                        });
                        resolve();
                    } else reject();
                };
                xhr.onerror = () => reject();
                xhr.send(file);
            });
        } catch(err) {
            toast.error(`Falha ao subir anexos: ${file.name}`);
            setIsSubmitting(false);
            return;
        }
    }

    // FASE B: Gravar na Tabela Report (Banco Railway de Dados)
    try {
        const payload = {
            areaId: selectedArea,
            isoWeek,
            content: editor.getHTML(),
            attachments: finalAttachments
        };

        const apiRes = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const dataRes = await apiRes.json();
        
        if (apiRes.ok) {
            toast.success('Report enviado com sucesso!');
            router.push('/meus-reports');
        } else {
            toast.error(dataRes.error || 'Erro processando gravamento no banco.');
        }

    } catch (error) {
        toast.error('Erro geral ao enviar Report. Servidor possivelmente indisponível.');
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loadingContext) return <div className="p-8">Verificando áreas de atuação...</div>;

  return (
    <Card className="max-w-3xl mx-auto border-none shadow-none md:border md:shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Novo Report Semanal</CardTitle>
        <CardDescription>Semana Fiscal: <span className="font-bold text-primary">{isoWeek}</span></CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Combo Box Área de Atuação */}
        <div className="space-y-2">
           <p className="text-sm font-medium">Área Destino</p>
           {userAreas.length === 0 ? (
               <div className="text-destructive text-sm font-bold">Você não está vinculado a nenhuma área. Contate um gestor.</div>
           ) : (
               <SimpleSelect
                 value={selectedArea}
                 onValueChange={(val) => val && setSelectedArea(val)}
                 options={userAreas.map(ua => ({ value: ua.areaId, label: ua.area.name }))}
                 placeholder="Selecione sua Área..."
                 className="w-full"
               />
           )}
        </div>

        {/* Instância do Editor Tiptap */}
        <div className="space-y-2">
            <p className="text-sm font-medium">Descrição do Progresso</p>
            <EditorContent editor={editor} className="bg-background" />
        </div>

        {/* Zona do Anexo R2 */}
        <div className="space-y-4">
             <div className="flex justify-between items-center bg-muted/50 p-4 rounded-md border border-dashed">
                 <div>
                     <p className="font-medium text-sm">Arquivos e Evidências</p>
                     <p className="text-xs text-muted-foreground">Vídeos MP4, Fotos ou PDFs (Dica: R2 aceita GBs!)</p>
                 </div>
                 <div>
                    <Button variant="outline" size="sm" className="relative cursor-pointer">
                        <Paperclip className="h-4 w-4 mr-2" /> Anexar
                        <input 
                          type="file" multiple 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleFileSelection}
                          accept="video/mp4, image/png, image/jpeg, application/pdf"
                          disabled={isSubmitting}
                        />
                    </Button>
                 </div>
             </div>

             {/* Fila de Progresso Visual dos Arquivos */}
             {filesToUpload.length > 0 && (
                <div className="space-y-3 pt-2">
                    {filesToUpload.map((item, idx) => (
                        <div key={idx} className="border p-3 rounded-md text-sm bg-background">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium truncate max-w-[200px]">{item.file.name}</span>
                                {isSubmitting ? (
                                    <span className="text-xs text-primary font-bold">{item.progress}%</span>
                                ) : (
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFile(idx)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <Progress value={item.progress} className="h-2" />
                        </div>
                    ))}
                </div>
             )}
        </div>

        <Button 
          className="w-full mt-6" 
          size="lg" 
          disabled={!selectedArea || isSubmitting || userAreas.length === 0}
          onClick={handleSubmit}
        >
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando Tráfego e Salvando...</> : 'Enviar Relatório do Grupo'}
        </Button>

      </CardContent>
    </Card>
  );
}
