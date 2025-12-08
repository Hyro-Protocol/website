"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { RefreshCw, Search, ExternalLink, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getChallengesWithHistory,
  getProgramUpdateSignatures,
  type ChallengeWithHistory,
} from "@/lib/challenges/actions";
// Simple date formatter
const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let result = "";
  if (diffDays > 0) {
    result = `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  } else if (diffHours > 0) {
    result = `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  } else if (diffMins > 0) {
    result = `${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  } else {
    result = `${diffSecs} second${diffSecs > 1 ? "s" : ""}`;
  }

  return options?.addSuffix ? `${result} ago` : result;
};

interface ChallengesSectionProps {
  className?: string;
}

const formatBalance = (lamports: number): string => {
  const sol = lamports / 1e9;
  if (sol >= 1_000_000) {
    return `${(sol / 1_000_000).toFixed(2)}M SOL`;
  }
  if (sol >= 1_000) {
    return `${(sol / 1_000).toFixed(2)}K SOL`;
  }
  return `${sol.toFixed(4)} SOL`;
};

const getStatusBadge = (status: number) => {
  const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    0: { label: "Pending", variant: "outline" },
    1: { label: "Active", variant: "default" },
    2: { label: "Halted", variant: "secondary" },
    3: { label: "Expired", variant: "outline" },
    4: { label: "Failed", variant: "destructive" },
    5: { label: "Passed", variant: "default" },
  };
  
  const statusInfo = statusMap[status] || { label: "Unknown", variant: "outline" };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
};

export function ChallengesSection({ className }: ChallengesSectionProps) {
  const [search, setSearch] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  const {
    data: challenges,
    refetch: fetchChallenges,
    isPending,
  } = useQuery({
    queryKey: ["challenges-with-history"],
    queryFn: () => getChallengesWithHistory(),
  });

  const {
    data: programSignatures,
    refetch: fetchProgramSignatures,
    isPending: isLoadingSignatures,
  } = useQuery({
    queryKey: ["program-update-signatures"],
    queryFn: () => getProgramUpdateSignatures(),
  });

  // Filter challenges by search
  const filteredChallenges = challenges?.filter((challenge) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      challenge.account.data.challengeId.toLowerCase().includes(searchLower) ||
      challenge.address.toLowerCase().includes(searchLower) ||
      (challenge.account.data.user as unknown as string).toLowerCase().includes(searchLower)
    );
  });

  // Get selected challenge details
  const selectedChallengeData = challenges?.find(
    (c) => c.address === selectedChallenge
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Challenges</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View all challenge accounts and their update history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchChallenges();
              fetchProgramSignatures();
            }}
            disabled={isPending || isLoadingSignatures}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4 mr-2",
                (isPending || isLoadingSignatures) && "animate-spin"
              )}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Challenges</p>
          <p className="text-2xl font-bold font-mono">
            {challenges?.length || 0}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Challenges</p>
          <p className="text-2xl font-bold font-mono">
            {challenges?.filter((c) => c.account.data.status === 1).length || 0}
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Updates</p>
          <p className="text-2xl font-bold font-mono">
            {programSignatures?.length || 0}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by challenge ID, address, or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/50 border-border/50"
        />
      </div>

      {/* Challenges Table */}
      <div className="rounded-lg border border-border/50 bg-card/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Challenge ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Stage ID</TableHead>
              <TableHead>Updates</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading challenges...
                </TableCell>
              </TableRow>
            ) : filteredChallenges && filteredChallenges.length > 0 ? (
              filteredChallenges.map((challenge) => (
                <TableRow
                  key={challenge.address}
                  className={cn(
                    "cursor-pointer",
                    selectedChallenge === challenge.address && "bg-muted/50"
                  )}
                  onClick={() =>
                    setSelectedChallenge(
                      selectedChallenge === challenge.address
                        ? null
                        : challenge.address
                    )
                  }
                >
                  <TableCell className="font-mono text-xs">
                    {challenge.account.data.challengeId.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {(challenge.account.data.user as unknown as string).slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(challenge.account.data.status)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatBalance(challenge.account.data.latestBalance)}
                  </TableCell>
                  <TableCell>{challenge.account.data.stageId}</TableCell>
                  <TableCell>
                    {challenge.updateSignatures.length} updates
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `https://solscan.io/account/${challenge.address}`,
                                "_blank"
                              );
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View on Solscan</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No challenges found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Selected Challenge Details */}
      {selectedChallengeData && (
        <div className="rounded-lg border border-border/50 bg-card/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Challenge Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChallenge(null)}
            >
              Close
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Challenge ID</p>
              <p className="font-mono text-sm">{selectedChallengeData.account.data.challengeId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-mono text-xs">{selectedChallengeData.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User</p>
              <p className="font-mono text-xs">{(selectedChallengeData.account.data.user as unknown as string).slice(0, 8)}...</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              {getStatusBadge(selectedChallengeData.account.data.status)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Starting Balance</p>
              <p className="font-mono">{formatBalance(selectedChallengeData.account.data.startingBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="font-mono">{formatBalance(selectedChallengeData.account.data.latestBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">
                {formatDistanceToNow(
                  new Date(Number(selectedChallengeData.account.data.createdAt) * 1000),
                  { addSuffix: true }
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm">
                {formatDistanceToNow(
                  new Date(Number(selectedChallengeData.account.data.updatedAt) * 1000),
                  { addSuffix: true }
                )}
              </p>
            </div>
          </div>

          {/* Update History */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3">Update History</h4>
            {selectedChallengeData.updateSignatures.length > 0 ? (
              <div className="space-y-2">
                {selectedChallengeData.updateSignatures
                  .sort((a, b) => b.slot - a.slot)
                  .slice(0, 10)
                  .map((sig) => (
                    <div
                      key={sig.signature}
                      className="flex items-center justify-between p-2 rounded border border-border/50 bg-card/30"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-xs">{sig.signature.slice(0, 16)}...</span>
                        {sig.blockTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(sig.blockTime * 1000), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://solscan.io/tx/${sig.signature}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No update history found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
