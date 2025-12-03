"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BadgeCheck,
  Copy,
  ExternalLink,
  Info,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  BarChart3,
  Users,
  Clock,
  Shield,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import type { VaultData } from "@/lib/vaults/types";
import { Sparkline, PerformanceBadge } from "@/components/vaults";

interface VaultDetailContentProps {
  vault: VaultData;
}

const formatTvl = (tvl: number): string => {
  if (tvl >= 1_000_000) {
    return `$${(tvl / 1_000_000).toFixed(2)}M`;
  }
  if (tvl >= 1_000) {
    return `$${(tvl / 1_000).toFixed(2)}K`;
  }
  return `$${tvl.toFixed(2)}`;
};

const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getRiskColor = (rating: string) => {
  switch (rating) {
    case "conservative":
      return "text-green-500 bg-green-500/10 border-green-500/20";
    case "moderate":
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case "aggressive":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "speculative":
      return "text-red-500 bg-red-500/10 border-red-500/20";
    default:
      return "text-muted-foreground bg-muted";
  }
};

function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  tooltip,
  className,
}: {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  icon?: React.ElementType;
  tooltip?: string;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/50 bg-card/50", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm text-muted-foreground">{label}</span>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-48">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            {subValue && (
              <div className="text-sm text-muted-foreground mt-0.5">
                {subValue}
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Generate mock depositors
function generateMockDepositors(count: number = 12) {
  return Array.from({ length: count }, (_, i) => ({
    address: `${Array(44).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')}`,
    balance: Math.random() * 100000 + 1000,
    value: Math.random() * 50000 + 500,
    percentage: Math.random() * 15 + 1,
  })).sort((a, b) => b.balance - a.balance);
}

// Generate mock activity
function generateMockActivity(count: number = 10) {
  const actions = ["Deposit", "Withdrawal"];
  const now = Date.now();
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${i}`,
    timestamp: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
    action: actions[Math.floor(Math.random() * actions.length)],
    address: `${Array(44).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')}`,
    amount: Math.random() * 10000 + 100,
    status: "Completed",
  })).sort((a, b) => b.timestamp - a.timestamp);
}

export function VaultDetailContent({ vault }: VaultDetailContentProps) {
  const [copied, setCopied] = useState(false);
  const [chartTab, setChartTab] = useState("roi");
  const [chartTimeframe, setChartTimeframe] = useState("30d");
  const [infoTab, setInfoTab] = useState("about");

  const depositors = generateMockDepositors();
  const activities = generateMockActivity();
  const capacity = Math.min(100, Math.random() * 30 + 70);

  const copyAddress = () => {
    navigator.clipboard.writeText(vault.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apy90d = vault.performance.month3 !== null ? vault.performance.month3 * 4 : null;

  return (
    <>
      {/* Header */}
      <section className="border-b border-border/50">
        <Container className="py-6">
          {/* Back link */}
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vaults
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Vault Info */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
                <span className="text-2xl font-bold">{vault.name.charAt(0)}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{vault.name}</h1>
                  {vault.manager?.verified && (
                    <BadgeCheck className="h-6 w-6 text-primary" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {/* Manager */}
                  {vault.manager?.name && (
                    <Badge variant="secondary" className="gap-1.5">
                      <span>Manager:</span>
                      <span className="font-semibold">{vault.manager.name}</span>
                      {vault.manager.verified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                      )}
                    </Badge>
                  )}

                  {/* Risk Rating */}
                  {vault.manager?.riskRating && (
                    <Badge
                      variant="outline"
                      className={cn("capitalize", getRiskColor(vault.manager.riskRating))}
                    >
                      {vault.manager.riskRating}
                    </Badge>
                  )}

                  {/* Deposit Asset */}
                  <Badge variant="outline" className="gap-1.5">
                    <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    {vault.underlyingSymbol}
                  </Badge>
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs text-muted-foreground font-mono">
                    {formatAddress(vault.address)}
                  </code>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={copyAddress}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{copied ? "Copied!" : "Copy address"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                          <a
                            href={`https://solscan.io/account/${vault.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">View on Solscan</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg">
                Withdraw
              </Button>
              <Button size="lg" className="gap-2">
                <Wallet className="h-4 w-4" />
                Deposit
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Grid */}
      <section className="py-6">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="TVL"
              value={formatTvl(vault.tvl)}
              icon={BarChart3}
            />
            <StatCard
              label="APY (90 days)"
              value={<PerformanceBadge value={apy90d} size="lg" showIcon />}
              tooltip="Annualized return based on the last 90 days of performance"
              icon={TrendingUp}
            />
            <StatCard
              label="Vault Age"
              value={`${vault.ageDays} days`}
              subValue={`Since ${new Date(vault.createdAt).toLocaleDateString()}`}
              icon={Calendar}
            />
            <StatCard
              label="Capacity"
              value={
                <div className="flex items-center gap-2">
                  <span className={capacity > 90 ? "text-orange-500" : ""}>
                    {capacity.toFixed(1)}%
                  </span>
                </div>
              }
              subValue={<Progress value={capacity} className="w-full h-2 mt-1" />}
              icon={Users}
            />
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="pb-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chart & Performance */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Chart */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Performance</CardTitle>
                    <div className="flex items-center gap-2">
                      <Tabs value={chartTimeframe} onValueChange={setChartTimeframe}>
                        <TabsList className="h-8">
                          <TabsTrigger value="7d" className="text-xs px-2.5">7D</TabsTrigger>
                          <TabsTrigger value="30d" className="text-xs px-2.5">30D</TabsTrigger>
                          <TabsTrigger value="90d" className="text-xs px-2.5">90D</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={chartTab} onValueChange={setChartTab} className="mb-4">
                    <TabsList>
                      <TabsTrigger value="roi">ROI</TabsTrigger>
                      <TabsTrigger value="sharePrice">Share Price</TabsTrigger>
                      <TabsTrigger value="tvl">Vault Balance</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Chart Area */}
                  <div className="h-[300px] w-full">
                    <Sparkline
                      data={vault.historicalSnapshots.slice(
                        chartTimeframe === "7d" ? -7 :
                        chartTimeframe === "30d" ? -30 : -90
                      )}
                      width={800}
                      height={280}
                      strokeWidth={2}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-5 gap-4 mt-6 pt-4 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">1D</p>
                      <PerformanceBadge value={vault.performance.day1} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">1W</p>
                      <PerformanceBadge value={vault.performance.week1} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">1M</p>
                      <PerformanceBadge value={vault.performance.month1} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">3M</p>
                      <PerformanceBadge value={vault.performance.month3} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">All</p>
                      <PerformanceBadge value={vault.performance.allTime} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Tabs */}
              <Card className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <Tabs value={infoTab} onValueChange={setInfoTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="about">About</TabsTrigger>
                      <TabsTrigger value="depositors">Depositors</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="space-y-6">
                      {/* Vault Address */}
                      <div>
                        <h4 className="font-semibold mb-2">Vault Address</h4>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            {vault.address}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            asChild
                          >
                            <a
                              href={`https://solscan.io/account/${vault.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View on Solscan
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>

                      {/* Strategy Description */}
                      <div>
                        <h4 className="font-semibold mb-2">Strategy Description</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          This vault implements an algorithmic trading strategy designed to generate
                          consistent returns while managing risk through diversification and position
                          sizing. The strategy utilizes on-chain data and market indicators to make
                          informed trading decisions.
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                          The vault maintains exposure to the deposited asset while seeking to
                          outperform market benchmarks through active management. Depositors benefit
                          from professional risk management and can withdraw at any time subject to
                          any lockup periods.
                        </p>
                      </div>

                      {/* Fee Structure */}
                      <div>
                        <h4 className="font-semibold mb-2">Fee Structure</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground">Performance Fee</p>
                            <p className="text-lg font-semibold">
                              {vault.performanceFee !== null
                                ? `${vault.performanceFee.toFixed(2)}%`
                                : "—"}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground">Management Fee</p>
                            <p className="text-lg font-semibold">
                              {vault.managementFee !== null
                                ? `${vault.managementFee.toFixed(2)}%`
                                : "0.00%"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Risks */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-orange-500" />
                          Risks
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Trading strategies carry inherent risks including but not limited to:
                          market volatility, smart contract risks, and potential loss of funds.
                          While every effort is made to mitigate these risks, vault users deploy
                          their assets at their own risk. Past performance is not indicative of
                          future results.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="depositors">
                      <div className="mb-4">
                        <h4 className="font-semibold">{depositors.length} Depositors</h4>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Depositor</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {depositors.slice(0, 10).map((depositor, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <a
                                  href={`https://solscan.io/account/${depositor.address}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-sm hover:text-primary transition-colors"
                                >
                                  {formatAddress(depositor.address)}
                                  <ExternalLink className="inline ml-1 h-3 w-3" />
                                </a>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {depositor.balance.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                ${depositor.value.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="activity">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activities.map((activity) => (
                            <TableRow key={activity.id}>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  {activity.action === "Deposit" ? (
                                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                                  )}
                                  {activity.action}
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="font-mono text-xs">
                                  {formatAddress(activity.address)}
                                </code>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {activity.amount.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}{" "}
                                {vault.underlyingSymbol}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary" className="text-green-500 bg-green-500/10">
                                  {activity.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Deposit Widget */}
            <div className="space-y-6">
              {/* Deposit Widget */}
              <Card className="border-border/50 bg-card sticky top-24 z-10">
                <CardHeader>
                  <Tabs defaultValue="deposit" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="deposit" className="flex-1">Deposit</TabsTrigger>
                      <TabsTrigger value="withdraw" className="flex-1">Withdraw</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Deposited funds are subject to a 3 days redemption period.
                  </p>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        Max
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-background">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                        <span className="font-medium">{vault.underlyingSymbol}</span>
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="flex-1 text-right bg-transparent text-lg font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono">0.00</span>
                      <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    </span>
                  </div>

                  <Separator />

                  {/* Connect Wallet Button */}
                  <Button className="w-full" size="lg">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-border/50 bg-card/50 sticky top-24">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Vault Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Share Price</span>
                    <span className="font-mono">${vault.sharePrice.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Shares</span>
                    <span className="font-mono">
                      {Number(BigInt(vault.totalShares) / BigInt(1000000)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Daily Drawdown</span>
                    <span className="font-mono text-red-500">-{(Math.random() * 5 + 0.5).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Depositors</span>
                    <span className="font-mono">{depositors.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

