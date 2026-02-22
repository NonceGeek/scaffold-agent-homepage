# Movement x402 Server API Documentation

> API documentation for the Movement x402 payment gateway server.

## Base URL

```
https://x402.leeduckgo.com
```

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

## Protected Endpoints (x402 Paywall)

These endpoints require payment via the x402 protocol.

### `GET /api/premium-content`

Access premium content after successful payment.

#### Payment Configuration

| Field | Value |
|-------|-------|
| Network | `movement` |
| Asset | `0x1::aptos_coin::AptosCoin` |
| Amount | `1` (minimal $MOVE) |
| Description | Pay token to get Coupon |
| Timeout | 600 seconds |

#### Request Flow

**Step 1: Initial Request (No Payment)**

```bash
curl -i http://localhost:4402/api/premium-content
```

**Response (402 Payment Required):**
```
HTTP/1.1 402 Payment Required
Content-Type: application/json
X-PAYMENT-RESPONSE: {"network":"movement","payTo":"0x...","asset":"0x1::aptos_coin::AptosCoin","maxAmountRequired":"1","description":"pay token to get Coupon.","mimeType":"application/json","maxTimeoutSeconds":600,"facilitatorUrl":"https://facilitator.stableyard.fi"}
```

```json
{
  "error": "Payment Required",
  "message": "Please include X-PAYMENT header with payment proof"
}
```

**Step 2: Make Payment**

Use the facilitator URL from `X-PAYMENT-RESPONSE` header to process payment:
- Facilitator URL: `https://facilitator.stableyard.fi`

**Step 3: Request with Payment Proof**

```bash
curl -i http://localhost:4402/api/premium-content \
  -H "X-PAYMENT: {\"proof\":\"...payment_proof_data...\"}"
```

**Response (302 Redirect):**
```
HTTP/1.1 302 Found
Location: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

---

## x402 Payment Protocol

### Overview

The x402 protocol enables HTTP-native micropayments on the Movement blockchain. When accessing protected resources:

1. **402 Response**: Server returns payment requirements in `X-PAYMENT-RESPONSE` header
2. **Payment**: Client processes payment through the facilitator
3. **Verification**: Client sends payment proof in `X-PAYMENT` header
4. **Access**: Server verifies and grants access to protected content

### Headers

| Header | Direction | Description |
|--------|-----------|-------------|
| `X-PAYMENT-RESPONSE` | Server → Client | Payment requirements (JSON) |
| `X-PAYMENT` | Client → Server | Payment proof (JSON) |

### Payment Response Schema

```json
{
  "network": "movement",
  "payTo": "0x...",
  "asset": "0x1::aptos_coin::AptosCoin",
  "maxAmountRequired": "1",
  "description": "pay token to get Coupon.",
  "mimeType": "application/json",
  "maxTimeoutSeconds": 600,
  "facilitatorUrl": "https://facilitator.stableyard.fi"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `network` | string | Blockchain network (`movement`) |
| `payTo` | string | Recipient wallet address |
| `asset` | string | Token asset identifier |
| `maxAmountRequired` | string | Maximum payment amount in smallest unit |
| `description` | string | Human-readable payment description |
| `mimeType` | string | Response content type after payment |
| `maxTimeoutSeconds` | number | Payment timeout in seconds |
| `facilitatorUrl` | string | Payment facilitator service URL |

---

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized: Invalid password"
}
```

### 402 Payment Required

```json
{
  "error": "Payment Required",
  "message": "Please include X-PAYMENT header with payment proof"
}
```

### 402 Payment Verification Failed

```json
{
  "error": "Payment verification failed",
  "message": "Invalid or insufficient payment"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `4402`) |
| `MOVEMENT_PAY_TO` | Yes | Wallet address to receive payments |
| `ADMIN_PWD` | No | Admin password for protected operations |

---

## Examples

### JavaScript/TypeScript

```typescript
// Check if payment is required
const response = await fetch('http://localhost:4402/api/premium-content');

if (response.status === 402) {
  // Get payment requirements
  const paymentInfo = JSON.parse(
    response.headers.get('X-PAYMENT-RESPONSE') || '{}'
  );
  
  console.log('Payment required:', paymentInfo);
  
  // Process payment via facilitator...
  const paymentProof = await processPayment(paymentInfo);
  
  // Retry with payment proof
  const paidResponse = await fetch('http://localhost:4402/api/premium-content', {
    headers: {
      'X-PAYMENT': JSON.stringify(paymentProof)
    }
  });
  
  // Handle redirect or content
  console.log('Access granted!', paidResponse.status);
}
```

### cURL

```bash
# Health check
curl http://localhost:4402/health

# Get server info
curl http://localhost:4402/

# Request premium content (will return 402)
curl -i http://localhost:4402/api/premium-content

# Request with payment proof
curl -i http://localhost:4402/api/premium-content \
  -H 'X-PAYMENT: {"proof":"your_payment_proof"}'
```

---

## Facilitator Service

The facilitator (`https://facilitator.stableyard.fi`) handles:

- Payment processing on Movement blockchain
- Transaction verification
- Payment proof generation

### Verification Endpoint

```
POST https://facilitator.stableyard.fi/verify
```

**Request Body:**
```json
{
  "payment": { /* payment proof data */ },
  "payTo": "0x...",
  "network": "movement",
  "asset": "0x1::aptos_coin::AptosCoin",
  "maxAmountRequired": "1"
}
```

---

**Built with ❤️ using Deno, Oak, and x402 Protocol**

