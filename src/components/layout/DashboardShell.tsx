'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: React.ReactNode;
  role: string;
  userName: string;
  avatarUrl: string | null;
}

export function DashboardShell({ children, role, userName, avatarUrl }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive Logic */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 flex-shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar role={role} onNavigate={() => setIsSidebarOpen(false)} />
        
        {/* Close button for mobile inside sidebar */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-2 lg:hidden text-slate-400"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        
        <Header 
          userName={userName} 
          avatarUrl={avatarUrl} 
          role={role} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-[1400px] mx-auto w-full p-4 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
