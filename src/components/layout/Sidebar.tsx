'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut, Tv, User as UserIcon, LayoutDashboard, AlertCircle } from 'lucide-react';
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
      toast.success('Deslogado com sucesso');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Erro ao sair da conta');
    }
  }

  const navLinks = [
    { label: 'TvGPH', href: '/tvgph', icon: Tv },
    { label: 'Meus Reports', href: '/meus-reports', icon: BookOpen },
    { label: 'Meu Perfil', href: '/meu-perfil', icon: UserIcon },
  ];

  if (role === 'MANAGER') {
    navLinks.push({ label: 'Painel Gerencial', href: '/dashboard', icon: LayoutDashboard });
  }

  return (
    <aside className="w-full md:w-64 bg-background border-r flex flex-col justify-between md:h-[calc(100vh)] overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary mb-8">
          TvGPH
        </h1>
        <nav className="space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            
            // Regra mais precisa para saber se o link atual tá ativo ou não
            const exactActive = 
              pathname === link.href || 
              (link.href !== '/dashboard' && pathname.startsWith(link.href)) || 
              (link.href === '/dashboard' && pathname.startsWith('/dashboard'));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  exactActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {(!hasReportedThisWeek && role === 'MEMBER') && (
           <div className="mt-8 p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-md flex flex-col gap-2 animate-in fade-in zoom-in duration-500">
             <div className="flex items-center text-destructive font-bold text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Ação Necessária
             </div>
             <p className="text-xs text-destructive/80 font-medium leading-relaxed">
                Você ainda não enviou seu report desta semana.
             </p>
             <Link href="/tvgph/novo">
                <Button variant="destructive" size="sm" className="w-full mt-2 text-xs font-semibold h-8 uppercase tracking-wider">
                   Escrever agora
                </Button>
             </Link>
           </div>
        )}
      </div>

      <div className="p-6 border-t mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>
      </div>
    </aside>
  );
}
