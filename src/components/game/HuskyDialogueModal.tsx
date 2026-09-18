'use client';

import React, { useState, useEffect } from 'react';
import { Husky, Item } from '../../types/game';
import { Heart, X, Footprints, Cookie, Edit3, Check, Sparkles, Award } from 'lucide-react';

interface HuskyDialogueModalProps {
  husky: Husky | null;
  onClose: () => void;
  onPet: (huskyId: string) => void;
  onFeed: (huskyId: string, item: Item) => void;
  onToggleFollow: (huskyId: string) => void;
  inventory: Item[];
  activeItem: Item | undefined;
  onOpenAlbum: () => void;
  onUpdateDescription?: (huskyId: string, description: string) => void;
}

export const HuskyDialogueModal: React.FC<HuskyDialogueModalProps> = ({
  husky,
  onClose,
  onPet,
  onFeed,
  onToggleFollow,
  inventory,
  onOpenAlbum,
  onUpdateDescription,
}) => {
  if (!husky) return null;

  const [description, setDescription] = useState(husky.customDescription || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setDescription(husky.customDescription || '');
  }, [husky.id]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);
    setIsSaved(false);
    if (onUpdateDescription) {
      onUpdateDescription(husky.id, val);
    }
  };

  const handleSaveClick = () => {
    if (onUpdateDescription) {
      onUpdateDescription(husky.id, description);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const heartsCount = Math.min(5, Math.floor(husky.love / 20));

  // Filter food/treat items available for feeding
  const feedableItems = inventory.filter(
    (item) => item.type === 'bone' || item.type === 'golden_bone' || item.type === 'moon_biscuit' || item.type === 'magic_star'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="pixel-box-parchment max-w-md w-full p-4 sm:p-6 rounded-lg relative flex flex-col gap-3.5 shadow-2xl border-4 border-[#4a2405] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 pixel-btn pixel-btn-wood w-8 h-8 rounded-full flex items-center justify-center text-rose-300 font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER: Husky Avatar & Name & Live Love Bar */}
        <div className="flex items-center gap-3.5 border-b-2 border-[#804c20] pb-3">
          {/* Avatar frame */}
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl shadow-inner border-4 relative shrink-0"
            style={{
              backgroundColor: '#1b233a',
              borderColor: husky.collarColor,
            }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/6236/6236513.png"
              alt="Husky"
              className="w-12 h-12 object-contain"
            />
            <span className="absolute -bottom-2 -right-1 text-xs bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full font-bold border border-amber-900 shadow">
              {husky.tagSymbol}
            </span>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-black tracking-wide text-[#3a1a04]">
              {husky.name}
            </h2>

            {/* Live Synchronized Hearts Bar */}
            <div className="flex items-center gap-1 mt-1">
              {[0, 1, 2, 3, 4].map((idx) => (
                <Heart
                  key={idx}
                  className={`w-5 h-5 transition-transform duration-200 ${idx < heartsCount
                    ? 'fill-rose-500 text-rose-600 scale-110'
                    : idx === heartsCount && husky.love % 20 > 0
                      ? 'fill-rose-300 text-rose-400'
                      : 'fill-stone-300 text-stone-400'
                    }`}
                />
              ))}
              <span className="text-base font-black text-[#5c2e07] ml-2 animate-pulse">
                {husky.love}%
              </span>
            </div>
          </div>
        </div>

        {/* PET & FOLLOW QUICK BUTTONS */}
        <div className="grid grid-cols-2 gap-2">
          {/* PET BUTTON */}
          <button
            onClick={() => onPet(husky.id)}
            className="pixel-btn pixel-btn-wood py-2 px-3 flex items-center justify-center gap-2 text-xs font-bold shadow-md"
          >
            <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-bounce" />
            <span>Acariciar (+8%)</span>
          </button>

          {/* TOGGLE FOLLOW BUTTON */}
          <button
            onClick={() => onToggleFollow(husky.id)}
            className={`pixel-btn py-2 px-3 flex items-center justify-center gap-2 text-xs font-bold shadow-md ${husky.isFollowing ? 'pixel-btn-blue' : 'pixel-btn-wood'
              }`}
          >
            <Footprints className="w-4 h-4" />
            <span>
              {husky.isFollowing ? '¡Quédate aquí!' : '¡Sígueme!'}
            </span>
          </button>
        </div>

        {/* FEEDING TREATS & BONES SECTION (Includes Golden Bones) */}
        <div className="flex flex-col gap-1.5 pt-2 border-t-2 border-[#804c20]">
          <span className="text-xs font-black text-[#5c2e07] flex items-center gap-1.5">
            <Cookie className="w-4 h-4 text-amber-800" />
            <span>Alimentar con Huesos y Premios:</span>
          </span>

          <div className="grid grid-cols-2 gap-2">
            {feedableItems.map((item) => {
              const hasCount = item.count > 0;
              const isGolden = item.type === 'golden_bone';
              const isStar = item.type === 'magic_star';

              return (
                <button
                  key={item.id}
                  onClick={() => hasCount && onFeed(husky.id, item)}
                  disabled={!hasCount}
                  className={`pixel-btn py-2 px-2.5 flex items-center justify-between text-xs font-black rounded shadow-md transition-transform ${hasCount
                    ? isGolden || isStar
                      ? 'pixel-btn-gold hover:scale-103'
                      : 'pixel-btn-wood hover:scale-103'
                    : 'bg-[#d6c5a8] text-[#8c7b64] border-2 border-[#b5a385] opacity-50 cursor-not-allowed'
                    }`}
                  title={hasCount ? `Dar ${item.name} (+${item.loveBonus}%)` : 'No tienes en el inventario'}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-base">
                      {item.type === 'bone' && '🦴'}
                      {item.type === 'golden_bone' && '🦴'}
                      {item.type === 'moon_biscuit' && '🌙'}
                      {item.type === 'magic_star' && '⭐'}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-black ${hasCount ? 'bg-black/25 text-amber-100' : 'text-[#8c7b64]'}`}>
                    x{item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* USER EDITABLE DESCRIPTION AREA */}
        <div className="flex flex-col gap-1 pt-2 border-t-2 border-[#804c20]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-[#5c2e07] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-800" />
              <span>Descripción de {husky.name}:</span>
            </label>
            {isSaved && (
              <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3 h-3" /> ¡Guardado!
              </span>
            )}
          </div>

          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder={`Escribe aquí la descripción o notas sobre ${husky.name}...`}
            rows={2}
            className="w-full p-2 rounded text-xs bg-[#fff8e7] border-2 border-[#804c20] text-[#3a1a04] placeholder:text-[#804c20]/50 focus:outline-none focus:border-amber-700 shadow-inner resize-none font-sans"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSaveClick}
              className="text-[10px] font-bold bg-[#804c20] text-amber-100 hover:bg-[#5c2e07] px-2.5 py-0.5 rounded transition-colors shadow-sm cursor-pointer"
            >
              Guardar Nota
            </button>
          </div>
        </div>

        {/* MEMORY ALBUM LINK */}
        {/* <button
          onClick={() => {
            onClose();
            onOpenAlbum();
          }}
          className="text-center text-xs text-[#6e3505] hover:text-[#2d1400] font-bold underline cursor-pointer pt-1"
        >
          📷 Ver fotos polaroid de {husky.name} en el álbum
        </button> */}
      </div>
    </div>
  );
};
