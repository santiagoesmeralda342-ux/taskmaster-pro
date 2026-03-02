import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./components/Auth";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";
import FocusMode from "./components/FocusMode";
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [focusTask, setFocusTask] = useState(null);
  const [showFocus, setShowFocus] = useState(false);
  const [phrases] = useState([
    "✨ Cada tarea completada es un paso más cerca de tu meta",
    "💪 Tú puedes con todo, un día a la vez",
    "🌟 Hoy es un gran día para ser productivo",
    "🎯 Un objetivo sin un plan es solo un deseo",
    "🚀 Pequeños progresos, grandes resultados",
    "💎 El éxito es la suma de pequeños esfuerzos",
    "🌈 Cada tarea es una oportunidad de brillar",
  ]);
  const [dailyPhrase, setDailyPhrase] = useState('');

  // Backup automático cada hora
  useEffect(() => {
    const backupInterval = setInterval(() => {
      if (tasks.length > 0) {
        localStorage.setItem('tasks_backup', JSON.stringify(tasks));
        localStorage.setItem('backup_date', new Date().toISOString());
        console.log('💾 Backup automático guardado');
      }
    }, 3600000); // Cada hora

    return () => clearInterval(backupInterval);
  }, [tasks]);

  // Restaurar backup al inicio
  useEffect(() => {
    const backup = localStorage.getItem('tasks_backup');
    const backupDate = localStorage.getItem('backup_date');
    if (backup && backupDate) {
      const date = new Date(backupDate).toLocaleString();
      if (confirm(`¿Restaurar backup automático de ${date}?`)) {
        setTasks(JSON.parse(backup));
        toast.success('✅ Backup restaurado');
      }
    }
  }, []);

  // Frase motivacional del día
  useEffect(() => {
    const today = new Date().toDateString();
    const savedPhrase = localStorage.getItem('daily_phrase');
    const savedDate = localStorage.getItem('phrase_date');

    if (savedDate === today && savedPhrase) {
      setDailyPhrase(savedPhrase);
    } else {
      const randomIndex = Math.floor(Math.random() * phrases.length);
      const newPhrase = phrases[randomIndex];
      setDailyPhrase(newPhrase);
      localStorage.setItem('daily_phrase', newPhrase);
      localStorage.setItem('phrase_date', today);
    }
  }, []);

  // Aplicar modo oscuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Cargar preferencia de tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadTasks(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadTasks(session.user.id);
      } else {
        setTasks([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadTasks = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast.error('Error al cargar tareas: ' + error.message);
    }
  };

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('tasks_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new, ...prev]);
            toast.success('✨ Nueva tarea agregada');
          }
          if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => 
              t.id === payload.new.id ? payload.new : t
            ));
            toast.success('📝 Tarea actualizada');
          }
          if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
            toast.success('🗑️ Tarea eliminada');
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('👋 ¡Hasta pronto!');
    } catch (error) {
      toast.error('Error al cerrar sesión: ' + error.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'pending' && task.completed) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return task.title.toLowerCase().includes(search) || 
             (task.description?.toLowerCase().includes(search) || false);
    }
    return true;
  });

  const exportAllTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tareas_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('📥 Backup exportado correctamente');
  };

  const startFocus = (task) => {
    setFocusTask(task);
    setShowFocus(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 transition-colors duration-500">
      <Toaster position="top-right" />
      
      {showFocus && (
        <FocusMode 
          task={focusTask} 
          onClose={() => setShowFocus(false)}
          onComplete={() => {
            setShowFocus(false);
            loadTasks(user.id);
          }}
        />
      )}

      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-white/20 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                TaskMaster Pro
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 px-3 py-2 rounded-xl transition-all duration-300 border border-purple-500/30 backdrop-blur-sm"
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              <button
                onClick={exportAllTasks}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 px-3 py-2 rounded-xl transition-all duration-300 border border-green-500/30 backdrop-blur-sm"
                title="Exportar backup"
              >
                💾
              </button>

              <span className="text-gray-700 dark:text-gray-300 bg-white/30 dark:bg-gray-700/30 px-4 py-2 rounded-xl text-sm backdrop-blur-sm border border-white/20 dark:border-gray-600">
                {user.email}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl transition-all duration-300 border border-red-500/30 backdrop-blur-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Frase motivacional */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white p-4 rounded-2xl shadow-xl text-center italic">
          "{dailyPhrase}"
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard tasks={tasks} onExport={exportAllTasks} />

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Buscar tareas (Ctrl + K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                  : 'bg-white/30 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm border border-white/20 dark:border-gray-700'
              }`}
            >
              📋 Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                filter === 'pending' 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg scale-105' 
                  : 'bg-white/30 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm border border-white/20 dark:border-gray-700'
              }`}
            >
              ⏳ Pendientes
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                filter === 'completed' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105' 
                  : 'bg-white/30 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm border border-white/20 dark:border-gray-700'
              }`}
            >
              ✅ Completadas
            </button>
          </div>
        </div>

        <TaskList 
          tasks={filteredTasks} 
          userId={user.id}
          onTaskUpdate={() => loadTasks(user.id)}
          onStartFocus={startFocus}
        />
      </main>

      {/* Atajos de teclado flotantes */}
      <div className="fixed bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-3 rounded-xl shadow-xl border border-white/20 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
        <p className="font-bold mb-1">⌨️ Atajos:</p>
        <p>Ctrl + N → Nueva tarea</p>
        <p>Ctrl + K → Buscar</p>
        <p>Ctrl + D → Modo oscuro</p>
        <p>ESC → Cerrar</p>
      </div>
    </div>
  );
}

export default App;