# Scaffold AI Agent Worker

> [https://scaffold-agent-workers.leeduckgo.com/](https://scaffold-agent-workers.leeduckgo.com/)
>
> [https://youtu.be/Z4dJW45gvww](https://youtu.be/Z4dJW45gvww)
> 
> A scaffold project for building AI Agent Workers that can actually earn tokens by their working, based on the **x402 HTTP payment protocol** on Movement blockchain.

## 🎯 Overview

This project demonstrates how to build an **AI Agent Worker** that uses the [x402 protocol](https://x402.leeduckgo.com/docs/html) to enable micropayments for AI services. The agent can provide both free and paid tiers of service, earning $MOVE tokens for premium content access.

### Key Features

- 🤖 **AI Agent Profile** - Display agent information, avatar, and description
- 💸 **x402 Payment Integration** - Implement micropayments using Movement blockchain
- 🆓 **Free Tier** - Chatbot access for all users
- 💰 **Premium Tier** - Paid content access with coupon rewards
- 🔌 **Wallet Integration** - Support for Movement/Aptos wallets
- 🎨 **Modern UI** - Built with Next.js, Tailwind CSS, and shadcn/ui

## 📁 Project Structure

```
scaffold-movement-ai-agent-worker/
├── scaffold-worker/       # Next.js frontend application
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks (x402 payment)
│   └── public/          # Static assets (avatar, etc.)
│
├── deno-server/          # Deno backend server
│   ├── main.tsx         # x402 payment gateway server
│   ├── apidoc.md        # API documentation
│   └── README.md        # Server documentation
│
└── LICENSE              # Apache 2.0 License
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Deno** 1.37+ (for backend server)
- A **Movement/Aptos wallet** (e.g., Nightly Wallet)

### 1. Start the Backend Server

```bash
cd deno-server

# Set environment variables
export MOVEMENT_PAY_TO="0xYourMovementWalletAddress"
export PORT=4403  # Optional, defaults to 4403

# Run the server
deno run --allow-net --allow-read --allow-env main.tsx
```

The server will start on `http://localhost:4403`

See [deno-server/README.md](./deno-server/README.md) for detailed server documentation.

### 2. Start the Frontend

```bash
cd scaffold-worker

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_X402_SERVER_URL=http://localhost:4403" > .env.local

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 💰 x402 Payment Flow

```
┌─────────┐         ┌─────────┐         ┌─────────────┐
│  Client │         │  Server │         │ Facilitator │
└────┬────┘         └────┬────┘         └──────┬──────┘
     │                   │                     │
     │ GET /api/premium  │                     │
     │──────────────────>│                     │
     │                   │                     │
     │ 402 + accepts[]   │                     │
     │<──────────────────│                     │
     │                   │                     │
     │ Process Payment   │                     │
     │────────────────────────────────────────>│
     │                   │                     │
     │ Payment Proof     │                     │
     │<────────────────────────────────────────│
     │                   │                     │
     │ GET + X-PAYMENT   │                     │
     │──────────────────>│                     │
     │                   │ Verify Payment      │
     │                   │────────────────────>│
     │                   │                     │
     │                   │ Verified            │
     │                   │<────────────────────│
     │                   │                     │
     │ 200 + Coupon Data │                     │
     │<──────────────────│                     │
```

## 🔧 Configuration

### Frontend Environment Variables

Create `scaffold-worker/.env.local`:

```bash
# x402 Server URL
NEXT_PUBLIC_X402_SERVER_URL=http://localhost:4403
# For production: https://x402.leeduckgo.com
```

### Backend Environment Variables

Set these in your shell or `.env` file:

```bash
# Required: Wallet address to receive payments
export MOVEMENT_PAY_TO="0xYourMovementWalletAddress"

# Optional: Server port (default: 4403)
export PORT=4403
```

## 📚 Documentation

- **API Documentation**: [deno-server/apidoc.md](./deno-server/apidoc.md)
- **Server README**: [deno-server/README.md](./deno-server/README.md)
- **x402 Protocol**: [https://x402.leeduckgo.com/docs/html](https://x402.leeduckgo.com/docs/html)
- **Movement Network**: [https://docs.movementnetwork.xyz/](https://docs.movementnetwork.xyz/)

## 🏗️ Architecture

### Frontend (scaffold-worker)

- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS + shadcn/ui components
- **Wallet**: @aptos-labs/wallet-adapter-react
- **Payments**: Custom x402 payment hook
- **State**: React hooks (useState)

### Backend (deno-server)

- **Runtime**: Deno
- **Framework**: Oak (Express-like for Deno)
- **Payment**: x402 protocol middleware
- **CORS**: oakCors with full cross-origin support

## 🎨 Features Showcase

### Free Tier
- 🆓 **AI ChatBot** - Accessible to all users
- 💬 Chat with the Hackathon Project Analyzer
- 🔗 Direct link to chatbot interface

### Premium Tier (Level 1)
- 💰 **Pay 1 $MOVE** - Minimal payment via x402 protocol
- 🎫 **Get Coupon** - Receive exclusive coupon after payment
- 📋 **Coupon Details Modal** - Display coupon address, private key, and metadata
- 🔗 **Agent Market Integration** - Submit tasks using the coupon

## 🔒 Security Notes

- ⚠️ **Payment Verification**: Currently disabled in test environment
- ✅ **Production**: Uncomment facilitator verification in `deno-server/main.tsx`
- 🔐 **Private Keys**: Never commit `.env.local` files
- 🌐 **CORS**: Configured for cross-origin requests

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_X402_SERVER_URL`
4. Deploy automatically

### Backend (Deno Deploy)

1. Push code to GitHub
2. Create project on [Deno Deploy](https://dash.deno.com)
3. Set environment variables
4. Deploy from `deno-server/main.tsx`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **x402 Protocol** - Coinbase's HTTP-native micropayment protocol
- **Movement Network** - EVM-compatible blockchain built on Aptos
- **NonceGeek** - Original scaffold creator

## 📧 Contact

Created by [leeduckgo@NonceGeek](https://x.com/0xleeduckgo)

---

**Built with ❤️ using Next.js, Deno, and x402 Protocol on Movement Blockchain**
