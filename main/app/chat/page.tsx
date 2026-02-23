"use client";

import { useEffect, useRef } from "react";
import { DeepChat } from "deep-chat-react";
import { Header } from "@/components/header";
import packageJson from "../../package.json";

const CHATBOT_NAME = packageJson.config.homepageName;
const CHATBOT_DESCRIPTION = packageJson.config.chatbotDescription;
const CHATBOT_INTRO_MESSAGE = packageJson.config.chatbotIntroMessage;
const CHAT_API_URL = packageJson.config.chatApiUrl;

export default function ChatPage() {
  const chatRef = useRef<any>(null);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    el.request = {
      url: CHAT_API_URL,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    // Map Deep Chat's { text } field to the API's { content } field
    el.requestInterceptor = (details: any) => {
      const messages = (details.body.messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.text ?? msg.content ?? "",
      }));
      details.body = { messages };
      return details;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{CHATBOT_NAME} Chat</h1>
          <p className="text-muted-foreground">
            {CHATBOT_DESCRIPTION}
          </p>
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm [&>deep-chat]:!w-full [&>deep-chat]:!block">
            <DeepChat
              ref={chatRef}
              style={{ borderRadius: "12px", height: "560px" }}
              introMessage={{ text: CHATBOT_INTRO_MESSAGE }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
