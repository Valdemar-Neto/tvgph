import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('deve carregar a página de login com sucesso', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar título da página ou elementos principais
    await expect(page).toHaveTitle(/TvGPH/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
