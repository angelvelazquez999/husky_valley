'use client';

import React from 'react';
import { Husky, Item, GameTime } from '../../types/game';
import {
  Volume2, VolumeX, Moon, BookOpen,
  Sparkles, Heart, Bell, CircleDot,
  Flame, Award, Music
} from 'lucide-react';

interface HuskyHUDProps {
  huskies: Husky[];
  inventory: Item[];
  activeItemIndex: number;
  onSelectItem: (index: number) => void;
  gameTime: GameTime;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHuskyProfile: (husky: Husky) => void;
  onOpenAlbum: () => void;
  onOpenQuests: () => void;
  onWhistle: () => void;
  onThrowBall: () => void;
  unlockedMemoriesCount: number;
  totalMemoriesCount: number;
  activeQuestsCount: number;
}

export const HuskyHUD: React.FC<HuskyHUDProps> = ({
  huskies,
  inventory,
  activeItemIndex,
  onSelectItem,
  gameTime,
  isMuted,
  onToggleMute,
  onOpenHuskyProfile,
  onOpenAlbum,
  onOpenQuests,
  onWhistle,
  onThrowBall,
  unlockedMemoriesCount,
  totalMemoriesCount,
  activeQuestsCount,
}) => {
  // Average Love
  const avgLove = Math.round(
    huskies.reduce((sum, h) => sum + h.love, 0) / huskies.length
  );

  const activeItem = inventory[activeItemIndex];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* TOP BAR */}
      <div className="flex items-start justify-between gap-2">
        {/* Night Clock & Weather Card */}
        <div className="pointer-events-auto pixel-box-wood px-3 py-2 flex items-center gap-3 rounded">
          <div className="flex items-center gap-1.5 text-yellow-300">
            <Moon className="w-5 h-5 animate-pulse-glow" />
            <span className="font-bold text-sm tracking-wide text-amber-200">
              {String(gameTime.hour).padStart(2, '0')}:{String(gameTime.minute).padStart(2, '0')} PM
            </span>
          </div>
          <div className="h-4 w-px bg-amber-900/60" />
          <span className="text-xs text-amber-100/90 font-medium">
            Noche
          </span>
        </div>

        {/* Global Husky Love Progress Card */}
        <div className="pointer-events-auto pixel-box-wood px-4 py-2 flex flex-col items-center min-w-[200px] max-w-xs rounded">
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs text-amber-200 font-bold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />

            </span>
            <span className="text-xs font-extrabold text-amber-300">{avgLove}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#1b0d04] h-3 rounded-sm overflow-hidden p-0.5 border border-[#87430c]">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 rounded-sm transition-all duration-500 shadow-sm"
              style={{ width: `${avgLove}%` }}
            />
          </div>
        </div>

        {/* Action & Nav Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={onOpenQuests}
            className="pixel-btn pixel-btn-wood p-2 flex items-center gap-1.5 text-xs"
            title="Misiones y Logros"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Misiones</span>
            {activeQuestsCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {activeQuestsCount}
              </span>
            )}
          </button>

          {/* <button
            onClick={onOpenAlbum}
            className="pixel-btn pixel-btn-wood p-2 flex items-center gap-1.5 text-xs"
            title="Álbum de Recuerdos Polaroid"
          >
            <BookOpen className="w-4 h-4 text-pink-300" />
            <span className="hidden sm:inline">Fotos</span>
            <span className="text-[11px] text-amber-200 font-bold">
              {unlockedMemoriesCount}/{totalMemoriesCount}
            </span>
          </button> */}

          <button
            onClick={onToggleMute}
            className="pixel-btn pixel-btn-wood p-2 text-xs"
            title={isMuted ? 'Activar Sonido y Música' : 'Silenciar'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* QUICK COMMAND BAR (Whistle, Throw Ball) - Bottom-Right Corner */}
      <div className="pointer-events-auto absolute bottom-3 right-3 flex flex-col gap-2 z-20">
        <button
          onClick={onWhistle}
          className="pixel-btn pixel-btn-gold px-3 py-1.5 flex items-center gap-1.5 text-xs shadow-lg"
          title="Silbar para llamar a todos los huskies"
        >
          <Bell className="w-4 h-4" />
          <span>¡Silbar! (F)</span>
        </button>

        <button
          onClick={onThrowBall}
          className="pixel-btn pixel-btn-wood px-3 py-1.5 flex items-center gap-1.5 text-xs shadow-lg"
          title="Lanzar pelota chillona para jugar a buscar"
        >
          <CircleDot className="w-4 h-4 text-rose-400" />
          <span>Lanzar Pelota (Q)</span>
        </button>
      </div>

      {/* BOTTOM-LEFT SECTION: Husky Portraits & Hotbar */}
      <div className="pointer-events-auto absolute bottom-3 left-3 flex flex-col gap-1.5 items-start z-20 max-w-[85vw]">
        {/* Husky Cards Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {huskies.map((husky) => {
            const isFullLove = husky.love >= 100;
            return (
              <button
                key={husky.id}
                onClick={() => onOpenHuskyProfile(husky)}
                className={`pixel-box-wood px-2 py-0.5 flex items-center gap-1.5 rounded transition-transform hover:scale-105 shadow-md ${husky.isFollowing ? 'ring-2 ring-amber-400' : ''
                  }`}
                style={{ borderLeftColor: husky.collarColor, borderLeftWidth: '4px' }}
              >
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-amber-100">{husky.name}</span>
                    {husky.isFollowing && (
                      <span className="text-[8px] bg-emerald-700 text-white px-1 rounded">🐾</span>
                    )}
                  </div>
                  {/* Mini Heart / Love bar */}
                  <div className="flex items-center gap-1 text-[9px]">
                    <Heart className={`w-2.5 h-2.5 ${isFullLove ? 'fill-yellow-400 text-yellow-400' : 'fill-rose-500 text-rose-500'}`} />
                    <span className={`font-extrabold ${isFullLove ? 'text-yellow-300' : 'text-amber-200'}`}>
                      {husky.love}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Hotbar */}
        <div className="pixel-box-wood p-1.5 rounded flex flex-col items-start gap-1 shadow-xl">
          {/* Active Item Description Tooltip */}
          {activeItem && (
            <div className="text-[10px] text-amber-200 flex items-center gap-1.5 font-medium px-1">
              <span className="font-bold text-amber-300">{activeItem.name}</span>
              <span className="text-emerald-400 font-bold">+{activeItem.loveBonus}% Amor</span>
            </div>
          )}

          {/* Hotbar Slots */}
          <div className="flex items-center gap-1">
            {inventory.map((item, index) => {
              const isActive = index === activeItemIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(index)}
                  className={`pixel-slot w-10 h-10 sm:w-11 sm:h-11 rounded flex flex-col items-center justify-center relative cursor-pointer ${isActive ? 'active' : ''
                    }`}
                >
                  <span className="absolute top-0.5 left-1 text-[8px] text-amber-400 font-bold">
                    {index + 1}
                  </span>

                  {/* Item Icon */}
                  <div className="text-sm sm:text-base">
                    {item.type === 'bone' && '🦴'}
                    {item.type === 'golden_bone' && '✨🦴'}
                    {item.type === 'moon_biscuit' && '🌙'}
                    {item.type === 'toy_ball' && '🎾'}
                    {item.type === 'brush' && '🪮'}
                    {item.type === 'magic_star' && '⭐'}
                  </div>

                  {/* Quantity badge */}
                  {item.count > 0 && (
                    <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold text-amber-100 bg-[#1e0f05] px-1 rounded-sm border border-[#78350f]">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
