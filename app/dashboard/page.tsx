import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportCard } from '@/components/ReportCard'
import Link from 'next/link'
import { Heart, TrendingUp, Users } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch reports
  const query = supabase
    .from('reports')
    .select(`
      *,
      profile:profiles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (user) {
    query.eq('user_id', user.id)
  }

  const { data: reports } = await query

  // Calculate stats
  const totalReports = reports?.length || 0
  const avgFps = totalReports > 0
    ? Math.round(reports!.reduce((sum, r) => sum + r.fps_avg, 0) / totalReports)
    : 0
  const totalLikes = reports?.reduce((sum, r) => sum + r.likes, 0) || 0

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-8">
          {user ? 'Meu Dashboard' : 'Dashboard'}
        </h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-zinc-300">Reports Enviados</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{totalReports}</div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-zinc-300">FPS Médio Geral</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{avgFps} FPS</div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-emerald-400" />
              <span className="text-zinc-300">Likes Recebidos</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{totalLikes}</div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-8">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">Apoie o Projeto</h2>
          <p className="text-zinc-300 mb-4">
            O JogaLiso é 100% gratuito e depende do apoio da comunidade. Sua contribuição ajuda a manter os servidores e recompensar os top contributors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/apoie"
              className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
            >
              Ver opções de apoio
            </Link>
            <div className="text-sm text-zinc-400">
              Doações voluntárias a partir de R$ 5
            </div>
          </div>
        </div>

        {/* Reports */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">
              {user ? 'Meus Reports' : 'Reports Recentes'}
            </h2>
            {user && (
              <Link
                href="/submit"
                className="bg-emerald-500 text-zinc-950 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
              >
                + Novo Report
              </Link>
            )}
          </div>

          {reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
              <p className="text-zinc-400 text-lg mb-4">
                {user ? 'Você ainda não enviou nenhum report.' : 'Nenhum report encontrado.'}
              </p>
              {user ? (
                <Link
                  href="/submit"
                  className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Enviar meu primeiro report
                </Link>
              ) : (
                <Link
                  href="/reports"
                  className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Ver todos os reports
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}