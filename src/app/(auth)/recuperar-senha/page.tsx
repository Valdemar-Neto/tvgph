'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
        toast.error('Ocorreu um erro ao processar a solicitação.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success('Link enviado para o seu e-mail!');
    } catch (err) {
      toast.error('Erro de conexão ao enviar e-mail.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Esqueceu a Senha?</CardTitle>
          <CardDescription>Vamos enviar um link blindado ao seu e-mail de cadastro.</CardDescription>
        </CardHeader>
        <CardContent>
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de Acesso</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Buscando conta...' : 'Enviar Link de Resgate'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Se este e-mail ({email}) estiver registrado na plataforma, você receberá o link em breve.
              </p>
              <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                Voltar ao Login
              </Button>
            </div>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex justify-center border-t p-4">
            <Link href="/login" className="text-sm text-primary hover:underline">
              Voltar e fazer login
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
