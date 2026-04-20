'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  FlaskConical,
  Calendar,
  Megaphone,
  Settings,
  LogOut,
  Plus,
  NotebookPen,
  Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SidebarProps {
  role: string;
  hasReportedThisWeek: boolean;
}

export function Sidebar({ role, hasReportedThisWeek }: SidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Disconnected from Laboratory');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Failed to log out');
    }
  }

  const navLinks = [
    { label: 'Feed GPH', href: '/tvgph', icon: Tv },
    { label: 'My Reports', href: '/my-reports', icon: NotebookPen },
    { label: 'Attendance', href: '/attendance', icon: GraduationCap },
    { label: 'Events', href: '/tvgph?area=EVENTOS', icon: Calendar },
    { label: 'Marketing', href: '/tvgph?area=MARKETING', icon: Megaphone },
    { label: 'Settings', href: '/my-profile', icon: Settings },
  ];

  if (['MANAGER', 'PROFESSOR'].includes(role)) {
    navLinks.push({ label: 'Admin Panel', href: '/dashboard', icon: LayoutDashboard });
  }

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col justify-between md:h-screen sticky top-0 overflow-hidden shadow-sm">
      <div className="p-6 flex flex-col h-full">
        {/* Brand Logo */}
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-3 mb-10 px-2 transition-all hover:opacity-80">
          <div className="h-20 w-20 bg-white rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center p-2.5 border border-slate-100">
            <img src="/gph-icon.png" alt="GPH Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.3em] block text-center">Hardware Research Group</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '#' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-primary/5 text-primary'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className={`text-[13px] font-semibold ${isActive ? 'text-primary font-bold' : ''}`}>{link.label}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="mt-auto pt-6 space-y-3">
          <Link href="/tvgph/novo">
            <Button className="w-full h-11 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          </Link>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 h-10 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-xs font-bold"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
