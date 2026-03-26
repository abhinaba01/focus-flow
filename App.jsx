import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, CheckCircle, Volume2, Quote } from 'lucide-react';
import ReactPlayer from 'react-player/youtube';

const LOFI_STATIONS = [
  { id: 'jfKfPfyJRdk', name: 'Lofi Girl - Chilled Radio' },
  { id: 'dwD0S_mS_vA', name: 'Coffee Shop Vibes' },
];

const PRESETS = [
  { name: 'Pomodoro', mins: 25 },
  { name: 'Short Break', mins: 5 },
  { name: 'Deep Work', mins: 50 },
];

export default function App() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const totalSeconds = useRef(25 * 60);

  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('tasks')) || []);
  const [newTask, setNewTask] = useState('');

  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [quote, setQuote] = useState({ text: "Focus on being productive instead of busy.", author: "Tim Ferriss" });

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      setCycles(c => c + 1);
      new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const handleKeys = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.key.toLowerCase() === 's') setIsActive(a => !a);
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); document.getElementById('task-input')?.focus(); }
      if (e.key.toLowerCase() === 'c') setTasks(t => t.filter(task => !task.completed));
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  const fetchQuote = async () => {
    try {
      const res = await fetch('https://api.quotable.io/random?tags=motivational');
      const data = await res.json();
      if (data.content) setQuote({ text: data.content, author: data.author });
    } catch (e) { console.log("Quote API fail - using fallback"); }
  };
  
  useEffect(() => { 
    fetchQuote(); 
    const qInt = setInterval(fetchQuote, 300000); 
    return () => clearInterval(qInt); 
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans selection:bg-indigo-500">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <div className="md:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col items-center shadow-xl">
            <h2 className="text-zinc-400 uppercase tracking-widest text-sm mb-6">Focus Session</h2>
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray="753.9" strokeDashoffset={753.9 - (753.9 * (seconds / totalSeconds.current))}
                  className="text-indigo-500 transition-all duration-1000" strokeLinecap="round" />
              </svg>
              <div className="text-6xl font-light tabular-nums">{formatTime(seconds)}</div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsActive(!isActive)} className="bg-indigo-600 hover:bg-indigo-500 p-4 rounded-full transition">
                {isActive ? <Pause size={24}/> : <Play size={24}/>}
              </button>
              <button onClick={() => {setSeconds(25*60); setIsActive(false);}} className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-full transition">
                <RotateCcw size={24}/>
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => {setSeconds(p.mins*60); totalSeconds.current = p.mins*60; setIsActive(false);}}
                  className="text-xs bg-zinc-800 px-3 py-1 rounded-full hover:bg-zinc-700 transition">
                  {p.name}
                </button>
              ))}
            </div>
            <p className="mt-4 text-zinc-500 text-sm">Sessions completed: {cycles}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-sm font-medium">{LOFI_STATIONS[currentTrack].name}</span>
              </div>
              <Volume2 size={18} className="text-zinc-500" />
            </div>
            
            {/* <div className="hidden">
              <iframe width="0" height="0" src={`https://www.youtube.com/embed/${LOFI_STATIONS[currentTrack].id}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}`} allow="autoplay"></iframe>
            </div> */}

            <div className="absolute opacity-0 w-0 h-0 pointer-events-none">
              <ReactPlayer 
                url={`https://www.youtube.com/watch?v=${LOFI_STATIONS[currentTrack].id}`}
                playing={isPlaying}
                volume={0.5}
                width="10px"
                height="10px"
              />
            </div>

            <div className="flex justify-center gap-6 items-center">
              <button onClick={() => setCurrentTrack((currentTrack + 1) % LOFI_STATIONS.length)} className="text-zinc-400 hover:text-white">Next Station</button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white text-black rounded-full hover:scale-105 transition">
                {isPlaying ? <Pause size={20}/> : <Play size={20}/>}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl h-full flex flex-col">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-semibold">Tasks</h2>
              <span className="text-indigo-400 text-sm font-medium">
                {tasks.filter(t => t.completed).length} of {tasks.length} done
              </span>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newTask.trim()) return;
              setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
              setNewTask('');
            }} className="relative mb-6">
              <input id="task-input" type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)}
                placeholder="Press 'N' to add a task..."
                className="w-full bg-zinc-800 border-none rounded-xl py-4 pl-4 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
              <button type="submit" className="absolute right-3 top-3 bg-indigo-600 p-1.5 rounded-lg">
                <Plus size={20}/>
              </button>
            </form>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
              {tasks.map(task => (
                <div key={task.id} className="group flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-transparent hover:border-zinc-700 transition">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))}>
                      <CheckCircle size={22} className={task.completed ? "text-indigo-500" : "text-zinc-600"} />
                    </button>
                    <span className={`${task.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>{task.text}</span>
                  </div>
                  <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={18}/>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8 border-t border-zinc-800">
              <div className="flex gap-3 text-zinc-400 italic">
                <Quote size={20} className="shrink-0 text-indigo-500" />
                <p className="text-sm">"{quote.text}" — <span className="text-zinc-500 not-italic font-medium">{quote.author}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-zinc-900/80 backdrop-blur border border-zinc-800 px-6 py-2 rounded-full text-[10px] uppercase tracking-tighter text-zinc-500">
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">Space</kbd> Play/Pause</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">S</kbd> Timer</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">N</kbd> New Task</div>
         <div className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">C</kbd> Clear Done</div>
      </div>
    </div>
  );
}