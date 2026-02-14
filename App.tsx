import React, { useState, useRef, useEffect, useCallback } from 'react';
import { initializeChatSession, sendMessageToSession } from './services/geminiService';
import { Message, BugReportData, ChatSession } from './types';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  // --- State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop

  // --- Refs ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const getActiveSession = () => sessions.find(s => s.id === activeSessionId);

  const updateActiveSessionMessages = (newMessages: Message[]) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(session => {
      if (session.id === activeSessionId) {
        // Update title based on first user message if it's currently "New Session"
        let title = session.title;
        if (title === "New Session" && newMessages.length > 1) {
            const firstUserMsg = newMessages.find(m => m.role === 'user');
            if (firstUserMsg) {
                title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
            }
        }
        return { 
          ...session, 
          messages: newMessages, 
          title, 
          updatedAt: Date.now() 
        };
      }
      return session;
    }));
  };

  // --- Actions ---

  const createNewSession = useCallback(() => {
    const newId = generateId();
    const initialMsg: Message = {
      id: 'init-' + Date.now(),
      role: 'model',
      content: "Hello. I am the Life OS Debugger.\n\nMy purpose is to help you detect internal contradictions. To begin, please tell me: where do you feel most stuck right now?",
      type: 'text',
      timestamp: Date.now()
    };

    const newSession: ChatSession = {
      id: newId,
      title: "New Session",
      messages: [initialMsg],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    initializeChatSession(newId, [initialMsg]);
    
    // On mobile, close sidebar when creating new chat
    if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
  }, []);

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      // Re-initialize the service with history to ensure context is restored
      initializeChatSession(sessionId, session.messages);
      // On mobile, close sidebar after selection
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions(prev => {
        const newSessions = prev.filter(s => s.id !== sessionId);
        if (activeSessionId === sessionId) {
            // If we deleted the active one, switch to the first available or create new
            if (newSessions.length > 0) {
                setActiveSessionId(newSessions[0].id);
                initializeChatSession(newSessions[0].id, newSessions[0].messages);
            } else {
                // Will trigger useEffect to create new
                setActiveSessionId(null);
            }
        }
        return newSessions;
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || loading || !activeSessionId) return;

    const currentSession = getActiveSession();
    if (!currentSession) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      type: 'text',
      timestamp: Date.now()
    };

    // Optimistic update
    const updatedMessages = [...currentSession.messages, userMsg];
    updateActiveSessionMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      const responseText = await sendMessageToSession(activeSessionId, userMsg.content);
      let responseMsg: Message;

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.type === 'analysis_complete' && parsed.data) {
                const reportData: BugReportData = parsed.data;
                responseMsg = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    content: 'Analysis Complete.',
                    type: 'bug_report',
                    reportData: reportData,
                    timestamp: Date.now()
                };
            } else {
                 throw new Error("Not a report");
            }
        } else {
             throw new Error("No JSON found");
        }
      } catch (parseError) {
        responseMsg = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText || "System error: Empty response.",
          type: 'text',
          timestamp: Date.now()
        };
      }

      updateActiveSessionMessages([...updatedMessages, responseMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Connection to diagnostic core failed.",
        type: 'text',
        timestamp: Date.now()
      };
      updateActiveSessionMessages([...updatedMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---

  // Initialize first session if none exists
  useEffect(() => {
    if (sessions.length === 0 && !activeSessionId) {
      createNewSession();
    }
  }, [sessions.length, activeSessionId, createNewSession]);

  // Scroll logic
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSessionId, loading, getActiveSession()?.messages.length]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isDistanceFromBottom = scrollHeight - scrollTop - clientHeight > 200;
      setShowScrollButton(isDistanceFromBottom);
    }
  };

  // Focus input
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading, activeSessionId]);

  const activeMessages = getActiveSession()?.messages || [];

  return (
    <div className="h-screen bg-brand-bg text-brand-text font-sans flex overflow-hidden relative selection:bg-brand-primary selection:text-white">
      
      {/* Background Ambient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-primary/5 rounded-full blur-[100px]"></div>
         <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-[100px]"></div>
      </div>

      {/* SIDEBAR */}
      <div 
        className={`
          fixed md:relative z-40 h-full flex-none bg-[#0a0f1e]/95 md:bg-[#0a0f1e]/50 backdrop-blur-xl border-r border-white/5 
          transition-all duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:-translate-x-0'}
        `}
      >
        <div className="flex-none p-4 border-b border-white/5 flex items-center justify-between overflow-hidden whitespace-nowrap">
           <span className="font-semibold tracking-tight text-white/90">Sessions</span>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-brand-muted">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
           <button 
             onClick={createNewSession}
             className="w-full flex items-center gap-3 p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary/20 transition-all group mb-4"
           >
              <div className="p-1 rounded-md bg-brand-primary/20 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="text-sm font-medium">New Diagnostic</span>
           </button>

           {sessions.map(session => (
             <div 
                key={session.id}
                onClick={() => switchSession(session.id)}
                className={`
                  group relative w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all
                  ${activeSessionId === session.id 
                    ? 'bg-brand-surface border-brand-border text-white shadow-lg' 
                    : 'hover:bg-brand-surface/50 border-transparent text-brand-muted hover:text-brand-text'}
                `}
             >
                <svg className="w-4 h-4 opacity-50 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium truncate">{session.title}</div>
                    <div className="text-[10px] opacity-50 truncate">{new Date(session.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                
                {/* Delete button (visible on hover or active) */}
                <button 
                  onClick={(e) => deleteSession(e, session.id)}
                  className={`
                    p-1.5 rounded-md hover:bg-brand-danger/20 hover:text-brand-danger transition-colors
                    ${activeSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}
                >
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
             </div>
           ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Header */}
        <div className="flex-none w-full h-16 glass z-30 flex items-center justify-between px-4 md:px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-brand-muted hover:text-white transition-colors"
            >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            </div>
            <div className="hidden md:block">
              <h1 className="text-base font-semibold tracking-tight text-white">Life OS Debugger</h1>
              <p className="text-[10px] text-brand-muted uppercase tracking-wider font-medium">Diagnostic AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${activeSessionId ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-brand-muted/10 border-brand-muted/20 text-brand-muted'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${activeSessionId ? 'bg-green-500 animate-pulse' : 'bg-brand-muted'}`}></div>
                <span className="hidden sm:inline">System Active</span>
              </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 relative w-full flex flex-col overflow-hidden z-0">
          <div 
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto w-full flex flex-col items-center pb-8 scroll-smooth"
          >
            <div className="w-full max-w-3xl p-4 md:p-8 flex-1 flex flex-col gap-6">
              {activeMessages.map((msg, idx) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  isLast={idx === activeMessages.length - 1} 
                  onRestart={createNewSession}
                />
              ))}
              {loading && (
                <div className="self-start ml-2 mt-2 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-brand-muted/50 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-brand-muted/50 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-brand-muted/50 animate-bounce delay-200"></div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Floating Scroll Button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-6 right-6 p-3 bg-brand-surface border border-brand-border text-brand-primary rounded-full shadow-xl hover:bg-brand-border transition-all z-30 animate-fade-in"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-none w-full p-4 md:p-6 z-20 bg-gradient-to-t from-brand-bg to-transparent">
          <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
              <div className="relative flex items-center bg-brand-surface rounded-full border border-brand-border shadow-2xl p-1.5 focus-within:border-brand-primary/50 transition-colors">
                  <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={loading ? "Analyzing patterns..." : "Type your response..."}
                      disabled={loading}
                      className="flex-1 bg-transparent border-none outline-none py-3 px-5 text-brand-text placeholder-brand-muted text-sm md:text-base"
                      autoComplete="off"
                  />
                  <button 
                      type="submit"
                      disabled={loading || !inputText.trim()}
                      className="p-3 rounded-full bg-brand-text text-brand-bg hover:bg-brand-primary hover:text-white disabled:opacity-30 disabled:hover:bg-brand-text disabled:hover:text-brand-bg transition-all duration-300 transform active:scale-95"
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                  </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
