'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Token não encontrado no link da url.');
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
        toast.error(data.error || 'Erro ao redefinir.');
        setLoading(false);
        return;
      }

      toast.success('Senha trocada! Redirecionando...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      toast.error('Ocorreu um problema ao comunicar com o servidor.');
      setLoading(false);
    }
  }

  if (!token) {
    return <div className="text-center p-8 text-destructive">Token inválido. Solicite novamente.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nova Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="Digite no mínimo 6 caracteres"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Salvando...' : 'Atualizar e Acessar'}
      </Button>
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Nova Senha</CardTitle>
          <CardDescription>Crie uma senha forte para não esquecer novamente!</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Suspense is required when using useSearchParams in Nextjs App router static generation */}
          <Suspense fallback={<div>Carregando link seguro...</div>}>
            <RedefinirSenhaForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
