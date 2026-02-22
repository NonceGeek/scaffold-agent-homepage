/**
 * Deno Server for Letter Project
 * A simple Oak-based web server for the "致粉丝的信" project
 * Provides API endpoints and serves static content
 */

import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import type { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { CSS, render } from "@deno/gfm";

// Initialize Deno KV database
// const kv = await Deno.openKv();

// x402 Payment configuration
const FACILITATOR_URL = "https://facilitator.stableyard.fi";
const PAYMENT_CONFIG = {
  "GET /api/premium-content": {
    network: "movement",
    asset: "0x1::aptos_coin::AptosCoin",
    maxAmountRequired: "1", // The maximum amount of $MOVE
    description: "pay 0.000001 $MOVE to get Coupon.",
    mimeType: "application/json",
    maxTimeoutSeconds: 600
  }
};
// Admin password verification function
async function verifyAdminPassword(
  context: any,
  password: string
): Promise<boolean> {
  const adminPwd = Deno.env.get("ADMIN_PWD");
  if (!password || password !== adminPwd) {
    context.response.status = 401;
    context.response.body = { error: "Unauthorized: Invalid password" };
    return false;
  }
  return true;
}

// x402 Paywall middleware
async function x402PaywallMiddleware(context: Context, next: () => Promise<unknown>) {
  const method = context.request.method;
  const pathname = new URL(context.request.url).pathname;
  const routeKey = `${method} ${pathname}`;
  
  const paymentConfig = PAYMENT_CONFIG[routeKey as keyof typeof PAYMENT_CONFIG];
  
  // If no payment required for this route, continue
  if (!paymentConfig) {
    await next();
    return;
  }
  
  const paymentHeader = context.request.headers.get("X-PAYMENT");
  // console.log("paymentHeader:", paymentHeader);
  
  // If no payment header, return 402 with payment details
  if (!paymentHeader) {
    context.response.status = 402;
    context.response.headers.set("Content-Type", "application/json");
    context.response.headers.set("Access-Control-Expose-Headers", "X-PAYMENT-RESPONSE");
    
    const paymentDetails = {
      network: paymentConfig.network,
      payTo: Deno.env.get("MOVEMENT_PAY_TO"),
      asset: paymentConfig.asset,
      maxAmountRequired: paymentConfig.maxAmountRequired,
      description: paymentConfig.description,
      mimeType: paymentConfig.mimeType,
      maxTimeoutSeconds: paymentConfig.maxTimeoutSeconds,
      facilitatorUrl: FACILITATOR_URL
    };
    
    context.response.headers.set("X-PAYMENT-RESPONSE", JSON.stringify(paymentDetails));
    
    // Return payment details in body for client compatibility
    context.response.body = {
      error: "Payment Required",
      message: "Please include X-PAYMENT header with payment proof",
      accepts: [paymentDetails]  // Add accepts array for client
    };
    return;
  }
  
  // Verify payment with facilitator
  try {
    const paymentData = paymentHeader;
    // !!! IN THE TEST ENVIRONMENT, ALWAYS RESP OK Here.
    // !!! REMEMBER TO RECOVER THE VERIFICATION IN THE PRODUCTION ENVIRONMENT.

    // const verifyResponse = await fetch(`${FACILITATOR_URL}/verify`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     payment: paymentData,
    //     payTo: Deno.env.get("MOVEMENT_PAY_TO"),
    //     network: paymentConfig.network,
    //     asset: paymentConfig.asset,
    //     maxAmountRequired: paymentConfig.maxAmountRequired
    //   })
    // });
    
    // if (!verifyResponse.ok) {
    //   context.response.status = 402;
    //   context.response.body = {
    //     error: "Payment verification failed",
    //     message: "Invalid or insufficient payment"
    //   };
    //   return;
    // }
    
    // Payment verified, proceed to route handler
    await next();
  } catch (error) {
    console.error("Payment verification error:", error);
    context.response.status = 402;
    context.response.body = {
      error: "Payment verification failed",
      message: "Could not verify payment"
    };
  }
}

// Initialize router
const router = new Router();

// API Routes
router
  .get("/", async (context) => {
    context.response.body = `Hello from Movement x402 Server!\nPay-to address: ${Deno.env.get("MOVEMENT_PAY_TO")}`;
  })
  .get("/health", (context) => {
    // Health check endpoint
    context.response.body = {
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  })
  .get("/api/premium-content", (context) => {
    // Premium content endpoint (protected by x402 paywall)
    // one way: redirect to a web page
    // context.response.status = 302;
    // context.response.headers.set("Location", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    // second way: return a JSON resp(Here is the example resp).
    context.response.body = {
      "coupon": "0x4C43e5c0a2DF68d2F2E5Df9f45b96963bE182187",
      "privateKey": "0xfda5841cd51de62ea90a8d451d18524a17e4346a5ba64bc70e3d9bd2a2624b87",
      "createdAt": "2025-12-21 10:44:32.949167+00",
      // "fee": "3300000",
      "fee_formated": "0.000001",
      "fee_unit": "MOVE",
      "issuer": "641f2ecf-a3d4-456d-ad58-39a2146e71db",
      "if_used": false,
    };
  })
  .get("/docs", async (context) => {
    try {
      const readmeText = await Deno.readTextFile("./apidoc.md");
      context.response.body = readmeText;
    } catch (err) {
      console.error("Error reading README:", err);
      context.response.status = 500;
      context.response.body = { error: "Could not load documentation" };
    }
  })
  .get("/docs/html", async (context) => {
    try {
      // Read README.md file
      const readmeText = await Deno.readTextFile("./apidoc.md");

      // Render markdown to HTML with GFM styles
      const body = render(readmeText);

      // Create complete HTML document with GFM CSS
      const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TaiShang AI Agent Market API Documentation</title>
      <style>
        ${CSS}
        body {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
      </style>
    </head>
    <body>
    ${body}
    </body>
    </html>`;

      // Set response headers for HTML
      context.response.headers.set("Content-Type", "text/html; charset=utf-8");
      context.response.body = html;
    } catch (err) {
      console.error("Error reading README:", err);
      context.response.status = 500;
      context.response.body = { error: "Could not load documentation" };
    }
  })
  ;

// Initialize application
const app = new Application();

// Middleware: Error handling
app.use(async (context, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Error:", err);
    context.response.status = 500;
    context.response.body = {
      success: false,
      error: "Internal server error",
    };
  }
});

// Middleware: Logger
app.use(async (context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${context.request.method} ${context.request.url} - ${ms}ms`);
});

// Middleware: CORS for all routes
app.use(oakCors({
  origin: "*",
  allowedHeaders: "*",
  exposedHeaders: ["X-PAYMENT-RESPONSE"]
}));

// Middleware: x402 Paywall
app.use(x402PaywallMiddleware);

// Middleware: Router
app.use(router.routes());

// Start server
const port = Deno.env.get("SERVER_PORT") || 4403;

console.info(`
  🚀 CORS-enabled web server listening on port ${port}
  
  🌐 Visit: http://localhost:${port}
  💰 Pay-to address: ${Deno.env.get("MOVEMENT_PAY_TO")}
  `);

await app.listen({ port });