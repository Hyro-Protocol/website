import { Container } from "@/components/layout/container"

const metrics = [
  {
    value: "$12.4M",
    label: "Value secured by Hyro's vaults",
    detail: "Audited and visible to LPs in real time.",
  },
  {
    value: "165.3M",
    label: "Vault operations processed",
    detail: "Signed and available for public audit on Solana",
  },
  {
    value: "131",
    label: "Vaults created",
    detail: "Managed by Hyro's vault protocol.",
  },
]

export function MetricsSection() {
  return (
    <section className="border-y border-border bg-muted py-16">
      <Container className="grid gap-8 text-center sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <p className="text-4xl font-semibold text-foreground">{metric.value}</p>
            <p className="text-sm font-medium uppercase text-primary">
              {metric.label}
            </p>
            <p className="text-sm text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </Container>
    </section>
  )
}

