# SofaScore API Wrapper

API REST em Node.js/TypeScript para encapsular chamadas do SofaScore com respostas padronizadas, pronta para deploy em Docker/Coolify.

## Production Ready Features

- Servidor HTTP Express com `host 0.0.0.0`
- Porta definida por `PORT`
- Prefixo de API via `API_PREFIX`
- CORS configuravel por `CORS_ORIGIN`
- Rate limit basico
- Timeout em chamadas externas (`REQUEST_TIMEOUT`)
- Tratamento global de erros
- Logs de inicializacao e erro
- Swagger/OpenAPI em `/docs` e `/openapi.json`

## Estrutura

```text
src/
	app.ts
	server.ts
	config/
		env.ts
	controllers/
		healthController.ts
		sofaScoreController.ts
	middlewares/
		errorHandler.ts
		notFound.ts
		rateLimiter.ts
	providers/
		sofaScoreClient.ts
	routes/
		api.ts
		docs.ts
		health.ts
	services/
		sofaScoreService.ts
	utils/
		asyncHandler.ts
		httpError.ts
		logger.ts
		response.ts
```

## Variaveis de Ambiente

Use `.env.example` como base.

```env
PORT=8080
NODE_ENV=production
CORS_ORIGIN=*
API_PREFIX=/api
REQUEST_TIMEOUT=10000
SOFASCORE_FALLBACK_BASE_URLS=
UPSTREAM_RETRIES=3
UPSTREAM_RETRY_BACKOFF_MS=300
TOP_MATCHES_LIMIT=50
PRELOAD_INTERVAL_MS=30000
USER_SUPABASE=
PASSWD_SUPABASE=
```

Notas:

- `CORS_ORIGIN` aceita `*` ou lista separada por virgula.
- `SOFASCORE_FALLBACK_BASE_URLS` aceita lista separada por virgula de hosts alternativos.
- `USER_SUPABASE` e `PASSWD_SUPABASE` sao opcionais e ficam reservadas para futuras features de cache/log/persistencia.

## Como rodar localmente

1. Instalar dependencias:

```bash
npm ci
```

2. Criar `.env` baseado em `.env.example`.

3. Rodar em desenvolvimento:

```bash
npm run dev
```

4. Rodar em modo producao local:

```bash
npm run build
npm start
```

## Endpoints

- `GET /health`
- `GET /api/matches/live`
- `GET /api/matches/top`
- `GET /api/matches/:id`
- `GET /api/team/:id`
- `GET /api/player/:id`
- `GET /api/tournament/:id`
- `GET /api/search?q=`
- `GET /docs`
- `GET /openapi.json`

Se `API_PREFIX` for alterado, os endpoints em `/api/*` passam a usar esse prefixo.

## Padrao de resposta

Sucesso:

```json
{
	"success": true,
	"data": {},
	"message": "",
	"error": null
}
```

Erro:

```json
{
	"success": false,
	"data": null,
	"message": "error description",
	"error": "ERROR_CODE"
}
```

## Exemplos de consumo

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/matches/live
curl "http://localhost:8080/api/matches/top?limit=50"
curl http://localhost:8080/api/matches/12437781
curl http://localhost:8080/api/team/2817
curl http://localhost:8080/api/player/839956
curl "http://localhost:8080/api/search?q=real%20madrid"
```

## Docker

Build da imagem:

```bash
docker build -t sofascore-api .
```

Run do container:

```bash
docker run --rm -p 8080:8080 --env-file .env sofascore-api
```

O container inicia com `npm start`, escuta em `0.0.0.0` e usa `PORT`.

## Deploy no Coolify

1. Criar novo recurso com este repositorio.
2. Selecionar build com `Dockerfile` na raiz.
3. Configurar variaveis de ambiente:
	 - `PORT` (ex: `8080`)
	 - `NODE_ENV=production`
	 - `CORS_ORIGIN=*`
	 - `API_PREFIX=/api`
	 - `REQUEST_TIMEOUT=10000`
	 - `USER_SUPABASE` e `PASSWD_SUPABASE` (opcional)
4. Configurar dominio publico (informado): `http://api.bet-tagger.com`.
5. Fazer deploy.
6. Validar:
   - `/health`
   - `/docs`
   - `/openapi.json`

Rate limit atual: `300 req/min` por IP.

## Integracao com Sua Aplicacao

### Opcao 1: Instalacao Automatica (Recomendada)

Cole o prompt no GitHub Copilot e deixe ele integrar automaticamente:

**[COPILOT_INSTALL.md](COPILOT_INSTALL.md)** - Prompt pronto para Copilot

### Opcao 2: Instalacao Manual

Para integrar manualmente, consulte o guia completo:

**[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)**

O guia inclui:
- Checklist de deploy no Coolify (passo a passo)
- Cliente HTTP pronto em TypeScript
- Exemplos de uso com React/Next.js
- Hooks customizados (SWR, React Query)
- Tratamento de erros e rate limit
- Troubleshooting comum

## Licenca

MIT
