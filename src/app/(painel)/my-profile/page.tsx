'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Pencil, Save, UserCircle, KeyRound, ArrowRight, Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface UserArea {
  area: {
    name: string;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  bio: string | null;
  avatarUrl: string | null;
  userAreas?: UserArea[];
}

export default function MeuPerfilPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', avatarUrl: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setForm({
            name: data.user.name || '',
            bio: data.user.bio || '',
            avatarUrl: data.user.avatarUrl || ''
          });
        } else {
          toast.error(data.error || 'Failed to load profile');
        }
      } catch {
        toast.error('Connection error while fetching profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

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
      setForm(f => ({ ...f, avatarUrl: publicUrl }));
      toast.success('New profile picture ready!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload profile picture.');
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  async function handleSave() {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, bio: form.bio, avatarUrl: form.avatarUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev: UserProfile | null) => prev ? ({ ...prev, ...data.user }) : data.user);
        setEditing(false);
        setAvatarPreview(null);
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.error || 'Failed to save changes.');
      }
    } catch {
      toast.error('Connection error.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!user) return;
    setForm({
      name: user.name || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || ''
    });
    setAvatarPreview(null);
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-3xl">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-slate-100" />
          <div className="space-y-3">
            <div className="h-6 w-48 bg-slate-100 rounded-lg" />
            <div className="h-4 w-32 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="h-64 rounded-3xl bg-slate-50 border border-slate-100" />
      </div>
    );
  }

  if (!user) return <div className="p-8 text-slate-500 font-medium">No profile data found.</div>;

  const areas = user.userAreas?.map((ua: { area: { name: string } }) => ua.area.name) || [];

  return (
    <div className="max-w-3xl space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <UserCircle className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">User Profile</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-2xl px-1">
            Manage your personal laboratory credentials and research identification metadata.
          </p>
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">

        <div
          className="relative group cursor-pointer h-24 w-24 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="h-full w-full rounded-full bg-slate-50 border-4 border-white shadow-md ring-1 ring-slate-100 overflow-hidden relative">
            <img
              src={avatarPreview || form.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarSelect}
          />

          <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white">
            <Pencil className="h-3 w-3" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            <Badge className={cn(
              "w-fit mx-auto md:mx-0 px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest",
              user.active ? "bg-emerald-50 text-emerald-600 border-none" : "bg-orange-50 text-orange-600 border-none"
            )}>
              {user.active ? 'ACTIVE_ENTITY' : 'PENDING_APPROVAL'}
            </Badge>
          </div>
          <p className="text-slate-400 font-medium">{user.email}</p>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
            <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold px-2 rounded-lg">
              ROLE: {user.role === 'PROFESSOR' ? 'Main Manager' : user.role}
            </Badge>
            {areas.map((area: string) => (
              <Badge key={area} variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] px-2 rounded-lg uppercase">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Info */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">PUBLIC_RESEARCH_METADATA</p>
          </div>

          {!editing ? (
            <Button variant="outline" className="rounded-xl h-10 border-slate-100 bg-white shadow-sm font-bold text-slate-600 gap-2 px-5 hover:bg-slate-50" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" className="rounded-xl h-10 font-bold text-slate-400 hover:text-slate-600 px-4" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button className="rounded-xl h-10 bg-primary text-white font-bold px-5 gap-2 shadow-lg shadow-primary/20" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4" /> {saving ? 'SAVING...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Laboratory Handle</Label>
              {editing ? (
                <Input
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="h-11 bg-slate-50 border-slate-100 focus:bg-white rounded-xl transition-all font-medium"
                />
              ) : (
                <p className="text-base font-bold text-slate-700 h-11 flex items-center px-1">{user.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Access Channel</Label>
              <p className="text-base font-bold text-slate-300 h-11 flex items-center px-1 truncate">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Research Bio & Thesis</Label>
            {editing ? (
              <Textarea
                value={form.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Briefly describe your current research lines..."
                className="bg-slate-50 border-slate-100 focus:bg-white rounded-2xl transition-all font-medium min-h-[120px] resize-none p-4"
              />
            ) : (
              <p className="text-sm font-medium text-slate-500 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-50 border-dashed">
                {user.bio || "No research biography provided yet."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">Security Credentials</h3>
            <p className="text-sm font-medium text-slate-400 mt-0.5">Manage your private encryption keys and access password.</p>
          </div>
        </div>

        <Button variant="outline" className="rounded-xl h-12 border-slate-100 bg-white shadow-sm font-bold text-primary gap-2 px-6 hover:bg-slate-50" onClick={() => window.location.href = '/forgot-password'}>
          Redefine Access Key <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
