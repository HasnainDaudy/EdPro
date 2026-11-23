import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Server,
  Zap,
  RotateCcw
} from 'lucide-react';
import { LLMConfig, LLMProvider } from '../types.js';
import { testLLMConnection } from '../api.js';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (config: LLMConfig) => void;
}

const PROVIDER_PRESETS: Record<
  LLMProvider,
  {
    name: string;
    description: string;
    defaultModel: string;
    popularModels: string[];
    requiresApiKey: boolean;
    defaultBaseUrl?: string;
    keyLink?: { label: string; url: string };
  }
> = {
  gemini: {
    name: 'Google Gemini',
    description: 'Ultra-fast multimodal reasoning with generous free tier.',
    defaultModel: 'gemini-1.5-flash',
    popularModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
    requiresApiKey: true,
    keyLink: { label: 'Get API Key (Google AI Studio)', url: 'https://aistudio.google.com/app/apikey' }
  },
  openai: {
    name: 'OpenAI',
    description: 'Industry standard for dialogue reasoning and instruction following.',
    defaultModel: 'gpt-4o-mini',
    popularModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    requiresApiKey: true,
    keyLink: { label: 'Get API Key (OpenAI Platform)', url: 'https://platform.openai.com/api-keys' }
  },
  anthropic: {
    name: 'Anthropic Claude',
    description: 'Nuanced, thoughtful pedagogical dialogue and high empathy.',
    defaultModel: 'claude-3-5-haiku-20241022',
    popularModels: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022'],
    requiresApiKey: true,
    keyLink: { label: 'Get API Key (Anthropic Console)', url: 'https://console.anthropic.com/settings/keys' }
  },
  ollama: {
    name: 'Ollama (Local LLM)',
    description: '100% private, local inference on your own hardware. Zero cloud data sharing.',
    defaultModel: 'llama3',
    popularModels: ['llama3', 'mistral', 'phi3', 'gemma2', 'deepseek-r1'],
    requiresApiKey: false,
    defaultBaseUrl: 'http://localhost:11434'
  },
  custom: {
    name: 'Custom OpenAI-Compatible',
    description: 'Groq, DeepSeek, OpenRouter, Together AI, Perplexity, or custom self-hosted endpoints.',
    defaultModel: 'llama-3.3-70b-versatile',
    popularModels: ['llama-3.3-70b-versatile', 'deepseek-chat', 'mistralai/mixtral-8x7b-instruct'],
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.groq.com/openai/v1'
  },
  offline: {
    name: 'Built-in Offline Socratic Engine',
    description: 'Zero external network calls, instant latency, grounded in local curriculum.',
    defaultModel: 'offline-rule-engine',
    popularModels: ['offline-rule-engine'],
    requiresApiKey: false
  }
};

const STORAGE_KEY = 'edpro_llm_config';

export const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [provider, setProvider] = useState<LLMProvider>('offline');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load saved config on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: LLMConfig = JSON.parse(saved);
        setProvider(parsed.provider || 'offline');
        setApiKey(parsed.apiKey || '');
        setModel(parsed.model || PROVIDER_PRESETS[parsed.provider || 'offline'].defaultModel);
        setBaseUrl(parsed.baseUrl || PROVIDER_PRESETS[parsed.provider || 'offline'].defaultBaseUrl || '');
      }
    } catch {}
  }, [isOpen]);

  // When provider changes, update model and baseUrl defaults
  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    setTestResult(null);
    const preset = PROVIDER_PRESETS[newProvider];
    setModel(preset.defaultModel);
    if (preset.defaultBaseUrl) {
      setBaseUrl(preset.defaultBaseUrl);
    } else {
      setBaseUrl('');
    }
  };

  const currentPreset = PROVIDER_PRESETS[provider];

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const currentConfig: LLMConfig = {
      provider,
      apiKey: apiKey.trim(),
      model: model.trim() || currentPreset.defaultModel,
      baseUrl: baseUrl.trim() || currentPreset.defaultBaseUrl
    };

    const res = await testLLMConnection(currentConfig);
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    const configToSave: LLMConfig = {
      provider,
      apiKey: apiKey.trim(),
      model: model.trim() || currentPreset.defaultModel,
      baseUrl: baseUrl.trim() || currentPreset.defaultBaseUrl
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
    onConfigSaved(configToSave);
    onClose();
  };

  const handleReset = () => {
    const defaultCfg: LLMConfig = {
      provider: 'offline',
      apiKey: '',
      model: 'offline-rule-engine',
      baseUrl: ''
    };
    localStorage.removeItem(STORAGE_KEY);
    setProvider('offline');
    setApiKey('');
    setModel('offline-rule-engine');
    setBaseUrl('');
    setTestResult(null);
    onConfigSaved(defaultCfg);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-config-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ai-config-title" className="text-lg font-serif font-bold text-stone-900">
                AI Model & Provider Configuration
              </h2>
              <p className="text-xs text-stone-500">
                Connect your LLM API or use local offline intelligence. Stored securely on your device.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
              Select Intelligence Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(PROVIDER_PRESETS) as LLMProvider[]).map((pKey) => {
                const item = PROVIDER_PRESETS[pKey];
                const isSelected = provider === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => handleProviderChange(pKey)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20 text-stone-900 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs">{item.name}</span>
                      {isSelected && <Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />}
                    </div>
                    <span className="text-[11px] text-stone-500 line-clamp-2 leading-tight">
                      {pKey === 'offline' ? 'Offline Rule Engine' : item.defaultModel}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-stone-500 mt-2 italic">{currentPreset.description}</p>
          </div>

          {/* Model Specification */}
          {provider !== 'offline' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1.5">
                  Model Identifier
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={currentPreset.defaultModel}
                    className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                  {currentPreset.popularModels.length > 1 && (
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Presets...</option>
                      {currentPreset.popularModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* API Key */}
              {currentPreset.requiresApiKey && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      API Key
                    </label>
                    {currentPreset.keyLink && (
                      <a
                        href={currentPreset.keyLink.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-orange-600 hover:text-orange-700 underline font-medium"
                      >
                        {currentPreset.keyLink.label} &rarr;
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                      className="w-full px-3.5 py-2.5 pr-10 bg-stone-50 border border-stone-200 rounded-lg font-mono text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      aria-label={showKey ? 'Hide key' : 'Show key'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Your key is saved in browser localStorage and sent directly through encrypted HTTPS proxy.
                  </p>
                </div>
              )}

              {/* Base URL (for Ollama or Custom) */}
              {(provider === 'ollama' || provider === 'custom') && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Base API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder={currentPreset.defaultBaseUrl || 'https://api.groq.com/openai/v1'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    {provider === 'ollama'
                      ? 'Default Ollama local server port is 11434.'
                      : 'Endpoint providing OpenAI-compatible /chat/completions route.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Test Connection Result Banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 animate-fade-in ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <span className="font-bold">{testResult.success ? 'Connection Verified!' : 'Connection Failed'}</span>
                <p className="mt-0.5 text-stone-600">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Kid Safety & COPPA Assurance */}
          <div className="p-3 bg-stone-100/70 border border-stone-200 rounded-xl flex items-center gap-2.5 text-stone-600 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>COPPA Safeguard:</strong> All prompts are stripped of personal identifying information (emails,
              real names, locations) before sending to any model.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-mono text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" /> : <Server className="w-3.5 h-3.5" />}
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
