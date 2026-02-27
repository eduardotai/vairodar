'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, Upload, X, AlertCircle, CheckCircle, Save, Clock } from 'lucide-react'

interface Game {
  id: number
  name: string
  cover?: string
  isPopular?: boolean
}

export default function EditReportPage() {
  const [formData, setFormData] = useState({
    game: '',
    cpu: '',
    gpu: '',
    ram_gb: 16,
    resolution: '',
    preset: '',
    tweaks: '',
    fps_avg: 0,
    fps_1low: 0,
    stability_note: ''
  })
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hardwareOptions, setHardwareOptions] = useState({
    cpus: [] as string[],
    gpus: [] as string[],
    resolutions: [] as string[],
    presets: [] as string[]
  })
  const [success, setSuccess] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setSessionLoading(false)
    }

    getSession()
  }, [])

  useEffect(() => {
    const fetchHardwareOptions = async () => {
      try {
        const response = await fetch('/hardware.json')
        if (response.ok) {
          const data = await response.json()
          setHardwareOptions(data)
        }
      } catch (error) {
        console.error('Error fetching hardware options:', error)
      }
    }

    fetchHardwareOptions()
  }, [])

  useEffect(() => {
    const fetchReport = async () => {
      if (!params.id || !session) return

      try {
        const { data: reportData, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', session.user.id)
          .single()

        if (error) throw error

        if (reportData) {
          // Check if user can edit (within 2 hours)
          const createdAt = new Date(reportData.created_at)
          const now = new Date()
          const timeDiff = now.getTime() - createdAt.getTime()
          const twoHours = 2 * 60 * 60 * 1000

          if (timeDiff < twoHours) {
            setCanEdit(true)
            setTimeLeft(twoHours - timeDiff)

            // Populate form with existing data
            setFormData({
              game: reportData.game,
              cpu: reportData.cpu,
              gpu: reportData.gpu,
              ram_gb: reportData.ram_gb,
              resolution: reportData.resolution,
              preset: reportData.preset,
              tweaks: reportData.tweaks || '',
              fps_avg: reportData.fps_avg,
              fps_1low: reportData.fps_1low,
              stability_note: reportData.stability_note || ''
            })
            setExistingImages(reportData.images || [])
          } else {
            // Redirect if edit time expired
            router.push(`/reports/${params.id}`)
          }
        }
      } catch (error) {
        console.error('Error fetching report:', error)
        router.push('/dashboard')
      }
    }

    if (session && params.id) {
      fetchReport()
    }
  }, [params.id, session, router])

  // Update countdown timer
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev > 1000) {
            return prev - 1000
          } else {
            setCanEdit(false)
            return 0
          }
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.game.trim()) newErrors.game = 'Jogo é obrigatório'
    if (!formData.cpu.trim()) newErrors.cpu = 'CPU é obrigatória'
    if (!formData.gpu.trim()) newErrors.gpu = 'GPU é obrigatória'
    if (formData.ram_gb < 4 || formData.ram_gb > 256) newErrors.ram_gb = 'RAM deve ser entre 4GB e 256GB'
    if (!formData.resolution) newErrors.resolution = 'Resolução é obrigatória'
    if (!formData.preset) newErrors.preset = 'Preset é obrigatório'
    if (formData.fps_avg <= 0) newErrors.fps_avg = 'FPS médio deve ser maior que 0'
    if (formData.fps_1low <= 0) newErrors.fps_1low = 'FPS 1% low deve ser maior que 0'
    if (formData.fps_1low > formData.fps_avg) newErrors.fps_1low = 'FPS 1% low não pode ser maior que FPS médio'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadImages = async () => {
    const uploadedUrls: string[] = [...existingImages]

    for (const image of images) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `report-images/${fileName}`

      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, image)

      if (error) {
        console.error('Error uploading image:', error)
        continue
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      if (data) {
        uploadedUrls.push(data.publicUrl)
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session || !canEdit) return

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const uploadedImageUrls = await uploadImages()

      const { error } = await supabase
        .from('reports')
        .update({
          game: formData.game,
          cpu: formData.cpu,
          gpu: formData.gpu,
          ram_gb: Number(formData.ram_gb),
          resolution: formData.resolution,
          preset: formData.preset,
          tweaks: formData.tweaks || null,
          fps_avg: Number(formData.fps_avg),
          fps_1low: Number(formData.fps_1low),
          stability_note: formData.stability_note || null,
          images: uploadedImageUrls
        })
        .eq('id', params.id)
        .eq('user_id', session.user.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push(`/reports/${params.id}`)
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      setErrors({ submit: 'Erro ao atualizar report: ' + message })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} é muito grande. Máximo 5MB.`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} não é uma imagem válida.`)
        return false
      }
      return true
    })

    setImages(prev => [...prev, ...validFiles])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Carregando...</div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">Tempo para edição expirou</h1>
          <p className="text-zinc-400 mb-6">Você só pode editar reports por 2 horas após a publicação.</p>
          <Link href={`/reports/${params.id}`} className="text-emerald-400 hover:text-emerald-300">
            ← Voltar para o report
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/reports/${params.id}`}
            className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o report</span>
          </Link>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-zinc-100">Editar Report</h1>
            {timeLeft && (
              <div className="flex items-center space-x-2 bg-amber-900/20 border border-amber-700 px-3 py-2 rounded-md">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-semibold">{formatTimeLeft(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-emerald-900/20 border border-emerald-700 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Report atualizado com sucesso!</span>
            </div>
            <p className="text-emerald-300 text-sm mt-1">Redirecionando para o report...</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Jogo</label>
            <input
              type="text"
              value={formData.game}
              onChange={(e) => setFormData(prev => ({ ...prev, game: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            {errors.game && <p className="text-red-400 text-sm mt-1">{errors.game}</p>}
          </div>

          {/* Hardware Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">CPU</label>
              <select
                value={formData.cpu}
                onChange={(e) => setFormData(prev => ({ ...prev, cpu: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Selecione uma CPU</option>
                {hardwareOptions.cpus.map(cpu => (
                  <option key={cpu} value={cpu}>{cpu}</option>
                ))}
              </select>
              {errors.cpu && <p className="text-red-400 text-sm mt-1">{errors.cpu}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">GPU</label>
              <select
                value={formData.gpu}
                onChange={(e) => setFormData(prev => ({ ...prev, gpu: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Selecione uma GPU</option>
                {hardwareOptions.gpus.map(gpu => (
                  <option key={gpu} value={gpu}>{gpu}</option>
                ))}
              </select>
              {errors.gpu && <p className="text-red-400 text-sm mt-1">{errors.gpu}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">RAM (GB)</label>
              <input
                type="number"
                value={formData.ram_gb}
                onChange={(e) => setFormData(prev => ({ ...prev, ram_gb: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="4"
                max="256"
                required
              />
              {errors.ram_gb && <p className="text-red-400 text-sm mt-1">{errors.ram_gb}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Resolução</label>
              <select
                value={formData.resolution}
                onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Selecione</option>
                {hardwareOptions.resolutions.map(res => (
                  <option key={res} value={res}>{res}</option>
                ))}
              </select>
              {errors.resolution && <p className="text-red-400 text-sm mt-1">{errors.resolution}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Preset</label>
              <select
                value={formData.preset}
                onChange={(e) => setFormData(prev => ({ ...prev, preset: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Selecione</option>
                {hardwareOptions.presets.map(preset => (
                  <option key={preset} value={preset}>{preset}</option>
                ))}
              </select>
              {errors.preset && <p className="text-red-400 text-sm mt-1">{errors.preset}</p>}
            </div>
          </div>

          {/* Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">FPS Médio</label>
              <input
                type="number"
                value={formData.fps_avg}
                onChange={(e) => setFormData(prev => ({ ...prev, fps_avg: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                required
              />
              {errors.fps_avg && <p className="text-red-400 text-sm mt-1">{errors.fps_avg}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">FPS 1% Low</label>
              <input
                type="number"
                value={formData.fps_1low}
                onChange={(e) => setFormData(prev => ({ ...prev, fps_1low: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                required
              />
              {errors.fps_1low && <p className="text-red-400 text-sm mt-1">{errors.fps_1low}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nota de Estabilidade</label>
            <input
              type="text"
              value={formData.stability_note}
              onChange={(e) => setFormData(prev => ({ ...prev, stability_note: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: Estável, sem travamentos"
            />
          </div>

          {/* Tweaks */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Otimizações Aplicadas</label>
            <textarea
              value={formData.tweaks}
              onChange={(e) => setFormData(prev => ({ ...prev, tweaks: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Descreva as otimizações aplicadas..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Screenshots</label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm text-zinc-400 mb-2">Imagens existentes:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md border border-zinc-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div className="space-y-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-md cursor-pointer hover:border-emerald-500 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <span className="text-zinc-400">Clique para adicionar screenshots</span>
                </div>
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Nova imagem ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md border border-zinc-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-900/20 border border-red-700 rounded-md p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Erro ao atualizar report</span>
              </div>
              <p className="text-red-300 text-sm mt-1">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-zinc-950 py-3 px-4 rounded-md font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}