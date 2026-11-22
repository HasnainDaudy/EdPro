import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, RotateCcw, Target, ShieldCheck, Zap } from 'lucide-react';

export const CoordinateGameSimulation: React.FC = () => {
  const [posX, setPosX] = useState<number>(40);
  const [posY, setPosY] = useState<number>(200);
  const [velX, setVelX] = useState<number>(5);
  const [velY, setVelY] = useState<number>(-8);
  const [gravity, setGravity] = useState<number>(0.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [collisionDetected, setCollisionDetected] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Target Asteroid Bounding Box
  const target = { x: 380, y: 120, width: 50, height: 50 };
  const playerSize = 32;

  const animRef = useRef<number | null>(null);

  const resetGame = () => {
    setIsPlaying(false);
    setPosX(40);
    setPosY(200);
    setVelX(5);
    setVelY(-8);
    setCollisionDetected(false);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let currentX = posX;
    let currentY = posY;
    let currentVy = velY;

    const tick = () => {
      currentX += velX;
      currentVy += gravity;
      currentY += currentVy;

      // Check boundaries
      if (currentX > 480 || currentY > 280) {
        setIsPlaying(false);
        return;
      }

      // AABB Collision Detection
      const playerBox = { x: currentX, y: currentY, width: playerSize, height: playerSize };
      const hasCollision =
        playerBox.x < target.x + target.width &&
        playerBox.x + playerBox.width > target.x &&
        playerBox.y < target.y + target.height &&
        playerBox.y + playerBox.height > target.y;

      if (hasCollision) {
        setCollisionDetected(true);
        setScore((prev) => prev + 100);
        setIsPlaying(false);
        setPosX(currentX);
        setPosY(currentY);
        return;
      }

      setPosX(currentX);
      setPosY(currentY);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, velX, velY, gravity]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg">Cartesian Physics & Collision Sandbox</h3>
            <p className="text-xs text-slate-400">Apply velocity vectors $(V_x, V_y)$ and gravity acceleration to hit the target!</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Score: {score} XP</span>
          </div>

          <button
            onClick={isPlaying ? resetGame : () => setIsPlaying(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Reset Launch' : 'Launch Rocket'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive 2D Canvas Matrix */}
        <div className="lg:col-span-2 relative bg-slate-950 border border-slate-800 rounded-xl h-80 overflow-hidden shadow-inner">
          {/* Coordinate Grid Lines */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Coordinate Axes */}
          <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500">Origin (0, 0)</div>
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500">+X (480) | +Y (280)</div>

          {/* Target Asteroid (AABB Box) */}
          <div
            className={`absolute rounded-xl border-2 flex items-center justify-center transition-all ${
              collisionDetected
                ? 'bg-emerald-500/30 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/50'
                : 'bg-amber-500/20 border-amber-400 animate-pulse'
            }`}
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`,
              width: `${target.width}px`,
              height: `${target.height}px`
            }}
          >
            <Target className="w-6 h-6 text-amber-300" />
          </div>

          {/* Player Rocket */}
          <div
            className="absolute transition-transform duration-75 flex items-center justify-center"
            style={{
              left: `${posX}px`,
              top: `${posY}px`,
              width: `${playerSize}px`,
              height: `${playerSize}px`,
              transform: `rotate(${velY * 3}deg)`
            }}
          >
            <div className="w-8 h-8 bg-blue-500 border border-blue-300 rounded-lg shadow-lg shadow-blue-500/40 flex items-center justify-center text-sm">
              🚀
            </div>
          </div>

          {/* Collision Banner */}
          {collisionDetected && (
            <div className="absolute inset-x-0 top-4 mx-auto w-fit bg-emerald-500/90 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-2 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4" />
              <span>AABB Collision Confirmed! +100 XP</span>
            </div>
          )}
        </div>

        {/* Vector Controls & Math Readout */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Physics Vectors</h4>

            {/* Velocity X Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Horizontal Velocity ($V_x$)</span>
                <span className="font-mono text-blue-400">{velX} px/frame</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={velX}
                disabled={isPlaying}
                onChange={(e) => setVelX(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Velocity Y (Initial Jump Thrust) Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Initial Thrust ($V_y$)</span>
                <span className="font-mono text-indigo-400">{velY} px/frame</span>
              </div>
              <input
                type="range"
                min="-15"
                max="-2"
                step="0.5"
                value={velY}
                disabled={isPlaying}
                onChange={(e) => setVelY(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Gravity Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Gravity ($g$)</span>
                <span className="font-mono text-amber-400">{gravity}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.1"
                value={gravity}
                disabled={isPlaying}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Vector Telemetry */}
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
            <div>Current Pos: ({Math.round(posX)}, {Math.round(posY)})</div>
            <div>Target Pos: ({target.x}, {target.y})</div>
            <div className="text-blue-400">
              Magnitude: {Math.round(Math.sqrt(velX * velX + velY * velY))} px/sec
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
