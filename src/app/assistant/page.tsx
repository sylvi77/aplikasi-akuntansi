"use client";

import { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';
import { translations } from '@/lib/translations';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AIAssistant() {
  const { language } = useSettings();
  const t = translations[language];

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t.assistant.listening },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const json = await res.json();

      if (json.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: json.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${json.message}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] md:h-full flex flex-col space-y-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t.assistant.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">KeuanganKu AI</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden transition-colors">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl p-4 flex gap-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                {msg.role === 'assistant' && <Bot size={20} className="shrink-0 mt-1" />}
                {msg.role === 'user' && <User size={20} className="shrink-0 mt-1" />}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                <span>{t.dashboard.loading_ai}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 transition-colors">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.assistant.placeholder}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:bg-blue-400 flex items-center justify-center min-w-[50px]"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
