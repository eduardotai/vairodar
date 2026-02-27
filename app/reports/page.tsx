import { createClient } from '@/lib/supabase/server'
import { ReportCard } from '@/components/ReportCard'
import { Search } from 'lucide-react'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const gameFilter = typeof params.game === 'string' ? params.game : ''

  // First get all reports
  let reportsQuery = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (gameFilter) {
    reportsQuery = reportsQuery.ilike('game', `%${gameFilter}%`)
  }

  const { data: reportsData, error: reportsError } = await reportsQuery

  if (reportsError) {
    console.error('Error fetching reports:', reportsError)
  }

  // Then get profiles for each report
  let reports = []
  if (reportsData) {
    for (const report of reportsData) {
      let profile = null
      if (report.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', report.user_id)
          .single()

        profile = profileData
      }

      reports.push({
        ...report,
        profile: profile
      })
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-8">Reports da Comunidade</h1>

        {/* Filter */}
        <div className="mb-8">
          <form method="get" className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                name="game"
                placeholder="Filtrar por jogo..."
                defaultValue={gameFilter}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 text-zinc-950 px-6 py-2 rounded-md font-semibold hover:bg-emerald-400 transition-colors"
            >
              Filtrar
            </button>
          </form>
        </div>

        {/* Reports Grid */}
        {reports && reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">
              Nenhum report encontrado. {gameFilter && `Para "${gameFilter}".`}
            </p>
            <p className="text-zinc-500 mt-2">
              Seja o primeiro a compartilhar suas configurações!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}