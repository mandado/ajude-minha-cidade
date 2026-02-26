# Ajude Minha Cidade

Plataforma colaborativa para mapear pontos de ajuda e ocorrências em situações de emergência e desastres naturais no Brasil.

## O que é

O **Ajude Minha Cidade** permite que qualquer pessoa cadastre e encontre pontos de apoio humanitário em um mapa interativo em tempo real. A ideia é facilitar a organização da ajuda em momentos de crise — enchentes, deslizamentos, soterramentos — conectando quem precisa com quem pode ajudar.

## Funcionalidades

- **Mapa interativo** com marcadores por tipo, cada um com ícone e cor distintos
- **5 tipos de ponto:** Abrigo, Ponto de Coleta, Distribuição, Deslizamento e Soterramento
- **Cadastro de pontos** com endereço, necessidades, telefone e horário de funcionamento
- **Necessidades por ponto** — lista o que cada local precisa (alimentos, cobertores, voluntários, etc.)
- **Moderação comunitária** — usuários confirmam ou denunciam pontos; 3 denúncias desativam automaticamente
- **Expiração automática** — pontos sem confirmação somem após 7 dias
- **Filtros** por tipo de ponto, prioridade e cidade
- **Alertas meteorológicos** do INMET integrados ao mapa
- **Previsão do tempo** por localização
- **Autenticação** por e-mail/senha com proteção Cloudflare Turnstile (captcha)
- **Rate limiting** para prevenção de abuso (Upstash Redis)
- **Páginas legais** — Política de Privacidade e Termos de Uso (LGPD)

## Tecnologias

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Supabase** (auth com e-mail/senha, banco PostgreSQL com PostGIS)
- **Leaflet** + react-leaflet (mapa interativo)
- **TanStack Query** (queries e mutations)
- **TanStack Form** (formulários)
- **Tailwind CSS v4** + shadcn/ui
- **lucide-react** (ícones)
- **Zod v4** (validação)
- **Upstash Redis** (rate limiting)
- **Mapbox** (geocoding de endereços)
- **Cloudflare Turnstile** (proteção contra bots)

## Rodando localmente

### Pré-requisitos

- [Bun](https://bun.sh/) (ou Node.js 20+)
- Conta no [Supabase](https://supabase.com/)
- Conta no [Upstash](https://upstash.com/) (Redis)
- Chave de API do [Mapbox](https://www.mapbox.com/) (geocoding)
- Conta no [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) (captcha)

### Setup

```bash
# Clonar o repositório
git clone git@github.com:mandado/ajude-minha-cidade.git
cd ajude-minha-cidade

# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher as variáveis no .env.local

# Rodar as migrations no Supabase
bun run db:push

# Iniciar o servidor de desenvolvimento
bun run dev
```

### Variáveis de ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Mapbox (geocoding)
MAPBOX_ACCESS_TOKEN=

# Cloudflare Turnstile (captcha)
# Para desenvolvimento local, use a site key de teste: 1x00000000000000000000AA
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

> **Dica local:** use `NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA` no `.env.local` para desabilitar o captcha em desenvolvimento.

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/             # Login e cadastro (e-mail/senha)
│   ├── (public)/           # Página principal (mapa)
│   ├── privacidade/        # Política de Privacidade (estático)
│   ├── termos/             # Termos de Uso (estático)
│   └── api/                # API routes (geocoding, auth callback)
├── components/
│   ├── auth/               # AuthForm, UserMenu
│   ├── map/                # Mapa, marcadores, filtros, popups, sheets
│   └── ui/                 # Componentes shadcn/ui
├── hooks/                  # useAuth, useMapPoints, usePointMutations, useWeather, useModeration
├── lib/
│   ├── actions/            # Server Actions (CRUD pontos, moderação)
│   ├── api/                # APIs externas (clima INMET, Open-Meteo)
│   ├── supabase/           # Clientes Supabase (server/client)
│   └── validators/         # Schemas Zod
├── types/                  # TypeScript types (database, map, weather)
└── middleware.ts            # Refresh de sessão Supabase
```

## Banco de dados (Supabase + PostGIS)

| Tabela | Descrição |
|---|---|
| `profiles` | Perfis de usuário (nome, avatar, telefone) |
| `points` | Pontos no mapa (tipo, status, prioridade, localização) |
| `needs` | Necessidades de cada ponto |
| `point_confirmations` | Confirmações comunitárias |
| `point_reports` | Denúncias comunitárias |
| `moderation_log` | Log de ações de moderação |

### Tipos de ponto

| Tipo | Descrição | Cor |
|---|---|---|
| `shelter` | Abrigo | Azul |
| `collection` | Ponto de Coleta | Verde |
| `distribution` | Distribuição | Laranja |
| `landslide` | Deslizamento | Marrom |
| `burial` | Soterramento | Vermelho |

## Operadores

Desenvolvido e mantido por:

- **Jorge Roberto Tomaz Junior** — jorgerobertodev@gmail.com
- **Thayrone de Souza Nascimento** — thaydeveloper26@gmail.com

## Licença

MIT
