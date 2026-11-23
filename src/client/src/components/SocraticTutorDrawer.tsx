import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  X,
  Lightbulb,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { User, ChatMessage } from '../types.js';
import { streamTutorChat, fetchSuggestedTutorPrompts } from '../api.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

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

// Regex to detect student frustration or cognitive overload
const FRUSTRATION_REGEX = /(i am dumb|i'm dumb|i'm stupid|i am stupid|i hate this|i give up|too hard|can't do this|cannot do this|i fail|makes no sense)/i;

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
  const [isListening, setIsListening] = useState<boolean>(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [tutorPersona, setTutorPersona] = useState<{ name: string; avatar: string; tone: string; tag: string }>({
    name: 'Nova',
    avatar: 'Nova',
    tone: 'Socratic Inquiry',
    tag: 'Quest Guide'
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const { speakText, stopSpeaking, isSpeaking } = useAccessibility();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (courseId && lessonNumber) {
      fetchSuggestedTutorPrompts(courseId, lessonNumber).then((prompts) => {
        setSuggestedPrompts(prompts);
      });
    }
  }, [courseId, lessonNumber]);

  useEffect(() => {
    if (messages.length === 0) {
      const personaName = user?.age && user.age <= 9 ? 'Pip' : user?.age && user.age >= 14 ? 'Atlas' : 'Nova';
      const personaTag = user?.age && user.age <= 9 ? 'Learning Buddy' : user?.age && user.age >= 14 ? 'Studio Mentor' : 'Quest Guide';

      setTutorPersona({
        name: personaName,
        avatar: personaName,
        tone: 'Socratic Inquiry',
        tag: personaTag
      });

      const welcomePrompts = suggestedPrompts.length > 0
        ? suggestedPrompts
        : ['Explain the core concept', 'Give me a studio analogy', 'Where should I start?'];

      setMessages([
        {
          id: 'welcome',
          sender: 'tutor',
          text: `Hello ${user?.displayName || 'there'}! I'm ${personaName}, your studio mentor for "${lessonTitle || 'this topic'}". What concept or question would you like to explore together?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: welcomePrompts
        }
      ]);
    }
  }, [lessonTitle, user]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser environment. You can type your question directly.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    const isFrustrated = FRUSTRATION_REGEX.test(text);

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

    if (isFrustrated) {
      accumulatedText = `Take a gentle breath with me. You are not dumb at all—learning brand-new things stretches your brain, and that is where real strength comes from. Let's take it one small step at a time.\n\n`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: tutorMsgId,
        sender: 'tutor',
        text: accumulatedText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    await streamTutorChat(
      {
        message: isFrustrated
          ? `The student feels discouraged ("${text}"). Respond with deep emotional co-regulation, validate their feeling, and break down the lesson "${lessonTitle}" into one tiny playful question.`
          : text,
        courseId,
        lessonNumber,
        activeModality,
        conversationHistory: messages.slice(-6).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      },
      {
        onStart: (data) => {
          if (data.tutorPersona) {
            const firstName = data.tutorPersona.split(' ')[0];
            setTutorPersona((prev) => ({
              ...prev,
              name: firstName,
              avatar: firstName,
              tone: data.tone || prev.tone
            }));
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
                    text: accumulatedText || 'Connection briefly interrupted. Let us continue with our lesson—what question do you have?'
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
    <>
      {/* Backdrop for focused studio work */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Floating Studio Assistant Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] md:w-[460px] bg-[#FAFAF8] border-l border-stone-200 shadow-2xl flex flex-col animate-slide-left"
        role="dialog"
        aria-label="Socratic EdBot Mentor"
      >
        {/* Drawer Header */}
        <header className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
              {tutorPersona.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-stone-900 text-sm tracking-tight">
                  {tutorPersona.name}
                </h3>
                <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-md font-bold">
                  {tutorPersona.tag}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">Context-Aware Socratic Mentor</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label="Close tutor drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Active Grounding Ribbon */}
        <div className="px-5 py-2.5 bg-stone-100/90 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2 truncate">
            <Compass className="w-3.5 h-3.5 text-[#D94826] shrink-0" />
            <span className="truncate">
              Grounded In: <strong className="font-bold text-stone-900">{lessonTitle || 'Lesson Overview'}</strong>
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
            Socratic Guardrails Active
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-stone-900 text-white rounded-br-xs'
                    : 'bg-white text-stone-900 border border-stone-200/90 rounded-bl-xs'
                }`}
              >
                {msg.text ? (
                  <div className="whitespace-pre-line font-normal">{msg.text}</div>
                ) : (
                  <div className="flex items-center gap-2 py-1">
                    <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}

                {/* Speaker TTS Read Aloud */}
                {msg.sender === 'tutor' && msg.text && (
                  <button
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                      } else {
                        speakText(msg.text);
                      }
                    }}
                    className="mt-3 pt-2 text-[10px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1.5 border-t border-stone-100 transition-colors"
                    title="Read message aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#D94826]" />
                    <span>{isSpeaking ? 'Stop Voice' : `Listen to ${tutorPersona.name}`}</span>
                  </button>
                )}
              </div>

              {/* Socratic Anti-Cheating Guided Hint Alert */}
              {msg.isBlockedAnswer && (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-950 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl font-medium">
                  <Lightbulb className="w-4 h-4 text-[#D94826] shrink-0" />
                  <span>Socratic Coach: Guided hints provided instead of direct answers.</span>
                </div>
              )}

              {/* Dynamic Suggestion Chips */}
              {msg.suggestions && msg.suggestions.length > 0 && !isStreaming && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sug)}
                      className="text-[11px] bg-white hover:bg-stone-100 text-stone-800 border border-stone-200/90 px-3 py-1.5 rounded-xl transition-all text-left flex items-center gap-1.5 shadow-xs hover:border-stone-400 active:scale-98"
                    >
                      <Sparkles className="w-3 h-3 text-[#D94826] shrink-0" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-stone-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <footer className="p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-3 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title={isListening ? 'Stop voice recording' : 'Voice question input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              disabled={isStreaming}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening to your voice...' : 'Ask your tutor or test an idea...'}
              className="flex-1 bg-stone-50 border border-stone-200 focus:border-stone-900 rounded-2xl px-4 py-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="p-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-2xl transition-all shadow-xs"
              aria-label="Send inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2.5 text-[10px] text-stone-400 flex items-center justify-between px-1 font-mono">
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-[#D94826]" />
              <span>Neurodiversity-Affirming</span>
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero PII Tracking</span>
            </span>
          </div>
        </footer>
      </aside>
    </>
  );
};
