import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

export interface AuthSession {
  userId: string;
  role: string;
}

/**
 * Recupera e valida a sessão do usuário a partir dos cookies.
 * Pode ser usada tanto em API Routes quanto em Server Actions.
 */
export function getAuthSession(): AuthSession | null {
  const token = cookies().get('auth_token')?.value;
  
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthSession;
    return {
      userId: payload.userId,
      role: payload.role || 'MEMBER'
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}
