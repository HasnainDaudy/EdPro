import React, { useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';

interface ColorWheelSimulationProps {
  config?: Record<string, any>;
}

export const ColorWheelSimulation: React.FC<ColorWheelSimulationProps> = ({ config }) => {
  const [selectedHue, setSelectedHue] = useState<number>(30); // 30 = warm orange
  const [activeHarmony, setActiveHarmony] = useState<'complementary' | 'triadic' | 'analogous'>('complementary');

  const complementaryHue = (selectedHue + 180) % 360;
  const triadic1 = (selectedHue + 120) % 360;
  const triadic2 = (selectedHue + 240) % 360;

  const baseColor = `hsl(${selectedHue}, 85%, 52%)`;
  const compColor = `hsl(${complementaryHue}, 85%, 52%)`;
  const tri1Color = `hsl(${triadic1}, 85%, 52%)`;
  const tri2Color = `hsl(${triadic2}, 85%, 52%)`;

  const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 text-[#D94826] rounded-xl border border-orange-100">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">Interactive 12-Tone Harmonic Studio</h3>
            <p className="text-xs text-stone-500">Calculate optical contrast, 180° geometric symmetry, and color temperatures</p>
          </div>
        </div>

        {/* Harmony Mode Selector */}
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
          {(['complementary', 'triadic', 'analogous'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveHarmony(mode)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                activeHarmony === mode
                  ? 'bg-white text-stone-900 font-bold shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Interactive 360° Color Wheel Circle */}
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Center Swatch Card */}
            <div
              className="w-24 h-24 rounded-full shadow-md border-4 border-white flex flex-col items-center justify-center z-10 transition-colors duration-300"
              style={{ backgroundColor: baseColor }}
            >
              <span className="text-[11px] font-bold text-white drop-shadow-md">
                {selectedHue}° HUE
              </span>
            </div>

            {/* 12 Outer Hue Buttons */}
            {hues.map((h, i) => {
              const angleRad = (i * 30 - 90) * (Math.PI / 180);
              const radius = 104;
              const x = Math.round(radius * Math.cos(angleRad));
              const y = Math.round(radius * Math.sin(angleRad));
              const isSelected = selectedHue === h;
              const isOpposite = complementaryHue === h;

              return (
                <button
                  key={h}
                  onClick={() => setSelectedHue(h)}
                  className={`absolute w-8 h-8 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 focus:outline-none ${
                    isSelected
                      ? 'ring-3 ring-stone-900 scale-125 z-20 shadow-md'
                      : isOpposite
                      ? 'ring-2 ring-stone-400 scale-110'
                      : 'opacity-90 hover:opacity-100 border border-white'
                  }`}
                  style={{
                    backgroundColor: `hsl(${h}, 85%, 52%)`,
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`
                  }}
                  title={`${h}°`}
                />
              );
            })}
          </div>

          <p className="text-[11px] text-stone-500 mt-4 text-center font-mono">
            Click any color point along the 360° chromatic circle
          </p>
        </div>

        {/* Studio Composition Preview */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-stone-900">Compositional Balance Canvas</span>
            <span className="font-mono text-stone-500 font-bold uppercase">{activeHarmony}</span>
          </div>

          {/* Visual Canvas Block */}
          <div
            className="w-full h-44 rounded-xl relative overflow-hidden flex flex-col justify-between p-4 shadow-sm border border-stone-200 transition-colors duration-300"
            style={{ backgroundColor: baseColor }}
          >
            {/* Geometric balance elements */}
            <div
              className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full opacity-95 transition-colors duration-300 shadow-md"
              style={{ backgroundColor: activeHarmony === 'triadic' ? tri1Color : compColor }}
            />
            <div
              className="absolute left-6 bottom-3 w-14 h-14 transform rotate-45 opacity-80 transition-colors duration-300"
              style={{ backgroundColor: activeHarmony === 'triadic' ? tri2Color : compColor }}
            />

            <div className="relative z-10 bg-white/95 px-3 py-1 rounded-md w-fit border border-stone-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-900">
                Primary Ground
              </span>
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <div
                className="px-3 py-1 rounded-md text-[11px] font-bold shadow-xs transition-colors duration-300"
                style={{
                  backgroundColor: compColor,
                  color: selectedHue > 40 && selectedHue < 180 ? '#18181b' : '#ffffff'
                }}
              >
                180° Complement Accent
              </div>
              <span className="text-[10px] font-mono bg-white/90 text-stone-800 px-2 py-0.5 rounded border border-stone-200">
                Golden Ratio (62% / 38%)
              </span>
            </div>
          </div>

          <div className="text-xs text-stone-600 bg-white p-3.5 rounded-xl border border-stone-200 leading-relaxed">
            <strong className="text-stone-900 block mb-0.5">Studio Geometry Note:</strong>
            Opposite colors on the 360° circle stimulate adjacent cones in the human retina, producing dynamic optical contrast without eye fatigue.
          </div>
        </div>
      </div>
    </div>
  );
};
