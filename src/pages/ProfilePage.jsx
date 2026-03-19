// src/pages/ProfilePage.jsx

import { useEffect, useState } from 'react'
import { useUser } from '../hooks/useUser'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import PageWrapper from '../components/ui/PageWrapper'

const ProfilePage = () => {
  const { profile, initials, displayName, isLoading, fetchProfile, updateProfile } = useUser()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', birthdate: '' })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  // Sincronizar form cuando carga el perfil
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        birthdate: profile.birthdate || '',
      })
    }
  }, [profile])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setIsSaving(true)
    const result = await updateProfile({
      name: form.name.trim(),
      birthdate: form.birthdate,
      email: profile?.email || user?.email || '',
    })
    setIsSaving(false)
    if (result.success) {
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleCancelEdit = () => {
    // Restaurar form al valor actual del perfil
    setForm({
      name: profile?.name || '',
      birthdate: profile?.birthdate || '',
    })
    setErrors({})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 dark:bg-white/10 bg-slate-200 rounded w-32" />
          <div className="h-40 dark:bg-white/10 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <PageWrapper>
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold dark:text-white text-slate-900 mb-6">Mi perfil</h1>

        {/* Avatar card */}
        <Card className="flex flex-col items-center py-8 mb-4">
          <Avatar initials={initials} name={profile?.name || ''} size="xl" />
          <h2 className="text-xl font-bold dark:text-white text-slate-900 mt-4">{displayName}</h2>
          <p className="dark:text-slate-400 text-slate-500 text-sm mt-1">
            {profile?.email || user?.email}
          </p>
          {profile?.birthdate && (
            <p className="dark:text-slate-500 text-slate-400 text-xs mt-1">
              Nacimiento: {new Date(profile.birthdate + 'T12:00:00').toLocaleDateString('es-AR', {
                day: '2-digit', month: 'long', year: 'numeric'
              })}
            </p>
          )}
          {profile?.createdAt && (
            <p className="dark:text-slate-500 text-slate-400 text-xs mt-1">
              Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-AR', {
                month: 'long', year: 'numeric'
              })}
            </p>
          )}
        </Card>

        {/* Success banner */}
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-sm px-4 py-3 rounded-xl mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Perfil actualizado correctamente
          </div>
        )}

        {/* Edit form */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold dark:text-white text-slate-900">Datos personales</h3>
            {!isEditing && (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <Input
                id="name"
                label="Nombre completo"
                placeholder="Juan García"
                value={form.name}
                onChange={handleChange('name')}
                error={errors.name}
                autoFocus
              />
              <Input
                id="birthdate"
                label="Fecha de nacimiento"
                type="date"
                value={form.birthdate}
                onChange={handleChange('birthdate')}
                error={errors.birthdate}
              />
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSaving} className="flex-1">
                  Guardar cambios
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-2 border-b dark:border-white/10 border-slate-100">
                <span className="text-sm dark:text-slate-400 text-slate-500">Nombre</span>
                <span className="text-sm dark:text-white text-slate-900 font-medium">
                  {profile?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-white/10 border-slate-100">
                <span className="text-sm dark:text-slate-400 text-slate-500">Email</span>
                <span className="text-sm dark:text-white text-slate-900 font-medium truncate ml-4">
                  {profile?.email || user?.email || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm dark:text-slate-400 text-slate-500">Fecha de nacimiento</span>
                <span className="text-sm dark:text-white text-slate-900 font-medium">
                  {profile?.birthdate
                    ? new Date(profile.birthdate + 'T12:00:00').toLocaleDateString('es-AR')
                    : '—'}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}

export default ProfilePage
