import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, Loader2 } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { ChatMessage, Wallet, Transaction } from '../types';
import { Chat } from '@google/genai';

interface AICoreProps {
  wallet: Wallet;
  transactions: Readonly<Transaction[]>;
  labels: {
    ask: string;
    greeting: string;
  };
}

const AICore: React.FC<AICoreProps> = ({ wallet, transactions, labels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Chat Session
    if (isOpen && !chatSessionRef.current) {
        initChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const initChat = async () => {
    try {
        const session = await createChatSession(wallet, transactions);
        if (session) {
            chatSessionRef.current = session;
            // Add initial greeting from local constants, not API, to save latency
            setMessages([{
                id: 'init',
                role: 'model',
                text: labels.greeting,
                timestamp: Date.now()
            }]);
        }
    } catch (e) {
        console.error("Failed to init AI", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text;
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Sorry, I couldn't process that.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting to the network right now.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 group transition-all duration-500 ${isOpen ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur opacity-40 group-hover:opacity-60 animate-pulse"></div>
          <div className="w-14 h-14 bg-zinc-900/80 backdrop-blur-md border border-emerald-500/50 rounded-full flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:scale-110">
            <Sparkles className="text-emerald-500 w-6 h-6" />
          </div>
        </div>
      </button>

      {/* Chat Overlay */}
      <div className={`fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-sm transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Bot size={16} className="text-emerald-500" />
             </div>
             <div>
                <h3 className="font-semibold text-white text-sm">XIX Assistant</h3>
                <p className="text-[10px] text-zinc-500">Powered by Gemini</p>
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-sm' 
                  : 'bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-zinc-800 p-3 rounded-2xl rounded-tl-sm border border-zinc-700 flex items-center gap-2">
                 <Loader2 size={14} className="animate-spin text-emerald-500" />
                 <span className="text-xs text-zinc-500">Thinking...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 pb-8">
            <div className="relative">
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={labels.ask}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 rounded-full text-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default AICore;