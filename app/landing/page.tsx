import { PromoHeroSection } from "@/components/promolanding/promo-hero-section"
import { CTAButton } from "@/components/promolanding/cta-button"
import { ContentsSection } from "@/components/promolanding/contents-section"
import { StatsSection } from "@/components/promolanding/stats-section"
import { BookPreviewSection } from "@/components/promolanding/book-preview-section"
import { PriceSection } from "@/components/promolanding/price-section"
import { TestimonialsSection } from "@/components/promolanding/testimonials-section"
import { CountdownSection } from "@/components/promolanding/countdown-section"
import { PhoneSection } from "@/components/promolanding/phone-section"
import { GuaranteeSection } from "@/components/promolanding/guarantee-section"
import { FinalCTASection } from "@/components/promolanding/final-cta-section"
import { FAQSection } from "@/components/promolanding/faq-section"
import { PromoFooter } from "@/components/promolanding/promo-footer"
import { SocialProofToast } from "@/components/promolanding/social-proof-toast"
import { StickyMobileCTA } from "@/components/promolanding/sticky-mobile-cta"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] pb-20 md:pb-0">
      {/* Social Proof Toast Notification */}
      <SocialProofToast />

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />
      {/* Hero Section with book and description */}
      <PromoHeroSection />

      {/* First CTA Button */}
      <section className="bg-[#1a1a1a] py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <CTAButton />
        </div>
      </section>

      {/* What you will find in the book */}
      <ContentsSection />

      {/* Stats bar */}
      <StatsSection />

      {/* Book preview pages */}
      <BookPreviewSection />

      {/* Price section with CTA */}
      <PriceSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Countdown timer */}
      <CountdownSection />

      {/* Read on your phone section */}
      <PhoneSection />

      {/* Guarantee section */}
      <GuaranteeSection />

      {/* Final CTA */}
      <FinalCTASection />

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <PromoFooter />
    </main>
  )
}
