import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Coins,
  CheckCircle2,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const capabilityChips = [
  "On-chain challenge logic",
  "Instant payouts",
  "Funding tiers",
  "Trader telemetry",
  "LP dashboards",
];

export function ProductSection() {
  return (
    <section
      id="case-study"
      className="border-y border-white/5 bg-card py-24 overflow-hidden"
    >
      <Container className="grid items-center gap-16 lg:grid-cols-[1.1fr_minmax(0,_520px)]">
        <div className="space-y-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 754 170"
            fill="currentColor"
            fillRule="evenodd"
            className="w-36 text-white mb-12"
          >
            <path d="M73.8.05L.25 42.5v85l73.6 42.45 73.55-42.45v-85L73.8.05zM85.95 85l29.55-17.05v-29.8l19.75 11.4v70.95l-19.75 11.35v-29.8L85.95 85zm17.4 24.05v29.8L73.8 155.9l-29.55-17.05v-29.8L73.8 92l29.55 17.05zm-59.1-48.1v-29.8L73.8 14.1l29.55 17.05v29.8L73.8 78 44.25 60.95zM61.65 85L32.1 102.05v29.8l-19.75-11.4v-70.9l19.75-11.4v29.8L61.65 85zM189.65 42.4h14.2v34.75h37.25V42.4h14.2v85.25h-14.2V90.3h-37.25v37.35h-14.2V42.4zM291.7 127.65h-5.95L262.7 63.2h15.4l16.95 54.05L312 63.2h14.55l-30.8 91.65H283.2l8.5-27.2zM336.1 81.8l-1.2-18.6H347l1.65 10.75c2.15-4.4 8.25-12.3 23.3-12.3v12.9c-16.6 0-21 12.3-21.95 16.1v37h-13.85V81.8h-.05zM407.75 129.3c-23.05 0-30.3-12.4-30.3-33.8s7.3-34 30.3-34c22.9-.1 30.3 12.65 30.3 34s-7.4 33.8-30.3 33.8zm0-11.45c12.2 0 16.1-7.05 16.1-22.3S419.9 73 407.75 73c-12.3 0-16.25 7.3-16.25 22.55s3.95 22.3 16.25 22.3zM460.151 50.65h-27.55v-7.5h63.5v7.5h-27.8l-.35 77h-8.1l.3-77zM494.85 81.8l-1.2-18.05h6.8l1.45 12.55c1.9-4.55 7.75-13.75 23.15-13.75V70c-16.85 0-21.35 13.75-22.3 17.9v39.75h-7.9V81.8zM574.25 118.8c-4.2 5.5-11.8 10.15-23.5 10.15-15.85 0-22.1-7.3-22.1-19.55 0-15.65 10.5-20.4 27-20.4 8.7 0 14.7.6 17.9 1.05-.25-14.9-1.9-20.65-17.05-20.65-15.5 0-18.05 8.1-18.05 13.75h-7.3c0-7.65 2.5-20.4 24.95-20.4 26.15 0 25.3 13.75 25.3 33.3v15.5l1.3 16h-7.3l-1.15-8.75zm-.7-10.85v-11.2c-3-.35-8.35-.95-16.1-.95-13.5 0-20.65 3.2-20.65 13.25 0 7.3 3.45 13 15.4 13 13.55 0 21.35-8.25 21.35-14.1zM639.65 117.95c-2.4 4.4-8.35 10.75-22.45 10.75-17.9 0-24.95-12.75-24.95-32.7 0-20.05 6.95-33.3 24.7-33.3 12.15 0 19.1 6.55 21.85 9.9V37.85h7.75v73.05l1.2 16.7h-6.8l-1.3-9.65zm-.85-7.75V81.1c-2.25-3.7-8.45-11.2-20.15-11.2-12.75 0-18.5 9.8-18.5 26.15 0 16.25 5.75 25.4 18.5 25.4 11.8 0 17.55-6.35 20.15-11.25zM685.151 128.95c-21 0-27.8-12.55-27.8-33.05 0-20.5 6.8-33.4 27.8-33.4 20.05 0 27.45 10.85 27.45 34.75h-47.15c.25 16.95 5.6 24.85 19.7 24.85 15.05 0 19-8.7 19-13.35h8c-.05 6.35-4.1 20.2-27 20.2zm-19.6-38.8h38.65c-1.3-14.9-7.4-20.9-19.1-20.9-12.85 0-18.45 7.05-19.55 20.9zM723.551 81.8l-1.2-18.05h6.8l1.45 12.55c1.9-4.55 7.75-13.75 23.15-13.75V70c-16.85 0-21.35 13.75-22.3 17.9v39.75h-7.9V81.8z" />
          </svg>
          {/* <Badge className="w-fit border border-secondary/20 bg-secondary/10 text-secondary-foreground">
            Live on mainnet
          </Badge> */}
          <h3 className="text-3xl font-semibold text-foreground sm:text-4xl">
            HyroTrader proves programmable capital in production
          </h3>
          <p className="text-lg text-muted-foreground">
            HyroTrader runs HYRO&apos;s vault primitives live: programmatic
            challenge tracks, automatic payouts, and LP telemetry that updates
            the moment trades settle.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
            {capabilityChips.map((chip) => (
              <span
                key={chip}
                className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link
                href="https://hyrotrader.com"
                target="_blank"
                rel="noreferrer"
              >
                Explore HyroTrader vaults
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#contact">Read more</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex w-full justify-end items-center overflow-visible">
          <div className="relative flex w-full max-w-[520px] flex-col items-center">
            <Image
              src="/images/product-trader-2.png"
              alt="Trader operating HyroTrader workstation"
              width={1200}
              height={1200}
              className="relative scale-150 lg:origin-[10%_50%] z-10 w-[150%] -translate-x-6 mask-image-[linear-gradient(to_bottom,black_78%,transparent)] object-contain drop-shadow-[0_70px_140px_rgba(8,17,35,0.55)]"
              priority
            />
            <div className="absolute inset-x-12 bottom-6 h-[360px] rounded-[320px] bg-primary/15 blur-3xl" />
          </div>

          <div className="absolute top-2 right-[-32px] z-30 w-64 max-w-[85vw] rounded-3xl border border-white/10 bg-background/90 p-5 shadow-[0_30px_80px_-35px_rgba(8,47,73,0.8)] backdrop-blur">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
                Challenge status
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary text-nowrap">
                Phase 2
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              Vault HT-204 · Trader #18
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-primary/10">
              <div className="h-full w-3/4 rounded-full bg-primary" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Trophy className="size-4 text-primary" />
              <span>Risk checks passed · PnL +8.4%</span>
            </div>
          </div>

          <div className="absolute bottom-16 left-[-12px] z-30 w-64 max-w-[85vw] rounded-3xl border border-white/10 bg-background/90 p-5 shadow-[0_30px_80px_-40px_rgba(8,47,73,0.8)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Instant payout
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-foreground">$12,500</p>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                executed 45s ago
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Split auto-routed to trader and LP pool</span>
            </div>
          </div>

          <div className="absolute -bottom-12 right-[-18px] z-30 w-80 max-w-[90vw] rounded-3xl border border-white/10 bg-background/90 p-5 shadow-[0_30px_80px_-40px_rgba(8,47,73,0.8)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              LP yield summary
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="size-4 text-primary" />
                  7d vault return
                </span>
                <span className="font-semibold text-primary">+4.2%</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <BriefcaseBusiness className="size-4 text-primary" />
                  Carry to managers
                </span>
                <span className="font-semibold text-primary">18%</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <Coins className="size-4 text-primary" />
                  Reinvested opportunities
                </span>
                <span className="font-semibold text-primary">20%</span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
