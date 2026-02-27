import Link from 'next/link'
import { Cpu } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-zinc-950 border-b border-zinc-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Cpu className="w-4 h-4 text-zinc-950" />
              </div>
              <span className="text-xl font-bold text-emerald-400">JOGALISO</span>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-zinc-300 hover:text-emerald-400 transition-colors">
              Início
            </Link>
            <Link href="/reports" className="text-zinc-300 hover:text-emerald-400 transition-colors">
              Reports
            </Link>
            <Link href="/submit" className="text-zinc-300 hover:text-emerald-400 transition-colors">
              Submit
            </Link>
            <Link href="/dashboard" className="text-zinc-300 hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/apoie" className="bg-emerald-500 text-zinc-950 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-400 transition-colors">
              Apoie o Projeto
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}