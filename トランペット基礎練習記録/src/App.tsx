import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Clock, 
  Timer, 
  CheckCircle2, 
  Plus, 
  RotateCcw, 
  Play, 
  Pause, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Trash2, 
  History, 
  Gauge, 
  Lightbulb, 
  SlidersHorizontal, 
  Calendar, 
  X, 
  AlertCircle,
  TrendingDown,
  Settings2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Cell, 
  Pie, 
  Legend 
} from 'recharts';
import { PRACTICE_MENUS, ROUTINE_TEMPLATES, generateMockLogs } from './data';
import { PracticeLog, SkillLevelRating, PracticeMenuDef, RoutineTemplate } from './types';

// Web Audio Metronome sound generator
const playClickNode = (frequency: number = 1000) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.warn('Audio Context is blocked or not supported yet:', e);
  }
};

export default function App() {
  // Define tab state
  type Tab = 'practice' | 'dashboard' | 'history' | 'glossary';
  const [activeTab, setActiveTab] = useState<Tab>('practice');

  // Load logs from localStorage or generate mock logs first time
  const [logs, setLogs] = useState<PracticeLog[]>(() => {
    const local = localStorage.getItem('trumpet_practice_logs');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing local logs, loading defaults');
      }
    }
    const initialMock = generateMockLogs();
    localStorage.setItem('trumpet_practice_logs', JSON.stringify(initialMock));
    return initialMock;
  });

  // Save logs changes
  useEffect(() => {
    localStorage.setItem('trumpet_practice_logs', JSON.stringify(logs));
  }, [logs]);

  // Load/save custom routine from local storage or default to 30min template
  const [customRoutineItems, setCustomRoutineItems] = useState<any[]>(() => {
    const local = localStorage.getItem('trumpet_custom_routine_items');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    // Default to copying the 30-min routine items with fresh random IDs
    return [
      { id: 'custom_buzz', menuId: 'mouthpiece_buzzing', targetMinutes: 3, recommendedTempoMin: 60, recommendedTempoMax: 80, selectedSubItems: ['ピッチキープ（一定音）', 'サイレン（高低スライド）', '簡単なメロディ吹奏'] },
      { id: 'custom_long', menuId: 'long_tone', targetMinutes: 5, recommendedTempoMin: 60, recommendedTempoMax: 70, selectedSubItems: ['低音域ロングトーン', '中音域ロングトーン', '高音域ロングトーン'] },
      { id: 'custom_slur', menuId: 'lip_slur', targetMinutes: 5, recommendedTempoMin: 72, recommendedTempoMax: 100, selectedSubItems: ['2度跳躍（5度上下）', '3度跳躍（オクターブ）'] },
      { id: 'custom_scale', menuId: 'scale_practice', targetMinutes: 5, recommendedTempoMin: 80, recommendedTempoMax: 120, selectedSubItems: ['Cメジャー/Aマイナー'] }
    ];
  });

  useEffect(() => {
    localStorage.setItem('trumpet_custom_routine_items', JSON.stringify(customRoutineItems));
  }, [customRoutineItems]);

  // Track currently selected routine template ID, including 'custom'
  const [selectedRoutineType, setSelectedRoutineType] = useState<string>(() => {
    return localStorage.getItem('trumpet_selected_routine_type') || 'routine_30';
  });

  useEffect(() => {
    localStorage.setItem('trumpet_selected_routine_type', selectedRoutineType);
  }, [selectedRoutineType]);

  // Generate selectedRoutine dynamically based on selectedRoutineType
  const selectedRoutine = React.useMemo(() => {
    if (selectedRoutineType === 'custom') {
      return {
        id: 'custom',
        name: 'カスタム基礎練習ルーティン',
        durationLabel: 'カスタム',
        durationMinutes: 0,
        description: '自分専用に練習メニューを自由に追加・削除・並び替えしてカスタマイズしたルーティンです。',
        items: customRoutineItems
      };
    }
    const found = ROUTINE_TEMPLATES.find(r => r.id === selectedRoutineType);
    return found || ROUTINE_TEMPLATES[1];
  }, [selectedRoutineType, customRoutineItems]);

  // Track completed sub-items per menu item for current active session
  // format: { [menuId: string]: string[] }
  const [sessionCompletedSubItems, setSessionCompletedSubItems] = useState<{ [menuId: string]: string[] }>(() => {
    const local = localStorage.getItem('trumpet_completed_sub_items');
    return local ? JSON.parse(local) : {};
  });

  useEffect(() => {
    localStorage.setItem('trumpet_completed_sub_items', JSON.stringify(sessionCompletedSubItems));
  }, [sessionCompletedSubItems]);

  // Custom routine checklist actions
  const addCustomRoutineItem = (menuId: string) => {
    const menuDef = PRACTICE_MENUS.find(m => m.id === menuId);
    if (!menuDef) return;
    
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      menuId,
      targetMinutes: 5,
      recommendedTempoMin: 60,
      recommendedTempoMax: 120,
      selectedSubItems: menuDef.subItems || []
    };
    
    setCustomRoutineItems(prev => [...prev, newItem]);
    
    // Auto active newly added item
    setTimeout(() => {
      setActiveItemIndex(customRoutineItems.length);
    }, 50);
  };

  const removeCustomRoutineItem = (id: string, index: number) => {
    setCustomRoutineItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      if (activeItemIndex >= updated.length) {
        setActiveItemIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const moveCustomRoutineItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === customRoutineItems.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    setCustomRoutineItems(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    
    setActiveItemIndex(targetIndex);
  };

  const toggleSubItem = (menuId: string, subItemName: string) => {
    setSessionCompletedSubItems(prev => {
      const current = prev[menuId] || [];
      const updated = current.includes(subItemName)
        ? current.filter(item => item !== subItemName)
        : [...current, subItemName];
      return { ...prev, [menuId]: updated };
    });
  };

  // State to hold new sub-item input text in customized checklist
  const [newSubItemText, setNewSubItemText] = useState<string>('');

  // Update active item properties for the Custom Routine
  const updateActiveCustomItem = (fields: Partial<any>) => {
    setCustomRoutineItems(prev => {
      const copy = [...prev];
      if (copy[activeItemIndex]) {
        copy[activeItemIndex] = { ...copy[activeItemIndex], ...fields };
      }
      return copy;
    });
  };

  // Copy standard preset routine into Custom routine for personalized adjusting
  const handleCopyToCustom = () => {
    // Clone standard static items with new timestamps/unique ids
    const clonedItems = selectedRoutine.items.map((item, index) => ({
      ...item,
      id: `custom_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`
    }));
    setCustomRoutineItems(clonedItems);
    setSelectedRoutineType('custom');
    setActiveItemIndex(0);
  };

  // Custom checklist states (which menuIds are completed in the current run)
  const [sessionCompletedIds, setSessionCompletedIds] = useState<string[]>([]);
  
  // Active selected item for work
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const activeRoutineItem = selectedRoutine.items[activeItemIndex];
  const activeMenu = PRACTICE_MENUS.find(m => m.id === activeRoutineItem?.menuId) || PRACTICE_MENUS[0];

  // Training form parameters for current focused exercise
  const [currentTempo, setCurrentTempo] = useState<number>(80);
  const [currentRating, setCurrentRating] = useState<SkillLevelRating>('success');
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const [isLoggedThisSession, setIsLoggedThisSession] = useState<boolean>(false);

  // Synchronization when changing active exercise
  useEffect(() => {
    if (activeRoutineItem) {
      setCurrentTempo(activeRoutineItem.recommendedTempoMin || 80);
      setCurrentRating('success');
      setCurrentNotes('');
      // Check if already logged for this physical menu today (or logged during this exact session sequence)
      const isDone = sessionCompletedIds.includes(activeRoutineItem.menuId);
      setIsLoggedThisSession(isDone);
      
      // Reset timer
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [activeItemIndex, selectedRoutineType, customRoutineItems, sessionCompletedIds]);

  // Stopwatch/timer States
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Metronome States
  const [isMetronomeRunning, setIsMetronomeRunning] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [metronomeFlash, setMetronomeFlash] = useState<boolean>(false);
  const [metronomeSubdivision, setMetronomeSubdivision] = useState<number>(1); // 1 = 4分, 2 = 8分, 3 = 3連, 4 = 16分
  const metronomeTimerRef = useRef<any>(null);
  const tickCounterRef = useRef<number>(0);

  useEffect(() => {
    if (isMetronomeRunning) {
      tickCounterRef.current = 0;
      // Calculate interval: (60 / currentTempo) * 1000 for quarter note, divided by subdivision
      const intervalMs = ((60 / currentTempo) * 1000) / metronomeSubdivision;
      
      const tick = () => {
        const count = tickCounterRef.current;
        const isDownbeat = count === 0;
        
        setMetronomeFlash(true);
        setTimeout(() => setMetronomeFlash(false), 80);
        
        if (isAudioEnabled) {
          // Downbeat (beat accent) is higher pitch (1200Hz), sub-beats are lower pitch (700Hz)
          playClickNode(isDownbeat ? 1200 : 700);
        }
        
        tickCounterRef.current = (count + 1) % metronomeSubdivision;
      };
      
      tick(); // first tick immediately
      metronomeTimerRef.current = setInterval(tick, intervalMs);
    } else {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    }
    return () => {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    };
  }, [isMetronomeRunning, currentTempo, isAudioEnabled, metronomeSubdivision]);

  // Manual Log Form State (For non-routine custom logging)
  const [manualMenuId, setManualMenuId] = useState<string>(PRACTICE_MENUS[0].id);
  const [manualTempo, setManualTempo] = useState<number>(80);
  const [manualDuration, setManualDuration] = useState<number>(5);
  const [manualRating, setManualRating] = useState<SkillLevelRating>('success');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Selected chart menu filter for tempo analytics
  const [dashboardTempoMenuId, setDashboardTempoMenuId] = useState<string>('lip_slur');

  // Trigger confetti or completion modal when routine finishes
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Handle logging of current exercise
  const handleLogExercise = () => {
    if (!activeRoutineItem) return;
    
    // Create new practice log
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: PracticeLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: todayStr,
      timestamp: Date.now(),
      menuId: activeMenu.id,
      menuName: activeMenu.name,
      tempo: currentTempo,
      rating: currentRating,
      notes: currentNotes.trim(),
      durationMinutes: Math.max(1, Math.ceil(timerSeconds / 60)), // at least 1 minute if trained
      completedSubItems: sessionCompletedSubItems[activeMenu.id] || []
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    setIsLoggedThisSession(true);

    // Mark as completed in current checklist session
    if (!sessionCompletedIds.includes(activeMenu.id)) {
      const newDone = [...sessionCompletedIds, activeMenu.id];
      setSessionCompletedIds(newDone);
      
      // If we finished the final item in the routine list
      if (newDone.length === selectedRoutine.items.length) {
        setShowCelebration(true);
      }
    }

    // Stop metronome and timer
    setIsMetronomeRunning(false);
    setIsTimerRunning(false);
  };

  // Add a manually entered practice log
  const handleAddManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenMenu = PRACTICE_MENUS.find(m => m.id === manualMenuId) || PRACTICE_MENUS[0];
    const newLog: PracticeLog = {
      id: `log_${Date.now()}`,
      date: manualDate,
      timestamp: new Date(manualDate).getTime(),
      menuId: chosenMenu.id,
      menuName: chosenMenu.name,
      tempo: manualTempo,
      rating: manualRating,
      notes: manualNotes.trim(),
      durationMinutes: Number(manualDuration)
    };

    setLogs([newLog, ...logs]);
    
    // Reset manual form
    setManualNotes('');
    alert('練習記録を登録しました！');
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('この記録を削除しますか？')) {
      setLogs(logs.filter(log => log.id !== id));
    }
  };

  const resetTodaySession = () => {
    setSessionCompletedIds([]);
    setSessionCompletedSubItems({});
    setActiveItemIndex(0);
    setShowCelebration(false);
    setIsLoggedThisSession(false);
  };

  // Pre-configured custom quick sets
  const incrementTempo = (val: number) => {
    setCurrentTempo(prev => Math.max(30, Math.min(250, prev + val)));
  };

  // Group logs by Date (YYYY-MM-DD) for History section
  const getLogsGroupedByDate = () => {
    const groups: { [date: string]: PracticeLog[] } = {};
    const sorted = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    sorted.forEach(log => {
      const dateStr = log.date;
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(log);
    });
    return groups;
  };

  // Total calculated statistics from logs
  const totalPracticeDays = new Set(logs.map(l => l.date)).size;
  const totalPracticeMinutes = logs.reduce((sum, l) => sum + l.durationMinutes, 0);
  
  // Rating math
  const totalCount = logs.length;
  const successCount = logs.filter(l => l.rating === 'success').length;
  const needsImpCount = logs.filter(l => l.rating === 'needs_improvement').length;
  const failCount = logs.filter(l => l.rating === 'fail').length;
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  // Formatting utility to display mm:ss
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Process data for Recharts (Practice amount per day over past 10 practice dates)
  const getDailyChartData = () => {
    // Map dates to sum of minutes
    const dateMap: { [key: string]: number } = {};
    logs.slice(0, 50).forEach(log => {
      dateMap[log.date] = (dateMap[log.date] || 0) + log.durationMinutes;
    });

    // Create array, sort chronologically
    return Object.entries(dateMap)
      .map(([date, minutes]) => ({
        date: date.slice(5), // Just MM-DD for label space
        minutes
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10); // Show recent 10 days
  };

  // Process data for Recharts (Tempo progress of a specific exercise over time)
  const getTempoProgressData = () => {
    return logs
      .filter(l => l.menuId === dashboardTempoMenuId)
      .map(l => ({
        date: l.date.slice(5),
        tempo: l.tempo,
        rating: l.rating === 'success' ? '並以上' : (l.rating === 'needs_improvement' ? '改善点あり' : '不可')
      }))
      .reverse(); // Chronological
  };

  // Status colors resolver
  const getRatingColor = (rating: SkillLevelRating) => {
    switch (rating) {
      case 'success':
        return 'emerald';
      case 'needs_improvement':
        return 'amber';
      case 'fail':
        return 'rose';
    }
  };

  const getRatingLabel = (rating: SkillLevelRating) => {
    switch (rating) {
      case 'success':
        return '成功 (できた)';
      case 'needs_improvement':
        return 'もう少し (あと一歩)';
      case 'fail':
        return '失敗 (できなかった)';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20 border-8 border-slate-900">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b-4 border-amber-500 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] shrink-0">
              <Music className="h-5.5 w-5.5 stroke-[2.5]" id="trumpet-logo" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black tracking-wider uppercase text-white flex items-center gap-2">
                BRASSCORE <span className="text-amber-500 text-[10px] px-1.5 py-0.5 bg-slate-800 rounded font-mono font-bold tracking-widest align-middle">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-none mt-0.5">Trumpet Foundation Tracker</p>
            </div>
          </div>

          {/* Real-time JST Clock / Info line */}
          <div className="flex items-center gap-4 text-xs font-mono bg-slate-850 px-4 py-2 rounded-full border border-slate-800 shadow-inner">
            <span className="text-slate-400">今日: {new Date().toLocaleDateString('ja-JP')}</span>
            <span className="h-3 w-[1px] bg-slate-700"></span>
            <span className="text-amber-400 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> 記録完了: {logs.length}回
            </span>
          </div>
        </div>

        {/* Beautiful Navigation Tabs */}
        <div className="bg-slate-950 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto flex overflow-x-auto justify-around">
            <button
              id="tab-btn-practice"
              onClick={() => setActiveTab('practice')}
              className={`flex-1 py-4 text-center text-xs font-bold font-display uppercase tracking-widest transition-all bar-transition flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px] ${
                activeTab === 'practice'
                  ? 'text-amber-400 border-b-4 border-amber-400 bg-slate-900/40'
                  : 'text-slate-400 hover:text-slate-200 border-b-4 border-transparent'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>本日の基礎練習</span>
            </button>
            <button
              id="tab-btn-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-4 text-center text-xs font-bold font-display uppercase tracking-widest transition-all bar-transition flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px] ${
                activeTab === 'dashboard'
                  ? 'text-amber-400 border-b-4 border-amber-400 bg-slate-900/40'
                  : 'text-slate-400 hover:text-slate-200 border-b-4 border-transparent'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>進歩ダッシュボード</span>
            </button>
            <button
              id="tab-btn-history"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-center text-xs font-bold font-display uppercase tracking-widest transition-all bar-transition flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px] ${
                activeTab === 'history'
                  ? 'text-amber-400 border-b-4 border-amber-400 bg-slate-900/40'
                  : 'text-slate-400 hover:text-slate-200 border-b-4 border-transparent'
              }`}
            >
              <History className="h-4 w-4" />
              <span>全練習履歴・追加</span>
            </button>
            <button
              id="tab-btn-glossary"
              onClick={() => setActiveTab('glossary')}
              className={`flex-1 py-4 text-center text-xs font-bold font-display uppercase tracking-widest transition-all bar-transition flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px] ${
                activeTab === 'glossary'
                  ? 'text-amber-400 border-b-4 border-amber-400 bg-slate-900/40'
                  : 'text-slate-400 hover:text-slate-200 border-b-4 border-transparent'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>メニュー図鑑</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* TAB 1: PRACTICE SESSION */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border-2 border-slate-900 rounded-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div>
                  <h2 className="text-lg font-display font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <SlidersHorizontal className="h-5 w-5 text-amber-500" />
                    練習プランの選択と進捗チェック
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    割ける時間に適した基礎練習コースを組み立てました。上から順番に実施していきましょう。
                  </p>
                </div>
                
                {/* Routine Choice Buttons */}
                <div className="flex flex-wrap gap-2">
                  {ROUTINE_TEMPLATES.map((routine) => (
                    <button
                      key={routine.id}
                      id={`routine-select-${routine.id}`}
                      onClick={() => {
                        setSelectedRoutineType(routine.id);
                        setSessionCompletedIds([]);
                        setActiveItemIndex(0);
                        setIsLoggedThisSession(false);
                      }}
                      className={`px-4 py-2.5 text-xs font-display font-bold uppercase tracking-wider rounded border-2 border-slate-900 transition-all ${
                        selectedRoutineType === routine.id
                          ? 'bg-amber-400 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                          : 'bg-white hover:bg-slate-50 text-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      }`}
                    >
                      {routine.durationLabel} ({routine.name.replace('基礎練習', '')})
                    </button>
                  ))}

                  {/* Custom selection button */}
                  <button
                     id="routine-select-custom"
                     onClick={() => {
                       setSelectedRoutineType('custom');
                       setSessionCompletedIds([]);
                       setActiveItemIndex(0);
                       setIsLoggedThisSession(false);
                     }}
                     className={`px-4 py-2.5 text-xs font-display font-bold uppercase tracking-wider rounded border-2 border-slate-900 transition-all ${
                       selectedRoutineType === 'custom'
                         ? 'bg-amber-400 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] animate-pulse'
                         : 'bg-white hover:bg-slate-50 text-slate-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                     }`}
                  >
                    カスタム (自由設定)
                  </button>
                </div>
              </div>

              {/* Routine Detail Summary card */}
              <div className="mt-5 p-4 rounded bg-amber-50 border-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-display font-black text-slate-900 tracking-tight">{selectedRoutine.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">{selectedRoutine.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-xs text-slate-500 font-mono">
                    <div>構成: <span className="font-bold text-slate-900">{selectedRoutine.items.length} 項目</span></div>
                  </div>
                  <button
                    id="btn-session-reset"
                    onClick={resetTodaySession}
                    title="本日のチェックリストをリセット"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-850 bg-white border-2 border-slate-900 px-3 py-2 rounded shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-amber-100 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0 hover:shadow-none transition-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>最初からやり直す</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist and Focused Panel Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: checklist tracking */}
              <div className="lg:col-span-5 bg-slate-100 p-6 border-2 border-slate-900 rounded-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-display font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>基礎練習チェックリスト</span>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 border-2 border-slate-900 px-2.5 py-0.5 rounded">
                      {sessionCompletedIds.length} / {selectedRoutine.items.length} 完了
                    </span>
                  </h3>

                  {/* Selected Routine CUSTOM menu adder tool if type is custom */}
                  {selectedRoutineType === 'custom' && (
                    <div className="mb-4 p-3 bg-white border-2 border-slate-900 rounded-lg flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                      <select
                        id="custom-add-item-select"
                        defaultValue={PRACTICE_MENUS[0].id}
                        onChange={(e) => {
                          const val = e.target.value;
                          (window as any)._pendingCustomAddId = val;
                        }}
                        className="flex-1 text-xs font-bold p-2 rounded border-2 border-slate-900 bg-white"
                      >
                        {PRACTICE_MENUS.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const val = (window as any)._pendingCustomAddId || PRACTICE_MENUS[0].id;
                          addCustomRoutineItem(val);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold border-2 border-slate-900 p-2 rounded shrink-0 transition-all flex items-center gap-1 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[3]" />
                        <span>追加</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-3 flex-grow overflow-y-auto max-h-[520px] pr-1">
                    {selectedRoutine.items.map((item, index) => {
                      const menu = PRACTICE_MENUS.find(m => m.id === item.menuId);
                      if (!menu) return null;
                      const isCompleted = sessionCompletedIds.includes(menu.id);
                      const isActive = activeItemIndex === index;

                      // Check how many sub-items completed
                      const completedSubs = sessionCompletedSubItems[menu.id] || [];
                      const totalSubs = menu.subItems || [];
                      const subsCompletedCount = completedSubs.length;

                      // Tag color matching key
                      let catColor = "border-slate-900 bg-slate-100 text-slate-700";
                      if (menu.category === 'tone') catColor = "bg-blue-100 border-slate-900 text-blue-900";
                      else if (menu.category === 'flexibility') catColor = "bg-amber-100 border-slate-900 text-amber-900";
                      else if (menu.category === 'technique') catColor = "bg-emerald-100 border-slate-900 text-emerald-950";
                      else if (menu.category === 'articulation') catColor = "bg-violet-100 border-slate-900 text-violet-900";
                      else if (menu.category === 'range') catColor = "bg-purple-100 border-slate-900 text-purple-950";

                      return (
                        <div
                          key={item.id || menu.id + '_' + index}
                          id={`checklist-item-${menu.id}`}
                          onClick={() => setActiveItemIndex(index)}
                          className={`group relative p-3.5 rounded-lg border-2 cursor-pointer transition-all flex flex-col gap-2.5 ${
                            isActive 
                              ? 'bg-amber-400 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] font-bold text-slate-900' 
                              : 'bg-white hover:bg-slate-50 border-slate-900/60 shadow-[1px_1px_0px_0px_rgba(15,23,42,0.1)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-3">
                              {/* Completed Icon checkmark circle */}
                              <div 
                                className={`w-5 h-5 rounded border-2 transition-all shrink-0 flex items-center justify-center ${
                                  isCompleted 
                                    ? 'bg-emerald-500 border-slate-900 text-slate-900' 
                                    : 'border-slate-900 bg-white group-hover:bg-amber-100'
                                 }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isCompleted) {
                                    setSessionCompletedIds(prev => prev.filter(id => id !== menu.id));
                                  } else {
                                    setSessionCompletedIds(prev => [...prev, menu.id]);
                                  }
                                }}
                              >
                                {isCompleted && (
                                  <svg className="w-3.5 h-3.5 stroke-[4] stroke-slate-900" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-sm font-display leading-tight ${isActive ? 'font-black' : 'font-bold'}`}>{menu.name}</span>
                                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border shrink-0 ${catColor}`}>
                                    {menu.category === 'tone' && 'トーン'}
                                    {menu.category === 'flexibility' && '柔軟性'}
                                    {menu.category === 'technique' && '技術'}
                                    {menu.category === 'articulation' && '発音'}
                                    {menu.category === 'range' && '音域'}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                                  {totalSubs.length > 0 && (
                                    <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                      サブ練習: {subsCompletedCount}/{totalSubs.length}
                                    </span>
                                  )}
                                  {item.recommendedTempoMin && (
                                    <span className="font-mono bg-slate-250 px-1 rounded text-[10px]">推奨:{item.recommendedTempoMin}-{item.recommendedTempoMax}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {/* If Custom routine, show sorting and deleting controls */}
                              {selectedRoutineType === 'custom' && (
                                <div className="flex items-center gap-0.5 mr-1">
                                  <button
                                    onClick={() => moveCustomRoutineItem(index, 'up')}
                                    disabled={index === 0}
                                    title="上へ移動"
                                    className={`p-1 border border-slate-900/40 rounded hover:bg-slate-100 disabled:opacity-20 ${isActive ? 'bg-amber-300' : 'bg-white'}`}
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => moveCustomRoutineItem(index, 'down')}
                                    disabled={index === selectedRoutine.items.length - 1}
                                    title="下へ移動"
                                    className={`p-1 border border-slate-900/40 rounded hover:bg-slate-100 disabled:opacity-20 ${isActive ? 'bg-amber-300' : 'bg-white'}`}
                                  >
                                    ▼
                                  </button>
                                  <button
                                    onClick={() => removeCustomRoutineItem(item.id, index)}
                                    title="練習メニューから削除"
                                    className="p-1 border border-rose-300 bg-rose-50 text-rose-700 rounded hover:bg-rose-100"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                              
                              {isCompleted && (
                                <span className="text-[9px] font-bold font-mono text-slate-900 bg-emerald-400 border border-slate-900 px-1.5 py-0.5 rounded">記録済</span>
                              )}
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>

                          {/* Nested Sub-Folders / Specific subdivisions checklist (Accordion effect - display if active or sub completed) */}
                          {totalSubs.length > 0 && (
                            <div 
                              className={`border-t pt-2 mt-1 space-y-1.5 pl-6 text-xs transition-all ${
                                isActive ? 'block scale-y-100 opacity-100' : 'hidden md:block opacity-60'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                                📁 種類・サブメニュー (チェックして細分化)
                              </div>
                              <div className="grid grid-cols-1 gap-1">
                                {totalSubs.map((subName) => {
                                  const isSubDone = completedSubs.includes(subName);
                                  return (
                                    <label
                                      key={subName}
                                      className="flex items-center gap-2 py-1 pr-1 cursor-pointer hover:bg-slate-100/50 rounded transition"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSubDone}
                                        onChange={() => toggleSubItem(menu.id, subName)}
                                        className="rounded border-slate-400 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                                      />
                                      <span className={`${isSubDone ? 'line-through text-slate-400' : 'text-slate-700 font-bold'}`}>
                                        {subName}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Motivational Quote at bottom of checklist */}
                <div className="mt-4 p-4 rounded bg-white border-2 border-slate-900 text-xs text-slate-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 inline-block mr-1 align-sub" />
                  <span className="font-bold text-slate-900">ワンポイント: </span>
                  トランペットの基礎練習で最も重要なのは毎日の継続と、「どんな音色を出したいか」イメージし、自分の音を耳でしっかり聴くことです。
                </div>

              </div>

              {/* Right Side: Active item details & inputs */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
                
                {/* Section header containing selected exercise info */}
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        練習メニュー実行中 ({activeItemIndex + 1} / {selectedRoutine.items.length})
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mt-2">{activeMenu.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-prose">{activeMenu.description}</p>
                    </div>


                  </div>

                  {/* Purpose list */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700 block">練習目標・効果</span>
                      <span className="text-slate-600">{activeMenu.purpose}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-amber-700">プロのコツ</span>
                      <span className="text-slate-600">{activeMenu.tips}</span>
                    </div>
                  </div>
                </div>

                {/* Practice Plan & Checklist Subitem Editor (各練習プランの編集パネル) */}
                <div className="bg-amber-50/40 p-4 border-2 border-slate-900 rounded-xl space-y-3.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings2 className="h-4 w-4 text-slate-700" />
                      <span>各練習プランの構成・時間の編集設定</span>
                    </h4>
                    {selectedRoutineType === 'custom' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        編集可能モード中
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        プリセット閲覧中
                      </span>
                    )}
                  </div>

                  {selectedRoutineType === 'custom' ? (
                    <div className="space-y-4 text-xs">
                      {/* 1. Target minutes & target tempos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5 bg-white p-2.5 rounded border border-slate-200">
                          <label className="font-bold text-slate-700 block">⏱️ 練習の目標時間</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const curr = activeRoutineItem?.targetMinutes || 1;
                                updateActiveCustomItem({ targetMinutes: Math.max(1, curr - 1) });
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 active:scale-95 border rounded font-bold text-slate-700"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={activeRoutineItem?.targetMinutes || 5}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                updateActiveCustomItem({ targetMinutes: Math.max(1, val) });
                              }}
                              className="w-14 text-center font-mono font-bold p-1 border rounded bg-white"
                            />
                            <span className="text-slate-700 font-bold">分間</span>
                            <button
                              type="button"
                              onClick={() => {
                                const curr = activeRoutineItem?.targetMinutes || 1;
                                updateActiveCustomItem({ targetMinutes: curr + 1 });
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 active:scale-95 border rounded font-bold text-slate-705"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 bg-white p-2.5 rounded border border-slate-200">
                          <label className="font-bold text-slate-705 block">⚡ 目標推奨テンポ (BPM)</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="30"
                              max="250"
                              value={activeRoutineItem?.recommendedTempoMin || 60}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 60;
                                updateActiveCustomItem({ recommendedTempoMin: val });
                              }}
                              className="w-16 text-center font-mono font-bold p-1 border rounded bg-white"
                              placeholder="最小"
                            />
                            <span className="text-slate-400 font-bold">~</span>
                            <input
                              type="number"
                              min="30"
                              max="250"
                              value={activeRoutineItem?.recommendedTempoMax || 120}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 120;
                                updateActiveCustomItem({ recommendedTempoMax: val });
                              }}
                              className="w-16 text-center font-mono font-bold p-1 border rounded bg-white"
                              placeholder="最大"
                            />
                            <span className="text-slate-650 font-mono text-[10px]">BPM</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Checklist items subdivisions editor */}
                      <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center pb-1 border-b border-dashed">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            📁 細分化チェックリスト（サブ項目）の管理
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            現在: {(activeRoutineItem?.selectedSubItems || []).length} 件
                          </span>
                        </div>

                        {/* List of sub-items */}
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {(activeRoutineItem?.selectedSubItems || []).map((subName: string, subIdx: number) => (
                            <div key={subIdx} className="flex items-center justify-between p-1.5 bg-slate-50 border rounded text-[11px] font-bold">
                              <span className="text-slate-800 truncate pr-2">
                                {subIdx + 1}. {subName}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (subIdx === 0) return;
                                    const list = [...(activeRoutineItem.selectedSubItems)];
                                    const tmp = list[subIdx];
                                    list[subIdx] = list[subIdx - 1];
                                    list[subIdx - 1] = tmp;
                                    updateActiveCustomItem({ selectedSubItems: list });
                                  }}
                                  disabled={subIdx === 0}
                                  className="p-1 px-1.5 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-20"
                                  title="上へ"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...(activeRoutineItem.selectedSubItems)];
                                    if (subIdx === list.length - 1) return;
                                    const tmp = list[subIdx];
                                    list[subIdx] = list[subIdx + 1];
                                    list[subIdx + 1] = tmp;
                                    updateActiveCustomItem({ selectedSubItems: list });
                                  }}
                                  disabled={subIdx === (activeRoutineItem.selectedSubItems || []).length - 1}
                                  className="p-1 px-1.5 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-20"
                                  title="下へ"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (activeRoutineItem.selectedSubItems || []).filter((_: any, idx: number) => idx !== subIdx);
                                    updateActiveCustomItem({ selectedSubItems: list });
                                  }}
                                  className="p-1 hover:bg-rose-100 text-rose-600 rounded"
                                  title="削除"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {(activeRoutineItem?.selectedSubItems || []).length === 0 && (
                            <div className="text-center py-4 text-slate-400 text-[11px]">
                              サブ項目がありません。下から追加してください。
                            </div>
                          )}
                        </div>

                        {/* Add subitem form */}
                        <div className="flex gap-2 pt-1 border-t border-dashed">
                          <input
                            type="text"
                            placeholder="（例）ハ長調 3度上下、5拍ホールド、等"
                            value={newSubItemText}
                            onChange={(e) => setNewSubItemText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (!newSubItemText.trim()) return;
                                const currentList = activeRoutineItem?.selectedSubItems || [];
                                updateActiveCustomItem({ selectedSubItems: [...currentList, newSubItemText.trim()] });
                                setNewSubItemText('');
                              }
                            }}
                            className="flex-1 text-[11px] p-2 border-2 border-slate-900 rounded bg-white shadow-sm font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newSubItemText.trim()) return;
                              const currentList = activeRoutineItem?.selectedSubItems || [];
                              updateActiveCustomItem({ selectedSubItems: [...currentList, newSubItemText.trim()] });
                              setNewSubItemText('');
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold border-2 border-slate-900 px-3 py-1.5 rounded transition-all text-xs flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3 stroke-[3]" />
                            <span>追加</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs p-1 space-y-3.5">
                      <p className="text-slate-600 leading-relaxed font-bold">
                        ※ 現在、標準基礎メニュー「{selectedRoutine.name}」を使用中のため、項目は固定されています。ご自身に合わせた目標時間・推奨テンポ、細分化チェックリスト（サブ項目）の追加・削除などのカスタマイズ編集をされたい場合は、以下のボタンを押してください。
                      </p>
                      
                      <button
                        type="button"
                        onClick={handleCopyToCustom}
                        className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <span>📋 現在のプランをカスタムにコピーして自由に編集する</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub-grid of controls (Timer & Tempo & Metronome) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Container A: Practice Timer & Metronome indicator */}
                  <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase">
                        <Timer className="h-4 w-4 text-amber-400" />
                        <span>練習用タイマー</span>
                      </div>
                      
                      {/* Beat Dot Indicator flashing with Tempo */}
                      {isMetronomeRunning && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-amber-400 animate-pulse font-mono font-bold">BEAT</span>
                          <div 
                            className={`h-3 w-3 rounded-full transition-all duration-75 ${
                              metronomeFlash ? 'bg-amber-400 scale-125 ring-4 ring-amber-400/20' : 'bg-amber-900 scale-100'
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Big elapsed training timer */}
                    <div className="text-center py-2">
                      <div className="text-4xl font-mono tracking-widest font-extrabold text-white">
                        {formatTime(timerSeconds)}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        ※ 練習時間を自動計測しています
                      </span>
                    </div>

                    {/* Timer controls */}
                    <div className="flex gap-2">
                      <button
                        id="btn-timer-toggle"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                          isTimerRunning 
                            ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        <span>{isTimerRunning ? '一時停止' : 'タイマースタート'}</span>
                      </button>
                      <button
                        id="btn-timer-reset"
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(0);
                        }}
                        className="py-2 px-3 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        title="タイマーリセット"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Container B: Tempo & Metronome Engine */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1">
                        <Gauge className="h-4 w-4 text-emerald-600" />
                        テンポ設定 (BPM)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">推奨: 60-120</span>
                    </div>

                    {/* Tempo controls */}
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        onClick={() => incrementTempo(-5)}
                        className="w-10 h-10 flex items-center justify-center font-extrabold rounded-lg bg-white border border-slate-300 text-slate-700 text-lg hover:bg-slate-100 transition shadow-sm active:scale-95"
                      >
                        -5
                      </button>
                      <button 
                        onClick={() => incrementTempo(-1)}
                        className="w-8 h-8 flex items-center justify-center font-bold rounded-lg bg-white border border-slate-300 text-slate-700 text-sm hover:bg-slate-100 transition shadow-sm active:scale-95"
                      >
                        -1
                      </button>
                      
                      <div className="text-center px-2">
                        <span className="text-3xl font-mono font-extrabold text-slate-900 block leading-none">
                          {currentTempo}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 block">BPM</span>
                      </div>

                      <button 
                        onClick={() => incrementTempo(1)}
                        className="w-8 h-8 flex items-center justify-center font-bold rounded-lg bg-white border border-slate-300 text-slate-700 text-sm hover:bg-slate-100 transition shadow-sm active:scale-95"
                      >
                        +1
                      </button>
                      <button 
                        onClick={() => incrementTempo(5)}
                        className="w-10 h-10 flex items-center justify-center font-extrabold rounded-lg bg-white border border-slate-300 text-slate-700 text-lg hover:bg-slate-100 transition shadow-sm active:scale-95"
                      >
                        +5
                      </button>
                    </div>

                    {/* Metronome Rhythm Subdivision Selection */}
                    <div className="border-t border-slate-200/80 pt-2 pb-1 text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">リズムの刻み (拍分割)</span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: '4分', value: 1, desc: '♩ 1拍に1回' },
                          { label: '8分', value: 2, desc: '♪ 1拍に2回 (裏拍あり)' },
                          { label: '3連', value: 3, desc: '3連符 1拍に3回' },
                          { label: '16分', value: 4, desc: '♬ 1拍に4回 (高速連符)' },
                        ].map((sub) => (
                          <button
                            key={sub.value}
                            type="button"
                            onClick={() => {
                              setMetronomeSubdivision(sub.value);
                              tickCounterRef.current = 0;
                            }}
                            className={`py-1 text-[11px] font-bold rounded border-2 transition-all ${
                              metronomeSubdivision === sub.value
                                ? 'bg-amber-400 border-slate-900 text-slate-900 font-extrabold shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]'
                                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                            title={sub.desc}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Metronome Sound toggle */}
                    <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-xs">
                      <button
                        id="btn-metronome-toggle"
                        onClick={() => setIsMetronomeRunning(!isMetronomeRunning)}
                        className={`flex items-center gap-1.5 py-1 px-3 rounded-md transition-all font-bold ${
                          isMetronomeRunning 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        <span>メトロノーム: {isMetronomeRunning ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        id="btn-metronome-sound-toggle"
                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-bold ${
                          isAudioEnabled 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                        title={isAudioEnabled ? "音量をミュート" : "クリック音量を有効化"}
                      >
                        {isAudioEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                        <span>{isAudioEnabled ? '音声クリック' : '消音フラッシュ'}</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Training outcome selector & Memos (改善のメモ) */}
                <div className="space-y-4 border-t border-slate-200/80 pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                       1. 今回の出来ばえ評価 (成功・失敗・もう少し)
                    </h4>
                    
                    {/* Horizontal Big Outcome Radio Boxes */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        id="rate-btn-success"
                        type="button"
                        onClick={() => setCurrentRating('success')}
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          currentRating === 'success'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl">🟢</span>
                        <span className="text-xs font-bold">成功できた</span>
                      </button>
                      <button
                        id="rate-btn-needs-improvement"
                        type="button"
                        onClick={() => setCurrentRating('needs_improvement')}
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          currentRating === 'needs_improvement'
                            ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl">🟡</span>
                        <span className="text-xs font-bold">もう少し</span>
                      </button>
                      <button
                        id="rate-btn-fail"
                        type="button"
                        onClick={() => setCurrentRating('fail')}
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          currentRating === 'fail'
                            ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl">🔴</span>
                        <span className="text-xs font-bold">要練習・失敗</span>
                      </button>
                    </div>
                  </div>

                  {/* Note block: how to improve */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                       2. 改善メモ (どうすればさらに改善できるか？)
                    </label>
                    <textarea
                      id="notes-textarea"
                      rows={3}
                      value={currentNotes}
                      onChange={(e) => setCurrentNotes(e.target.value)}
                      placeholder="例：高音のブレスのスピードを少し早くし、喉を詰まらせないように吹いたらC音が綺麗に当たった。腹式での支えを徹底する。"
                      className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Logging Executable CTA button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    id="btn-log-exercise"
                    onClick={handleLogExercise}
                    disabled={isLoggedThisSession && sessionCompletedIds.includes(activeMenu.id)}
                    className={`w-full sm:flex-1 py-3.5 px-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md ${
                      isLoggedThisSession && sessionCompletedIds.includes(activeMenu.id)
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20 hover:shadow-lg active:scale-98'
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>
                      {isLoggedThisSession && sessionCompletedIds.includes(activeMenu.id)
                        ? '本日の練習は記録完了しています' 
                        : 'このメニューの練習を記録する'}
                    </span>
                  </button>
                  
                  {/* Next Step / Navigation within routine sequence */}
                  {selectedRoutine.items.length > 1 && (
                    <button
                      id="btn-next-exercise"
                      onClick={() => {
                        setActiveItemIndex((prev) => (prev + 1) % selectedRoutine.items.length);
                      }}
                      className="w-full sm:w-auto py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 text-sm transition"
                    >
                      次の練習メニューへ ➜
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Custom Overlay Celebration of Completed Routine */}
            {showCelebration && (
              <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center border-2 border-amber-400 shadow-2xl relative animate-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => setShowCelebration(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl shadow-lg ring-4 ring-amber-100">
                    🎺
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">基礎練習ルーティン達成！</h3>
                  <p className="text-slate-500 text-sm mt-1">素晴らしい！本日のすべてのチェックリストを完了しました。</p>

                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100 text-left space-y-2">
                    <span className="text-xs font-bold text-amber-800 uppercase block">練習成果サマリー</span>
                    <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                      <li>実施ルーティン: <span className="font-bold text-slate-900">{selectedRoutine.name}</span></li>
                      <li>記録したメニュー数: <span className="font-bold text-slate-900">{selectedRoutine.items.length} 項目</span></li>
                      <li>実際の総練習時間: <span className="font-bold text-slate-900">約 {selectedRoutine.durationMinutes} 分間</span></li>
                    </ul>
                  </div>

                  <p className="text-xs text-slate-400 mt-4 italic">
                    「毎日の基礎練習こそが、美しいハイトーンと輝かしいサウンドへの唯一の道です。」
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setShowCelebration(false);
                        setActiveTab('dashboard');
                      }}
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition"
                    >
                      進歩グラフを見る
                    </button>
                    <button
                      onClick={() => {
                        setShowCelebration(false);
                      }}
                      className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition"
                    >
                      練習を終える
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: PROGRESS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Real Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">継続練習日数</span>
                  <span className="text-2xl font-bold text-slate-900">{totalPracticeDays} 日間</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                  <Timer className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">累計練習時間</span>
                  <span className="text-2xl font-bold text-slate-900">{totalPracticeMinutes} 分</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">総メニュー記録数</span>
                  <span className="text-2xl font-bold text-slate-900">{totalCount} 回</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">成功率 (できた割合)</span>
                  <span className="text-2xl font-bold text-slate-900">{successRate}%</span>
                </div>
              </div>
              
            </div>

            {/* Main Graphs area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Chart A: Daily training hours over time */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-500" />
                    日々の基礎練習時間の推移 (最近10回の活動日)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">単位: 分</span>
                </div>

                <div className="h-72">
                  {getDailyChartData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getDailyChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                          labelFormatter={(label) => `日付: ${label}`}
                        />
                        <Bar dataKey="minutes" fill="#d97706" radius={[4, 4, 0, 0]} barSize={26} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">データがありません</div>
                  )}
                </div>
              </div>

              {/* Chart B: Tempo progress analyzer */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    メニュー別テンポ (BPM) 向上分析
                  </h3>
                  
                  {/* Select menu drop down */}
                  <select
                    id="chart-menu-filter-select"
                    value={dashboardTempoMenuId}
                    onChange={(e) => setDashboardTempoMenuId(e.target.value)}
                    className="text-xs font-semibold p-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {PRACTICE_MENUS.map((menu) => (
                      <option key={menu.id} value={menu.id}>{menu.name}</option>
                    ))}
                  </select>
                </div>

                <div className="h-72">
                  {getTempoProgressData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getTempoProgressData()} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="tempo" 
                          name="BPM"
                          stroke="#059669" 
                          strokeWidth={3} 
                          dot={{ r: 4, strokeWidth: 1, fill: '#fff' }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400 p-8 text-center bg-slate-50 rounded-xl">
                      選択したメニュー「{PRACTICE_MENUS.find(m => m.id === dashboardTempoMenuId)?.name}」の過去ログがまだありません。練習を記録して測定してみましょう！
                    </div>
                  )}
                </div>
              </div>

              {/* Chart C: Success Rate Ratio Distribution (Pie Chart) */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-slate-500" />
                  練習難易度・成果バランス分布
                </h3>

                <div className="h-64 flex flex-col md:flex-row items-center justify-around gap-4">
                  {totalCount > 0 ? (
                    <>
                      <div className="w-1/2 h-full min-h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: '成功 (できた)', value: successCount, color: '#10b981' },
                                { name: 'もう少し', value: needsImpCount, color: '#f59e0b' },
                                { name: '要練習・失敗', value: failCount, color: '#f43f5e' }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              <Cell fill="#10b981" />
                              <Cell fill="#f59e0b" />
                              <Cell fill="#f43f5e" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3 shrink-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-slate-700">成功 (やりきった): <span className="font-mono text-slate-900 font-bold">{successCount}回</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                          <span className="font-semibold text-slate-700">もう少し (惜しい): <span className="font-mono text-slate-900 font-bold">{needsImpCount}回</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
                          <span className="font-semibold text-slate-700">失敗 (課題残り): <span className="font-mono text-slate-900 font-bold">{failCount}回</span></span>
                        </div>
                        <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-[200px]">
                          ※ 成功率が100%に近すぎる場合はテンポや音域の上限を高めに設定し、80%前後を目指して負荷を調整すると効率的に上達します。
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">データがありません</div>
                  )}
                </div>
              </div>

              {/* Notebook area: Recent notes & improvements log */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-1.5 text-amber-900/90">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    自己客観化ノート (直近の改善メモ一覧)
                  </h3>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {logs.filter(l => l.notes.trim() !== '').slice(0, 6).map((log) => (
                      <div key={log.id} className="p-3 bg-slate-50 rounded-lg text-xs border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span className="font-bold text-slate-700">{log.menuName}</span>
                          <span>{log.date} @ {log.tempo} BPM</span>
                        </div>
                        <p className="text-slate-600 italic">「{log.notes}」</p>
                      </div>
                    ))}
                    {logs.filter(l => l.notes.trim() !== '').length === 0 && (
                      <div className="text-xs text-slate-400 text-center py-8">
                        まだ改善点や気づき（メモ）が記録されていません。練習時に「どうすれば改善できたか」を一言書いて保存しましょう。
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    <strong>上達のコツ:</strong> 練習を失敗した際「なぜ失敗したか（腹の力抜け、唇の押し付けなど）」と「どうやって解決したか」をメモ言語化することで、脳に正しい動作回路が定着しやすくなります。
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: TRUMPET HISTORY & DIRECT MANUAL LOG ADDER */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Manual entry form */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                <Plus className="h-5 w-5 text-amber-600" />
                個別に練習記録を直接追加
              </h3>
              
              <form onSubmit={handleAddManualLog} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">練習メニュー</label>
                  <select
                    id="manual-menu-select"
                    value={manualMenuId}
                    onChange={(e) => setManualMenuId(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {PRACTICE_MENUS.map((menu) => (
                      <option key={menu.id} value={menu.id}>{menu.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">テンポ (BPM)</label>
                    <input
                      id="manual-tempo-input"
                      type="number"
                      min={30}
                      max={240}
                      value={manualTempo}
                      onChange={(e) => setManualTempo(Number(e.target.value))}
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">練習時間 (分・目安)</label>
                    <input
                      id="manual-duration-input"
                      type="number"
                      min={1}
                      max={120}
                      value={manualDuration}
                      onChange={(e) => setManualDuration(Number(e.target.value))}
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <label className="text-xs font-bold text-slate-500 block">日付</label>
                  <input
                    id="manual-date-input"
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">評価</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'success', label: '成功', icon: '🟢' },
                      { key: 'needs_improvement', label: 'もう少し', icon: '🟡' },
                      { key: 'fail', label: '失敗', icon: '🔴' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        id={`manual-rate-btn-${item.key}`}
                        type="button"
                        onClick={() => setManualRating(item.key as SkillLevelRating)}
                        className={`py-2 px-1 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 ${
                          manualRating === item.key
                            ? 'bg-amber-100 border-amber-600 text-amber-900 ring-1 ring-amber-500/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">改善メモ・気づき</label>
                  <textarea
                    id="manual-notes-textarea"
                    rows={4}
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="気づいた姿勢・アンブシュア（唇・喉の状態）、息の使い方をメモ"
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <button
                  id="btn-add-manual-log"
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  記録を追加
                </button>
              </form>
            </div>

            {/* Right Box: Scrollable logs table */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <History className="h-5 w-5 text-amber-600" />
                  これまでの練習記録履歴 ({logs.length}件)
                </h3>
                
                {/* Clear All button */}
                <button
                  id="btn-delete-all-logs"
                  onClick={() => {
                    if (confirm('すべての練習記録を消去して初期状態に戻しますか？')) {
                      setLogs(generateMockLogs());
                    }
                  }}
                  className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded hover:bg-rose-100 transition"
                  title="すべての履歴をリセット"
                >
                  データをリセット(初期化)
                </button>
              </div>

              {/* Logs Table/List wrapper */}
              <div className="space-y-6 max-h-[580px] overflow-y-auto pr-1">
                {Object.keys(getLogsGroupedByDate()).length > 0 ? (
                  Object.entries(getLogsGroupedByDate()).map(([dateStr, dateLogs]) => (
                    <div key={dateStr} className="space-y-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                        <span className="font-mono text-xs font-black text-slate-850 bg-amber-100 border-2 border-slate-900 px-2 py-0.5 rounded">
                          📅 {dateStr}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          (練習: {dateLogs.length}件)
                        </span>
                      </div>
                      
                      <div className="space-y-2 pl-1">
                        {dateLogs.map((log) => {
                          const ratingColor = getRatingColor(log.rating);
                          return (
                            <div 
                              key={log.id} 
                              className="p-3.5 rounded-xl border-2 border-slate-900 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                            >
                              <div className="space-y-1 sm:flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900">{log.menuName}</span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-${ratingColor}-50 text-${ratingColor}-700 border border-${ratingColor}-100`}>
                                    {getRatingLabel(log.rating)}
                                  </span>
                                  
                                  {/* Render subItems checked if exists */}
                                  {log.completedSubItems && log.completedSubItems.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1 w-full">
                                      {log.completedSubItems.map(sub => (
                                        <span key={sub} className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-bold">
                                          ✓ {sub}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {log.notes && (
                                  <p className="text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200/60 mt-1.5">
                                    「{log.notes}」
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap md:flex-col items-center md:items-end gap-3 md:gap-1 shrink-0 text-[11px] font-mono text-slate-400">
                                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  テンポ: {log.tempo} BPM
                                </span>
                                <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                                  時間: {log.durationMinutes}分
                                </span>
                                <button
                                  id={`delete-btn-${log.id}`}
                                  onClick={() => handleDeleteLog(log.id)}
                                  className="text-rose-500 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 p-1 rounded-md transition"
                                  title="記録削除"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    練習記録がまだ登録されていません。上のフォームからか、「本日の基礎練習」タブでチェックリストを実行してください！
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: ENCYCLOPEDIA GLOSSARY OF EXERCISES */}
        {activeTab === 'glossary' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5.5 w-5.5 text-amber-600" />
                トランペット基礎練習メニュー図鑑
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                トランペットの上達に必要な主要練習メニューの位置づけ、意義、重要性について学びましょう。
                正しい物理メカニズムを理解して行うことで、脳と唇のコーディネーションが促進されます。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRACTICE_MENUS.map((menu) => {
                let catBadge = "";
                let cardBorder = "border-slate-100 hover:border-slate-200";
                
                if (menu.category === 'tone') {
                  catBadge = "ロングトーン・トーン生成系";
                } else if (menu.category === 'flexibility') {
                  catBadge = "音の移行・リップスラー系";
                } else if (menu.category === 'technique') {
                  catBadge = "正確性・指慣らし系";
                } else if (menu.category === 'articulation') {
                  catBadge = "アタック・タンギング系";
                } else if (menu.category === 'range') {
                  catBadge = "音域拡大・ハイトーン系";
                }

                return (
                  <div 
                    key={menu.id} 
                    id={`glossary-card-${menu.id}`}
                    className={`bg-white rounded-2xl p-5 shadow-sm border ${cardBorder} flex flex-col justify-between space-y-4`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">
                          {catBadge}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{menu.name}</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{menu.description}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/40">
                        <span className="font-bold text-slate-800 block mb-0.5">主な目的</span>
                        <span className="text-slate-600">{menu.purpose}</span>
                      </div>
                      <div className="bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-100">
                        <span className="font-bold text-amber-800 flex items-center gap-0.5 mb-0.5">
                          <Lightbulb className="w-3.5 h-3.5" /> 練習の極意・注意点
                        </span>
                        <span>{menu.tips}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* Styled Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© 2026 トランペット基礎練習記録アプリ - 毎日の努力が黄金のサウンドを創り上げる 🎺</p>
          <p className="font-mono text-[10px]">
             Designed for perfectionism. Local persistence active.
          </p>
        </div>
      </footer>
    </div>
  );
}
