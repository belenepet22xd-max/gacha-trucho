import React, { useState, useEffect } from 'react';
import { TabType, Character, GachaItem } from './types';
import { DEFAULT_PRESET_CHARACTERS } from './data/presets';
import { GACHA_CATALOG } from './data/gachaItems';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { Customizer } from './components/Customizer';
import { StudioMode } from './components/StudioMode';
import { GachaPulls } from './components/GachaPulls';
import { Collection } from './components/Collection';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<TabType>('customizer');

  // Audio mute state
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Currencies
  const [gems, setGems] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gacha_studio_gems');
      return saved !== null ? JSON.parse(saved) : 1500;
    } catch {
      return 1500;
    }
  });

  const [coins, setCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gacha_studio_coins');
      return saved !== null ? JSON.parse(saved) : 5000;
    } catch {
      return 5000;
    }
  });

  // Characters roster
  const [savedCharacters, setSavedCharacters] = useState<Character[]>(() => {
    try {
      const saved = localStorage.getItem('gacha_studio_roster');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_PRESET_CHARACTERS;
  });

  // Active character in Dress Up
  const [activeCharacter, setActiveCharacter] = useState<Character>(
    savedCharacters[0] || DEFAULT_PRESET_CHARACTERS[0]
  );

  // Gacha Catalog & unlocked items
  const [catalog, setCatalog] = useState<GachaItem[]>(() => {
    try {
      const saved = localStorage.getItem('gacha_studio_catalog');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return GACHA_CATALOG;
  });

  // Unlocked Backdrops
  const [unlockedBackdrops, setUnlockedBackdrops] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gacha_studio_backdrops');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return ['school_classroom', 'anime_city', 'magical_forest', 'concert_stage', 'cozy_bedroom', 'sunset_beach'];
  });

  // Export Modal Snapshot
  const [exportImageSrc, setExportImageSrc] = useState<string | null>(null);

  // Persist Currencies
  useEffect(() => {
    try {
      localStorage.setItem('gacha_studio_gems', JSON.stringify(gems));
      localStorage.setItem('gacha_studio_coins', JSON.stringify(coins));
    } catch {
      // ignore
    }
  }, [gems, coins]);

  // Persist Roster
  useEffect(() => {
    try {
      localStorage.setItem('gacha_studio_roster', JSON.stringify(savedCharacters));
    } catch {
      // ignore
    }
  }, [savedCharacters]);

  // Persist Catalog
  useEffect(() => {
    try {
      localStorage.setItem('gacha_studio_catalog', JSON.stringify(catalog));
    } catch {
      // ignore
    }
  }, [catalog]);

  // Persist Backdrops
  useEffect(() => {
    try {
      localStorage.setItem('gacha_studio_backdrops', JSON.stringify(unlockedBackdrops));
    } catch {
      // ignore
    }
  }, [unlockedBackdrops]);

  // Handlers
  const handleAddFreeGems = () => {
    setGems((prev) => prev + 500);
  };

  const handleSaveCharacter = (char: Character) => {
    setSavedCharacters((prev) => {
      const index = prev.findIndex((c) => c.id === char.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = char;
        return updated;
      }
      return [...prev, char];
    });
  };

  const handleDeleteCharacter = (id: string) => {
    if (savedCharacters.length <= 1) {
      alert('You must keep at least one character in your roster!');
      return;
    }
    const filtered = savedCharacters.filter((c) => c.id !== id);
    setSavedCharacters(filtered);
    if (activeCharacter.id === id) {
      setActiveCharacter(filtered[0]);
    }
  };

  const handleSelectCharacter = (char: Character) => {
    setActiveCharacter(char);
  };

  const handleUnlockItem = (item: GachaItem) => {
    setCatalog((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, unlocked: true } : c))
    );
  };

  const handleUnlockCharacter = (char: Character) => {
    setSavedCharacters((prev) => {
      if (prev.some((c) => c.id === char.id)) return prev;
      return [...prev, char];
    });
  };

  const handleUnlockBackdrop = (backdropId: string) => {
    setUnlockedBackdrops((prev) => {
      if (prev.includes(backdropId)) return prev;
      return [...prev, backdropId];
    });
  };

  const handleToggleMute = () => {
    const newMuted = sound.toggleMute();
    setIsMuted(newMuted);
  };

  const handleQuickExport = (canvasElement?: HTMLCanvasElement) => {
    sound.playCameraShutter();
    // If canvas element is explicitly passed (e.g. from Studio), use it;
    // otherwise query the active canvas in DOM.
    let canvas = canvasElement;
    if (!canvas) {
      canvas = document.querySelector('canvas') as HTMLCanvasElement;
    }
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setExportImageSrc(dataUrl);
    }
  };

  const handleLoadCharacterToCustomizer = (char: Character) => {
    setActiveCharacter(char);
    setCurrentTab('customizer');
  };

  const handleApplyItemToCustomizer = (item: GachaItem) => {
    if (!item.styleValue) return;
    const updated = { ...activeCharacter };

    switch (item.category) {
      case 'hat':
        updated.hatStyle = item.styleValue as any;
        break;
      case 'wings':
        updated.wingStyle = item.styleValue as any;
        break;
      case 'weapon':
        updated.handItemStyle = item.styleValue as any;
        break;
      case 'hair':
        updated.backHairStyle = item.styleValue as any;
        break;
      case 'clothes':
        if (item.styleValue === 'kimono_top' || item.styleValue === 'magical_corset' || item.styleValue === 'chibi_sweater') {
          updated.topStyle = item.styleValue as any;
        } else if (item.styleValue === 'cargo_pants' || item.styleValue === 'maid_apron_skirt') {
          updated.bottomStyle = item.styleValue as any;
        } else if (item.styleValue === 'cute_slippers') {
          updated.shoesStyle = item.styleValue as any;
        }
        break;
    }

    setActiveCharacter(updated);
    handleSaveCharacter(updated);
    setCurrentTab('customizer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFE4F3] bg-gradient-to-b from-[#FFF5F9] to-[#FFE4F3] text-[#4A4A4A] relative">
      {/* Background radial dot pattern from Vibrant Palette */}
      <div className="fixed inset-0 pointer-events-none opacity-25 vibrant-dot-pattern z-0" />

      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        gems={gems}
        coins={coins}
        onAddFreeGems={handleAddFreeGems}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onQuickExport={() => handleQuickExport()}
      />

      {/* Main Content View */}
      <main className="flex-1 pb-10 relative z-10">
        {currentTab === 'customizer' && (
          <Customizer
            character={activeCharacter}
            savedCharacters={savedCharacters}
            onUpdateCharacter={setActiveCharacter}
            onSaveCharacter={handleSaveCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onSelectCharacter={handleSelectCharacter}
            onQuickExport={() => handleQuickExport()}
          />
        )}

        {currentTab === 'studio' && (
          <StudioMode
            savedCharacters={savedCharacters}
            unlockedBackdrops={unlockedBackdrops}
            onQuickExport={(canvas) => handleQuickExport(canvas)}
          />
        )}

        {currentTab === 'gacha' && (
          <GachaPulls
            gems={gems}
            catalog={catalog}
            onDeductGems={(amount) => setGems((prev) => Math.max(0, prev - amount))}
            onAddGems={(amount) => setGems((prev) => prev + amount)}
            onAddCoins={(amount) => setCoins((prev) => prev + amount)}
            onUnlockItem={handleUnlockItem}
            onUnlockCharacter={handleUnlockCharacter}
            onUnlockBackdrop={handleUnlockBackdrop}
          />
        )}

        {currentTab === 'collection' && (
          <Collection
            catalog={catalog}
            savedCharacters={savedCharacters}
            onLoadCharacterToCustomizer={handleLoadCharacterToCustomizer}
            onApplyItemToCustomizer={handleApplyItemToCustomizer}
          />
        )}
      </main>

      {/* Retro Anime HUD Footer from Vibrant Palette */}
      <footer className="h-12 bg-[#7267CB] text-white flex items-center px-4 sm:px-6 text-xs font-bold justify-between border-t-2 border-[#5A51A2] z-20 relative">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="opacity-80 tracking-wide">SYSTEM READY: v2.4.0</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-mono">128 FPS</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-[#96FF9F] rounded-full animate-pulse"></div>
          <span className="tracking-wide">PLAYER LOGGED IN: GA_USER_992</span>
        </div>
      </footer>

      {/* Export Snapshot Modal */}
      {exportImageSrc && (
        <ExportModal
          imageSrc={exportImageSrc}
          onClose={() => setExportImageSrc(null)}
        />
      )}
    </div>
  );
}
