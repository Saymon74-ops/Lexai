import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Camera, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  type?: 'text' | 'audio' | 'image';
}

export default function Chat() {
  const { alunoData } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    loadConversationHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('conversas')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = data?.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date(msg.created_at),
        type: msg.type || 'text'
      })) || [];

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const saveMessage = async (message: Omit<Message, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('conversas')
        .insert([{
          sender: message.sender,
          text: message.text,
          type: message.type || 'text',
          aluno_id: supabase.auth.getUser().then(({ data }) => data.user?.id)
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (err) {
      console.error('Erro ao salvar mensagem:', err);
    }
  };

  const sendMessage = async (text: string, type: 'text' | 'audio' | 'image' = 'text') => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
      type
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Save user message
    await saveMessage(userMessage);

    try {
      // Simulate Claude API response
      const aiResponse = await simulateAIResponse(text, type);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
      await saveMessage(aiMessage);
    } catch (err) {
      console.error('Erro na resposta da IA:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (message: string, type: string): Promise<string> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    if (type === 'audio') {
      return `Olá! Sou a LexIA, sua assistente especializada em Direito brasileiro. 

Analisando o áudio que você enviou, identifiquei os seguintes tópicos principais:

📋 **Tópicos Principais:**
- Conceitos fundamentais de Direito Constitucional
- Princípios da Administração Pública
- Jurisprudência do STF sobre o tema

❓ **Questões no Estilo do Professor:**
1. Sobre o princípio da legalidade, analise se a atuação da administração pública pode ser considerada válida quando baseada em analogia ou equidade.

2. Discuta a aplicabilidade do princípio da razoabilidade no controle judicial dos atos administrativos.

📖 **Artigos Citados:**
- Art. 37, caput, da Constituição Federal
- Art. 2º da Lei 9.784/1999 (Lei do Processo Administrativo)
- Súmula Vinculante 13 do STF

Precisa de mais detalhes sobre algum desses pontos?`;
    }

    // Simulate contextual responses based on keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('constitucional') || lowerMessage.includes('cf')) {
      return `Olá! Sou a LexIA, especialista em Direito brasileiro.

Sobre Direito Constitucional, a Constituição Federal de 1988 estabelece os princípios fundamentais do nosso ordenamento jurídico. 

**Pontos importantes:**
- Supremacia da Constituição
- Controle de constitucionalidade
- Direitos fundamentais
- Separação de poderes

Você gostaria que eu explicasse algum aspecto específico ou gere questões práticas sobre o tema?`;
    }

    if (lowerMessage.includes('penal') || lowerMessage.includes('crime')) {
      return `Olá! Sou a LexIA, sua assistente jurídica.

No Direito Penal, o Código Penal brasileiro (Decreto-Lei 2.848/1940) define os crimes e suas penas. 

**Princípios fundamentais:**
- Legalidade (nullum crimen sine lege)
- Anterioridade
- Irretroatividade
- Interpretação restritiva

Posso ajudar com algum caso específico ou gerar questões sobre tipos penais?`;
    }

    // Default response
    return `Olá! Sou a LexIA, assistente especializada em Direito brasileiro. 

Entendi sua pergunta sobre "${message}". Como posso ajudar especificamente? 

Posso:
- Explicar conceitos jurídicos
- Gerar questões de prova
- Analisar casos práticos
- Criar resumos de matérias

O que você gostaria de saber?`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Simulate transcription (in real implementation, use Groq Whisper)
      const simulatedTranscription = "Olá LexIA, preciso de ajuda com Direito Constitucional, especificamente sobre os princípios fundamentais da administração pública.";

      // Send simulated transcription to AI
      const aiResponse = await simulateAIResponse(simulatedTranscription, 'audio');

      const userMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: `🎤 Áudio: "${simulatedTranscription}"`,
        timestamp: new Date(),
        type: 'audio'
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
      await saveMessage(userMessage);
      await saveMessage(aiMessage);
    } catch (err) {
      console.error('Erro ao processar áudio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // For now, just send a placeholder message
      // In a real implementation, you'd upload the image and analyze it
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: `📷 Imagem enviada: ${file.name}`,
        timestamp: new Date(),
        type: 'image'
      };

      setMessages(prev => [...prev, userMessage]);
      await saveMessage(userMessage);

      // AI response for image
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Recebi sua imagem. Como posso ajudar com ela?',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
      await saveMessage(aiMessage);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col font-sans">
      <div className="flex flex-col gap-1 mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-green-500" />
          Chat IA
        </h1>
        <p className="text-zinc-400 text-sm">Converse com a LexIA sobre Direito brasileiro</p>
      </div>

      <div className="flex-1 bg-[#202024] border border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12 text-zinc-400">
              <MessageSquare className="w-12 h-12 text-zinc-500 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">Bem-vindo ao Chat IA!</h3>
              <p className="text-sm text-zinc-400">Pergunte sobre Direito brasileiro ou envie áudio/imagem para análise.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex max-w-2xl ${msg.sender === 'ai' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'ai' ? 'mr-3 bg-yellow-500/10 text-yellow-500' : 'ml-3 bg-[#121214] border border-zinc-800 text-zinc-400'}`}>
                  {msg.sender === 'ai' ? '🤖' : '👤'}
                </div>
                <div className={`p-4 rounded-xl shadow-sm ${
                  msg.sender === 'ai'
                    ? 'bg-[#121214] border border-zinc-800 text-zinc-300 rounded-tl-none'
                    : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-50 rounded-tr-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <span className={`text-[10px] mt-2 block ${msg.sender === 'ai' ? 'text-zinc-500' : 'text-yellow-500/60 text-right'}`}>
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex max-w-2xl mr-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 bg-yellow-500/10 text-yellow-500">
                🤖
              </div>
              <div className="p-4 rounded-xl shadow-sm bg-[#121214] border border-zinc-800 text-zinc-300 rounded-tl-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-[#121214] border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-[#202024] border border-zinc-800 rounded-full px-4 py-2.5 text-sm font-medium text-zinc-50 focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2.5 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-black'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <label className="p-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer transition-colors">
              <Camera className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
