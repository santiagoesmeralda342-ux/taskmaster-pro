import { useState } from "react";
import { supabase } from "/src/supabase";
import toast from "react-hot-toast";

export default function TaskList({ tasks, userId, onTaskUpdate }) {
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'media'
  });

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
            priority: newTask.priority
          })
          .eq('id', editingTask.id);
        if (error) throw error;
        toast.success('Tarea actualizada');
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{
            ...newTask,
            user_id: userId,
            completed: false
          }]);
        if (error) throw error;
        toast.success('Tarea creada');
      }

      setShowForm(false);
      setEditingTask(null);
      setNewTask({ title: '', description: '', category: 'personal', priority: 'media' });
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
      toast.success('Tarea eliminada');
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
      toast.success(task.completed ? 'Tarea pendiente' : '¡Tarea completada!');
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
      priority: task.priority || 'media'
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* Botón para agregar tarea */}
      <button
        onClick={() => {
          setEditingTask(null);
          setNewTask({ title: '', description: '', category: 'personal', priority: 'media' });
          setShowForm(true);
        }}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar Nueva Tarea
      </button>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Comprar leche"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Descripción detallada..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="personal">Personal</option>
                    <option value="trabajo">Trabajo</option>
                    <option value="estudio">Estudio</option>
                    <option value="salud">Salud</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {editingTask ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <p className="text-gray-500 text-lg">No hay tareas. ¡Crea tu primera tarea!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl shadow p-4 transition-all hover:shadow-lg ${
                task.completed ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleComplete(task)}
                  className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'alta' ? 'bg-red-100 text-red-800' :
                      task.priority === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {task.category}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className={`text-gray-600 mb-2 ${task.completed ? 'line-through' : ''}`}>
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(task)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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