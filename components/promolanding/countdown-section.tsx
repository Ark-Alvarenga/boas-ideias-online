"use client"

import { useEffect, useState } from "react"

const COUNTDOWN_KEY = "projeto-milhao-countdown-target"

export function CountdownSection() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Get or set the target date
    let targetDate: Date
    const stored = localStorage.getItem(COUNTDOWN_KEY)

    if (stored) {
      targetDate = new Date(stored)
      // If expired, reset to 7 days from now
      if (targetDate.getTime() < Date.now()) {
        targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + 7)
        localStorage.setItem(COUNTDOWN_KEY, targetDate.toISOString())
      }
    } else {
      targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + 7)
      localStorage.setItem(COUNTDOWN_KEY, targetDate.toISOString())
    }

    const timer = setInterval(() => {
      const now = Date.now()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        setTime({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      } else {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => String(num).padStart(2, "0")

  return (
    <section className="bg-[#2a2a2a] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-white text-2xl md:text-3xl font-bold">
              <span className="text-cyan-500">TEMPO LIMITADO</span> PARA FAZER
              <br />
              PARTE DO NOSSO GRUPO DE
              <br />
              MENTORIA NO FACEBOOK.
            </h2>
          </div>

          <div className="flex gap-3 md:gap-4">
            {[
              { value: time.days, label: "DIAS" },
              { value: time.hours, label: "HORAS" },
              { value: time.minutes, label: "MINUTOS" },
              { value: time.seconds, label: "SEGUNDOS" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-cyan-500 text-white text-2xl md:text-5xl font-bold w-14 md:w-20 h-14 md:h-20 flex items-center justify-center rounded-lg shadow-lg shadow-cyan-500/20 transition-all">
                  {mounted ? formatNumber(item.value) : "00"}
                </div>
                <div className="text-gray-400 text-[10px] md:text-xs mt-2 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
