import { useState } from 'react';
import { MessageSquare, Bot, User, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HistoricoWhatsApp() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const mensagens: Array<{ id: number; sender: 'bot' | 'user'; text: string; time: string; date: string }> = [];

  const CustomDateInput = ({ onClick }: any) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#202024] border border-zinc-800 hover:border-yellow-500/50 transition-colors"
    >
      <Calendar className="w-4 h-4 text-zinc-400" />
      <span className="text-sm text-zinc-50 font-medium">
        {selectedDate ? format(selectedDate, "dd 'de' MMM", { locale: ptBR }) : 'Hoje'}
      </span>
    </button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-500" />
            Histórico do WhatsApp
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Revise todas as conversas e aulas que você teve com a IA pelo celular.</p>
        </div>
        <div className="relative">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            customInput={<CustomDateInput />}
            dateFormat="dd/MM/yyyy"
            locale={ptBR}
            maxDate={new Date()}
            popperClassName="dark-calendar"
          />
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-[#202024] border border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-[#121214] flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/30">
              <Bot className="w-6 h-6 text-yellow-500" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121214] rounded-full"></span>
          </div>
          <div>
            <h2 className="text-white font-medium">LexIA Bot</h2>
            <p className="text-xs text-green-500">Online e sincronizado</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent">
          {mensagens.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12 text-zinc-400 border-2 border-dashed border-zinc-700 rounded-xl">
              <MessageSquare className="w-12 h-12 text-zinc-500 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">Nenhuma conversa ainda</h3>
              <p className="text-sm text-zinc-400">Comece estudando pelo WhatsApp!</p>
            </div>
          ) : (
            mensagens.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={msg.id} className={`flex max-w-2xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isBot ? 'mr-3 bg-yellow-500/10 text-yellow-500' : 'ml-3 bg-[#121214] border border-zinc-800 text-zinc-400'}`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-xl shadow-sm ${
                    isBot 
                      ? 'bg-[#121214] border border-zinc-800 text-zinc-300 rounded-tl-none' 
                      : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-50 rounded-tr-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-2 block ${isBot ? 'text-zinc-500' : 'text-yellow-500/60 text-right'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-4 bg-[#121214] border-t border-zinc-800 mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#202024] border border-zinc-800 rounded-full px-4 py-2.5 text-sm font-medium text-zinc-500 text-center">
              Você só pode interagir com o bot pelo WhatsApp. Este é um modo de visualização.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
