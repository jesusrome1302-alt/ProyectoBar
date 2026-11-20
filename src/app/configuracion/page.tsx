'use client'

import { useState, useRef, useEffect } from 'react'
import GulpDeleteButton from '@/components/GulpDeleteButton'
import {
  Settings,
  Building2,
  Sliders,
  Save,
  Check,
  RefreshCw,
  AlertTriangle,
  User,
  X,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Palette,
  Tag,
  Clock,
  Plus,
  Boxes,
  ShieldAlert,
  Lock,
  Database,
  Power,
  Edit2,
} from 'lucide-react'
import {
  useBarStore,
  loadBarData,
  saveBarData,
  updateBarSettings,
  updateBarLogo,
  clearOperationalDataOnly,
  addCategory,
  deleteCategory,
  addCustomDiscount,
  updateDiscountRule,
  toggleDiscountActive,
  deleteCustomDiscount,
  DEFAULT_CATEGORIES,
  PRESET_DISCOUNTS,
  DiscountRuleState,
  ThemePreset,
} from '@/lib/barState'
import {
  useAuthStore,
  updateUserPhoto,
  deleteAccountWithPinVerification,
  getLocalDeletedAccounts,
} from '@/lib/authStore'
import { getDeletedCloudAccounts, DeletedCloudAccountRecord } from '@/lib/supabaseClient'
import { processImageFile } from '@/lib/imageUtils'

const THEME_OPTIONS: { id: ThemePreset; name: string; desc: string; preview: string }[] = [
  {
    id: 'rock-red',
    name: '🔥 Rojo & Ámbar (Rock / Pub)',
    desc: 'Energía clásica para bares de rock, pubs y cervecerías',
    preview: 'from-red-700 via-zinc-900 to-amber-600',
  },
  {
    id: 'neon-purple',
    name: '🪩 Violeta & Fucsia Neón (Discoteca)',
    desc: 'Ambiente nocturno vibrante para clubs, rumbas y lounges',
    preview: 'from-purple-700 via-zinc-900 to-pink-600',
  },
  {
    id: 'craft-amber',
    name: '🍺 Dorado & Esmeralda (Cervecería)',
    desc: 'Tonos cálidos de malta artesanal y pub irlandés',
    preview: 'from-amber-700 via-zinc-900 to-emerald-700',
  },
  {
    id: 'lounge-cyan',
    name: '🍸 Cian & Azul Eléctrico (Gastrobar)',
    desc: 'Estilo moderno y elegante para coctelería y restaurantes',
    preview: 'from-cyan-700 via-zinc-900 to-blue-700',
  },
  {
    id: 'emerald-billar',
    name: '🎱 Verde Paño & Oro (Billar / Estadero)',
    desc: 'Inspirado en mesas de pool, deportes y estaderos',
    preview: 'from-emerald-700 via-zinc-900 to-amber-700',
  },
]

const BUSINESS_TYPES = [
  'Rock Bar & Pub',
  'Discoteca / Club Nocturno',
  'Cervecería Artesanal',
  'Gastrobar & Restaurante',
  'Billar, Pool & Estadero',
  'Café, Vinos & Coctelería',
  'Licorera & Estanco',
]

const BRAND_ICONS = ['🎸', '🍺', '🍸', '🪩', '🎱', '🍔', '🥃', '🍷', '🔥', '👑']

export default function ConfiguracionPage() {
  const barData = useBarStore()
  const settings = barData.settings || {
    barName: 'ROCK BAR',
    nit: '900.123.456-7',
    address: 'Calle 10 # 40-20, Medellín',
    phone: '+57 (4) 444-1234',
    footerText: '¡Gracias por tu visita a Rock Bar! El rock nunca muere.',
    tipPercentage: 10,
    taxPercentage: 8,
    businessType: 'Rock Bar & Pub',
    themePreset: 'rock-red' as ThemePreset,
    brandIcon: '🎸',
    slogan: 'Control en tiempo real de mesas, pedidos, cobros e inventario.',
  }

  const [barName, setBarName] = useState<string>(settings.barName || 'ROCK BAR')
  const [nit, setNit] = useState<string>(settings.nit || '900.123.456-7')
  const [address, setAddress] = useState<string>(settings.address || 'Calle 10 # 40-20, Medellín')
  const [phone, setPhone] = useState<string>(settings.phone || '+57 (4) 444-1234')
  const [footerText, setFooterText] = useState<string>(
    settings.footerText || '¡Gracias por tu visita a Rock Bar! El rock nunca muere.'
  )
  const [operatorName, setOperatorName] = useState<string>(barData.operatorName || 'Cajero Principal')
  const [tipPercentage, setTipPercentage] = useState<number>(settings.tipPercentage || 10)
  const [taxPercentage, setTaxPercentage] = useState<number>(settings.taxPercentage || 8)

  // Personalización de interfaz según el tipo de negocio
  const [businessType, setBusinessType] = useState<string>(settings.businessType || 'Rock Bar & Pub')
  const [themePreset, setThemePreset] = useState<ThemePreset>(settings.themePreset || 'rock-red')
  const [brandIcon, setBrandIcon] = useState<string>(settings.brandIcon || '🎸')
  const [slogan, setSlogan] = useState<string>(
    settings.slogan || 'Control en tiempo real de mesas, pedidos, cobros e inventario.'
  )

  const { user } = useAuthStore()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl || user?.photoUrl || '')
  const [isProcessingLogo, setIsProcessingLogo] = useState<boolean>(false)
  const [logoError, setLogoError] = useState<string>('')

  const [notification, setNotification] = useState<string>('')
  const [showResetModal, setShowResetModal] = useState<boolean>(false)

  // Categorías del negocio
  const barCategories = barData.categories && barData.categories.length > 0 ? barData.categories : DEFAULT_CATEGORIES
  const [newCatName, setNewCatName] = useState<string>('')
  const [newCatIcon, setNewCatIcon] = useState<string>('🍸')

  // Descuentos y Happy Hours (Predeterminados + Personalizados)
  const discountsList = barData.discounts && barData.discounts.length > 0 ? barData.discounts : PRESET_DISCOUNTS
  const productsList = barData.products || []
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false)
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null)
  const [discName, setDiscName] = useState<string>('')
  const [discDesc, setDiscDesc] = useState<string>('')
  const [discType, setDiscType] = useState<'percentage' | 'fixed' | 'fixed_off' | 'fixed_price'>('fixed_off')
  const [discValue, setDiscValue] = useState<number>(1500)
  const [discScope, setDiscScope] = useState<'all' | 'category' | 'product'>('category')
  const [discCategory, setDiscCategory] = useState<string>(barCategories[0]?.name || 'Cervezas')
  const [discProductId, setDiscProductId] = useState<string>(productsList[0]?.id || '')
  const [discIsHappyHour, setDiscIsHappyHour] = useState<boolean>(true)
  const [discStartTime, setDiscStartTime] = useState<string>('17:00')
  const [discEndTime, setDiscEndTime] = useState<string>('22:00')
  const [discDays, setDiscDays] = useState<string[]>(['Jue', 'Vie', 'Sáb'])

  // Eliminación de cuenta con verificación de PIN y base de datos de usuarios eliminados
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState<boolean>(false)
  const [showDeletedDbModal, setShowDeletedDbModal] = useState<boolean>(false)
  const [deletePinInput, setDeletePinInput] = useState<string>('')
  const [deleteReason, setDeleteReason] = useState<string>('Cierre o cambio de administración del local')
  const [deleteError, setDeleteError] = useState<string>('')
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false)
  const [deletedAccountsLog, setDeletedAccountsLog] = useState<DeletedCloudAccountRecord[]>(() =>
    getLocalDeletedAccounts()
  )

  useEffect(() => {
    const localList = getLocalDeletedAccounts()
    getDeletedCloudAccounts()
      .then((cloudList) => {
        if (cloudList && cloudList.length > 0) {
          const merged = [...cloudList]
          for (const loc of localList) {
            if (!merged.some((m) => m.email === loc.email && m.deleted_at === loc.deleted_at)) {
              merged.push(loc)
            }
          }
          setDeletedAccountsLog(merged)
        } else {
          setDeletedAccountsLog(localList)
        }
      })
      .catch(() => {})
  }, [showDeletedDbModal])

  // Subir y optimizar foto o logotipo del bar
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoError('')
    setIsProcessingLogo(true)
    try {
      const optimized = await processImageFile(file, 400, 400, 0.85)
      setLogoUrl(optimized)
      updateBarLogo(optimized)
      updateUserPhoto(optimized)
      setNotification('¡Logotipo del bar guardado y sincronizado con éxito!')
      setTimeout(() => setNotification(''), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la imagen'
      setLogoError(msg)
    } finally {
      setIsProcessingLogo(false)
    }
  }

  // Quitar foto del bar
  const handleRemoveLogo = () => {
    setLogoUrl('')
    updateBarLogo('')
    updateUserPhoto('')
    setNotification('Foto del bar eliminada. Se restableció el icono por defecto.')
    setTimeout(() => setNotification(''), 4000)
  }

  // Guardar configuración general y personalización de interfaz
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()

    updateBarSettings({
      barName: barName.trim(),
      nit: nit.trim(),
      address: address.trim(),
      phone: phone.trim(),
      footerText: footerText.trim(),
      tipPercentage,
      taxPercentage,
      logoUrl,
      businessType,
      themePreset,
      brandIcon,
      slogan: slogan.trim(),
    })

    const data = loadBarData()
    data.operatorName = operatorName.trim() || 'Cajero Principal'
    saveBarData(data)

    setNotification('¡Configuración y personalización de interfaz guardadas con éxito!')
    setTimeout(() => setNotification(''), 4000)
  }

  // Crear nueva categoría de producto desde configuración
  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    const created = addCategory(newCatName.trim(), newCatIcon)
    setNewCatName('')
    setNotification(`¡Categoría "${created.icon || ''} ${created.name}" agregada al catálogo!`)
    setTimeout(() => setNotification(''), 3500)
  }

  // Abrir modal para crear un nuevo descuento / Happy Hour
  const openCreateDiscountModal = () => {
    setEditingDiscountId(null)
    setDiscName('')
    setDiscDesc('')
    setDiscType('fixed_off')
    setDiscValue(1500)
    setDiscScope('category')
    setDiscCategory(barCategories[0]?.name || 'Cervezas')
    setDiscProductId(productsList[0]?.id || '')
    setDiscIsHappyHour(true)
    setDiscStartTime('17:00')
    setDiscEndTime('22:00')
    setDiscDays(['Jue', 'Vie', 'Sáb'])
    setShowDiscountModal(true)
  }

  // Abrir modal para editar cualquier descuento existente (predeterminado o personalizado)
  const openEditDiscountModal = (disc: DiscountRuleState) => {
    setEditingDiscountId(disc.id)
    setDiscName(disc.name)
    setDiscDesc(disc.description || '')
    setDiscType(disc.type)
    setDiscValue(disc.value)
    setDiscScope(disc.scope)
    setDiscCategory(disc.categoryName || barCategories[0]?.name || 'Cervezas')
    setDiscProductId(disc.productId || productsList[0]?.id || '')
    setDiscIsHappyHour(Boolean(disc.isHappyHour))
    setDiscStartTime(disc.startTime || '17:00')
    setDiscEndTime(disc.endTime || '22:00')
    setDiscDays(disc.days && disc.days.length > 0 ? disc.days : ['Jue', 'Vie', 'Sáb'])
    setShowDiscountModal(true)
  }

  // Crear o actualizar descuento o Happy Hour para este local
  const handleCreateCustomDiscount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!discName.trim() || discValue <= 0) return

    const selectedProd = productsList.find((p) => p.id === discProductId)
    const benefitLabel =
      discType === 'percentage'
        ? `${discValue}%`
        : discType === 'fixed_off'
        ? `-$ ${discValue.toLocaleString('es-CO')} por unidad`
        : discType === 'fixed_price'
        ? `Precio fijo $ ${discValue.toLocaleString('es-CO')} c/u`
        : `$ ${discValue.toLocaleString('es-CO')} al total`

    const autoDescription =
      discDesc.trim() ||
      `${discIsHappyHour ? 'Happy Hour' : 'Descuento'} de ${benefitLabel} (${businessType})`

    if (editingDiscountId) {
      updateDiscountRule(editingDiscountId, {
        name: discName.trim(),
        description: autoDescription,
        type: discType,
        value: Number(discValue),
        scope: discScope,
        categoryName: discScope === 'category' ? discCategory : undefined,
        productId: discScope === 'product' ? discProductId : undefined,
        productName: discScope === 'product' ? selectedProd?.name : undefined,
        isHappyHour: discIsHappyHour,
        startTime: discIsHappyHour ? discStartTime : undefined,
        endTime: discIsHappyHour ? discEndTime : undefined,
        days: discIsHappyHour ? discDays : undefined,
        businessTypeTag: businessType,
      })
      setShowDiscountModal(false)
      setEditingDiscountId(null)
      setNotification(`¡Descuento "${discName.trim()}" actualizado correctamente!`)
      setTimeout(() => setNotification(''), 4500)
      return
    }

    const created = addCustomDiscount({
      name: discName.trim(),
      description: autoDescription,
      type: discType,
      value: Number(discValue),
      scope: discScope,
      categoryName: discScope === 'category' ? discCategory : undefined,
      productId: discScope === 'product' ? discProductId : undefined,
      productName: discScope === 'product' ? selectedProd?.name : undefined,
      isHappyHour: discIsHappyHour,
      startTime: discIsHappyHour ? discStartTime : undefined,
      endTime: discIsHappyHour ? discEndTime : undefined,
      days: discIsHappyHour ? discDays : undefined,
      businessTypeTag: businessType,
      active: true,
    })

    setShowDiscountModal(false)
    setDiscName('')
    setDiscDesc('')
    setDiscValue(1500)
    setNotification(`¡"${created.name}" creado para tu local!`)
    setTimeout(() => setNotification(''), 4500)
  }

  const toggleDaySelection = (day: string) => {
    if (discDays.includes(day)) {
      setDiscDays(discDays.filter((d) => d !== day))
    } else {
      setDiscDays([...discDays, day])
    }
  }

  // Confirmar eliminación de cuenta verificando PIN
  const handleConfirmDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteError('')

    if (!deletePinInput.trim()) {
      setDeleteError('Por favor ingresa tu PIN o contraseña actual para verificar tu identidad.')
      return
    }

    setIsDeletingAccount(true)
    try {
      const res = await deleteAccountWithPinVerification({
        pinInput: deletePinInput,
        reason: deleteReason,
      })

      if (!res.success) {
        setDeleteError(res.message)
      } else {
        setShowDeleteAccountModal(false)
      }
    } catch {
      setDeleteError('Error al procesar la solicitud de eliminación.')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  // Limpiar operaciones de prueba para la noche
  const handleConfirmReset = () => {
    clearOperationalDataOnly()
    setShowResetModal(false)
    setNotification('¡Mesas y movimientos de prueba reseteados a cero! Catálogo, stock y ajustes conservados.')
    setTimeout(() => setNotification(''), 5000)
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
            <Settings className="w-4 h-4 text-amber-500" />
            <span>Sistema, Personalización & Promociones • {businessType}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Configuración del Establecimiento
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Personaliza la interfaz de tu negocio, crea categorías, configura tus Happy Hours y gestiona la seguridad de tu cuenta.
          </p>
        </div>

        {/* Notificación Toast reactiva */}
        {notification && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identidad Visual & Logotipo del Bar */}
          <div className="rock-card p-6 rounded-2xl space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <Camera className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-white text-base">Identidad Visual & Logotipo del Bar</h3>
                  <p className="text-xs text-zinc-400">Esta foto se muestra en la cabecera, perfil de usuario y barra lateral</p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                WebP Ultra Ligero
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/80">
              <div className="relative group shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo del Bar"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl shadow-amber-950/40"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-red-950/40 border border-zinc-700">
                    {brandIcon}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  title="Cambiar foto del bar"
                  className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold transition-opacity cursor-pointer"
                >
                  <Camera className="w-6 h-6 mb-1 text-amber-400" />
                  <span>Cambiar</span>
                </button>
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-white">Foto o Logotipo de tu Establecimiento</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Sube una foto desde tu computador o celular. Se escala y comprime automáticamente para guardarse sin demoras en la nube y sincronizarse en todos tus dispositivos.
                  </p>
                </div>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isProcessingLogo}
                    className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{isProcessingLogo ? 'Procesando imagen...' : 'Subir Imagen desde el Dispositivo'}</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar Foto</span>
                    </button>
                  )}
                </div>

                {logoError && (
                  <p className="text-xs text-red-400 font-medium">{logoError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Personalización de la Interfaz de acuerdo al Negocio */}
          <div className="rock-card p-6 rounded-2xl space-y-4 lg:col-span-2 border border-amber-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <Palette className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Personalización de Interfaz según tu Tipo de Negocio</h3>
                  <p className="text-xs text-zinc-400">
                    Adapta el estilo visual, colores de ambiente, icono y tipo de local de tu establecimiento
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Tema Dinámico
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Tipo de Local e Icono */}
              <div className="md:col-span-5 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Tipo de Establecimiento / Giro del Local
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Icono / Emblema del Local
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {BRAND_ICONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setBrandIcon(ic)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                          brandIcon === ic
                            ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-md'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Eslogan / Mensaje de Bienvenida en Panel Principal
                  </label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="Ej. Las mejores cervezas frías y buena música en vivo."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Selector de Tema de Colores */}
              <div className="md:col-span-7 space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Ambiente Visual & Paleta de Colores de la Interfaz
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_OPTIONS.map((t) => {
                    const isSelected = themePreset === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setThemePreset(t.id)
                          updateBarSettings({ themePreset: t.id, businessType, brandIcon, slogan })
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                          isSelected
                            ? 'border-amber-400 bg-zinc-900 ring-2 ring-amber-500/30 shadow-lg'
                            : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.preview} shrink-0 border border-white/20`} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{t.name}</p>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">{t.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Información del Negocio */}
          <div className="rock-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-zinc-800">
              <Building2 className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white text-base">Datos del Negocio & Tickets</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Nombre Comercial del Bar *</label>
                <input
                  type="text"
                  required
                  value={barName}
                  onChange={(e) => setBarName(e.target.value)}
                  placeholder="Ej. ROCK BAR MEDELLÍN"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">NIT / Identificación</label>
                  <input
                    type="text"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    placeholder="900.123.456-7"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 (4) 444-1234"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Dirección del Local</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle 10 # 40-20, Zona Rosa"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Mensaje al pie del ticket / recibo térmico
                </label>
                <textarea
                  rows={2}
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="¡Gracias por tu visita a Rock Bar! El rock nunca muere."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Parámetros Operativos */}
          <div className="rock-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-zinc-800">
              <Sliders className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-white text-base">Parámetros Operativos & Cajero</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Nombre del Operador en Turno *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">
                  Aparece en tickets, comandas y comprobantes de arqueo
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Moneda Principal</label>
                <input
                  type="text"
                  readOnly
                  value="COP ($ - Pesos Colombianos)"
                  className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Propina Sugerida (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={tipPercentage}
                    onChange={(e) => setTipPercentage(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Impoconsumo / IVA (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={19}
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Mesas Activas en el Salón</label>
                <input
                  type="text"
                  readOnly
                  value={`${barData.tables?.length || 0} Mesas / Cuentas Registradas (Dinámicas)`}
                  className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar Configuración General */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-zinc-800">
          <div>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center space-x-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Preparar Bar para Turno de Hoy (Limpiar Pruebas)</span>
            </button>
            <p className="text-[11px] text-zinc-500 mt-1">
              Deja las mesas y cuentas en $0 sin borrar tus productos, inventario ni configuración.
            </p>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración e Interfaz</span>
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* SECCIÓN: CATEGORÍAS DE PRODUCTOS PERSONALIZADAS DEL NEGOCIO               */}
      {/* ========================================================================= */}
      <div className="rock-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <Boxes className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">Categorías de Productos de tu Negocio</h3>
              <p className="text-xs text-zinc-400">
                Crea categorías a la medida de tu carta (ej. Vinos, Shots, Botellas VIP, Comida Rápida, Billar). Se reflejan en Productos y Punto de Venta.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 w-fit">
            {barCategories.length} categorías activas
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={newCatIcon}
            onChange={(e) => setNewCatIcon(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-base text-white focus:outline-none focus:border-amber-500 cursor-pointer sm:w-24"
          >
            {['🍺', '🥃', '🍸', '🍷', '🍔', '🍕', '🌮', '🥤', '☕', '💨', '🎱', '🍾', '🍰', '🔥'].map((ic) => (
              <option key={ic} value={ic}>
                {ic}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Escribe el nombre de la nueva categoría (ej. Vinos, Shots, Hamburguesas, Billar...)"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Categoría</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {barCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs"
            >
              <span>{cat.icon || '📦'}</span>
              <span className="font-bold text-white">{cat.name}</span>
              {cat.isDefault ? (
                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Predeterminada</span>
              ) : (
                <GulpDeleteButton
                  size="xs"
                  label="Borrar"
                  title="Eliminar categoría"
                  onDelete={() => {
                    deleteCategory(cat.id)
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN: DESCUENTOS Y HAPPY HOURS (PREDETERMINADOS + DEL LOCAL)           */}
      {/* ========================================================================= */}
      <div className="rock-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <Tag className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-base">
                Descuentos & Happy Hours de tu Local (Predeterminados + Personalizados)
              </h3>
              <p className="text-xs text-zinc-400">
                Los descuentos predeterminados del sistema se mantienen siempre disponibles, y puedes crear promociones o Happy Hours propios según tu tipo de local.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateDiscountModal}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-900/30 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Crear Descuento / Happy Hour</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {discountsList.map((disc) => (
            <div
              key={disc.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                disc.active
                  ? 'bg-zinc-900/90 border-zinc-800 hover:border-amber-500/40'
                  : 'bg-zinc-950/50 border-zinc-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        disc.isHappyHour
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {disc.isHappyHour ? '🍹 HAPPY HOUR' : '🏷️ DESCUENTO'}
                    </span>
                    {disc.isPreset ? (
                      <span className="text-[9px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                        Predeterminado
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                        Propio del Local
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => openEditDiscountModal(disc)}
                      title="Editar este descuento o Happy Hour"
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-700 hover:border-amber-500/40 text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDiscountActive(disc.id)}
                      title={disc.active ? 'Pausar descuento temporalmente' : 'Activar descuento'}
                      className={`p-1 rounded-lg cursor-pointer ${
                        disc.active ? 'text-emerald-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-800'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    {!disc.isPreset && (
                      <GulpDeleteButton
                        size="xs"
                        label="Borrar"
                        title="Eliminar descuento personalizado"
                        onDelete={() => {
                          deleteCustomDiscount(disc.id)
                        }}
                      />
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-white text-sm">{disc.name}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">{disc.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="text-[11px] text-zinc-400">
                  {disc.scope === 'product' ? (
                    <span>
                      Producto: <strong className="text-amber-400">{disc.productName || 'Unidad específica'}</strong>
                    </span>
                  ) : disc.scope === 'category' ? (
                    <span>
                      Categoría: <strong className="text-amber-400">{disc.categoryName}</strong>
                    </span>
                  ) : (
                    <span>Aplica a: <strong className="text-zinc-200">Toda la cuenta</strong></span>
                  )}
                  {disc.isHappyHour && disc.startTime && disc.endTime && (
                    <span className="block text-[10px] text-zinc-500 flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1 text-amber-500 inline" />
                      {disc.startTime} - {disc.endTime} {disc.days?.length ? `(${disc.days.join(', ')})` : ''}
                    </span>
                  )}
                </div>

                <span className="text-sm font-black text-emerald-400 font-mono">
                  {disc.type === 'percentage'
                    ? `-${disc.value}%`
                    : disc.type === 'fixed_off'
                    ? `-$${disc.value.toLocaleString('es-CO')} c/u`
                    : disc.type === 'fixed_price'
                    ? `$${disc.value.toLocaleString('es-CO')} c/u`
                    : `-$${disc.value.toLocaleString('es-CO')}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN: ELIMINAR CUENTA CON VERIFICACIÓN DE PIN Y BD DE ELIMINADOS       */}
      {/* ========================================================================= */}
      <div className="rock-card p-6 rounded-2xl border border-red-900/50 bg-red-950/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-red-900/30">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-bold text-white text-base">
                Seguridad de la Cuenta & Eliminación Verificada con PIN
              </h3>
              <p className="text-xs text-zinc-400">
                Si deseas dar de baja tu cuenta comercial, el sistema solicitará verificación con tu PIN, archivará el registro en la Base de Datos de Usuarios Eliminados y borrará la cuenta activa.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowDeletedDbModal(true)}
              className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver BD Usuarios Eliminados ({deletedAccountsLog.length})</span>
            </button>

            <GulpDeleteButton
              size="md"
              variant="danger"
              label="Eliminar Mi Cuenta"
              onDelete={() => {
                setDeletePinInput('')
                setDeleteError('')
                setShowDeleteAccountModal(true)
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREAR O EDITAR DESCUENTO O HAPPY HOUR                              */}
      {/* ========================================================================= */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="rock-card w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border border-emerald-500/40 shadow-2xl relative space-y-4 animate-scaleUp my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  {editingDiscountId ? <Edit2 className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingDiscountId ? 'Editar Descuento / Happy Hour' : 'Nuevo Descuento / Happy Hour'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Configura descuentos por unidad, precio fijo, porcentaje o bono ({businessType})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDiscountModal(false)
                  setEditingDiscountId(null)
                }}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomDiscount} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nombre del Descuento o Happy Hour *
                </label>
                <input
                  type="text"
                  required
                  value={discName}
                  onChange={(e) => setDiscName(e.target.value)}
                  placeholder="Ej. Happy Hour Cervezas -$1.500 c/u, Pola a $7.500..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Modo de Descuento</label>
                  <select
                    value={discType}
                    onChange={(e) =>
                      setDiscType(e.target.value as 'percentage' | 'fixed' | 'fixed_off' | 'fixed_price')
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="fixed_off">Rebajar por Unidad ($ menos c/u)</option>
                    <option value="fixed_price">Precio Fijo por Unidad ($ c/u)</option>
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Bono Fijo al Total de la Cuenta ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    {discType === 'percentage'
                      ? 'Porcentaje (%) *'
                      : discType === 'fixed_off'
                      ? 'Rebaja por Unidad ($ c/u) *'
                      : discType === 'fixed_price'
                      ? 'Precio Final por Unidad ($) *'
                      : 'Descuento al Total ($) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={discType === 'percentage' ? 100 : 1000000}
                    value={discValue}
                    onChange={(e) => setDiscValue(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">¿A qué aplica?</label>
                  <select
                    value={discScope}
                    onChange={(e) => setDiscScope(e.target.value as 'all' | 'category' | 'product')}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="category">Categoría Específica (Por Unidades)</option>
                    <option value="product">Producto / Unidad Específica</option>
                    <option value="all">Toda la Cuenta / Todos los Ítems</option>
                  </select>
                </div>

                {discScope === 'category' && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">Categoría</label>
                    <select
                      value={discCategory}
                      onChange={(e) => setDiscCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {barCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {discScope === 'product' && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">Producto / Unidad</label>
                    <select
                      value={discProductId}
                      onChange={(e) => setDiscProductId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {productsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ($ {p.price.toLocaleString('es-CO')})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-2.5">
                <label className="flex items-center space-x-2 text-xs font-bold text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discIsHappyHour}
                    onChange={(e) => setDiscIsHappyHour(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>🍹 Es una promoción de Happy Hour con horario</span>
                </label>

                {discIsHappyHour && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Hora Inicio</label>
                        <input
                          type="time"
                          value={discStartTime}
                          onChange={(e) => setDiscStartTime(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Hora Fin</label>
                        <input
                          type="time"
                          value={discEndTime}
                          onChange={(e) => setDiscEndTime(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Días activos</label>
                      <div className="flex flex-wrap gap-1">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDaySelection(d)}
                            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                              discDays.includes(d)
                                ? 'bg-amber-500 text-black'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Descripción (Opcional)</label>
                <input
                  type="text"
                  value={discDesc}
                  onChange={(e) => setDiscDesc(e.target.value)}
                  placeholder="Condiciones o detalle corto..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscountModal(false)
                    setEditingDiscountId(null)
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg cursor-pointer"
                >
                  {editingDiscountId ? 'Guardar Cambios' : 'Guardar Promo / Happy Hour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ELIMINAR CUENTA CON VERIFICACIÓN DE PIN                            */}
      {/* ========================================================================= */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-red-500/50 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Eliminar Cuenta del Establecimiento</h3>
                  <p className="text-xs text-zinc-400">Verificación de seguridad obligatoria con PIN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleConfirmDeleteAccount} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                <p>
                  Estás a punto de eliminar la cuenta de <strong className="text-white">{barName}</strong> ({user?.email || 'propietario'}).
                </p>
                <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-1">
                  <li>Se verificará tu identidad mediante tu <strong>PIN de seguridad</strong>.</li>
                  <li>El registro se archivará en la <strong>Base de Datos de Usuarios Eliminados</strong> (`deleted_bar_accounts`).</li>
                  <li>Se eliminará la cuenta comercial activa de la base de datos y se cerrará la sesión.</li>
                </ul>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Motivo de eliminación
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Ej. Cierre del local, cambio de cuenta..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1">
                  Ingresa tu PIN o Contraseña para Confirmar *
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={deletePinInput}
                  onChange={(e) => setDeletePinInput(e.target.value)}
                  placeholder="Ingresa tu PIN actual (ej. 1111 o tu clave)"
                  className="w-full bg-zinc-900 border border-red-500/50 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <GulpDeleteButton
                  size="md"
                  variant="danger"
                  disabled={isDeletingAccount}
                  label={isDeletingAccount ? 'Eliminando...' : 'Eliminar Cuenta'}
                  onBeforeEat={() => {
                    setDeleteError('')
                    if (!deletePinInput.trim()) {
                      setDeleteError('Debes ingresar tu PIN de seguridad para autorizar la eliminación.')
                      return false
                    }
                    if (user?.pin && deletePinInput.trim() !== user.pin) {
                      setDeleteError('PIN de seguridad incorrecto. No se autorizó la eliminación de la cuenta.')
                      return false
                    }
                    return true
                  }}
                  onDelete={async () => {
                    setIsDeletingAccount(true)
                    try {
                      const res = await deleteAccountWithPinVerification({
                        pinInput: deletePinInput,
                        reason: deleteReason,
                      })
                      if (!res.success) {
                        setDeleteError(res.message)
                      } else {
                        setShowDeleteAccountModal(false)
                      }
                    } catch {
                      setDeleteError('Error al procesar la solicitud de eliminación.')
                    } finally {
                      setIsDeletingAccount(false)
                    }
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BASE DE DATOS DE USUARIOS / CUENTAS ELIMINADAS                     */}
      {/* ========================================================================= */}
      {showDeletedDbModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-2xl p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Base de Datos de Usuarios / Cuentas Eliminadas
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Registro histórico sincronizado con tabla `deleted_bar_accounts` (Verificadas con PIN)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeletedDbModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deletedAccountsLog.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-950/60 rounded-2xl border border-zinc-800">
                No hay cuentas eliminadas registradas en la base de datos hasta el momento.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">Bar / Local</th>
                      <th className="py-2.5 px-3">Titular & Correo</th>
                      <th className="py-2.5 px-3">Motivo</th>
                      <th className="py-2.5 px-3">Verificación</th>
                      <th className="py-2.5 px-3">Fecha Baja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70">
                    {deletedAccountsLog.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/40">
                        <td className="py-2.5 px-3 font-bold text-white">{item.bar_name}</td>
                        <td className="py-2.5 px-3 text-zinc-300">
                          <div>{item.full_name}</div>
                          <div className="text-[10px] text-zinc-500">{item.email}</div>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400">{item.deletion_reason}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            ✓ PIN Verificado
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400 font-mono text-[10px]">
                          {item.deleted_at}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowDeletedDbModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE PREPARACIÓN DE TURNO */}
      {/* ========================================================================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-amber-500/40 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Preparar Turno de Esta Noche</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <p>
                Esta acción te permite <strong>iniciar el turno con el bar 100% limpio</strong>:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-zinc-400">
                <li>Libera tus mesas a estado <em>Disponible</em> con saldo $0.</li>
                <li>Limpia comandas de prueba acumuladas.</li>
                <li>Reinicia las ventas del día para el nuevo arqueo de caja.</li>
                <li>
                  <strong className="text-emerald-400">Conserva intacto</strong> todo tu catálogo de productos, categorías, descuentos, existencias en nevera/bodega y proveedores.
                </li>
              </ul>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Ideal antes de abrir las puertas al público esta noche.</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
              >
                Sí, Preparar Turno en Limpio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
