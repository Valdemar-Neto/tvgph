'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, CalendarIcon, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { TaskData } from './KanbanCard';
import Image from 'next/image';

interface CreateTaskDialogProps {
  areaId: string;
  members: { id: string; name: string; avatarUrl: string | null }[];
  onClose: () => void;
  onCreated: (task: TaskData) => void;
}

export function CreateTaskDialog({ areaId, members, onClose, onCreated }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          areaId,
          assigneeId: assigneeId || undefined,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        onCreated(data.task);
        toast.success('Task created in BACKLOG');
      } else {
        toast.error(data.error || 'Failed to create task');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">New Activity</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              CREATE_TASK_PROTOCOL
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Activity Title
            </Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Organize IoT workshop"
              className="h-11 bg-slate-50 border-slate-100 rounded-xl font-medium focus:bg-white"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Details about what needs to be done..."
              className="bg-slate-50 border-slate-100 rounded-xl font-medium focus:bg-white min-h-[80px] resize-none"
            />
          </div>

          {/* Assignee + Deadline row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <UserPlus className="h-3 w-3" /> Assignee
              </Label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" /> Deadline
              </Label>
              <Input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="h-11 bg-slate-50 border-slate-100 rounded-xl font-medium focus:bg-white"
              />
            </div>
          </div>

          {/* Selected Assignee Preview */}
          {assigneeId && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl">
              <div className="h-6 w-6 rounded-full overflow-hidden bg-slate-100 relative">
                <Image
                  src={members.find(m => m.id === assigneeId)?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assigneeId}`}
                  alt="Assignee"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-bold text-primary">
                Assigned to {members.find(m => m.id === assigneeId)?.name}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl h-10 font-bold text-slate-400 px-5"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-10 bg-primary text-white font-bold px-6 gap-2 shadow-lg shadow-primary/20"
              disabled={saving || !title.trim()}
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Creating...' : 'Add to Backlog'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
