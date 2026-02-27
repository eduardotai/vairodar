export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold">JOGALISO</span>
            <span className="text-zinc-400">© 2024. Configurações reais testadas pela comunidade.</span>
          </div>
          <div className="flex space-x-6">
            <a href="/apoie" className="text-zinc-400 hover:text-emerald-400 transition-colors">
              Apoie
            </a>
            <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
              Sobre
            </a>
            <a href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}