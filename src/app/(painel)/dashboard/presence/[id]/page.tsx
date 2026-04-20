import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AttendanceTable } from './components/AttendanceTable';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';
export const dynamic = 'force-dynamic';

export default async function AttendanceDetailPage({ params }: { params: { id: string } }) {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    if (!['MANAGER', 'PROFESSOR'].includes(payload.role)) redirect('/tvgph');
  } catch {
    redirect('/login');
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
    include: {
       attendance: {
          include: { user: true },
          orderBy: { user: { name: 'asc' } }
       }
    }
  });

  if (!meeting) return notFound();
  
  const dataFormatada = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(meeting.date));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
       <Link href="/dashboard/presence">
         <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 -ml-2">
           <ArrowLeft className="h-4 w-4 mr-2" /> Back to Attendance Sheet
         </Button>
       </Link>
       
       <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center border-b pb-4">
             <Users className="mr-3 h-8 w-8 text-primary" />
             {meeting.title}
          </h1>
          <p className="text-muted-foreground mt-4 font-mono uppercase tracking-wider text-sm">
             Meeting Date: {dataFormatada}
          </p>
       </div>

       <div className="pt-2">
          <AttendanceTable attendances={meeting.attendance} />
       </div>
    </div>
  )
}
