import { Calendar, Building2, ChevronRight, Target } from 'lucide-react'
import ProgressRing from './ProgressRing'
import { getEstadoBadge, getPrioridadBadge, formatDate, daysUntil } from '../utils/helpers'
import clsx from 'clsx'

export default function MetaCard({ meta, onClick }) {
  const estado = getEstadoBadge(meta.estado)
  const prioridad = getPrioridadBadge(meta.prioridad)
  const days = daysUntil(meta.hitos?.[0]?.fecha)
  
  return (
    <article 
      onClick={onClick}
      className="card p-5 cursor-pointer hover:shadow-soft hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-200 group animate-fade-in"
    >
      <div className="flex items-start gap-4">
        <ProgressRing progress={meta.porcentaje_meta || 0} size={52} stroke={4} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {meta.nombre}
            </h3>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5 group-hover:text-brand-500 transition-colors" />
          </div>
          
          {meta.indicador && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-1">
              {meta.indicador}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={clsx('badge', estado.class)}>{estado.label}</span>
            <span className={clsx('badge', prioridad.class)}>{prioridad.label}</span>
            
            {meta.direccion && meta.direccion !== 'Sin asignar' && (
              <span className="badge bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {meta.direccion}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Target className="w-3.5 h-3.5" />
              <span>{meta.hitos?.length || 0} hito{(meta.hitos?.length || 0) !== 1 ? 's' : ''}</span>
            </div>
            
            {meta.hitos?.[0]?.fecha && (
              <div className={clsx(
                'flex items-center gap-1.5 text-xs',
                days !== null && days < 30 ? 'text-rose-500' : 'text-slate-400'
              )}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(meta.hitos[0].fecha)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
