import { Calendar, Target, Award, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseData } from '../hooks/useSupabaseData';

export default function Overview() {
  const { alunoData } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: provas } = useSupabaseData<any>('provas');
  const { data: questoesRespondidas, loading: loadingQuestoes } = useSupabaseData<any>('questoes_respondidas');
  const { data: materiais, loading: loadingMateriais } = useSupabaseData<any>('materiais');

  const today = new Date();

  // Dados reais do Supabase para dias de estudo, baseados em 'questoes_respondidas'
  const sessionsByDay = useMemo(() => {
    const map = new Map<string, { date: Date; sessions: number }>();

    questoesRespondidas?.forEach((item: any) => {
      if (!item.created_at) return;
      const date = new Date(item.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      const existing = map.get(key);
      if (existing) {
        existing.sessions += 1;
      } else {
        map.set(key, { date, sessions: 1 });
      }
    });

    return map;
  }, [questoesRespondidas]);

  const studyDays = useMemo(() => Array.from(sessionsByDay.values()), [sessionsByDay]);

  const getWeekDays = () => {
    const currentDayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const sessions = sessionsByDay.get(key)?.sessions || 0;

      days.push({
        dayOfWeek: i,
        date,
        sessions,
        isToday: date.toDateString() === today.toDateString(),
        isFuture: date > today
      });
    }
    return days;
  };
  

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getNextExam = () => {
    if (!provas || provas.length === 0) return null;
    
    const futureExams = provas
      .filter((p: any) => new Date(p.data_prova) > today)
      .sort((a: any, b: any) => new Date(a.data_prova).getTime() - new Date(b.data_prova).getTime());
    
    if (futureExams.length === 0) return null;
    
    const nextExam = futureExams[0];
    const diffTime = new Date(nextExam.data_prova).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { materia: nextExam.materia, dias: diffDays, nome: nextExam.nome };
  };

  const subjectProgress = useMemo(() => {
    const progressMap = new Map<string, { acertos: number; total: number }>();
    questoesRespondidas?.forEach((q: any) => {
      const disciplina = q.disciplina || 'Sem disciplina';
      const entry = progressMap.get(disciplina) || { acertos: 0, total: 0 };
      entry.total += 1;
      if (q.acertou) entry.acertos += 1;
      progressMap.set(disciplina, entry);
    });

    return Array.from(progressMap.entries())
      .map(([disciplina, stats]) => ({
        disciplina,
        total: stats.total,
        acertos: stats.acertos,
        percentual: stats.total > 0 ? Math.round((stats.acertos / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [questoesRespondidas]);

  const totalQuestoesResolvidas = questoesRespondidas?.length || 0;
  const acertos = questoesRespondidas?.filter(q => q.acertou)?.length || 0;
  const taxaAcerto = totalQuestoesResolvidas > 0 ? Math.round((acertos / totalQuestoesResolvidas) * 100) : 0;
  const resumosGerados = materiais?.length || 0;

  const studySuggestion = subjectProgress.length > 0 ? `Revisar ${subjectProgress[0].disciplina}` : null;

  const nextExam = getNextExam();
  const studiedDaysThisMonth = studyDays.filter(d => d.date.getMonth() === currentMonth.getMonth() && d.date.getFullYear() === currentMonth.getFullYear()).length;

  const weekDays = useMemo(() => getWeekDays(), [studyDays]);
  const studiedDaysThisWeek = weekDays.filter(d => d.sessions > 0 && !d.isFuture).length;
  const maxSessionsWeek = Math.max(...weekDays.map(d => d.sessions), 5); // mínimo de 5 pra escala
  
  // Animação de entrada
  const [chartLoaded, setChartLoaded] = useState(false);
  useEffect(() => {
    setChartLoaded(true);
  }, []);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const studyData = studyDays.find(d => 
        d.date.getDate() === day && 
        d.date.getMonth() === month && 
        d.date.getFullYear() === year
      );
      
      days.push({
        day,
        date,
        sessions: studyData?.sessions || 0,
        isToday: date.toDateString() === today.toDateString(),
        isFuture: date > today
      });
    }

    return days;
  };

  const monthDays = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
          {getGreeting()}, {alunoData?.nome?.split(' ')[0] || 'Estudante'}!
        </h1>
        <p className="text-zinc-400 text-sm">Acompanhe seu progresso e próximos desafios.</p>
      </div>

      {/* Alertas */}
      <div className="space-y-3">
        {nextExam && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-400 font-medium">Próxima prova em {nextExam.dias} dias</p>
                <p className="text-red-300 text-sm">{nextExam.materia} - {nextExam.nome}</p>
              </div>
            </div>
          </div>
        )}

        {studySuggestion && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-blue-400 font-medium">Sugestão de estudo hoje</p>
                <p className="text-blue-300 text-sm">{studySuggestion}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Questões Resolvidas',
            value: loadingQuestoes ? '...' : totalQuestoesResolvidas.toString(),
            icon: Target,
            trend: loadingQuestoes ? 'Carregando...' : 'Base real de respostas'
          },
          {
            title: 'Taxa de Acerto',
            value: loadingQuestoes ? '...' : `${taxaAcerto}%`,
            icon: Award,
            trend: loadingQuestoes ? 'Carregando...' : 'Cálculo do acerto real'
          },
          {
            title: 'Resumos Gerados',
            value: loadingMateriais ? '...' : resumosGerados.toString(),
            icon: Clock,
            trend: loadingMateriais ? 'Carregando...' : 'Total no Supabase'
          },
          {
            title: 'Próxima Prova',
            value: nextExam ? `${nextExam.dias} dias` : 'Nenhuma',
            icon: Calendar,
            trend: nextExam?.materia || 'Agendada'
          },
        ].map((metric, i) => (
          <div key={i} className="bg-[#202024] border border-zinc-800 rounded-xl p-5 hover:border-yellow-500/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-sm font-medium">{metric.title}</span>
              <div className="p-2 bg-[#121214] rounded-md group-hover:bg-yellow-500/10 transition-colors">
                <metric.icon className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-zinc-50">{metric.value}</span>
              <span className="text-xs text-yellow-500">{metric.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendário Mensal */}
        <div className="lg:col-span-2 bg-[#202024] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">Calendário de Estudos</h2>
              <p className="text-zinc-400 text-sm">{studiedDaysThisMonth} dias estudados este mês</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-[#121214] rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-zinc-50 font-medium min-w-[140px] text-center capitalize">
                {monthName}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-[#121214] rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-xs text-zinc-500 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((dayData, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all cursor-pointer
                  ${!dayData 
                    ? 'bg-transparent' 
                    : dayData.isFuture
                      ? 'bg-[#121214] text-zinc-600 hover:bg-[#1a1a1e]'
                      : dayData.sessions > 0
                        ? 'bg-[#c9a84c]/20 text-[#c9a84c] border-2 border-[#c9a84c]/30 hover:bg-[#c9a84c]/30'
                        : 'bg-[#121214] text-zinc-400 hover:bg-[#1a1a1e]'
                  }
                  ${dayData?.isToday ? 'ring-2 ring-[#c9a84c] ring-offset-2 ring-offset-[#202024]' : ''}
                `}
                title={dayData && dayData.sessions > 0 ? `${dayData.sessions} sessões de estudo` : undefined}
              >
                {dayData?.day}
              </div>
            ))}
          </div>
        </div>
        {nextExam && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-400 font-medium">Próxima prova em {nextExam.dias} dias</p>
                <p className="text-red-300 text-sm">{nextExam.materia}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-blue-400 font-medium">Sugestão de estudo hoje</p>
              <p className="text-blue-300 text-sm">Que tal revisar {studySuggestion}?</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards - Removing Duplicate (since it was duplicated in original file!) */}
      {/* (Duplicated metric cards intentionally removed) */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Chart Section */}
        <div className="lg:col-span-2 bg-[#202024] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">Desempenho da Semana</h2>
              <p className="text-zinc-400 text-sm">{studiedDaysThisWeek} dias estudados essa semana</p>
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-48 mt-8 pt-4 border-t border-zinc-800/50">
            {weekDays.map((day, i) => {
              const heightPercent = day.sessions > 0 
                ? Math.max((day.sessions / maxSessionsWeek) * 100, 15)
                : 0;
              
              return (
                <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
                  <div 
                    className={`
                      w-full max-w-[40px] rounded-t-sm transition-all duration-1000 ease-out relative cursor-pointer
                      ${day.sessions > 0 ? 'bg-[#c9a84c]' : 'bg-[#121214]'}
                      ${day.isToday ? 'border-x border-t border-[#c9a84c] shadow-[0_0_10px_rgba(201,168,76,0.2)] ring-1 ring-[#c9a84c] ring-offset-2 ring-offset-[#202024]' : ''}
                      ${!day.isFuture && day.sessions === 0 ? 'hover:bg-[#1a1a1e]' : ''}
                      ${day.sessions > 0 ? 'hover:brightness-110' : ''}
                    `}
style={{ height: chartLoaded ? `${heightPercent}%` : '0%' }}                  >
                    {/* Tooltip */}
                    {day.sessions > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-zinc-700">
                        {day.sessions} sessões estudadas
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${day.isToday ? 'text-zinc-50' : 'text-zinc-500'}`}>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day.dayOfWeek]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progresso por Matéria */}
        <div className="bg-[#202024] border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-50 mb-6">Progresso por Matéria</h2>
          <div className="space-y-6">
            {subjectProgress.length === 0 ? (
              <div className="text-center text-zinc-400">Nenhum progresso por matéria registrado ainda.</div>
            ) : (
              subjectProgress.map((item) => (
                <div key={item.disciplina}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-300">{item.disciplina}</span>
                    <span className="text-sm font-bold text-green-500">{item.percentual}%</span>
                  </div>
                  <div className="w-full bg-[#121214] border border-zinc-800 rounded-full h-2">
                    <div
                      className="bg-green-500 h-1.5 mt-px ml-px rounded-full"
                      style={{ width: `${item.percentual}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
