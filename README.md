# Eco Transcrição IA

> Sistema SaaS para gestores de tráfego automatizarem o agendamento de reuniões mensais com clientes através de IA de voz e automação via WhatsApp.

---

## 📑 Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Modelo de Dados](#5-modelo-de-dados)
6. [Edge Functions (Backend)](#6-edge-functions-backend)
7. [Frontend](#7-frontend)
8. [Multi-Equipe (Tenancy)](#8-multi-equipe-tenancy)
9. [Integrações Externas](#9-integrações-externas)
10. [Fluxos de Negócio](#10-fluxos-de-negócio)
11. [Autenticação e Segurança](#11-autenticação-e-segurança)
12. [Variáveis de Ambiente / Segredos](#12-variáveis-de-ambiente--segredos)
13. [Deploy e Operação](#13-deploy-e-operação)

---

## 1. Visão Geral

O **Eco Transcrição IA** automatiza o ciclo mensal de reagendamento de reuniões entre gestores de tráfego e seus clientes. O sistema:

- Mantém uma base de **clientes** segmentada por **equipe** (Sião, Juda, Arca).
- Executa **ligações automatizadas** com IA de voz que se apresenta, oferece horários, identifica intenção, confirma o agendamento e registra a transcrição.
- Recebe respostas dos clientes via **WhatsApp (Z-API)**, interpreta a mensagem (dia/horário/intenção) e cria automaticamente o evento no **Google Calendar** da equipe correspondente, devolvendo confirmação com link do Google Meet.
- Apresenta dashboards, lista de clientes, agenda visual e histórico de ligações para o gestor.

---

## 2. Arquitetura

```
┌────────────────────────┐     ┌─────────────────────────────┐
│  Frontend React (SPA)  │◄───►│   Lovable Cloud (Supabase)  │
│  Vite + Tailwind + UI  │     │  Postgres + Auth + Storage  │
└──────────┬─────────────┘     └──────────┬──────────────────┘
           │                              │
           │                              ▼
           │                  ┌──────────────────────────┐
           │                  │    Edge Functions (Deno)  │
           │                  │  google-auth / callback   │
           │                  │  calendar-*               │
           │                  │  whatsapp-webhook         │
           │                  └──────┬───────────────────┘
           │                         │
           ▼                         ▼
   Browser do gestor        Google Calendar API · Z-API (WhatsApp)
```

- **Frontend**: SPA React servida via Lovable; consome banco e funções diretamente pelo SDK Supabase.
- **Backend**: Lovable Cloud (Supabase gerenciado) — Postgres com RLS, Auth e Edge Functions em Deno.
- **Integrações externas**: Google OAuth2 + Calendar API (eventos e Meet), Z-API (mensagens WhatsApp).

---

## 3. Stack Tecnológica

| Camada        | Tecnologia                                                   |
| ------------- | ------------------------------------------------------------ |
| Frontend      | React 18, TypeScript 5, Vite 5, Tailwind CSS v3, shadcn/ui   |
| Estado/Data   | TanStack Query, React Context (Auth, Team)                   |
| Roteamento    | React Router v6                                              |
| Backend       | Lovable Cloud (Supabase) — Postgres + Auth + Edge Functions  |
| Edge runtime  | Deno (TypeScript)                                            |
| Integrações   | Google Calendar API, Google Meet, Z-API (WhatsApp)           |
| Testes        | Vitest, Playwright                                           |

> Restrição: o projeto **só** usa Lovable Cloud como backend. Não conectar Supabase externo.

---

## 4. Estrutura de Pastas

```
.
├── src/
│   ├── pages/                 # Rotas: Dashboard, Clients, Appointments, Calls, Settings, Auth
│   ├── components/
│   │   ├── layout/            # AppLayout, AppSidebar, TeamBadge, TeamSelector
│   │   ├── clients/           # ClientDialog, StatusBadge
│   │   ├── dashboard/         # StatCard, RecentActivity
│   │   └── ui/                # shadcn/ui (botões, dialog, table, etc.)
│   ├── hooks/                 # useAuth, useTeam, useClients, useAppointments
│   ├── lib/supabase.ts        # Re-export do client oficial
│   ├── integrations/supabase/ # client.ts e types.ts (auto-gerados)
│   ├── data/mock.ts           # Mocks de fallback
│   ├── types/                 # Tipos de domínio (camelCase)
│   ├── index.css              # Design tokens (HSL) e tema
│   └── App.tsx                # Providers + rotas
├── supabase/
│   ├── config.toml
│   └── functions/
│       ├── google-auth/             # Inicia OAuth com Google
│       ├── google-callback/         # Recebe callback e salva tokens
│       ├── calendar-get-appointments/
│       ├── calendar-get-availability/
│       ├── calendar-create-event/
│       └── whatsapp-webhook/        # Webhook Z-API (recebe e responde mensagens)
└── README.md
```

---

## 5. Modelo de Dados

Banco PostgreSQL gerenciado. Todas as tabelas principais possuem coluna `team` (ou `team_slug`) para **isolamento multi-equipe**. RLS habilitado.

### `teams`
Metadados das equipes e seus calendários Google.
| Coluna       | Tipo      | Notas                                  |
| ------------ | --------- | -------------------------------------- |
| id           | uuid PK   |                                        |
| slug         | text      | Identificador único (`siao`/`juda`/`arca`) |
| name         | text      | Nome de exibição                       |
| color        | text      | Cor (hex) para UI                      |
| description  | text      |                                        |
| calendar_id  | text      | ID do Google Calendar da equipe        |
| created_at   | timestamptz |                                      |

### `clients`
Base de clientes a contatar.
| Coluna             | Tipo    | Notas                                                            |
| ------------------ | ------- | ---------------------------------------------------------------- |
| id                 | uuid PK |                                                                  |
| name, phone, email, company | text |                                                            |
| status             | text    | `pendente` · `em_contato` · `agendado` · `nao_atendeu` · `recusou` |
| contact_attempts   | int     | default 0                                                        |
| max_attempts       | int     | default 3                                                        |
| last_contact_at    | timestamptz |                                                              |
| team               | text    | slug da equipe                                                   |
| created_at         | timestamptz |                                                              |

RLS: `authenticated` tem CRUD completo; `anon` tem **SELECT/UPDATE** liberados (necessário para automações externas como n8n e o webhook Z-API atualizarem status).

### `appointments`
Agendamentos confirmados.
| Coluna            | Tipo   |
| ----------------- | ------ |
| id, client_id     | uuid   |
| client_name       | text   |
| date              | date   |
| time              | text (`HH:MM`) |
| meet_link         | text   |
| google_event_id   | text   |
| status            | text (`pendente`/`confirmado`/`cancelado`/`realizado`) |
| team              | text   |
| created_at        | timestamptz |

### `call_logs`
Histórico de ligações da IA.
| Coluna          | Tipo   |
| --------------- | ------ |
| id, client_id   | uuid   |
| client_name, phone | text |
| started_at      | timestamptz |
| duration        | int (segundos) |
| result          | `agendado`/`nao_atendeu`/`recusou`/`remarcou`/`erro` |
| transcript      | text   |
| attempt_number  | int    |
| team            | text   |

### `whatsapp_messages`
Mensagens recebidas e enviadas via Z-API.
| Coluna          | Tipo |
| --------------- | ---- |
| id              | uuid PK |
| client_id       | uuid (nullable) |
| client_name     | text |
| phone           | text (sanitizado, só dígitos) |
| message_text    | text |
| direction       | `incoming` / `outgoing` |
| team_slug       | text |
| created_at      | timestamptz |

RLS: `anon` pode INSERT/SELECT (necessário pro webhook).

### `google_tokens`
Tokens OAuth do Google (uma linha por `user_id`, default `'default'`).

### `settings`
Pares chave/valor para configurações globais.

---

## 6. Edge Functions (Backend)

Todas em Deno, sob `supabase/functions/*`. Deploy automático.

### `google-auth`
Gera URL de consentimento OAuth2 com escopo Calendar e devolve `{ url }` para redirecionar o usuário.

### `google-callback`
Recebe `code` do Google, troca por `access_token`/`refresh_token` e persiste em `google_tokens`. Redireciona para `/auth/callback` no front.

### `calendar-get-appointments`
Lê os agendamentos diretamente do banco (`appointments`) e retorna `{ appointments, connected }`.

### `calendar-get-availability`
Recebe `{ team }`. Consulta o Google Calendar da equipe (`teams.calendar_id`) e retorna `{ availability: DayAvailability[] }`, onde cada dia traz `{ date, dayName, slots: [{ time, available }] }`.

### `calendar-create-event`
Recebe `{ title, description, date, time, attendeeEmail, clientId, team, teamName }`. Cria o evento no calendário da equipe com Google Meet, persiste em `appointments` e devolve `{ appointment, meetLink }`.

### `whatsapp-webhook`
Webhook público chamado pela Z-API para cada mensagem recebida.

**Pipeline:**
1. **Parse do payload Z-API** (`type: ReceivedCallback`):
   - `phone`/`participantPhone` → telefone
   - `text.message` (ou variações) → texto
2. **Match do cliente por telefone** com tolerância ao nono dígito (BR): tenta o número exato e a versão com `9` inserido após o DDD (`55 + DDD + 9 + ...`).
3. **Salva mensagem** em `whatsapp_messages` com `direction: 'incoming'`.
4. **Extrai dia da semana e horário** do texto (regex + dicionário pt-BR).
5. **Validação de agenda padrão**:
   - Dias válidos: Terça (2), Quarta (3), Quinta (4)
   - Horários válidos: 14:00, 15:00, 16:00
   - Se o cliente menciona dia/hora **fora** do padrão → envia mensagem orientando a falar com o analista e encerra.
6. **Agendamento** (dia + hora válidos e cliente reconhecido):
   - Chama `calendar-create-event` para a próxima ocorrência do dia.
   - Atualiza `clients.status = 'agendado'`.
   - Envia confirmação via Z-API com data formatada e link do Meet.
   - Persiste a mensagem de saída.
7. **Interesse detectado** (palavras como `sim`, `pode`, `quero`, `ok`, ...) sem dia/hora:
   - Atualiza status para `em_contato` (se estava `pendente`).
   - Busca disponibilidade via `calendar-get-availability`.
   - Filtra **apenas Terça/Quarta/Quinta** (próxima ocorrência) e slots `14h/15h/16h`.
   - Monta mensagem com ✅/❌ por horário e envia via Z-API.
8. Caso contrário: apenas registra a mensagem.

**Envio Z-API:**
```
POST https://api.z-api.io/instances/{INSTANCE}/token/{TOKEN}/send-text
Headers: Client-Token: {ZAPI_CLIENT_TOKEN}
Body: { phone, message }
```

---

## 7. Frontend

### Roteamento (`src/App.tsx`)
- `/auth` — login/signup
- `/auth/callback` — callback Google OAuth
- Rotas protegidas envolvidas por `TeamProvider` + `AppLayout`:
  - `/` — Dashboard
  - `/clientes` — Clients
  - `/agendamentos` — Appointments
  - `/ligacoes` — Calls
  - `/configuracoes` — Settings

### Providers
- `AuthProvider` (`useAuth`) — sessão Supabase, login/signup/logout.
- `TeamProvider` (`useTeam`) — equipe selecionada (persistida em `localStorage`), lista de equipes, equipe atual.

### Hooks de domínio
- `useClients` — CRUD de clientes filtrados por equipe.
- `useAppointments(teamSlug)` — invoca `calendar-get-appointments` e `calendar-get-availability`; expõe `createAppointment`, `connectGoogle`, com fallback para mocks.

### Design System
- Tokens HSL definidos em `src/index.css` e `tailwind.config.ts`.
- **Nunca** usar cores diretas em componentes — usar tokens semânticos (`bg-background`, `text-primary`, etc.).
- Componentes base de `shadcn/ui` em `src/components/ui/`.

### Páginas principais
| Página         | Função                                                         |
| -------------- | -------------------------------------------------------------- |
| Dashboard      | KPIs (clientes, agendamentos, taxa de sucesso) e atividade recente |
| Clients        | Tabela CRUD, filtros por status, dialog de criação/edição      |
| Appointments   | Visão de agenda + disponibilidade + criação manual de evento   |
| Calls          | Fila de ligações, status e visualização da transcrição         |
| Settings       | Conexão com Google e configurações gerais                      |
| Auth           | Email/senha + Google                                           |

---

## 8. Multi-Equipe (Tenancy)

- Cada equipe (`siao`, `juda`, `arca`) tem seu próprio `calendar_id` na tabela `teams`.
- Toda escrita inclui `team`/`team_slug` para isolar dados.
- A UI sempre opera no contexto da `currentTeam` do `TeamProvider`.
- O `whatsapp-webhook` deduz a equipe a partir do `clients.team` do cliente reconhecido.

---

## 9. Integrações Externas

### Google Calendar / Meet
- OAuth2 via `google-auth` + `google-callback`; tokens em `google_tokens`.
- Eventos criados com `conferenceData` para gerar link do Meet automaticamente.
- Calendar ID por equipe.

### Z-API (WhatsApp)
- **Recebimento**: Z-API chama `POST /functions/v1/whatsapp-webhook` a cada mensagem (`type: ReceivedCallback`).
- **Envio**: helper `sendWhatsAppMessage(phone, message)` na edge function.
- Constantes da instância e token estão na função; `ZAPI_CLIENT_TOKEN` é segredo.

### IA de Voz (Ligações)
Fluxo descrito nas memórias do projeto: a IA se apresenta, oferece horários, identifica intenção, confirma o agendamento e grava transcrição em `call_logs`. A orquestração da fila e o registro de transcrições compõem o módulo de **call orchestration**.

---

## 10. Fluxos de Negócio

### A. Cadência mensal de reagendamento
1. Gestor cadastra/importa clientes na equipe correspondente.
2. Orquestrador dispara ligações da IA para clientes `pendente`.
3. IA registra resultado em `call_logs` e atualiza `clients.status`.

### B. Agendamento via WhatsApp
1. Cliente recebe mensagem inicial e responde.
2. Z-API entrega o payload em `whatsapp-webhook`.
3. Webhook reconhece o cliente, interpreta a mensagem:
   - **"Sim/quero/ok"** → envia disponibilidade (Ter/Qua/Qui · 14h/15h/16h).
   - **"Terça às 14h"** → cria evento no Calendar, atualiza status, envia confirmação com link do Meet.
   - **Dia/hora fora do padrão** → orienta a falar com o analista.
4. Todas as mensagens (entrada e saída) ficam em `whatsapp_messages` para auditoria.

### C. Visão do gestor
- Dashboard agrega KPIs do dia/mês.
- Appointments mostra calendário e disponibilidade.
- Calls mostra histórico com transcrições.
- Clients permite ações manuais e ajustes de status.

---

## 11. Autenticação e Segurança

- **Auth padrão por email/senha** + **Google** (sem signup anônimo).
- Sessões persistidas no `localStorage` pelo SDK Supabase.
- **RLS habilitado** em todas as tabelas.
  - `authenticated`: CRUD completo nas tabelas de operação.
  - `anon`: acesso restrito a `clients` (SELECT/UPDATE) e `whatsapp_messages` (INSERT/SELECT) para automações externas.
- Edge functions com lógica sensível usam `SUPABASE_SERVICE_ROLE_KEY` (nunca exposto ao frontend).
- Roles de aplicação devem viver em tabela separada (`user_roles`) com função `has_role` `SECURITY DEFINER` — **nunca** em `profiles`/`users`.

---

## 12. Variáveis de Ambiente / Segredos

Auto-fornecidos pelo Lovable Cloud (não editar `.env` manualmente):

| Nome                         | Uso                                          |
| ---------------------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`          | Frontend → URL do backend                    |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend → chave pública                  |
| `VITE_SUPABASE_PROJECT_ID`   | Frontend                                     |
| `SUPABASE_URL`               | Edge functions                               |
| `SUPABASE_ANON_KEY`          | Edge functions (operações como `anon`)       |
| `SUPABASE_SERVICE_ROLE_KEY`  | Edge functions (operações privilegiadas)     |

Segredos configurados no painel:

| Nome                  | Uso                                           |
| --------------------- | --------------------------------------------- |
| `GOOGLE_CLIENT_ID`    | OAuth2                                        |
| `GOOGLE_CLIENT_SECRET`| OAuth2                                        |
| `GOOGLE_REDIRECT_URI` | OAuth2                                        |
| `LOVABLE_API_KEY`     | Lovable AI Gateway (quando aplicável)         |
| `ZAPI_CLIENT_TOKEN`   | Header `Client-Token` exigido pela Z-API      |

---

## 13. Deploy e Operação

- **Frontend**: build Vite servido pela Lovable (preview e domínio publicado).
- **Edge Functions**: deploy automático ao salvar.
- **Banco**: alterações de schema **somente via migrations** Supabase (nunca editar `types.ts` à mão).
- **Logs**: usar logs das edge functions para depurar webhook (Z-API loga `Raw Z-API payload` no `whatsapp-webhook`).
- **Webhook Z-API**: configurar a URL `https://<project>.functions.supabase.co/whatsapp-webhook` no painel da Z-API com o `Client-Token` correspondente.

---

> **Princípio editorial**: este documento é o esqueleto vivo do sistema. Sempre que adicionar tabela, função, integração ou fluxo novo, atualizar a seção correspondente para que humanos e agentes consigam operar o Eco Transcrição IA com contexto completo.
