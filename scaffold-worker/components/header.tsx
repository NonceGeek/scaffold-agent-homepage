"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletSelectionModal } from "@/components/wallet-selection-modal";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { account, connected, disconnect } = useWallet();

  // Format address for display (e.g., 0x1234...5678)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b border-border relative">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-foreground hover:text-primary transition-colors">
          <Image
            src="/avatar.png"
            alt="AI Agent Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span>Scaffold AI Agent Worker</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <a 
            href="https://docs.movementnetwork.xyz/devs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors"
          >
            Docs
          </a>
          <ThemeToggle />
          {connected && account?.address ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground font-mono">
                {formatAddress(account.address.toString())}
              </span>
              <Button variant="ghost" size="icon" onClick={disconnect} title="Disconnect">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <WalletSelectionModal>
              <Button variant="outline" size="sm">
                Connect Wallet
              </Button>
            </WalletSelectionModal>
          )}
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-50">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <a
              href="https://docs.movementnetwork.xyz/devs"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </a>
            <div className="pt-2 border-t border-border">
              {connected && account?.address ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground font-mono">
                    {formatAddress(account.address.toString())}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      disconnect();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <WalletSelectionModal>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connect Wallet
                  </Button>
                </WalletSelectionModal>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}