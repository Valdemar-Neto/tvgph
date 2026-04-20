# TvGPH - Sistema de Gestão de Atividades de Pesquisa

O **TvGPH** é uma plataforma dedicada à gestão de produtividade e frequência para o grupo de pesquisa GPH. Desenvolvida em Next.js com foco em segurança e transparência.

## 🚀 Tecnologias
- **Framework:** Next.js 14 (App Router)
- **Banco de Dados:** Prisma ORM (PostgreSQL)
- **Autenticação:** JWT com Cookies HttpOnly
- **Storage:** Cloudflare R2 (S3 Compatible)
- **Observabilidade:** Sentry (Monitoramento de Erros)
- **Testes:** Vitest (Unitários) & Playwright (E2E)

## 🛠️ Configuração de Ambiente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` com as seguintes chaves:
   - `DATABASE_URL`: Link do banco PostgreSQL.
   - `JWT_SECRET`: Chave secreta para tokens.
   - `CLOUDFLARE_R2_*`: Credenciais do Storage.
4. Sincronize o banco de dados:
   ```bash
   npx prisma db push
   ```

## 🧪 Testes e Qualidade

- **Testes Unitários:**
  ```bash
  npm run test:unit  # Executa Vitest
  ```
- **Testes E2E (End-to-End):**
  ```bash
  npm run test:e2e   # Executa Playwright (requer npx playwright install)
  ```
- **Documentação da API:**
  Acesse `/docs` para visualizar a especificação interativa via Swagger.

## 📚 Documentação Interna

- [Guia para Membros](./docs/GUIA_MEMBROS.md) - Saiba como enviar seus reports.
- [Guia para Gerentes](./docs/GUIA_GERENTES.md) - Gestão de usuários e aprovações.
- [Análise de Segurança](./security_audit.md) - Auditoria de riscos e mitigação.

## 📄 Licença
Uso exclusivo dos membros do laboratório TvGPH.
