'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/soundEngine';
import { Sparkles, Trophy, Heart, X, Star } from 'lucide-react';

interface VictoryModalProps {
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onClose }) => {
  useEffect(() => {
    soundEngine.playVictory();

    // Trigger celebratory confetti cannon
    const duration = 4.5 * 1000;
    const end = Date.now() + duration;

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
        colors: ['#ef4444', '#ec4899', '#eab308', '#14b8a6', '#a855f7', '#ffd700'],
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
      <div className="pixel-box-parchment max-w-lg w-full p-6 rounded-lg relative flex flex-col items-center text-center shadow-2xl border-4 border-yellow-500">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 pixel-btn pixel-btn-wood w-8 h-8 rounded-full flex items-center justify-center text-rose-300 font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Golden Trophy */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg border-4 border-[#3a1a04] mb-3 animate-bounce">
          <Trophy className="w-10 h-10 text-amber-950" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#3a1a04] tracking-wide mb-1">
          ¡AURORA BOREAL DE LOS HUSKIES!
        </h1>
        <p className="text-xs sm:text-sm font-bold text-amber-900 mb-4">
          ¡Has alcanzado el 100% con los 5 huskies!
        </p>

        {/* Husky Pack Parade Icons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-2 p-3 bg-[#e8c688] rounded-lg border-2 border-[#804c20] w-full">
          <div className="flex flex-col items-center">
            <span className="text-2xl">⚡🐺</span>
            <span className="text-[10px] font-bold text-red-900">Yeiko</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">🌸🐺</span>
            <span className="text-[10px] font-bold text-pink-900">Bella</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">🍖🐺</span>
            <span className="text-[10px] font-bold text-yellow-900">Lola</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">🌙🐺</span>
            <span className="text-[10px] font-bold text-teal-900">Cejas</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">🧭🐺</span>
            <span className="text-[10px] font-bold text-purple-900">Frida</span>
          </div>
        </div>

        {/* Heartfelt Message */}
        <p className="text-xs sm:text-sm text-[#4a2405] leading-relaxed my-3 italic font-serif">
          "Bajo la luna brillante y el manto de estrellas, Yeiko, Bella, Lola, Cejas y Frida
          aúllan al unísono con alegría infinita. Ahora eres su líder y amigo inseparable por siempre."
        </p>

        {/* Certificate / Title */}
        <div className="bg-[#fff3d6] px-4 py-2 rounded border border-amber-600/60 my-2 flex items-center gap-2 text-xs font-bold text-amber-950">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>Título Desbloqueado: Guardián Legendario de la Manada</span>
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
        </div>

        {/* Continue playing button */}
        <button
          onClick={onClose}
          className="pixel-btn pixel-btn-gold py-3 px-8 text-sm font-black mt-3 shadow-lg"
        >
          ¡Seguir Disfrutando de la Noche! 🐾💖
        </button>
      </div>
    </div>
  );
};
