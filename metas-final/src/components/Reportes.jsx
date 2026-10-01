import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Cell
} from 'recharts'
import { FileText, Download } from 'lucide-react'
import { getProgressBg } from '../utils/helpers'

export default function Reportes({ metas, stats }) {
  // Detailed table data
  const tableData = metas.map(m => ({
    ...m,
    hitosCompletos: m.hitos?.filter(h => h.progreso >= 100).length || 0,
    hitosTotal: m.hitos?.length || 0
  })).sort((a, b) => (b.porcentaje_meta || 0) - (a.porcentaje_meta || 0))

  // Radar by dirección
  const dirMap = {}
  metas.forEach(m => {
    const d = m.direccion || 'Sin asignar'
    if (!dirMap[d]) dirMap[d] = { name: d.length > 15 ? d.slice(0, 13) + '…' : d, sum: 0, count: 0 }
    dirMap[d].sum += m.porcentaje_meta || 0
    dirMap[d].count++
  })
  const radarData = Object.values(dirMap).map(d => ({
    direccion: d.name,
    progreso: Math.round(d.sum / d.count)
  }))

  const handleExport = () => {
    const headers = ['Meta', 'Indicador', 'Dirección', 'Progreso %', 'Estado', 'Hitos', 'Prioridad']
    const rows = tableData.map(m => [
      `"${m.nombre.replace(/"/g, '""')}"`,
      `"${(m.indicador || '').replace(/"/g, '""')}"`,
      m.direccion,
      Math.round(m.porcentaje_meta || 0),
      m.estado,
      `${m.hitosCompletos}/${m.hitosTotal}`,
      m.prioridad
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `metas-reporte-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" />
            Reporte de Seguimiento
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} metas · Promedio general {stats.promedio}% · {stats.hitosCompletados}/{stats.totalHitos} hitos
          </p>
        </div>
        <button onClick={handleExport} className="btn-primary">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Ranking de Progreso</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tableData.slice(0, 10)} layout="vertical" margin={{ left: 5, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis 
                  type="category" 
                  dataKey="nombre" 
                  width={160} 
                  tick={{ fontSize: 9 }}
                  tickFormatter={v => v.length > 35 ? v.slice(0, 33) + '…' : v}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12, fontSize: 12, color: '#fff' }}
                  formatter={(v) => [`${v}%`, 'Progreso']}
                />
                <Bar dataKey="porcentaje_meta" radius={[0, 6, 6, 0]} barSize={14}>
                  {tableData.slice(0, 10).map((entry, i) => (
                    <Cell key={i} fill={entry.porcentaje_meta >= 80 ? '#22c55e' : entry.porcentaje_meta >= 40 ? '#f59e0b' : '#0c8ce6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {radarData.length >= 3 && (
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Progreso por Dirección</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="direccion" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Progreso" dataKey="progreso" stroke="#0c8ce6" fill="#0c8ce6" fillOpacity={0.25} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12, fontSize: 12, color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Detailed table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Detalle de Metas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Meta</th>
                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Dirección</th>
                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Progreso</th>
                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Hitos</th>
                <th className="px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tableData.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 text-sm leading-snug">{m.nombre}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{m.direccion}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="progress-bar flex-1">
                        <div className={`progress-fill ${getProgressBg(m.porcentaje_meta || 0)}`} style={{ width: `${m.porcentaje_meta || 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-8">{Math.round(m.porcentaje_meta || 0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                    {m.hitosCompletos}/{m.hitosTotal}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge text-[10px] ${
                      m.estado === 'completado' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                      m.estado === 'avanzado' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                      m.estado === 'en_progreso' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {m.estado?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
