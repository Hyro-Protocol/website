import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { VaultExplorer } from "@/components/vaults";
import { getVaultList } from "@/lib/vaults/actions";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Explore Vaults | Hyro Protocol",
  description: "Discover and invest in vaults powered by image.pngverified managers on Solana.",
};

async function VaultExplorerLoader() {
  const initialData = await getVaultList();
  return <VaultExplorer initialData={initialData} />;
}

function VaultExplorerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border/50">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="h-12 w-px bg-border/50 hidden sm:block" />
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Skeleton className="h-9 w-full max-w-md" />
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-64" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border/50 bg-card/30">
        <div className="p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <Container className="relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Explore Vaults
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Discover algorithmic trading strategies managed by verified professionals. 
              Deposit assets and let expert traders grow your portfolio on Solana.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <Container>
          <Suspense fallback={<VaultExplorerSkeleton />}>
            <VaultExplorerLoader />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}

