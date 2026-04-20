import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    // Remove o cookie seguro do servidor
    cookieStore.delete('auth_token');

    return NextResponse.json({ message: 'Deslogado com sucesso' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao deslogar' }, { status: 500 });
  }
}
