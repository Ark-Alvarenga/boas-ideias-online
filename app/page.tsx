import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { SellAnythingSection } from "@/components/landing/sell-anything-section"
import { StartSmallSection } from "@/components/landing/start-small-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { TrustSection } from "@/components/landing/trust-section"
import { FinalCtaSection } from "@/components/landing/final-cta-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />
      <main>
        <HeroSection />
        <SellAnythingSection />
        <StartSmallSection />
        <HowItWorksSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  )
}
