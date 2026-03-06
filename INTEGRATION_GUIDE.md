# Guia de Integração - SofaScore API

## 1. Deploy no Coolify (Passo a Passo)

### 1.1. Criar Recurso

1. Acessar Coolify
2. Clicar em **New Resource**
3. Selecionar **Git Repository**
4. Colar URL do repositório: `https://github.com/[seu-usuario]/sofascore-api`
5. Escolher branch: `main` ou `master`

### 1.2. Configurar Build

1. **Build Pack**: Selecionar `Dockerfile`
2. **Dockerfile Location**: deixar `.` (raiz)
3. **Port Exposto**: `8080`

### 1.3. Configurar Variáveis de Ambiente

No painel de Environment Variables, adicionar:

```env
PORT=8080
NODE_ENV=production
CORS_ORIGIN=*
API_PREFIX=/api
REQUEST_TIMEOUT=10000
```

*Opcional (reservado para cache/logs futuro):*
```env
USER_SUPABASE=
PASSWD_SUPABASE=
```

### 1.4. Configurar Domínio

1. Ir em **Domains**
2. Adicionar domínio: `api.bet-tagger.com` (ou subdomínio desejado)
3. Aguardar DNS propagar

### 1.5. Deploy

1. Clicar em **Deploy**
2. Aguardar build (1-3 minutos)
3. Verificar logs de inicialização

### 1.6. Validação Pós-Deploy

Testar endpoints:

```bash
curl http://api.bet-tagger.com/health
curl http://api.bet-tagger.com/docs
curl http://api.bet-tagger.com/openapi.json
curl http://api.bet-tagger.com/api/matches/live
```

Resposta esperada de `/health`:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 123.45,
    "nodeEnv": "production",
    "timestamp": "2026-03-06T..."
  },
  "message": "",
  "error": null
}
```

---

## 2. Consumindo a API na Sua Aplicação

### 2.1. Configurar Variáveis de Ambiente

No seu projeto, adicione `.env`:

```env
NEXT_PUBLIC_SOFASCORE_API_URL=http://api.bet-tagger.com
# ou para desenvolvimento local:
# NEXT_PUBLIC_SOFASCORE_API_URL=http://localhost:8080
```

### 2.2. Cliente HTTP (TypeScript)

Crie `lib/sofascore-client.ts`:

```typescript
type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string;
  error: string | null;
};

class SofaScoreApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json: ApiResponse<T> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error || "API request failed");
    }

    return json.data;
  }

  async getLiveMatches(sport = "football") {
    return this.request(`/api/matches/live?sport=${sport}`);
  }

  async getMatchById(id: string | number) {
    return this.request(`/api/matches/${id}`);
  }

  async getTeamById(id: string | number) {
    return this.request(`/api/team/${id}`);
  }

  async getPlayerById(id: string | number) {
    return this.request(`/api/player/${id}`);
  }

  async getTournamentById(id: string | number) {
    return this.request(`/api/tournament/${id}`);
  }

  async search(query: string) {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`);
  }
}

export const sofaScoreApi = new SofaScoreApiClient(
  process.env.NEXT_PUBLIC_SOFASCORE_API_URL || "http://localhost:8080"
);
```

### 2.3. Exemplo de Uso em React/Next.js

#### Server Component (App Router)

```typescript
import { sofaScoreApi } from "@/lib/sofascore-client";

export default async function LiveMatchesPage() {
  const matches = await sofaScoreApi.getLiveMatches("football");

  return (
    <div>
      <h1>Partidas ao Vivo</h1>
      <pre>{JSON.stringify(matches, null, 2)}</pre>
    </div>
  );
}
```

#### Client Component com SWR

```typescript
"use client";

import useSWR from "swr";
import { sofaScoreApi } from "@/lib/sofascore-client";

export function LiveMatches() {
  const { data, error, isLoading } = useSWR(
    "live-matches",
    () => sofaScoreApi.getLiveMatches()
  );

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar partidas</div>;

  return (
    <div>
      {/* Renderize matches aqui */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

#### Client Component com React Query

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { sofaScoreApi } from "@/lib/sofascore-client";

export function LiveMatches() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["live-matches"],
    queryFn: () => sofaScoreApi.getLiveMatches(),
    refetchInterval: 30000, // atualiza a cada 30s
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar partidas</div>;

  return (
    <div>
      {/* Renderize matches aqui */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### 2.4. Exemplo com Axios

Se preferir usar Axios:

```typescript
import axios, { AxiosInstance } from "axios";

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string;
  error: string | null;
};

class SofaScoreApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private async request<T>(endpoint: string): Promise<T> {
    const { data } = await this.client.get<ApiResponse<T>>(endpoint);

    if (!data.success || !data.data) {
      throw new Error(data.error || "API request failed");
    }

    return data.data;
  }

  async getLiveMatches(sport = "football") {
    return this.request(`/api/matches/live?sport=${sport}`);
  }

  async getMatchById(id: string | number) {
    return this.request(`/api/matches/${id}`);
  }

  async getTeamById(id: string | number) {
    return this.request(`/api/team/${id}`);
  }

  async getPlayerById(id: string | number) {
    return this.request(`/api/player/${id}`);
  }

  async getTournamentById(id: string | number) {
    return this.request(`/api/tournament/${id}`);
  }

  async search(query: string) {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`);
  }
}

export const sofaScoreApi = new SofaScoreApiClient(
  process.env.NEXT_PUBLIC_SOFASCORE_API_URL || "http://localhost:8080"
);
```

### 2.5. Tratamento de Erros

```typescript
try {
  const matches = await sofaScoreApi.getLiveMatches();
  console.log(matches);
} catch (error) {
  if (error instanceof Error) {
    console.error("Erro na API:", error.message);
    // Exibir notificação para o usuário
  }
}
```

### 2.6. Types TypeScript (Opcional)

Se quiser tipar as respostas, você pode criar `types/sofascore.ts`:

```typescript
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
  error: null;
};

export type ApiErrorResponse = {
  success: false;
  data: null;
  message: string;
  error: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Exemplos de tipos para as entidades do SofaScore
export type Match = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  // ... adicione campos conforme necessário
};

export type Team = {
  id: number;
  name: string;
  slug: string;
  // ... adicione campos conforme necessário
};

export type MatchStatus = {
  code: number;
  description: string;
  type: string;
};
```

---

## 3. Exemplo de Integração Completa

### 3.1. Hook Customizado (React)

```typescript
// hooks/useLiveMatches.ts
import { useQuery } from "@tanstack/react-query";
import { sofaScoreApi } from "@/lib/sofascore-client";

export function useLiveMatches(sport = "football") {
  return useQuery({
    queryKey: ["live-matches", sport],
    queryFn: () => sofaScoreApi.getLiveMatches(sport),
    refetchInterval: 30000, // Atualiza a cada 30s
    retry: 3,
    staleTime: 10000, // Cache válido por 10s
  });
}

export function useMatch(matchId: string | number | null) {
  return useQuery({
    queryKey: ["match", matchId],
    queryFn: () => sofaScoreApi.getMatchById(matchId!),
    enabled: !!matchId, // Só executa se matchId existir
    refetchInterval: 60000, // Atualiza a cada 1min
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => sofaScoreApi.search(query),
    enabled: query.length > 2, // Só busca com 3+ caracteres
    staleTime: 30000,
  });
}
```

### 3.2. Componente de Exemplo

```typescript
"use client";

import { useLiveMatches } from "@/hooks/useLiveMatches";

export function LiveMatchesDashboard() {
  const { data: matches, isLoading, error } = useLiveMatches("football");

  if (isLoading) {
    return <div className="animate-pulse">Carregando partidas...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Erro ao carregar partidas. Tente novamente.
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return <div>Nenhuma partida ao vivo no momento.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Partidas ao Vivo</h2>
      {/* Renderize suas partidas aqui */}
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(matches, null, 2)}
      </pre>
    </div>
  );
}
```

---

## 4. Notas Importantes

### 4.1. Rate Limit

A API tem rate limit de **300 requisições por minuto por IP**.

Se ultrapassar, receberá:

```json
{
  "success": false,
  "data": null,
  "message": "Too many requests, please try again later.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

**Recomendações:**
- Use cache (SWR, React Query) com `staleTime` adequado
- Evite polling muito agressivo
- Implemente debounce em buscas

### 4.2. Timeout

Chamadas externas ao SofaScore têm timeout de **10 segundos**.

Se exceder, a API retorna:

```json
{
  "success": false,
  "data": null,
  "message": "SofaScore request timeout",
  "error": "SOFASCORE_TIMEOUT"
}
```

### 4.3. CORS

CORS está configurado como `*` (liberado para qualquer origem).

Se quiser restringir no futuro, ajuste `CORS_ORIGIN` no Coolify:

```env
CORS_ORIGIN=https://seuapp.com,https://www.seuapp.com
```

### 4.4. Monitoramento

Endpoints úteis para monitoramento:

- `/health` - Status da API
- `/docs` - Swagger UI com documentação interativa
- `/openapi.json` - Spec OpenAPI 3.0

---

## 5. Troubleshooting

### Erro de CORS local

Se estiver testando localmente e enfrentando CORS:

```typescript
// Adicione proxy no next.config.js (Next.js)
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};
```

### API não responde

1. Verifique se está rodando: `curl http://api.bet-tagger.com/health`
2. Veja logs no Coolify
3. Confirme variáveis de ambiente

### Dados vazios/null

A API depende do SofaScore. Se retornar vazio, pode ser:
- SofaScore está fora do ar
- Endpoint do SofaScore mudou
- Não há dados para aquele recurso no momento

---

## 6. Próximos Passos

Depois de integrar:

1. **Cache adicional**: Se quiser, adicione Redis no Coolify e conecte usando `USER_SUPABASE`/`PASSWD_SUPABASE`
2. **Autenticação**: Adicione API key se quiser restringir acesso
3. **Webhooks**: Configure notificações quando partidas mudarem de status
4. **Monitoramento**: Use Sentry ou similar para capturar erros em produção

---

## 7. Suporte

Para issues ou melhorias:
- Verifique logs via Coolify
- Teste endpoint direto via `/docs` (Swagger UI)
- Valide respostas usando `/openapi.json`
