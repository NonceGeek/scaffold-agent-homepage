# ChatServer API Documentation

> API documentation for the chat server.

## Base URL

```
http://localhost:4402
```

---

## Public Endpoints

### `GET /`

Get server information and pay-to address.

**Response:**
```
Hello from Movement x402 Server!
Pay-to address: <MOVEMENT_PAY_TO>
```

---

### `GET /health`

Health check endpoint for monitoring and load balancers.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-04T12:00:00.000Z"
}
```

---

### `GET /docs`

Get API documentation in Markdown format.

**Response:** Raw Markdown content of this documentation.

---

### `GET /v2/docs/html`

Get API documentation rendered as HTML with GitHub Flavored Markdown styling.

**Response:** HTML page with rendered documentation.

---

### `POST /api/chat`

Chat with the AI agent (powered by Alibaba DashScope / Qwen).

**Request Body:**
```json
{
  "messages": [
    { "role": "system", "content": "You are LeanCoder, a micro program generator." },
    { "role": "user", "content": "Generate a simple counter in HTML+JS" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | array | Yes | Array of chat messages in OpenAI-compatible format. Each message has `role` (`system`, `user`, or `assistant`) and `content`. |

**Success Response (200):**
```json
{
  "text": "Here is a simple counter..."
}
```

**Error Responses:**

- `400` — Missing or invalid `messages` array
```json
{
  "error": "messages array is required"
}
```

- `500` — API key not configured or internal error
```json
{
  "error": "DASHSCOPE_API_KEY not configured"
}
```

**Example:**
```bash
curl -X POST http://localhost:4402/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello, what can you do?"}]}'
```

---

**Built with ❤️ using Deno, Oak, and x402 Protocol**

