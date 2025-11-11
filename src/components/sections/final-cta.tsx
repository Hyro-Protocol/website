import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export function FinalCTASection() {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-white/5 bg-card py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--primary),_transparent_55%)]" />
      <Container className="relative z-10 flex flex-col gap-8 rounded-[2.5rem] border border-white/10 bg-background/60 p-10 text-center shadow-[0_20px_70px_-25px_rgba(8,47,73,0.7)] backdrop-blur">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
            Build on HYRO
          </p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Ready to orchestrate capital with absolute clarity?
          </h2>
          <p className="text-lg text-muted-foreground sm:mx-auto sm:max-w-2xl">
            Share your brief and we&apos;ll coordinate a deep-dive session with the core team.
            Bring your strategy, traders, and compliance requirements—we&apos;ll handle the rails.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="shadow-glow-primary">
            <Link href="mailto:founders@hyro.xyz">
              founders@hyro.xyz
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent">
            <Link href="#roadmap">Request investor deck</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}

