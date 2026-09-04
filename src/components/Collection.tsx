import React, { useState } from 'react';
import { GachaItem, Character, Rarity, GachaItemCategory } from '../types';
import { sound } from '../utils/audio';
import {
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2,
  Crown,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';

interface CollectionProps {
  catalog: GachaItem[];
  savedCharacters: Character[];
  onLoadCharacterToCustomizer: (char: Character) => void;
  onApplyItemToCustomizer: (item: GachaItem) => void;
}

export const Collection: React.FC<CollectionProps> = ({
  catalog,
  savedCharacters,
  onLoadCharacterToCustomizer,
  onApplyItemToCustomizer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [activeItemModal, setActiveItemModal] = useState<GachaItem | null>(null);

  const unlockedCount = catalog.filter((c) => c.unlocked).length;
  const totalCount = catalog.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredItems = catalog.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
    return true;
  });

  const getRarityTag = (rarity: Rarity) => {
    switch (rarity) {
      case 'ur':
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-gradient-to-r from-amber-400 to-pink-500 text-white">
            UR
          </span>
        );
      case 'sr':
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-amber-500 text-white">
            SR
          </span>
        );
      case 'rare':
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-blue-500 text-white">
            RARE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-zinc-200 text-zinc-700">
            COMMON
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 flex flex-col gap-6">
      {/* Header with Stats & Completion Progress */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-800" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Collection Album
            </h2>
            <p className="text-xs text-zinc-500">
              Browse unlocked characters, mythical outfits, accessories, and studio scenes.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64 flex flex-col gap-1.5 bg-pink-50/80 p-3.5 rounded-2xl border border-pink-100">
          <div className="flex items-center justify-between text-xs font-extrabold text-zinc-700">
            <span>Unlocked</span>
            <span className="text-pink-600">
              {unlockedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-3xl border border-pink-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-wider pl-1 pr-1">
            Category:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'character', label: 'Characters' },
            { id: 'clothes', label: 'Clothes' },
            { id: 'hair', label: 'Hair' },
            { id: 'hat', label: 'Hats' },
            { id: 'wings', label: 'Wings' },
            { id: 'weapon', label: 'Items' },
            { id: 'backdrop', label: 'Backdrops' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => { sound.playClick(); setSelectedCategory(cat.id); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-pink-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rarity Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-wider pr-1">
            Rarity:
          </span>
          {['all', 'ur', 'sr', 'rare', 'common'].map((r) => (
            <button
              key={r}
              onClick={() => { sound.playClick(); setSelectedRarity(r); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase transition-all ${
                selectedRarity === r
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS SHOWCASE GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => {
                sound.playClick();
                setActiveItemModal(item);
              }}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 cursor-pointer transition-all hover:scale-105 relative ${
                item.unlocked
                  ? item.rarity === 'ur'
                    ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-pink-50 shadow-md ring-1 ring-amber-300'
                    : item.rarity === 'sr'
                    ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-pink-300 shadow-sm'
                  : 'border-zinc-200 bg-zinc-100 opacity-60'
              }`}
            >
              {/* Rarity & status tag */}
              <div className="flex items-center justify-between w-full">
                {getRarityTag(item.rarity)}
                {item.unlocked ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </div>

              {/* Visual Preview */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                style={{ backgroundColor: item.unlocked ? item.previewColor : '#94a3b8' }}
              >
                {item.unlocked ? (
                  item.category === 'character' ? <Crown className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />
                ) : (
                  <Lock className="w-6 h-6 text-zinc-200" />
                )}
              </div>

              {/* Title & Category */}
              <div>
                <h4 className="font-extrabold text-xs text-zinc-800 line-clamp-1">
                  {item.name}
                </h4>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">
                  {item.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL / EQUIP MODAL */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-pink-200 flex flex-col gap-4 text-center">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-xs font-black uppercase text-zinc-400">
                Item Information
              </span>
              <button
                onClick={() => setActiveItemModal(null)}
                className="text-zinc-400 hover:text-zinc-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div
              className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: activeItemModal.unlocked ? activeItemModal.previewColor : '#94a3b8' }}
            >
              {activeItemModal.unlocked ? (
                activeItemModal.category === 'character' ? <Crown className="w-10 h-10" /> : <Sparkles className="w-10 h-10" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>

            <div>
              <div className="mb-1">{getRarityTag(activeItemModal.rarity)}</div>
              <h3 className="text-lg font-black text-zinc-900" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {activeItemModal.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">{activeItemModal.description}</p>
            </div>

            {activeItemModal.unlocked ? (
              <div className="flex flex-col gap-2">
                {activeItemModal.category === 'character' && activeItemModal.characterPreset && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onLoadCharacterToCustomizer(activeItemModal.characterPreset!);
                      setActiveItemModal(null);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95"
                  >
                    <span>Load & Customize Character</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {activeItemModal.category !== 'character' && activeItemModal.category !== 'backdrop' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onApplyItemToCustomizer(activeItemModal);
                      setActiveItemModal(null);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-95"
                  >
                    <span>Equip to Active Character</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setActiveItemModal(null)}
                  className="w-full py-2 rounded-2xl bg-zinc-100 text-zinc-700 font-bold text-xs hover:bg-zinc-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium">
                  🔒 This item is locked. Summon it in the Gacha Pulls section!
                </div>
                <button
                  onClick={() => setActiveItemModal(null)}
                  className="w-full py-2 rounded-2xl bg-zinc-100 text-zinc-700 font-bold text-xs hover:bg-zinc-200"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
