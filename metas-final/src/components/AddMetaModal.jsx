import { useState } from 'react'
import { X, Plus, Target } from 'lucide-react'

export default function AddMetaModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    nombre: '',
    indicador: '',
    direccion: 'Sin asignar',
    prioridad: 'media',
    notas: '',
    hitos: [{ nombre: '', fecha: '2026-12-31', peso: 100 }]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    
    const hitos = form.hitos
      .filter(h => h.nombre.trim())
      .map((h, i) => ({
        ...h,
        id: `hito_new_${Date.now()}_${i}`,
        completado: false,
        progreso: 0
      }))
    
    onAdd({ ...form, hitos })
    onClose()
  }

  const updateHito = (idx, field, value) => {
    const hitos = [...form.hitos]
    hitos[idx] = { ...hitos[idx], [field]: value }
    setForm({ ...form, hitos })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
              <Target className="w-4 h-4 text-brand-600" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white">Nueva Meta</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Nombre de la meta *</label>
            <textarea 
              className="input min-h-[70px]" 
              placeholder="Describe la meta..."
              value={form.nombre}
              onChange={e => setForm({...form, nombre: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Indicador</label>
            <textarea 
              className="input min-h-[50px]" 
              placeholder="¿Cómo se mide el éxito?"
              value={form.indicador}
              onChange={e => setForm({...form, indicador: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Dirección</label>
              <input 
                className="input" 
                value={form.direccion}
                onChange={e => setForm({...form, direccion: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Prioridad</label>
              <select 
                className="input" 
                value={form.prioridad}
                onChange={e => setForm({...form, prioridad: e.target.value})}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Primer hito</label>
            <input 
              className="input mb-2" 
              placeholder="Nombre del hito..."
              value={form.hitos[0].nombre}
              onChange={e => updateHito(0, 'nombre', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="date" 
                className="input" 
                value={form.hitos[0].fecha}
                onChange={e => updateHito(0, 'fecha', e.target.value)}
              />
              <input 
                type="number" 
                className="input" 
                placeholder="Peso %"
                min="0" max="100"
                value={form.hitos[0].peso}
                onChange={e => updateHito(0, 'peso', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">
              <Plus className="w-4 h-4" /> Crear Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
