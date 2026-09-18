'use client';

import React, { useState } from 'react';
import { Memory, HuskyId } from '../../types/game';
import { HUSKY_MEMORIES } from '../../data/gameData';
import { X, Lock, Camera, Heart, Sparkles } from 'lucide-react';

interface HuskyAlbumModalProps {
  onClose: () => void;
  unlockedMemoryIds: string[];
}

export const HuskyAlbumModal: React.FC<HuskyAlbumModalProps> = ({
  onClose,
  unlockedMemoryIds,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | HuskyId>('all');

  const filteredMemories = HUSKY_MEMORIES.filter(
    (m) => selectedFilter === 'all' || m.huskyId === selectedFilter
  );

  const totalUnlocked = HUSKY_MEMORIES.filter((m) =>
    unlockedMemoryIds.includes(m.id)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="pixel-box-parchment max-w-3xl w-full max-h-[88vh] flex flex-col p-4 sm:p-6 rounded-lg relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 pixel-btn pixel-btn-wood w-8 h-8 rounded-full flex items-center justify-center text-rose-300 font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-[#804c20] pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#5c2a04]" />
            <h2 className="text-xl sm:text-2xl font-black text-[#3a1a04]">
              Álbum de Recuerdos Polaroid
            </h2>
          </div>
          <div className="text-xs font-extrabold bg-[#804c20] text-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Desbloqueadas: {totalUnlocked} / {HUSKY_MEMORIES.length}</span>
          </div>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-b border-[#b88544] scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`pixel-btn px-3 py-1 text-xs rounded ${selectedFilter === 'all' ? 'pixel-btn-gold font-bold' : 'pixel-btn-wood'
              }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedFilter('yeiko')}
            className={`pixel-btn px-3 py-1 text-xs rounded ${selectedFilter === 'yeiko' ? 'pixel-btn-gold font-bold' : 'pixel-btn-wood'
              }`}
          >
            ⚡ Yeiko
          </button>
          <button
            onClick={() => setSelectedFilter('bella')}
            className={`pixel-btn px-3 py-1 text-xs rounded ${selectedFilter === 'bella' ? 'pixel-btn-gold font-bold' : 'pixel-btn-wood'
              }`}
          >
            🌸 Bella
          </button>
          <button
            onClick={() => setSelectedFilter('lola')}
            className={`pixel-btn px-3 py-1 text-xs rounded ${selectedFilter === 'lola' ? 'pixel-btn-gold font-bold' : 'pixel-btn-wood'
              }`}
          >
            🍖 Lola
          </button>
          <button
            onClick={() => setSelectedFilter('cejas')}
            className={`pixel-btn px-3 py-1 text-xs rounded ${selectedFilter === 'cejas' ? 'pixel-btn-gold font-bold' : 'pixel-btn-wood'
              }`}
          >
            🌙 Cejas
          </button>
          <button
            onClick={() => setSelectedFilter('frida')}
            className={`pixel-btn px-3 py-1 text-xs rounded ${selectedFilter === 'frida' ? 'pixel-btn-gold font-bold' : 'pixel-btn-wood'
              }`}
          >
            🧭 Frida
          </button>
        </div>

        {/* POLAROID GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-2 my-2 max-h-[60vh]">
          {filteredMemories.map((memory) => {
            const isUnlocked = unlockedMemoryIds.includes(memory.id);

            return (
              <div
                key={memory.id}
                className={`bg-white p-3 rounded shadow-md border-2 border-stone-300 flex flex-col transform transition-transform duration-200 hover:rotate-1 hover:scale-102 ${isUnlocked ? 'opacity-100' : 'opacity-65 grayscale'
                  }`}
              >
                {/* Photo frame */}
                <div className="w-full aspect-[4/3] bg-[#0c142c] rounded flex items-center justify-center relative overflow-hidden border border-stone-400">
                  {isUnlocked ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#111e42] to-[#080d22]">
                      <span className="text-4xl animate-bounce mb-1">
                        {memory.huskyId === 'yeiko' && '⚡🐺'}
                        {memory.huskyId === 'bella' && '🌸🐺'}
                        {memory.huskyId === 'lola' && '🍖🐺'}
                        {memory.huskyId === 'cejas' && '🌙🐺'}
                        {memory.huskyId === 'frida' && '🧭🐺'}
                      </span>
                      <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                        {memory.threshold}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-stone-500 gap-1">
                      <Lock className="w-6 h-6" />
                      <span className="text-[10px] font-bold text-stone-400">
                        Requiere {memory.threshold}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Polaroid Caption */}
                <div className="mt-2 text-center flex flex-col">
                  <span className="font-bold text-sm text-[#3b1d05]">
                    {memory.title}
                  </span>
                  <span className="text-[11px] text-[#6b3e15] font-serif italic mt-0.5">
                    {isUnlocked ? memory.description : 'Sigue dándole cariño y jugando para desbloquear este momento especial.'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs text-[#6e3c10] border-t border-[#b88544] pt-2">
          Llena el medidor de cada husky jugando, acariciando y dándoles huesos para completar el álbum.
        </div>
      </div>
    </div>
  );
};
