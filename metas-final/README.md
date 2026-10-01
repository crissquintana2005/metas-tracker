# 🎯 Metas Tracker — Sistema de Seguimiento de Metas MIPYMES

Aplicación web moderna para el seguimiento de metas, indicadores e hitos de la Viceministerio de MIPYMES.

Diseñada con inspiración en herramientas como **Zoho Projects**: limpia, profesional, dinámica y fácil de usar.

---

## ✨ Características

- **Dashboard** con estadísticas en tiempo real, gráficos de progreso y distribución
- **Gestión de Metas** con tarjetas visuales, filtros y búsqueda
- **Detalle de Meta** con panel lateral: editar, agregar/eliminar hitos, actualizar progreso con sliders
- **Reportes** con ranking, radar por dirección y exportación a CSV
- **Modo oscuro / claro**
- **Persistencia local** (localStorage) — tus cambios se guardan automáticamente
- **Datos precargados** desde tu Excel de seguimiento
- **Responsive** y moderna UI con Tailwind CSS

---

## 🚀 Cómo ejecutar

### Requisitos
- Node.js 18+ (recomendado 20+)
- npm o yarn

### Pasos

```bash
# 1. Entrar a la carpeta del proyecto
cd metas-tracker

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev
```

La app se abrirá automáticamente en [http://localhost:5173](http://localhost:5173)

### Build para producción

```bash
npm run build
npm run preview
```

---

## 📁 Estructura del proyecto

```
metas-tracker/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/          # Componentes UI
│   │   ├── AddMetaModal.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Header.jsx
│   │   ├── MetaCard.jsx
│   │   ├── MetaDetail.jsx
│   │   ├── MetasList.jsx
│   │   ├── ProgressRing.jsx
│   │   ├── Reportes.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatCard.jsx
│   ├── data/
│   │   └── initialData.json # Datos del Excel precargados
│   ├── hooks/
│   │   └── useMetas.js      # Lógica de estado y persistencia
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

---

## 💡 Cómo usar

1. **Dashboard**: Vista general con KPIs, gráficos y listado de metas.
2. **Metas**: Lista filtrable y ordenable. Clic en una tarjeta para abrir el detalle.
3. **Detalle**: Actualiza el progreso de cada hito con el slider o marca como completado. Agrega nuevos hitos, edita la meta o elimínala.
4. **Reportes**: Visualiza rankings y exporta a CSV.
5. **Nueva Meta**: Botón en el header para crear metas nuevas.
6. **Restablecer**: En el sidebar inferior, para volver a los datos originales del Excel.

Los datos se guardan automáticamente en el navegador (localStorage).

---

## 🛠️ Tecnologías

- React 18 + Vite
- Tailwind CSS
- Recharts (gráficos)
- Lucide React (iconos)
- date-fns

---

Hecho con ❤️ para el seguimiento de metas MIPYMES.
