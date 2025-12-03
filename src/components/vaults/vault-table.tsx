"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BadgeCheck,
  Shield,
  ShieldAlert,
  ShieldQuestion,
  ExternalLink,
  Info,
} from "lucide-react";

import type { VaultData, VaultFilters, VaultPerformance } from "@/lib/vaults/types";
import { Sparkline } from "./sparkline";
import { PerformanceBadge } from "./performance-badge";
import { VaultPreview } from "./vault-preview";

interface VaultTableProps {
  vaults: VaultData[];
  filters: VaultFilters;
  onSort: (sortBy: VaultFilters["sortBy"]) => void;
  isLoading?: boolean;
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
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const getRiskIcon = (rating: string) => {
  switch (rating) {
    case "conservative":
      return <Shield className="h-4 w-4 text-green-500" />;
    case "moderate":
      return <Shield className="h-4 w-4 text-blue-500" />;
    case "aggressive":
      return <ShieldAlert className="h-4 w-4 text-orange-500" />;
    case "speculative":
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    default:
      return <ShieldQuestion className="h-4 w-4 text-muted-foreground" />;
  }
};

const getRiskLabel = (rating: string) => {
  return rating.charAt(0).toUpperCase() + rating.slice(1);
};

const getPerformanceKey = (timeframe: VaultFilters["timeframe"]): keyof VaultPerformance => {
  const map: Record<VaultFilters["timeframe"], keyof VaultPerformance> = {
    "1d": "day1",
    "1w": "week1",
    "1m": "month1",
    "3m": "month3",
    "6m": "month6",
    "1y": "year1",
    "all": "allTime",
  };
  return map[timeframe];
};

function SortButton({
  label,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
  tooltip,
}: {
  label: string;
  sortKey: VaultFilters["sortBy"];
  currentSort: VaultFilters["sortBy"];
  currentOrder: VaultFilters["sortOrder"];
  onSort: (key: VaultFilters["sortBy"]) => void;
  tooltip?: string;
}) {
  const isActive = currentSort === sortKey;

  const content = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 px-2 font-medium -ml-2",
        isActive && "text-foreground"
      )}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isActive ? (
        currentOrder === "asc" ? (
          <ArrowUp className="ml-1 h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="ml-1 h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />
      )}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

function VaultTableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-8 w-[120px]" /></TableCell>
          <TableCell><Skeleton className="h-8 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function VaultTable({
  vaults,
  filters,
  onSort,
  isLoading = false,
}: VaultTableProps) {
  const perfKey = getPerformanceKey(filters.timeframe);

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="w-[280px]">
              <SortButton
                label="Vault"
                sortKey="name"
                currentSort={filters.sortBy}
                currentOrder={filters.sortOrder}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="w-[120px]">
              <SortButton
                label="TVL"
                sortKey="tvl"
                currentSort={filters.sortBy}
                currentOrder={filters.sortOrder}
                onSort={onSort}
                tooltip="Total Value Locked"
              />
            </TableHead>
            <TableHead className="w-[90px] text-center">
              <SortButton
                label="1D"
                sortKey="performance"
                currentSort={filters.sortBy}
                currentOrder={filters.sortOrder}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="w-[90px] text-center">1W</TableHead>
            <TableHead className="w-[90px] text-center">1M</TableHead>
            <TableHead className="w-[90px] text-center">
              <div className="flex items-center gap-1">
                All
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Performance since inception</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
            <TableHead className="w-[80px]">
              <SortButton
                label="Age"
                sortKey="age"
                currentSort={filters.sortBy}
                currentOrder={filters.sortOrder}
                onSort={onSort}
              />
            </TableHead>
            <TableHead className="w-[140px]">Trend</TableHead>
            <TableHead className="w-[100px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <VaultTableSkeleton />
          ) : vaults.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                No vaults found matching your filters
              </TableCell>
            </TableRow>
          ) : (
            vaults.map((vault) => (
              <TableRow
                key={vault.address}
                className="group border-border/30 hover:bg-accent/30"
              >
                <TableCell>
                  <VaultPreview vault={vault} side="right" align="start">
                    <div className="flex items-center gap-3 cursor-pointer">
                      {/* Vault Icon/Avatar */}
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
                        <span className="text-sm font-bold">
                          {vault.name.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium truncate hover:text-primary transition-colors">
                            {vault.name}
                          </span>
                          {vault.manager?.verified && (
                            <BadgeCheck className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {vault.manager?.name ? (
                            <span className="truncate">{vault.manager.name}</span>
                          ) : (
                            <span className="font-mono">{formatAddress(vault.manager?.address || vault.address)}</span>
                          )}
                          {vault.manager?.riskRating && (
                            <span className="flex items-center gap-0.5">
                              {getRiskIcon(vault.manager.riskRating)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </VaultPreview>
                </TableCell>
                
                <TableCell>
                  <span className="font-mono font-medium">
                    {formatTvl(vault.tvl)}
                  </span>
                </TableCell>
                
                <TableCell className="text-center">
                  <PerformanceBadge value={vault.performance.day1} />
                </TableCell>
                
                <TableCell className="text-center">
                  <PerformanceBadge value={vault.performance.week1} />
                </TableCell>
                
                <TableCell className="text-center">
                  <PerformanceBadge value={vault.performance.month1} />
                </TableCell>
                
                <TableCell className="text-center">
                  <PerformanceBadge value={vault.performance.allTime} />
                </TableCell>
                
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {vault.ageDays}d
                  </span>
                </TableCell>
                
                <TableCell>
                  <Sparkline
                    data={vault.historicalSnapshots.slice(-30)}
                    width={120}
                    height={32}
                  />
                </TableCell>
                
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <Link href={`/vaults/${vault.address}`}>
                      View
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

