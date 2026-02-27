'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, Edit3, Heart, User, Calendar, Settings, Monitor, Cpu, HardDrive, Gamepad2, Eye, Clock } from 'lucide-react'
import type { Report, Profile } from '@/lib/types'

export default function ReportDetailPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [canEdit, setCanEdit] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [hasProcessedView, setHasProcessedView] = useState(false)
  const timeLeftRef = useRef<number | null>(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const handleLike = async () => {
    if (!session || !report) return

    try {
      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1
      const likeKey = `report_like_${report.id}`

      const { error } = await supabase
        .from('reports')
        .update({ likes: newLikesCount })
        .eq('id', report.id)

      if (error) {
        console.error('Error updating likes:', error)
        return
      }

      const newIsLiked = !isLiked
      setIsLiked(newIsLiked)
      setLikesCount(newLikesCount)

      // Update localStorage
      if (newIsLiked) {
        localStorage.setItem(likeKey, 'true')
      } else {
        localStorage.removeItem(likeKey)
      }

      // Update local report state
      setReport(prev => prev ? { ...prev, likes: newLikesCount } : null)
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }

    getSession()
  }, [])

  useEffect(() => {
    const fetchReport = async () => {
      if (!params.id || hasProcessedView) return

      console.log('Fetching report with ID:', params.id)

      try {
        // First try to get the report
        const { data: reportData, error: reportError } = await supabase
          .from('reports')
          .select('*')
          .eq('id', params.id)
          .single()

        if (reportError) {
          console.error('Report not found:', reportError)
          throw reportError
        }

        // Then try to get the profile
        let profileData = null
        if (reportData.user_id) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', reportData.user_id)
            .single()

          if (profileError) {
            console.warn('Profile not found for user:', reportData.user_id, profileError)
          } else {
            profileData = profile
          }
        }

        // Increment view count only once per user per report
        let updatedViews = reportData.views || 0
        const viewKey = `report_view_${params.id}`

        if (typeof window !== 'undefined' && !localStorage.getItem(viewKey)) {
          const { error: viewError } = await supabase
            .from('reports')
            .update({ views: updatedViews + 1 })
            .eq('id', params.id)

          if (viewError) {
            console.warn('Failed to increment view count:', viewError)
          } else {
            updatedViews += 1
            localStorage.setItem(viewKey, 'true')
          }
        }

        // Combine report with profile
        const fullReportData = {
          ...reportData,
          profile: profileData,
          views: updatedViews // Use the updated view count
        }

        console.log('Report data:', reportData)
        console.log('Report error:', reportError)

        if (reportError) throw reportError

        if (fullReportData) {
          console.log('Report found:', fullReportData)
          console.log('Report profile:', fullReportData.profile)
          setReport(fullReportData)
          setLikesCount(fullReportData.likes || 0)

          // Check if user can edit (within 2 hours)
          if (session?.user && fullReportData.user_id === session.user.id) {
            const createdAt = new Date(fullReportData.created_at)
            const now = new Date()
            const timeDiff = now.getTime() - createdAt.getTime()
            const twoHours = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

            if (timeDiff < twoHours) {
              setCanEdit(true)
              const remainingTime = twoHours - timeDiff
              setTimeLeft(remainingTime)
              timeLeftRef.current = remainingTime
            }
          }

          // Check if user liked this report (using localStorage for simplicity)
          const likeKey = `report_like_${params.id}`
          const hasLiked = typeof window !== 'undefined' && localStorage.getItem(likeKey) === 'true'
          setIsLiked(hasLiked)
        }

        // Mark as processed to prevent re-execution
        setHasProcessedView(true)
      } catch (error) {
        console.error('Error fetching report:', error)
        console.error('Error details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id && !hasProcessedView) {
      fetchReport()
    }
  }, [params.id, session, hasProcessedView])

  // Update countdown timer
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        timeLeftRef.current = timeLeftRef.current ? timeLeftRef.current - 1000 : 0

        if (timeLeftRef.current <= 0) {
          setCanEdit(false)
          setTimeLeft(0)
          timeLeftRef.current = 0
        } else {
          // Only update state every 10 seconds to reduce re-renders
          if (timeLeftRef.current % 10000 === 0) {
            setTimeLeft(timeLeftRef.current)
          }
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft])

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Carregando report...</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">Report não encontrado</h1>
          <Link href="/reports" className="text-emerald-400 hover:text-emerald-300">
            ← Voltar para reports
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/reports"
              className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para reports</span>
            </Link>

            <div className="flex items-center space-x-4">
              {canEdit && (
                <Link
                  href={`/reports/${report.id}/edit`}
                  className="flex items-center space-x-2 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-md font-semibold hover:bg-emerald-400 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar</span>
                  {timeLeft && (
                    <span className="text-xs bg-emerald-600 px-2 py-1 rounded">
                      {formatTimeLeft(timeLeft)}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-semibold transition-colors ${
                  isLiked
                    ? 'bg-red-500 text-white hover:bg-red-400'
                    : 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">{report.game}</h1>
          <div className="flex items-center space-x-4 text-zinc-400">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{report.profile?.nickname || report.profile?.full_name || 'Usuário'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(report.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{Math.floor(Math.random() * 100) + 50} visualizações</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">FPS Médio:</span>
                <span className="text-emerald-400 font-semibold">{report.fps_avg} FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">FPS 1% Low:</span>
                <span className="text-emerald-400 font-semibold">{report.fps_1low} FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Preset:</span>
                <span className="text-zinc-100">{report.preset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estabilidade:</span>
                <span className="text-zinc-100">{report.stability_note || 'Não informado'}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Configuração</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Monitor className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-400 text-sm">Resolução:</span>
                  <span className="text-zinc-100 ml-2">{report.resolution}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Cpu className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-400 text-sm">CPU:</span>
                  <span className="text-zinc-100 ml-2">{report.cpu}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-400 text-sm">GPU:</span>
                  <span className="text-zinc-100 ml-2">{report.gpu}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <HardDrive className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-400 text-sm">RAM:</span>
                  <span className="text-zinc-100 ml-2">{report.ram_gb}GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tweaks */}
        {report.tweaks && (
          <div className="bg-zinc-900 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Otimizações Aplicadas</h3>
            <p className="text-zinc-300 whitespace-pre-wrap">{report.tweaks}</p>
          </div>
        )}

        {/* Images */}
        {report.images && report.images.length > 0 && (
          <div className="bg-zinc-900 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Screenshots</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.images.map((image, index) => (
                <div key={index} className="aspect-video bg-zinc-800 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(image, '_blank')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Timer Warning */}
        {canEdit && timeLeft && (
          <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">Tempo para editar: {formatTimeLeft(timeLeft)}</span>
            </div>
            <p className="text-amber-300 text-sm mt-1">
              Você pode editar este report por mais {Math.floor(timeLeft / (1000 * 60))} minutos.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}