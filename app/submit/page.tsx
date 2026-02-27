'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import Link from 'next/link'
import { Upload, X, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'

interface Game {
  id: number
  name: string
  cover?: string
  isPopular?: boolean
}

export default function SubmitPage() {
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hardwareOptions, setHardwareOptions] = useState({
    cpus: [] as string[],
    gpus: [] as string[],
    resolutions: [] as string[],
    presets: [] as string[]
  })
  const [success, setSuccess] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [popularGames, setPopularGames] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [gameSearch, setGameSearch] = useState('')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setSessionLoading(false)
    }
    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      setSession(session)
      setSessionLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    const fetchHardwareOptions = async () => {
      try {
        // Fetch hardware data from local file
        const response = await fetch('/hardware.json')
        if (response.ok) {
          const data = await response.json()
          setHardwareOptions(data)
        } else {
          console.error('Failed to fetch hardware options')
          // Fallback to basic list
          setHardwareOptions({
            cpus: ['AMD Ryzen 5 5600', 'Intel Core i5-12600K'],
            gpus: ['NVIDIA RTX 3060', 'AMD RX 6700 XT'],
            resolutions: ['1280x720', '1366x768', '1600x900', '1920x1080', '2560x1440', '3440x1440', '3840x2160'],
            presets: ['Ultra', 'High', 'Medium', 'Low', 'Custom']
          })
        }
      } catch (error) {
        console.error('Error fetching hardware options:', error)
        // Fallback
        setHardwareOptions({
          cpus: ['AMD Ryzen 5 5600', 'Intel Core i5-12600K'],
          gpus: ['NVIDIA RTX 3060', 'AMD RX 6700 XT'],
          resolutions: ['1920x1080', '2560x1440'],
          presets: ['Ultra', 'High', 'Medium', 'Low']
        })
      }
    }

    const fetchPopularGames = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('game')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (error) {
          console.error('Error fetching popular games:', error)
          return
        }

        const gameCounts = data.reduce((acc, report) => {
          acc[report.game] = (acc[report.game] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const sorted = Object.entries(gameCounts)
          .sort(([,a], [,b]) => b - a)
          .map(([game]) => game)

        setPopularGames(sorted)
      } catch (error) {
        console.error('Error fetching popular games:', error)
      }
    }

    const fetchGames = async () => {
      try {
        const response = await fetch(`https://api.rawg.io/api/games?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&platforms=4&ordering=-rating&page_size=100`)
        const data = await response.json()

        const pcGames: Game[] = data.results.map((game: any) => ({
          id: game.id,
          name: game.name,
          cover: game.background_image,
        }))

        setGames(pcGames)
      } catch (error) {
        console.error('Error fetching games:', error)
        // Fallback games
        setGames([
          { id: 1, name: 'Cyberpunk 2077', cover: 'https://example.com/cyberpunk.jpg' },
          { id: 2, name: 'The Witcher 3', cover: 'https://example.com/witcher.jpg' },
          { id: 3, name: 'Fortnite', cover: 'https://example.com/fortnite.jpg' },
        ])
      }
    }

    fetchHardwareOptions()
    fetchPopularGames()
    fetchGames()
  }, [supabase])

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/auth/login')
    }
  }, [session, sessionLoading, router])

  useEffect(() => {
    if (session === null) return // still loading
    if (!session) {
      router.push('/auth/login')
    }
  }, [session, router])

  useEffect(() => {
    if (formData.cpu && formData.gpu) {
      suggestPreset()
    }
  }, [formData.cpu, formData.gpu])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.game-dropdown')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  useEffect(() => {
    setGames(prev => prev.map(game => ({
      ...game,
      isPopular: popularGames.includes(game.name)
    })).sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1
      if (!a.isPopular && b.isPopular) return 1
      return a.name.localeCompare(b.name)
    }))
  }, [popularGames])

  useEffect(() => {
    if (gameSearch.length < 3) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const searchGames = async () => {
      setIsSearching(true)
      try {
        const response = await fetch(`https://api.rawg.io/api/games?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&search=${encodeURIComponent(gameSearch)}&platforms=4&page_size=20`)
        const data = await response.json()
        const searchedGames: Game[] = data.results.map((game: any) => ({
          id: game.id,
          name: game.name,
          cover: game.background_image,
          isPopular: popularGames.includes(game.name)
        }))
        setSearchResults(searchedGames)
      } catch (error) {
        console.error('Error searching games:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(searchGames, 300)
    return () => clearTimeout(timeoutId)
  }, [gameSearch, popularGames])

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



  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const suggestPreset = () => {
    if (!formData.cpu || !formData.gpu) return

    // Simple preset suggestion based on hardware power
    const highEndGPUs = ['RTX 3080', 'RTX 3090', 'RTX 4070', 'RTX 4080', 'RTX 4090', 'RX 6800', 'RX 6900', 'RX 6950', 'RX 7900']
    const midEndGPUs = ['RTX 3060', 'RTX 3070', 'RTX 3060 Ti', 'RTX 3070 Ti', 'RX 6700', 'RX 6750', 'RX 6800 XT']

    const isHighEndGPU = highEndGPUs.some(gpu => formData.gpu.includes(gpu))
    const isMidEndGPU = midEndGPUs.some(gpu => formData.gpu.includes(gpu))

    if (isHighEndGPU) {
      setFormData(prev => ({ ...prev, preset: 'Ultra' }))
    } else if (isMidEndGPU) {
      setFormData(prev => ({ ...prev, preset: 'High' }))
    } else {
      setFormData(prev => ({ ...prev, preset: 'Medium' }))
    }
  }

  const uploadImages = async () => {
    const uploadedUrls: string[] = []

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

    if (!session) {
      setErrors({ submit: 'Você precisa estar logado para enviar um report' })
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages()

      const { error } = await supabase
        .from('reports')
        .insert([{
          user_id: session.user.id,
          ...formData,
          images: uploadedImageUrls
        }])

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      setErrors({ submit: 'Erro ao enviar report: ' + message })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ram_gb' || name === 'fps_avg' || name === 'fps_1low' ? Number(value) : value
    }))
  }

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Redirecionando para login...</div>
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-8">Enviar Report</h1>

        {success && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Report enviado com sucesso! Redirecionando...</span>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{errors.submit}</span>
          </div>
        )}



        <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-4">
          <div className="game-dropdown relative">
            <label className="block text-sm font-medium text-zinc-300 mb-1">Jogo *</label>
            <div className="relative">
              <input
                type="text"
                value={formData.game}
                onChange={(e) => {
                  setGameSearch(e.target.value)
                  setFormData(prev => ({ ...prev, game: e.target.value }))
                }}
                onFocus={() => setShowDropdown(true)}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.game ? 'border-red-500' : 'border-zinc-700'}`}
                placeholder="Selecione ou digite o jogo..."
                required
              />
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-zinc-400" />
            </div>
            {showDropdown && (
              <div className="absolute z-10 w-full bg-zinc-800 border border-zinc-700 rounded-md mt-1 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="px-3 py-2 text-zinc-400">Buscando jogos...</div>
                ) : (
                  (gameSearch ? searchResults : games.filter(game => game.name.toLowerCase().includes(formData.game.toLowerCase()))).map(game => (
                    <div
                      key={game.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, game: game.name }))
                        setSelectedGame(game)
                        setGameSearch('')
                        setShowDropdown(false)
                      }}
                      className="flex items-center px-3 py-2 hover:bg-zinc-700 cursor-pointer"
                    >
                      {game.cover && <img src={game.cover} alt={game.name} className="w-8 h-8 mr-3 rounded" />}
                      <span className="text-zinc-100">{game.name}</span>
                      {game.isPopular && <span className="ml-2 text-orange-400">popular 🔥</span>}
                    </div>
                  ))
                )}
              </div>
            )}
            {errors.game && <p className="text-red-400 text-sm mt-1">{errors.game}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">CPU *</label>
              <select
                name="cpu"
                value={formData.cpu}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.cpu ? 'border-red-500' : 'border-zinc-700'}`}
                required
              >
                <option value="">Selecione sua CPU...</option>
                {hardwareOptions.cpus.map((cpu) => (
                  <option key={cpu} value={cpu}>{cpu}</option>
                ))}
              </select>
              {errors.cpu && <p className="text-red-400 text-sm mt-1">{errors.cpu}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">GPU *</label>
              <select
                name="gpu"
                value={formData.gpu}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.gpu ? 'border-red-500' : 'border-zinc-700'}`}
                required
              >
                <option value="">Selecione sua GPU...</option>
                {hardwareOptions.gpus.map((gpu) => (
                  <option key={gpu} value={gpu}>{gpu}</option>
                ))}
              </select>
              {errors.gpu && <p className="text-red-400 text-sm mt-1">{errors.gpu}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">RAM (GB) *</label>
              <input
                type="number"
                name="ram_gb"
                value={formData.ram_gb}
                onChange={handleChange}
                min="4"
                max="256"
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.ram_gb ? 'border-red-500' : 'border-zinc-700'}`}
                required
              />
              {errors.ram_gb && <p className="text-red-400 text-sm mt-1">{errors.ram_gb}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Resolução *</label>
              <select
                name="resolution"
                value={formData.resolution}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.resolution ? 'border-red-500' : 'border-zinc-700'}`}
                required
              >
                <option value="">Selecione...</option>
                {hardwareOptions.resolutions.map((res) => (
                  <option key={res} value={res}>{res}</option>
                ))}
              </select>
              {errors.resolution && <p className="text-red-400 text-sm mt-1">{errors.resolution}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-zinc-300">Preset *</label>
              <button
                type="button"
                onClick={suggestPreset}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                disabled={!formData.cpu || !formData.gpu}
              >
                Sugerir baseado no hardware
              </button>
            </div>
            <select
              name="preset"
              value={formData.preset}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.preset ? 'border-red-500' : 'border-zinc-700'}`}
              required
            >
              <option value="">Selecione...</option>
              {hardwareOptions.presets.map((preset) => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
            </select>
            {errors.preset && <p className="text-red-400 text-sm mt-1">{errors.preset}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Tweaks e Configurações</label>
            <textarea
              name="tweaks"
              value={formData.tweaks}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: DLSS Quality, FSR 1.0, redução de sombras, desabilitar motion blur..."
            />
            <p className="text-xs text-zinc-500 mt-1">Descreva as configurações específicas que você usou</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">FPS Médio *</label>
              <input
                type="number"
                name="fps_avg"
                value={formData.fps_avg}
                onChange={handleChange}
                min="1"
                max="500"
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.fps_avg ? 'border-red-500' : 'border-zinc-700'}`}
                placeholder="Ex: 75"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">FPS médio durante o gameplay</p>
              {errors.fps_avg && <p className="text-red-400 text-sm mt-1">{errors.fps_avg}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">FPS 1% Low *</label>
              <input
                type="number"
                name="fps_1low"
                value={formData.fps_1low}
                onChange={handleChange}
                min="1"
                max="500"
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.fps_1low ? 'border-red-500' : 'border-zinc-700'}`}
                placeholder="Ex: 55"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">Pior 1% dos frames (stutters)</p>
              {errors.fps_1low && <p className="text-red-400 text-sm mt-1">{errors.fps_1low}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Nota de Estabilidade</label>
            <textarea
              name="stability_note"
              value={formData.stability_note}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: Estável, sem travamentos, bom para jogos competitivos..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Screenshots (opcional)</label>
            <div className="border-2 border-dashed border-zinc-600 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-zinc-400" />
                <span className="text-zinc-400">Clique para adicionar screenshots</span>
                <span className="text-xs text-zinc-500">PNG, JPG até 5MB cada</span>
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative bg-zinc-800 rounded-lg p-2">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-xs text-zinc-400 mt-1 truncate">{image.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-zinc-950 py-3 px-4 rounded-md font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Report'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-300 transition-colors">
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}