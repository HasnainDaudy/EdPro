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
    <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#1D4ED8] rounded-xl border border-blue-100">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">Cartesian Coordinates & Vector Physics</h3>
            <p className="text-xs text-stone-500">Apply horizontal $(V_x)$ and vertical $(V_y)$ thrust vectors to navigate Cartesian space</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-mono font-bold text-stone-800">
            Trajectory Score: {score}
          </div>

          <button
            onClick={isPlaying ? resetGame : () => setIsPlaying(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isPlaying
                ? 'bg-amber-700 hover:bg-amber-800 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {isPlaying ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Reset Launch' : 'Launch Rocket'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blueprint Graph Paper Screen */}
        <div className="lg:col-span-2 relative bg-[#F8FAFC] border border-blue-200 rounded-2xl h-80 overflow-hidden shadow-inner">
          {/* Engineering Graph Paper Grid */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <div className="absolute top-2 left-2 text-[10px] font-mono text-stone-400">Origin (0, 0)</div>
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-stone-400">+X (480) | +Y (280)</div>

          {/* Target Asteroid (AABB Box) */}
          <div
            className={`absolute rounded-xl border-2 flex items-center justify-center transition-all ${
              collisionDetected
                ? 'bg-emerald-100 border-emerald-600 scale-105 shadow-sm'
                : 'bg-amber-100 border-amber-500'
            }`}
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`,
              width: `${target.width}px`,
              height: `${target.height}px`
            }}
          >
            <Target className="w-5 h-5 text-amber-700" />
          </div>

          {/* Rocket Vessel */}
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
            <div className="w-8 h-8 bg-blue-600 border border-blue-700 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-bold font-mono">
              🚀
            </div>
          </div>

          {/* Collision Banner */}
          {collisionDetected && (
            <div className="absolute inset-x-0 top-3 mx-auto w-fit bg-emerald-700 text-white font-bold px-3 py-1 rounded-full text-xs shadow-md flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>AABB Boundary Collision Confirmed (+100)</span>
            </div>
          )}
        </div>

        {/* Vector Controls & Math Readout */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Physics Vectors</h4>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-stone-700">Horizontal Velocity ($V_x$)</span>
                <span className="font-mono text-stone-900 font-bold">{velX} px/f</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={velX}
                disabled={isPlaying}
                onChange={(e) => setVelX(parseFloat(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-stone-700">Initial Thrust ($V_y$)</span>
                <span className="font-mono text-stone-900 font-bold">{velY} px/f</span>
              </div>
              <input
                type="range"
                min="-15"
                max="-2"
                step="0.5"
                value={velY}
                disabled={isPlaying}
                onChange={(e) => setVelY(parseFloat(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-stone-700">Gravity ($g$)</span>
                <span className="font-mono text-stone-900 font-bold">{gravity}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.1"
                value={gravity}
                disabled={isPlaying}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full accent-stone-900 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 font-mono text-[11px] text-stone-600 space-y-1">
            <div>Current Pos: ({Math.round(posX)}, {Math.round(posY)})</div>
            <div>Target Bounds: ({target.x}, {target.y})</div>
            <div className="text-blue-700 font-bold">
              Magnitude: {Math.round(Math.sqrt(velX * velX + velY * velY))} px/sec
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
