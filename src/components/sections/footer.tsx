import Link from "next/link"
import { Container } from "@/components/layout/container"
import { navigation } from "@/constants";

export function SiteFooter() {
  return (
    <footer className="bg-background py-12">
      <Container className="flex flex-col gap-8 border-t border-white/5 pt-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">HYRO Protocol</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The confident capital allocation layer for traders, managers, and liquidity partners
            building on Solana.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {navigation.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full border border-transparent px-4 py-2 transition-colors hover:border-white/10 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  )
}

