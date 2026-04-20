'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to login');
        setLoading(false);
        return;
      }

      toast.success('Login successful!');
      router.push('/tvgph');
    } catch (err) {
      toast.error('An unexpected error occurred.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8fafc] overflow-hidden relative">

      {/* Abstract Background Elements (Subtle) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-slate-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="container relative z-10 mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 px-6 py-12 lg:py-0 min-h-screen">

        {/* Left Section: Branding & Slogan */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left duration-1000">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 mb-4">
            <div className="h-40 w-40 md:h-56 md:w-56 lg:h-72 lg:w-72 bg-white rounded-[48px] shadow-2xl shadow-blue-500/10 flex items-center justify-center p-8 border border-slate-100 animate-in zoom-in duration-1000">
              <NextImage src="/gph-icon.png" alt="GPH Logo" width={300} height={300} className="h-full w-full object-contain" priority unoptimized />
            </div>
          </div>
          <div className="h-1.5 w-24 bg-blue-600 rounded-full mx-auto lg:mx-0" />

          <div className="max-w-[480px]">
            <p className="text-xl md:text-2xl text-slate-600 font-medium leading-snug">
              Track your <span className="text-slate-900 font-bold underline decoration-blue-500/30 underline-offset-4">evolution</span>,
              analyze your <span className="text-slate-900 font-bold underline decoration-blue-500/30 underline-offset-4">reports</span> and
              master your <span className="text-slate-900 font-bold border-b-4 border-blue-600/10">projects</span> in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 rounded-full text-white/90 text-sm font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all cursor-default">
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="tracking-tight uppercase">High-Performance Research</span>
          </div>
        </div>

        {/* Right Section: Floating Form Card */}
        <div className="w-full lg:w-[460px] animate-in fade-in zoom-in duration-700">
          <div className="bg-slate-950 rounded-[32px] p-8 md:p-12 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
            {/* Glossy Effect */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Enter your credentials to access the platform.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">E-MAIL</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="researcher@gph.lab"
                    required
                    className="pl-11 h-13 bg-slate-900/50 border-slate-800 focus:border-blue-500/50 text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all font-medium border-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">PASSWORD</Label>
                  <Link href="/forgot-password" className="text-[10px] font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-11 h-13 bg-slate-900/50 border-slate-800 focus:border-blue-500/50 text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all font-medium border-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 text-white font-bold text-base hover:bg-blue-500 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 mt-4 group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Access Platform <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-10 text-center text-xs font-semibold text-slate-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-400 font-bold hover:underline underline-offset-4">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
