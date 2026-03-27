"use client"

import { useEffect, useState } from "react"

export function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a] to-transparent md:hidden transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
    >
      <button
        onClick={handleClick}
        className="w-full bg-[#e5a000] hover:bg-[#cc8f00] text-white text-lg font-bold py-4 px-6 rounded-full shadow-lg active:scale-[0.98] transition-transform"
        aria-label="Comprar ebook"
      >
        EU QUERO O EBOOK!
      </button>
    </div>
  )
}
