'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Chrome, Users, TrendingUp, Gamepad2, CheckCircle, X } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido'
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 8) {
      newErrors.password = 'A senha deve ter pelo menos 8 caracteres'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      // Mostrar modal de confirmação em vez de alert
      setShowConfirmationModal(true)
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) alert(error.message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-emerald-400 mb-2">Junte-se à Comunidade JogaLiso</h1>
            <p className="text-xl text-zinc-300">Compartilhe suas configurações e ajude outros jogadores</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Benefits Section */}
            <div className="space-y-6">
              <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-zinc-100">Faça Parte da Comunidade</h3>
                </div>
                <p className="text-zinc-400">Junte-se a milhares de jogadores que compartilham configurações otimizadas para seus jogos favoritos.</p>
              </div>

              <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-zinc-100">Melhore seu FPS</h3>
                </div>
                <p className="text-zinc-400">Encontre configurações testadas que podem dobrar seu FPS em jogos pesados como Cyberpunk 2077 e The Witcher 3.</p>
              </div>

              <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
                <div className="flex items-center space-x-3 mb-3">
                  <Gamepad2 className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-zinc-100">Ganhe Reconhecimento</h3>
                </div>
                <p className="text-zinc-400">Seus reports podem ajudar outros jogadores e você ganha likes e apoio da comunidade.</p>
              </div>

              <div className="bg-emerald-900/20 border border-emerald-800/50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-emerald-300 font-medium mb-1">100% Gratuito</h4>
                    <p className="text-emerald-400/80 text-sm">O JogaLiso é mantido pela comunidade e não cobra nada para usar.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signup Form */}
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800">
              <h2 className="text-2xl font-bold text-center text-emerald-400 mb-6">
                Criar Conta Gratuita
              </h2>

              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }))
                      }
                    }}
                    className={`w-full px-3 py-3 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700'
                    }`}
                    placeholder="seu@email.com"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }))
                      }
                    }}
                    className={`w-full px-3 py-3 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: '' }))
                      }
                    }}
                    className={`w-full px-3 py-3 bg-zinc-800 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700'
                    }`}
                    placeholder="Digite a senha novamente"
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 text-zinc-950 py-3 px-4 rounded-md font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? 'Criando conta...' : 'Criar Conta Gratuita'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-zinc-900 text-zinc-400">Ou</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleSignup}
                  className="w-full flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 px-4 rounded-md font-semibold transition-colors border border-zinc-700"
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  Continuar com Google
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-zinc-400">
                  Já tem uma conta?{' '}
                  <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                    Entrar
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link href="/" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                  ← Voltar ao início
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Email */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-md w-full relative">
            <button
              onClick={() => {
                setShowConfirmationModal(false)
                router.push('/auth/login')
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-6">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>

              <h3 className="text-xl font-bold text-zinc-100 mb-3">
                Verifique seu email!
              </h3>

              <p className="text-zinc-300 mb-6 leading-relaxed">
                Enviamos um link de confirmação para <strong className="text-emerald-400">{email}</strong>.
                Clique no link para ativar sua conta e começar a compartilhar suas configurações.
              </p>

              <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-zinc-400">
                  <span className="font-medium text-zinc-300">Não recebeu o email?</span><br />
                  Verifique sua caixa de spam ou lixo eletrônico.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowConfirmationModal(false)
                  router.push('/auth/login')
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-3 px-4 rounded-md font-semibold transition-colors"
              >
                Ir para Login
              </button>

              <p className="text-xs text-zinc-500 mt-4">
                O link expira em 24 horas
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}