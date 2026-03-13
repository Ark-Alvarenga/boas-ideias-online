import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedProducts } from "@/components/landing/featured-products"
import { BenefitsSection } from "@/components/landing/benefits-section"
import { CreatorCTA } from "@/components/landing/creator-cta"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { NewsletterSection } from "@/components/landing/newsletter-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <BenefitsSection />
        <CreatorCTA />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}
