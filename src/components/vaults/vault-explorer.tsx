"use client";

import { Buffer } from "buffer";
import { useState, useEffect, useTransition, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutGrid,
  LayoutList,
  Filter,
  BadgeCheck,
  X,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import type {
  VaultData,
  VaultFilters,
  VaultListResponse,
} from "@/lib/vaults/types";
import { getVaultList, getVaultStats } from "@/lib/vaults/actions";
import { VaultTable } from "./vault-table";
import { VaultCard, VaultCardSkeleton } from "./vault-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useMutation } from "@tanstack/react-query";
import {
  ChallengeStatus,
  ChallengeTemplateUpdateInsertDtoArgs,
  DrawdownType,
  getCreateChallengeTemplateInstruction,
  getCreateChallengeTemplateInstructionAsync,
  getJoinChallengeInstruction,
  getJoinChallengeInstructionAsync,
  POLICY_CHALLENGES_PROGRAM_ADDRESS,
  StageType,
} from "@/protocol/policyChallenges";
import {
  address,
  getProgramDerivedAddress,
  Rpc,
  Signature,
  SolanaRpcApi,
} from "@solana/kit";
import { useSigner } from "../wallet/wallet-context";
import { Transaction } from "@/lib/solana/transaction";
import { useConnection } from "../onchain/connection-context";
import { ConnectWalletMenu } from "../wallet/connect-wallet-menu";
import { useProtocol } from "../onchain/protocol-context";
import {
  fetchManagerRegistry,
  fetchMaybeManagerRegistry,
  getInitializeManagerRegistryInstructionAsync,
  getInitializeVaultInstruction,
  getInitializeVaultInstructionAsync,
  getRegisterManagerInstructionAsync,
  getVerifyManagerInstruction,
  RiskRating,
  VerificationStatus,
} from "@/protocol/hyroProtocol";

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
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [vaults, setVaults] = useState<VaultData[]>(initialData?.vaults || []);
  const [totalTvl, setTotalTvl] = useState(initialData?.totalTvl || 0);
  const [totalCount, setTotalCount] = useState(initialData?.totalCount || 0);

  const [filters, setFilters] = useState<VaultFilters>({
    search: "",
    managerVerified: null,
    riskRating: null,
    sortBy: "tvl",
    sortOrder: "desc",
    timeframe: "1m",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch vaults when filters change
  const fetchVaults = useCallback(async () => {
    startTransition(async () => {
      const filtersToSend = {
        ...filters,
        search: debouncedSearch,
        riskRating: filters.riskRating === "all" ? null : filters.riskRating,
      };
      const data = await getVaultList(filtersToSend);
      setVaults(data.vaults);
      setTotalTvl(data.totalTvl);
      setTotalCount(data.totalCount);
    });
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

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

  const signer = useSigner();
  const protocol = useProtocol();
  const connection = useConnection();

  const ensureManagerRegistryMut = useMutation({
    mutationKey: ["ensureManagerRegistry"],
    mutationFn: async () => {
      const [managerRegistry] = await protocol.helpers.getManagerRegistryPda();

      return fetchMaybeManagerRegistry(
        connection.connection,
        managerRegistry
      ).then(async (result) => {
        if (result.exists) {
          return result;
        } else {
          if (!signer) throw new Error("Signer not found");

          console.log("Creating new manager registry", managerRegistry);
          // create new manager registry
          const ix = await getInitializeManagerRegistryInstructionAsync({
            admin: signer,
          });

          return Transaction.send({
            rpc: connection.connection as Rpc<SolanaRpcApi>,
            subscription: connection.subscription,
            signer: signer,
            instructions: [ix],
            simulation: {
              computeUnitLimit: 200000,
            },
          })
            .then(async (signature) => {
              console.log("Manager registry created", signature);

              const tx = await connection.connection
                .getTransaction(signature, {
                  maxSupportedTransactionVersion: 0,
                  encoding: "jsonParsed",
                })
                .send();

              console.log("tx", tx);
              return fetchManagerRegistry(
                connection.connection,
                managerRegistry
              );
            })
            .catch(async (e) => {
              console.error("error", e);
              if ("signature" in e && typeof e.signature === "string") {
                const tx = await connection.connection
                  .getTransaction(e.signature, {
                    maxSupportedTransactionVersion: 0,
                    encoding: "jsonParsed",
                  })
                  .send();

                if (tx) {
                  console.log("tx", tx);
                }
              }
              throw e;
            });
        }
      });
    },
  });

  const handleVaultCreation = useMutation({
    onSuccess: (data) => {
      console.log("data", data);
    },
    onError: (error) => {
      console.error("error", error);
    },
    mutationFn: async (seed: string) => {
      if (!signer) throw new Error("Signer not found");

      const managerRegistry = await ensureManagerRegistryMut.mutateAsync();

      if (!managerRegistry) throw new Error("Manager registry not found");

      const stageId = BigInt(Math.floor(Math.random() * 30000));

      const [challengeTemplateAccount] =
        await protocol.helpers.getChallengeTemplatePda(Number(stageId));

      const USDC = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      const ORACLE = address("F9nB3BKFkXpA6WzLkogUP4RHyvwXZGAh8PhHPPkDNAa");

      const templateData = {
        stageSequence: 1,
        stageType: StageType.Evaluation,
        startingDeposit: 10000 * 10 ** 6,
        admin: ORACLE, // hardcoded oracle
        entranceCost: 100 * 10 ** 6,
        entranceTokenMint: USDC, // USDC
        minimumTradingDays: [3],
        dailyDrawdown: [100],
        maximumLoss: [200],
        profitTarget: [300],
        maxParticipants: [50],
        isActive: true,
      } as ChallengeTemplateUpdateInsertDtoArgs;

      const createChallengeTemplateIx =
        await getCreateChallengeTemplateInstructionAsync({
          stageId,
          dto: templateData,
          challengeTemplateAccount,
          signer,
        });

      const [challengeAccount] = await protocol.helpers.getChallengePda(
        signer.address,
        seed
      );

      const startingDeposit = BigInt(templateData.startingDeposit);
      const profitTargetAmount =
        (startingDeposit * BigInt(templateData.profitTarget[0])) / 10000n;
      const maximumLossAmount =
        (startingDeposit * BigInt(templateData.maximumLoss[0])) / 10000n;
      const dailyDrawdownLimitAmount =
        (startingDeposit * BigInt(templateData.dailyDrawdown[0])) / 10000n;

      const joinChallengeIx = await getJoinChallengeInstructionAsync({
        challengeTemplateAccount,
        challengeAccount,
        participant: signer,
        challengeId: seed,
        stageId: Number(stageId),
        stageSequence: 0,
        profitTarget: {
          target: [templateData.profitTarget[0]],
          targetAmount: [profitTargetAmount],
          achieved: [0],
          achievedAmount: [0n],
        },
        tradingDays: {
          required: [templateData.minimumTradingDays[0]],
          completed: [0],
          requirementsMet: false,
          remainingDays: [templateData.minimumTradingDays[0]],
        },
        maximumLoss: {
          maximumLossPercentage: [templateData.maximumLoss[0]],
          maximumLossAmount: [maximumLossAmount],
          currentLossAchieved: [0],
          currentLossAchievedAmount: [0n],
        },
        dailyDrawdown: {
          drawdownType: DrawdownType.Static,
          limitPercentage: [templateData.dailyDrawdown[0]],
          limitAmount: [dailyDrawdownLimitAmount],
          maxEquity: [0n],
          currentDrawdownPercentage: [0],
          currentDrawdownAmount: [0n],
          violationTriggered: false,
        },
        status: ChallengeStatus.Active,
        payout: 0n,
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
      });

      const newVaultIx = await getInitializeVaultInstructionAsync({
        signer,
        underlyingMint: USDC,
        seed: seed,
        policyProgram: POLICY_CHALLENGES_PROGRAM_ADDRESS,
      });

      const setupManagerIx = await getRegisterManagerInstructionAsync({
        admin: signer,
        manager: challengeAccount,
        registry: managerRegistry.address,
        riskRating: RiskRating.Conservative,
      });

      const [managerProfile] = await protocol.helpers.getManagerProfilePda(
        challengeAccount
      );
      const verifyManagerIx = await getVerifyManagerInstruction({
        admin: signer,
        managerProfile: managerProfile,
        registry: managerRegistry.address,
        verificationStatus: VerificationStatus.Verified,
      });

      return Transaction.send({
        rpc: connection.connection as Rpc<SolanaRpcApi>,
        subscription: connection.subscription,
        signer: signer,
        instructions: [
          createChallengeTemplateIx,
          joinChallengeIx,
          newVaultIx,
          setupManagerIx,
          verifyManagerIx,
        ],
        simulation: {
          computeUnitLimit: 200000,
        },
      }).catch(async (e) =>
        connection.connection
          .getTransaction(e.signature as Signature, {
            maxSupportedTransactionVersion: 0,
            encoding: "jsonParsed",
          })
          .send()
      );
    },
  });

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border/50">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Total Value Locked
          </p>
          <p className="text-3xl font-bold font-mono tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
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
          {signer && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create new vault</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new vault</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Create a new vault to start earning rewards.
                </DialogDescription>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const seed = formData.get("seed") as string;
                    console.log("seed", seed);

                    handleVaultCreation.mutate(seed);
                  }}
                >
                  <Input placeholder="Vault seed" name="seed" />
                  <Button
                    type="submit"
                    disabled={handleVaultCreation.isPending}
                  >
                    Create
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
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
                  onClick={fetchVaults}
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
