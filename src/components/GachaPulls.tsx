import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { GachaItem, PullResult, Character } from '../types';
import { performGachaPull } from '../data/gachaItems';
import { sound } from '../utils/audio';
import {
  Sparkles,
  Gift,
  Zap,
  Flame,
  Award,
  Crown,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  Star
} from 'lucide-react';

interface GachaPullsProps {
  gems: number;
  catalog: GachaItem[];
  onDeductGems: (amount: number) => void;
  onAddGems: (amount: number) => void;
  onAddCoins: (amount: number) => void;
  onUnlockItem: (item: GachaItem) => void;
  onUnlockCharacter: (character: Character) => void;
  onUnlockBackdrop: (backdropId: string) => void;
}

export const GachaPulls: React.FC<GachaPullsProps> = ({
  gems,
  catalog,
  onDeductGems,
  onAddGems,
  onAddCoins,
  onUnlockItem,
  onUnlockCharacter,
  onUnlockBackdrop,
}) => {
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pullAnimationStage, setPullAnimationStage] = useState<'idle' | 'charging' | 'revealing' | 'results'>('idle');
  const [revealedPulls, setRevealedPulls] = useState<PullResult[]>([]);
  const [showRatesModal, setShowRatesModal] = useState<boolean>(false);

  const startPull = (count: 1 | 10) => {
    const cost = count === 1 ? 100 : 1000;
    if (gems < cost) {
      alert('Not enough gems! Click the "+" button near Gems in the top bar to get free gems!');
      return;
    }

    sound.playGachaRoll();
    onDeductGems(cost);
    setIsPulling(true);
    setPullAnimationStage('charging');

    // Simulate charging & capsule crack sequence
    setTimeout(() => {
      sound.playCapsulePop();
      setPullAnimationStage('revealing');

      // Generate results
      const results: PullResult[] = [];
      let highestRarity: 'common' | 'rare' | 'sr' | 'ur' = 'common';

      for (let i = 0; i < count; i++) {
        const item = performGachaPull(catalog);
        const alreadyUnlocked = catalog.find((c) => c.id === item.id)?.unlocked || false;

        if (item.rarity === 'ur') highestRarity = 'ur';
        else if (item.rarity === 'sr' && highestRarity !== 'ur') highestRarity = 'sr';
        else if (item.rarity === 'rare' && highestRarity === 'common') highestRarity = 'rare';

        if (!alreadyUnlocked) {
          onUnlockItem(item);
          if (item.characterPreset) {
            onUnlockCharacter(item.characterPreset);
          }
          if (item.backdropId) {
            onUnlockBackdrop(item.backdropId);
          }
        } else {
          // Duplicate reward: bonus gems & coins
          const duplicateGems = item.rarity === 'ur' ? 300 : item.rarity === 'sr' ? 100 : item.rarity === 'rare' ? 40 : 15;
          onAddGems(duplicateGems);
          onAddCoins(duplicateGems * 2);
        }

        results.push({
          item,
          isNew: !alreadyUnlocked,
          duplicateGemsReward: alreadyUnlocked ? (item.rarity === 'ur' ? 300 : item.rarity === 'sr' ? 100 : item.rarity === 'rare' ? 40 : 15) : undefined,
        });
      }

      // Play victory fanfare sound
      sound.playRarityFanfare(highestRarity);

      // Trigger Confetti on SR or UR
      if (highestRarity === 'ur') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f43f5e', '#a855f7', '#06b6d4'],
        });
      } else if (highestRarity === 'sr') {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#ffffff'],
        });
      }

      setRevealedPulls(results);
      setTimeout(() => {
        setPullAnimationStage('results');
        setIsPulling(false);
      }, 700);
    }, 1200);
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'ur':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-white shadow-sm animate-pulse">
            UR ★★★★
          </span>
        );
      case 'sr':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-sm">
            SR ★★★
          </span>
        );
      case 'rare':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
            RARE ★★
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-zinc-200 text-zinc-700">
            COMMON ★
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 flex flex-col gap-6">
      {/* Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white p-6 sm:p-8 shadow-xl border-2 border-pink-300/30">
        {/* Background decorative anime sparks */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-pink-300 font-bold text-xs w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIMITED GACHA EVENT</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              Celestial Starlight Summon
            </h1>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Pull exclusive Ultra Rare (UR) heroes like <strong className="text-amber-300">Celestia Divine</strong> &{' '}
              <strong className="text-red-400">Kuro Dragon Lord</strong>, photon cyber wings, and mythical backdrops!
            </p>
          </div>

          {/* Probability & Rates Modal Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => { sound.playClick(); setShowRatesModal(true); }}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Gacha Rates (Probabilidades)</span>
            </button>
          </div>
        </div>
      </div>

      {/* GACHA CAPSULE MACHINE / STAGE */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-lg p-6 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
        {/* ANIMATION STATE: CHARGING / REVEALING */}
        {isPulling ? (
          <div className="flex flex-col items-center justify-center gap-6 py-12 text-center animate-pulse">
            {/* Glowing Capsule Animation */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-purple-600 blur-2xl opacity-75 animate-spin" />
              <div className="relative w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-pink-400 to-purple-600 shadow-2xl flex items-center justify-center text-white transform hover:scale-105 transition-transform">
                <Gift className="w-16 h-16 animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-purple-900 animate-pulse" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Summoning from the Stars...
              </h3>
              <p className="text-xs text-zinc-500 font-medium">Opening Mystery Gacha Capsule</p>
            </div>
          </div>
        ) : pullAnimationStage === 'results' && revealedPulls.length > 0 ? (
          /* RESULTS DISPLAY */
          <div className="w-full flex flex-col items-center gap-6 py-4">
            <div className="flex items-center justify-between w-full border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-lg sm:text-xl text-zinc-800" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Summon Results ({revealedPulls.length} items)
                </h3>
              </div>
              <button
                onClick={() => setPullAnimationStage('idle')}
                className="text-xs font-bold text-pink-600 hover:text-pink-800 flex items-center gap-1"
              >
                <span>Pull Again</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full">
              {revealedPulls.map((res, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center gap-2 relative transform hover:scale-105 transition-transform ${
                    res.item.rarity === 'ur'
                      ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-pink-50 shadow-lg ring-2 ring-amber-300'
                      : res.item.rarity === 'sr'
                      ? 'border-amber-300 bg-amber-50/70 shadow-md'
                      : res.item.rarity === 'rare'
                      ? 'border-blue-300 bg-blue-50/50 shadow-sm'
                      : 'border-zinc-200 bg-zinc-50'
                  }`}
                >
                  {/* NEW Badge */}
                  {res.isNew && (
                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white font-black text-[9px] rounded-full uppercase tracking-wider shadow-sm animate-bounce">
                      NEW!
                    </span>
                  )}

                  {/* Rarity */}
                  {getRarityBadge(res.item.rarity)}

                  {/* Icon / Preview circle */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black shadow-md"
                    style={{ backgroundColor: res.item.previewColor || '#a855f7' }}
                  >
                    {res.item.rarity === 'ur' ? (
                      <Crown className="w-7 h-7" />
                    ) : res.item.category === 'character' ? (
                      <Sparkles className="w-7 h-7" />
                    ) : (
                      <Gift className="w-7 h-7" />
                    )}
                  </div>

                  {/* Name & Category */}
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-900 line-clamp-1">
                      {res.item.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-bold">
                      {res.item.category}
                    </span>
                  </div>

                  {/* Duplicate Reward Notification */}
                  {!res.isNew && res.duplicateGemsReward && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      +{res.duplicateGemsReward} Gems (Dup)
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Back button */}
            <button
              onClick={() => {
                sound.playClick();
                setPullAnimationStage('idle');
              }}
              className="px-6 py-2.5 rounded-2xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-colors"
            >
              Back to Machine
            </button>
          </div>
        ) : (
          /* IDLE CAPSULE MACHINE VIEW */
          <div className="flex flex-col items-center justify-center gap-6 py-8 text-center max-w-md">
            {/* Visual Capsule Machine graphic */}
            <div className="relative">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-500 shadow-2xl p-2 flex items-center justify-center border-4 border-white animate-pulse">
                <div className="w-28 h-28 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                  <Gift className="w-14 h-14 drop-shadow-md" />
                </div>
              </div>
              {/* Star sparkles */}
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-spin" />
              <Star className="w-5 h-5 text-pink-400 absolute bottom-1 -left-2 fill-pink-400" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black text-zinc-800" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Ready to Summon?
              </h3>
              <p className="text-xs text-zinc-500">
                Unlock rare hairstyles, outfits, wings, weapons and pre-made anime characters!
              </p>
            </div>

            {/* Pull Action Buttons (Single 100 Gems, 10x 1000 Gems) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {/* Single Pull (100 Gems) */}
              <button
                id="btn-gacha-single-pull"
                onClick={() => startPull(1)}
                className="p-4 rounded-2xl border-2 border-cyan-400 bg-gradient-to-b from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 shadow-md flex flex-col items-center gap-1 transition-transform active:scale-95 group"
              >
                <span className="font-extrabold text-sm text-cyan-950">
                  Single Pull (1x)
                </span>
                <div className="flex items-center gap-1 text-cyan-800 font-black text-xs">
                  <span>💎 100 Gems</span>
                </div>
              </button>

              {/* 10x Pull (1000 Gems) */}
              <button
                id="btn-gacha-ten-pull"
                onClick={() => startPull(10)}
                className="p-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-pink-50 hover:from-amber-100 hover:to-pink-100 shadow-md flex flex-col items-center gap-1 transition-transform active:scale-95 relative group"
              >
                <span className="absolute -top-2.5 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-[10px] rounded-full uppercase tracking-wider shadow-sm">
                  ★ SR+ Guaranteed ★
                </span>
                <span className="font-extrabold text-sm text-amber-950">
                  10x Multi Pull
                </span>
                <div className="flex items-center gap-1 text-amber-800 font-black text-xs">
                  <span>💎 1,000 Gems</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RATES MODAL */}
      {showRatesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-extrabold text-lg text-zinc-900" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Gacha Drop Rates (Probabilidades)
              </h3>
              <button
                onClick={() => setShowRatesModal(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950">
                    UR
                  </span>
                  <span className="font-extrabold text-amber-950">Ultra Rare</span>
                </div>
                <span className="font-black text-amber-900 text-sm">2.0%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                    SR
                  </span>
                  <span className="font-extrabold text-amber-900">Super Rare</span>
                </div>
                <span className="font-black text-amber-800 text-sm">8.0%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-white">
                    RARE
                  </span>
                  <span className="font-extrabold text-blue-900">Rare</span>
                </div>
                <span className="font-black text-blue-800 text-sm">20.0%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-zinc-300 text-zinc-700">
                    COMMON
                  </span>
                  <span className="font-extrabold text-zinc-700">Common</span>
                </div>
                <span className="font-black text-zinc-600 text-sm">70.0%</span>
              </div>
            </div>

            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 text-[11px] text-pink-900 leading-relaxed">
              Pulling duplicates automatically refunds bonus gems and coins so you can keep summoning!
            </div>

            <button
              onClick={() => setShowRatesModal(false)}
              className="w-full py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
