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
import { Input } from '@/components/ui/input';
import { Paperclip, Loader2, X } from 'lucide-react';

// Utility function to get current ISO Week (Ex: 2026-W16)
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

export default function NewReportPage() {
  const router = useRouter();
  
  const [loadingContext, setLoadingContext] = useState(true);
  const [userAreas, setUserAreas] = useState<UserArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [reportTitle, setReportTitle] = useState('');
  const [isoWeek, setIsoWeek] = useState(getCurrentIsoWeek());
  
  const [filesToUpload, setFilesToUpload] = useState<UploadableFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tiptap Editor Module
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your weekly report detailing what was done, bottlenecks, and next steps...' })
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[250px] p-4 bg-muted/20 border rounded-md',
      },
    },
  });

  // 1. Fetch User Areas
  useEffect(() => {
    async function fetchAreas() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user.userAreas && data.user.userAreas.length > 0) {
          setUserAreas(data.user.userAreas);
          setSelectedArea(data.user.userAreas[0].areaId);
        }
      } catch (err) {
        toast.error('Communication failed.');
      } finally {
        setLoadingContext(false);
      }
    }
    fetchAreas();
  }, []);

  // 2. Handle File Selection
  function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, progress: 0 }));
      setFilesToUpload(prev => [...prev, ...newFiles]);
    }
  }

  function removeFile(index: number) {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  }

  // 3. Orchestrator: Upload to R2 and then submit form to API
  async function handleSubmit() {
    if (!reportTitle.trim()) return toast.warning('Give your report a title.');
    if (!selectedArea) return toast.warning('Select a target area.');
    if (!editor || editor.isEmpty) return toast.warning('Report content cannot be empty.');

    setIsSubmitting(true);
    const finalAttachments: Array<{ type: string; url: string; filename: string; sizeBytes: number }> = [];

    // PHASE A: Direct Upload (Cloudflare R2 via Pre-Signed)
    for (let i = 0; i < filesToUpload.length; i++) {
        const item = filesToUpload[i];
        const { file } = item;

        try {
            const presignRes = await fetch('/api/reports/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, contentType: file.type })
            });
            const presignData = await presignRes.json();

            if (!presignRes.ok) throw new Error(presignData.error);

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
                        let attachmentType = 'IMAGE';
                        if (file.type.includes('video')) attachmentType = 'VIDEO';
                        if (file.type.includes('pdf')) attachmentType = 'PDF';
                        
                        finalAttachments.push({
                            type: attachmentType,
                            url: `https://${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || ''}/${presignData.objectKey}`,
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
            toast.error(`Failed to upload attachment: ${file.name}`);
            setIsSubmitting(false);
            return;
        }
    }

    // PHASE B: Save to Report Table
    try {
        const payload = {
            title: reportTitle,
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
            toast.success('Report submitted successfully!');
            router.push('/my-reports');
        } else {
            toast.error(dataRes.error || 'Error saving to database.');
        }

    } catch (error) {
        toast.error('General error submitting report. Server might be unavailable.');
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loadingContext) return <div className="p-8">Verifying target areas...</div>;

  return (
    <Card className="max-w-3xl mx-auto border-none shadow-none md:border md:shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">New Weekly Report</CardTitle>
        <CardDescription>Fiscal Week: <span className="font-bold text-primary">{isoWeek}</span></CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Report Title */}
        <div className="space-y-2">
           <p className="text-sm font-medium">Report Title</p>
           <Input 
             placeholder="Ex: Circuit Analysis - Board X12" 
             value={reportTitle}
             onChange={(e) => setReportTitle(e.target.value)}
             className="h-11 shadow-sm"
           />
        </div>

        {/* Target Area Selector */}
        <div className="space-y-2">
           <p className="text-sm font-medium">Target Area</p>
           {userAreas.length === 0 ? (
               <div className="text-destructive text-sm font-bold">You are not linked to any area. Contact a manager.</div>
           ) : (
               <SimpleSelect
                 value={selectedArea}
                 onValueChange={(val) => val && setSelectedArea(val)}
                 options={userAreas.map(ua => ({ value: ua.areaId, label: ua.area.name }))}
                 placeholder="Select your Area..."
                 className="w-full"
               />
           )}
        </div>

        {/* Tiptap Editor Instance */}
        <div className="space-y-2">
            <p className="text-sm font-medium">Progress Description</p>
            <EditorContent editor={editor} className="bg-background" />
        </div>

        {/* R2 Attachment Zone */}
        <div className="space-y-4">
             <div className="flex justify-between items-center bg-muted/50 p-4 rounded-md border border-dashed">
                 <div>
                     <p className="font-medium text-sm">Files and Evidence</p>
                     <p className="text-xs text-muted-foreground">MP4 Videos, Images, or PDFs (Note: R2 supports GBs!)</p>
                 </div>
                 <div>
                    <Button variant="outline" size="sm" className="relative cursor-pointer">
                        <Paperclip className="h-4 w-4 mr-2" /> Attach
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

             {/* File Progress Queue */}
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
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing traffic and saving...</> : 'Submit Group Report'}
        </Button>

      </CardContent>
    </Card>
  );
}
