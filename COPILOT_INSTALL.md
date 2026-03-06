# Prompt de Instalação para Copilot

> Cole este prompt completo no GitHub Copilot Chat da sua aplicação para integrar automaticamente a SofaScore API.

---

## Prompt para Copilot

```
Preciso integrar a SofaScore API na minha aplicação.

CONTEXTO:
- API Base URL (produção): http://api.bet-tagger.com
- API Base URL (desenvolvimento): http://localhost:8080
- A API retorna respostas padronizadas no formato:
  Sucesso: { success: true, data: T, message: string, error: null }
  Erro: { success: false, data: null, message: string, error: string }

ENDPOINTS DISPONÍVEIS:
- GET /health
- GET /api/matches/live?sport=football
- GET /api/matches/:id
- GET /api/team/:id
- GET /api/player/:id
- GET /api/tournament/:id
- GET /api/search?q=query

TAREFA:
Crie a integração completa com a SofaScore API seguindo exatamente esta estrutura:

1. VARIÁVEIS DE AMBIENTE
   Adicione no .env.local:
   ```
   NEXT_PUBLIC_SOFASCORE_API_URL=http://api.bet-tagger.com
   ```

2. CLIENTE HTTP
   Crie o arquivo: lib/sofascore-client.ts
   
   Implementação:
   - Type ApiResponse<T> com { success, data, message, error }
   - Class SofaScoreApiClient com método privado request<T>
   - Métodos públicos: getLiveMatches, getMatchById, getTeamById, getPlayerById, getTournamentById, search
   - Export singleton: export const sofaScoreApi = new SofaScoreApiClient(...)
   - Usar fetch nativo ou axios se já instalado
   - Timeout de 10 segundos
   - Throw error se success === false

3. HOOKS CUSTOMIZADOS (React Query)
   Crie o arquivo: hooks/useSofaScore.ts
   
   Implementar hooks:
   - useLiveMatches(sport?: string) - refetch a cada 30s
   - useMatch(matchId: string | number | null) - refetch a cada 60s, enabled só se matchId existir
   - useTeam(teamId: string | number | null) - enabled só se teamId existir
   - usePlayer(playerId: string | number | null) - enabled só se playerId existir
   - useTournament(tournamentId: string | number | null) - enabled só se tournamentId existir
   - useSearch(query: string) - enabled só se query.length > 2, debounce de 300ms
   
   Configurações React Query:
   - retry: 3
   - staleTime apropriado para cada hook
   - Use @tanstack/react-query

4. TYPES (TypeScript)
   Crie o arquivo: types/sofascore.ts
   
   Definir tipos:
   - ApiSuccessResponse<T>
   - ApiErrorResponse
   - ApiResponse<T>
   - Tipos básicos: Match, Team, Player, Tournament (com campos id, name, slug no mínimo)

5. TRATAMENTO DE ERROS
   Criar error boundary ou tratamento global para:
   - RATE_LIMIT_EXCEEDED (300 req/min)
   - SOFASCORE_TIMEOUT (10s timeout)
   - SOFASCORE_BAD_RESPONSE
   - SOFASCORE_UNAVAILABLE

6. EXEMPLO DE COMPONENTE
   Crie um exemplo funcional: components/LiveMatchesExample.tsx
   - Use "use client"
   - Use useLiveMatches hook
   - Mostre loading, error e data states
   - Renderize lista básica de matches

REQUISITOS:
- Use TypeScript strict mode
- Siga padrões do projeto atual
- Use libs já instaladas quando possível
- Adicione comentários JSDoc nos métodos públicos
- Implemente error handling robusto
- Use @/ alias se configurado no projeto

ENTREGA:
- Crie todos os arquivos listados
- Configure .env.local se não existir
- Adicione @tanstack/react-query ao package.json se não houver
- Mostre exemplo de uso no componente criado

Rate limit: 300 req/min por IP
Timeout: 10 segundos
CORS: liberado (*)

Comece pela criação do cliente HTTP e depois os hooks.
```

---

## Instruções de Uso

### Passo 1: Copiar o Prompt
Copie todo o bloco de código acima (entre as ```).

### Passo 2: Abrir Copilot Chat
Na sua aplicação, abra o GitHub Copilot Chat (Ctrl+Shift+I ou Cmd+Shift+I).

### Passo 3: Colar e Executar
Cole o prompt completo e pressione Enter.

### Passo 4: Revisar Arquivos Criados
O Copilot irá criar:

```
├── .env.local (atualizado)
├── lib/
│   └── sofascore-client.ts
├── hooks/
│   └── useSofaScore.ts
├── types/
│   └── sofascore.ts
└── components/
    └── LiveMatchesExample.tsx
```

### Passo 5: Instalar Dependências (se necessário)
Se o projeto ainda não tiver React Query:

```bash
npm install @tanstack/react-query
# ou
pnpm add @tanstack/react-query
# ou
yarn add @tanstack/react-query
```

### Passo 6: Configurar Provider (React Query)
Se ainda não tiver, adicione o QueryClientProvider no layout:

```typescript
// app/layout.tsx ou _app.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### Passo 7: Testar
Importe o componente de exemplo em qualquer página:

```typescript
import { LiveMatchesExample } from "@/components/LiveMatchesExample";

export default function Page() {
  return <LiveMatchesExample />;
}
```

---

## Prompt Alternativo (Client Simples - sem React Query)

Se você quiser apenas o cliente HTTP sem hooks:

```
Crie um cliente HTTP para integrar a SofaScore API.

API Base URL: http://api.bet-tagger.com (produção) ou http://localhost:8080 (dev)

Formato de resposta padronizado:
- Sucesso: { success: true, data: T, message: string, error: null }
- Erro: { success: false, data: null, message: string, error: string }

Endpoints:
- GET /api/matches/live?sport=football
- GET /api/matches/:id
- GET /api/team/:id
- GET /api/player/:id
- GET /api/tournament/:id
- GET /api/search?q=query

TAREFA:

1. Adicione ao .env.local:
   NEXT_PUBLIC_SOFASCORE_API_URL=http://api.bet-tagger.com

2. Crie lib/sofascore-client.ts com:
   - Type ApiResponse<T>
   - Class SofaScoreApiClient
   - Métodos: getLiveMatches(sport?), getMatchById(id), getTeamById(id), getPlayerById(id), getTournamentById(id), search(query)
   - Export singleton sofaScoreApi
   - Use fetch com timeout de 10s
   - Throw error se success === false

3. Crie types/sofascore.ts com tipos básicos

Use TypeScript strict. Adicione JSDoc. Implemente error handling.
```

---

## Troubleshooting

### Copilot não completou tudo
Peça ao Copilot:
```
Continue a implementação anterior. Falta criar [arquivo específico].
```

### Erro de importação
Verifique se os paths estão corretos:
```
Os imports estão usando @ alias? Ajuste para o padrão do meu projeto.
```

### Quer adicionar mais funcionalidades
```
Adicione [funcionalidade] ao cliente SofaScore já criado.
```

### Precisa de Server Actions (Next.js)
```
Crie server actions em vez de hooks client-side para os mesmos endpoints da SofaScore API.
```

---

## Validação Final

Após a integração do Copilot, teste:

```typescript
// Em qualquer componente ou página
import { sofaScoreApi } from "@/lib/sofascore-client";

// Server Component
const matches = await sofaScoreApi.getLiveMatches();
console.log(matches);

// Client Component com hook
const { data } = useLiveMatches();
```

Se retornar dados, a integração está completa! ✅
