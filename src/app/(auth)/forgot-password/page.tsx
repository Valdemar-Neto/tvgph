'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CircuitBackground } from '@/components/auth/CircuitBackground';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isFormHovered, setIsFormHovered] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        toast.error('An error occurred while processing the request.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success('Link sent to your email!');
    } catch {
      toast.error('Connection error while sending email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden relative font-mono selection:bg-blue-500/30 px-4">
      
      {/* TECH GENERATIVE BACKGROUND */}
      <CircuitBackground dark={false} />

      <motion.div
        className="w-full max-w-md relative z-20"
        initial={{ opacity: 1, y: 0 }}
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
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">Recovery</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">We will send a secure link to your registered email.</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">ACCESS EMAIL</Label>
                <div className="relative group">
                  <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'email' ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-slate-400 group-hover:text-slate-300")} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="researcher@gph.lab"
                    required
                    className="pl-11 h-16 !bg-slate-900/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all font-medium text-sm relative z-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
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
                    Send Recovery Link <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-white/20 skew-x-[45deg] group-hover:left-[150%] transition-all duration-700 ease-in-out" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 text-sm font-medium">
                Check your inbox. If registered, you will receive the recovery protocol link shortly.
              </div>
              <Button 
                variant="outline" 
                className="w-full h-14 border-slate-800 hover:bg-slate-900 text-slate-300 rounded-2xl transition-all"
                onClick={() => router.push('/login')}
              >
                Back to Login
              </Button>
            </div>
          )}

          {!success && (
            <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
              <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                <ArrowLeft className="h-3 w-3" /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
