import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Lightbulb, ChevronRight, Mic, MicOff, Volume2, VolumeX, HeartHandshake } from 'lucide-react';
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
  const [tutorPersona, setTutorPersona] = useState<{ name: string; avatar: string; tone: string }>({
    name: 'Nova the Quest Guide',
    avatar: 'Nova',
    tone: 'Socratic Inquiry'
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const { speakText, stopSpeaking, isSpeaking, t } = useAccessibility();

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

      setTutorPersona({
        name: `${personaName}`,
        avatar: personaName,
        tone: 'Socratic Inquiry'
      });

      setMessages([
        {
          id: 'welcome',
          sender: 'tutor',
          text: `Hello ${user?.displayName || 'there'}. I am ${personaName}, your studio mentor for "${lessonTitle || 'this topic'}". What concept or step would you like to explore together?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: suggestedPrompts.length > 0 ? suggestedPrompts : ['Explain the core concept', 'Give me a studio analogy', 'Where should I start?']
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

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

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

    // Check for frustration / overwhelm
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

    // If frustrated, provide instant co-regulation opening
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
              avatar: data.tutorPersona.split(' ')[0],
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-[#FAFAF8] border-l border-stone-200 shadow-2xl flex flex-col transition-all">
      {/* Drawer Header */}
      <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black text-xs">
            EB
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-stone-900 text-sm">{tutorPersona.name}</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            </div>
            <p className="text-[10px] text-stone-500 font-medium">Voice-First Socratic & Co-Regulation Mentor</p>
          </div>
        </div>

        <button
          onClick={() => {
            stopSpeaking();
            onClose();
          }}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Curriculum Badge */}
      <div className="px-4 py-2 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs text-stone-700">
        <div className="flex items-center gap-2 truncate">
          <Bot className="w-3.5 h-3.5 text-[#D94826] shrink-0" />
          <span className="truncate">
            Grounded In: <strong className="font-bold text-stone-900">{lessonTitle || 'Lesson Overview'}</strong>
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 font-bold">
          Co-Regulation Active
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
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs relative group ${
                msg.sender === 'user'
                  ? 'bg-stone-900 text-white rounded-br-none'
                  : 'bg-white text-stone-900 border border-stone-200 rounded-bl-none'
              }`}
            >
              {msg.text || (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              {/* Speaker button on Tutor messages */}
              {msg.sender === 'tutor' && msg.text && (
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      speakText(msg.text);
                    }
                  }}
                  className="mt-2 text-[10px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 pt-1 border-t border-stone-100"
                  title="Read aloud"
                >
                  <Volume2 className="w-3 h-3 text-[#D94826]" />
                  <span>Listen to Pip / Nova</span>
                </button>
              )}
            </div>

            {/* Socratic Anti-Cheating Alert */}
            {msg.isBlockedAnswer && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium">
                <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                <span>Socratic Coach: Guided hints provided instead of direct answers</span>
              </div>
            )}

            {/* Quick Suggestion Pills */}
            {msg.suggestions && msg.suggestions.length > 0 && !isStreaming && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {msg.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug)}
                    className="text-[11px] bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-lg transition-colors text-left flex items-center gap-1 shadow-xs"
                  >
                    <span>{sug}</span>
                    <ChevronRight className="w-2.5 h-2.5 opacity-50" />
                  </button>
                ))}
              </div>
            )}

            <span className="text-[10px] text-stone-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form with Voice Speech-to-Text */}
      <div className="p-3 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Microphone Toggle */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
            }`}
            title={isListening ? 'Stop recording voice' : 'Speak your question (Voice Socratic Input)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            disabled={isStreaming}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening to your voice...' : 'Ask your tutor or speak...'}
            className="flex-1 bg-stone-50 border border-stone-200 focus:border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 text-[10px] text-stone-400 flex items-center justify-between px-1 font-mono">
          <span className="flex items-center gap-1">
            <HeartHandshake className="w-3 h-3 text-[#D94826]" />
            Neurodiversity-Affirming
          </span>
          <span className="text-emerald-700 font-bold">COPPA Compliant</span>
        </div>
      </div>
    </div>
  );
};
