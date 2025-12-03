import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function VaultDetailSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <section className="border-b border-border/50">
        <Container className="py-6">
          <Skeleton className="h-4 w-24 mb-6" />

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Grid Skeleton */}
      <section className="py-6">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Main Content Skeleton */}
      <section className="pb-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chart Skeleton */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-64 mb-4" />
                  <Skeleton className="h-[300px] w-full" />
                  <div className="grid grid-cols-5 gap-4 mt-6 pt-4 border-t border-border/50">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="text-center space-y-1">
                        <Skeleton className="h-3 w-8 mx-auto" />
                        <Skeleton className="h-5 w-12 mx-auto" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Info Tabs Skeleton */}
              <Card className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <Skeleton className="h-10 w-64 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Deposit Widget Skeleton */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <Skeleton className="h-10 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-px w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>

              {/* Quick Stats Skeleton */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}


