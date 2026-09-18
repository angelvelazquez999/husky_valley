'use client';

import React from 'react';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Heart, Sparkles, CircleDot, Shovel 
} from 'lucide-react';

interface VirtualControlsProps {
  onDirectionPress: (dir: 'up' | 'down' | 'left' | 'right', isPressed: boolean) => void;
  onActionPress: (action: 'interact' | 'dig' | 'throw' | 'whistle') => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionPress,
  onActionPress,
}) => {
  return (
    <div className="md:hidden absolute inset-x-0 bottom-24 px-4 flex items-end justify-between pointer-events-none z-30 select-none">
      {/* D-PAD (Left Side) */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1 w-32 h-32 bg-black/40 backdrop-blur-sm p-1.5 rounded-full border-2 border-amber-900/60 shadow-lg">
        <div />
        <button
          onTouchStart={() => onDirectionPress('up', true)}
          onTouchEnd={() => onDirectionPress('up', false)}
          onMouseDown={() => onDirectionPress('up', true)}
          onMouseUp={() => onDirectionPress('up', false)}
          className="pixel-btn pixel-btn-wood flex items-center justify-center rounded-t-lg active:scale-95"
        >
          <ArrowUp className="w-5 h-5 text-amber-200" />
        </button>
        <div />

        <button
          onTouchStart={() => onDirectionPress('left', true)}
          onTouchEnd={() => onDirectionPress('left', false)}
          onMouseDown={() => onDirectionPress('left', true)}
          onMouseUp={() => onDirectionPress('left', false)}
          className="pixel-btn pixel-btn-wood flex items-center justify-center rounded-l-lg active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-amber-200" />
        </button>
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-amber-800" />
        </div>
        <button
          onTouchStart={() => onDirectionPress('right', true)}
          onTouchEnd={() => onDirectionPress('right', false)}
          onMouseDown={() => onDirectionPress('right', true)}
          onMouseUp={() => onDirectionPress('right', false)}
          className="pixel-btn pixel-btn-wood flex items-center justify-center rounded-r-lg active:scale-95"
        >
          <ArrowRight className="w-5 h-5 text-amber-200" />
        </button>

        <div />
        <button
          onTouchStart={() => onDirectionPress('down', true)}
          onTouchEnd={() => onDirectionPress('down', false)}
          onMouseDown={() => onDirectionPress('down', true)}
          onMouseUp={() => onDirectionPress('down', false)}
          className="pixel-btn pixel-btn-wood flex items-center justify-center rounded-b-lg active:scale-95"
        >
          <ArrowDown className="w-5 h-5 text-amber-200" />
        </button>
        <div />
      </div>

      {/* ACTION BUTTONS (Right Side) */}
      <div className="pointer-events-auto flex flex-col gap-2 items-end">
        <div className="flex items-center gap-2">
          {/* Dig Button */}
          <button
            onClick={() => onActionPress('dig')}
            className="pixel-btn pixel-btn-wood w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-lg active:scale-90"
            title="Excavar Montículo"
          >
            <span className="text-sm">⛏️</span>
            <span className="text-[8px] font-bold text-amber-200">Cavar</span>
          </button>

          {/* Throw Ball Button */}
          <button
            onClick={() => onActionPress('throw')}
            className="pixel-btn pixel-btn-gold w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-lg active:scale-90"
            title="Lanzar Pelota"
          >
            <CircleDot className="w-5 h-5 text-rose-800" />
            <span className="text-[8px] font-bold text-amber-950">Lanzar</span>
          </button>
        </div>

        {/* Big Interact / Pet / Feed Button */}
        <button
          onClick={() => onActionPress('interact')}
          className="pixel-btn pixel-btn-wood w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 border-amber-500 shadow-xl active:scale-95"
          title="Interactuar / Acariciar"
        >
          <Heart className="w-6 h-6 fill-rose-500 text-rose-500 animate-pulse" />
          <span className="text-[9px] font-black text-amber-200 mt-0.5">Acción</span>
        </button>
      </div>
    </div>
  );
};
