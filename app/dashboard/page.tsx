'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ReportCard } from '@/components/ReportCard'
import Link from 'next/link'
import { Heart, TrendingUp, Users, User, Settings, Award, Calendar, BarChart3 } from 'lucide-react'
import type { Report, Profile } from '@/lib/types'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser()

      if (userError || !userData) {
        router.push('/auth/login')
        return
      }

      setUser(userData)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single()
      setProfile(profileData)

      // Fetch reports
      let reportsQuery = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      reportsQuery = reportsQuery.eq('user_id', userData.id)

      const { data: reportsData, error: reportsError } = await reportsQuery

      if (reportsError) {
        console.error('Error fetching reports for dashboard:', reportsError)
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
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Calculate stats
  const totalReports = reports?.length || 0
  const avgFps = totalReports > 0
    ? Math.round(reports!.reduce((sum, r) => sum + r.fps_avg, 0) / totalReports)
    : 0
  const totalLikes = reports?.reduce((sum, r) => sum + r.likes, 0) || 0
  const totalViews = reports?.reduce((sum, r) => sum + (r.views || 0), 0) || 0
  const recentReports = reports?.filter(r => {
    const reportDate = new Date(r.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return reportDate > weekAgo
  }).length || 0

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
            <p className="text-zinc-400 mt-4">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-emerald-400">
            {user ? 'Meu Dashboard' : 'Dashboard'}
          </h1>
          <button
            onClick={fetchDashboardData}
            className="bg-zinc-700 text-zinc-100 px-4 py-2 rounded-md hover:bg-zinc-600 transition-colors"
          >
            Atualizar
          </button>
        </div>

        {/* User Profile Section */}
        {user && profile && (
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-zinc-950" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100">
                    {profile.nickname || profile.full_name || user.email}
                  </h2>
                  <p className="text-zinc-400">{profile.nickname ? `@${profile.nickname}` : user.email}</p>
                  {profile.bio && (
                    <p className="text-zinc-300 mt-2 max-w-md">{profile.bio}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    {profile.is_supporter && (
                      <span className="flex items-center space-x-1 bg-emerald-900/20 text-emerald-400 px-2 py-1 rounded-full text-sm">
                        <Award className="w-3 h-3" />
                        <span>Apoiador</span>
                      </span>
                    )}
                    <span className="text-zinc-500 text-sm">
                      Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/perfil"
                className="flex items-center space-x-2 bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Editar Perfil</span>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span className="text-zinc-300">Reports Enviados</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{totalReports}</div>
            <div className="text-zinc-500 text-sm mt-1">
              {recentReports} esta semana
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-zinc-300">FPS Médio Geral</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{avgFps} FPS</div>
            <div className="text-zinc-500 text-sm mt-1">
              Baseado em {totalReports} reports
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-emerald-400" />
              <span className="text-zinc-300">Likes Recebidos</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{totalLikes}</div>
            <div className="text-zinc-500 text-sm mt-1">
              {totalReports > 0 ? Math.round(totalLikes / totalReports * 10) / 10 : 0} likes/report
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-zinc-300">Visualizações Totais</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{totalViews}</div>
            <div className="text-zinc-500 text-sm mt-1">
              {totalReports > 0 ? Math.round(totalViews / totalReports * 10) / 10 : 0} views/report
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-8">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">Apoie o Projeto</h2>
          <p className="text-zinc-300 mb-4">
            Vai rodar? é 100% gratuito e depende do apoio da comunidade. Sua contribuição ajuda a manter os servidores e recompensar os top contributors.
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