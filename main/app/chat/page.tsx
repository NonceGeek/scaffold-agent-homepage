"use client";

import { DeepChat } from "deep-chat-react";
import { Header } from "@/components/header";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">LeanCoder Chat</h1>
          <p className="text-muted-foreground">
            Deep Chat UI is ready on this page. Connect it to your API when you are ready.
          </p>
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <DeepChat
              style={{ borderRadius: "12px", width: "100%", height: "640px" }}
              introMessage={{ text: "Hi! Ask me anything about your project." }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
