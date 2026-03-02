import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function FocusMode({ task, onClose, onComplete }) {
  const [time, setTime] = useState(25 * 60); // 25 minutos
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // pomodoro, shortBreak, longBreak

  const modes = {
    pomodoro: { time: 25 * 60, label: '🍅 Pomodoro' },
    shortBreak: { time: 5 * 60, label: '☕ Descanso corto' },
    longBreak: { time: 15 * 60, label: '🧘 Descanso largo' }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      if (mode === 'pomodoro') {
        toast.success('🎉 ¡Pomodoro completado! Tómate un descanso');
        setMode('shortBreak');
        setTime(modes.shortBreak.time);
      } else {
        toast.success('✨ Descanso terminado, ¡vuelve al trabajo!');
        setMode('pomodoro');
        setTime(modes.pomodoro.time);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, time, mode]);

  const formatTime = () => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setTime(modes[mode].time);
    setIsActive(false);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setTime(modes[newMode].time);
    setIsActive(false);
  };

  const completeTask = () => {
    onComplete();
    toast.success('✅ ¡Tarea completada!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100]">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-1 rounded-3xl">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full">
          {/* Título */}
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Modo Focus
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {task?.title}
          </p>

          {/* Selector de modo */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => changeMode('pomodoro')}
              className={`px-4 py-2 rounded-xl transition-all ${
                mode === 'pomodoro' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              🍅 Pomodoro
            </button>
            <button
              onClick={() => changeMode('shortBreak')}
              className={`px-4 py-2 rounded-xl transition-all ${
                mode === 'shortBreak' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              ☕ Corto
            </button>
            <button
              onClick={() => changeMode('longBreak')}
              className={`px-4 py-2 rounded-xl transition-all ${
                mode === 'longBreak' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              🧘 Largo
            </button>
          </div>

          {/* Temporizador */}
          <div className="text-center mb-8">
            <div className="text-7xl font-bold text-gray-800 dark:text-white mb-4">
              {formatTime()}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {modes[mode].label}
            </p>
          </div>

          {/* Controles */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setIsActive(!isActive)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
            >
              {isActive ? '⏸️ Pausa' : '▶️ Iniciar'}
            </button>
            <button
              onClick={resetTimer}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
            >
              🔄 Reset
            </button>
          </div>

          {/* Botón de completar */}
          <button
            onClick={completeTask}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all mb-3"
          >
            ✅ Marcar como completada
          </button>

          {/* Cerrar */}
          <button
            onClick={onClose}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            ✖️ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}