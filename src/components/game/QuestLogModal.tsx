'use client';

import React from 'react';
import { Quest } from '../../types/game';
import { Award, CheckCircle2, Circle, X, Gift, Sparkles } from 'lucide-react';

interface QuestLogModalProps {
  onClose: () => void;
  quests: Quest[];
}

export const QuestLogModal: React.FC<QuestLogModalProps> = ({ onClose, quests }) => {
  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="pixel-box-parchment max-w-xl w-full max-h-[85vh] flex flex-col p-4 sm:p-6 rounded-lg relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 pixel-btn pixel-btn-wood w-8 h-8 rounded-full flex items-center justify-center text-rose-300 font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-center justify-between border-b-2 border-[#804c20] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#5c2a04]" />
            <h2 className="text-xl sm:text-2xl font-black text-[#3a1a04]">
              Misiones & Logros del Valle
            </h2>
          </div>
          <span className="text-xs font-extrabold bg-[#804c20] text-amber-100 px-3 py-1 rounded-full">
            {completedCount} / {quests.length} Completadas
          </span>
        </div>

        {/* QUESTS LIST */}
        <div className="flex flex-col gap-3 overflow-y-auto my-3 pr-1 max-h-[55vh]">
          {quests.map((quest) => {
            const isDone = quest.completed;
            const progressPercent = Math.min(
              100,
              Math.round((quest.current / quest.target) * 100)
            );

            return (
              <div
                key={quest.id}
                className={`p-3 rounded border-2 flex flex-col gap-2 transition-all ${
                  isDone
                    ? 'bg-[#e2f1d8] border-emerald-700/60'
                    : 'bg-[#faebd0] border-[#b88544]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#804c20] shrink-0" />
                    )}
                    <div>
                      <h3 className={`font-bold text-sm ${isDone ? 'text-emerald-950 line-through' : 'text-[#3b1d05]'}`}>
                        {quest.title}
                      </h3>
                      <p className="text-xs text-[#6e3c10] font-sans mt-0.5">
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#5c2a04] shrink-0">
                    {quest.current} / {quest.target}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#3a1a04]/20 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isDone ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Reward info */}
                <div className="flex items-center gap-1 text-[11px] text-[#6b3e15] font-semibold">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  <span>Recompensa: {quest.rewardText}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs text-[#6e3c10] border-t border-[#b88544] pt-2">
          🐾 Completa misiones para convertirte en el Guardián Supremo de los 5 Huskies.
        </div>
      </div>
    </div>
  );
};
