import { useState, useMemo } from 'react'
import { 
  Target, CheckCircle2, Clock, TrendingUp, 
  BarChart3, Layers, Filter
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import StatCard from './StatCard'
import MetaCard from './MetaCard'
import { getProgressBg } from '../utils/helpers'

const PIE_COLORS = {
  'Completadas': '#22c55e',
  'Avanzado': '#0c8ce6',
  'En progreso': '#f59e0b',
  'Pendientes': '#94a3b8',
  'Atrasado': '#f43f5e'
}

const BAR_PALETTE = ['#0c8ce6', '#22c55e', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#14b8a6', '#f97316']

export default function Dashboard({ metas, stats, onSelectMeta, search }) {
  const [filterDir, setFilterDir] = useState('todas')

  const direcciones = useMemo(() => {
    return [...new Set(metas.map(m => m.direccion || 'Sin asignar'))].sort()
  }, [metas])

  const filteredByDir = useMemo(() => {
    let list = filterDir === 'todas' 
      ? metas 
      : metas.filter(m => (m.direccion || 'Sin asignar') === filterDir)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        m.nombre.toLowerCase().includes(q) ||
        m.indicador?.toLowerCase().includes(q) ||
        m.direccion?.toLowerCase().includes(q)
      )
    }
    return list
  }, [metas, filterDir, search])

  const fStats = useMemo(() => {
    const list = filteredByDir
    return {
      total: list.length,
      completadas: list.filter(m => (m.porcentaje_meta || 0) >= 100).length,
      enProgreso: list.filter(m => (m.porcentaje_meta || 0) > 0 && (m.porcentaje_meta || 0) < 100).length,
      pendientes: list.filter(m => (m.porcentaje_meta || 0) === 0).length,
      promedio: list.length ? Math.round(list.reduce((s, m) => s + (m.porcentaje_meta || 0), 0) / list.length) : 0,
      totalHitos: list.reduce((s, m) => s + (m.hitos?.length || 0), 0),
      hitosCompletados: list.reduce((s, m) => s + (m.hitos?.filter(h => (h.progreso || 0) >= 100).length || 0), 0),
    }
  }, [filteredByDir])

  const barData = useMemo(() => {
    return [...filteredByDir]
      .sort((a, b) => (b.porcentaje_meta || 0) - (a.porcentaje_meta || 0))
      .slice(0, 12)
      .map((m, i) => ({
        id: m.id,
        name: m.nombre.length > 32 ? m.nombre.slice(0, 30) + '…' : m.nombre,
        fullName: m.nombre,
        progreso: Math.round(m.porcentaje_meta || 0),
        color: BAR_PALETTE[i % BAR_PALETTE.length],
        hitos: m.hitos?.length || 0
      }))
  }, [filteredByDir])

  const statusData = useMemo(() => {
    const map = {
      'Completadas': fStats.completadas,
      'En progreso': fStats.enProgreso,
      'Pendientes': fStats.pendientes,
    }
    const avanzado = filteredByDir.filter(m => m.estado === 'avanzado').length
    const atrasado = filteredByDir.filter(m => m.estado === 'atrasado').length
    if (avanzado) map['Avanzado'] = avanzado
    if (atrasado) map['Atrasado'] = atrasado
    if (avanzado) {
      map['En progreso'] = Math.max(0, (map['En progreso'] || 0) - avanzado)
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: PIE_COLORS[name] || '#94a3b8' }))
  }, [fStats, filteredByDir])

  const dirData = useMemo(() => {
    const dirMap = {}
    const source = filterDir === 'todas' ? metas : filteredByDir
    source.forEach(m => {
      const d = m.direccion || 'Sin asignar'
      if (!dirMap[d]) dirMap[d] = { total: 0, sum: 0 }
      dirMap[d].total++
      dirMap[d].sum += m.porcentaje_meta || 0
    })
    return Object.entries(dirMap).map(([name, v]) => ({
      name: name.length > 22 ? name.slice(0, 20) + '…' : name,
      fullName: name,
      promedio: Math.round(v.sum / v.total),
      cantidad: v.total
    })).sort((a, b) => b.promedio - a.promedio)
  }, [metas, filteredByDir, filterDir])

  const handleBarClick = (data) => {
    if (data?.id) {
      const meta = metas.find(m => m.id === data.id)
      if (meta) onSelectMeta(meta)
    }
  }

  const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null
    const d = payload[0].payload
    return (
      <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg max-w-xs">
        <p className="font-semibold mb-1">{d.fullName}</p>
        <p>Progreso: <span className="font-bold">{d.progreso}%</span></p>
        <p>{d.hitos} hito{d.hitos !== 1 ? 's' : ''}</p>
        <p className="text-slate-400 mt-1">Clic para ver detalle →</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filtrar gráficos por dirección:</span>
        </div>
        <select
          className="input w-auto py-1.5 text-xs min-w-[180px]"
          value={filterDir}
          onChange={e => setFilterDir(e.target.value)}
        >
          <option value="todas">Todas las direcciones</option>
          {direcciones.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {filterDir !== 'todas' && (
          <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
            Mostrando {filteredByDir.length} meta{filteredByDir.length !== 1 ? 's' : ''} de {filterDir}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Metas" value={fStats.total} subtitle={`${fStats.totalHitos} hitos`} icon={Target} color="brand" />
        <StatCard title="Progreso Promedio" value={`${fStats.promedio}%`} subtitle={filterDir === 'todas' ? 'Todas las metas' : filterDir} icon={TrendingUp} color="emerald" />
        <StatCard title="En Progreso" value={fStats.enProgreso} subtitle={`${fStats.completadas} completadas`} icon={Clock} color="amber" />
        <StatCard title="Hitos Completados" value={fStats.hitosCompletados} subtitle={`de ${fStats.totalHitos} totales`} icon={CheckCircle2} color="violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            Progreso por Meta
          </h3>
          <p className="text-xs text-slate-400 mb-4">Hacé clic en una barra para ver los hitos de esa meta</p>
          <div className="h-80">
            {barData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sin datos para mostrar</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(12,140,230,0.06)' }} />
                  <Bar 
                    dataKey="progreso" 
                    radius={[0, 8, 8, 0]} 
                    barSize={18}
                    cursor="pointer"
                    onClick={(_, index) => handleBarClick(barData[index])}
                  >
                    {barData.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={entry.progreso >= 80 ? '#22c55e' : entry.progreso >= 40 ? '#f59e0b' : entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" />
            Distribución por estado
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {filterDir === 'todas' ? 'Todas las direcciones' : filterDir}
          </p>
          <div className="h-64">
            {statusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.92)', 
                      border: 'none', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={40}
                    formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {dirData.length >= 1 && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Progreso por Dirección</h3>
          <p className="text-xs text-slate-400 mb-4">Promedio de % de las metas · clic para filtrar</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dirData.map((d, i) => (
              <button
                key={i}
                onClick={() => setFilterDir(d.fullName)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  filterDir === d.fullName 
                    ? 'bg-brand-50 dark:bg-brand-950/40 ring-1 ring-brand-300 dark:ring-brand-700' 
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{d.name}</p>
                  <p className="text-xs text-slate-400">{d.cantidad} meta{d.cantidad !== 1 ? 's' : ''} · promedio</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{d.promedio}%</p>
                </div>
                <div className="w-16">
                  <div className="progress-bar">
                    <div className={`progress-fill ${getProgressBg(d.promedio)}`} style={{ width: `${d.promedio}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filterDir !== 'todas' && (
            <button 
              onClick={() => setFilterDir('todas')} 
              className="mt-3 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              ← Ver todas las direcciones
            </button>
          )}
        </div>
      )}

      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          {search || filterDir !== 'todas' 
            ? `Resultados (${filteredByDir.length})` 
            : 'Todas las Metas'}
        </h3>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredByDir.map(meta => (
            <MetaCard key={meta.id} meta={meta} onClick={() => onSelectMeta(meta)} />
          ))}
        </div>
        {filteredByDir.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No se encontraron metas con ese criterio.
          </div>
        )}
      </div>
    </div>
  )
}
