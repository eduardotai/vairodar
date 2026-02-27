import Link from 'next/link'
import { Cpu, Monitor, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-4 py-20">
        <div className="text-center max-w-4xl mx-auto w-full">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
              <Cpu className="w-10 h-10 text-zinc-950" />
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-emerald-400 mb-4">
            Vai rodar?
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 mb-8">
            Configurações reais que a comunidade testou no seu hardware
          </p>
          <div className="text-2xl font-semibold text-emerald-400 mb-12">
            +1.000 reports verificados pela comunidade
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/submit"
              className="bg-emerald-500 text-zinc-950 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-400 transition-colors"
            >
              Começar agora grátis →
            </Link>
            <Link
              href="/reports"
              className="border border-emerald-500 text-emerald-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-400 hover:text-zinc-950 hover:border-emerald-400 transition-colors"
            >
              Ver presets
            </Link>
          </div>
        </div>
      </section>

      {/* Hardware Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-zinc-100 mb-12">
            Otimizado para seu hardware
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-emerald-500 transition-colors">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Monitor className="w-6 h-6 text-zinc-950" />
              </div>
              <h3 className="text-xl font-semibold text-emerald-400 mb-2">Mid-end RTX 3060</h3>
              <p className="text-zinc-300 mb-4">
                Presets equilibrados para jogos modernos com qualidade e performance.
              </p>
              <Link href="/reports?gpu=rtx3060" className="text-emerald-400 hover:text-emerald-300">
                Ver reports →
              </Link>
            </div>
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-emerald-500 transition-colors">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-zinc-950" />
              </div>
              <h3 className="text-xl font-semibold text-emerald-400 mb-2">Low-end GTX 1660</h3>
              <p className="text-zinc-300 mb-4">
                Configurações otimizadas para máximo FPS em hardwares modestos.
              </p>
              <Link href="/reports?gpu=gtx1660" className="text-emerald-400 hover:text-emerald-300">
                Ver reports →
              </Link>
            </div>
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-emerald-500 transition-colors">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-zinc-950" />
              </div>
              <h3 className="text-xl font-semibold text-emerald-400 mb-2">High-end RTX 4090</h3>
              <p className="text-zinc-300 mb-4">
                Aproveite ao máximo gráficos ultra-realistas com presets premium.
              </p>
              <Link href="/reports?gpu=rtx4090" className="text-emerald-400 hover:text-emerald-300">
                Ver reports →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
