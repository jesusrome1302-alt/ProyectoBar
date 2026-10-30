"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getBarUsers,
  saveBarUsers,
  addBarMember,
  deleteBarMember,
  useAuthStore,
  setAuthState,
  UserRole,
  AuthUser
} from '@/lib/authStore'
import { getCloudTeamMembers } from '@/lib/supabaseClient'
import {
  ShieldAlert,
  UserCheck,
  Check,
  Lock,
  Users,
  Eye,
  KeyRound,
  UserPlus,
  Trash2,
  X,
} from 'lucide-react'

export default function UsuariosPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'roles' | 'permisos'>('roles')
  const [usersList, setUsersList] = useState<AuthUser[]>(() => getBarUsers())
  const [showAddModal, setShowAddModal] = useState(false)

  // Formulario nuevo miembro del equipo
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('staff')
  const [newPin, setNewPin] = useState('')
  const [modalError, setModalError] = useState('')

  // Sincronizar usuarios del bar en tiempo real y consultar nube
  useEffect(() => {
    const handleUpdate = () => {
      setUsersList(getBarUsers())
    }
    window.addEventListener('rock_bar_users_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    // Sincronizar miembros desde Supabase Cloud si hay businessId
    if (user?.businessId) {
      getCloudTeamMembers(user.businessId)
        .then((cloudMembers) => {
          if (cloudMembers && cloudMembers.length > 0) {
            const current = getBarUsers()
            const owner = current.find((u) => u.role === 'owner') || user
            const formattedMembers: AuthUser[] = cloudMembers.map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email || '',
              role: m.role,
              roleTitle: m.role_title || (m.role === 'admin' ? 'Administrador / Gerente' : 'Mesero / Staff'),
              avatar: m.avatar || m.name.slice(0, 2).toUpperCase(),
              pin: m.pin,
              barName: user?.barName,
              businessId: user?.businessId,
            }))
            const merged = owner ? [owner, ...formattedMembers.filter((fm) => fm.id !== owner.id)] : formattedMembers
            saveBarUsers(merged)
            setUsersList(merged)
          }
        })
        .catch(() => {})
    }

    return () => {
      window.removeEventListener('rock_bar_users_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [user?.businessId, user])

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')

    if (!newName.trim()) {
      setModalError('Ingresa el nombre del empleado')
      return
    }
    if (!newPin.trim() || newPin.length < 4) {
      setModalError('Asigna un PIN de al menos 4 dígitos')
      return
    }

    try {
      addBarMember({
        name: newName,
        email: newEmail,
        role: newRole,
        pin: newPin,
      })

      setNewName('')
      setNewEmail('')
      setNewPin('')
      setNewRole('staff')
      setShowAddModal(false)
      setUsersList(getBarUsers())
    } catch (err) {
      console.error(err)
      setModalError('Error al agregar miembro')
    }
  }

  const handleDelete = (userId: string, userName: string) => {
    if (confirm(`¿Estás seguro de eliminar el acceso de "${userName}"?`)) {
      deleteBarMember(userId)
      setUsersList(getBarUsers())
    }
  }

  const handleSwitchUser = (targetUser: AuthUser) => {
    setAuthState({
      user: targetUser,
      isAuthenticated: true,
    })
  }

  const permissionsMatrix = [
    { module: 'Panel Principal y Métricas Generales', staff: true, admin: true, owner: true },
    { module: 'Mapa de Mesas y Asignación de Clientes', staff: true, admin: true, owner: true },
    { module: 'Venta Directa / Comandas en Barra', staff: true, admin: true, owner: true },
    { module: 'Cobro de Cuentas y Pre-Tickets', staff: true, admin: true, owner: true },
    { module: 'Gestión de Productos y Precios', staff: false, admin: true, owner: true },
    { module: 'Apertura y Cierre de Turno de Caja', staff: false, admin: true, owner: true },
    { module: 'Registro de Gastos y Salidas Menores', staff: false, admin: true, owner: true },
    { module: 'Compras a Proveedores y Kardex', staff: false, admin: true, owner: true },
    { module: 'Módulo de Reportes Financieros', staff: false, admin: true, owner: true },
    { module: 'Configuración Fiscal, NIT y Negocio', staff: false, admin: false, owner: true },
    { module: 'Gestión de Usuarios y Roles', staff: false, admin: false, owner: true },
  ]

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="relative overflow-hidden rounded-3xl rock-gradient p-6 sm:p-8 border border-red-900/40 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-600/30 border border-red-500/40 px-3 py-1 rounded-full text-amber-400 text-xs font-semibold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Equipo & Control de Acceso</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Personal y Roles de tu Bar
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base mt-1">
              Gestiona a los meseros, cajeros y administradores con acceso exclusivo a tu establecimiento.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg shadow-red-950/40 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Agregar Empleado</span>
            </button>

            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 space-x-4">
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'roles'
              ? 'border-red-500 text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personal de tu Bar ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permisos')}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'permisos'
              ? 'border-red-500 text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Matriz de Permisos por Rol</span>
        </button>
      </div>

      {/* Vista de Usuarios */}
      {activeTab === 'roles' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {usersList.map((member) => {
              const isActive = user?.id === member.id

              const theme = {
                owner: {
                  border: 'border-amber-500/40',
                  badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                  button: 'bg-amber-600 hover:bg-amber-500',
                  icon: '👑',
                },
                admin: {
                  border: 'border-cyan-500/40',
                  badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                  button: 'bg-cyan-600 hover:bg-cyan-500',
                  icon: '🛡️',
                },
                staff: {
                  border: 'border-emerald-500/40',
                  badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                  button: 'bg-emerald-600 hover:bg-emerald-500',
                  icon: '🍸',
                },
              }[member.role] || {
                border: 'border-zinc-800',
                badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
                button: 'bg-zinc-700 hover:bg-zinc-600',
                icon: '👤',
              }

              return (
                <div
                  key={member.id}
                  className={`rock-card rounded-2xl p-6 border transition-all relative overflow-hidden ${
                    isActive ? `${theme.border} ring-2 ring-red-500/40` : 'border-zinc-800'
                  }`}
                >
                  {isActive ? (
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      <span>SESIÓN ACTIVA</span>
                    </div>
                  ) : member.role !== 'owner' ? (
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      title="Eliminar empleado"
                      className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl shrink-0">
                      {theme.icon}
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-white text-base truncate">{member.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                        {member.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mb-4">{member.roleTitle}</p>

                  <div className="space-y-2 mb-6 text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                    <p className="flex justify-between truncate">
                      <span className="text-zinc-500">Correo:</span>
                      <strong className="text-zinc-200 truncate">{member.email}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-zinc-500">PIN de acceso:</span>
                      <strong className="text-amber-400 font-mono tracking-wider">{member.pin}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => handleSwitchUser(member)}
                    disabled={isActive}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center space-x-2 ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : `${theme.button} shadow-lg cursor-pointer`
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isActive ? 'Sesión Actual' : `Cambiar a ${member.name.split(' ')[0]}`}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Matriz de Permisos */
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950/60">
            <h3 className="text-sm font-bold text-white">Privilegios y Acceso por Rol</h3>
            <p className="text-xs text-zinc-400">Verifica qué acciones puede ejecutar cada miembro del equipo</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-semibold">Módulo o Acción Operativa</th>
                  <th className="p-4 font-semibold text-center text-emerald-400">🍸 Staff (Mesero)</th>
                  <th className="p-4 font-semibold text-center text-cyan-400">🛡️ Administrador</th>
                  <th className="p-4 font-semibold text-center text-amber-400">👑 Propietario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {permissionsMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 text-zinc-200 font-medium">{row.module}</td>
                    <td className="p-4 text-center">
                      {row.staff ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-600">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.admin ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-600">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.owner ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-600">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para Agregar Empleado / Mesero */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Registrar Nuevo Empleado</h3>
                  <p className="text-xs text-zinc-400">Crea acceso para tu personal con PIN único</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nombre del Empleado</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Juan Pérez (Mesero)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Rol de Trabajo</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                >
                  <option value="staff">🍸 Mesero / Barra (Solo mesas y ventas)</option>
                  <option value="admin">🛡️ Administrador (Caja, inventario y cobros)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">PIN de Acceso (4 dígitos)</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Ej. 1234"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Este PIN lo usará el empleado para entrar desde la pantalla de login.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Correo (Opcional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="juan@bar.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 cursor-pointer"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
