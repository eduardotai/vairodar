'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import Link from 'next/link'
import { Upload, X, AlertCircle, CheckCircle, User, Mail, Lock, LogOut, Trash2, Save } from 'lucide-react'

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState({
    email: '',
    bio: '',
    avatar_url: ''
  })
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setSessionLoading(false)

      if (session?.user) {
        // Load profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileData) {
          setProfile({
            email: session.user.email || '',
            bio: profileData.bio || '',
            avatar_url: profileData.avatar_url || ''
          })
          setAvatarPreview(profileData.avatar_url || '')
        } else {
          setProfile({
            email: session.user.email || '',
            bio: '',
            avatar_url: ''
          })
        }
      }
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
    if (!sessionLoading && !session) {
      router.push('/auth/login')
    }
  }, [session, sessionLoading, router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors({ avatar: 'Imagem deve ter no máximo 2MB' })
        return
      }
      if (!file.type.startsWith('image/')) {
        setErrors({ avatar: 'Arquivo deve ser uma imagem' })
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setErrors({})
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !session?.user) return ''

    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSaveBio = async () => {
    if (!session?.user) return

    setLoading(true)
    setErrors({})
    setSuccess('')

    try {
      // Update only bio
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      setSuccess('Bio atualizada com sucesso!')
    } catch (error: any) {
      setErrors({ general: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) return

    setLoading(true)
    setErrors({})
    setSuccess('')

    try {
      let avatarUrl = profile.avatar_url

      if (avatarFile) {
        avatarUrl = await uploadAvatar()
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          bio: profile.bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Update email if changed
      if (profile.email !== session.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email
        })
        if (emailError) throw emailError
        setSuccess('Perfil atualizado! Verifique seu e-mail para confirmar a mudança de endereço.')
      } else {
        setSuccess('Perfil atualizado com sucesso!')
      }

      setAvatarFile(null)
    } catch (error: any) {
      setErrors({ general: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwords.new || passwords.new !== passwords.confirm) {
      setErrors({ password: 'Senhas não coincidem' })
      return
    }

    setLoading(true)
    setErrors({})
    setSuccess('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      })
      if (error) throw error

      setSuccess('Senha alterada com sucesso!')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      setErrors({ password: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return
    }

    setLoading(true)
    try {
      // Note: Account deletion requires server-side implementation
      // For now, we'll sign out and show a message
      await supabase.auth.signOut()
      alert('Para excluir sua conta, entre em contato com o suporte.')
      router.push('/')
    } catch (error: any) {
      setErrors({ general: error.message })
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold text-emerald-400 mb-8">Meu Perfil</h1>

        {success && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{success}</span>
          </div>
        )}

        {errors.general && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{errors.general}</span>
          </div>
        )}

        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-zinc-400" />
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-emerald-500 text-zinc-950 rounded-full p-1 cursor-pointer hover:bg-emerald-400">
                <Upload className="w-4 h-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">{session.user.email}</h3>
              <p className="text-zinc-400">Foto de perfil (máx. 2MB)</p>
              {errors.avatar && <p className="text-red-400 text-sm">{errors.avatar}</p>}
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-zinc-300">Bio</label>
                <button
                  type="button"
                  onClick={handleSaveBio}
                  disabled={loading}
                  className="px-3 py-1 bg-zinc-700 text-zinc-100 text-sm rounded hover:bg-zinc-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Bio'}
                </button>
              </div>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Conte um pouco sobre você..."
                maxLength={500}
              />
              <p className="text-xs text-zinc-500 mt-1">{profile.bio.length}/500 caracteres</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-zinc-950 py-3 px-4 rounded-md font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Salvando...' : 'Salvar Perfil Completo'}</span>
            </button>
          </form>

          {/* Password Change */}
          <div className="border-t border-zinc-700 pt-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Alterar Senha</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nova Senha</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-700 text-zinc-100 py-3 px-4 rounded-md font-semibold hover:bg-zinc-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Alterando...' : 'Alterar Senha'}</span>
              </button>
            </form>
          </div>

          {/* Account Actions */}
          <div className="border-t border-zinc-700 pt-6 space-y-4">
            <button
              onClick={handleLogout}
              className="w-full bg-zinc-700 text-zinc-100 py-3 px-4 rounded-md font-semibold hover:bg-zinc-600 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-900 text-red-100 py-3 px-4 rounded-md font-semibold hover:bg-red-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Conta</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-300 transition-colors">
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}