import { useState, useEffect } from "react";
import { supabase } from "/src/supabase";
import toast from "react-hot-toast";

export default function TaskList({ tasks, userId, onTaskUpdate, onStartFocus }) {
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'media',
    recurrence: 'none',
    tags: []
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Plantillas de tareas
  const templates = {
    'Compras': [
      '🛒 Leche', '🥖 Pan', '🥚 Huevos', '🍎 Frutas', '🥩 Carne', '🧀 Queso', '🥦 Verduras'
    ],
    'Ejercicio': [
      '💪 30 min cardio', '🏋️ Pesas', '🧘 Yoga', '🏃 Correr 5km', '🚴‍♂️ Ciclismo'
    ],
    'Estudio': [
      '📚 Leer capítulo', '✍️ Tomar apuntes', '📝 Hacer resumen', '✅ Repasar tema', '🎯 Ejercicios'
    ],
    'Trabajo': [
      '📧 Responder correos', '📊 Preparar informe', '📞 Reunión equipo', '💻 Programar', '📑 Documentación'
    ],
    'Hogar': [
      '🧹 Limpiar cocina', '🧺 Lavar ropa', '🪴 Regar plantas', '🛏️ Hacer cama', '🚮 Sacar basura'
    ]
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setShowForm(true);
        toast.success('📝 Crear nueva tarea');
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[placeholder*="Buscar"]').focus();
      }
      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
        setEditingTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showForm]);

  // Extraer tags únicas
  useEffect(() => {
    const tags = new Set();
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags));
  }, [tasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: newTask.title,
            description: newTask.description,
            category: newTask.category,
            priority: newTask.priority,
            recurrence: newTask.recurrence,
            tags: newTask.tags
          })
          .eq('id', editingTask.id);
        if (error) throw error;
        toast.success('📝 Tarea actualizada');
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{
            ...newTask,
            user_id: userId,
            completed: false
          }]);
        if (error) throw error;
        toast.success('✨ Tarea creada');
      }

      setShowForm(false);
      setEditingTask(null);
      setNewTask({ title: '', description: '', category: 'personal', priority: 'media', recurrence: 'none', tags: [] });
      onTaskUpdate();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      if (error) throw error;
      toast.success('🗑️ Tarea eliminada');
      onTaskUpdate();
    } catch (error) {
      toast.error('Error al eliminar: ' + error.message);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id);
      if (error) throw error;
      
      // Si es recurrente y se completó, crear siguiente
      if (!task.completed && task.recurrence && task.recurrence !== 'none') {
        const nextDate = new Date();
        if (task.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        if (task.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        if (task.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        
        await supabase.from('tasks').insert([{
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          recurrence: task.recurrence,
          user_id: userId,
          completed: false
        }]);
        toast.success('🔄 Nueva tarea recurrente creada');
      }
      
      toast.success(task.completed ? '⭕ Tarea pendiente' : '✅ ¡Tarea completada!');
      onTaskUpdate();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      category: task.category || 'personal',
      priority: task.priority || 'media',
      recurrence: task.recurrence || 'none',
      tags: task.tags || []
    });
    setShowForm(true);
  };

  const duplicateTask = async (task) => {
    try {
      const { error } = await supabase.from('tasks').insert([{
        title: `📋 Copia de ${task.title}`,
        description: task.description,
        category: task.category,
        priority: task.priority,
        user_id: userId,
        completed: false
      }]);
      if (!error) {
        toast.success('📋 Tarea duplicada');
        onTaskUpdate();
      }
    } catch (error) {
      toast.error('Error al duplicar');
    }
  };

  const shareTask = (task) => {
    const text = `📝 *${task.title}*\n${task.description || 'Sin descripción'}\n📊 ${task.priority} · ${task.category}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const applyTemplate = (templateName) => {
    const templateTasks = templates[templateName];
    templateTasks.forEach(async (title) => {
      await supabase.from('tasks').insert([{
        title,
        user_id: userId,
        completed: false,
        category: templateName.toLowerCase(),
        priority: 'media'
      }]);
    });
    toast.success(`📋 Plantilla "${templateName}" aplicada`);
    onTaskUpdate();
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Filtrar tareas por tags
  const filteredTasks = selectedTags.length === 0 
    ? tasks 
    : tasks.filter(task => 
        task.tags && task.tags.some(tag => selectedTags.includes(tag))
      );

  return (
    <div className="space-y-4">
      {/* Plantillas rápidas */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">📋 Plantillas rápidas:</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(templates).map(template => (
            <button
              key={template}
              onClick={() => applyTemplate(template)}
              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm hover:scale-105 transition-all"
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {/* Botón para agregar tarea */}
      <button
        onClick={() => {
          setEditingTask(null);
          setNewTask({ title: '', description: '', category: 'personal', priority: 'media', recurrence: 'none', tags: [] });
          setShowForm(true);
        }}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2 group"
      >
        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar Nueva Tarea (Ctrl+N)
      </button>

      {/* Filtro por tags */}
      {allTags.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">🏷️ Filtrar por tags:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTags([])}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedTags.length === 0
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full border border-white/20 dark:border-gray-700 shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
            <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-4">
              {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
            </h3>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">Presiona ESC para cancelar</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ej: Comprar leche"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows="3"
                  placeholder="Descripción detallada..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="personal">Personal</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="estudio">Estudio</option>
                    <option value="salud">Salud</option>
                    <option value="hogar">Hogar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recurrencia
                  </label>
                  <select
                    value={newTask.recurrence}
                    onChange={(e) => setNewTask({...newTask, recurrence: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="none">No recurrente</option>
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={newTask.tags.join(', ')}
                    onChange={(e) => setNewTask({
                      ...newTask, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="trabajo, urgente, casa"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  {editingTask ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Cancelar (ESC)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No hay tareas. ¡Crea tu primera tarea con Ctrl+N!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-white/20 dark:border-gray-700 ${
                task.completed ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleComplete(task)}
                  className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                    task.completed
                      ? 'bg-gradient-to-r from-green-400 to-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-500 hover:border-purple-500 dark:hover:border-purple-400'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      task.priority === 'alta' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' :
                      task.priority === 'media' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                      {task.category}
                    </span>
                    {task.recurrence !== 'none' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        🔄 {task.recurrence === 'daily' ? 'Diaria' : task.recurrence === 'weekly' ? 'Semanal' : 'Mensual'}
                      </span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className={`text-gray-600 dark:text-gray-400 mb-2 ${task.completed ? 'line-through' : ''}`}>
                      {task.description}
                    </p>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => onStartFocus(task)}
                    className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                    title="Modo Focus"
                  >
                    ⏰
                  </button>
                  <button
                    onClick={() => shareTask(task)}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                    title="Compartir por WhatsApp"
                  >
                    📱
                  </button>
                  <button
                    onClick={() => duplicateTask(task)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                    title="Duplicar"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => startEdit(task)}
                    className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}