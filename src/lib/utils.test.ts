import { describe, it, expect } from 'vitest';
import { getISOWeekString } from './utils';

describe('getISOWeekString', () => {
  it('deve retornar a ISO week correta e atual no formato YYYY-WXX', () => {
    // Como a função baseia-se em Date(), vamos testar o formato através de regex
    const currentWeek = getISOWeekString();
    
    // A string deve seguir o padrão: exatamente 4 dígitos - W - exatamente 2 dígitos
    expect(currentWeek).toMatch(/^\d{4}-W\d{2}$/);
  });
  
  // Nota TDD: Em um cenário futuro com mock de Date.now(), 
  // testaríamos as viradas de ano exatas (Ex: Pular do ano 2026 pra 2027 na semana correta).
});
