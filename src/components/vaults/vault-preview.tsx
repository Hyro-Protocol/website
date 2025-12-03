"use client";

import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  ExternalLink,
  Info,
  Copy,
  Shield,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  BarChart3,
  Clock,
} from "lucide-react";

import type { VaultData } from "@/lib/vaults/types";
import { Sparkline } from "./sparkline";
import { PerformanceBadge } from "./performance-badge";

interface VaultPreviewProps {
  vault: VaultData;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
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

const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getRiskColor = (rating: string) => {
  switch (rating) {
    case "conservative":
      return "text-green-500";
    case "moderate":
      return "text-blue-500";
    case "aggressive":
      return "text-orange-500";
    case "speculative":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
};

const getRiskBgColor = (rating: string) => {
  switch (rating) {
    case "conservative":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "moderate":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "aggressive":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "speculative":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

function StatRow({
  label,
  value,
  tooltip,
  className,
}: {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
  className?: string;
}) {
  const labelContent = (
    <span className="text-muted-foreground flex items-center gap-1">
      {label}
      {tooltip && <Info className="h-3 w-3" />}
    </span>
  );

  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground flex items-center gap-1 cursor-help border-b border-dashed border-muted-foreground/50">
                {label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs max-w-48">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        labelContent
      )}
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function VaultPreview({
  vault,
  children,
  side = "right",
  align = "start",
}: VaultPreviewProps) {
  const copyAddress = () => {
    navigator.clipboard.writeText(vault.address);
  };

  // Calculate capacity (mock - would come from actual vault data)
  const capacity = Math.min(100, Math.random() * 30 + 70);

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        className="w-[380px] p-0 bg-card/95 backdrop-blur-xl border-border/50"
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            {/* Vault Avatar */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
              <span className="text-lg font-bold">{vault.name.charAt(0)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{vault.name}</h3>
                {vault.manager?.verified && (
                  <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                )}
              </div>
              {vault.manager?.name && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0 h-5"
                  >
                    {vault.manager.name}
                  </Badge>
                  {vault.manager.verified && (
                    <span className="text-xs text-primary">✓ Verified</span>
                  )}
                </div>
              )}
            </div>

            {vault.manager?.riskRating && (
              <Badge
                variant="outline"
                className={cn(
                  "capitalize text-xs shrink-0",
                  getRiskBgColor(vault.manager.riskRating)
                )}
              >
                {vault.manager.riskRating}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* About Section */}
        <div className="p-4 space-y-2.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            About
          </p>

          <StatRow
            label="Deposit Asset"
            value={
              <span className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                {vault.underlyingSymbol}
              </span>
            }
          />

          <StatRow
            label="Performance Fee"
            value={
              vault.performanceFee !== null
                ? `${vault.performanceFee.toFixed(2)}%`
                : "—"
            }
          />

          <StatRow
            label="Management Fee"
            value={
              vault.managementFee !== null
                ? `${vault.managementFee.toFixed(2)}%`
                : "0.00%"
            }
          />

          <Separator className="my-3" />

          <StatRow
            label="APY (90 days)"
            tooltip="Annualized return based on the last 90 days of performance"
            value={
              <PerformanceBadge
                value={
                  vault.performance.month3 !== null
                    ? vault.performance.month3 * 4
                    : null
                }
              />
            }
          />

          <StatRow
            label="TVL"
            value={formatTvl(vault.tvl)}
          />

          <StatRow
            label="Vault Age"
            value={`${vault.ageDays} days`}
          />

          <StatRow
            label="Capacity"
            value={
              <div className="flex items-center gap-2">
                <Progress value={capacity} className="w-16 h-1.5" />
                <span className={capacity > 90 ? "text-orange-500" : ""}>
                  {capacity.toFixed(1)}%
                </span>
              </div>
            }
          />

          <Separator className="my-3" />

          <StatRow
            label="All-Time Return"
            value={<PerformanceBadge value={vault.performance.allTime} showIcon />}
          />

          <StatRow
            label="Max Daily Drawdown"
            tooltip="The largest single-day percentage drop in vault value"
            value={
              <span className="text-red-500">
                -{(Math.random() * 5 + 0.5).toFixed(2)}%
              </span>
            }
          />
        </div>

        <Separator />

        {/* Chart Preview */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
            30D Performance
          </p>
          <Sparkline
            data={vault.historicalSnapshots.slice(-30)}
            width={348}
            height={60}
            strokeWidth={2}
          />
        </div>

        <Separator />

        {/* Actions */}
        <div className="p-4 flex gap-2">
          <Button className="flex-1" asChild>
            <Link href={`/vaults/${vault.address}`}>
              View Vault Details
            </Link>
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    copyAddress();
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Copy vault address</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://solscan.io/account/${vault.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">View on Solscan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}


