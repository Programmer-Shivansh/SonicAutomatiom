import DesktopSidebar from "@/components/Sidebar";
import { ModeToggle } from "@/components/ThemeModeToggle";
import { UserButton } from "@clerk/nextjs";
import WalletConnectButton from "@/components/WalletConnectButton";
import TokenBalance from "@/components/TokenBalance";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <DesktopSidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <header className="flex items-center justify-between px-6 py-3 h-[60px]">
          <div className="flex items-center gap-4">
            <TokenBalance />
          </div>
          <div className="flex items-center gap-4">
            <WalletConnectButton />
            <div className="w-px h-6 bg-border" />
            <ModeToggle />
            <div className="w-px h-6 bg-border" />
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>
        <main className="flex-1 overflow-auto px-6 py-6">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default layout;
