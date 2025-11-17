import { HeroSection } from "@/components/sections/hero"
import { MetricsSection } from "@/components/sections/metrics"
import { FeaturesSection } from "@/components/sections/features"
import { ProductSection } from "@/components/sections/product"
import { RoadmapPreviewSection } from "@/components/sections/roadmap-preview"
import { FinalCTASection } from "@/components/sections/final-cta"
import { SiteFooter } from "@/components/sections/footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <HeroSection />
      <MetricsSection />
      <FeaturesSection />
      <ProductSection />
      <RoadmapPreviewSection />
      <FinalCTASection />
      <SiteFooter />
    </main>
  )
}
