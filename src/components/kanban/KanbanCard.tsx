'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface TaskData {
  id: string;
  title: string;
  description?: string | null;
  status: 'BACKLOG' | 'DO' | 'DOING' | 'DONE';
  position: number;
  deadline?: string | null;
  createdBy: { id: string; name: string; avatarUrl: string | null };
  assignee?: { id: string; name: string; avatarUrl: string | null } | null;
  area: { id: string; name: string };
}

interface KanbanCardProps {
  task: TaskData;
  onDelete?: (id: string) => void;
  isManager: boolean;
  variant?: 'default' | 'compact';
}

const stickyThemes: Record<string, { bg: string, fold: string, text: string }> = {
  BACKLOG: { bg: '#fef08a', fold: '#fde047', text: 'text-yellow-950' },
  DO: { bg: '#bae6fd', fold: '#7dd3fc', text: 'text-sky-950' },
  DOING: { bg: '#fed7aa', fold: '#fdba74', text: 'text-orange-950' },
  DONE: { bg: '#bbf7d0', fold: '#86efac', text: 'text-emerald-950' },
};

export function KanbanCard({ task, onDelete, isManager, variant = 'default' }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isManager });

  const theme = stickyThemes[task.status] || stickyThemes.BACKLOG;
  const cutSize = variant === 'compact' ? 12 : 16;
  const foldSize = variant === 'compact' ? 17 : 23;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: `linear-gradient(-45deg, transparent ${cutSize}px, ${theme.bg} 0)`
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';
  const isDone = task.status === 'DONE';

  const formatDeadline = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (variant === 'compact') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...(isManager ? attributes : {})}
        {...(isManager ? listeners : {})}
        className={cn(
          'relative p-2.5 rounded-sm shadow-sm transition-all duration-200 group flex items-start gap-2 isolate',
          theme.text,
          isManager && 'cursor-grab active:cursor-grabbing',
          isDragging && 'shadow-2xl scale-[1.05] ring-2 ring-black/10 z-50 opacity-95 rotate-2',
          !isDragging && 'hover:shadow-md hover:-translate-y-0.5'
        )}
      >
        {/* Curved Peel Shadow */}
        <div className="absolute bottom-1 right-2 left-2 h-4 shadow-[0_6px_8px_rgba(0,0,0,0.15)] rounded-[50%] z-[-1] pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />

        {/* Folded Corner */}
        <div 
          className="absolute bottom-0 right-0 rounded-tl-sm pointer-events-none"
          style={{ 
            width: foldSize, 
            height: foldSize, 
            background: `linear-gradient(-45deg, transparent 50%, ${theme.fold} 50%)`,
            filter: 'drop-shadow(-2px -2px 2px rgba(0,0,0,0.15))'
          }}
        />

        <div className="flex-1 min-w-0 py-0.5 z-10">
          <h4 className="text-[12px] font-bold opacity-90 truncate leading-snug">
            {task.title}
          </h4>
        </div>

        {isManager && onDelete && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 shrink-0 z-10 hover:bg-black/10 transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isManager ? attributes : {})}
      {...(isManager ? listeners : {})}
      className={cn(
        'relative p-4 rounded-sm shadow-sm transition-all duration-200 group isolate',
        theme.text,
        isManager && 'cursor-grab active:cursor-grabbing',
        isDragging && 'shadow-2xl scale-[1.05] ring-2 ring-black/10 z-50 opacity-95 rotate-2',
        isDone && 'opacity-70',
        !isDragging && 'hover:shadow-md hover:-translate-y-1 hover:scale-[1.01]'
      )}
    >
      {/* Curved Peel Shadow */}
      <div className="absolute bottom-1 right-3 left-3 h-4 shadow-[0_8px_12px_rgba(0,0,0,0.15)] rounded-[50%] z-[-1] pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />

      {/* Folded Corner */}
      <div 
        className="absolute bottom-0 right-0 rounded-tl-[4px] pointer-events-none"
        style={{ 
          width: foldSize, 
          height: foldSize, 
          background: `linear-gradient(-45deg, transparent 50%, ${theme.fold} 50%)`,
          filter: 'drop-shadow(-2px -2px 3px rgba(0,0,0,0.15))'
        }}
      />

      {/* Header: Actions */}
      <div className="flex items-center justify-end mb-1 relative z-10">
        {isManager && onDelete && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Title */}
      <h4 className={cn(
        'text-[13px] font-bold leading-snug mb-1.5 opacity-90 relative z-10',
        isDone && 'line-through opacity-60'
      )}>
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-[11px] font-medium line-clamp-2 mb-3 leading-relaxed opacity-75 relative z-10">
          {task.description}
        </p>
      )}

      {/* Footer: Assignee + Deadline */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/10 relative z-10">
        {/* Assignee */}
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full overflow-hidden bg-black/5 relative ring-2 ring-white/30 shadow-sm">
              <Image
                src={task.assignee.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.name}`}
                alt={task.assignee.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <span className="text-[11px] font-bold opacity-80 truncate max-w-[90px]">
              {task.assignee.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 opacity-60">
            <div className="h-6 w-6 rounded-full bg-black/5 flex items-center justify-center">
              <User className="h-3 w-3" />
            </div>
            <span className="text-[11px] font-medium">Unassigned</span>
          </div>
        )}

        {/* Deadline */}
        {task.deadline && (
          <div className={cn(
            'flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg',
            isOverdue
              ? 'text-red-700 bg-red-100/50'
              : isDone
                ? 'opacity-60 bg-black/5'
                : 'bg-black/5 opacity-80'
          )}>
            <Calendar className="h-3 w-3" />
            {formatDeadline(task.deadline)}
          </div>
        )}
      </div>
    </div>
  );
}
