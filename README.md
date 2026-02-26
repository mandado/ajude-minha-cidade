# Ajude Minha Cidade

Plataforma colaborativa para mapear pontos de ajuda em situações de emergência e desastres naturais no Brasil.

## O que é

O **Ajude Minha Cidade** permite que qualquer pessoa cadastre e encontre abrigos, pontos de coleta e distribuição de doações em um mapa interativo. A ideia é facilitar a organização da ajuda em momentos de crise — enchentes, deslizamentos, secas — conectando quem precisa com quem pode ajudar.

## Como funciona

- **Mapa interativo** com pontos de ajuda geolocalizados (abrigos, coleta, distribuição)
- **Cadastro de pontos** com endereço, necessidades, telefone e horário de funcionamento
- **Necessidades por ponto** — cada ponto lista o que precisa (alimentos, cobertores, voluntários, etc.)
- **Moderação comunitária** — usuários podem confirmar ou reportar pontos
- **Filtros** por tipo de ponto, prioridade e cidade
- **Alertas meteorológicos** do INMET integrados ao mapa
- **Previsão do tempo** por localização

## Tecnologias

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Supabase** (auth com Google OAuth, banco PostgreSQL com PostGIS)
- **Leaflet** + react-leaflet (mapa)
- **TanStack Query** (queries e mutations)
- **TanStack Form** (formulários)
- **Tailwind CSS v4** + shadcn/ui
- **Zod v4** (validação)
- **Upstash Redis** (rate limiting e cache de geocoding)

## Rodando localmente

### Pré-requisitos

- [Bun](https://bun.sh/) (ou Node.js 20+)
- Conta no [Supabase](https://supabase.com/)
- Conta no [Upstash](https://upstash.com/) (Redis)
- Chave de API do [Mapbox](https://www.mapbox.com/) (geocoding)
- Google OAuth configurado no Supabase

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

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
MAPBOX_ACCESS_TOKEN=
```

## Estrutura do projeto

```
src/
├── app/                    # Rotas (App Router)
│   ├── (auth)/             # Login (Google OAuth)
│   ├── (public)/           # Página principal (mapa)
│   └── api/                # API routes (geocoding, auth callback)
├── components/
│   ├── auth/               # AuthForm, UserMenu
│   ├── map/                # Mapa, filtros, popups, sheets
│   └── ui/                 # Componentes shadcn
├── hooks/                  # useAuth, useMapPoints, usePointMutations, useWeather
├── lib/
│   ├── actions/            # Server Actions (CRUD pontos, moderação)
│   ├── api/                # APIs externas (clima)
│   ├── supabase/           # Clientes Supabase (server/client)
│   └── validators/         # Schemas Zod
├── types/                  # TypeScript types
└── middleware.ts            # Refresh de sessão Supabase
```

## Licença

MIT
