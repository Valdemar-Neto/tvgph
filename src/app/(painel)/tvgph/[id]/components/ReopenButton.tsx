'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { reopenReportAction } from '@/app/actions/manager';

interface ReopenButtonProps {
  reportId: string;
}

export function ReopenButton({ reportId }: ReopenButtonProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleReopen() {
    if (!confirm('Do you want to reopen this report for editing by the member?')) return;

    setIsPending(true);
    try {
      const res = await reopenReportAction(reportId);
      if (res.success) {
        toast.success('Report reopened successfully.');
      } else {
        toast.error(res.error || 'Error reopening report.');
      }
    } catch {
      toast.error('Connection error.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/10"
      onClick={handleReopen}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <RotateCcw className="h-4 w-4 mr-2" />
      )}
      REOPEN EDITION
    </Button>
  );
}
