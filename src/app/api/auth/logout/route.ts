import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    // Remove o cookie seguro do servidor
    cookieStore.delete('auth_token');

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Error logging out' }, { status: 500 });
  }
}
