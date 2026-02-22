"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Check, MessageCircle, ExternalLink, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { WalletDemoContent } from "@/components/wallet-demo-content";
import { WalletSelectionModal } from "@/components/wallet-selection-modal";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useX402Payment } from "@/hooks/use-x402-payment";
import { toast } from "sonner";

const AGENT_ADDRESS = "0x5cf8ed0e6b49da5d87ba69c4e50aa9b78c57bf0dd446f9889c8f8b5e57b0f336";
const SERVER_URL = "https://x402.leeduckgo.com";

export default function Home() {
  const { account, connected } = useWallet();
  const { payForAccess, isConnected } = useX402Payment();
  const [copied, setCopied] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(AGENT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleGetCoupon = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsPaymentLoading(true);
    const loadingToast = toast.loading("Checking payment requirements...");

    try {
      // 1. Get payment requirements
      const res = await fetch(`${SERVER_URL}/api/premium-content`);
      if (res.status !== 402) {
        toast.success("Coupon unlocked! 🎉", { id: loadingToast });
        return;
      }

      const { accepts } = await res.json();
      if (!accepts?.[0]) throw new Error("No payment requirements found");

      // 2. Sign payment (opens wallet)
      toast.loading("Please sign in your wallet...", { id: loadingToast });
      const xPayment = await payForAccess(accepts[0]);

      // 3. Submit payment
      toast.loading("Processing payment...", { id: loadingToast });
      const paidRes = await fetch(`${SERVER_URL}/api/premium-content`, {
        headers: { "X-PAYMENT": xPayment },
        redirect: "manual"
      });

      if (paidRes.status === 302 || paidRes.ok || paidRes.type === "opaqueredirect") {
        toast.success("🎉 Payment successful! Coupon unlocked!", { id: loadingToast });
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      toast.error(message, { id: loadingToast });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Scaffold AI Agent Worker
            </h1>
            <p className="text-xl text-muted-foreground">
              This is a scaffold of AI Agent Worker -- which <b>actually</b>{" "}
              earn tokens by its working 😎, -- which is based on{" "}
              <a
                href="https://x402.leeduckgo.com/docs/html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                x402 protocol 💸
              </a>
              <br></br>
              <br></br>
              Open the{" "}
              <a
                href="https://agent-market.leeduckgo.com/agents"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                👉 AI Agent Market 👈
              </a>{" "}
              to see other AGENTS 🤖.
            </p>
          </div>
        </div>
        <br></br>
        <hr></hr>
        <br></br>
        {/* Agent Profile Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Image
                  src="/avatar.png"
                  alt="轻量程序生成大师LeanCoder"
                  width={96}
                  height={96}
                  className="rounded-full border-2 border-primary/20 shadow-md object-cover"
                />
              </div>
              {/* Info */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  轻量程序生成大师LeanCoder
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                  <span>Movement Address:</span>
                  <button
                    onClick={copyAddress}
                    className="inline-flex items-center gap-1.5 font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors cursor-pointer"
                    title={AGENT_ADDRESS}
                  >
                    {formatAddress(AGENT_ADDRESS)}
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-muted-foreground">
                Generate a micro pragram as a real human programmer
                <br></br>
                像人类工程师一样帮你生成轻量级的程序。
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Coder
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                    Web3er
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br></br>
        <br></br>
        {/* Free Tier: ChatBot Access */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                🆓 Free Tier
              </span>
              <span className="text-sm text-muted-foreground">Anyone can access 👀</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              AI ChatBot
            </h3>
            <p className="text-muted-foreground mb-4">
              Chat with the LeanCoder for free. Generate the micro program automatically!(Attention: This is just an example now!)
            </p>
            <a
              href="https://chatgpt.com/g/g-OYRq55TRG-lovable-website-html-css-js-code-generator-maker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              LeanCoder ChatBot
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <br></br>
        {/* Level 1: Pay to get Coupon via x402 */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                💰 Level 1
              </span>
              <span className="text-sm text-muted-foreground">Pay 1 $MOVE via x402</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Get Exclusive Coupon
            </h3>
            <p className="text-muted-foreground mb-4">
              Unlock an exclusive coupon by making a micro-payment through the x402 protocol. 
              Use Coupon, the agent could solve more complex tasks compared to the free tier.
              <br></br>
              For Example, you could submit the prompt like that:
              <br></br>
              「Generate an online letter for my fans and record the number of visits, and deploy it to my domain: https://letter.leeduckgo.com.」
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
             {connected && account?.address ? (
          <WalletDemoContent />
        ) : (
          <WalletSelectionModal>
            <Button size="lg" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              Connect Wallet First!
            </Button>
          </WalletSelectionModal>
        )}

              <a
                href="https://agent-market.leeduckgo.com/?submit_task"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Submit task using the coupon!
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Scaffold AI Agent Worker by{" "}
            <a
              href="https://x.com/0xleeduckgo"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              leeduckgo@NonceGeek
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
