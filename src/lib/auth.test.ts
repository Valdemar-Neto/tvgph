import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthSession } from './auth';
import jwt from 'jsonwebtoken';

const mockGet = vi.fn();

// Mock do next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: mockGet
  })
}));

describe('getAuthSession', () => {
  const SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';

  beforeEach(() => {
    mockGet.mockReset();
  });

  it('deve retornar null se o cookie auth_token não existir', () => {
    mockGet.mockReturnValue(undefined);
    expect(getAuthSession()).toBeNull();
  });

  it('deve retornar a sessão se o token for válido', () => {
    const payload = { userId: 'user-123', role: 'MANAGER' };
    const token = jwt.sign(payload, SECRET);
    
    mockGet.mockReturnValue({ value: token });
    
    const session = getAuthSession();
    expect(session).toEqual(payload);
  });

  it('deve retornar null se o token for inválido', () => {
    mockGet.mockReturnValue({ value: 'token-invalido' });
    expect(getAuthSession()).toBeNull();
  });
});
