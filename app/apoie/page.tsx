import Link from 'next/link'
import { Heart, CreditCard, Coffee, Star } from 'lucide-react'

export default function ApoiePage() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-400 mb-4">Apoie o JogaLiso</h1>
          <p className="text-xl text-zinc-300 mb-6">
            O JogaLiso é 100% gratuito e depende do apoio da comunidade gamer brasileira
          </p>
          <div className="text-emerald-400 font-semibold">
            💚 100% das doações vão para manter os servidores e recompensar os top contributors da comunidade
          </div>
        </div>

        {/* One-time donations */}
        <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 mb-8">
          <h2 className="text-2xl font-semibold text-emerald-400 mb-6 text-center">Doação Única</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg border border-zinc-700 transition-colors">
              <Coffee className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-emerald-400 font-semibold">R$ 5</div>
              <div className="text-sm text-zinc-400">Cafézinho</div>
            </button>
            <button className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg border border-zinc-700 transition-colors">
              <Heart className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-emerald-400 font-semibold">R$ 10</div>
              <div className="text-sm text-zinc-400">Apoio básico</div>
            </button>
            <button className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg border border-zinc-700 transition-colors">
              <Star className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-emerald-400 font-semibold">R$ 20</div>
              <div className="text-sm text-zinc-400">Grande apoio</div>
            </button>
            <button className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-lg border border-zinc-700 transition-colors">
              <CreditCard className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-emerald-400 font-semibold">R$ 50</div>
              <div className="text-sm text-zinc-400">Herói da comunidade</div>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Ou quanto quiser (R$)
            </label>
            <input
              type="number"
              min="1"
              placeholder="Valor personalizado"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="text-center">
            <button className="bg-emerald-500 text-zinc-950 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition-colors">
              Doar via Pix (BR)
            </button>
          </div>
        </div>

        {/* Monthly donations */}
        <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 mb-8">
          <h2 className="text-2xl font-semibold text-emerald-400 mb-6 text-center">Apoio Mensal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
              <div className="text-emerald-400 font-semibold text-lg mb-2">R$ 9,90/mês</div>
              <div className="text-zinc-300 mb-4">Apoiador Bronze</div>
              <ul className="text-sm text-zinc-400 space-y-1 mb-4">
                <li>• Badge "Apoiador" no perfil</li>
                <li>• Prioridade leve nos resultados</li>
                <li>• Acesso antecipado a features</li>
              </ul>
              <button className="w-full bg-emerald-500 text-zinc-950 py-2 rounded font-semibold hover:bg-emerald-400 transition-colors">
                Assinar via Pix
              </button>
            </div>

            <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
              <div className="text-emerald-400 font-semibold text-lg mb-2">R$ 19,90/mês</div>
              <div className="text-zinc-300 mb-4">Apoiador Ouro</div>
              <ul className="text-sm text-zinc-400 space-y-1 mb-4">
                <li>• Badge "Apoiador Ouro" no perfil</li>
                <li>• Prioridade alta nos resultados</li>
                <li>• Acesso antecipado + beta features</li>
                <li>• Nome na página de agradecimentos</li>
              </ul>
              <button className="w-full bg-emerald-500 text-zinc-950 py-2 rounded font-semibold hover:bg-emerald-400 transition-colors">
                Assinar via Pix
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-4">
              Ou use cartão internacional via Stripe
            </p>
            <button className="border border-emerald-500 text-emerald-500 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-500 hover:text-zinc-950 transition-colors">
              Doar/Assinar via Stripe
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800">
          <h2 className="text-2xl font-semibold text-emerald-400 mb-6 text-center">Por que apoiar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">Para a Comunidade</h3>
              <ul className="text-zinc-400 space-y-1">
                <li>• Manutenção dos servidores</li>
                <li>• Desenvolvimento de novas features</li>
                <li>• Moderação da comunidade</li>
                <li>• Recompensas para top contributors</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">Para Você</h3>
              <ul className="text-zinc-400 space-y-1">
                <li>• Badge exclusivo no perfil</li>
                <li>• Prioridade nos resultados de busca</li>
                <li>• Acesso antecipado a features</li>
                <li>• Satisfação de ajudar a comunidade</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-zinc-400 hover:text-zinc-300 transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}