"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  LayoutGrid,
  LayoutList,
  RefreshCw,
  Search,
  StarIcon,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getVaultList
} from "@/lib/vaults/actions";
import type {
  VaultData,
  VaultFilters,
  VaultListResponse,
} from "@/lib/vaults/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConnectWalletMenu } from "../wallet/connect-wallet-menu";
import { useSigner } from "../wallet/wallet-context";
import { CreateNewChallenge } from "./create-new-challenge";
import { VaultCard, VaultCardSkeleton } from "./vault-card";
import { VaultTable } from "./vault-table";
import { FeaturedVaultCard } from "./featured-vault-card";
import { useMemo } from "react";
import { useExploreVaults, useHyro, useVault } from "@hyr0-xyz/react";

interface VaultExplorerProps {
  initialData?: VaultListResponse;
}

const formatTvl = (tvl: number): string => {
  if (tvl >= 1_000_000_000) {
    return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
  }
  if (tvl >= 1_000_000) {
    return `$${(tvl / 1_000_000).toFixed(2)}M`;
  }
  if (tvl >= 1_000) {
    return `$${(tvl / 1_000).toFixed(1)}K`;
  }
  return `$${tvl.toFixed(0)}`;
};

const timeframeOptions = [
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
] as const;

const riskOptions = [
  { value: "all", label: "All Risks" },
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
  { value: "speculative", label: "Speculative" },
] as const;

export function VaultExplorer({ initialData }: VaultExplorerProps) {
  const signer = useSigner();
  const [filters, setFilters] = useState<VaultFilters>({
    search: "",
    managerVerified: null,
    riskRating: null,
    sortBy: "tvl",
    sortOrder: "desc",
    timeframe: "1m",
  });
  const [featuredSort, setFeaturedSort] = useState<"tvl" | "performance" | "score">("tvl");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    data: vaultAccounts,
    refetch: fetchVaults,
    isPending,
  } = useQuery({
    queryKey: ["vaults-list", filters, debouncedSearch],
    queryFn: () =>
      getVaultList({
        ...filters,
        search: debouncedSearch,
        riskRating: filters.riskRating === "all" ? null : filters.riskRating,
      }),
    placeholderData: initialData,
  });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [vaults, setVaults] = useState<VaultData[]>(
    vaultAccounts?.vaults || []
  );
  const [totalTvl, setTotalTvl] = useState(vaultAccounts?.totalTvl || 0);
  const [totalCount, setTotalCount] = useState(vaultAccounts?.totalCount || 0);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("vaultAccounts", vaultAccounts);
    if (vaultAccounts) {
      setVaults(vaultAccounts.vaults);
      setTotalTvl(vaultAccounts.totalTvl);
      setTotalCount(vaultAccounts.totalCount);
    }
  }, [vaultAccounts]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleSort = (sortBy: VaultFilters["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder:
        prev.sortBy === sortBy
          ? prev.sortOrder === "asc"
            ? "desc"
            : "asc"
          : "desc",
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      managerVerified: null,
      riskRating: null,
      sortBy: "tvl",
      sortOrder: "desc",
      timeframe: "1m",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.managerVerified !== null ||
    (filters.riskRating !== null && filters.riskRating !== "all");

  // Compute top 3 featured vaults based on selected sort
  const featuredVaults = useMemo(() => {
    if (!vaults || vaults.length === 0) return [];

    const sorted = [...vaults].sort((a, b) => {
      switch (featuredSort) {
        case "tvl":
          return b.tvl - a.tvl;
        case "performance": {
          const perfA = a.performance.month3 ?? a.performance.allTime ?? 0;
          const perfB = b.performance.month3 ?? b.performance.allTime ?? 0;
          return perfB - perfA;
        }
        case "score": {
          // Simple score: combine TVL and performance
          const scoreA = (a.tvl / 1_000_000) * 0.3 + ((a.performance.month3 ?? a.performance.allTime ?? 0) / 100) * 0.7;
          const scoreB = (b.tvl / 1_000_000) * 0.3 + ((b.performance.month3 ?? b.performance.allTime ?? 0) / 100) * 0.7;
          return scoreB - scoreA;
        }
        default:
          return 0;
      }
    });

    return sorted.slice(0, 3);
  }, [vaults, featuredSort]);

  // Determine timeframe for featured vaults based on age
  const getFeaturedTimeframe = (vault: VaultData): "3m" | "1y" => {
    return vault.ageDays >= 90 ? "3m" : vault.ageDays >= 365 ? "1y" : "3m";
  };

  return (
    <div className="space-y-6">
      {/* Top Vaults Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Top Vaults</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={featuredSort === "tvl" ? "default" : "outline"}
              data-active={featuredSort === "tvl"}
              size="sm"
              className={cn(
                "text-xs",
                featuredSort !== "tvl" && "border-border/50 bg-card/50"
              )}
              onClick={() => setFeaturedSort("tvl")}
            >
              <StarIcon className="size-3! text-amber-500 fill-current stroke-0 in-data-[active=true]:text-foreground" /> Featured
            </Button>
            <Button
              variant={featuredSort === "performance" ? "default" : "outline"}
              data-active={featuredSort === "performance"}
              size="sm"
              className={cn(
                "text-xs",
                featuredSort !== "performance" && "border-border/50 bg-card/50"
              )}
              onClick={() => setFeaturedSort("performance")}
            >
              Top Performing
            </Button>
            <Button
              variant={featuredSort === "score" ? "default" : "outline"}
              data-active={featuredSort === "score"}
              size="sm"
              className={cn(
                "text-xs",
                featuredSort !== "score" && "border-border/50 bg-card/50"
              )}
              onClick={() => setFeaturedSort("score")}
            >
              Top Score
            </Button>
          </div>
        </div>

        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] rounded-lg border border-border/50 bg-card/50 animate-pulse"
              />
            ))}
          </div>
        ) : featuredVaults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredVaults.map((vault) => (
              <FeaturedVaultCard
                key={vault.address}
                vault={vault}
                timeframe={getFeaturedTimeframe(vault)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Stats Header */}
      <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border/50">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Total Value Locked
          </p>
          <p className="text-3xl font-bold font-mono tracking-tight">
            {formatTvl(totalTvl)}
          </p>
        </div>
        <div className="h-12 w-px bg-border/50 hidden sm:block" />
        <div>
          <p className="text-sm text-muted-foreground mb-1">Active Vaults</p>
          <p className="text-3xl font-bold font-mono tracking-tight">
            {totalCount}
          </p>
        </div>
        <div className="ml-auto hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
          {!signer && <ConnectWalletMenu>Connect Wallet</ConnectWalletMenu>}
          {signer && <CreateNewChallenge />}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vaults, managers..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-9 bg-card/50 border-border/50"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Verified Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={filters.managerVerified ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "gap-1.5",
                    !filters.managerVerified && "border-border/50 bg-card/50"
                  )}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      managerVerified: prev.managerVerified ? null : true,
                    }))
                  }
                >
                  <BadgeCheck className="h-4 w-4" />
                  Verified
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Show only verified managers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Risk Filter */}
          <Select
            value={filters.riskRating || "all"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                riskRating: value === "all" ? null : value,
              }))
            }
          >
            <SelectTrigger className="w-[140px] border-border/50 bg-card/50">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              {riskOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Timeframe Filter */}
          <Tabs
            value={filters.timeframe}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                timeframe: value as VaultFilters["timeframe"],
              }))
            }
          >
            <TabsList className="bg-card/50 border border-border/50">
              {timeframeOptions.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="text-xs px-2.5"
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}

          <div className="h-8 w-px bg-border/50 hidden lg:block" />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("table")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Refresh */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50 bg-card/50"
                  onClick={() => fetchVaults()}
                  disabled={isPending}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isPending && "animate-spin")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              />
            </Badge>
          )}
          {filters.managerVerified && (
            <Badge variant="secondary" className="gap-1">
              Verified Only
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, managerVerified: null }))
                }
              />
            </Badge>
          )}
          {filters.riskRating && filters.riskRating !== "all" && (
            <Badge variant="secondary" className="gap-1 capitalize">
              {filters.riskRating}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, riskRating: null }))
                }
              />
            </Badge>
          )}
        </div>
      )}

      {/* Vault List */}
      {viewMode === "table" ? (
        <VaultTable
          vaults={vaults}
          filters={filters}
          onSort={handleSort}
          isLoading={isPending}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isPending
            ? Array.from({ length: 9 }).map((_, i) => (
                <VaultCardSkeleton key={i} />
              ))
            : vaults.map((vault) => (
                <VaultCard key={vault.address} vault={vault} />
              ))}
          {!isPending && vaults.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No vaults found matching your filters
            </div>
          )}
        </div>
      )}
    </div>
  );
}
