import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(areas);
  } catch (error) {
    console.error('Error fetching areas:', error);
    return NextResponse.json({ error: 'Error fetching areas' }, { status: 500 });
  }
}
