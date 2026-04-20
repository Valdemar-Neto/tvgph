'use client';

import React, { useMemo } from 'react';
import { getISOWeekString, cn } from '@/lib/utils';
import { 
  PlusCircle, 
  CheckCircle2, 
  Flame, 
  Target, 
  BarChart3,
  Calendar
} from 'lucide-react';

interface TimelineGraphProps {
  reports: {
    isoWeek: string;
    status: string;
  }[];
}

export function TimelineGraph({ reports }: TimelineGraphProps) {
  const { weeks, stats } = useMemo(() => {
    const now = new Date();
    const resultWeeks = [];
    let reviewedCount = 0;
    
    // Calcular semanas
    for (let i = 25; i >= 0; i--) {
      const d = new Date(now.getTime());
      d.setDate(d.getDate() - (i * 7));
      const weekStr = getISOWeekString(d);
      
      const weekReports = reports.filter(r => r.isoWeek === weekStr);
      const hasReviewed = weekReports.some(r => r.status === 'REVIEWED');
      const hasSubmitted = weekReports.some(r => r.status === 'SUBMITTED');
      
      if (hasReviewed) reviewedCount++;
      
      // Identificar o mês para o label
      const monthLabel = i === 25 || d.getDate() <= 7 ? 
        d.toLocaleString('en-US', { month: 'short' }).toUpperCase() : null;

      resultWeeks.push({
        weekStr,
        status: hasReviewed ? 'REVIEWED' : hasSubmitted ? 'SUBMITTED' : 'EMPTY',
        monthLabel,
        date: d
      });
    }

    // Calcular Streak
    let activeStreak = 0;
    for (let i = resultWeeks.length - 1; i >= 0; i--) {
      if (resultWeeks[i].status !== 'EMPTY') {
        activeStreak++;
      } else {
        if (i < resultWeeks.length - 1) break; // Só conta se for o final ou contínuo
      }
    }

    const totalSubmissions = reports.length;
    const approvalRate = totalSubmissions > 0 
      ? Math.round((reviewedCount / totalSubmissions) * 100) 
      : 0;

    return { 
      weeks: resultWeeks, 
      stats: { totalSubmissions, approvalRate, activeStreak } 
    };
  }, [reports]);

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Submissions</p>
            <p className="text-xl font-black text-slate-900">{stats.totalSubmissions}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Approval Rate</p>
            <p className="text-xl font-black text-slate-900">{stats.approvalRate}%</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active Streak</p>
            <p className="text-xl font-black text-slate-900">{stats.activeStreak} Weeks</p>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="h-3 w-3" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Research Telemetry (Last 26 Weeks)</h3>
          </div>
          
          <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-tighter text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100" /> EMPTY
            </div>
            <div className="flex items-center gap-1.5 text-primary">
              <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/20 border border-primary/20" /> SUBMITTED
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500/20 border border-emerald-500/20" /> REVIEWED
            </div>
          </div>
        </div>

        <div className="relative bg-slate-50/30 px-6 pb-6 pt-14 rounded-2xl border border-slate-100 overflow-x-auto">
          {/* Month Labels */}
          <div className="flex gap-2 mb-2 min-w-max">
            {weeks.map((w, idx) => (
              <div key={`label-${w.weekStr}`} className="w-5 text-center relative">
                {w.monthLabel && (
                  <span className="text-[9px] font-black text-slate-300 uppercase absolute bottom-0 left-1/2 -translate-x-1/2 mb-1">
                    {w.monthLabel}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="flex gap-2 min-w-max">
            {weeks.map((w) => (
              <div 
                key={w.weekStr} 
                className={cn(
                  "w-5 h-5 rounded-[4px] transition-all duration-300 hover:scale-125 cursor-help relative group border",
                  w.status === 'EMPTY' && "bg-white border-slate-100",
                  w.status === 'SUBMITTED' && "bg-primary border-primary/30 shadow-[0_4px_12px_rgba(29,78,216,0.25)]",
                  w.status === 'REVIEWED' && "bg-emerald-500 border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                )}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 text-white rounded-lg shadow-xl text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                  <div className="font-black text-primary mb-0.5">{w.weekStr}</div>
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[8px] opacity-80">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      w.status === 'EMPTY' ? "bg-slate-500" : w.status === 'SUBMITTED' ? "bg-primary" : "bg-emerald-400"
                    )} />
                    STATUS: {w.status}
                  </div>
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
