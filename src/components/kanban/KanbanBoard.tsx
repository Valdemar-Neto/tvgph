'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard, TaskData } from './KanbanCard';
import { CreateTaskDialog } from '@/components/kanban/CreateTaskDialog';
import { SprintPlanningDialog } from './SprintPlanningDialog';
import { Inbox, X, PanelRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TaskStatus = 'BACKLOG' | 'DO' | 'DOING' | 'DONE';

interface KanbanBoardProps {
  initialTasks: TaskData[];
  areaId: string;
  areaName: string;
  role: string;
  members: { id: string; name: string; avatarUrl: string | null }[];
}

const ALL_COLUMNS: { id: TaskStatus; accent: string }[] = [
  { id: 'BACKLOG', accent: 'bg-slate-400' },
  { id: 'DO', accent: 'bg-blue-500' },
  { id: 'DOING', accent: 'bg-amber-500' },
  { id: 'DONE', accent: 'bg-emerald-500' },
];

const MAIN_COLUMNS = ALL_COLUMNS.filter(c => c.id !== 'BACKLOG');

export function KanbanBoard({ initialTasks, areaId, areaName, role, members }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBacklogOpen, setIsBacklogOpen] = useState(false);
  const [pendingSprintTask, setPendingSprintTask] = useState<{ activeId: string; overId: string } | null>(null);

  const isManager = ['MANAGER', 'PROFESSOR'].includes(role);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter(t => t.status === status).sort((a, b) => a.position - b.position);

  const findTaskColumn = (taskId: string): TaskStatus | undefined => {
    return tasks.find(t => t.id === taskId)?.status;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumn = findTaskColumn(activeId);
    const overColumn = ALL_COLUMNS.find(c => c.id === overId)?.id || findTaskColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setTasks(prev => {
      return prev.map(t => {
        if (t.id === activeId) return { ...t, status: overColumn as TaskStatus };
        return t;
      });
    });
  };

  const commitMove = async (activeId: string, overId: string, updatedTasksState?: TaskData[]) => {
    const currentTasks = updatedTasksState || tasks;
    const activeColumn = findTaskColumn(activeId);
    const overColumn = ALL_COLUMNS.find(c => c.id === overId)?.id || findTaskColumn(overId);

    if (!activeColumn || !overColumn) return;

    let finalTasks = currentTasks;

    setTasks(prev => {
      const columnTasks = prev.filter(t => t.status === overColumn);
      const activeIndex = columnTasks.findIndex(t => t.id === activeId);
      const overIndex = columnTasks.findIndex(t => t.id === overId);

      let reordered = columnTasks;
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        reordered = arrayMove(columnTasks, activeIndex, overIndex);
      }

      const updatedPositions = reordered.map((t, idx) => ({ ...t, position: idx }));
      const otherTasks = prev.filter(t => t.status !== overColumn);

      finalTasks = [...otherTasks, ...updatedPositions];
      return finalTasks;
    });

    try {
      const updatedColumnTasks = finalTasks
        .filter(t => t.status === overColumn || t.id === activeId)
        .map((t, idx) => ({
          id: t.id,
          status: t.id === activeId ? overColumn : t.status,
          position: idx,
        }));

      await fetch('/api/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: updatedColumnTasks }),
      });
    } catch {
      toast.error('Failed to save task position');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const task = tasks.find(t => t.id === activeId);
    if (!task) return;

    const originalStatus = activeTask?.status;
    const overColumn = ALL_COLUMNS.find(c => c.id === overId)?.id || findTaskColumn(overId);

    if (originalStatus === 'BACKLOG' && overColumn && overColumn !== 'BACKLOG') {
      if (!task.assignee || !task.deadline) {
        setPendingSprintTask({ activeId, overId });
        return;
      }
    }

    commitMove(activeId, overId);
  };

  const handleSprintConfirm = async (taskId: string, assigneeId: string, deadline: string) => {
    if (!pendingSprintTask) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId, deadline }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedTasksState = tasks.map(t => t.id === taskId ? data.task : t);
        setTasks(updatedTasksState);
        
        commitMove(pendingSprintTask.activeId, pendingSprintTask.overId, updatedTasksState);
        setPendingSprintTask(null);
        toast.success('Task planned for Sprint');
      } else {
        toast.error('Failed to update task');
      }
    } catch {
      toast.error('Connection error');
    }
  };

  const handleSprintCancel = () => {
    if (!pendingSprintTask) return;
    setTasks(prev => prev.map(t => t.id === pendingSprintTask.activeId ? { ...t, status: 'BACKLOG' } : t));
    setPendingSprintTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success('Task removed');
      } else {
        toast.error('Failed to delete task');
      }
    } catch {
      toast.error('Connection error');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-160px)] gap-6 relative overflow-hidden">
      <div className="flex-none flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {areaName}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Sprint management and active execution board.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBacklogOpen(!isBacklogOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all font-bold text-[11px] uppercase tracking-wider",
              isBacklogOpen 
                ? "bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-800/20" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            <PanelRight className="h-4 w-4" />
            Backlog
            <span className="ml-1 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md text-[9px]">{getTasksByStatus('BACKLOG').length}</span>
          </button>
          
          <div className="h-6 w-px bg-slate-200 mx-1" />

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[11px] font-extrabold text-amber-600">{getTasksByStatus('DOING').length}</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Active</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-extrabold text-emerald-600">{getTasksByStatus('DONE').length}</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Done</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative flex gap-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-3 gap-4 h-full pb-2 flex-1 transition-all duration-300",
            isBacklogOpen ? "opacity-40 pointer-events-none md:opacity-100 md:pointer-events-auto md:pr-[340px] lg:pr-[380px]" : ""
          )}>
            {MAIN_COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.id}
                tasks={getTasksByStatus(col.id)}
                accentColor={col.accent}
                onDeleteTask={handleDeleteTask}
                isManager={isManager}
              />
            ))}
          </div>

          <div className={cn(
            "absolute top-0 right-0 bottom-0 w-[320px] lg:w-[360px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out z-40 p-4 pb-6 flex flex-col rounded-l-3xl",
            isBacklogOpen ? "translate-x-0" : "translate-x-full"
          )}>
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-slate-800">
                <Inbox className="h-5 w-5" />
                <h2 className="font-extrabold text-sm uppercase tracking-widest">Backlog</h2>
              </div>
              <button 
                onClick={() => setIsBacklogOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 min-h-0 relative -mx-4 px-4">
              <KanbanColumn
                id="BACKLOG"
                title="BACKLOG"
                tasks={getTasksByStatus('BACKLOG')}
                accentColor="bg-slate-400"
                onDeleteTask={handleDeleteTask}
                onAddTask={() => setIsCreateOpen(true)}
                isManager={isManager}
              />
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 opacity-80">
                <KanbanCard task={activeTask} isManager={isManager} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {isCreateOpen && (
        <CreateTaskDialog
          areaId={areaId}
          members={members}
          onClose={() => setIsCreateOpen(false)}
          onCreated={task => setTasks(prev => [...prev, task])}
        />
      )}

      {pendingSprintTask && (
        <SprintPlanningDialog
          task={tasks.find(t => t.id === pendingSprintTask.activeId)!}
          members={members}
          onClose={handleSprintCancel}
          onConfirm={handleSprintConfirm}
        />
      )}
    </div>
  );
}
