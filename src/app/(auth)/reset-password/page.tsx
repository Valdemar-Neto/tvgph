'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, ChevronRight, Loader2, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CircuitBackground } from '@/components/auth/CircuitBackground';

function ResetPasswordForm({
  focusedField,
  setFocusedField
}: {
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid recovery token');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      if (res.ok) {
        toast.success('Protocol password updated successfully');
        router.push('/login');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update key');
      }
    } catch {
      toast.error('GPH Network link failure');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-red-500 font-bold uppercase tracking-widest text-sm">Error: Null Token</div>
        <p className="text-slate-400 text-sm">This reset link has expired or is invalid.</p>
        <Button
          onClick={() => router.push('/forgot-password')}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-8"
        >
          Return to Recovery
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">New Access Key</Label>
        <div className="relative group">
          <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'password' ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300")} />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="pl-12 h-16 !bg-slate-900/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 rounded-2xl transition-all"
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Confirm Access Key</Label>
        <div className="relative group">
          <KeyRound className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'confirm' ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300")} />
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            required
            className="pl-12 h-16 !bg-slate-900/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 rounded-2xl transition-all"
            onFocus={() => setFocusedField('confirm')}
            onBlur={() => setFocusedField(null)}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-base transition-all duration-300 shadow-xl shadow-blue-500/20 group relative overflow-hidden active:scale-[0.98]"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Apply New Protocol <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-white/20 skew-x-[45deg] group-hover:left-[150%] transition-all duration-700 ease-in-out" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isFormHovered, setIsFormHovered] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden relative font-mono selection:bg-blue-500/30 px-4">
      <CircuitBackground dark={false} />

      <div
        className="w-full max-w-md relative z-20 transition-all duration-700"
        onMouseEnter={() => setIsFormHovered(true)}
        onMouseLeave={() => setIsFormHovered(false)}
      >
        <div className={cn(
          "relative rounded-[32px] p-8 md:p-10 bg-[#030712] backdrop-blur-2xl border border-blue-500/30 ring-1 ring-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden dark transition-all duration-700",
          (isFormHovered || focusedField) ? "border-blue-500/50 shadow-blue-500/20" : ""
        )}>

          {/* Top Animated Border Line */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-[2px] z-20 overflow-hidden transition-all duration-500",
              (isFormHovered || focusedField) ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            )}
          >
            <div className={cn(
              "w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent",
              (isFormHovered || focusedField) ? "animate-[shimmer_2s_infinite_linear]" : ""
            )} />
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">Finalize Reset</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Establish your new encryption access key.</p>
          </div>

          <Suspense fallback={<div className="text-blue-400 animate-pulse">Loading recovery protocol...</div>}>
            <ResetPasswordForm
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />
          </Suspense>
        </div>
      </div>
      <style jsx global>{`
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
