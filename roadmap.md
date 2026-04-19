# GphReport — Roadmap Completo de Desenvolvimento

> Plataforma web de reports semanais para o grupo de pesquisa em hardware universitário.  
> Substitui o fluxo caótico do WhatsApp por um sistema centralizado, assíncrono e rastreável.

---

## Visão Geral do Projeto

**Nome do projeto:** GphReport / TvGPH  
**Objetivo:** Centralizar os reports semanais dos membros do grupo de pesquisa em hardware, permitindo envio de vídeos, PDFs e textos, além de um dashboard gerencial para controle de presença e frequência nas reuniões.

**Problema resolvido:**
- Reports dispersos no WhatsApp causam desorganização ao longo do tempo
- Impossível rastrear quem falta às reuniões presenciais sem esforço manual
- Arquivos de vídeo e PDF consomem armazenamento pessoal dos celulares dos membros

**Dois tipos de usuário:**
- **Membro:** envia reports semanais por área, visualiza feed do grupo, gerencia seu perfil
- **Gerente:** acessa dashboard de presença, aprova cadastros, monitora frequência e reports

---

## Stack Tecnológico

### Frontend
- **Next.js 14** com App Router e React Server Components
- **TypeScript** — tipagem end-to-end
- **Tailwind CSS** — estilização utilitária
- **shadcn/ui** — componentes base acessíveis
- **Tiptap** — editor rich text (suporte a texto, imagens inline, formatação)
- **React Query (TanStack Query)** — cache e sincronização de dados do servidor
- **Zustand** — estado global leve (sessão do usuário, UI state)

### Backend / API
- **Node.js** com **Fastify** (ou Next.js API Routes para projetos menores)
- **Prisma ORM** — type-safe, migrations versionadas
- **PostgreSQL** — banco de dados relacional principal
- **JWT + bcrypt** — autenticação segura com refresh token
- **Zod** — validação de schemas de entrada e contratos de API
- **Resend** — e-mail transacional (notificações, recuperação de senha)

### Infraestrutura e Storage
- **Vercel** — deploy do frontend (plano hobby gratuito suficiente para o grupo)
- **Railway** — banco PostgreSQL + backend (plano free cobre o volume inicial)
- **Cloudflare R2** — storage de vídeos e PDFs (egress gratuito, custo muito baixo)
- **GitHub Actions** — CI/CD automatizado (lint, testes, deploy)
- **Sentry** — monitoramento de erros em produção

---

## Modelo de Dados (Entidades Principais)

```
User
  id          UUID PK
  name        String
  email       String UNIQUE
  password    String (bcrypt hash)
  role        Enum: MEMBER | MANAGER
  avatarUrl   String?
  bio         String?
  active      Boolean
  createdAt   DateTime

Area
  id          UUID PK
  name        Enum: CURSOS | PROJETOS | EVENTOS | MARKETING

UserArea (tabela de junção — membro pode pertencer a N áreas)
  userId      FK -> User
  areaId      FK -> Area

Report
  id          UUID PK
  authorId    FK -> User
  areaId      FK -> Area
  content     Text (rich text em JSON/HTML)
  isoWeek     String (ex: "2025-W22")
  status      Enum: DRAFT | SUBMITTED | REVIEWED
  createdAt   DateTime
  updatedAt   DateTime

Attachment
  id          UUID PK
  reportId    FK -> Report
  type        Enum: VIDEO | PDF | IMAGE
  url         String (URL do Cloudflare R2)
  filename    String
  sizeBytes   Int

Meeting
  id          UUID PK
  date        DateTime
  title       String
  createdBy   FK -> User

Attendance
  id          UUID PK
  meetingId   FK -> Meeting
  userId      FK -> User
  present     Boolean
  notes       String?
```

**Constraint importante:** `UNIQUE(authorId, areaId, isoWeek)` na tabela Report — evita report duplicado na mesma semana por área.

---

## Arquitetura de Permissões

```
Rota pública:        /login, /cadastro, /recuperar-senha
Rota de membro:      /tvgph/**, /meu-perfil, /meus-reports
Rota de gerente:     /dashboard/**, /presenca/**, /membros/**
```

- Middleware no Next.js lê o JWT de cookie HttpOnly
- Verifica o campo `role` e redireciona para 403 se não autorizado
- Cada endpoint da API também valida o role (nunca confiar só no frontend)
- Novos cadastros ficam pendentes (`active: false`) até aprovação do gerente

---

## Fase 0 — Discovery e Definição

**Duração estimada:** 1–2 semanas  
**Objetivo:** Entender profundamente o problema antes de escrever uma linha de código.

### Tarefas
- [ ] Entrevistar 3–5 membros do grupo sobre dores atuais com o WhatsApp
- [ ] Entrevistar 1–2 gerentes sobre o que precisam enxergar no dashboard
- [ ] Criar mapa de personas (Membro e Gerente) com goals, dores e contexto de uso
- [ ] Escrever user stories priorizadas no formato "Como [persona], quero [ação], para [benefício]"
- [ ] Desenhar wireframes de baixa fidelidade das telas principais (papel ou Figma)
- [ ] Definir MVP mínimo viável (o que é imprescindível para o go-live)
- [ ] Documentar regras de negócio (ex: pode editar report após envio? até quando?)
- [ ] Definir stack tecnológico final e justificar escolhas
- [ ] Criar ERD (diagrama de entidades e relações)
- [ ] Configurar repositório GitHub com estrutura de branches (main, develop, feat/*)

### Entregáveis
- Documento de requisitos (pode ser Notion ou README.md)
- ERD validado
- Wireframes das 9 telas principais
- User stories no backlog (GitHub Projects ou Linear)

---

## Fase 1 — Foundation: Auth e Estrutura Base

**Duração estimada:** 2 semanas  
**Objetivo:** Base sólida do projeto — quem pode entrar, onde pode ir, e com qual identidade.

### Backend
- [ ] Setup do projeto Node.js/Fastify com TypeScript
- [ ] Configurar Prisma com conexão PostgreSQL (Railway)
- [ ] Criar migrations iniciais (User, Area, UserArea)
- [ ] Endpoint `POST /auth/register` — cadastro com hash bcrypt, status pendente
- [ ] Endpoint `POST /auth/login` — retorna JWT + refresh token (cookie HttpOnly)
- [ ] Endpoint `POST /auth/refresh` — renova access token
- [ ] Endpoint `POST /auth/forgot-password` — envia e-mail com link (Resend)
- [ ] Endpoint `POST /auth/reset-password` — valida token e atualiza senha
- [ ] Endpoint `GET /auth/me` — retorna dados do usuário autenticado
- [ ] Middleware de autorização por role (MEMBER, MANAGER)
- [ ] Endpoint `PATCH /users/:id/approve` — gerente aprova novo cadastro
- [ ] Validação de todos os inputs com Zod

### Frontend
- [ ] Setup Next.js 14 com TypeScript, Tailwind CSS, shadcn/ui
- [ ] Configurar React Query e cliente HTTP (axios ou fetch com interceptors)
- [ ] Página `/login` — formulário com validação, feedback de erro
- [ ] Página `/cadastro` — formulário com seleção de área(s)
- [ ] Página `/recuperar-senha` e `/redefinir-senha/:token`
- [ ] Middleware Next.js para guards de rota por role
- [ ] Redirect automático pós-login: MEMBER → /tvgph, MANAGER → /dashboard
- [ ] Layout base com sidebar de navegação (links condicionais por role)
- [ ] Página de perfil `/meu-perfil` — editar nome, bio, foto, senha

### Infra
- [ ] Configurar GitHub Actions: lint + typecheck em cada PR
- [ ] Deploy automático no Vercel (branch main)
- [ ] Banco PostgreSQL no Railway com backup automático habilitado
- [ ] Variáveis de ambiente documentadas no `.env.example`

### Definição de pronto
- Cadastro, login e logout funcionando em produção
- Rotas protegidas por role (gerente não pode ser acessado por membro e vice-versa)
- Perfil editável

---

## Fase 2 — TvGPH: Core de Reports

**Duração estimada:** 3 semanas  
**Objetivo:** A funcionalidade principal — membros enviam seus reports semanais com texto, vídeo e PDF.

### Backend
- [ ] Endpoint `POST /reports` — cria report (texto rich text em JSON)
- [ ] Endpoint `GET /reports` — lista reports com filtros (área, semana, autor)
- [ ] Endpoint `GET /reports/:id` — detalhe de um report
- [ ] Endpoint `PATCH /reports/:id` — edita report (até data da reunião)
- [ ] Endpoint `DELETE /reports/:id` — remove report (só o próprio autor)
- [ ] Endpoint `POST /reports/:id/attachments/presign` — gera presigned URL do R2 para upload direto
- [ ] Endpoint `POST /reports/:id/attachments` — registra attachment após upload confirmado
- [ ] Constraint única isoWeek + authorId + areaId no banco
- [ ] Lógica de cálculo de isoWeek a partir da data atual
- [ ] Gerente pode mudar status do report para REVIEWED

### Frontend
- [ ] Página `/tvgph` — feed cronológico de reports da semana atual
  - Cards por área com nome do autor, data, status
  - CTA "Enviar meu report" se membro ainda não enviou na semana
  - Filtro por área (Cursos / Projetos / Eventos / Marketing)
- [ ] Página `/tvgph/novo` — formulário de criação de report
  - Seleção de área
  - Editor rich text (Tiptap) com barra de formatação
  - Upload de vídeo: input de arquivo, presigned URL, progress bar, preview do nome
  - Upload de PDF: idem, com preview inline do PDF
  - Espaço de escrita livre (Markdown ou rich text)
  - Botão "Salvar rascunho" e "Enviar report"
  - Preview antes de enviar
- [ ] Página `/tvgph/:id` — visualização de report
  - Player de vídeo embutido (tag `<video>` com URL do R2)
  - Preview de PDF inline (`<iframe>` ou react-pdf)
  - Rich text renderizado
  - Indicador de status
- [ ] Página `/meus-reports` — histórico pessoal
  - Filtro por semana e área
  - Indicador de semanas com report enviado / sem envio
  - Link para editar report ainda dentro do prazo

### Definição de pronto
- Membro consegue criar report com texto, vídeo e PDF
- Feed mostra todos os reports da semana com filtro por área
- Upload vai direto para Cloudflare R2 sem passar pelo servidor

---

## Fase 3 — Dashboard Gerencial

**Duração estimada:** 2 semanas  
**Objetivo:** Dar ao gerente visibilidade total sobre presença e engajamento do grupo.

### Backend
- [ ] Endpoint `POST /meetings` — cria nova reunião
- [ ] Endpoint `GET /meetings` — lista reuniões com paginação
- [ ] Endpoint `POST /meetings/:id/attendance` — registra presença em lote (array de {userId, present})
- [ ] Endpoint `GET /meetings/:id/attendance` — lista presença de uma reunião
- [ ] Endpoint `GET /reports/stats` — stats da semana: total enviados, pendentes por área
- [ ] Endpoint `GET /users/:id/attendance-summary` — % de presença de um membro
- [ ] Endpoint `GET /attendance/report` — relatório completo exportável (CSV)

### Frontend
- [ ] Página `/dashboard` — visão macro do gerente
  - Card: total de reports enviados na semana atual
  - Card: % de presença na última reunião
  - Card: membros com report pendente (lista)
  - Gráfico de barras: reports por área na semana
  - Gráfico de linha: frequência de presença ao longo do tempo
- [ ] Página `/dashboard/presenca` — controle de presença
  - Seletor de data da reunião (criar nova ou selecionar existente)
  - Lista de todos os membros ativos com checkbox de presença
  - Salvar presença em lote
  - Histórico de reuniões com % de presença
  - Botão exportar CSV / PDF
- [ ] Página `/dashboard/membros` — gestão de membros
  - Lista de membros com área(s), status, última presença
  - Aprovação de cadastros pendentes
  - Trocar role de membro para gerente
  - Desativar membro inativo
- [ ] Relatório de frequência: tabela cruzada membro × reunião

### Definição de pronto
- Gerente consegue registrar presença de uma reunião em menos de 2 minutos
- Dashboard mostra quem não enviou report na semana em tempo real
- Export de CSV de frequência funcionando

---

## Fase 4 — Polimento e UX Avançada

**Duração estimada:** 2 semanas  
**Objetivo:** Tornar o produto robusto, responsivo e agradável de usar.

### UX / UI
- [ ] Auditoria de todos os estados de loading, erro e lista vazia (empty states)
- [ ] Skeleton screens nas listagens e dashboards
- [ ] Toasts de feedback para todas as ações (envio, erro, sucesso)
- [ ] Responsividade mobile-first em todas as telas (testar em iOS Safari e Android Chrome)
- [ ] Acessibilidade básica: contraste WCAG AA, navegação por teclado, aria-labels

### Funcionalidades
- [ ] Busca de reports por palavra-chave (full-text search no PostgreSQL com `tsvector`)
- [ ] Notificação por e-mail na sexta-feira para membros que ainda não enviaram report da semana
- [ ] Feed global com paginação infinita ou "carregar mais"
- [ ] Indicador visual na sidebar: "Você ainda não enviou o report desta semana"
- [ ] Filtro no feed por área, autor e semana
- [ ] Modo de visualização do report em fullscreen

### Performance
- [ ] Lazy loading de vídeos (não carrega até o usuário clicar)
- [ ] Compressão de imagens de perfil antes do upload
- [ ] Cache de React Query configurado corretamente (staleTime, gcTime)
- [ ] Paginação nos endpoints de listagem (cursor-based ou offset)

---

## Fase 5 — Testes, QA e Lançamento

**Duração estimada:** 1 semana  
**Objetivo:** Estabilizar, documentar e fazer o go-live com o grupo.

### Testes
- [ ] Testes unitários com Vitest nas funções críticas (cálculo de isoWeek, validações, guards)
- [ ] Testes de integração nos endpoints principais (auth, reports, presença)
- [ ] Testes e2e com Playwright:
  - Fluxo completo de cadastro e aprovação
  - Membro cria e envia report
  - Gerente registra presença e exporta relatório
  - Tentativa de acesso indevido (membro tentando acessar /dashboard)

### Documentação
- [ ] README.md com: setup local, variáveis de ambiente, como rodar em dev e produção
- [ ] Guia de uso para membros (como enviar report, formatos aceitos, prazos)
- [ ] Guia de uso para gerentes (como registrar presença, exportar relatório)
- [ ] Documentação da API (pode ser automática com Fastify Swagger)

### Go-live
- [ ] Configurar Sentry no frontend e backend (alertas de erro em produção)
- [ ] Realizar sessão de onboarding com o grupo (demo ao vivo, 20–30 min)
- [ ] Cadastrar todos os membros na plataforma
- [ ] Criar reuniões das próximas 4 semanas no sistema
- [ ] Monitorar os primeiros 7 dias pós-lançamento ativamente

---

## Estimativa de Tempo

| Fase | Descrição | Solo Sênior | Time (2–3 devs) |
|------|-----------|-------------|-----------------|
| 0 | Discovery & Definição | 1–2 semanas | 1 semana |
| 1 | Auth & Estrutura Base | 2 semanas | 1 semana |
| 2 | TvGPH — Core de Reports | 3 semanas | 2 semanas |
| 3 | Dashboard Gerencial | 2 semanas | 1 semana |
| 4 | Polimento & UX Avançada | 2 semanas | 1–2 semanas |
| 5 | Testes, QA & Lançamento | 1 semana | 1 semana |
| **Total** | | **11–13 semanas** | **7–8 semanas** |

**MVP mínimo viável** (para lançar o mais rápido possível):  
Fases 0, 1 e o core da Fase 2 (texto + status) + presença básica da Fase 3 = **5–6 semanas**

---

## Mapa de Telas

### Telas públicas
1. **Login** — e-mail, senha, link para cadastro e recuperação
2. **Cadastro** — nome, e-mail, senha, seleção de área(s), aguarda aprovação
3. **Recuperar senha** — e-mail para link de reset
4. **Redefinir senha** — nova senha + confirmação

### Telas do membro
5. **TvGPH Feed** — feed cronológico dos reports da semana, filtro por área, CTA de envio
6. **Criar report** — seleção de área, editor rich text, upload de vídeo/PDF, preview
7. **Visualizar report** — player de vídeo, preview de PDF, rich text, status
8. **Meus reports** — histórico pessoal com indicador de semanas enviadas/não enviadas
9. **Perfil** — foto, nome, bio, áreas, alteração de senha

### Telas do gerente (acesso restrito)
10. **Dashboard** — cards de métricas, gráficos de reports e presença
11. **Controle de presença** — lista de membros, checkboxes, histórico, export
12. **Gestão de membros** — aprovações pendentes, roles, ativação/desativação

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Upload de vídeo pesado (>500MB) travar o browser | Alto | Presigned URL + upload direto para Cloudflare R2, sem passar pelo servidor |
| Membros não adotarem a plataforma (WhatsApp vicia) | Alto | Onboarding guiado, UX simples, mobile-first, notificação por e-mail |
| Permissões mal configuradas (membro acessar gerência) | Alto | Guards no middleware Next.js + validação de role em cada endpoint da API |
| Custo de storage crescendo com vídeos | Médio | Cloudflare R2 tem egress gratuito; definir limite por upload (ex: 200MB/vídeo) |
| Banco sem backup configurado | Médio | Backup automático no Railway + script de dump semanal |
| Editor rich text com bugs em mobile | Médio | Tiptap tem bom suporte mobile; testar em iOS Safari desde a Fase 2 |
| Report duplicado na mesma semana | Baixo | Constraint única no banco: userId + areaId + isoWeek |

---

## Papéis e Responsabilidades

### Arquiteto de Software
- Definir ERD e relações do banco
- Decisão de stack e infraestrutura
- Guards de rota e fluxo de autenticação
- Estratégia de upload de mídia (presigned URLs)
- Estrutura do repositório (monorepo ou repos separados)
- Contratos de API (schemas Zod / OpenAPI)

### Backend Sênior
- Schema Prisma e migrations
- Todos os endpoints REST (auth, reports, meetings, attendance)
- Middleware de autorização por role
- Geração de presigned URLs para uploads
- Jobs de notificação por e-mail (cron semanal)
- Testes de integração dos endpoints

### Frontend Sênior
- Setup Next.js + Tailwind + shadcn/ui
- Componentes de rich text (Tiptap)
- Player de vídeo embutido e preview de PDF
- Dashboards com gráficos (Recharts ou Chart.js)
- Estados de loading, error e empty em todas as telas
- Testes e2e com Playwright

### UX/UI Sênior
- Wireframes de todas as telas (Figma)
- Design system e tokens (cores, tipografia, espaçamentos)
- Fluxo de onboarding do novo membro
- Hierarquia visual do dashboard gerencial
- Acessibilidade (contraste WCAG AA, foco, aria-labels)
- Protótipo navegável para validação com o grupo

---

## Orientações para Implementação com IA

Ao usar este documento como contexto para uma IA gerar o código, siga esta ordem:

1. **Comece pelo schema Prisma** — peça para gerar o `schema.prisma` completo com todas as entidades, relações, enums e constraints descritos neste documento.

2. **Depois, os endpoints de auth** — `/register`, `/login`, `/refresh`, `/me`, `/forgot-password`, `/reset-password`. Com guards de role.

3. **Em seguida, reports** — CRUD completo + lógica de isoWeek + presigned URL para uploads.

4. **Depois, attendance e meetings** — endpoints de controle de presença e relatório.

5. **Frontend por tela** — peça uma tela por vez, fornecendo o contrato da API correspondente como contexto.

6. **Por último, testes** — peça os testes e2e para os fluxos críticos após as telas estarem prontas.

**Dica:** sempre forneça este documento inteiro como contexto e especifique qual fase/entidade quer implementar. Quanto mais contexto a IA tiver, mais coerente será o código gerado.