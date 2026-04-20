import { describe, it, expect, vi } from 'vitest';
import { getAuthSession } from './auth';
import jwt from 'jsonwebtoken';

// Mock do next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn()
  }))
}));

import { cookies } from 'next/headers';

describe('getAuthSession', () => {
  // Use o mesmo fallback ou o valor real do env carregado pelo Vitest
  const SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

  it('deve retornar null se o cookie auth_token não existir', () => {
    (cookies as any)().get.mockReturnValue(undefined);
    expect(getAuthSession()).toBeNull();
  });

  it('deve retornar a sessão se o token for válido', () => {
    const payload = { userId: 'user-123', role: 'MANAGER' };
    const token = jwt.sign(payload, SECRET);
    
    (cookies as any)().get.mockReturnValue({ value: token });
    
    const session = getAuthSession();
    expect(session).toEqual(payload);
  });

  it('deve retornar null se o token for inválido', () => {
    (cookies as any)().get.mockReturnValue({ value: 'token-invalido' });
    expect(getAuthSession()).toBeNull();
  });
});
