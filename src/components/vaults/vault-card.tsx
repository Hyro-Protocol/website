"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Shield,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

import type { VaultData } from "@/lib/vaults/types";
import { Sparkline } from "./sparkline";
import { PerformanceBadge } from "./performance-badge";
import { VaultPreview } from "./vault-preview";

interface VaultCardProps {
  vault: VaultData;
  className?: string;
}

const formatTvl = (tvl: number): string => {
  if (tvl >= 1_000_000) {
    return `$${(tvl / 1_000_000).toFixed(2)}M`;
  }
  if (tvl >= 1_000) {
    return `$${(tvl / 1_000).toFixed(1)}K`;
  }
  return `$${tvl.toFixed(0)}`;
};

const getRiskColor = (rating: string) => {
  switch (rating) {
    case "conservative":
      return "text-green-500 bg-green-500/10";
    case "moderate":
      return "text-blue-500 bg-blue-500/10";
    case "aggressive":
      return "text-orange-500 bg-orange-500/10";
    case "speculative":
      return "text-red-500 bg-red-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export function VaultCard({ vault, className }: VaultCardProps) {
  const allTimePerf = vault.performance.allTime;
  const isPositive = allTimePerf !== null && allTimePerf > 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <CardContent className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <VaultPreview vault={vault} side="bottom" align="start">
            <div className="flex items-center gap-3 min-w-0 cursor-pointer">
              {/* Vault Avatar */}
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
                <span className="text-lg font-bold">
                  {vault.name.charAt(0)}
                </span>
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold truncate hover:text-primary transition-colors">{vault.name}</h3>
                  {vault.manager?.verified && (
                    <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {vault.manager?.name || "Anonymous"}
                </p>
              </div>
            </div>
          </VaultPreview>
          
          {/* Risk Badge */}
          {vault.manager?.riskRating && (
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 capitalize text-xs",
                getRiskColor(vault.manager.riskRating)
              )}
            >
              {vault.manager.riskRating}
            </Badge>
          )}
        </div>
        
        {/* Chart */}
        <div className="mb-4 -mx-1">
          <Sparkline
            data={vault.historicalSnapshots.slice(-60)}
            width={280}
            height={64}
            strokeWidth={2}
            className="w-full"
          />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">TVL</p>
            <p className="text-lg font-semibold font-mono">
              {formatTvl(vault.tvl)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">All-Time Return</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : allTimePerf !== null ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : null}
              <PerformanceBadge value={allTimePerf} size="lg" />
            </div>
          </div>
        </div>
        
        {/* Performance Row */}
        <div className="flex items-center justify-between text-sm border-t border-border/50 pt-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">1D</p>
            <PerformanceBadge value={vault.performance.day1} size="sm" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">1W</p>
            <PerformanceBadge value={vault.performance.week1} size="sm" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">1M</p>
            <PerformanceBadge value={vault.performance.month1} size="sm" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">3M</p>
            <PerformanceBadge value={vault.performance.month3} size="sm" />
          </div>
        </div>
        
        {/* Action */}
        <Button
          className="w-full group/btn"
          asChild
        >
          <Link href={`/vaults/${vault.address}`}>
            View Vault
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function VaultCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-16 bg-muted/50 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="h-3 w-8 bg-muted rounded animate-pulse" />
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between border-t border-border/50 pt-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-3 w-6 bg-muted rounded animate-pulse mx-auto" />
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-9 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

