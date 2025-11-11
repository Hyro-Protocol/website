"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Coins,
  Globe2,
  PieChart,
  Sparkles,
  Users2,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const heroTags = [
  { icon: Wallet, label: "Accepts USDC" },
  { icon: Globe2, label: "Live on Solana" },
  { icon: Sparkles, label: "Programmable policies" },
];

export function HeroSection() {
  const [kycEnabled, setKycEnabled] = useState(false);

  const primaryImage = {
    src: "/images/hero-collab-hackish.png",
    alt: "Crypto-native investors reviewing HYRO vault analytics",
  };

  const kycImage = {
    src: "/images/hero-collab-stables.png",
    alt: "Traditional investors reviewing HYRO vault analytics",
  };

  const imageClassName =
    "-z-10 -scale-x-200 scale-y-200 mask-b-from-30% object-contain drop-shadow-[0_65px_130px_rgba(8,17,35,0.5)] transition-opacity duration-500 ease-in-out";

  return (
    <section className="relative overflow-hidden bg-black py-48 -mt-24">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary),_transparent_55%)] transition-opacity duration-500 ease-in-out",
          kycEnabled ? "opacity-100" : "opacity-0"
        )}
      />
      <Container
        className={cn(
          "relative z-10 grid items-center gap-12 lg:grid-cols-[1.15fr_minmax(0,_520px)] transition-colors duration-500 ease-in-out",
          !kycEnabled ? "bg-black" : ""
        )}
      >
        <div className="space-y-8">
          <Badge className="w-fit border border-primary/20 bg-primary/10 text-primary">
            HYRO Protocol · Solana Native
          </Badge>
          <div className="space-y-6">
            <h1 className="text-balance text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
              Programmable crypto vaults on Solana
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Deploy or use Hyro's smart vaults for crypto capital—configurable
              policies, automated fees.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="shadow-glow-primary">
              <Link href="#contact">
                Explore vaults
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#roadmap">Download the deck</Link>
            </Button>
          </div>
          <div className="hidden lg:flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
            {[
              "Zero-custody vaults",
              "Programmable policies",
              "Compliance tooling",
              "Automated fees & LPs",
              "Instant settlement",
            ].map((chip) => (
              <span
                key={chip}
                className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="relative flex w-full justify-end overflow-visible">
          <div className="relative flex w-full max-w-[520px] flex-col items-center gap-6">
            <div
              className="absolute -top-16 -right-0 z-40 flex items-center gap-3 self-end bg-background/85 py-2 rounded-full pl-4 pr-2 cursor-pointer"
              onClick={() => setKycEnabled((value) => !value)}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
                Optional KYC
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={kycEnabled}
                aria-label="Toggle optional KYC hero mode"
                className={`relative h-8 w-16 rounded-full border border-primary/40 transition-colors duration-300 ease-out ${
                  kycEnabled ? "bg-primary/70" : "bg-background/30"
                }`}
              >
                <span
                  className={`left-0 pointer-events-none absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full shadow transition-transform duration-300 ease-out ${
                    kycEnabled
                      ? "translate-x-9 bg-background"
                      : "translate-x-1 bg-foreground"
                  }`}
                />
              </button>
            </div>
            <div className="relative aspect-square w-full">
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt}
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                priority
                className={`${imageClassName} translate-y-6 ${
                  kycEnabled ? "opacity-0" : "opacity-100"
                }`}
              />
              <Image
                src={kycImage.src}
                alt={kycImage.alt}
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className={`${imageClassName} ${
                  kycEnabled ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
            <div className="absolute inset-x-10 bottom-6 h-[380px] rounded-[320px] bg-primary/20 blur-3xl" />
            <div className="absolute z-30 -bottom-20 left-1/2 flex -translate-x-1/2 flex-row justify-center gap-2 sm:gap-3">
              {heroTags.map((tag) => (
                <div
                  key={tag.label}
                  className="flex items-center gap-2 rounded-full  text-nowrap border border-white/15 bg-background/85 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-[0_18px_38px_-22px_rgba(8,47,73,0.75)] backdrop-blur"
                >
                  <tag.icon className="size-4 text-primary" />
                  {tag.label}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -top-8 -left-48 -z-30 w-72 max-w-[85vw] rounded-3xl border border-white/10 bg-background/92 p-5 shadow-[0_35px_90px_-40px_rgba(8,47,73,0.8)] backdrop-blur opacity-55">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
                Compliance
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                98.4%
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              Raul Gómez
            </p>
            <p className="text-xs text-muted-foreground">
              Private Investor · Family Office
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              <Users2 className="size-4" />
              Verified by zkTLS proofs
            </div>
          </div>

          <div className="absolute top-8 -right-56 -z-30 w-72 max-w-[85vw] rounded-3xl border border-white/10 bg-background/92 p-5 shadow-[0_35px_90px_-40px_rgba(8,47,73,0.8)] backdrop-blur transition-opacity duration-500 ease-in-out opacity-50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
                Compliance
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                98.4%
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              Amina Patel
            </p>
            <p className="text-xs text-muted-foreground">
              Vault Manager · HYRO DAO
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              <Users2 className="size-4" />
              Verified by zkTLS proofs
            </div>
          </div>

          <div className="absolute bottom-15 left-0 z-20 w-68 max-w-[85vw] rounded-3xl border border-white/10 bg-background/92 p-5 shadow-[0_30px_80px_-40px_rgba(8,47,73,0.8)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Live liquidity
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-foreground">$45.2M</p>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                +6.2% (7d)
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowRightLeft className="size-4 text-primary" />
              <span>3 vaults active · Guardrails locked</span>
            </div>
          </div>

          <div className="absolute -bottom-10 right-[-24px] z-20 w-80 max-w-[90vw] rounded-3xl border border-white/10 bg-background/92 p-5 shadow-[0_30px_80px_-40px_rgba(8,47,73,0.8)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Automated distribution
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <PieChart className="size-4 text-primary" />
                  Interest yield
                </span>
                <span className="font-semibold text-primary">62%</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <BriefcaseBusiness className="size-4 text-primary" />
                  Manager fees
                </span>
                <span className="font-semibold text-primary">18%</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <Coins className="size-4 text-primary" />
                  New opportunities
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
