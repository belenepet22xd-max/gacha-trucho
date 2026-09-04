import React from 'react';
import { Sparkles, Camera, Volume2, VolumeX, PlusCircle, Palette, Film, Gift, Trophy } from 'lucide-react';
import { TabType } from '../types';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  gems: number;
  coins: number;
  onAddFreeGems: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onQuickExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  gems,
  coins,
  onAddFreeGems,
  isMuted,
  onToggleMute,
  onQuickExport,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'customizer', label: 'Dress Up', icon: <Palette className="w-4 h-4" /> },
    { id: 'studio', label: 'Studio Mode', icon: <Film className="w-4 h-4" /> },
    { id: 'gacha', label: 'Gacha Pulls', icon: <Gift className="w-4 h-4" />, badge: 'HOT' },
    { id: 'collection', label: 'Collection', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-[#FF8CC6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div 
          onClick={() => { sound.playClick(); onSelectTab('customizer'); }}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FF5DA8] flex items-center justify-center text-white shadow-md border-2 border-white transform group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-black text-[#FF5DA8] tracking-tighter" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              GACHA<span className="text-[#7267CB]">STUDIO</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 h-full pt-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  sound.playTabSwitch();
                  onSelectTab(item.id);
                }}
                className={`px-3 sm:px-4 py-2 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all rounded-t-lg select-none whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FF5DA8] text-white shadow-sm'
                    : 'text-[#888] hover:bg-[#FFEBF5] hover:text-[#4A4A4A]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="hidden lg:inline-block ml-1 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-[#FFF089] text-[#8B7500] border border-[#E5C100] rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Currency & Utilities */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Coins counter */}
          <div className="hidden sm:flex bg-[#FFF089] px-3 py-1 rounded-full border-2 border-[#E5C100] items-center shadow-sm">
            <div className="w-5 h-5 bg-yellow-500 rounded-full mr-2 border border-white shadow-sm flex items-center justify-center text-[10px] text-white font-bold">
              🪙
            </div>
            <span className="font-bold text-[#8B7500] text-xs sm:text-sm">
              {coins.toLocaleString()}
            </span>
          </div>

          {/* Gems counter */}
          <div className="bg-[#A0E9FF] px-3 py-1 rounded-full border-2 border-[#00B4E5] flex items-center shadow-sm">
            <div className="w-5 h-5 bg-blue-500 rounded-full mr-2 border border-white shadow-sm flex items-center justify-center text-[10px] text-white font-bold">
              💎
            </div>
            <span className="font-bold text-[#006682] text-xs sm:text-sm">
              {gems.toLocaleString()}
            </span>
            <button
              title="Get 500 Free Gems!"
              onClick={() => {
                sound.playCoin();
                onAddFreeGems();
              }}
              className="ml-1.5 text-[#006682] hover:text-[#00475b] hover:scale-110 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Camera snapshot button */}
          <button
            id="btn-quick-export"
            onClick={onQuickExport}
            title="Export Scene as PNG"
            className="bg-[#7267CB] text-white px-3 py-1.5 rounded-xl border-b-2 border-[#5A51A2] hover:border-b-0 hover:translate-y-0.5 transition-all shadow-md flex items-center gap-1.5 font-bold text-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Snapshot</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="btn-sound-mute"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-1.5 rounded-xl border-2 border-pink-200 bg-white hover:bg-[#FFEBF5] text-[#7267CB] transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-[#7267CB]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
