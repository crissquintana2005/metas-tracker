import { useState, useRef } from 'react'
import { 
  X, Calendar, Building2, Plus, Trash2, CheckCircle2, 
  Circle, Edit3, Save, Target, FileText, MessageSquare,
  Paperclip, Download, Upload, Eye
} from 'lucide-react'
import ProgressRing from './ProgressRing'
import { 
  getEstadoBadge, getPrioridadBadge, formatDate, formatDateTime, 
  formatFileSize, daysUntil, getProgressBg 
} from '../utils/helpers'
import clsx from 'clsx'

export default function MetaDetail({ 
  meta, onClose, onUpdateMeta, onUpdateHito, onAddHito, onDeleteHito, onDeleteMeta,
  onAddComentario, onDeleteComentario, onAddDocumento, onDeleteDocumento
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    nombre: meta.nombre,
    indicador: meta.indicador,
    direccion: meta.direccion,
    prioridad: meta.prioridad,
    notas: meta.notas || '',
    estado: meta.estado
  })
  const [newHito, setNewHito] = useState({ nombre: '', fecha: '2026-12-31', peso: 10 })
  const [showAddHito, setShowAddHito] = useState(false)
  const [comentarioTexto, setComentarioTexto] = useState('')
  const [tab, setTab] = useState('hitos') // hitos | comentarios | documentos
  const fileRef = useRef(null)

  const estado = getEstadoBadge(meta.estado)
  const prioridad = getPrioridadBadge(meta.prioridad)

  const handleSave = () => {
    onUpdateMeta(meta.id, form)
    setEditing(false)
  }

  const handleAddHito = () => {
    if (!newHito.nombre.trim()) return
    onAddHito(meta.id, newHito)
    setNewHito({ nombre: '', fecha: '2026-12-31', peso: 10 })
    setShowAddHito(false)
  }

  const handleProgresoChange = (hitoId, value) => {
    const progreso = Math.min(100, Math.max(0, Number(value)))
    onUpdateHito(meta.id, hitoId, { 
      progreso, 
      completado: progreso >= 100 
    })
  }

  const handleAddComentario = () => {
    if (!comentarioTexto.trim()) return
    onAddComentario(meta.id, comentarioTexto)
    setComentarioTexto('')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Límite ~1.5MB en base64 para no saturar localStorage
    if (file.size > 1.5 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo recomendado: 1.5 MB.\nPodés registrar el nombre sin subir el contenido.')
      onAddDocumento(meta.id, {
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size,
        dataUrl: null
      })
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onAddDocumento(meta.id, {
        nombre: file.name,
        tipo: file.type,
        tamaño: file.size,
        dataUrl: reader.result
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const downloadDoc = (doc) => {
    if (!doc.dataUrl) {
      alert('Este documento solo tiene el registro del nombre (no se guardó el archivo).')
      return
    }
    const a = document.createElement('a')
    a.href = doc.dataUrl
    a.download = doc.nombre
    a.click()
  }

  const previewDoc = (doc) => {
    if (!doc.dataUrl) {
      alert('Este documento solo tiene el registro del nombre (no se guardó el archivo).')
      return
    }
    // Abrir en nueva pestaña para visualizar (PDF, imágenes, etc.)
    const w = window.open()
    if (!w) {
      alert('El navegador bloqueó la ventana emergente. Permití pop-ups para este sitio.')
      return
    }
    const isImage = (doc.tipo || '').startsWith('image/')
    const isPdf = (doc.tipo || '') === 'application/pdf' || doc.nombre?.toLowerCase().endsWith('.pdf')
    if (isImage) {
      w.document.write(`<!DOCTYPE html><html><head><title>${doc.nombre}</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#0f172a}img{max-width:100%;max-height:100vh;object-fit:contain}</style></head><body><img src="${doc.dataUrl}" alt="${doc.nombre}"/></body></html>`)
    } else if (isPdf) {
      w.document.write(`<!DOCTYPE html><html><head><title>${doc.nombre}</title><style>body{margin:0}iframe{border:0;width:100%;height:100vh}</style></head><body><iframe src="${doc.dataUrl}"></iframe></body></html>`)
    } else {
      // Otros tipos: intentar abrir el dataUrl directo o mostrar info + descarga
      w.document.write(`<!DOCTYPE html><html><head><title>${doc.nombre}</title>
        <style>body{font-family:system-ui;padding:40px;background:#f8fafc;color:#0f172a}
        .card{background:#fff;border-radius:16px;padding:32px;max-width:480px;margin:40px auto;box-shadow:0 4px 20px rgba(0,0,0,.08);text-align:center}
        a{display:inline-block;margin-top:16px;padding:10px 20px;background:#0c8ce6;color:#fff;border-radius:10px;text-decoration:none;font-weight:500}
        </style></head><body><div class="card">
        <h2>${doc.nombre}</h2>
        <p style="color:#64748b">Tipo: ${doc.tipo || 'desconocido'}</p>
        <p style="color:#64748b">Este tipo de archivo no se puede previsualizar en el navegador.</p>
        <a href="${doc.dataUrl}" download="${doc.nombre}">Descargar archivo</a>
        </div></body></html>`)
    }
    w.document.close()
  }

  const tabs = [
    { id: 'hitos', label: 'Hitos', count: meta.hitos?.length || 0, icon: Target },
    { id: 'comentarios', label: 'Comentarios', count: meta.comentarios?.length || 0, icon: MessageSquare },
    { id: 'documentos', label: 'Documentos', count: meta.documentos?.length || 0, icon: Paperclip },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ProgressRing progress={meta.porcentaje_meta || 0} size={48} stroke={4} />
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Detalle de Meta</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {Math.round(meta.porcentaje_meta || 0)}% completado
                  <span className="text-slate-400 font-normal ml-1">
                    (promedio de {meta.hitos?.length || 0} hito{(meta.hitos?.length||0)!==1?'s':''})
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <button onClick={handleSave} className="btn-primary">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary">
                  <Edit3 className="w-4 h-4" /> Editar
                </button>
              )}
              <button onClick={onClose} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Nombre de la meta</label>
                  <textarea className="input min-h-[80px]" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Indicador</label>
                  <textarea className="input min-h-[60px]" value={form.indicador} onChange={e => setForm({...form, indicador: e.target.value})} />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{meta.nombre}</h2>
                {meta.indicador && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{meta.indicador}</p>
                )}
              </>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">Estado</p>
              {editing ? (
                <select className="input" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="avanzado">Avanzado</option>
                  <option value="completado">Completado</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              ) : (
                <span className={clsx('badge', estado.class)}>{estado.label}</span>
              )}
            </div>
            <div className="card p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">Prioridad</p>
              {editing ? (
                <select className="input" value={form.prioridad} onChange={e => setForm({...form, prioridad: e.target.value})}>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              ) : (
                <span className={clsx('badge', prioridad.class)}>{prioridad.label}</span>
              )}
            </div>
            <div className="card p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">Dirección</p>
              {editing ? (
                <input className="input" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {meta.direccion || 'Sin asignar'}
                </div>
              )}
            </div>
            <div className="card p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">Hitos</p>
              <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                <Target className="w-3.5 h-3.5 text-slate-400" />
                {meta.hitos?.length || 0} definidos
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
            {tabs.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                    tab === t.id
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">{t.count}</span>
                </button>
              )
            })}
          </div>

          {/* TAB: Hitos */}
          {tab === 'hitos' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400">El % de la meta = promedio de los % de sus hitos</p>
                <button onClick={() => setShowAddHito(!showAddHito)} className="btn-secondary text-xs py-1.5">
                  <Plus className="w-3.5 h-3.5" /> Agregar hito
                </button>
              </div>

              {showAddHito && (
                <div className="card p-4 mb-3 space-y-3 border-brand-200 dark:border-brand-800">
                  <input className="input" placeholder="Nombre del hito..." value={newHito.nombre}
                    onChange={e => setNewHito({...newHito, nombre: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Fecha límite</label>
                      <input type="date" className="input" value={newHito.fecha}
                        onChange={e => setNewHito({...newHito, fecha: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Referencia (opcional)</label>
                      <input type="number" className="input" min="0" max="100" value={newHito.peso}
                        onChange={e => setNewHito({...newHito, peso: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddHito} className="btn-primary text-xs">Agregar</button>
                    <button onClick={() => setShowAddHito(false)} className="btn-ghost text-xs">Cancelar</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {(meta.hitos || []).map(hito => {
                  const days = daysUntil(hito.fecha)
                  return (
                    <div key={hito.id} className="card p-4">
                      <div className="flex items-start gap-3">
                        <button onClick={() => handleProgresoChange(hito.id, hito.progreso >= 100 ? 0 : 100)} className="mt-0.5">
                          {hito.progreso >= 100
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-brand-500" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={clsx('text-sm font-medium leading-snug', hito.progreso >= 100 && 'text-slate-400 line-through')}>
                            {hito.nombre}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span className="text-slate-400">Fecha límite:</span>
                              <input
                                type="date"
                                value={hito.fecha || ''}
                                onChange={e => onUpdateHito(meta.id, hito.id, { fecha: e.target.value })}
                                className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                              />
                              {days !== null && days < 60 && days > 0 && <span className="text-amber-500">({days}d)</span>}
                            </label>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <input type="range" min="0" max="100" step="5" value={hito.progreso || 0}
                              onChange={e => handleProgresoChange(hito.id, e.target.value)}
                              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-brand-500" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 text-right">
                              {hito.progreso || 0}%
                            </span>
                          </div>
                          <div className="progress-bar mt-1.5">
                            <div className={clsx('progress-fill', getProgressBg(hito.progreso || 0))}
                              style={{ width: `${hito.progreso || 0}%` }} />
                          </div>
                        </div>
                        <button onClick={() => onDeleteHito(meta.id, hito.id)}
                          className="btn-ghost p-1.5 text-slate-400 hover:text-rose-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {(!meta.hitos || meta.hitos.length === 0) && (
                  <div className="text-center py-8 text-slate-400 text-sm">No hay hitos definidos.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Comentarios */}
          {tab === 'comentarios' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <textarea
                  className="input min-h-[70px] flex-1"
                  placeholder="Escribí un comentario o nota de avance..."
                  value={comentarioTexto}
                  onChange={e => setComentarioTexto(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddComentario() }}
                />
                <button onClick={handleAddComentario} className="btn-primary self-end" disabled={!comentarioTexto.trim()}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Ctrl + Enter para enviar</p>

              <div className="space-y-3">
                {(meta.comentarios || []).map(c => (
                  <div key={c.id} className="card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium text-slate-500 dark:text-slate-400">{formatDateTime(c.fecha)}</span>
                      </div>
                      <button onClick={() => onDeleteComentario(meta.id, c.id)}
                        className="btn-ghost p-1 text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{c.texto}</p>
                  </div>
                ))}
                {(!meta.comentarios || meta.comentarios.length === 0) && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Sin comentarios aún. Agregá el primero.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Documentos */}
          {tab === 'documentos' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.ppt,.pptx" />
                <button onClick={() => fileRef.current?.click()} className="btn-primary">
                  <Upload className="w-4 h-4" /> Adjuntar documento
                </button>
                <p className="text-xs text-slate-400">Minutas, pruebas, informes… (máx. ~1.5 MB con archivo)</p>
              </div>

              <div className="space-y-2">
                {(meta.documentos || []).map(doc => (
                  <div key={doc.id} className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.nombre}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Adjuntado: {formatDateTime(doc.fecha)}
                        </span>
                        {doc.tamaño > 0 && <span>· {formatFileSize(doc.tamaño)}</span>}
                        {!doc.dataUrl && <span className="text-amber-500">· solo registro</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.dataUrl && (
                        <>
                          <button onClick={() => previewDoc(doc)} className="btn-ghost p-2" title="Visualizar">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => downloadDoc(doc)} className="btn-ghost p-2" title="Descargar">
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => onDeleteDocumento(meta.id, doc.id)}
                        className="btn-ghost p-2 text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!meta.documentos || meta.documentos.length === 0) && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Sin documentos. Adjuntá minutas o evidencias del avance.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Danger zone */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => {
                if (confirm('¿Eliminar esta meta y todos sus hitos, comentarios y documentos?')) {
                  onDeleteMeta(meta.id)
                  onClose()
                }
              }}
              className="btn-danger text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar meta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
