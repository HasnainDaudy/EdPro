import React from 'react';
import { X, Sliders, Eye, Sparkles, Volume2, Globe, Clock, Check } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { SupportedLanguage } from '../i18n.js';

interface AccessibilityCockpitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityCockpitModal: React.FC<AccessibilityCockpitModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    bionicReading,
    dyslexicFont,
    sensoryMode,
    cognitivePacing,
    language,
    updateSettings,
    resetSettings,
    t
  } = useAccessibility();

  if (!isOpen) return null;

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'US/UK' },
    { code: 'es', label: 'Español', flag: 'ES' },
    { code: 'fr', label: 'Français', flag: 'FR' },
    { code: 'de', label: 'Deutsch', flag: 'DE' },
    { code: 'ar', label: 'العربية (RTL)', flag: 'AR' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl border border-stone-200 shadow-studio-lg max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Sensory & Cognitive Accessibility Cockpit"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 tracking-tight">
                {t.accessibility}
              </h2>
              <p className="text-xs text-stone-500">
                Personalized sensory, cognitive, and linguistic calibration.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Section 1: Typography & Eye Guidance */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold mb-3">
              Typography & Eye Guidance
            </h3>
            <div className="space-y-3">
              {/* Bionic Reading */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors bg-stone-50/50">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-800">{t.bionicReading}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      ADHD & Dyslexia
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Bolds the initial fixation points of words to accelerate cognitive saccades.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ bionicReading: !bionicReading })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    bionicReading ? 'bg-[#D94826]' : 'bg-stone-300'
                  }`}
                  aria-pressed={bionicReading}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      bionicReading ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* OpenDyslexic Font */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors bg-stone-50/50">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-800">{t.dyslexicFont}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                      Weighted Baselines
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Gravity-weighted letter baselines prevent rotation and transposition fatigue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ dyslexicFont: !dyslexicFont })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    dyslexicFont ? 'bg-[#1D4ED8]' : 'bg-stone-300'
                  }`}
                  aria-pressed={dyslexicFont}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      dyslexicFont ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Sensory Mode Calibration */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold mb-3">
              {t.sensoryMode}
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => updateSettings({ sensoryMode: 'standard' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sensoryMode === 'standard'
                    ? 'border-stone-900 bg-white shadow-sm ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50/60 hover:bg-white'
                }`}
              >
                <div className="w-5 h-5 rounded-md bg-[#FAFAF8] border border-stone-300 mb-2" />
                <span className="text-xs font-bold text-stone-900 block">Daylight Studio</span>
                <span className="text-[10px] text-stone-500">Bauhaus neutral</span>
              </button>

              <button
                onClick={() => updateSettings({ sensoryMode: 'calm' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sensoryMode === 'calm'
                    ? 'border-amber-700 bg-[#F5F2EB] shadow-sm ring-1 ring-amber-700'
                    : 'border-stone-200 bg-stone-50/60 hover:bg-white'
                }`}
              >
                <div className="w-5 h-5 rounded-md bg-[#F5F2EB] border border-amber-300 mb-2" />
                <span className="text-xs font-bold text-amber-900 block">Calm Warmth</span>
                <span className="text-[10px] text-amber-800/80">Low-glare Sepia</span>
              </button>

              <button
                onClick={() => updateSettings({ sensoryMode: 'contrast' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sensoryMode === 'contrast'
                    ? 'border-black bg-white shadow-sm ring-2 ring-black'
                    : 'border-stone-200 bg-stone-50/60 hover:bg-white'
                }`}
              >
                <div className="w-5 h-5 rounded-md bg-white border-2 border-black mb-2" />
                <span className="text-xs font-bold text-stone-900 block">High Contrast</span>
                <span className="text-[10px] text-stone-500">Max ink clarity</span>
              </button>
            </div>
          </div>

          {/* Section 3: Cognitive Pacing Engine */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold mb-3">
              {t.cognitivePacing}
            </h3>
            <div className="space-y-2">
              <label
                onClick={() => updateSettings({ cognitivePacing: 'standard' })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  cognitivePacing === 'standard'
                    ? 'border-stone-900 bg-white shadow-xs'
                    : 'border-stone-200 bg-stone-50/40 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="cognitivePacing"
                  checked={cognitivePacing === 'standard'}
                  onChange={() => updateSettings({ cognitivePacing: 'standard' })}
                  className="mt-0.5 text-stone-900"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Continuous Flexible Pacing</span>
                  <span className="text-[11px] text-stone-500">Standard self-guided reading and exercises.</span>
                </div>
              </label>

              <label
                onClick={() => updateSettings({ cognitivePacing: 'micro_chunk' })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  cognitivePacing === 'micro_chunk'
                    ? 'border-[#D94826] bg-[#D94826]/5 shadow-xs'
                    : 'border-stone-200 bg-stone-50/40 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="cognitivePacing"
                  checked={cognitivePacing === 'micro_chunk'}
                  onChange={() => updateSettings({ cognitivePacing: 'micro_chunk' })}
                  className="mt-0.5 text-[#D94826]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 block">{t.microChunk}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-bold">
                      Pomodoro 5m
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    5-minute focused bursts separated by 60-second breathing & co-regulation pauses.
                  </span>
                </div>
              </label>

              <label
                onClick={() => updateSettings({ cognitivePacing: 'hyperfocus' })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  cognitivePacing === 'hyperfocus'
                    ? 'border-[#1D4ED8] bg-[#1D4ED8]/5 shadow-xs'
                    : 'border-stone-200 bg-stone-50/40 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="cognitivePacing"
                  checked={cognitivePacing === 'hyperfocus'}
                  onChange={() => updateSettings({ cognitivePacing: 'hyperfocus' })}
                  className="mt-0.5 text-[#1D4ED8]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 block">{t.hyperfocus}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded font-bold">
                      Autism Monotropism
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Suppresses extraneous notifications, timers, and UI badges to protect deep flow states.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Global Language */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              <span>Language & Locale</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => updateSettings({ language: lang.code })}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    language === lang.code
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <span>{lang.label}</span>
                  {language === lang.code && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={resetSettings}
            className="text-xs text-stone-400 hover:text-stone-700 underline underline-offset-4"
          >
            Reset to Standard Defaults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
