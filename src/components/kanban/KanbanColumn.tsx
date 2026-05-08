'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Inbox, ListTodo, Loader, CheckCircle2 } from 'lucide-react';
import { KanbanCard, TaskData } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: TaskData[];
  accentColor: string;
  onDeleteTask?: (id: string) => void;
  onAddTask?: () => void;
  isManager: boolean;
}

const columnConfig: Record<string, { 
  label: string; 
  emptyText: string; 
  icon: React.ElementType; 
  bgClass: string; 
  borderClass: string;
  textClass?: string;
  badgeClass?: string;
  dotClass?: string;
}> = {
  BACKLOG: { 
    label: 'BACKLOG', emptyText: 'No queued activities', icon: Inbox, 
    bgClass: 'bg-slate-50', borderClass: 'border-slate-200' 
  },
  DO: { 
    label: 'TO DO', emptyText: 'No scheduled activities', icon: ListTodo, 
    bgClass: 'bg-blue-600 shadow-md shadow-blue-500/20', borderClass: 'border-blue-700',
    textClass: 'text-white', badgeClass: 'bg-blue-700 text-blue-50 border-blue-800', dotClass: 'bg-white/80'
  },
  DOING: { 
    label: 'IN PROGRESS', emptyText: 'No activities running', icon: Loader, 
    bgClass: 'bg-amber-500 shadow-md shadow-amber-500/20', borderClass: 'border-amber-600',
    textClass: 'text-white', badgeClass: 'bg-amber-600 text-amber-50 border-amber-700', dotClass: 'bg-white/80'
  },
  DONE: { 
    label: 'COMPLETED', emptyText: 'No completed activities', icon: CheckCircle2, 
    bgClass: 'bg-emerald-600 shadow-md shadow-emerald-500/20', borderClass: 'border-emerald-700',
    textClass: 'text-white', badgeClass: 'bg-emerald-700 text-emerald-50 border-emerald-800', dotClass: 'bg-white/80'
  },
};

export function KanbanColumn({
  id,
  title,
  tasks,
  accentColor,
  onDeleteTask,
  onAddTask,
  isManager,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const config = columnConfig[id] || { label: title, emptyText: 'Empty', icon: Inbox, bgClass: 'bg-slate-50', borderClass: 'border-slate-200' };
  const Icon = config.icon;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Column Header */}
      <div className={cn(
        'flex-none flex items-center justify-between mb-3 px-4 py-3 rounded-2xl border',
        config.bgClass, config.borderClass
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn('h-3 w-3 rounded-full shadow-sm', config.dotClass || accentColor)} />
          <h3 className={cn("text-[12px] font-black uppercase tracking-[0.12em]", config.textClass || "text-slate-700")}>
            {config.label}
          </h3>
          <span className={cn("text-[11px] font-extrabold px-2 py-0.5 rounded-lg border shadow-sm", config.badgeClass || "text-slate-500 bg-white border-slate-100")}>
            {tasks.length}
          </span>
        </div>

        {isManager && id === 'BACKLOG' && onAddTask && (
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-0 flex flex-col rounded-2xl border-2 p-3 space-y-3 overflow-y-auto custom-scrollbar transition-all duration-200',
          isOver
            ? 'border-primary bg-primary/5 shadow-inner'
            : 'border-dashed border-slate-200 bg-slate-50/50'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest max-w-[160px] leading-relaxed">
                {config.emptyText}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                isManager={isManager}
                variant={id === 'BACKLOG' ? 'compact' : 'default'}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
