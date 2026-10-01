import { useState, useMemo } from 'react'
import { Filter, SortAsc } from 'lucide-react'
import MetaCard from './MetaCard'
import clsx from 'clsx'

export default function MetasList({ metas, onSelectMeta, search }) {
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterDir, setFilterDir] = useState('todas')
  const [sortBy, setSortBy] = useState('progreso')

  const direcciones = useMemo(() => {
    const dirs = [...new Set(metas.map(m => m.direccion || 'Sin asignar'))]
    return dirs.sort()
  }, [metas])

  const filtered = useMemo(() => {
    let list = [...metas]
    
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(m => 
        m.nombre.toLowerCase().includes(q) ||
        m.indicador?.toLowerCase().includes(q) ||
        m.direccion?.toLowerCase().includes(q)
      )
    }
    
    if (filterEstado !== 'todos') {
      list = list.filter(m => m.estado === filterEstado)
    }
    
    if (filterDir !== 'todas') {
      list = list.filter(m => (m.direccion || 'Sin asignar') === filterDir)
    }
    
    list.sort((a, b) => {
      if (sortBy === 'progreso') return (b.porcentaje_meta || 0) - (a.porcentaje_meta || 0)
      if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre)
      if (sortBy === 'hitos') return (b.hitos?.length || 0) - (a.hitos?.length || 0)
      return 0
    })
    
    return list
  }, [metas, search, filterEstado, filterDir, sortBy])

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filtros:</span>
        </div>
        
        <select 
          className="input w-auto py-1.5 text-xs"
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="avanzado">Avanzado</option>
          <option value="completado">Completado</option>
          <option value="atrasado">Atrasado</option>
        </select>
        
        <select 
          className="input w-auto py-1.5 text-xs"
          value={filterDir}
          onChange={e => setFilterDir(e.target.value)}
        >
          <option value="todas">Todas las direcciones</option>
          {direcciones.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        
        <div className="flex items-center gap-2 ml-auto">
          <SortAsc className="w-4 h-4 text-slate-400" />
          <select 
            className="input w-auto py-1.5 text-xs"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="progreso">Por progreso</option>
            <option value="nombre">Por nombre</option>
            <option value="hitos">Por cantidad de hitos</option>
          </select>
        </div>
        
        <span className="text-xs text-slate-400">
          {filtered.length} de {metas.length}
        </span>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(meta => (
          <MetaCard key={meta.id} meta={meta} onClick={() => onSelectMeta(meta)} />
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">Sin resultados</p>
          <p className="text-sm mt-1">Prueba cambiando los filtros o la búsqueda</p>
        </div>
      )}
    </div>
  )
}
