import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import MetasList from './components/MetasList'
import Reportes from './components/Reportes'
import MetaDetail from './components/MetaDetail'
import AddMetaModal from './components/AddMetaModal'
import { useMetas } from './hooks/useMetas'
import clsx from 'clsx'

export default function App() {
  const {
    metas, loading, stats,
    updateMeta, updateHito, addMeta, deleteMeta, addHito, deleteHito,
    addComentario, deleteComentario, addDocumento, deleteDocumento, resetData
  } = useMetas()


  const [activeView, setActiveView] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })
  const [search, setSearch] = useState('')
  const [selectedMeta, setSelectedMeta] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Keep selectedMeta in sync
  useEffect(() => {
    if (selectedMeta) {
      const updated = metas.find(m => m.id === selectedMeta.id)
      if (updated) setSelectedMeta(updated)
      else setSelectedMeta(null)
    }
  }, [metas])

  const handleReset = () => {
    if (confirm('¿Restablecer todos los datos a los valores originales del Excel?\nSe perderán los cambios realizados.')) {
      resetData()
      setSelectedMeta(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500 text-sm">Cargando metas...</p>
        </div>
      </div>
    )
  }

  const titles = {
    dashboard: { title: 'Dashboard', subtitle: 'Vista general del seguimiento de metas' },
    metas: { title: 'Metas', subtitle: 'Gestiona y actualiza el progreso de cada meta' },
    reportes: { title: 'Reportes', subtitle: 'Análisis y exportación de datos' },
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onReset={handleReset}
      />

      <main className={clsx(
        'transition-all duration-300 min-h-screen',
        collapsed ? 'ml-[72px]' : 'ml-64'
      )}>
        <Header
          title={titles[activeView]?.title}
          subtitle={titles[activeView]?.subtitle}
          search={search}
          setSearch={setSearch}
          onAdd={() => setShowAddModal(true)}
          showAdd={activeView !== 'reportes'}
        />

        <div className="p-6">
          {activeView === 'dashboard' && (
            <Dashboard 
              metas={metas} 
              stats={stats} 
              onSelectMeta={setSelectedMeta}
              search={search}
            />
          )}
          {activeView === 'metas' && (
            <MetasList 
              metas={metas} 
              onSelectMeta={setSelectedMeta}
              search={search}
            />
          )}
          {activeView === 'reportes' && (
            <Reportes metas={metas} stats={stats} />
          )}
        </div>
      </main>

      {/* Detail panel */}
      {selectedMeta && (
        <MetaDetail
          meta={selectedMeta}
          onClose={() => setSelectedMeta(null)}
          onUpdateMeta={updateMeta}
          onUpdateHito={updateHito}
          onAddHito={addHito}
          onDeleteHito={deleteHito}
          onDeleteMeta={deleteMeta}
          onAddComentario={addComentario}
          onDeleteComentario={deleteComentario}
          onAddDocumento={addDocumento}
          onDeleteDocumento={deleteDocumento}
        />

      )}

      {/* Add modal */}
      {showAddModal && (
        <AddMetaModal
          onClose={() => setShowAddModal(false)}
          onAdd={addMeta}
        />
      )}
    </div>
  )
}
