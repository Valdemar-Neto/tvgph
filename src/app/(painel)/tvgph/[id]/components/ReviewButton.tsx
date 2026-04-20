'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { reviewReportAction } from '@/app/actions/manager';
import { toast } from 'sonner';

export function ReviewButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleReview() {
    setLoading(true);
    const res = await reviewReportAction(reportId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Report marcado como revisado!');
    }
    setLoading(false);
  }

  return (
    <Button 
      onClick={handleReview} 
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      Marcar como Revisado
    </Button>
  );
}
