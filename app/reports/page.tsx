'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ReportCard } from '@/components/ReportCard'
import { Search } from 'lucide-react'
import type { Report } from '@/lib/types'

function ReportsPageContent() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const searchParams = useSearchParams()
  const supabase = createClient()

  const fetchReports = async (gameFilter = '') => {
    setLoading(true)
    try {
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
        return
      }

      // Then get profiles for each report
      let reportsWithProfiles = []
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

          reportsWithProfiles.push({
            ...report,
            profile: profile
          })
        }
      }

      setReports(reportsWithProfiles)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const gameFilter = searchParams.get('game') || ''
    setSearchTerm(gameFilter)
    fetchReports(gameFilter)
  }, [searchParams])

  // Update data when user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to tab, refresh data
        const gameFilter = searchParams.get('game') || ''
        fetchReports(gameFilter)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const game = formData.get('game') as string
    setSearchTerm(game)
    fetchReports(game)
  }

  const handleRefresh = () => {
    fetchReports(searchTerm)
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
            <p className="text-zinc-400 mt-4">Carregando reports...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-emerald-400">Reports da Comunidade</h1>
          <button
            onClick={handleRefresh}
            className="bg-zinc-700 text-zinc-100 px-4 py-2 rounded-md hover:bg-zinc-600 transition-colors"
          >
            Atualizar
          </button>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                name="game"
                placeholder="Filtrar por jogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">
              Nenhum report encontrado. {searchTerm && `Para "${searchTerm}".`}
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

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
            <p className="text-zinc-400 mt-4">Carregando...</p>
          </div>
        </div>
      </div>
    }>
      <ReportsPageContent />
    </Suspense>
  )
}