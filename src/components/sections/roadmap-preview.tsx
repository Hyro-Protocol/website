import Image from "next/image";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

const roadmap = [
  {
    period: "Q3 2025",
    title: "Protocol launch",
    detail: "HyroTrader challenges running entirely on HYRO vault programs.",
  },
  {
    period: "Q1 2026",
    title: "Institutional onboarding",
    detail:
      "Managed accounts, risk tooling, and hybrid settlement rails for desks.",
  },
  {
    period: "2026 H2",
    title: "Strategy marketplace",
    detail:
      "Permissionless vault templates and liquidity routes for DAOs & funds.",
  },
  {
    period: "2027",
    title: "Full DAO governance",
    detail:
      "Token-weighted control over parameters, oracle sets, and treasury.",
  },
];

export function RoadmapPreviewSection() {
  return (
    <section
      id="roadmap"
      className="relative overflow-hidden bg-background py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-[radial-gradient(circle_at_top,_var(--primary)/35%,_transparent_60%)]" />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,_1.2fr)_minmax(0,_500px)]">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="border border-white/5 bg-white/5 text-foreground"
            >
              Roadmap
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              A measured path from flagship product to protocol-scale
              infrastructure
            </h2>
            <p className="text-lg text-muted-foreground">
              Every milestone compounds transparency, automation, and ownership.
              HYRO is engineered to evolve into the neutral capital layer for
              high-performance trading strategies.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[420px] overflow-visible">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/images/roadmap-tower-2.png"
                alt="HYRO roadmap tower illustration"
                fill
                sizes="(min-width: 1024px) 420px, 80vw"
                className="object-contain scale-120 -translate-x-1/3"
                priority
              />
              <div className="flex flex-col justify-between h-full items-end">
                {roadmap.map((item) => (
                  <div
                    key={item.period}
                    className="flex w-[240px] flex-col gap-2 rounded-3xl border border-white/10 bg-background/90 px-4 py-3 text-left shadow-[0_24px_60px_-30px_var(--primary)] backdrop-blur"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/70">
                      {item.period}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
