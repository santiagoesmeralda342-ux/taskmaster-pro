import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

// Para gráficas (instalar: npm install recharts)
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ tasks, onExport }) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
    highPriority: 0
  });

  const [achievements, setAchievements] = useState([]);

  const achievementsList = [
    { name: '🌱 Principiante', tasks: 1, icon: '🌱', description: 'Primera tarea completada' },
    { name: '🔥 Activo', tasks: 10, icon: '🔥', description: '10 tareas completadas' },
    { name: '⭐ Experimentado', tasks: 25, icon: '⭐', description: '25 tareas completadas' },
    { name: '💪 Dedicado', tasks: 50, icon: '💪', description: '50 tareas completadas' },
    { name: '👑 Maestro', tasks: 100, icon: '👑', description: '100 tareas completadas' },
    { name: '💎 Diamante', tasks: 200, icon: '💎', description: '200 tareas completadas' },
    { name: '🚀 Leyenda', tasks: 500, icon: '🚀', description: '500 tareas completadas' },
  ];

  useEffect(() => {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    const highPriority = tasks.filter(t => t.priority === 'alta' && !t.completed).length;
    const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    
    setStats({
      total: tasks.length,
      completed,
      pending,
      highPriority,
      completionRate: rate
    });

    // Calcular logros
    const newAchievements = achievementsList
      .filter(a => completed >= a.tasks)
      .map(a => a.name);
    setAchievements(newAchievements);

  }, [tasks]);

  // Datos para gráficas
  const categoryData = [
    { name: 'Personal', value: tasks.filter(t => t.category === 'personal').length },
    { name: 'Trabajo', value: tasks.filter(t => t.category === 'trabajo').length },
    { name: 'Estudio', value: tasks.filter(t => t.category === 'estudio').length },
    { name: 'Salud', value: tasks.filter(t => t.category === 'salud').length },
    { name: 'Hogar', value: tasks.filter(t => t.category === 'hogar').length },
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'Alta', value: tasks.filter(t => t.priority === 'alta').length },
    { name: 'Media', value: tasks.filter(t => t.priority === 'media').length },
    { name: 'Baja', value: tasks.filter(t => t.priority === 'baja').length },
  ];

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  return (
    <div className="space-y-6 mb-8">
      {/* Título con logros */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-pulse">
          ✨ Tu Progreso Diamantivo ✨
        </h2>
        <button
          onClick={onExport}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4 4-4-4M12 12V4" />
          </svg>
          Exportar Backup
        </button>
      </div>

      {/* Logros desbloqueados */}
      {achievements.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-white font-bold text-lg mb-3">🏆 Logros desbloqueados:</h3>
          <div className="flex flex-wrap gap-2">
            {achievements.map(achievement => (
              <span key={achievement} className="bg-white/20 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-white/30">
                {achievement}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta Total */}
        <div className="group relative bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-2xl p-6 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-1 hover:shadow-[0_20px_50px_rgba(59,130,246,0.7)] overflow-hidden">
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
          <div className="relative">
            <p className="text-white/80 text-sm font-medium">💎 TOTAL</p>
            <p className="text-5xl font-bold text-white mt-2 drop-shadow-glow">{stats.total}</p>
            <p className="text-white/90 text-sm mt-2">
              {stats.completed} completadas · {stats.pending} pendientes
            </p>
          </div>
        </div>

        {/* Tarjeta Completadas */}
        <div className="group relative bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:-rotate-1 hover:shadow-[0_20px_50px_rgba(16,185,129,0.7)] overflow-hidden">
          <div className="relative">
            <p className="text-white/80 text-sm font-medium">💚 COMPLETADAS</p>
            <p className="text-5xl font-bold text-white mt-2 drop-shadow-glow">{stats.completed}</p>
            <div className="mt-2 bg-white/20 rounded-full h-2 w-full">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
            <p className="text-white/90 text-sm mt-2">{stats.completionRate}% completado</p>
          </div>
        </div>

        {/* Tarjeta Pendientes */}
        <div className="group relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-1 hover:shadow-[0_20px_50px_rgba(239,68,68,0.7)] overflow-hidden">
          <div className="relative">
            <p className="text-white/80 text-sm font-medium">❤️ PENDIENTES</p>
            <p className="text-5xl font-bold text-white mt-2 drop-shadow-glow">{stats.pending}</p>
            {stats.highPriority > 0 && (
              <p className="text-white/90 text-sm mt-2 bg-red-500/30 px-3 py-1 rounded-full inline-block">
                ⚠️ {stats.highPriority} alta prioridad
              </p>
            )}
          </div>
        </div>

        {/* Tarjeta Siguiente logro */}
        <div className="group relative bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 rounded-2xl p-6 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:-rotate-1 hover:shadow-[0_20px_50px_rgba(236,72,153,0.7)] overflow-hidden">
          <div className="relative">
            <p className="text-white/80 text-sm font-medium">🎯 SIGUIENTE LOGRO</p>
            {achievementsList
              .filter(a => stats.completed < a.tasks)
              .slice(0, 1)
              .map(next => (
                <div key={next.name}>
                  <p className="text-2xl font-bold text-white mt-2">{next.icon} {next.name}</p>
                  <p className="text-white/90 text-sm mt-2">{next.description}</p>
                  <p className="text-white/90 text-sm mt-1">
                    {stats.completed}/{next.tasks} tareas
                  </p>
                </div>
              ))}
            {achievementsList.filter(a => stats.completed >= a.tasks).length === achievementsList.length && (
              <p className="text-2xl font-bold text-white mt-2">🏆 ¡Todos los logros!</p>
            )}
          </div>
        </div>
      </div>

      {/* Gráficas */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Gráfico de categorías */}
          {categoryData.length > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📊 Distribución por Categorías</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{cat.name}: {cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gráfico de prioridades */}
          {priorityData.filter(p => p.value > 0).length > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">⚡ Tareas por Prioridad</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'Alta' ? '#FF6B6B' : 
                        entry.name === 'Media' ? '#4ECDC4' : '#96CEB4'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Barra de progreso general */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 shadow-2xl mt-6">
        <div className="flex items-center justify-between text-white mb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-4xl animate-bounce">💎</span>
            Progreso General
          </h3>
          <span className="text-4xl font-bold drop-shadow-glow">{stats.completionRate}%</span>
        </div>
        
        <div className="relative h-8 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-white to-yellow-300 rounded-full transition-all duration-1000"
            style={{ width: `${stats.completionRate}%` }}
          >
            <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
          </div>
        </div>
        
        <p className="text-white/90 text-sm mt-4 text-center font-medium">
          {stats.completed} de {stats.total} tareas completadas
        </p>
      </div>
    </div>
  );
}