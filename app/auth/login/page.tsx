'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Chrome, LogIn, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: any) {
      // Instead of alert, show error in the form
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) alert(error.message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Welcome Back Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Bem-vindo de volta</h1>
          <p className="text-zinc-400">Entre na sua conta para continuar compartilhando configurações</p>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-lg border border-zinc-800">
          {errors.submit && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm flex items-center">
                <span className="mr-2">⚠️</span>
                {errors.submit}
              </p>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
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
                  if (errors.submit) {
                    setErrors(prev => ({ ...prev, submit: '' }))
                  }
                }}
                className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-zinc-500 ${
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
              <label className="block text-sm font-medium text-zinc-300 mb-2">
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
                  if (errors.submit) {
                    setErrors(prev => ({ ...prev, submit: '' }))
                  }
                }}
                className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-zinc-500 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700'
                }`}
                placeholder="Digite sua senha"
                required
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-3 px-4 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar na conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 px-4 rounded-md font-semibold transition-colors border border-zinc-700"
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continuar com Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-zinc-400">
              Ainda não tem conta?{' '}
              <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                Criar conta gratuita
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-zinc-400 hover:text-zinc-300 transition-colors text-sm">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}