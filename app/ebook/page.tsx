import { PromoHeroSection } from "@/components/ebook/promo-hero-section";
import { CTAButton } from "@/components/ebook/cta-button";
import { ContentsSection } from "@/components/ebook/contents-section";
import { StatsSection } from "@/components/ebook/stats-section";
import { BookPreviewSection } from "@/components/ebook/book-preview-section";
import { PriceSection } from "@/components/ebook/price-section";
import { TestimonialsSection } from "@/components/ebook/testimonials-section";
import { CountdownSection } from "@/components/ebook/countdown-section";
import { PhoneSection } from "@/components/ebook/phone-section";
import { GuaranteeSection } from "@/components/ebook/guarantee-section";
import { FinalCTASection } from "@/components/ebook/final-cta-section";
import { FAQSection } from "@/components/ebook/faq-section";
import { PromoFooter } from "@/components/ebook/promo-footer";
import { SocialProofToast } from "@/components/ebook/social-proof-toast";
import { StickyMobileCTA } from "@/components/ebook/sticky-mobile-cta";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white-50 pb-20 md:pb-0">
      {/* Social Proof Toast Notification */}
      <SocialProofToast />

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />
      {/* Hero Section with book and description */}
      <header>
        <div className="pb-2 pt-1 md:pb-4 md:pt-2 text-center bg-primary">
          <div className="text-accent">
            <span className="text-sm font-bold tracking-wider text-cyan-400">
              EBOOK
            </span>
            <div className="text-3xl font-bold">COMO VIVER DA INTERNET</div>
          </div>
        </div>
      </header>
      <PromoHeroSection />

      {/* First CTA Button */}
      <section className="bg-white-50 py-8 md:py-12">
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
  );
}
