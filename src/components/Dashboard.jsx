import { useEffect, useState } from 'react'

export default function Dashboard({ tasks }) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
    categories: {},
    highPriority: 0
  })

  useEffect(() => {
    if (tasks.length > 0) {
      const completed = tasks.filter(t => t.completed).length
      const pending = tasks.length - completed
      const highPriority = tasks.filter(t => t.priority === 'alta').length
      
      // Contar tareas por categoría
      const categories = tasks.reduce((acc, task) => {
        const cat = task.category || 'sin categoría'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {})

      setStats({
        total: tasks.length,
        completed,
        pending,
        highPriority,
        categories,
        completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
      })
    } else {
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        highPriority: 0,
        categories: {},
        completionRate: 0
      })
    }
  }, [tasks])

  // Si no hay tareas, mostrar mensaje
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">¡Bienvenido a TaskMaster Pro!</h3>
        <p className="text-gray-500">Comienza creando tu primera tarea</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Tareas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-600 font-semibold">{stats.completed}</span> completadas · <span className="text-yellow-600 font-semibold">{stats.pending}</span> pendientes
          </div>
        </div>

        {/* Completadas */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completadas</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {stats.completionRate}% de progreso
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {stats.pending > 0 ? '¡A trabajar!' : '¡Todo completado! 🎉'}
          </div>
        </div>

        {/* Prioridad Alta */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Prioridad Alta</p>
              <p className="text-3xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Requieren atención inmediata
          </div>
        </div>
      </div>

      {/* Barra de progreso general */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700">Progreso General</h3>
          <span className="text-lg font-bold text-primary-600">{stats.completionRate}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-green-500 transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          >
            <div className="h-full w-full bg-white opacity-25 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500 text-right">
          {stats.completed} de {stats.total} tareas completadas
        </p>
      </div>

      {/* Distribución por categorías (si hay más de una categoría) */}
      {Object.keys(stats.categories).length > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Distribución por Categorías</h3>
          <div className="space-y-3">
            {Object.entries(stats.categories).map(([category, count]) => {
              const percentage = Math.round((count / stats.total) * 100)
              const colors = {
                personal: 'bg-blue-500',
                trabajo: 'bg-purple-500',
                estudio: 'bg-green-500',
                salud: 'bg-red-500',
                otro: 'bg-gray-500'
              }
              const color = colors[category] || 'bg-primary-500'
              
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-600">{category}</span>
                    <span className="font-semibold text-gray-700">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mensaje motivacional */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">¡Sigue así!</h3>
            <p className="text-white text-opacity-90">
              {stats.completed === 0 ? 'Comienza completando tu primera tarea' :
               stats.completed === stats.total ? '¡Increíble! Has completado todas las tareas' :
               `Has completado ${stats.completed} tareas. ¡Sigue con el buen trabajo!`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}