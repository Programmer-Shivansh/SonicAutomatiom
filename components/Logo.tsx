"use client";

import { SparklesIcon } from "lucide-react";

interface LogoProps {
  iconSize?: number;
  fontSize?: string;
}

function Logo({ iconSize = 24, fontSize = "text-2xl" }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <SparklesIcon size={iconSize} className="stroke-primary animate-pulse" />
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full"></div>
      </div>
      <span className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 ${fontSize}`}>
        SonicAutomation
      </span>
    </div>
  );
}

export default Logo;
