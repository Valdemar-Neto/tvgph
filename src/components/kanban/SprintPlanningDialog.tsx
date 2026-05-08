'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarIcon, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TaskData } from './KanbanCard';

interface SprintPlanningDialogProps {
  task: TaskData;
  members: { id: string; name: string; avatarUrl: string | null }[];
  onClose: () => void;
  onConfirm: (taskId: string, assigneeId: string, deadline: string) => Promise<void>;
}

export function SprintPlanningDialog({ task, members, onClose, onConfirm }: SprintPlanningDialogProps) {
  const [assigneeId, setAssigneeId] = useState<string>(task.assignee?.id || '');
  // Default deadline to next week if not set
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const [deadline, setDeadline] = useState(
    task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : nextWeek.toISOString().split('T')[0]
  );
  
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assigneeId) {
      toast.error('An assignee is required for the Sprint');
      return;
    }
    if (!deadline) {
      toast.error('A deadline is required for the Sprint');
      return;
    }

    setSaving(true);
    try {
      await onConfirm(task.id, assigneeId, new Date(deadline).toISOString());
    } catch {
      toast.error('Failed to plan task for sprint');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-amber-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sprint Planning</h2>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-0.5">
              PREPARE_FOR_EXECUTION
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="text-sm font-bold text-slate-800">{task.title}</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {task.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <UserPlus className="h-3 w-3" />
                Assignee
              </Label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="" disabled>Select member</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <CalendarIcon className="h-3 w-3" />
                Deadline
              </Label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !assigneeId || !deadline}
              className="flex-1 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Move to TO DO
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
