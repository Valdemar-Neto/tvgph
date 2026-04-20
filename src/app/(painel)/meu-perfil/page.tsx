'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Pencil, X, Save, User, Mail, ShieldCheck, MapPin } from 'lucide-react';

export default function MeuPerfilPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '' });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setForm({ name: data.user.name || '', bio: data.user.bio || '' });
        } else {
          toast.error(data.error || 'Erro ao carregar perfil');
        }
      } catch {
        toast.error('Erro de conexão ao buscar perfil');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSave() {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Nome deve ter ao menos 2 caracteres.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, bio: form.bio }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev: any) => ({ ...prev, ...data.user }));
        setEditing(false);
        toast.success('Perfil atualizado com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar alterações.');
      }
    } catch {
      toast.error('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({ name: user.name || '', bio: user.bio || '' });
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-md" />
        <div className="h-4 w-72 bg-muted rounded-md" />
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    );
  }

  if (!user) return <div className="p-8 text-muted-foreground">Nenhum dado encontrado.</div>;

  const initials = user.name?.substring(0, 2).toUpperCase() || '??';
  const areas = user.userAreas?.map((ua: any) => ua.area.name) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
        <p className="text-muted-foreground mt-1">Gerencie suas informações de acesso à TV e Reuniões.</p>
      </div>

      {/* Avatar + Identidade */}
      <div className="flex items-center gap-5 p-6 rounded-xl border bg-card shadow-sm">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-extrabold text-2xl flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={user.active ? 'default' : 'secondary'} className="text-xs">
              {user.active ? 'Ativo' : 'Aguardando Aprovação'}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {user.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Informações Editáveis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            <CardDescription>Altere seu nome e bio visíveis no sistema.</CardDescription>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-3.5 w-3.5 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" /> Nome Completo
            </Label>
            {editing ? (
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Seu nome completo"
                className="max-w-sm"
              />
            ) : (
              <p className="text-base font-medium">{user.name}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Pencil className="h-3.5 w-3.5" /> Bio
            </Label>
            {editing ? (
              <Textarea
                value={form.bio}
                onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Fale um pouco sobre você e sua linha de pesquisa..."
                className="resize-none"
                rows={3}
              />
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed">
                {user.bio || <span className="text-muted-foreground italic">Nenhuma bio cadastrada.</span>}
              </p>
            )}
          </div>

          {/* Email (somente leitura) */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> E-mail de Acesso
            </Label>
            <p className="text-base font-medium text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground/60">O e-mail não pode ser alterado.</p>
          </div>

          {/* Áreas */}
          {areas.length > 0 && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Áreas de Atuação
              </Label>
              <div className="flex flex-wrap gap-2">
                {areas.map((area: string) => (
                  <Badge key={area} variant="secondary" className="font-mono text-xs">{area}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Segurança
          </CardTitle>
          <CardDescription>Altere sua senha de acesso ao sistema.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <Button variant="outline" onClick={() => window.location.href = '/recuperar-senha'}>
            Redefinir Senha
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Você receberá um link no seu e-mail cadastrado para criar uma nova senha.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
