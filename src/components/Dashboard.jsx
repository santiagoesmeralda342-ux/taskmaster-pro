import { useEffect, useState } from 'react'

export default function Dashboard({ tasks }) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0
  })

  useEffect(() => {
    const completed = tasks.filter(t => t.completed).length
    const pending = tasks.length - completed
    const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
    
    setStats({
      total: tasks.length,
      completed,
      pending,
      completionRate: rate
    })
  }, [tasks])

  return (
    <div className="space-y-6 mb-8">
      {/* Título con efecto diamante */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-pulse">
          ✨ Tu Proceso Diamantivo ✨
        </h2>
      </div>

      {/* Grid de tarjetas DIAMANTIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta Total - Estilo Zafiro */}
        <div className="group relative bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-2xl p-6 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-1 hover:shadow-[0_20px_50px_rgba(59,130,246,0.7)] overflow-hidden">
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/30 rounded-full blur-2xl animate-ping"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium tracking-wider">💎 TOTAL</p>
              <p className="text-5xl font-bold text-white mt-2 drop-shadow-glow">{stats.total}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-white/90 text-sm bg-white/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  {stats.completed} hechas
                </span>
                <span className="flex items-center gap-1 text-white/90 text-sm bg-white/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span>
                  {stats.pending} por hacer
                </span>
              </div>
            </div>
            <div className="w-20 h-20 bg-white/30 rounded-2xl backdrop-blur-sm flex items-center justify-center transform rotate-12 group-hover:rotate-45 transition-all duration-500">
              <span className="text-4xl filter drop-shadow-lg">💠</span>
            </div>
          </div>
        </div>

        {/* Tarjeta Completadas - Estilo Esmeralda */}
        <div className="group relative bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:-rotate-1 hover:shadow-[0_20px_50px_rgba(16,185,129,0.7)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium tracking-wider">💚 COMPLETADAS</p>
              <p className="text-5xl font-bold text-white mt-2 drop-shadow-glow">{stats.completed}</p>
              <div className="mt-2 bg-white/20 rounded-full h-2 w-full overflow-hidden">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
              <p className="text-white/90 text-sm mt-2 font-medium">{stats.completionRate}% completado</p>
            </div>
            <div className="w-20 h-20 bg-white/30 rounded-2xl backdrop-blur-sm flex items-center justify-center transform -rotate-12 group-hover:rotate-45 transition-all duration-500">
              <span className="text-4xl filter drop-shadow-lg">💚</span>
            </div>
          </div>
        </div>

        {/* Tarjeta Pendientes - Estilo Rubí */}
        <div className="group relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-1 hover:shadow-[0_20px_50px_rgba(239,68,68,0.7)] overflow-hidden">
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium tracking-wider">❤️ PENDIENTES</p>
              <p className="text-5xl font-bold text-white mt-2 drop-shadow-glow">{stats.pending}</p>
              {stats.pending > 0 ? (
                <p className="text-white/90 text-sm mt-2 flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-red-300 rounded-full animate-ping"></span>
                  ¡A brillar!
                </p>
              ) : (
                <p className="text-white/90 text-sm mt-2 flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  Todo listo ✨
                </p>
              )}
            </div>
            <div className="w-20 h-20 bg-white/30 rounded-2xl backdrop-blur-sm flex items-center justify-center transform rotate-12 group-hover:-rotate-45 transition-all duration-500">
              <span className="text-4xl filter drop-shadow-lg">❤️</span>
            </div>
          </div>
        </div>

        {/* Tarjeta Diamante - Brillo Especial */}
        <div className="group relative bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 rounded-2xl p-6 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:-rotate-1 hover:shadow-[0_20px_50px_rgba(236,72,153,0.7)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute -inset-full group-hover:inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-1000"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium tracking-wider">💎 BRILLO</p>
              <p className="text-5xl font-bold text-white mt-2 drop-shadow-glow">{stats.total}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-white/90 text-sm bg-white/20 px-3 py-1 rounded-full">
                  {stats.completed} 💚
                </span>
                <span className="flex items-center gap-1 text-white/90 text-sm bg-white/20 px-3 py-1 rounded-full">
                  {stats.pending} ❤️
                </span>
              </div>
            </div>
            <div className="w-20 h-20 bg-white/30 rounded-2xl backdrop-blur-sm flex items-center justify-center transform group-hover:scale-125 group-hover:rotate-180 transition-all duration-700">
              <span className="text-4xl filter drop-shadow-lg">💎</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso diamantiva */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10 animate-pulse"></div>
        <div className="relative flex items-center justify-between text-white mb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-4xl animate-bounce">💎</span>
            Brillo General
          </h3>
          <span className="text-4xl font-bold drop-shadow-glow">{stats.completionRate}%</span>
        </div>
        
        <div className="relative h-8 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-white to-yellow-300 rounded-full transition-all duration-1000"
            style={{ width: `${stats.completionRate}%` }}
          >
            <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
          </div>
        </div>
        
        <p className="text-white/90 text-sm mt-4 text-center font-medium">
          {stats.completed} de {stats.total} tareas brillan con luz propia ✨
        </p>
      </div>
    </div>
  )
}