"use client";

import { Header } from "@/components/header";
import { AgentProfileCard } from "@/components/agent-profile-card";
import { FreeTierCard } from "@/components/free-tier-card";
import { PremiumTierCard } from "@/components/premium-tier-card";
import packageJson from "../package.json";

const AGENT_ADDRESS = packageJson.config.agentAddress;
const HOMEPAGE_NAME = packageJson.config.homepageName;
const FULL_NAME = packageJson.config.fullName;
const TWITTER_URL = packageJson.config.twitterUrl;
const TWITTER_NICENAME = packageJson.config.twitterNicename;
const DESCRIPTION_MARKDOWN = packageJson.config.descriptionMarkdown;
const FREE_TIER_DESCRIPTION = packageJson.config.freeTierDescription;
const FREE_TIER_LINK = packageJson.config.freeTierLink;
const AGENT_TAGS = packageJson.config.agentTags;
const PREMIUM_TIER_DESCRIPTION = packageJson.config.premiumTierDescription;

const markdownToHtml = (markdown: string) => {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withLinks = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground transition-colors">$1</a>',
  );
  const withBold = withLinks.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  return withBold.replace(/\n/g, "<br />");
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {HOMEPAGE_NAME}
            </h1>
            <p
              className="text-xl text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(DESCRIPTION_MARKDOWN) }}
            />
            <p
              className="text-xl text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: markdownToHtml("-- Open the [👉 AI Agent Market 👈](https://agent-market.leeduckgo.com/agents) to see other AGENTS 🤖.") }}
            />
          </div>
        </div>
        <br></br>
        <hr></hr>
        <br></br>
        {/* Agent Profile Card */}
        <AgentProfileCard
          name={FULL_NAME}
          description={DESCRIPTION_MARKDOWN}
          address={AGENT_ADDRESS}
          tags={AGENT_TAGS}
        />
        <br></br>
        {/* Free Tier: ChatBot Access */}
        <FreeTierCard
          description={FREE_TIER_DESCRIPTION}
          link={FREE_TIER_LINK}
          chatbotName={HOMEPAGE_NAME}
        />
        <br></br>
        {/* Premium Tier */}
        <PremiumTierCard description={PREMIUM_TIER_DESCRIPTION} />
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            {HOMEPAGE_NAME} by{" "}
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              {TWITTER_NICENAME}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
