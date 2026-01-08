
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from './geminiService';
import { Message, Candidate } from './types';
import { fetchSheetData, normalizePhone, isLikelyPhoneNumber } from './utils';

const gemini = new GeminiService();

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "👋 Hello! I'm your Recruitment Assistant at **Evolv Clothing**.\n\nI can help you check your interview status. Please provide the **phone number** you used during your application.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cachedCandidates, setCachedCandidates] = useState<Candidate[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Prefetch data for fallback/efficiency
  useEffect(() => {
    fetchSheetData().then(data => {
      setCachedCandidates(data);
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const performDirectLookup = (phoneNumber: string): string => {
    const normalized = normalizePhone(phoneNumber);
    const match = cachedCandidates.find(c => normalizePhone(c.phone) === normalized);
    
    if (match) {
      return `### Candidate Information (Direct Match)\n- **Name:** ${match.name}\n- **Position:** ${match.position || 'N/A'}\n- **Status:** ${match.status}\n- **Interview Date:** ${match.interviewDate || 'To be scheduled'}\n\n*Note: This information was retrieved via direct secure lookup.*`;
    }
    return `I couldn't find any application matching the phone number **${phoneNumber}**. \n\nIf you believe this is an error, please contact our HR team:\n- **HR:** Vigneshwaran\n- **Phone:** 9344117877\n- **Email:** Careers@evolv clothing`;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      // Try AI first
      const response = await gemini.sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't find that information.", timestamp: new Date() }]);
    } catch (error) {
      console.warn("AI service unavailable, attempting direct fallback check.", error);
      
      // Fallback: If AI fails but input is a phone number, do direct lookup
      if (isLikelyPhoneNumber(userMessage)) {
        const fallbackResponse = performDirectLookup(userMessage);
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `*System Note: The AI assistant is currently experiencing high load. Performing direct lookup...*\n\n${fallbackResponse}`, 
          timestamp: new Date() 
        }]);
      } else if (userMessage.toLowerCase().includes('hr') || userMessage.toLowerCase().includes('contact')) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `You can reach our HR team directly:\n\n- **Name:** Vigneshwaran\n- **Phone:** 9344117877\n- **Email:** Careers@evolv clothing`, 
          timestamp: new Date() 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: "I'm having trouble connecting to my brain right now! 🧠💨\n\nIf you want to check your status, please just type your **phone number** directly and I'll try to find it in our records.", 
          timestamp: new Date() 
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-xl mx-auto bg-gray-50 shadow-2xl relative overflow-hidden font-sans">
      {/* Glossy Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Evolv Interviews</h1>
            <p className="text-xs font-medium text-green-600">Smart Assistant Active</p>
          </div>
        </div>
      </header>

      {/* Main Chat Feed */}
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-1 last:mb-0'}>
                    {line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : part)}
                  </p>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 animate-pulse">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Action Bar */}
      <footer className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your phone number..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-5 pr-14 py-3.5 text-[15px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
           {['Check My Status', 'HR Contact', 'About Evolv'].map((tag) => (
             <button
               key={tag}
               onClick={() => {
                 const text = tag === 'Check My Status' ? 'I want to check my status' : tag;
                 setInput(text);
               }}
               className="whitespace-nowrap px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
             >
               {tag}
             </button>
           ))}
        </div>
      </footer>
    </div>
  );
};

export default App;
