"use client"

import { useState } from 'react'
import Link from 'next/link'
import { PRESET_USERS, useAuthStore, loginWithPreset } from '@/lib/authStore'
import {
  ShieldAlert,
  UserCheck,
  Check,
  Lock,
  Users,
  Eye,
  KeyRound
} from 'lucide-react'

export default function UsuariosPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'roles' | 'permisos'>('roles')

  const permissionsMatrix = [
    { module: 'Panel Principal y Métricas Generales', staff: true, admin: true, owner: true },
    { module: 'Mapa de Mesas y Asignación de Clientes', staff: true, admin: true, owner: true },
    { module: 'Venta Directa / Comandas en Barra', staff: true, admin: true, owner: true },
    { module: 'Cobro de Cuentas y Pre-Tickets', staff: false, admin: true, owner: true },
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
              <span>Seguridad y Control de Acceso</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Usuarios y Roles del Sistema
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base mt-1">
              Controla los niveles de acceso del personal para proteger la información financiera y operativa del bar.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Pantalla de Login</span>
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
          <span>Perfiles y Cuentas Activas</span>
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

      {activeTab === 'roles' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRESET_USERS.map((preset) => {
              const isActive = user?.role === preset.role

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
              }[preset.role]

              return (
                <div
                  key={preset.id}
                  className={`rock-card rounded-2xl p-6 border transition-all relative overflow-hidden ${
                    isActive ? `${theme.border} ring-2 ring-red-500/40` : 'border-zinc-800'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      <span>SESIÓN ACTIVA</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl">
                      {theme.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{preset.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                        {preset.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mb-4">{preset.roleTitle}</p>

                  <div className="space-y-2 mb-6 text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                    <p className="flex justify-between">
                      <span className="text-zinc-500">Email:</span>
                      <strong className="text-zinc-200">{preset.email}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-zinc-500">PIN de acceso:</span>
                      <strong className="text-amber-400 font-mono tracking-wider">{preset.pin}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => loginWithPreset(preset.role)}
                    disabled={isActive}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center space-x-2 ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : `${theme.button} shadow-lg cursor-pointer`
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isActive ? 'Sesión Actual' : `Cambiar a ${preset.role.toUpperCase()}`}</span>
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
    </div>
  )
}
