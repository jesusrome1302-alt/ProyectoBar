"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getBarUsers,
  loginWithCredentials,
  registerBusinessOwner,
  setAuthState,
  UserRole,
  AuthUser,
} from '@/lib/authStore'
import {
  smartSyncWithCloud,
  applyFullCloudSnapshotLocally,
  loadBarData,
} from '@/lib/barState'
import {
  pullCloudRelaySnapshot,
  calculateBarDataRichness,
} from '@/lib/supabaseClient'
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
  AlertCircle,
  LogIn,
  UserPlus,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')

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

  // Usuarios registrados del bar (se sincronizan automáticamente con la nube al abrir /login en un PC nuevo)
  const [barUsers, setBarUsers] = useState<AuthUser[]>(() => getBarUsers())

  useEffect(() => {
    const syncLoginProfiles = async () => {
      try {
        const localScore = calculateBarDataRichness(loadBarData())
        const snap = await pullCloudRelaySnapshot({ allowAnyIfEmpty: true })
        if (snap && snap.ownerUser) {
          // Si este navegador (ej. PC de Mesa recién abierto) está vacío y en la nube está el bar del Portátil, precargar perfiles y estado
          if (localScore <= 20 && snap.richnessScore > 20) {
            applyFullCloudSnapshotLocally(snap, false)
          }
          if (Array.isArray(snap.barUsers) && snap.barUsers.length > 0) {
            setBarUsers(snap.barUsers)
          } else {
            setBarUsers([snap.ownerUser])
          }
        }
      } catch {
        // Usar perfiles en caché local
      }
    }
    syncLoginProfiles()
  }, [])

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

  // Manejar Login Rápido por Perfil del Bar (con sincronización inmediata desde la nube)
  const handleQuickLogin = async (targetUser: AuthUser) => {
    setErrorMsg('')
    setLoading(true)
    setAuthState({
      user: targetUser,
      isAuthenticated: true,
    })
    try {
      await smartSyncWithCloud()
    } catch {
      // Continuar con caché local si no hay red
    } finally {
      setLoading(false)
    }
    setSuccessMsg(`¡Bienvenido ${targetUser.name}! Sincronizando datos de tu bar...`)
    setTimeout(() => {
      router.push('/')
    }, 300)
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

  // Renderizador del Formulario de Inicio de Sesión
  const renderSignInForm = (isMobile = false) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-widest">
          <LogIn className="w-4 h-4" />
          <span>Acceso al Sistema</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Inicia Sesión en tu Bar
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Accede a las operaciones diarias de tu establecimiento según tu rol de trabajo.
        </p>
      </div>

      {/* Sección A: Ingreso Rápido por Perfil */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
            Acceso Rápido por Perfil
          </span>
          <span className="text-[10px] text-zinc-500">1 Clic para entrar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                className={`cursor-pointer rounded-2xl p-3 border transition-all duration-200 group ${
                  isSelected
                    ? `${colors.border} ${colors.bg} ring-2 ring-amber-500/30`
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${colors.accent} flex items-center justify-center font-black text-white text-[11px]`}
                  >
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

      {/* Sección B: Formulario PIN / Credenciales */}
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
              className="w-full bg-[#131926] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">PIN o Contraseña</label>
            <input
              type="password"
              value={pinOrPass}
              onChange={(e) => setPinOrPass(e.target.value)}
              placeholder="Ej. 1111"
              className="w-full bg-[#131926] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-[0.99]"
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
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {isMobile && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setErrorMsg('')
              }}
              className="text-xs text-zinc-400 hover:text-amber-400 transition-colors"
            >
              ¿No tienes cuenta aún? <strong className="text-white underline">Regístrate aquí</strong>
            </button>
          </div>
        )}
      </form>
    </div>
  )

  // Renderizador del Formulario de Registro
  const renderSignUpForm = (isMobile = false) => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-widest">
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Establecimiento</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Crea tu cuenta de Bar
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Pasa de los cuadernos al control total: mesas, ventas, cobros e inventario adaptado a tu local.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-3.5">
        {/* Nombres y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Nombres *</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Carlos"
                className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Apellidos *</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. Santana"
                className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Nombre del Bar */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Nombre Comercial de tu Bar *</label>
          <div className="relative">
            <Store className="w-3.5 h-3.5 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={barName}
              onChange={(e) => setBarName(e.target.value)}
              placeholder="Ej. Cervecería El Barril, Bar La Esquina..."
              className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Correo Electrónico */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Correo Electrónico *</label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@tubar.com"
              className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Teléfono y Ciudad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Teléfono / WhatsApp</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300 123 4567"
                className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Ciudad</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Cúcuta, Medellín..."
                className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Contraseña y Confirmación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Contraseña o PIN Maestro *</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Confirmar Contraseña *</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la clave"
                className="w-full bg-[#131926] border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Términos y Tratamiento de Datos (Ley 1581) */}
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[10px] text-zinc-400">
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-0"
            />
            <span className="leading-tight">
              Autorizo el tratamiento de mis datos personales y de mi local conforme a la Ley 1581 de 2012 de Colombia.
            </span>
          </label>
        </div>

        {/* Botón de Registro */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-red-950/50 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Validando en la Nube...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Crear Cuenta & Comenzar</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {isMobile && (
          <div className="text-center pt-1">
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
        )}
      </form>
    </div>
  )

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-5xl space-y-4">
        {/* Cabecera de Marca Superior */}
        <div className="flex items-center justify-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-900/40 text-lg font-black text-white">
            🎸
          </div>
          <span className="font-black text-xl tracking-wider text-white">
            ROCK BAR <span className="text-amber-500">POS</span>
          </span>
        </div>

        {/* Mensajes de Alerta y Notificación */}
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

        {/* Segmented Pill Selector (Solo visible en dispositivos móviles / tabletas pequeñas) */}
        <div className="lg:hidden flex justify-center">
          <div className="relative inline-flex p-1 bg-zinc-950 rounded-2xl border border-zinc-800 w-full max-w-xs shadow-inner">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-gradient-to-r from-red-600 to-amber-600 shadow-md transition-transform duration-300 ease-out ${
                mode === 'login' ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMsg('')
              }}
              className={`relative z-10 w-1/2 py-2 text-xs font-bold transition-colors cursor-pointer text-center ${
                mode === 'login' ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setErrorMsg('')
              }}
              className={`relative z-10 w-1/2 py-2 text-xs font-bold transition-colors cursor-pointer text-center ${
                mode === 'register' ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Registrar Mi Bar
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CONTENEDOR PRINCIPAL: DOUBLE SLIDER ANIMATION                         */}
        {/* ===================================================================== */}
        <div className="auth-slider-box" data-mode={mode}>
          {/* VISTA MÓVIL (Carrusel deslizante táctil) */}
          <div className="lg:hidden">
            <div className="auth-mobile-track" data-mode={mode}>
              <div className="auth-mobile-pane p-5 sm:p-7">
                {renderSignInForm(true)}
              </div>
              <div className="auth-mobile-pane p-5 sm:p-7">
                {renderSignUpForm(true)}
              </div>
            </div>
          </div>

          {/* VISTA ESCRITORIO: DOUBLE SLIDER CON OVERLAY DESLIZANTE CON GRADIENTE */}
          <div className="hidden lg:block relative min-h-[720px]">
            {/* Lado Izquierdo: Formulario de Inicio de Sesión */}
            <div className="auth-form-side auth-sign-in p-8 sm:p-10">
              {renderSignInForm(false)}
            </div>

            {/* Lado Derecho: Formulario de Registro */}
            <div className="auth-form-side auth-sign-up p-8 sm:p-10">
              {renderSignUpForm(false)}
            </div>

            {/* Contenedor del Overlay Deslizante con Gradiente */}
            <div className="auth-overlay-wrapper">
              <div className="auth-overlay-bg">
                {/* Panel Overlay Izquierdo (Visible cuando estamos en Registro para invitar a Iniciar Sesión) */}
                <div className="auth-overlay-panel auth-overlay-left text-white space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-xl">
                    🛡️
                  </div>
                  <h2 className="text-3xl font-black tracking-tight leading-tight">
                    ¡Bienvenido de Nuevo!
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-200/90 leading-relaxed max-w-sm">
                    Para mantenerte conectado con tus mesas, comandas y arqueos diarios, inicia sesión con tus datos personales.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setErrorMsg('')
                    }}
                    className="mt-2 px-8 py-3 rounded-full border-2 border-white/90 hover:border-white bg-white/10 hover:bg-white text-white hover:text-black font-extrabold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
                  >
                    Iniciar Sesión
                  </button>
                </div>

                {/* Panel Overlay Derecho (Visible cuando estamos en Login para invitar a Registrar un Bar) */}
                <div className="auth-overlay-panel auth-overlay-right text-white space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-xl">
                    🍸
                  </div>
                  <h2 className="text-3xl font-black tracking-tight leading-tight">
                    ¡Pasa al Control Total!
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-200/90 leading-relaxed max-w-sm">
                    ¿Aún no tienes cuenta? Registra tu bar en 1 minuto y empieza a operar 100% digital con mesas, ventas e inventario.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setErrorMsg('')
                    }}
                    className="mt-2 px-8 py-3 rounded-full border-2 border-white/90 hover:border-white bg-white/10 hover:bg-white text-white hover:text-black font-extrabold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
                  >
                    Registrar Mi Bar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
