import { useEffect, useState } from 'react'

export default function Dashboard({ tasks }) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
    completionRate: 0
  })

  useEffect(() => {
    if (tasks.length > 0) {
      const completed = tasks.filter(t => t.completed).length
      const pending = tasks.length - completed
      const highPriority = tasks.filter(t => t.priority === 'alta').length
      
      setStats({
        total: tasks.length,
        completed,
        pending,
        highPriority,
        completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
      })
    }
  }, [tasks])

  return (
    <div className="space-y-6 mb-8">
      {/* Grid de estadísticas con diseño moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <p className="text-white/80 text-sm">Total Tareas</p>
            <p className="text-4xl font-bold text-white mb-2">{stats.total}</p>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {stats.completed} completadas
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                {stats.pending} pendientes
              </span>
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <p className="text-white/80 text-sm">Completadas</p>
            <p className="text-4xl font-bold text-white mb-2">{stats.completed}</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
            <p className="text-white/90 text-sm mt-2">{stats.completionRate}% completado</p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <p className="text-white/80 text-sm">Pendientes</p>
            <p className="text-4xl font-bold text-white mb-2">{stats.pending}</p>
            {stats.pending > 0 ? (
              <p className="text-white/90 text-sm animate-bounce">🎯 ¡A trabajar!</p>
            ) : (
              <p className="text-white/90 text-sm">🎉 Todo listo</p>
            )}
          </div>
        </div>

        {/* Priority Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
          <div className="relative">
            <p className="text-white/80 text-sm">Alta Prioridad</p>
            <p className="text-4xl font-bold text-white mb-2">{stats.highPriority}</p>
            <p className="text-white/90 text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
              Requieren atención
            </p>
          </div>
        </div>
      </div>

      {/* Progreso General con animación */}
      <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <span>📊 Progreso General</span>
          <span className="text-2xl">{stats.completionRate}%</span>
        </h3>
        
        <div className="relative h-6 bg-white/20 rounded-full overflow-hidden mb-2">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-300 via-white to-blue-300 rounded-full transition-all duration-1000"
            style={{ width: `${stats.completionRate}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        <p className="text-white/90 text-sm">
          {stats.completed} de {stats.total} tareas completadas
        </p>
      </div>
    </div>
  )
}