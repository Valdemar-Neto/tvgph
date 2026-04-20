import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { MembersTable } from './components/MembersTable';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';
export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  let currentRole = 'MEMBER';
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    currentRole = payload.role;
    if (!['MANAGER', 'PROFESSOR'].includes(payload.role)) redirect('/tvgph');
  } catch {
    redirect('/login');
  }

  const [users, areas] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        userAreas: { include: { area: true } }
      }
    }),
    prisma.area.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
       <Link href="/dashboard">
         <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 -ml-2">
           <ArrowLeft className="h-4 w-4 mr-2" /> Back to Command Center
         </Button>
       </Link>
       
       <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
             <ShieldAlert className="mr-3 h-8 w-8 text-primary" />
             Member Registry (HR)
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
             Approve new registrations, define areas of expertise, and manage permissions. Pending profiles appear at the top.
          </p>
       </div>

       <div className="pt-2">
          <MembersTable users={users} areas={areas} currentRole={currentRole} />
       </div>
    </div>
  );
}
