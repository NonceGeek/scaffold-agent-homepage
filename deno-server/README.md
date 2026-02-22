# Movement x402 Deno Server

> A Deno-based x402 payment gateway server for Movement blockchain & Aptos blockchain.

> Refer: https://github.com/Rahat-ch/movement-x402

## 🎯 Overview

This server implements the **x402 HTTP payment protocol** to enable micropayments on the Movement blockchain. Protected endpoints require payment in $MOVE tokens before granting access to premium content.

## 🚀 Quick Start

### Prerequisites

- [Deno](https://deno.land/) v1.37 or higher

```bash
# macOS/Linux
curl -fsSL https://deno.land/x/install/install.sh | sh

# Windows
irm https://deno.land/install.ps1 | iex
```

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Required: Wallet address to receive payments
export MOVEMENT_PAY_TO="0xYourMovementWalletAddress"

# Optional: Custom port (default: 4402)
export PORT=4402

# Optional: Admin password for protected operations
export ADMIN_PWD="your_admin_password"
```

### Run the Server

```bash
# Navigate to the deno-server directory
cd deno-server

# Run with required permissions
deno run --allow-net --allow-read --allow-env main.tsx

# Or use watch mode for development
deno run --allow-net --allow-read --allow-env --watch main.tsx
```

The server will start on `http://localhost:4402`

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server info and pay-to address |
| GET | `/health` | Health check |
| GET | `/docs` | API documentation (Markdown) |
| GET | `/v2/docs/html` | API documentation (HTML) |

### Protected Endpoints (x402 Paywall)

| Method | Endpoint | Cost | Description |
|--------|----------|------|-------------|
| GET | `/api/premium-content` | 1 $MOVE | Premium content access |

## 💰 x402 Payment Flow

```
┌─────────┐         ┌─────────┐         ┌─────────────┐
│  Client │         │  Server │         │ Facilitator │
└────┬────┘         └────┬────┘         └──────┬──────┘
     │                   │                     │
     │ GET /api/premium  │                     │
     │──────────────────>│                     │
     │                   │                     │
     │ 402 + X-PAYMENT-  │                     │
     │ RESPONSE header   │                     │
     │<──────────────────│                     │
     │                   │                     │
     │ Process Payment   │                     │
     │─────────────────────────────────────────>
     │                   │                     │
     │ Payment Proof     │                     │
     │<─────────────────────────────────────────
     │                   │                     │
     │ GET /api/premium  │                     │
     │ + X-PAYMENT header│                     │
     │──────────────────>│                     │
     │                   │                     │
     │                   │ Verify Payment      │
     │                   │────────────────────>│
     │                   │                     │
     │                   │ Verified            │
     │                   │<────────────────────│
     │                   │                     │
     │ 200/302 Content   │                     │
     │<──────────────────│                     │
```

### Step-by-Step

1. **Request Protected Resource**: Client makes request without payment
2. **Receive Payment Requirements**: Server responds with 402 and `X-PAYMENT-RESPONSE` header
3. **Process Payment**: Client pays via the facilitator service
4. **Submit Payment Proof**: Client retries with `X-PAYMENT` header containing proof
5. **Access Granted**: Server verifies and returns protected content

## 🧪 Testing

### Using cURL

```bash
# Health check
curl http://localhost:4402/health

# Get server info
curl http://localhost:4402/

# Request premium content (returns 402)
curl -i http://localhost:4402/api/premium-content

# Request with payment proof
curl -i http://localhost:4402/api/premium-content \
  -H 'X-PAYMENT: {"proof":"payment_proof_here"}'
```

### Using JavaScript

```javascript
const response = await fetch('http://localhost:4402/api/premium-content');

if (response.status === 402) {
  const paymentInfo = JSON.parse(
    response.headers.get('X-PAYMENT-RESPONSE')
  );
  console.log('Payment required:', paymentInfo);
  
  // Process payment with facilitator...
  // Then retry with X-PAYMENT header
}
```

## 🛠️ Project Structure

```
deno-server/
├── main.tsx          # Main server file with x402 middleware
├── apidoc.md         # API documentation
├── README.md         # This file
├── deno.json         # Deno configuration
└── deno.lock         # Dependency lock file
```

## ⚙️ Configuration

### Payment Configuration

Edit `PAYMENT_CONFIG` in `main.tsx` to add or modify protected routes:

```typescript
const PAYMENT_CONFIG = {
  "GET /api/premium-content": {
    network: "movement",
    asset: "0x1::aptos_coin::AptosCoin",
    maxAmountRequired: "1", // Smallest unit of $MOVE
    description: "pay token to get Coupon.",
    mimeType: "application/json",
    maxTimeoutSeconds: 600
  },
  // Add more protected routes here
};
```

### Facilitator Service

The server uses StableYard's facilitator service:
- URL: `https://facilitator.stableyard.fi`
- Handles payment processing and verification on Movement blockchain

## 🚀 Deployment

### Deno Deploy (Recommended)

1. Push code to GitHub
2. Visit [dash.deno.com](https://dash.deno.com)
3. Create new project and link repository
4. Set environment variables in the dashboard
5. Set entry point to `deno-server/main.tsx`

### Docker

```dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app
COPY . .

RUN deno cache main.tsx

EXPOSE 4402

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "main.tsx"]
```

### Systemd Service

```ini
[Unit]
Description=Movement x402 Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/x402-server
Environment=MOVEMENT_PAY_TO=0x...
ExecStart=/usr/local/bin/deno run --allow-net --allow-read --allow-env main.tsx
Restart=always

[Install]
WantedBy=multi-user.target
```

## 🔒 Security Notes

### Required Deno Permissions

| Permission | Purpose |
|------------|---------|
| `--allow-net` | HTTP server and facilitator communication |
| `--allow-read` | Read documentation files |
| `--allow-env` | Access environment variables |

### Production Checklist

- [ ] Set secure `ADMIN_PWD`
- [ ] Enable payment verification (uncomment in `x402PaywallMiddleware`)
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 4402
lsof -i :4402

# Kill the process
kill -9 <PID>
```

### Payment Verification Disabled

The test environment has verification commented out. For production, uncomment the verification code in `x402PaywallMiddleware`:

```typescript
const verifyResponse = await fetch(`${FACILITATOR_URL}/verify`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    payment: paymentData,
    payTo: Deno.env.get("MOVEMENT_PAY_TO"),
    network: paymentConfig.network,
    asset: paymentConfig.asset,
    maxAmountRequired: paymentConfig.maxAmountRequired
  })
});

if (!verifyResponse.ok) {
  // Handle verification failure
}
```

## 📚 Related Resources

- [x402 Protocol Specification](https://github.com/coinbase/x402)
- [Movement Network Documentation](https://docs.movementlabs.xyz/)
- [Deno Documentation](https://deno.land/manual)
- [Oak Framework](https://oakserver.github.io/oak/)

## 📝 License

See main project [LICENSE](../LICENSE) file.

---

**Built with ❤️ using Deno, Oak, and x402 Protocol on Movement Blockchain**
