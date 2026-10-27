'use client'

import { useState } from 'react'
import {
  UtensilsCrossed,
  Plus,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  User,
  Edit2,
  Trash2,
  Search,
  X,
  Split,
} from 'lucide-react'
import Link from 'next/link'
import {
  useBarStore,
  loadBarData,
  saveBarData,
  resetBarData,
  setActiveTableId,
  addTable,
  updateTable,
  deleteTable,
  openTableWithCustomer,
  TableState,
} from '@/lib/barState'

export default function MesasPage() {
  const barData = useBarStore()
  const tables = barData.tables || []
  const [selectedTableId, setSelectedTableId] = useState<number>(barData.activeTableId || 1)
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'available' | 'reserved'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modales
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [showOpenModal, setShowOpenModal] = useState<boolean>(false)

  // Formulario Crear Mesa / Cuenta
  const [newTableName, setNewTableName] = useState<string>('')
  const [newCustomerName, setNewCustomerName] = useState<string>('')
  const [newCapacity, setNewCapacity] = useState<number>(4)
  const [newNotes, setNewNotes] = useState<string>('')
  const [newAutoOpen, setNewAutoOpen] = useState<boolean>(true)

  // Formulario Editar Mesa / Cuenta
  const [editingTableId, setEditingTableId] = useState<number | null>(null)
  const [editTableName, setEditTableName] = useState<string>('')
  const [editCustomerName, setEditCustomerName] = useState<string>('')
  const [editCapacity, setEditCapacity] = useState<number>(4)
  const [editNotes, setEditNotes] = useState<string>('')

  // Formulario Apertura Rápida de Mesa
  const [openingTableId, setOpeningTableId] = useState<number | null>(null)
  const [openingCustomerName, setOpeningCustomerName] = useState<string>('')
  const [openingNotes, setOpeningNotes] = useState<string>('')

  const formatCOP = (val: number) => '$ ' + val.toLocaleString('es-CO')

  // Crear nueva mesa o cuenta de cliente
  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTableName.trim() && !newCustomerName.trim()) return

    const tableName = newTableName.trim() || (newCustomerName.trim() ? `Cuenta: ${newCustomerName.trim()}` : `Mesa ${tables.length + 1}`)

    const created = addTable({
      name: tableName,
      customerName: newCustomerName.trim() || undefined,
      capacity: newCapacity,
      notes: newNotes.trim() || undefined,
      autoOpen: newAutoOpen,
    })

    setShowAddModal(false)
    setNewTableName('')
    setNewCustomerName('')
    setNewCapacity(4)
    setNewNotes('')
    setNewAutoOpen(true)
    setSelectedTableId(created.id)

    setSuccessMsg(`¡${created.name} ${newCustomerName ? `(${newCustomerName})` : ''} creada con éxito!`)
    setTimeout(() => setSuccessMsg(''), 4500)
  }

  // Abrir modal de edición
  const handleOpenEdit = (t: TableState) => {
    setEditingTableId(t.id)
    setEditTableName(t.name)
    setEditCustomerName(t.customerName || '')
    setEditCapacity(t.capacity || 4)
    setEditNotes(t.notes || '')
    setShowEditModal(true)
  }

  // Guardar cambios de edición
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTableId) return

    updateTable(editingTableId, {
      name: editTableName.trim() || `Mesa ${editingTableId}`,
      customerName: editCustomerName.trim() || undefined,
      capacity: editCapacity,
      notes: editNotes.trim() || undefined,
    })

    setShowEditModal(false)
    setSuccessMsg('¡Datos de la mesa y cliente actualizados correctamente!')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Abrir mesa (con diálogo para nombre de cliente)
  const handlePromptOpenTable = (t: TableState) => {
    setOpeningTableId(t.id)
    setOpeningCustomerName(t.customerName || '')
    setOpeningNotes(t.notes || '')
    setShowOpenModal(true)
  }

  // Confirmar apertura de mesa
  const handleConfirmOpenTable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!openingTableId) return

    openTableWithCustomer(openingTableId, openingCustomerName.trim() || undefined, openingNotes.trim() || undefined)
    setShowOpenModal(false)
    setSelectedTableId(openingTableId)
    setSuccessMsg(`¡Mesa abierta exitosamente para ${openingCustomerName.trim() || 'el cliente'}!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Dividir cuenta / crear subcuenta en la misma mesa
  const handleSplitTable = (parentTable: TableState) => {
    const subName = prompt(
      `Nombre del cliente o subtítulo para la cuenta separada en ${parentTable.name}:`,
      `Cuenta 2 (${parentTable.name})`
    )
    if (!subName || !subName.trim()) return

    const created = addTable({
      name: `${parentTable.name} - B`,
      customerName: subName.trim(),
      capacity: 2,
      notes: `Cuenta separada de ${parentTable.name}`,
      autoOpen: true,
    })

    setSelectedTableId(created.id)
    setSuccessMsg(`¡Cuenta separada "${created.name} (${subName.trim()})" creada y lista para tomar pedidos!`)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  // Eliminar mesa
  const handleDeleteTable = (t: TableState) => {
    if (t.total > 0 || (t.items && t.items.length > 0)) {
      alert(`No puedes eliminar ${t.name} porque tiene consumos registrados (${formatCOP(t.total)}). Primero debes cerrar la comanda o cobrarla en /cobro.`)
      return
    }

    if (confirm(`¿Estás seguro de que deseas eliminar "${t.name}" del salón?`)) {
      deleteTable(t.id)
      setSuccessMsg(`"${t.name}" eliminada del sistema.`)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  // Cambiar estado a reservada o disponible
  const handleChangeStatus = (id: number, status: 'available' | 'occupied' | 'reserved') => {
    const data = loadBarData()
    const updated = data.tables.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status,
          openedAt: status === 'occupied' ? t.openedAt || 'Ahora' : undefined,
          items: status === 'available' ? [] : t.items,
          payments: status === 'available' ? [] : t.payments,
          total: status === 'available' ? 0 : t.total,
          paid: status === 'available' ? 0 : t.paid,
          pending: status === 'available' ? 0 : t.pending,
        }
      }
      return t
    })

    data.tables = updated
    saveBarData(data)
    setSelectedTableId(id)
    setSuccessMsg(`Estado actualizado a "${status === 'available' ? 'Disponible' : status === 'reserved' ? 'Reservada' : 'Ocupada'}".`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleResetData = () => {
    if (confirm('¿Deseas reiniciar las mesas de prueba al estado inicial?')) {
      resetBarData()
      setSuccessMsg('Mesas y datos restablecidos por defecto.')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  // Filtrado de mesas
  const filteredTables = tables.filter((t: TableState) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus
    const query = searchQuery.toLowerCase()
    const matchesQuery =
      t.name.toLowerCase().includes(query) ||
      (t.customerName && t.customerName.toLowerCase().includes(query)) ||
      (t.notes && t.notes.toLowerCase().includes(query))
    return matchesStatus && matchesQuery
  })

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length
  const availableCount = tables.filter((t) => t.status === 'available').length
  const reservedCount = tables.filter((t) => t.status === 'reserved').length
  const totalUncollected = tables.reduce((acc, t) => acc + (t.pending || 0), 0)

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Salón, Barra & Cuentas de Clientes • Operador Único</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Control de Mesas & Clientes
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Crea mesas ilimitadas, asígnales el nombre del cliente y maneja cuentas separadas con total facilidad.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all text-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Mesa / Cuenta</span>
          </button>

          <Link
            href="/ventas"
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            <span>Punto de Venta</span>
          </Link>

          <button
            onClick={handleResetData}
            title="Restablecer datos de prueba"
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notificación de Éxito */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Resumen de Estado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rock-card p-4 rounded-xl border-l-4 border-l-emerald-500">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase">Disponibles</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{availableCount}</p>
          <span className="text-[10px] text-zinc-500">Listas para abrir</span>
        </div>
        <div className="rock-card p-4 rounded-xl border-l-4 border-l-red-600">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase">Ocupadas</p>
          <p className="text-xl sm:text-2xl font-black text-red-500 mt-1">{occupiedCount}</p>
          <span className="text-[10px] text-zinc-500">Con clientes activos</span>
        </div>
        <div className="rock-card p-4 rounded-xl border-l-4 border-l-amber-500">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase">Reservadas</p>
          <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">{reservedCount}</p>
          <span className="text-[10px] text-zinc-500">Mantenidas</span>
        </div>
        <div className="rock-card p-4 rounded-xl border-l-4 border-l-blue-500">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase">Por Cobrar en Salón</p>
          <p className="text-xl sm:text-2xl font-black text-blue-400 mt-1">{formatCOP(totalUncollected)}</p>
          <span className="text-[10px] text-zinc-500">Consumo activo</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          {(
            [
              { id: 'all', label: `Todas (${tables.length})` },
              { id: 'occupied', label: `Ocupadas (${occupiedCount})` },
              { id: 'available', label: `Disponibles (${availableCount})` },
              { id: 'reserved', label: `Reservadas (${reservedCount})` },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilterStatus(st.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === st.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por mesa o nombre de cliente..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Grid de Mesas */}
      {filteredTables.length === 0 ? (
        <div className="rock-card p-12 rounded-3xl text-center space-y-3">
          <p className="text-sm font-bold text-zinc-400">No se encontraron mesas o cuentas con esos filtros.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nueva Mesa</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((t: TableState) => {
            const isOccupied = t.status === 'occupied'
            const isReserved = t.status === 'reserved'
            const isSelected = selectedTableId === t.id

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTableId(t.id)}
                className={`rock-card p-5 rounded-2xl transition-all border-2 flex flex-col justify-between cursor-pointer relative group ${
                  isSelected ? 'ring-2 ring-red-500 shadow-xl shadow-red-900/20' : ''
                } ${
                  isOccupied
                    ? 'border-red-600/70 bg-zinc-900/90'
                    : isReserved
                    ? 'border-amber-500/70 bg-zinc-900/90'
                    : 'border-emerald-500/40 bg-zinc-900/50 hover:border-emerald-500'
                }`}
              >
                <div>
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-white text-lg tracking-tight">{t.name}</span>
                        <span className="text-[11px] text-zinc-500 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {t.capacity}p
                        </span>
                      </div>

                      {/* Nombre del Cliente destacado */}
                      {t.customerName ? (
                        <div className="flex items-center space-x-1.5 mt-0.5 text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 w-fit">
                          <User className="w-3 h-3 shrink-0" />
                          <span>{t.customerName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic block mt-0.5">Sin cliente asignado</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isOccupied
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isReserved
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isOccupied ? 'Ocupada' : isReserved ? 'Reservada' : 'Disponible'}
                      </span>

                      {/* Botón Editar Mesa */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEdit(t)
                        }}
                        title="Editar nombre de mesa, cliente o capacidad"
                        className="p-1 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Botón Eliminar si no tiene consumos */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTable(t)
                        }}
                        title="Eliminar mesa del salón"
                        className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notas de la mesa si existen */}
                  {t.notes && (
                    <p className="text-[11px] text-zinc-400 italic mb-2 line-clamp-1 bg-zinc-950/40 px-2 py-1 rounded-md border border-zinc-800/40">
                      📝 {t.notes}
                    </p>
                  )}

                  {/* Detalle Financiero del Consumo */}
                  <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60 my-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Consumo actual:</span>
                      <span className="font-black text-white text-sm">{formatCOP(t.total)}</span>
                    </div>
                    {isOccupied && (
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                        <span>{t.items.length} productos</span>
                        <span className="flex items-center text-amber-400 font-mono">
                          <Clock className="w-3 h-3 mr-1" />
                          {t.openedAt || 'Activa'}
                        </span>
                      </div>
                    )}
                    {isOccupied && t.paid > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-400 mt-1 border-t border-zinc-900 pt-1">
                        <span>Abonado: {formatCOP(t.paid)}</span>
                        <span>Saldo: {formatCOP(t.pending)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de Acción Interactivos */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                  {isOccupied ? (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/ventas"
                          onClick={() => setActiveTableId(t.id)}
                          className="flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                        >
                          <span>+ Pedido</span>
                        </Link>
                        <Link
                          href="/cobro"
                          className="flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/30 transition-colors"
                        >
                          <span>Cobrar</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Botón Separar Cuenta en la misma mesa */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSplitTable(t)
                        }}
                        title="Crear otra cuenta para un segundo cliente en la misma mesa"
                        className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
                      >
                        <Split className="w-3 h-3" />
                        <span>Separar / Nueva Cuenta Aquí</span>
                      </button>
                    </div>
                  ) : isReserved ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePromptOpenTable(t)
                        }}
                        className="w-full py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
                      >
                        Ocupar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleChangeStatus(t.id, 'available')
                        }}
                        className="w-full py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                      >
                        Liberar
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePromptOpenTable(t)
                        }}
                        className="w-full flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/20 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Abrir Mesa</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleChangeStatus(t.id, 'reserved')
                        }}
                        className="w-full py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-amber-400 bg-zinc-800/80 hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        Reservar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR NUEVA MESA O CUENTA */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-500">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Crear Nueva Mesa / Cuenta</h3>
                  <p className="text-xs text-zinc-400">Personaliza con nombre de mesa o cliente</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nombre de la Mesa o Lugar *
                </label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Ej. Mesa 10, Barra 2, Terraza A, VIP..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nombre del Cliente / Titular de la Cuenta (Opcional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Ej. Juan Pérez, Camilo, Pareja Rock..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">
                  Permite separar cuentas individuales para varias personas en el mismo lugar
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Capacidad (Personas)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                    <input
                      type="checkbox"
                      checked={newAutoOpen}
                      onChange={(e) => setNewAutoOpen(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span className="font-bold">Abrir de una vez</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ej. Cuenta separada con amigos, cumpleañero..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                >
                  Crear Mesa / Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR MESA / CLIENTE */}
      {/* ========================================================================= */}
      {showEditModal && editingTableId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-md p-6 rounded-3xl border border-zinc-700 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Editar Mesa / Cliente</h3>
                  <p className="text-xs text-zinc-400">Modifica nombre del lugar o cliente titular</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nombre de la Mesa</label>
                <input
                  type="text"
                  required
                  value={editTableName}
                  onChange={(e) => setEditTableName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nombre del Cliente / Titular de Cuenta
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    placeholder="Ej. Carlos Giraldo, Cuenta Sofía..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Capacidad</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Notas</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Detalles..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ABRIR MESA CON NOMBRE DE CLIENTE */}
      {/* ========================================================================= */}
      {showOpenModal && openingTableId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rock-card w-full max-w-sm p-6 rounded-3xl border border-emerald-500/40 shadow-2xl relative space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Abrir Mesa</h3>
                  <p className="text-xs text-zinc-400">Asigna el cliente para iniciar comanda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOpenTable} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nombre del Cliente (Opcional)
                </label>
                <input
                  type="text"
                  autoFocus
                  value={openingCustomerName}
                  onChange={(e) => setOpeningCustomerName(e.target.value)}
                  placeholder="Ej. Juan, Camila, Grupo Rock..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Notas Rápidas</label>
                <input
                  type="text"
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  placeholder="Ej. Esperando acompañante..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  Confirmar y Abrir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
