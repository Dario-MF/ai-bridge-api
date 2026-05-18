# AI Bridge API

Backend bridge entre un frontend de gráficos financieros y un servicio de IA (OpenAI).

La API no analiza gráficos por sí misma. Recibe **facts** ya calculados desde el frontend y los envía a la IA con prompts controlados en backend, devolviendo una explicación natural al usuario.

## Flujo

```
Frontend gráfico → AI Bridge API → OpenAI → Respuesta interpretativa → Frontend
```

## Instalación

```bash
git clone <repo-url>
cd ai-bridge-api
npm install
cp .env.example .env
# Edita .env con tu OPENAI_API_KEY
```

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno (`development` / `production`) | `development` |
| `OPENAI_API_KEY` | API key de OpenAI (obligatoria en production) | — |
| `OPENAI_MODEL` | Modelo a usar | `gpt-4.1-mini` |
| `OPENAI_TIMEOUT_MS` | Timeout de la petición a OpenAI (ms) | `8000` |
| `ALLOWED_ORIGINS` | Orígenes permitidos (separados por coma, obligatorio en production) | — |
| `DAILY_MAX_REQUESTS` | Máximo de requests diarios al endpoint IA | `300` |
| `MAX_FACTS_PAYLOAD_SIZE` | Tamaño máx. del payload (chars) | `5000` |
| `MAX_OUTPUT_TOKENS` | Tokens máx. de respuesta IA | `180` |

## Ejecución

```bash
# Desarrollo (con watch automático)
npm run dev

# Producción
npm start
```

## Endpoints

### `GET /health`

Health check.

**Response:**

```json
{
  "ok": true,
  "service": "ai-bridge-api"
}
```

### `POST /api/ai/chart-analysis`

Envía facts de un gráfico financiero a IA para obtener una explicación natural.

**Request body:**

```json
{
  "range": {
    "from": 1776268030995,
    "to": 1777900990995
  },
  "facts": {
    "symbol": "BBVA.MC",
    "resolution": "1D"
  }
}
```

> **Nota:** El objeto `facts` es flexible. Solo se valida que exista, sea un objeto plano y no supere el tamaño máximo. No se exigen campos específicos, lo que permite iterar la estructura desde el frontend sin tocar el backend.

**Response:**

```json
{
  "ok": true,
  "analysis": "En el período observado, BBVA.MC muestra..."
}
```

**Errores de validación:**

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_AI_PAYLOAD",
    "message": "\"facts\" must be a non-null object"
  }
}
```

## Seguridad

- La API key de OpenAI **nunca** se expone al frontend.
- Los prompts se controlan exclusivamente en backend.
- El endpoint de IA está protegido por whitelist de origen y rate limiting diario.
- El payload se valida antes de enviarse a la IA.
- Se bloquean campos prohibidos (`systemPrompt`, `userPrompt`, `messages`, `apiKey`, etc.) en cualquier nivel del payload para prevenir prompt injection.
- En producción se exige `OPENAI_API_KEY` y `ALLOWED_ORIGINS` al arrancar.

## Filosofía

- La IA **no recomienda** comprar o vender.
- La IA **no predice** precios.
- Solo transforma facts deterministas (calculados en frontend) en una explicación breve y natural.
