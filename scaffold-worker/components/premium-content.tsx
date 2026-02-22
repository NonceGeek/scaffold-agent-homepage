"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useX402Payment } from "@/hooks/use-x402-payment";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";


// Read from environment variable, fallback to localhost
const SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || "http://localhost:4403";

interface CouponData {
  coupon: string;
  privateKey?: string;
  createdAt?: string;
  fee_formated?: string;
  fee_unit?: string;
  issuer?: string;
  if_used?: boolean;
}

export function PremiumContent() {
  const { payForAccess, isConnected } = useX402Payment();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleUnlock = async () => {
    if (!isConnected) return toast.error("Connect wallet first");

    setIsLoading(true);
    const loadingToast = toast.loading("Checking payment...");

    try {
      // 1. Get payment requirements
      const res = await fetch(`${SERVER_URL}/api/premium-content`);
      if (res.status !== 402) {
        toast.success("Content unlocked!", { id: loadingToast });
        return window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
      }

      const { accepts } = await res.json();
      console.log("accepts", accepts);
      if (!accepts?.[0]) throw new Error("No payment requirements");

      // 2. Sign payment (opens wallet)
      toast.loading("Sign in wallet...", { id: loadingToast });
      console.log("accepts[0]", accepts[0]);
      const xPayment = await payForAccess(accepts[0]);
      // BUG: here is a bug, I skip the payForAccess function, it should be fixed in the future.
      console.log("xPayment", xPayment);
      // 3. Submit payment
      toast.loading("Processing...", { id: loadingToast });

      const paidRes = await fetch(`${SERVER_URL}/api/premium-content`, {
        headers: { "X-PAYMENT": xPayment},
        redirect: "manual"
      });

      console.log("paidRes", paidRes);
      if (paidRes.status === 200) {
        const data = await paidRes.json();
        console.log("Coupon data:", data);
        setCouponData(data);
        setShowModal(true);
        toast.success("Payment successful! 🎉", { id: loadingToast });
      } else {
      // if (paidRes.status === 302 || paidRes.ok || paidRes.type === "opaqueredirect") {
      //   window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
      //   toast.success("Payment successful!", { id: loadingToast });
      // } else {
        throw new Error("Payment failed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      toast.error(message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Get Coupon by x402 Protocol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Pay 0.000001 $MOVE to unlock exclusive content via x402 protocol.
          </p>
          <Button onClick={handleUnlock} disabled={isLoading || !isConnected} className="w-full">
            {isLoading ? "Processing..." : "Unlock (0.000001 $MOVE)"}
          </Button>
        </CardContent>
      </Card>

      {/* Coupon Data Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>🎉 Coupon Unlocked!</DialogTitle>
            <DialogDescription>
              Your payment was successful. Here are your coupon details:
            </DialogDescription>
          </DialogHeader>
          
          {couponData && (
            <div className="space-y-4">
              {/* Coupon Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon(Keep Secret!) - 兑换券</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm break-all">
                    {couponData.coupon}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(couponData.coupon, "coupon")}
                  >
                    {copied === "coupon" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Private Key */}
              {couponData.privateKey && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    ⚠️ Private Key (Keep Secret!) - 兑换券的私钥
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded text-sm break-all border border-amber-200 dark:border-amber-800">
                      {couponData.privateKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => couponData.privateKey && copyToClipboard(couponData.privateKey, "privateKey")}
                    >
                      {copied === "privateKey" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {couponData.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                    <p className="text-sm mt-1">{new Date(couponData.createdAt).toLocaleString()}</p>
                  </div>
                )}
                {couponData.fee_formated && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fee</label>
                    <p className="text-sm mt-1">{couponData.fee_formated} {couponData.fee_unit}</p>
                  </div>
                )}
                {couponData.issuer && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Issuer</label>
                    <p className="text-sm mt-1 font-mono truncate">{couponData.issuer}</p>
                  </div>
                )}
                {couponData.if_used !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-sm mt-1">
                      {couponData.if_used ? (
                        <span className="text-amber-600">Used</span>
                      ) : (
                        <span className="text-green-600">Available</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Next Step:</strong> Use this coupon in the{" "}
                  <a
                    href={`https://agent-market.leeduckgo.com/?submit_task&coupon=${couponData.coupon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    AI Agent Market
                  </a>
                  {" "}to submit tasks for the agent.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
