"use client";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { WalletIcon, BoltIcon, CoinsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const routes = [
  {
    href: "workflows",
    label: "Sonic Automations",
    icon: BoltIcon,
  },
  {
    href: "credentials",
    label: "Sonic Wallets",
    icon: WalletIcon,
  
  },
  {
    href: "buy-tokens",
    label: "Buy Tokens",
    icon: CoinsIcon,
   
  }
];

function DesktopSidebar() {
  const pathname = usePathname();

  const activeRoute =
    routes.find(
      (route) => route.href.length > 0 && pathname.includes(route.href)
    ) || routes[0];

  return (
    <div className="hidden relative md:block min-w-[280px] max-w-[280px] h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="flex items-center justify-center h-[60px] px-4">
        <Logo />
      </div>
      <div className="p-4 mb-6 mx-4 bg-primary/5 rounded-lg">
        <div className="text-xs font-medium text-muted-foreground mb-1">Network</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium">Sonic Blaze Testnet</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {routes.map((route) => (
            <Link key={route.href} href={`/${route.href}`}>
            <Button
              variant={activeRoute.href === route.href ? "default" : "ghost"}
              className={`w-full justify-start gap-2 ${
              activeRoute.href === route.href
            ? "bg-blue-500/10 hover:bg-blue-500/20 text-foreground"
            : "hover:bg-secondary/80 hover:text-blue-500/80 text-foreground"
              }`}
            >
              <route.icon size={20} className={`${
              activeRoute.href === route.href
            ? "text-blue-500"
            : "text-gray-500 group-hover:text-blue-500/80"
              }`} />
              <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{route.label}</span>
               
              </div>
            </Button>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-4 p-3 bg-primary/5 rounded-lg text-xs text-muted-foreground">
        <div className="flex justify-between items-center mb-1">
          <span>Sonic Testnet Faucet:</span>
        </div>
        <a 
          href="https://testnet.soniclabs.com/account" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline text-xs font-medium"
        >
          https://testnet.soniclabs.com/account
        </a>
      </div>
    </div>
  );
}

export default DesktopSidebar;
