'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CircuitBackground } from '@/components/auth/CircuitBackground';

function ResetPasswordForm({ focusedField, setFocusedField, isFormHovered }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Token not found in the URL link.');
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Error during reset.');
        setLoading(false);
        return;
      }

      toast.success('Password changed! Redirecting...');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      toast.error('A problem occurred while communicating with the server.');
      setLoading(false);
    }
  }

  if (!token) {
    return <div className="text-center p-8 text-destructive bg-red-500/10 rounded-2xl border border-red-500/20 font-bold">Invalid token. Please request again.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">NEW PASSWORD</Label>
        <div className="relative group">
          <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'password' ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-slate-400 group-hover:text-slate-300")} />
          <Input
            id="password"
            type="password"
            placeholder="Enter at least 6 characters"
            required
            className="pl-11 h-16 !bg-slate-950/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all font-medium text-sm relative z-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full h-14 bg-blue-600 text-white font-bold text-base hover:bg-blue-500 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 mt-4 group overflow-hidden relative"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Update and Access <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-white/20 skew-x-[45deg] group-hover:left-[150%] transition-all duration-700 ease-in-out" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const [focusedField, setFocusedField] = useState<string|null>(null);
  const [isFormHovered, setIsFormHovered] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden relative font-mono selection:bg-blue-500/30 px-4">
      
      {/* TECH GENERATIVE BACKGROUND */}
      <CircuitBackground dark={false} />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        onMouseEnter={() => setIsFormHovered(true)}
        onMouseLeave={() => setIsFormHovered(false)}
      >
        <div className="relative rounded-[32px] p-8 md:p-10 bg-[#030712] backdrop-blur-2xl border border-blue-500/30 ring-1 ring-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden dark">
          
          {/* Top Animated Border Line */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-[2px] z-20 overflow-hidden"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: (isFormHovered || focusedField) ? 1 : 0,
              opacity: (isFormHovered || focusedField) ? 1 : 0
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.div 
              className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              animate={{ 
                x: (isFormHovered || focusedField) ? ['-100%', '100%'] : '-100%'
              }}
              transition={{ 
                x: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
            />
          </motion.div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">New Password</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Create a strong protocol password to secure your account.</p>
          </div>

          <Suspense fallback={<div className="text-center p-8 text-blue-400 animate-pulse">Loading secure link...</div>}>
            <ResetPasswordForm 
              focusedField={focusedField} 
              setFocusedField={setFocusedField} 
              isFormHovered={isFormHovered} 
            />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
