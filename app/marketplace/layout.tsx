import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Marketplace de Produtos Digitais",
  description: "Explore os melhores infoprodutos, cursos e guias digitais. Tudo o que você precisa para alavancar seu conhecimento e negócio.",
  alternates: {
    canonical: "/marketplace",
  },
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
