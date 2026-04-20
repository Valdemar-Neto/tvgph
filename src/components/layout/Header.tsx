'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, Clock, MousePointer2, X as CloseIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getPendingReportsAction } from '@/app/actions/manager';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface PendingReport {
  id: string;
  title: string;
  authorName: string;
  areaName: string;
  isoWeek: string;
}

export function Header({ userName, avatarUrl, role }: { userName?: string, avatarUrl?: string | null, role?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'Felix'}`;
  const isAdmin = role === 'MANAGER' || role === 'PROFESSOR';

  useEffect(() => {
    if (isAdmin) {
      getPendingReportsAction().then((data) => {
        if (data) setPendingReports(data);
      });
    }
  }, [isAdmin]);

  // Debounce search logic
  useEffect(() => {
    // Evitar loop se o valor for igual ao da URL
    if (searchValue === (searchParams.get('q') || '')) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) params.set('q', searchValue);
      else params.delete('q');

      const newQuery = params.toString();
      const targetUrl = newQuery ? `/tvgph?${newQuery}` : '/tvgph';

      if (pathname !== '/tvgph') {
        router.push(targetUrl);
      } else {
        router.replace(newQuery ? `${pathname}?${newQuery}` : pathname);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, router, searchParams, pathname]);

  // Sync state with URL changes (browser back/forward)
  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
  }, [searchParams]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">

      {/* Search Bar */}
      <div className="relative w-full max-w-md group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search reports, members or projects..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-10 bg-slate-50 border-none h-10 w-full rounded-full focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-5">

        {/* Notificações de Reports Pendentes */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => isAdmin && setIsNotifOpen(!isNotifOpen)}
            className={cn(
              "relative p-2 rounded-full transition-all",
              isAdmin ? "text-slate-400 hover:text-primary hover:bg-primary/5" : "text-slate-200 cursor-not-allowed"
            )}
          >
            <Bell className="h-5 w-5" />
            {isAdmin && pendingReports.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full border-2 border-white">
                {pendingReports.length}
              </span>
            )}
          </button>

          {/* Dropdown de Notificações */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">To Review</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">
                  {pendingReports.length} REPORTS
                </Badge>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {pendingReports.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-xs text-slate-400 font-medium">All cleared! No reports pending.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {pendingReports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/tvgph/${report.id}`}
                        onClick={() => setIsNotifOpen(false)}
                        className="flex flex-col p-4 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{report.authorName}</span>
                          <span className="text-[9px] font-mono text-slate-400">{report.isoWeek}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                          {report.title || 'Weekly Synthesis'}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          <Clock className="h-3 w-3" /> {report.areaName}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {pendingReports.length > 0 && (
                <Link href="/dashboard" onClick={() => setIsNotifOpen(false)}>
                  <div className="p-3 bg-slate-50 text-center border-t border-slate-100 group">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors flex items-center justify-center gap-2">
                      OPEN_COMMAND_CENTER <MousePointer2 className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>


        <div className="h-8 w-px bg-slate-100 mx-1" />

        <button className="flex items-center gap-3 p-1 pl-2 hover:bg-slate-50 rounded-full transition-all group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{userName}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">
              {role === 'PROFESSOR' ? 'Main Manager' : role}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
            <img src={displayAvatar} alt="User" className="h-full w-full object-cover" />
          </div>
        </button>
      </div>
    </header>
  );
}
