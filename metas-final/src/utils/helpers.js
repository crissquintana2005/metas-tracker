export function getProgressColor(pct) {
  if (pct >= 80) return 'progress-high'
  if (pct >= 40) return 'progress-mid'
  if (pct > 0) return 'progress-low'
  return 'bg-slate-300 dark:bg-slate-600'
}

export function getProgressBg(pct) {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 40) return 'bg-amber-500'
  if (pct > 0) return 'bg-rose-500'
  return 'bg-slate-300 dark:bg-slate-600'
}

export function getEstadoBadge(estado) {
  const map = {
    pendiente: { label: 'Pendiente', class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
    en_progreso: { label: 'En progreso', class: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
    avanzado: { label: 'Avanzado', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
    completado: { label: 'Completado', class: 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300' },
    atrasado: { label: 'Atrasado', class: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' },
  }
  return map[estado] || map.pendiente
}

export function getPrioridadBadge(prioridad) {
  const map = {
    baja: { label: 'Baja', class: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
    media: { label: 'Media', class: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
    alta: { label: 'Alta', class: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  }
  return map[prioridad] || map.media
}

export function calcularProgresoMeta(meta) {
  if (!meta.hitos || meta.hitos.length === 0) return 0
  // Promedio simple: suma de progresos de hitos / cantidad de hitos
  const avg = meta.hitos.reduce((sum, h) => sum + (h.progreso || 0), 0) / meta.hitos.length
  return Math.min(100, Math.round(avg))
}

export function calcularProgresoDireccion(metas, direccion) {
  const deDir = metas.filter(m => (m.direccion || 'Sin asignar') === direccion)
  if (deDir.length === 0) return 0
  const avg = deDir.reduce((sum, m) => sum + (m.porcentaje_meta || 0), 0) / deDir.length
  return Math.round(avg)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
    return d.toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleString('es-PY', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return isoStr
  }
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return diff
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

