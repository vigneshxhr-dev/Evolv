
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- CONFIGURATION ---
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRepxomgRBDE_pqjpyVhc9oFs9usT02D8CkJRAvdX0hGpZkd2EnXgVRrK1iZFza3yXUGCOtgLTzXt3j/pub?output=csv';
const HR_CONTACT = {
  name: "Vigneshwaran",
  phone: "9344117877",
  email: "Careers@evolv clothing"
};

// --- TYPES ---
interface Candidate {
  name: string;
  phone: string;
  status: string;
  position: string;
  interviewDate: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// --- UTILS ---
const normalizePhone = (phone: string) => phone.replace(/\D/g, '');
const isPhone = (text: string) => {
  const digits = normalizePhone(text);
  return digits.length >= 10 && digits.length <= 13;
};

async function fetchCandidates(): Promise<Candidate[]> {
  try {
    const response = await fetch(SHEET_CSV_URL);
    const csvText = await response.text();
    const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));
    if (rows.length < 2) return [];
    
    const headers = rows[0].map(h => h.toLowerCase());
    return rows.slice(1).map(row => {
      const c: any = {};
      headers.forEach((h, i) => {
        const val = row[i] || '';
        if (h.includes('name')) c.name = val;
        else if (h.includes('phone') || h.includes('contact')) c.phone = normalizePhone(val);
        else if (h.includes('status')) c.status = val;
        else if (h.includes('position')) c.position = val;
        else if (h.includes('date')) c.interviewDate = val;
      });
      return c as Candidate;
    });
  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}

// --- COMPONENTS ---
const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "👋 Hello! I'm your Recruitment Assistant at **Evolv Clothing**.\n\nHow can I help you today? You can check your **Status** or get **HR Contact** details below.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCandidates().then(setCandidates);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const findCandidate = (phone: string) => {
    const target = normalizePhone(phone);
    return candidates.find(c => c.phone === target);
  };

  const processMessage = async (text: string) => {
    const userText = text.trim();
    if (!userText) return;

    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
    setLoading(true);

    try {
      // 1. Direct HR Contact logic
      if (userText.toLowerCase().includes('contact') || userText.toLowerCase().includes('hr')) {
        const res = `📞 **HR Contact Details**\n\n- **Name:** ${HR_CONTACT.name}\n- **Phone:** ${HR_CONTACT.phone}\n- **Email:** ${HR_CONTACT.email}\n\nYou can reach out for any interview-related queries.`;
        setMessages(prev => [...prev, { role: 'model', text: res, timestamp: new Date() }]);
        setLoading(false);
        return;
      }

      // 2. Direct Phone Lookup logic
      if (isPhone(userText)) {
        const match = findCandidate(userText);
        if (match) {
          const res = `✅ **Interview Status Found!**\n\n- **Name:** ${match.name}\n- **Position:** ${match.position || 'N/A'}\n- **Status:** ${match.status}\n- **Date:** ${match.interviewDate || 'To be scheduled'}`;
          setMessages(prev => [...prev, { role: 'model', text: res, timestamp: new Date() }]);
          setLoading(false);
          return;
        } else {
          setMessages(prev => [...prev, { role: 'model', text: "❌ I couldn't find any application for that number. Please double-check your phone number or contact HR.", timestamp: new Date() }]);
          setLoading(false);
          return;
        }
      }

      // 3. AI response for general queries
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: `You are the Evolv Clothing Recruitment Assistant. 
          HR Contact: ${HR_CONTACT.name}, ${HR_CONTACT.phone}.
          If user wants to check status, tell them to provide their 10-digit phone number.
          Be professional and friendly.`
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, can you rephrase that?", timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a technical glitch. Please try again or contact HR directly.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      processMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50 shadow-2xl font-sans relative">
      {/* Header */}
      <header className="bg-indigo-700 p-5 text-white shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-700 font-black shadow-inner">EC</div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">Evolv Careers</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <p className="text-xs opacity-90 font-medium">Assistant Online</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                {m.text.split('**').map((part, i) => i % 2 === 1 ? <b key={i} className="font-bold">{part}</b> : part)}
              </div>
              <div className={`text-[10px] mt-2 opacity-60 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-indigo-400 animate-pulse font-medium px-2">Assistant is typing...</div>}
        <div ref={scrollRef} />
      </div>

      {/* Suggestion Buttons */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-white border-t border-gray-50">
        <button 
          onClick={() => processMessage("Check My Status")}
          className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95"
        >
          🔍 Check Status
        </button>
        <button 
          onClick={() => processMessage("Contact HR")}
          className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95"
        >
          📞 Contact HR
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your phone number here..."
          className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3.5 text-[15px] focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading}
          className="bg-indigo-700 text-white p-3.5 rounded-2xl hover:bg-indigo-800 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-indigo-100 active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
