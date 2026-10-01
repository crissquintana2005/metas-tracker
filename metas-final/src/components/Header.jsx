import { Search, Bell, Plus } from 'lucide-react'

export default function Header({ title, subtitle, search, setSearch, onAdd, showAdd = true }) {
  return (
    <header className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar metas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 w-64 bg-white/80 dark:bg-slate-900/80"
            />
          </div>

          {showAdd && (
            <button onClick={onAdd} className="btn-primary">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Meta</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
