'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, ChevronRight, Loader2, Camera } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { CircuitBackground } from '@/components/auth/CircuitBackground';

interface Area {
  id: string;
  name: string;
}

export default function RegistrationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [areaId,] = useState('');
  const [, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isFormHovered, setIsFormHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchAreas() {
      try {
        const res = await fetch('/api/areas');
        if (res.ok) {
          const data = await res.json();
          setAreas(data);
        }
      } catch (err) {
        console.error('Failed to fetch areas', err);
      }
    }
    fetchAreas();
  }, []);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large (max 2MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`);
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!areaId) {
      toast.error('Please select a research area');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          areaId,
          avatar: avatarUrl
        })
      });

      if (res.ok) {
        toast.success('Registration successful. Welcome to GPH.');
        router.push('/login');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch {
      toast.error('Network failure. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden relative font-mono selection:bg-blue-500/30">
      <CircuitBackground dark={false} />

      <div className="container relative z-10 mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 px-6 py-12 lg:py-0 min-h-screen">

        {/* Left Section: Branding & Slogan */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
          <div
            className={cn(
              "relative transition-all duration-700 ease-out",
              (isFormHovered || focusedField) ? "scale-110 drop-shadow-[0_0_50px_rgba(59,130,246,0.3)]" : "scale-100 drop-shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            )}
          >
            <div className="h-40 w-40 md:h-56 md:w-56 lg:h-64 lg:w-64 bg-[#030712] backdrop-blur-xl rounded-[48px] flex items-center justify-center p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
              <NextImage src="/gph-icon.png" alt="GPH Logo" width={300} height={300} className="h-full w-full object-contain relative z-10 brightness-0 invert" priority unoptimized />
            </div>
          </div>

          <div className="space-y-6 max-w-[520px]">
            <div
              className={cn(
                "h-1 bg-blue-600 rounded-full mx-auto lg:mx-0 shadow-[0_0_15px_rgba(37,99,235,0.8)] transition-all duration-500",
                focusedField ? "w-[120px]" : "w-[60px]"
              )}
            />

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic drop-shadow-sm">
              GPH <span className="text-blue-600">Report</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed tracking-tight">
              Track your <span className="text-slate-900 font-black italic uppercase tracking-tighter">evolution</span>,
              analyze your <span className="text-slate-900 font-black italic uppercase tracking-tighter">reports</span> and
              master your <span className="text-slate-900 font-black italic uppercase tracking-tighter">projects</span> in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 rounded-full text-white/70 text-[9px] font-black uppercase tracking-[0.3em]">
            <div className={cn("h-1.5 w-1.5 rounded-full transition-all duration-300", focusedField ? "bg-blue-400 animate-ping" : "bg-slate-700")} />
            <span>Encrypted Research Protocol Active</span>
          </div>
        </div>

        {/* Right Section: High-End Glassmorphism Form Card */}
        <div
          className="w-full lg:w-[480px] relative z-20 transition-all duration-700"
          onMouseEnter={() => setIsFormHovered(true)}
          onMouseLeave={() => setIsFormHovered(false)}
        >
          <div className={cn(
            "relative rounded-[32px] p-10 md:p-14 bg-[#030712] backdrop-blur-2xl border border-blue-500/30 ring-1 ring-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden dark transition-all duration-700",
            (isFormHovered || focusedField) ? "border-blue-500/50 shadow-blue-500/20" : ""
          )}>

            {/* Top Animated Border Line */}
            <div className={cn(
              "absolute top-0 left-0 right-0 h-[2px] z-20 overflow-hidden transition-all duration-500",
              (isFormHovered || focusedField) ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            )}>
              <div className={cn(
                "w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent",
                (isFormHovered || focusedField) ? "animate-[shimmer_2s_infinite_linear]" : ""
              )} />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight leading-none uppercase italic">Create Account</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Join the GPH research ecosystem.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b border-white/5 group/avatar">
                <div
                  className="relative cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={cn(
                    "h-24 w-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all",
                    avatarPreview ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-800 bg-slate-900/50 hover:border-blue-500 hover:bg-slate-900"
                  )}>
                    {avatarPreview ? (
                      <NextImage src={avatarPreview} alt="Avatar Preview" fill className="object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-slate-600 group-hover/avatar:text-blue-500 transition-colors" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                  />
                </div>
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RESEARCHER AVATAR</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">FULL NAME</Label>
                <div className="relative group">
                  <User className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'name' ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300")} />
                  <Input
                    id="name"
                    placeholder="Researcher Name"
                    required
                    className="pl-12 h-14 !bg-slate-900/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 rounded-2xl transition-all"
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">E-MAIL</Label>
                <div className="relative group">
                  <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'email' ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300")} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="researcher@gph.lab"
                    required
                    className="pl-12 h-14 !bg-slate-900/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 rounded-2xl transition-all"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">PASSWORD</Label>
                <div className="relative group">
                  <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'password' ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300")} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-12 h-14 !bg-slate-900/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 rounded-2xl transition-all"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm mt-4 transition-all duration-300 shadow-xl shadow-blue-500/20 group relative overflow-hidden active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Access Platform <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-white/20 skew-x-[45deg] group-hover:left-[150%] transition-all duration-700 ease-in-out" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-xs font-semibold text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 font-bold hover:underline underline-offset-4">
                Back to Login
              </Link>
            </p>
          </div>
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
