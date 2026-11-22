import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, X, ShieldAlert, MessageCircle, Lightbulb, ChevronRight, CheckCircle2 } from 'lucide-react';
import { User, ChatMessage } from '../types.js';
import { streamTutorChat, fetchSuggestedTutorPrompts } from '../api.js';

interface SocraticTutorDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  courseTitle?: string;
  lessonNumber?: number;
  lessonTitle?: string;
  activeModality?: string;
}

export const SocraticTutorDrawer: React.FC<SocraticTutorDrawerProps> = ({
  user,
  isOpen,
  onClose,
  courseId,
  courseTitle,
  lessonNumber,
  lessonTitle,
  activeModality = 'reader'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [tutorPersona, setTutorPersona] = useState<{ name: string; avatar: string; tone: string }>({
    name: 'Nova the Quest Guide',
    avatar: '🚀',
    tone: 'Supportive Socratic Mentor'
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Load contextual suggestions when active lesson changes
  useEffect(() => {
    if (courseId && lessonNumber) {
      fetchSuggestedTutorPrompts(courseId, lessonNumber).then((prompts) => {
        setSuggestedPrompts(prompts);
      });
    }
  }, [courseId, lessonNumber]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const personaName = user?.age && user.age <= 9 ? 'Pip' : user?.age && user.age >= 14 ? 'Atlas' : 'Nova';
      const emoji = user?.age && user.age <= 9 ? '🌟' : user?.age && user.age >= 14 ? '🏛️' : '🚀';

      setTutorPersona({
        name: `${personaName} the Learning Mentor`,
        avatar: emoji,
        tone: 'Guided Inquiries'
      });

      setMessages([
        {
          id: 'welcome',
          sender: 'tutor',
          text: `Hi ${user?.displayName || 'there'}! I'm ${personaName}. I'm here with you as you explore "${lessonTitle || 'your learning journey'}". What questions are popping up for you?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: suggestedPrompts.length > 0 ? suggestedPrompts : ['Explain the core concept', 'Give me a fun analogy', 'How do I start?']
        }
      ]);
    }
  }, [lessonTitle, user]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const tutorMsgId = 'tut_' + Date.now();
    let accumulatedText = '';
    let currentSuggestions: string[] = [];
    let isBlocked = false;

    // Create placeholder tutor message
    setMessages((prev) => [
      ...prev,
      {
        id: tutorMsgId,
        sender: 'tutor',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    await streamTutorChat(
      {
        message: text,
        courseId,
        lessonNumber,
        activeModality,
        conversationHistory: messages.slice(-4).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      },
      {
        onStart: (data) => {
          if (data.tutorPersona) {
            setTutorPersona({
              name: data.tutorPersona,
              avatar: data.avatarEmoji || '🚀',
              tone: data.tone || 'Socratic'
            });
          }
        },
        onToken: (token) => {
          accumulatedText += token;
          setMessages((prev) =>
            prev.map((m) => (m.id === tutorMsgId ? { ...m, text: accumulatedText } : m))
          );
        },
        onSuggestion: (suggestions, isDirectAnswerBlocked) => {
          currentSuggestions = suggestions || [];
          isBlocked = !!isDirectAnswerBlocked;
        },
        onDone: () => {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tutorMsgId
                ? { ...m, text: accumulatedText, suggestions: currentSuggestions, isBlockedAnswer: isBlocked }
                : m
            )
          );
        },
        onError: (err) => {
          console.error('Tutor stream failure:', err);
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tutorMsgId
                ? {
                    ...m,
                    text: 'I ran into a small connection hiccup! But let’s stay on our lesson quest—what question can we explore together?'
                  }
                : m
            )
          );
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl shadow-md">
            {tutorPersona.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-100 text-sm">{tutorPersona.name}</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-indigo-400 font-medium">Context-Aware Socratic Tutor</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Curriculum Context Badge */}
      <div className="px-4 py-2.5 bg-indigo-950/40 border-b border-indigo-900/30 flex items-center gap-2 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="text-slate-400 truncate">
          Active: <strong className="text-slate-200">{lessonTitle || 'Lesson Overview'}</strong>
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-none'
              }`}
            >
              {msg.text || (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Socratic Anti-Cheating Coaching Banner */}
            {msg.isBlockedAnswer && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-900/40 px-2.5 py-1 rounded-lg">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Socratic Coach: Guided hints instead of direct answers</span>
              </div>
            )}

            {/* Quick Suggestion Pills */}
            {msg.suggestions && msg.suggestions.length > 0 && !isStreaming && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {msg.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug)}
                    className="text-[11px] bg-slate-950 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 px-2.5 py-1 rounded-full transition-all text-left flex items-center gap-1 shadow-sm"
                  >
                    <span>{sug}</span>
                    <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                  </button>
                ))}
              </div>
            )}

            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            disabled={isStreaming}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your tutor anything about this lesson..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between px-1">
          <span>COPPA Kid-Safe Sandbox</span>
          <span className="text-emerald-500 font-mono">Zero PII Tracking</span>
        </div>
      </div>
    </div>
  );
};
