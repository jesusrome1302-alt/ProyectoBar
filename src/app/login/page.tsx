"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRESET_USERS, loginWithPreset, loginWithCredentials, UserRole } from '@/lib/authStore'
import { Shield, KeyRound, Sparkles, CheckCircle2, Lock, ArrowRight, UserCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner')
  const [identifier, setIdentifier] = useState('')
  const [pinOrPass, setPinOrPass] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleQuickLogin = (role: UserRole) => {
    setErrorMsg('')
    const loggedUser = loginWithPreset(role)
    setSuccessMsg(`¡Bienvenido ${loggedUser.name}! Accediendo como ${loggedUser.roleTitle}...`)
    setTimeout(() => {
      router.push('/')
    }, 400)
  }

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!identifier && !pinOrPass) {
      setErrorMsg('Ingresa tu usuario, correo o PIN para continuar')
      return
    }

    const res = loginWithCredentials(identifier, pinOrPass)
    if (res.success && res.user) {
      setSuccessMsg(`¡Bienvenido ${res.user.name}! Accediendo como ${res.user.roleTitle}...`)
      setTimeout(() => {
        router.push('/')
      }, 400)
    } else {
      setErrorMsg(res.message || 'Credenciales no válidas')
    }
  }

  const roleColors = {
    owner: {
      border: 'border-amber-500/50 hover:border-amber-400',
      bg: 'bg-amber-500/10 hover:bg-amber-500/20',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      accent: 'from-amber-600 to-red-600',
    },
    admin: {
      border: 'border-cyan-500/50 hover:border-cyan-400',
      bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      accent: 'from-cyan-600 to-blue-600',
    },
    staff: {
      border: 'border-emerald-500/50 hover:border-emerald-400',
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      accent: 'from-emerald-600 to-teal-600',
    },
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-6 px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Cabecera / Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-red-600/20 border border-red-500/30 px-4 py-1.5 rounded-full text-red-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Control de Acceso y Turnos</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl">🎸</span>
            <span>ROCK BAR POS</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
            Selecciona tu perfil de usuario para ingresar al sistema con los permisos asignados a tu rol de trabajo.
          </p>
        </div>

        {/* Notificaciones */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-2xl text-sm flex items-center justify-center space-x-2 animate-shake">
            <Lock className="w-4 h-4 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-sm flex items-center justify-center space-x-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sección 1: Selección Rápida por Rol (1 Clic) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              Ingreso Rápido por Perfil (Demostración)
            </h2>
            <span className="text-xs text-zinc-500">Un clic para acceder</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRESET_USERS.map((preset) => {
              const colors = roleColors[preset.role]
              const isSelected = selectedRole === preset.role

              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setSelectedRole(preset.role)
                    handleQuickLogin(preset.role)
                  }}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden group ${
                    isSelected
                      ? `${colors.border} ${colors.bg} ring-2 ring-amber-500/40 shadow-xl shadow-red-950/30`
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${colors.accent} flex items-center justify-center font-black text-white text-lg shadow-md group-hover:scale-105 transition-transform`}>
                      {preset.avatar}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${colors.badge}`}>
                      {preset.role.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-3">{preset.roleTitle}</p>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                    <span>PIN: <strong className="text-zinc-300 tracking-wider">{preset.pin}</strong></span>
                    <span className="text-amber-500 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                      Ingresar <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sección 2: Formulario de Login Clásico o Personalizado */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-zinc-800">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ingreso con Credenciales o PIN Personal</h2>
              <p className="text-xs text-zinc-400">Si cuentas con tu propio PIN de mesero o correo de administrador</p>
            </div>
          </div>

          <form onSubmit={handleFormLogin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Usuario o Correo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ej. owner@rockbar.com o Carlos"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  PIN de Acceso o Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={pinOrPass}
                    onChange={(e) => setPinOrPass(e.target.value)}
                    placeholder="Ej. 1111 (o PIN de 4 dígitos)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-zinc-500 text-center sm:text-left">
                Acceso protegido por roles. Los empleados solo acceden a Mesas y Ventas. Los administradores y propietarios tienen acceso a Caja, Inventario y Reportes.
              </p>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-sm hover:from-red-500 hover:to-amber-500 transition-all shadow-lg shadow-red-900/40 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
