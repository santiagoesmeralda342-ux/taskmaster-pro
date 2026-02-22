import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./components/Auth";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
            toast.success('Nueva tarea agregada');
          }
          if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => 
              t.id === payload.new.id ? payload.new : t
            ));
            toast.success('Tarea actualizada');
          }
          if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
            toast.success('Tarea eliminada');
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
      toast.success('Sesión cerrada');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
            {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">
                TaskMaster <span className="text-yellow-300">Pro</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white/90 bg-white/10 px-4 py-2 rounded-xl text-sm border border-white/30">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500/30 hover:bg-red-500/50 text-white px-4 py-2 rounded-xl transition-all duration-300 border border-white/30 flex items-center gap-2"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard tasks={tasks} />

               {/* Buscador y filtros */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white focus:border-transparent pl-12"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === 'all' 
                    ? 'bg-white text-indigo-600 shadow-lg scale-105 font-bold' 
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                }`}
              >
                📋 Todas
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === 'pending' 
                    ? 'bg-white text-yellow-600 shadow-lg scale-105 font-bold' 
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                }`}
              >
                ⏳ Pendientes
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === 'completed' 
                    ? 'bg-white text-green-600 shadow-lg scale-105 font-bold' 
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                }`}
              >
                ✅ Completadas
              </button>
            </div>
          </div>
        </div>

        <TaskList 
          tasks={filteredTasks} 
          userId={user.id}
          onTaskUpdate={() => loadTasks(user.id)}
        />
      </main>
    </div>
  );
}

export default App;