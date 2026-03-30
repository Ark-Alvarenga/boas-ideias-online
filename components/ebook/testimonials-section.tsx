import Image from "next/image";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Rafael",
      image: "/images/homem1.jpg",
      messages: [
        { from: "user", text: "Boa noite", time: "21:02" },
        {
          from: "user",
          text: "Passei aqui pra agradecer pelo conteúdo",
          time: "21:03",
        },
        {
          from: "user",
          text: "Comecei do zero total e já fiz minha primeira grana online",
          time: "21:05",
        },
        { from: "me", text: "Parabéns 👏 continua assim", time: "21:06" },
        { from: "user", text: "Agora estou focado em escalar", time: "21:08" },
      ],
    },
    {
      name: "Juliana",
      image: "/images/mulher1.jpg",
      messages: [
        {
          from: "user",
          text: "Sério sabe o que mais fez diferença pra mim? O foco que vocês deram em mentalidade e persistência",
          time: "18:11",
        },
        {
          from: "user",
          text: "Eu sempre achei que ganhar dinheiro online era complicado, mas nunca tinha levado a sério tipo trabalho mesmo",
          time: "18:11",
        },
        {
          from: "user",
          text: "Mas depois do guia ficou tudo muito mais simples",
          time: "18:13",
        },
        {
          from: "user",
          text: "Já comecei e tô vendo resultado",
          time: "18:17",
        },
      ],
    },
    {
      name: "Carlos",
      image: "/images/homem2.jpg",
      messages: [
        {
          from: "user",
          text: "Fiz minha primeira venda em menos de 48h",
          time: "14:22",
        },
        { from: "me", text: "Boa 👊", time: "14:23" },
        {
          from: "user",
          text: "Nunca tinha conseguido nada antes disso",
          time: "14:25",
        },
      ],
    },
    {
      name: "Lucas",
      image: "/images/homem3.jpg",
      messages: [
        {
          from: "user",
          text: "Eu tava perdido sem saber por onde começar",
          time: "10:02",
        },
        {
          from: "user",
          text: "Testava várias coisas e nada dava certo",
          time: "10:05",
        },
        { from: "user", text: "Agora finalmente tenho direção", time: "10:09" },
      ],
    },
    {
      name: "Mariana",
      image: "/images/mulher2.jpg",
      messages: [
        {
          from: "user",
          text: "Comprei achando que era mais um ebook",
          time: "22:14",
        },
        {
          from: "user",
          text: "Mas esse realmente mostra o caminho",
          time: "22:16",
        },
      ],
    },
    {
      name: "Fernanda",
      image: "/images/mulher3.jpg",
      messages: [
        { from: "user", text: "Eu só queria uma renda extra", time: "16:41" },
        { from: "user", text: "Apliquei uma das estratégias", time: "16:45" },
        {
          from: "user",
          text: "Primeiro mês já fiz mais de R$1.500",
          time: "16:52",
        },
      ],
    },
    {
      name: "Bruno",
      image: "/images/homem4.jpg",
      messages: [
        { from: "user", text: "Já tentei várias coisas antes", time: "12:03" },
        { from: "user", text: "Sempre desistia no meio", time: "12:06" },
        {
          from: "user",
          text: "Agora tô conseguindo manter consistência",
          time: "12:12",
        },
      ],
    },
    {
      name: "Camila",
      image: "/images/mulher4.jpg",
      messages: [
        {
          from: "user",
          text: "Além de ensinar a ganhar dinheiro",
          time: "19:21",
        },
        { from: "user", text: "Mudou muito minha mentalidade", time: "19:24" },
        { from: "user", text: "Parei de procrastinar", time: "19:28" },
      ],
    },
    {
      name: "André",
      image: "/images/homem5.jpg",
      messages: [
        {
          from: "user",
          text: "Eu só consumia conteúdo e nunca fazia nada",
          time: "09:11",
        },
        {
          from: "user",
          text: "Esse guia me fez sair da teoria",
          time: "09:15",
        },
        { from: "user", text: "Agora tô vendo evolução real", time: "09:20" },
      ],
    },
  ];

  return (
    <section className="bg-[#1f0052] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-white text-2xl md:text-3xl font-bold text-center mb-4">
          RESULTADOS DE QUEM DECIDIU COMEÇAR
        </h2>

        <p className="text-gray-300 text-center mb-10 text-sm md:text-base">
          Conversas reais de pessoas aplicando e vendo resultado.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[#111] rounded-2xl p-4 shadow-xl">
              {/* HEADER */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full relative overflow-hidden bg-green-500 flex items-center justify-center text-black text-xs font-bold">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="text-sm text-white font-medium">{t.name}</div>
              </div>

              {/* CHAT */}
              <div className="flex flex-col gap-2">
                {t.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-[#202c33] text-white self-start"
                        : "bg-[#005c4b] text-white self-end ml-auto"
                    }`}
                  >
                    {msg.text}

                    <div className="text-[10px] opacity-60 mt-1 text-right">
                      {msg.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-green-400 text-sm font-semibold">
            +300 pessoas começaram nas últimas 24h
          </p>
        </div>
      </div>
    </section>
  );
}
