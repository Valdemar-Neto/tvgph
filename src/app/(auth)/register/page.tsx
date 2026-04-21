'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Lock, CheckCircle2, ChevronRight, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CircuitBackground } from '@/components/auth/CircuitBackground';
import { motion } from 'framer-motion';

interface Area {
  id: string;
  name: string;
}

export default function RegistrationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [, setAreas] = useState<Area[]>([]);
  const [selectedAreaIds,] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isFormHovered, setIsFormHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large. Max 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    try {
      const presignRes = await fetch('/api/reports/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `avatars/${Date.now()}-${file.name}`,
          contentType: file.type,
          isAvatar: true
        })
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok) throw new Error(presignData.error);

      const uploadRes = await fetch(presignData.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!uploadRes.ok) throw new Error('Failed to upload to storage');

      const publicUrl = `https://${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${presignData.objectKey}`;
      setAvatarUrl(publicUrl);
      toast.success('Profile picture ready!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload profile picture.');
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    async function fetchAreas() {
      try {
        const res = await fetch('/api/areas');
        if (res.ok) {
          const data = await res.json();
          setAreas(data);
        }
      } catch (err) {
        console.error('Failed to load areas', err);
      }
    }
    fetchAreas();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (isUploading) {
      toast.warning('Please wait for the photo to finish uploading.');
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
          areaIds: selectedAreaIds,
          avatarUrl // Secure Cloudflare R2 link
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Registration pending approval from laboratory management.');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      toast.error('An unexpected error occurred during registration.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden relative font-mono selection:bg-blue-500/30">

      {/* TECH GENERATIVE BACKGROUND */}
      <CircuitBackground dark={false} />

      {/* Main Container */}
      <div className="container relative z-10 mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 px-6 py-12 lg:py-0 min-h-screen">

        {/* Left Section: Branding & Slogan */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
          <motion.div
            className="relative"
            animate={{
              scale: (isFormHovered || focusedField) ? 1.2 : 1,
              filter: (isFormHovered || focusedField)
                ? "drop-shadow(0 0 70px rgba(59,130,246,0.3))"
                : "drop-shadow(0 0 50px rgba(59,130,246,0.1))"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="h-40 w-40 md:h-56 md:w-56 lg:h-64 lg:w-64 bg-[#030712] backdrop-blur-xl rounded-[48px] flex items-center justify-center p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
              <Image src="/gph-icon.png" alt="GPH Logo" width={300} height={300} className="h-full w-full object-contain relative z-10 brightness-0 invert" priority unoptimized />
            </div>
          </motion.div>

          <div className="space-y-6 max-w-[520px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: focusedField ? 120 : 60 }}
              className="h-1 bg-blue-600 rounded-full mx-auto lg:mx-0 shadow-[0_0_15px_rgba(37,99,235,0.8)]"
            />

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic drop-shadow-sm">
              GPH <span className="text-blue-500">Report</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed tracking-tight">
              Track your <span className="text-slate-900 font-black italic uppercase tracking-tighter">evolution</span>,
              analyze your <span className="text-slate-900 font-black italic uppercase tracking-tighter">reports</span> and
              master your <span className="text-slate-900 font-black italic uppercase tracking-tighter">projects</span> in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 rounded-full text-white/70 text-[9px] font-black uppercase tracking-[0.3em]">
            <div className={cn("h-1.5 w-1.5 rounded-full", focusedField ? "bg-blue-400 animate-ping" : "bg-slate-700")} />
            <span>Encrypted Research Protocol Active</span>
          </div>
        </div>

        {/* Right Section: High-End Glassmorphism Form Card */}
        <motion.div
          className="w-full lg:w-[480px] relative z-20"
          initial={{ opacity: 1, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
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
                  x: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              />
            </motion.div>
            <motion.div
              className="absolute top-0 left-0 right-0 h-[4px] bg-blue-500/20 blur-sm z-20"
              initial={{ opacity: 0 }}
              animate={{
                opacity: (isFormHovered || focusedField) ? 1 : 0
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Ambient Corner Glows */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full" />

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Join the GPH research ecosystem.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b border-white/5 group/avatar">
                <div
                  className="relative cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={`h-24 w-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${avatarPreview ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-blue-500 hover:bg-slate-900'
                    }`}>
                    {avatarPreview ? (
                      <div className="h-full w-full relative">
                        <Image src={avatarPreview} alt="Preview" fill unoptimized={true} className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-500 group-hover/avatar:text-blue-400">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  {avatarUrl && !isUploading && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full shadow-lg border-2 border-slate-950">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Profile Photo</span>
                  <span className="text-[10px] text-slate-500 font-medium">PNG or JPG up to 2MB</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-blue-400 font-bold uppercase mt-2 hover:underline"
                  >
                    Select Image
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">FULL NAME</Label>
                <div className="relative group">
                  <UserIcon className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'name' ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-slate-400 group-hover:text-slate-300")} />
                  <Input
                    id="name"
                    placeholder="Your researcher name"
                    required
                    className="pl-11 h-16 !bg-slate-900/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all font-medium text-sm relative z-10"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">INSTITUTIONAL E-MAIL</Label>
                <div className="relative group">
                  <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'email' ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-slate-400 group-hover:text-slate-300")} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="researcher@gph.lab"
                    required
                    className="pl-11 h-16 !bg-slate-900/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all font-medium text-sm relative z-10"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">ACCESS PASSWORD</Label>
                <div className="relative group">
                  <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 z-50", focusedField === 'password' ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-slate-400 group-hover:text-slate-300")} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    required
                    className="pl-11 h-16 !bg-slate-900/50 backdrop-blur-sm border-slate-800/60 focus:border-blue-500/50 !text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all font-medium text-sm relative z-10"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
                    Register at GPH <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    {/* Glossy Button Shine */}
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
        </motion.div>
      </div>
    </div>
  );
}
