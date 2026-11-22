import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, translations, Translations } from '../i18n.js';

export interface AccessibilitySettings {
  bionicReading: boolean;
  dyslexicFont: boolean;
  letterSpacing: 'normal' | 'wide' | 'widest';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  sensoryMode: 'calm' | 'standard' | 'contrast';
  cognitivePacing: 'standard' | 'micro_chunk' | 'hyperfocus';
  soundEffects: boolean;
  language: SupportedLanguage;
}

interface AccessibilityContextType extends AccessibilitySettings {
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  t: Translations;
  renderBionic: (text: string) => React.ReactNode;
  speakText: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const defaultSettings: AccessibilitySettings = {
  bionicReading: false,
  dyslexicFont: false,
  letterSpacing: 'normal',
  lineHeight: 'normal',
  sensoryMode: 'standard',
  cognitivePacing: 'standard',
  soundEffects: true,
  language: 'en'
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('edpro_accessibility');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('edpro_accessibility', JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save accessibility settings:', err);
    }

    // Apply document-level classes & direction
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';

    if (settings.dyslexicFont) {
      document.body.classList.add('font-dyslexic');
    } else {
      document.body.classList.remove('font-dyslexic');
    }

    if (settings.sensoryMode === 'calm') {
      document.body.classList.add('sensory-calm');
      document.body.classList.remove('sensory-contrast');
    } else if (settings.sensoryMode === 'contrast') {
      document.body.classList.add('sensory-contrast');
      document.body.classList.remove('sensory-calm');
    } else {
      document.body.classList.remove('sensory-calm', 'sensory-contrast');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    stopSpeaking();
  };

  const speakText = (text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown hashes/stars
    const cleaned = text.replace(/[*#_`]/g, '').trim();
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = settings.language === 'es' ? 'es-ES' : settings.language === 'fr' ? 'fr-FR' : settings.language === 'de' ? 'de-DE' : settings.language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = settings.cognitivePacing === 'micro_chunk' ? 0.9 : 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  /**
   * Transforms text by bolding the primary fixation letters of each word
   * Proven in dyslexia and ADHD research to guide saccadic eye movements
   */
  const renderBionic = (text: string): React.ReactNode => {
    if (!settings.bionicReading || !text) return text;

    const paragraphs = text.split('\n');
    return paragraphs.map((para, pIdx) => {
      if (!para.trim()) return <br key={pIdx} />;

      const words = para.split(' ');
      return (
        <span key={pIdx} className="block mb-2">
          {words.map((word, wIdx) => {
            if (word.length <= 1) return word + ' ';
            const mid = Math.ceil(word.length * 0.45);
            const boldPart = word.slice(0, mid);
            const rest = word.slice(mid);
            return (
              <span key={wIdx}>
                <strong className="font-extrabold text-stone-900">{boldPart}</strong>
                <span>{rest} </span>
              </span>
            );
          })}
        </span>
      );
    });
  };

  const t = translations[settings.language] || translations.en;

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        updateSettings,
        resetSettings,
        t,
        renderBionic,
        speakText,
        stopSpeaking,
        isSpeaking
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
