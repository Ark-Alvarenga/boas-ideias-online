import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function FinalCtaSection() {
  return (
    <section className="border-t-2 border-foreground bg-primary py-24 lg:py-32">
      <div className="section-container flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-[45%]">
          <h2 className="font-serif text-5xl font-black tracking-tight text-primary-foreground sm:text-7xl">
            Sua <span className="text-green-500">primeira venda</span> está{" "}
            <br className="hidden sm:block" /> mais perto do que você imagina.
          </h2>

          <div className="mt-12">
            <Button
              size="xl"
              className="h-16 rounded-md border-2 border-foreground bg-background px-12 text-xl font-bold text-foreground shadow-[6px_6px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] hover:bg-[#fab72a] active:translate-y-1 active:shadow-[2px_2px_0px_#000]"
              asChild
            >
              <Link href="/register">Começar hoje (É grátis)</Link>
            </Button>
          </div>
        </div>
        <div className="w-full lg:w-[55%] flex justify-center lg:justify-end items-center mt-12 lg:mt-0">
          <div className="relative w-full h-[450px] lg:h-[500px] overflow-visible ">
            <Image
              src="/images/cta-image.webp"
              alt="Comece a vender hoje"
              fill
              className="object-cover -top-20 lg:-top-32 scale-110"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
