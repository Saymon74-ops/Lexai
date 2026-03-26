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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversationHistory();
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
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
      // Call Claude API via Netlify Function
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage], // Include all messages for context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro da API:', response.status, errorData)
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiResponse = data.content;
      
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
        await processAudio();
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

  const processAudio = async () => {
    setIsLoading(true);
    try {
      // Simulate transcription (in real implementation, use Groq Whisper)
      const simulatedTranscription = "Olá LexIA, preciso de ajuda com Direito Constitucional, especificamente sobre os princípios fundamentais da administração pública.";

      const userMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: `🎤 Áudio: "${simulatedTranscription}"`,
        timestamp: new Date(),
        type: 'audio'
      };

      setMessages(prev => [...prev, userMessage]);
      await saveMessage(userMessage);

      // Call Claude API via Netlify Function
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage], // Include all messages for context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro da API:', response.status, errorData)
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiResponse = data.content;

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
      console.error('Erro ao processar áudio:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Desculpe, houve um erro ao processar seu áudio. Tente novamente.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
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
            <div className="relative">
              <button
                onClick={() => setShowImageMenu(!showImageMenu)}
                className="p-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
              {showImageMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#1a1d24] border border-zinc-700 rounded-lg shadow-lg p-2 z-10">
                  <button
                    onClick={() => {
                      cameraInputRef.current?.click();
                      setShowImageMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-[#c9a84c] hover:bg-zinc-700 rounded"
                  >
                    Tirar foto
                  </button>
                  <button
                    onClick={() => {
                      galleryInputRef.current?.click();
                      setShowImageMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-[#c9a84c] hover:bg-zinc-700 rounded"
                  >
                    Escolher da galeria
                  </button>
                </div>
              )}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-full bg-[#c9a84c] hover:bg-[#b8943a] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
