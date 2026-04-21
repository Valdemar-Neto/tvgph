'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, X, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Audit } from '@/lib/telemetry';

interface DeleteReportButtonProps {
  reportId: string;
  authorName?: string;
  likesCount?: number;
  commentsCount?: number;
  variant?: 'detail' | 'card';
  redirectAfterDelete?: boolean;
}


export function DeleteReportButton({
  reportId,
  authorName,
  likesCount = 0,
  commentsCount = 0,
  variant = 'detail',
  redirectAfterDelete = false
}: DeleteReportButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const router = useRouter();

  const shortId = reportId.split('-')[0];
  const safeAuthorName = authorName ? authorName.replace(/\s+/g, '-').toLowerCase() : 'researcher';
  const expectedString = `${safeAuthorName}/report-${shortId}`;

  async function handleDelete() {
    if (confirmationInput !== expectedString) return;

    setIsDeleting(true);
    Audit.log("Starting activity purge", "warning", { reportId, path: expectedString });

    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete report');
      }

      Audit.log("Activity removed successfully", "info", { reportId });
      toast.success('Activity permanently removed.');
      setShowModal(false);

      if (redirectAfterDelete) {
        router.push('/tvgph');
      } else {
        router.refresh();
      }
    } catch {
      Audit.error("Falha na purga de atividade (Delete Report)", { reportId, action: "delete_report" });
      toast.error("Delete failed. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const openModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowModal(true);
    setConfirmationInput('');
  };

  const closeModal = () => {
    if (isDeleting) return;
    setShowModal(false);
  };

  return (
    <>
      {variant === 'card' ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
          onClick={openModal}
          title="Purge activity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="border-rose-500/20 text-rose-500 bg-transparent hover:bg-rose-500/10 hover:border-rose-500/40 text-[9px] font-black uppercase tracking-widest h-8 px-4 gap-2 rounded-lg"
          onClick={openModal}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* GitHub-Style Minimalist Purge Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-[#0d1117] border border-slate-800 rounded-2xl shadow-2xl shadow-black overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimalist Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-200">Delete {expectedString}</span>
              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-8 flex flex-col items-center">
              {/* Centered Identity Icon */}
              <div className="h-16 w-16 text-slate-500/50 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
                  <path d="M4 22V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v18" />
                  <path d="M10 22v-4a2 2 0 1 1 4 0v4" />
                  <path d="M18 11h.01" />
                  <path d="M18 15h.01" />
                  <path d="M10 8h4" />
                </svg>
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-white tracking-tight">{expectedString}</h3>
                <div className="flex items-center justify-center gap-6 text-slate-500 font-bold text-[13px]">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{likesCount} likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{commentsCount} comments</span>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4 pt-4 border-t border-slate-800">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-200 block">
                    To confirm, type &quot;{expectedString}&quot;in the box below
                  </label>
                  <Input
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    className="h-10 bg-[#0d1117] border-rose-500/50 border-2 rounded-lg text-slate-200 focus:ring-0 focus:border-rose-500 transition-all font-mono text-sm px-4"
                    autoFocus
                    disabled={isDeleting}
                  />
                </div>

                <Button
                  className={cn(
                    "w-full h-11 rounded-lg font-bold text-sm transition-all border",
                    confirmationInput === expectedString
                      ? "bg-transparent border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white"
                      : "bg-[#21262d] border-transparent text-slate-500 cursor-not-allowed"
                  )}
                  onClick={handleDelete}
                  disabled={confirmationInput !== expectedString || isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Delete this activity"}
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
