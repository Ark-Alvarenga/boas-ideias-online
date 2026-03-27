"use client"

import { useEffect, useState, useCallback } from "react"

const BRAZILIAN_NAMES = [
  "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Lucas Souza",
  "Juliana Lima", "Rafael Pereira", "Camila Rodrigues", "Bruno Almeida", "Fernanda Nascimento",
  "Gustavo Ferreira", "Larissa Ribeiro", "Thiago Carvalho", "Beatriz Gomes", "Matheus Martins",
  "Amanda Araújo", "Felipe Barbosa", "Carolina Rocha", "Diego Mendes", "Patrícia Cardoso",
  "Ricardo Teixeira", "Vanessa Correia", "Eduardo Dias", "Gabriela Nunes", "Marcelo Vieira",
  "Letícia Moreira", "André Castro", "Bruna Azevedo", "Rodrigo Lopes", "Natália Freitas"
]

const BRAZILIAN_CITIES = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR",
  "Salvador, BA", "Brasília, DF", "Fortaleza, CE", "Recife, PE", "Porto Alegre, RS",
  "Manaus, AM", "Goiânia, GO", "Belém, PA", "Guarulhos, SP", "Campinas, SP",
  "São Luís, MA", "Maceió, AL", "Campo Grande, MS", "Natal, RN", "Teresina, PI",
  "João Pessoa, PB", "Florianópolis, SC", "Vitória, ES", "Cuiabá, MT", "Joinville, SC"
]

const ACTION_TEXTS = [
  "acabou de adquirir",
  "garantiu o ebook",
  "fez o investimento",
  "começou sua jornada",
  "adquiriu o livro"
]

const TIME_TEXTS = [
  "agora mesmo",
  "há 1 minuto",
  "há 2 minutos",
  "há 3 minutos",
  "há poucos segundos"
]

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000
}

export function SocialProofToast() {
  const [isVisible, setIsVisible] = useState(false)
  const [notification, setNotification] = useState({
    name: "",
    city: "",
    action: "",
    time: ""
  })

  const generateNotification = useCallback(() => {
    setNotification({
      name: getRandomItem(BRAZILIAN_NAMES),
      city: getRandomItem(BRAZILIAN_CITIES),
      action: getRandomItem(ACTION_TEXTS),
      time: getRandomItem(TIME_TEXTS)
    })
  }, [])

  const showNotification = useCallback(() => {
    generateNotification()
    setIsVisible(true)

    // Hide after 4-5 seconds
    setTimeout(() => {
      setIsVisible(false)
    }, 4500)
  }, [generateNotification])

  useEffect(() => {
    // First notification after 10-20 seconds
    const initialDelay = getRandomInterval(10, 20)

    const initialTimeout = setTimeout(() => {
      showNotification()

      // Set up recurring notifications
      const scheduleNext = () => {
        const nextDelay = getRandomInterval(30, 90)
        setTimeout(() => {
          showNotification()
          scheduleNext()
        }, nextDelay)
      }

      scheduleNext()
    }, initialDelay)

    return () => clearTimeout(initialTimeout)
  }, [showNotification])

  return (
    <div
      className={`fixed bottom-24 md:bottom-4 left-4 z-50 max-w-xs sm:max-w-sm transition-all duration-500 ease-out ${isVisible
        ? "translate-x-0 opacity-100"
        : "-translate-x-full opacity-0 pointer-events-none"
        }`}
      role="status"
      aria-live="polite"
    >
      <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg shadow-2xl p-4 flex items-start gap-3">
        {/* Live indicator */}
        <div className="flex-shrink-0 mt-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 leading-snug">
            <span className="font-semibold text-cyan-400">{notification.name}</span>
            {" "}de{" "}
            <span className="font-medium text-gray-300">{notification.city}</span>
            {" "}{notification.action}
          </p>
          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
        </div>

        {/* Book icon */}
        <div className="flex-shrink-0 bg-cyan-500/20 p-2 rounded-lg">
          <svg
            className="w-6 h-6 text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
    </div>
  )
}
