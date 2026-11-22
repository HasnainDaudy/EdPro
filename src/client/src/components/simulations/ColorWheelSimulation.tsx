import React, { useState } from 'react';
import { Palette, Sparkles, RefreshCw } from 'lucide-react';

interface ColorWheelSimulationProps {
  config?: Record<string, any>;
}

export const ColorWheelSimulation: React.FC<ColorWheelSimulationProps> = ({ config }) => {
  const [selectedHue, setSelectedHue] = useState<number>(30); // 30 = warm orange
  const [activeHarmony, setActiveHarmony] = useState<'complementary' | 'triadic' | 'analogous'>('complementary');

  const complementaryHue = (selectedHue + 180) % 360;
  const triadic1 = (selectedHue + 120) % 360;
  const triadic2 = (selectedHue + 240) % 360;

  const baseColor = `hsl(${selectedHue}, 90%, 55%)`;
  const compColor = `hsl(${complementaryHue}, 90%, 55%)`;
  const tri1Color = `hsl(${triadic1}, 90%, 55%)`;
  const tri2Color = `hsl(${triadic2}, 90%, 55%)`;

  const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-xl">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg">Interactive 12-Tone Harmonic Color Studio</h3>
            <p className="text-xs text-slate-400">Discover optical contrast, geometric symmetry, and emotional color temperatures</p>
          </div>
        </div>

        {/* Harmony Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['complementary', 'triadic', 'analogous'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveHarmony(mode)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                activeHarmony === mode ? 'bg-pink-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Visual Wheel Circle */}
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Center preview swatch */}
            <div
              className="w-24 h-24 rounded-full shadow-2xl border-4 border-slate-800 flex flex-col items-center justify-center z-10 transition-colors duration-300"
              style={{ backgroundColor: baseColor }}
            >
              <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
              <span className="text-[10px] font-bold text-white drop-shadow-md mt-1">{selectedHue}° Hue</span>
            </div>

            {/* 12 Outer Hue Buttons arranged in a circle */}
            {hues.map((h, i) => {
              const angleRad = (i * 30 - 90) * (Math.PI / 180);
              const radius = 100;
              const x = Math.round(radius * Math.cos(angleRad));
              const y = Math.round(radius * Math.sin(angleRad));
              const isSelected = selectedHue === h;
              const isOpposite = complementaryHue === h;

              return (
                <button
                  key={h}
                  onClick={() => setSelectedHue(h)}
                  className={`absolute w-9 h-9 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 focus:outline-none ${
                    isSelected ? 'ring-4 ring-white scale-125 z-20 shadow-lg' : isOpposite ? 'ring-2 ring-pink-400 scale-110' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `hsl(${h}, 90%, 55%)`,
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`
                  }}
                  title={`${h}°`}
                />
              );
            })}
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            Click any color circle around the 360° wheel to observe its optical partner!
          </p>
        </div>

        {/* Live Canvas / Visual Composition Balance */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <span>Visual Composition Preview</span>
            <span className="text-xs bg-slate-800 text-pink-300 px-2 py-0.5 rounded-full font-mono">
              {activeHarmony.toUpperCase()}
            </span>
          </h4>

          {/* Dynamic Mock Poster / Artwork */}
          <div
            className="w-full h-44 rounded-xl relative overflow-hidden flex flex-col justify-between p-4 shadow-inner border border-slate-800 transition-colors duration-500"
            style={{ backgroundColor: baseColor }}
          >
            {/* Background geometric shapes */}
            <div
              className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-90 transition-colors duration-500 shadow-2xl"
              style={{ backgroundColor: activeHarmony === 'triadic' ? tri1Color : compColor }}
            />
            <div
              className="absolute left-8 bottom-3 w-16 h-16 transform rotate-45 opacity-80 transition-colors duration-500"
              style={{ backgroundColor: activeHarmony === 'triadic' ? tri2Color : compColor }}
            />

            {/* Poster Typography */}
            <div className="relative z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit border border-slate-700/50">
              <span className="text-xs font-bold tracking-wider uppercase text-white">Dominant Focal Tone</span>
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <div
                className="px-3 py-1 rounded-md text-xs font-bold shadow-md transition-colors duration-500"
                style={{
                  backgroundColor: compColor,
                  color: selectedHue > 40 && selectedHue < 180 ? '#0f172a' : '#ffffff'
                }}
              >
                180° Complement Accent
              </div>
              <span className="text-[11px] font-mono text-slate-200 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                Golden Ratio (62% / 38%)
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
            <strong className="text-slate-200">Pedagogical Insight:</strong> Notice how placing{' '}
            <span className="font-semibold text-pink-300">
              HSL({selectedHue}°)
            </span>{' '}
            directly adjacent to its optical complement creates simultaneous contrast without causing eye strain. This is the exact formula Renaissance masters utilized to make halos and focal points shine!
          </div>
        </div>
      </div>
    </div>
  );
};
