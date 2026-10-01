import clsx from 'clsx'

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand: 'from-brand-500 to-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    amber: 'from-amber-500 to-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    rose: 'from-rose-500 to-rose-600 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
    violet: 'from-violet-500 to-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40',
  }
  
  const c = colors[color] || colors.brand
  const [gradient, textColor, bgColor] = [c.split(' ').slice(0,2).join(' '), c.split(' ')[2] + ' ' + c.split(' ')[3], c.split(' ').slice(4).join(' ')]

  return (
    <div className="card p-5 hover:shadow-soft transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', bgColor)}>
          <Icon className={clsx('w-5 h-5', textColor)} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">{trend}</span>
        </div>
      )}
    </div>
  )
}
