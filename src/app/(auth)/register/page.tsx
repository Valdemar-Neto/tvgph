'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Lock, CheckCircle2, ChevronRight, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

interface Area {
  id: string;
  name: string;
}

export default function RegistrationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
    } catch (err) {
      toast.error('An unexpected error occurred during registration.');
      setLoading(false);
    }
  }

  const toggleArea = (id: string) => {
    if (selectedAreaIds.includes(id)) {
      setSelectedAreaIds(selectedAreaIds.filter(item => item !== id));
    } else {
      setSelectedAreaIds([...selectedAreaIds, id]);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8fafc] overflow-hidden relative">

      {/* Abstract Background Elements (Subtle) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-slate-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="container relative z-10 mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 px-6 py-12 lg:py-0 min-h-screen">

        {/* Left Section: Branding & Slogan (Identical to Login) */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left duration-1000">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 mb-4">
            <div className="h-40 w-40 md:h-56 md:w-56 lg:h-72 lg:w-72 bg-white rounded-[48px] shadow-2xl shadow-blue-500/10 flex items-center justify-center p-8 border border-slate-100 animate-in zoom-in duration-1000">
              <Image src="/gph-icon.png" alt="GPH Logo" width={300} height={300} className="h-full w-full object-contain" priority unoptimized />
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

        {/* Right Section: Floating Registration Card */}
        <div className="w-full lg:w-[480px] animate-in fade-in zoom-in duration-700 py-10 lg:py-0">
          <div className="bg-slate-950 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
            {/* Glossy Effect */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Join the GPH research ecosystem.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b border-white/5 group/avatar">
                <div
                  className="relative cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={`h-24 w-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${avatarPreview ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-blue-500 hover:bg-slate-900'
                    }`}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
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
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="name"
                    placeholder="Your researcher name"
                    required
                    className="pl-11 h-12 bg-slate-900/50 border-slate-800 focus:border-blue-500/50 text-white placeholder:text-slate-600 rounded-xl transition-all font-medium border-2"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">INSTITUTIONAL E-MAIL</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="researcher@gph.lab"
                    required
                    className="pl-11 h-12 bg-slate-900/50 border-slate-800 focus:border-blue-500/50 text-white placeholder:text-slate-600 rounded-xl transition-all font-medium border-2"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">ACCESS PASSWORD</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    required
                    className="pl-11 h-12 bg-slate-900/50 border-slate-800 focus:border-blue-500/50 text-white placeholder:text-slate-600 rounded-xl transition-all font-medium border-2"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 text-white font-bold text-base hover:bg-blue-500 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] mt-4 group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Register at GPH <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
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
    </div>
  );
}
