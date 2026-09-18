'use client';

import React, { useState } from 'react';
import { PixelCanvas } from '../components/game/PixelCanvas';
import { Sparkles, Moon, Heart, Play, Volume2, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#070b19] flex flex-col items-center justify-center relative">
      {!gameStarted ? (
        /* TITLE / SPLASH SCREEN */
        <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center max-w-xl animate-in zoom-in-95 duration-300">
          {/* Moon & Floating Hearts Banner */}
          <div className="flex items-center gap-3 mb-2 animate-bounce">
            {/* <span className="text-3xl">🌙</span> */}
            <img
              src="https://cdn-icons-png.flaticon.com/512/6236/6236513.png"
              alt="Husky"
              className="w-12 h-12 object-contain"
            />

            {/* <span className="text-3xl">✨</span> */}
          </div>

          <div className="pixel-box-wood p-6 sm:p-8 rounded-xl shadow-2xl border-4 border-[#2b1303] flex flex-col items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-black text-amber-200 tracking-wider drop-shadow-md">
              HUSKY VALLEY
            </h1>
            <p className="text-xs sm:text-sm font-bold text-amber-100/90 -mt-2">

            </p>

            {/* The 5 Huskies badges */}
            <div className="flex items-center justify-center gap-2 flex-wrap py-2">
              <span className="bg-red-950/80 border border-red-500 text-red-200 text-xs px-2.5 py-1 rounded-full font-bold">
                ⚡ Yeiko
              </span>
              <span className="bg-pink-950/80 border border-pink-500 text-pink-200 text-xs px-2.5 py-1 rounded-full font-bold">
                🌸 Bella
              </span>
              <span className="bg-yellow-950/80 border border-yellow-500 text-yellow-200 text-xs px-2.5 py-1 rounded-full font-bold">
                👨‍🦲Lola
              </span>
              <span className="bg-teal-950/80 border border-teal-500 text-teal-200 text-xs px-2.5 py-1 rounded-full font-bold">
                🌙 Cejas
              </span>
              <span className="bg-purple-950/80 border border-purple-500 text-purple-200 text-xs px-2.5 py-1 rounded-full font-bold">
                🧭 Frida
              </span>
            </div>

            {/* Story Prompt */}
            <div className="bg-[#1b0e04] p-3 rounded text-xs text-amber-200/90 leading-relaxed text-left border border-amber-900/60 font-serif italic">
              "Hola Caro, juego simple. Desentierra huesos, juega a la pelota y dales cariño hasta el 100%. Nada más."
            </div>

            {/* Quick Controls Guide */}
            <div className="grid grid-cols-2 gap-2 w-full text-[11px] text-amber-300 font-mono text-left bg-[#251305] p-2.5 rounded border border-amber-950">
              <div>🕹️ <strong>WASD / Flechas:</strong> Moverse</div>
              <div>💖 <strong>[E] / [Espacio]:</strong> Acariciar / Cavar</div>
              <div>📢 <strong>[F]:</strong> Silbar (Llamar a todos)</div>
              <div>🎾 <strong>[Q]:</strong> Lanzar Pelota (Fetch)</div>
              {/* <div>🔢 <strong>[1 - 6]:</strong> Seleccionar Ítem</div> */}
              {/* <div>📱 <strong>Táctil:</strong> Controles virtuales</div> */}
            </div>

            {/* START BUTTON */}
            <button
              onClick={() => setGameStarted(true)}
              className="pixel-btn pixel-btn-gold py-3 px-8 text-base sm:text-lg font-black tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
            >
              <Play className="w-5 h-5 fill-amber-950" />
              <span>ENTRAR AL PATIO</span>
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE PIXEL GAME CANVAS */
        <PixelCanvas />
      )}
    </main>
  );
}
