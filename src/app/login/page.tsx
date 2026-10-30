"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getBarUsers,
  loginWithCredentials,
  registerBusinessOwner,
  setAuthState,
  UserRole,
  AuthUser
} from '@/lib/authStore'
import {
  Shield,
  KeyRound,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
  Store,
  Mail,
  User,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('register')

  // Estado del formulario de Registro (Crea tu cuenta)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [barName, setBarName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estado del formulario de Login
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner')
  const [identifier, setIdentifier] = useState('')
  const [pinOrPass, setPinOrPass] = useState('')
  const [loading, setLoading] = useState(false)

  // Mensajes de alerta y feedback
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Manejar Registro de Nuevo Bar con comprobación en la nube
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Por favor ingresa tus nombres y apellidos completos.')
      return
    }
    if (!barName.trim()) {
      setErrorMsg('Por favor ingresa el nombre comercial de tu bar.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico de contacto válido.')
      return
    }
    if (!password.trim() || password.length < 4) {
      setErrorMsg('La contraseña o PIN debe tener al menos 4 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.')
      return
    }
    if (!acceptedTerms) {
      setErrorMsg('Debes aceptar la autorización de tratamiento de datos personales para continuar.')
      return
    }

    setLoading(true)
    try {
      const newUser = await registerBusinessOwner({
        firstName,
        lastName,
        barName,
        email,
        passwordOrPin: password,
        phone,
        city,
      })

      setSuccessMsg(`¡Felicitaciones ${newUser.name}! Tu bar "${barName}" ha sido registrado con éxito. Accediendo al sistema...`)
      setTimeout(() => {
        router.push('/')
      }, 700)
    } catch (err: unknown) {
      console.error('Error al registrar bar:', err)
      const msg = err instanceof Error ? err.message : 'Ocurrió un error al registrar el bar. Intenta de nuevo.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  // Usuarios registrados del bar
  const [barUsers] = useState<AuthUser[]>(() => getBarUsers())

  // Manejar Login Rápido por Perfil del Bar
  const handleQuickLogin = (targetUser: AuthUser) => {
    setErrorMsg('')
    setAuthState({
      user: targetUser,
      isAuthenticated: true,
    })
    setSuccessMsg(`¡Bienvenido ${targetUser.name}! Accediendo al sistema...`)
    setTimeout(() => {
      router.push('/')
    }, 400)
  }

  // Manejar Login Tradicional con Credenciales contra Supabase
  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!identifier && !pinOrPass) {
      setErrorMsg('Ingresa tu usuario, correo o PIN para continuar.')
      return
    }

    setLoading(true)
    try {
      const res = await loginWithCredentials(identifier, pinOrPass)
      if (res.success && res.user) {
        setSuccessMsg(`¡Bienvenido ${res.user.name}! Accediendo como ${res.user.roleTitle}...`)
        setTimeout(() => {
          router.push('/')
        }, 400)
      } else {
        setErrorMsg(res.message || 'Credenciales no válidas. Verifica tu correo y contraseña o PIN.')
      }
    } catch {
      setErrorMsg('Error al conectar con el servicio de autenticación.')
    } finally {
      setLoading(false)
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
    <div className="min-h-screen w-full flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-xl space-y-6">
        {/* Notificaciones */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center space-x-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center space-x-2.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tarjeta Principal de Registro / Login con Estilo DattaPro Dark */}
        <div className="bg-[#0e131f]/90 border border-[#1e293b] rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Logo y Encabezado */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center space-x-2.5 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-900/40 text-xl font-black text-white">
                🎸
              </div>
              <span className="font-black text-xl tracking-wider text-white">
                ROCK BAR <span className="text-amber-500">POS</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {mode === 'register' ? 'Crea tu cuenta' : 'Inicia sesión en tu Bar'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              {mode === 'register'
                ? 'Pasa de los cuadernos al control total: mesas, ventas, cobros e inventario adaptado a tu negocio.'
                : 'Accede a las operaciones diarias de tu establecimiento según tu rol de trabajo.'}
            </p>

            {/* Selector de Pestaña Modo */}
            <div className="pt-2 flex justify-center">
              <div className="inline-flex p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setErrorMsg('')
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Registrar Mi Bar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setErrorMsg('')
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* MODO 1: REGISTRO DE CUENTA Y BAR (ESTILO DATTAPRO)           */}
          {/* ============================================================ */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nombres</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ej. Carlos"
                      className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Apellidos</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ej. Santana"
                      className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Nombre del Bar o Establecimiento */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nombre del Bar / Establecimiento</label>
                <div className="relative">
                  <Store className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={barName}
                    onChange={(e) => setBarName(e.target.value)}
                    placeholder="Ej. Cervecería El Barril, Bar La Esquina"
                    className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Correo Electrónico Comercial</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@tubar.com"
                    className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Teléfono y Ciudad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Teléfono / WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 123 4567"
                      className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Ciudad</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Cúcuta, Medellín, Cali..."
                      className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Contraseña o PIN Maestro</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crea una contraseña segura"
                    className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Al menos 4 caracteres o PIN de administración.</p>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu contraseña"
                    className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tratamiento de Datos Personales (Estilo DattaPro) */}
              <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-0"
                  />
                  <span className="leading-relaxed">
                    Al realizar el registro, autorizo de manera previa, expresa e informada al sistema para el tratamiento de mis datos personales y de mi establecimiento comercial, conforme a la Política de Tratamiento de Datos Personales institucional y la Ley 1581 de 2012 de la República de Colombia.
                  </span>
                </label>
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-xl shadow-red-950/50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Validando en la Nube...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Crear Cuenta & Comenzar con mi Bar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setErrorMsg('')
                  }}
                  className="text-xs text-zinc-400 hover:text-amber-400 transition-colors"
                >
                  ¿Ya tienes cuenta registrada? <strong className="text-white underline">Inicia sesión aquí</strong>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* MODO 2: INICIO DE SESIÓN EXISTENTE (ROLES Y CREDENCIALES)    */}
          {/* ============================================================ */}
          {mode === 'login' && (
            <div className="space-y-6">
              {/* Sección A: Ingreso Rápido por Rol */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                    Acceso Demostrativo por Perfil
                  </span>
                  <span className="text-[10px] text-zinc-500">1 Clic para probar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {barUsers.map((member) => {
                    const colors = roleColors[member.role] || roleColors.staff
                    const isSelected = selectedRole === member.role

                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          setSelectedRole(member.role)
                          handleQuickLogin(member)
                        }}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all duration-200 group ${
                          isSelected
                            ? `${colors.border} ${colors.bg} ring-2 ring-amber-500/30`
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${colors.accent} flex items-center justify-center font-black text-white text-xs`}>
                            {member.avatar}
                          </div>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors.badge}`}>
                            {member.role.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors truncate">
                          {member.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 truncate">{member.roleTitle}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Sección B: Formulario PIN / Contraseña */}
              <form onSubmit={handleFormLogin} className="space-y-3 pt-3 border-t border-zinc-800/80">
                <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <KeyRound className="w-3.5 h-3.5 text-red-500" />
                  <span>O Ingresa con tu Correo o PIN Personal</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Usuario o Correo</label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="owner@rockbar.com"
                      className="w-full bg-[#131926] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">PIN o Contraseña</label>
                    <input
                      type="password"
                      value={pinOrPass}
                      onChange={(e) => setPinOrPass(e.target.value)}
                      placeholder="Ej. 1111"
                      className="w-full bg-[#131926] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Autenticando en la Nube...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Entrar al Sistema</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setErrorMsg('')
                    }}
                    className="text-xs text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    ¿Deseas registrar un nuevo bar? <strong className="text-white underline">Crea tu cuenta aquí</strong>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
