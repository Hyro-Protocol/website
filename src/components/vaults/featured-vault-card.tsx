"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BadgeCheck, SquareArrowOutUpRight } from "lucide-react";
import type { VaultData } from "@/lib/vaults/types";
import { Sparkline } from "./sparkline";
import { PerformanceBadge } from "./performance-badge";
import { VaultPreview } from "./vault-preview";
import { ButtonGroup } from "@/components/ui/button-group";

interface FeaturedVaultCardProps {
  vault: VaultData;
  timeframe?: "3m" | "1y";
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

const getRiskLabel = (rating: string): string => {
  switch (rating) {
    case "conservative":
      return "1/5";
    case "moderate":
      return "2/5";
    case "aggressive":
      return "3/5";
    case "speculative":
      return "4/5";
    default:
      return "—";
  }
};

export function FeaturedVaultCard({
  vault,
  timeframe = "3m",
  className,
}: FeaturedVaultCardProps) {
  const performance =
    timeframe === "3m" ? vault.performance.month3 : vault.performance.year1;
  const riskLabel = vault.manager?.riskRating
    ? getRiskLabel(vault.manager.riskRating)
    : "—";

  return (
    <VaultPreview vault={vault} side="bottom" align="start">
      <Card
        className={cn(
          "group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer py-0",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <CardContent className="relative p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
                <span className="text-base font-bold">
                  {vault.name.charAt(0)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-semibold text-sm truncate">
                    {vault.name}
                  </h3>
                  {vault.manager?.verified && (
                    <BadgeCheck className="h-3 w-3 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {vault.manager?.name || "Anonymous"}
                </p>
              </div>
            </div>
          </div>

          {/* Sparkline Chart */}
          <div className="-mx-1 h-10">
            <Sparkline
              data={vault.historicalSnapshots.slice(-30)}
              width={280}
              height={40}
              strokeWidth={2}
              className="w-full"
            />
          </div>

          {/* Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Value Managed</span>
              <span className="font-semibold font-mono text-xs">
                {formatTvl(vault.tvl)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {timeframe === "3m" ? "3M" : "1Y"} Return
              </span>
              <PerformanceBadge value={performance} size="sm" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Risk Factor</span>
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 h-4 font-normal"
              >
                {riskLabel}
              </Badge>
            </div>
          </div>

          {/* Action Button */}
          <ButtonGroup className="w-full">
            <Button
              className="w-full"
              size="sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/vaults/${vault.address}`}>Join Vault</Link>
            </Button>
            <Button
              className="w-full flex-0"
              size="sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/vaults/${vault.address}`}>
                <SquareArrowOutUpRight className="size-5" />
              </Link>
            </Button>
          </ButtonGroup>
        </CardContent>
      </Card>
    </VaultPreview>
  );
}
