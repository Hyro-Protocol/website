import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lock, Compass, Layers } from "lucide-react"

const features = [
  {
    title: "Composable vault architecture",
    description:
      "Spin up capital pools with programmable guardrails, fee logic, and treasury routing tailored to your team.",
    icon: Layers,
  },
  {
    title: "Trustless verification engine",
    description:
      "zkTLS-powered oracle feeds deliver deterministic performance data, replacing reconciliation spreadsheets forever.",
    icon: Lock,
  },
  {
    title: "Builder-first integrations",
    description:
      "SDKs, API bridges, and ready-to-style UI components accelerate launches for prop desks, DAOs, and fintech teams.",
    icon: Compass,
  },
]

export function FeaturesSection() {
  return (
    <section id="docs" className="bg-background py-24">
      <Container className="space-y-12">
        <div className="max-w-2xl space-y-4">
          <Badge variant="neutral" className="border border-white/5 bg-white/5 text-foreground">
            Designed for builders
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Purpose-built for liquidity providers, founders, and institutional trading desks
          </h2>
          <p className="text-lg text-muted-foreground">
            HYRO strips away operational overhead and lets you scale capital allocation the way
            elite firms do: transparently, programmatically, and at Solana speed.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="flex h-full flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <p className="text-lg font-semibold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
        <Button asChild variant="outline" className="border-primary/20 bg-transparent">
          <Link href="#docs">Explore the technical documentation</Link>
        </Button>
      </Container>
    </section>
  )
}

