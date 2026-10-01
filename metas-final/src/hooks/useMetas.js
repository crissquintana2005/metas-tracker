import { useState, useEffect, useCallback } from 'react'
import initialData from '../data/initialData.json'
import { calcularProgresoMeta, generateId } from '../utils/helpers'

const STORAGE_KEY = 'metas-tracker-data-v2'

function normalizeMeta(m) {
  return {
    ...m,
    comentarios: m.comentarios || [],
    documentos: m.documentos || [],
    porcentaje_meta: calcularProgresoMeta(m) || 0
  }
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
    // Migrar desde v1 si existe
    const v1 = localStorage.getItem('metas-tracker-data-v1')
    if (v1) return JSON.parse(v1)
  } catch (e) {
    console.warn('Error loading data', e)
  }
  return initialData
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Error saving data (posible límite de localStorage por archivos grandes)', e)
  }
}

export function useMetas() {
  const [metas, setMetas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = loadData()
    setMetas(data.map(normalizeMeta))
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading && metas.length > 0) {
      saveData(metas)
    }
  }, [metas, loading])

  const updateMeta = useCallback((id, updates) => {
    setMetas(prev => prev.map(m => {
      if (m.id !== id) return m
      const updated = { ...m, ...updates }
      if (updates.hitos) {
        updated.porcentaje_meta = calcularProgresoMeta(updated)
      }
      return updated
    }))
  }, [])

  const updateHito = useCallback((metaId, hitoId, updates) => {
    setMetas(prev => prev.map(m => {
      if (m.id !== metaId) return m
      const hitos = m.hitos.map(h => h.id === hitoId ? { ...h, ...updates } : h)
      const updated = { ...m, hitos }
      updated.porcentaje_meta = calcularProgresoMeta(updated)

      if (updated.porcentaje_meta >= 100) updated.estado = 'completado'
      else if (updated.porcentaje_meta >= 70) updated.estado = 'avanzado'
      else if (updated.porcentaje_meta > 0) updated.estado = 'en_progreso'
      else updated.estado = 'pendiente'

      return updated
    }))
  }, [])

  const addMeta = useCallback((metaData) => {
    const newMeta = {
      id: generateId('meta'),
      nombre: metaData.nombre || 'Nueva meta',
      indicador: metaData.indicador || '',
      direccion: metaData.direccion || 'Sin asignar',
      porcentaje_meta: 0,
      hitos: metaData.hitos || [],
      estado: 'pendiente',
      prioridad: metaData.prioridad || 'media',
      fecha_creacion: new Date().toISOString().slice(0, 10),
      notas: metaData.notas || '',
      comentarios: [],
      documentos: []
    }
    setMetas(prev => [...prev, newMeta])
    return newMeta.id
  }, [])

  const deleteMeta = useCallback((id) => {
    setMetas(prev => prev.filter(m => m.id !== id))
  }, [])

  const addHito = useCallback((metaId, hitoData) => {
    const newHito = {
      id: generateId('hito'),
      nombre: hitoData.nombre || 'Nuevo hito',
      fecha: hitoData.fecha || '2026-12-31',
      peso: hitoData.peso || 10,
      completado: false,
      progreso: 0
    }
    setMetas(prev => prev.map(m => {
      if (m.id !== metaId) return m
      const hitos = [...(m.hitos || []), newHito]
      const updated = { ...m, hitos }
      updated.porcentaje_meta = calcularProgresoMeta(updated)
      return updated
    }))
  }, [])

  const deleteHito = useCallback((metaId, hitoId) => {
    setMetas(prev => prev.map(m => {
      if (m.id !== metaId) return m
      const hitos = m.hitos.filter(h => h.id !== hitoId)
      const updated = { ...m, hitos }
      updated.porcentaje_meta = calcularProgresoMeta(updated)
      return updated
    }))
  }, [])

  const addComentario = useCallback((metaId, texto) => {
    if (!texto?.trim()) return
    const comentario = {
      id: generateId('com'),
      texto: texto.trim(),
      fecha: new Date().toISOString()
    }
    setMetas(prev => prev.map(m => {
      if (m.id !== metaId) return m
      return { ...m, comentarios: [comentario, ...(m.comentarios || [])] }
    }))
  }, [])

  const deleteComentario = useCallback((metaId, comId) => {
    setMetas(prev => prev.map(m => {
      if (m.id !== metaId) return m
      return { ...m, comentarios: (m.comentarios || []).filter(c => c.id !== comId) }
    }))
  }, [])

  const addDocumento = useCallback((metaId, docData) => {
    const documento = {
      id: generateId('doc'),
      nombre: docData.nombre,
      tipo: docData.tipo || '',
      tamaño: docData.tamaño || 0,
      fecha: new Date().toISOString(),
      dataUrl: docData.dataUrl || null, // base64 para archivos pequeños
      hitoId: docData.hitoId || null
    }
    setMetas(prev => prev.map(m => {
      if (m.id !== metaId) return m
      return { ...m, documentos: [documento, ...(m.documentos || [])] }
    }))
  }, [])

  const deleteDocumento = useCallback((metaId, docId) => {
    setMetas(prev => prev.map(m => {
      if (m.id !== metaId) return m
      return { ...m, documentos: (m.documentos || []).filter(d => d.id !== docId) }
    }))
  }, [])

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('metas-tracker-data-v1')
    setMetas(initialData.map(normalizeMeta))
  }, [])

  const stats = {
    total: metas.length,
    completadas: metas.filter(m => m.porcentaje_meta >= 100).length,
    enProgreso: metas.filter(m => m.porcentaje_meta > 0 && m.porcentaje_meta < 100).length,
    pendientes: metas.filter(m => m.porcentaje_meta === 0).length,
    promedio: metas.length ? Math.round(metas.reduce((s, m) => s + (m.porcentaje_meta || 0), 0) / metas.length) : 0,
    totalHitos: metas.reduce((s, m) => s + (m.hitos?.length || 0), 0),
    hitosCompletados: metas.reduce((s, m) => s + (m.hitos?.filter(h => h.progreso >= 100).length || 0), 0),
  }

  return {
    metas,
    loading,
    stats,
    updateMeta,
    updateHito,
    addMeta,
    deleteMeta,
    addHito,
    deleteHito,
    addComentario,
    deleteComentario,
    addDocumento,
    deleteDocumento,
    resetData
  }
}
