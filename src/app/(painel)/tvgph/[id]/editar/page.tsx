'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditarReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reportTitle, setReportTitle] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Loading content...' }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch(`/api/reports/${params.id}`);
        if (!res.ok) {
          toast.error('Report not found or access denied.');
          router.replace('/my-reports');
          return;
        }
        const data = await res.json();
        setReportTitle(`${data.report.area?.name || ''} — ${data.report.isoWeek}`);
        editor?.commands.setContent(data.report.content || '');
      } catch {
        toast.error('Failed to load report.');
      } finally {
        setLoading(false);
      }
    }
    if (editor) loadReport();
  }, [editor]);

  async function handleSave() {
    const content = editor?.getHTML();
    if (!content || content === '<p></p>') {
      toast.error('Content cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        toast.success('Report updated successfully!');
        router.push('/my-reports');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save.');
      }
    } catch {
      toast.error('Connection error.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/my-reports">
        <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Reports
        </Button>
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Edit Report</h1>
          {reportTitle && <p className="text-muted-foreground text-sm mt-1">{reportTitle}</p>}
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm text-muted-foreground font-medium">Report Content</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading editor...</div>
          ) : (
            <EditorContent editor={editor} />
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Only textual content can be edited. Original attachments are preserved.
      </p>
    </div>
  );
}
