"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

interface CTAButtonProps {
  className?: string;
}

export function CTAButton({ className = "" }: CTAButtonProps) {
  const handleClick = () => {
    // Scroll to top or navigate to checkout
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Link href="https://pay.hotmart.com/E105125338R">
        <button
          onClick={handleClick}
          className="group relative overflow-hidden w-full max-w-3xl bg-[#e5a000] hover:bg-[#cc8f00] text-white text-xl md:text-2xl lg:text-3xl font-bold py-6 md:py-8 px-8 md:px-16 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-amber-500/50"
          aria-label="Comprar o ebook A Bíblia para o Milhão"
        >
          {/* Pulse animation ring */}
          <span
            className="absolute inset-0 rounded-full animate-ping bg-amber-400/20 pointer-events-none"
            style={{ animationDuration: "2s" }}
          ></span>

          {/* Button text */}
          <span className="relative z-10 flex items-center justify-center gap-3">
            EU QUERO O EBOOK!
            <svg
              className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </button>
      </Link>

      <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
        <Lock className="w-4 h-4" />
        <span>Suas informações estão seguras.</span>
      </div>
    </div>
  );
}
