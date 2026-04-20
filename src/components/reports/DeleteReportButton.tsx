'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function DeleteReportButton({ reportId }: { reportId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000); // Auto-reset após 4s
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Report excluído com sucesso.');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao excluir report.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <Button
      variant={confirming ? 'destructive' : 'ghost'}
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className={`h-8 text-xs transition-all ${!confirming ? 'text-muted-foreground hover:text-destructive' : ''}`}
    >
      <Trash2 className="h-3 w-3 mr-1" />
      {loading ? 'Excluindo...' : confirming ? 'Confirmar exclusão' : 'Excluir'}
    </Button>
  );
}
