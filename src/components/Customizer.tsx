import React, { useRef, useEffect, useState } from 'react';
import {
  Character,
  SkinTone,
  EyeStyle,
  EyebrowStyle,
  MouthStyle,
  BlushStyle,
  FrontHairStyle,
  BackHairStyle,
  TopStyle,
  BottomStyle,
  ShoesStyle,
  JacketStyle,
  HatStyle,
  WingStyle,
  HandItemStyle,
  PoseType
} from '../types';
import { CanvasRenderer } from '../utils/canvasRenderer';
import { sound } from '../utils/audio';
import {
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  CLOTHING_COLORS,
  createNewCharacter
} from '../data/presets';
import {
  Sparkles,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  Save,
  Plus,
  Trash2,
  Dices,
  Eye,
  Smile,
  Scissors,
  Shirt,
  Crown,
  Maximize2,
  Check
} from 'lucide-react';

interface CustomizerProps {
  character: Character;
  savedCharacters: Character[];
  onUpdateCharacter: (char: Character) => void;
  onSaveCharacter: (char: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onSelectCharacter: (char: Character) => void;
  onQuickExport: () => void;
}

type CustomizerCategory = 'face' | 'hair' | 'clothes' | 'accessories' | 'pose_transform';

export const Customizer: React.FC<CustomizerProps> = ({
  character,
  savedCharacters,
  onUpdateCharacter,
  onSaveCharacter,
  onDeleteCharacter,
  onSelectCharacter,
  onQuickExport,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<CustomizerCategory>('face');
  const [activeSubTab, setActiveSubTab] = useState<string>('eyes');
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);

  // Redraw canvas whenever character changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth || 500;
    const displayHeight = canvas.clientHeight || 560;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    CanvasRenderer.renderScene(ctx, {
      width: displayWidth,
      height: displayHeight,
      singleCharacter: character,
      showGrid: true,
    });
    ctx.restore();
  }, [character]);

  const updateProp = <K extends keyof Character>(prop: K, value: Character[K]) => {
    sound.playClick();
    onUpdateCharacter({
      ...character,
      [prop]: value,
    });
  };

  const handleSave = () => {
    sound.playCoin();
    onSaveCharacter(character);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);
  };

  const handleRandomize = () => {
    sound.playGachaRoll();
    const randSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].color;
    const randHair = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
    const randEyeColor = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].color;
    const randTopColor = CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)].color;
    const randBottomColor = CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)].color;

    const eyeStyles: EyeStyle[] = ['sparkle_anime', 'gentle_round', 'tsundere_sharp', 'cat_slanted', 'wink', 'dramatic_stars'];
    const mouthStyles: MouthStyle[] = ['smile', 'big_open', 'cat_w', 'fang_grin', 'pout', 'neutral'];
    const frontHairs: FrontHairStyle[] = ['straight_bangs', 'side_swept', 'twin_side_bangs', 'messy_anime', 'spiky_hero', 'hime_fringe'];
    const backHairs: BackHairStyle[] = ['short_bob', 'twin_tails', 'high_ponytail', 'long_straight', 'drill_curls', 'wolf_cut'];
    const tops: TopStyle[] = ['sailor_uniform', 'hoodie_casual', 'idol_vest', 'magical_corset', 'chibi_sweater', 'kimono_top'];
    const bottoms: BottomStyle[] = ['pleated_skirt', 'denim_shorts', 'cargo_pants', 'frill_tier_skirt', 'maid_apron_skirt'];
    const hats: HatStyle[] = ['none', 'cat_ears', 'bunny_ears', 'royal_crown', 'witch_hat', 'gaming_headphones', 'big_ribbon'];
    const wings: WingStyle[] = ['none', 'angel_feathers', 'bat_devil', 'fairy_sparkle', 'cyber_wings'];
    const items: HandItemStyle[] = ['none', 'magic_wand', 'star_staff', 'boba_milk_tea', 'katana_sword', 'singing_mic', 'plushie_bear'];
    const poses: PoseType[] = ['stand', 'peace', 'wave', 'cheer', 'cross_arms'];

    onUpdateCharacter({
      ...character,
      skinTone: randSkin,
      hairColor: randHair.color,
      hairHighlightColor: randHair.highlight,
      eyeColor: randEyeColor,
      topColor: randTopColor,
      bottomColor: randBottomColor,
      eyeStyle: eyeStyles[Math.floor(Math.random() * eyeStyles.length)],
      mouthStyle: mouthStyles[Math.floor(Math.random() * mouthStyles.length)],
      frontHairStyle: frontHairs[Math.floor(Math.random() * frontHairs.length)],
      backHairStyle: backHairs[Math.floor(Math.random() * backHairs.length)],
      topStyle: tops[Math.floor(Math.random() * tops.length)],
      bottomStyle: bottoms[Math.floor(Math.random() * bottoms.length)],
      hatStyle: hats[Math.floor(Math.random() * hats.length)],
      wingStyle: wings[Math.floor(Math.random() * wings.length)],
      handItemStyle: items[Math.floor(Math.random() * items.length)],
      pose: poses[Math.floor(Math.random() * poses.length)],
    });
  };

  const handleNewCharacter = () => {
    sound.playClick();
    const newChar = createNewCharacter(`Chibi #${savedCharacters.length + 1}`);
    onUpdateCharacter(newChar);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Stage Canvas & Direct Transform Controls */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4">
        {/* Character Title Bar & Saved Slots quick picker */}
        <div className="bg-white p-4 rounded-3xl border-4 border-[#FF8CC6] shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <input
              id="character-name-input"
              type="text"
              value={character.name}
              onChange={(e) => updateProp('name', e.target.value)}
              className="font-extrabold text-xl sm:text-2xl text-[#4A4A4A] bg-[#FFF5F9] hover:bg-[#FFEBF5] focus:bg-white px-3 py-1.5 rounded-2xl border-2 border-[#FF8CC6] focus:outline-none focus:ring-2 focus:ring-[#FF5DA8] w-full"
              placeholder="Character Name..."
            />
            <button
              id="btn-save-character"
              onClick={handleSave}
              className={`px-4 py-2 rounded-2xl font-bold text-sm flex items-center gap-1.5 transition-all shadow-md ${
                isSavedFeedback
                  ? 'bg-[#96FF9F] text-[#006622] border-b-4 border-[#5cd668]'
                  : 'bg-white text-[#4A4A4A] border-b-4 border-gray-300 hover:border-b-0 hover:translate-y-1'
              }`}
            >
              {isSavedFeedback ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4 text-[#FF5DA8]" />}
              <span>{isSavedFeedback ? 'Saved!' : 'Save'}</span>
            </button>
          </div>

          {/* Quick Roster Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={handleNewCharacter}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl border-2 border-dashed border-[#FF8CC6] text-[#FF5DA8] hover:bg-[#FFEBF5] font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            {savedCharacters.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  sound.playClick();
                  onSelectCharacter(c);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  character.id === c.id
                    ? 'bg-[#FF5DA8] text-white shadow-md'
                    : 'bg-gray-100 text-[#4A4A4A] hover:bg-[#FFEBF5] hover:text-[#FF5DA8]'
                }`}
              >
                <span>{c.name}</span>
                {savedCharacters.length > 1 && character.id === c.id && (
                  <Trash2
                    className="w-3 h-3 text-white/80 hover:text-white hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onDeleteCharacter(c.id);
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* The HTML5 Canvas Stage */}
        <div className="relative bg-white rounded-3xl border-4 border-[#FF8CC6] shadow-xl overflow-hidden flex items-center justify-center aspect-[4/5] max-h-[560px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain cursor-crosshair"
          />

          {/* Floating Currently Editing Badge from Vibrant Palette */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border-4 border-[#FF8CC6] shadow-xl w-44 pointer-events-none hidden sm:block z-10">
            <div className="text-[10px] font-bold text-[#FF5DA8] uppercase mb-0.5 tracking-wider">Currently Editing</div>
            <div className="text-sm font-black text-[#4A4A4A] truncate">{character.name || 'Aika-chan'}</div>
            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-[#7267CB] rounded-full"></div>
            </div>
          </div>

          {/* Floating Action Buttons over Canvas */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <button
              onClick={handleRandomize}
              title="Randomize Character Appearance"
              className="w-10 h-10 rounded-2xl bg-white shadow-md border-2 border-[#FF8CC6] flex items-center justify-center text-[#FF5DA8] hover:bg-[#FFEBF5] hover:scale-105 active:scale-95 transition-all"
            >
              <Dices className="w-5 h-5" />
            </button>
            <button
              onClick={() => updateProp('flipX', !character.flipX)}
              title="Mirror / Flip Character"
              className={`w-10 h-10 rounded-2xl shadow-md border-2 flex items-center justify-center transition-all ${
                character.flipX
                  ? 'bg-[#7267CB] text-white border-[#5A51A2]'
                  : 'bg-white border-[#FF8CC6] text-[#4A4A4A] hover:bg-[#FFEBF5]'
              }`}
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={onQuickExport}
              title="Download PNG Snapshot"
              className="w-10 h-10 rounded-2xl bg-[#7267CB] shadow-md border-2 border-[#5A51A2] flex items-center justify-center text-white hover:bg-[#5A51A2] hover:scale-105 active:scale-95 transition-all"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Canvas Bottom Overlay Controls: Scale, Rotation, Reset */}
          <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-[#FF8CC6] shadow-md flex items-center justify-between text-xs font-semibold z-10">
            {/* Zoom / Scale */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateProp('scale', Math.max(0.6, Number((character.scale - 0.1).toFixed(1))))}
                className="p-1 rounded-lg hover:bg-[#FFEBF5] text-[#4A4A4A]"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-[#4A4A4A]">
                {Math.round(character.scale * 100)}%
              </span>
              <button
                onClick={() => updateProp('scale', Math.min(1.6, Number((character.scale + 0.1).toFixed(1))))}
                className="p-1 rounded-lg hover:bg-[#FFEBF5] text-[#4A4A4A]"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => updateProp('rotation', (character.rotation - 10) % 360)}
                className="px-2 py-0.5 rounded-lg bg-[#FFEBF5] hover:bg-[#FF8CC6]/30 text-[#FF5DA8] font-bold"
              >
                -10°
              </button>
              <span className="w-8 text-center text-[#4A4A4A] font-bold">
                {character.rotation}°
              </span>
              <button
                onClick={() => updateProp('rotation', (character.rotation + 10) % 360)}
                className="px-2 py-0.5 rounded-lg bg-[#FFEBF5] hover:bg-[#FF8CC6]/30 text-[#FF5DA8] font-bold"
              >
                +10°
              </button>
            </div>

            {/* Reset transform */}
            <button
              onClick={() => {
                sound.playClick();
                onUpdateCharacter({
                  ...character,
                  scale: 1,
                  rotation: 0,
                  offsetX: 0,
                  offsetY: 0,
                  flipX: false,
                });
              }}
              className="text-[#FF5DA8] hover:text-[#d44186] font-bold underline"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Poses selector bar */}
        <div className="bg-white p-3.5 rounded-3xl border-4 border-[#FF8CC6] shadow-xl flex items-center justify-between gap-1 overflow-x-auto">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider px-2">
            Pose:
          </span>
          {(['stand', 'peace', 'wave', 'cheer', 'cross_arms'] as PoseType[]).map((pose) => (
            <button
              key={pose}
              id={`pose-btn-${pose}`}
              onClick={() => updateProp('pose', pose)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs capitalize transition-all ${
                character.pose === pose
                  ? 'bg-[#FF5DA8] text-white shadow-md'
                  : 'bg-[#FFEBF5] text-[#4A4A4A] hover:bg-[#FF8CC6]/40'
              }`}
            >
              {pose.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Customization Tabs and Styling Options */}
      <div className="lg:col-span-6 xl:col-span-7 bg-white rounded-3xl border-4 border-[#FF8CC6] shadow-xl p-4 sm:p-6 flex flex-col gap-5">
        {/* Main Category Tabs */}
        <div className="grid grid-cols-4 gap-2 bg-[#FFEBF5] p-1.5 rounded-2xl border-2 border-[#FF8CC6]/50">
          {[
            { id: 'face', label: 'Face / Rostro', icon: <Smile className="w-4 h-4" /> },
            { id: 'hair', label: 'Hair / Cabello', icon: <Scissors className="w-4 h-4" /> },
            { id: 'clothes', label: 'Clothes / Ropa', icon: <Shirt className="w-4 h-4" /> },
            { id: 'accessories', label: 'Items / Accs', icon: <Crown className="w-4 h-4" /> },
          ].map((cat) => (
            <button
              key={cat.id}
              id={`cat-tab-${cat.id}`}
              onClick={() => {
                sound.playTabSwitch();
                setActiveCategory(cat.id as CustomizerCategory);
                if (cat.id === 'face') setActiveSubTab('eyes');
                else if (cat.id === 'hair') setActiveSubTab('front');
                else if (cat.id === 'clothes') setActiveSubTab('top');
                else if (cat.id === 'accessories') setActiveSubTab('hats');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#FF5DA8] text-white shadow-inner border-2 border-white'
                  : 'text-[#888] hover:text-[#4A4A4A] hover:bg-white/60'
              }`}
            >
              {cat.icon}
              <span className="truncate">{cat.label.split(' / ')[0]}</span>
            </button>
          ))}
        </div>

        {/* SUB-TABS ROW */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b-2 border-gray-100">
          {activeCategory === 'face' && (
            <>
              {['eyes', 'eyebrows', 'mouth', 'blush', 'skin'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => { sound.playClick(); setActiveSubTab(sub); }}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize transition-colors ${
                    activeSubTab === sub
                      ? 'bg-[#7267CB] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-[#FFEBF5] hover:text-[#FF5DA8]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </>
          )}

          {activeCategory === 'hair' && (
            <>
              {['front', 'back', 'hair_colors'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => { sound.playClick(); setActiveSubTab(sub); }}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize transition-colors ${
                    activeSubTab === sub
                      ? 'bg-[#7267CB] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-[#FFEBF5] hover:text-[#FF5DA8]'
                  }`}
                >
                  {sub.replace('_', ' ')}
                </button>
              ))}
            </>
          )}

          {activeCategory === 'clothes' && (
            <>
              {['top', 'bottom', 'shoes', 'jackets', 'clothing_colors'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => { sound.playClick(); setActiveSubTab(sub); }}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize transition-colors ${
                    activeSubTab === sub
                      ? 'bg-[#7267CB] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-[#FFEBF5] hover:text-[#FF5DA8]'
                  }`}
                >
                  {sub.replace('_', ' ')}
                </button>
              ))}
            </>
          )}

          {activeCategory === 'accessories' && (
            <>
              {['hats', 'wings', 'weapons_items'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => { sound.playClick(); setActiveSubTab(sub); }}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize transition-colors ${
                    activeSubTab === sub
                      ? 'bg-[#7267CB] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-[#FFEBF5] hover:text-[#FF5DA8]'
                  }`}
                >
                  {sub.replace('_', ' ')}
                </button>
              ))}
            </>
          )}
        </div>

        {/* SELECTION GRID CONTAINER */}
        <div className="min-h-[300px] flex flex-col gap-4">
          {/* FACE CATEGORY CONTENT */}
          {activeCategory === 'face' && (
            <>
              {activeSubTab === 'eyes' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                      Eye Styles
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'sparkle_anime', name: 'Sparkle Anime' },
                        { id: 'gentle_round', name: 'Gentle Round' },
                        { id: 'tsundere_sharp', name: 'Tsundere Sharp' },
                        { id: 'cat_slanted', name: 'Neko Slanted' },
                        { id: 'happy_closed', name: 'Happy Closed ^^' },
                        { id: 'wink', name: 'Charming Wink' },
                        { id: 'dramatic_stars', name: 'Star Eyes ★' },
                        { id: 'sleepy', name: 'Sleepy Gaze' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => updateProp('eyeStyle', item.id as EyeStyle)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                            character.eyeStyle === item.id
                              ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300 font-bold text-pink-900'
                              : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          <Eye className="w-5 h-5 text-pink-500" />
                          <span className="text-xs">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Eye Colors */}
                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                      Eye Color
                    </h4>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {EYE_COLORS.map((ec) => (
                        <button
                          key={ec.color}
                          onClick={() => updateProp('eyeColor', ec.color)}
                          className={`w-9 h-9 rounded-2xl border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                            character.eyeColor === ec.color ? 'border-zinc-800 scale-110 shadow-md' : 'border-white'
                          }`}
                          style={{ backgroundColor: ec.color }}
                          title={ec.name}
                        >
                          {character.eyeColor === ec.color && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                      {/* Color Picker Input */}
                      <input
                        type="color"
                        value={character.eyeColor}
                        onChange={(e) => updateProp('eyeColor', e.target.value)}
                        className="w-9 h-9 rounded-2xl cursor-pointer border border-zinc-300 p-0.5"
                        title="Custom Color"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'eyebrows' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Eyebrow Styles
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'happy', name: 'Happy / Normal' },
                      { id: 'serious', name: 'Serious / Bold' },
                      { id: 'angry', name: 'Angry / Determined' },
                      { id: 'worried', name: 'Worried / Soft' },
                      { id: 'dots', name: 'Kuge Dots' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateProp('eyebrowStyle', item.id as EyebrowStyle)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          character.eyebrowStyle === item.id
                            ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 font-bold text-purple-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'mouth' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Mouth & Expressions
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'smile', name: 'Gentle Smile :)' },
                      { id: 'big_open', name: 'Big Open Cheer :D' },
                      { id: 'cat_w', name: 'Anime Cat :3' },
                      { id: 'fang_grin', name: 'Vampire Fang Grin' },
                      { id: 'pout', name: 'Cute Pout :<' },
                      { id: 'neutral', name: 'Calm Neutral :|' },
                      { id: 'o_shock', name: 'Shocked :O' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateProp('mouthStyle', item.id as MouthStyle)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          character.mouthStyle === item.id
                            ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300 font-bold text-pink-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'blush' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Blush & Effects
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'none', name: 'None' },
                      { id: 'soft_pink', name: 'Soft Pink Blush (///)' },
                      { id: 'heavy_blush', name: 'Heavy Tsundere Blush' },
                      { id: 'star_cheeks', name: 'Star Cheeks ★' },
                      { id: 'anime_sweat', name: 'Anime Sweatdrop' },
                      { id: 'crying_tears', name: 'Dramatic Tears ;;' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateProp('blushStyle', item.id as BlushStyle)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          character.blushStyle === item.id
                            ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300 font-bold text-pink-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'skin' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Skin Tone Palette
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {SKIN_TONES.map((st) => (
                      <button
                        key={st.color}
                        onClick={() => updateProp('skinTone', st.color)}
                        className={`aspect-square rounded-2xl border-2 transition-transform hover:scale-105 flex flex-col items-center justify-center p-1 ${
                          character.skinTone === st.color
                            ? 'border-purple-600 scale-105 shadow-md ring-2 ring-purple-300'
                            : 'border-zinc-200'
                        }`}
                        style={{ backgroundColor: st.color }}
                        title={st.name}
                      >
                        {character.skinTone === st.color && <Check className="w-5 h-5 text-zinc-800" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* HAIR CATEGORY CONTENT */}
          {activeCategory === 'hair' && (
            <>
              {activeSubTab === 'front' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Front Hair / Bangs Style
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'straight_bangs', name: 'Straight Blunt Bangs' },
                      { id: 'twin_side_bangs', name: 'Twin Locks Bangs' },
                      { id: 'side_swept', name: 'Side Swept Chic' },
                      { id: 'spiky_hero', name: 'Shonen Spiky Bangs' },
                      { id: 'hime_fringe', name: 'Traditional Hime Cut' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateProp('frontHairStyle', item.id as FrontHairStyle)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          character.frontHairStyle === item.id
                            ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 font-bold text-purple-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'back' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Back Hair Style
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'short_bob', name: 'Cute Bob Cut' },
                      { id: 'twin_tails', name: 'Anime Twin Tails ★' },
                      { id: 'high_ponytail', name: 'High Ponytail' },
                      { id: 'long_straight', name: 'Long Straight Locks' },
                      { id: 'drill_curls', name: 'Ojou Spiral Drills' },
                      { id: 'wavy_long', name: 'Wavy Mermaid Hair' },
                      { id: 'wolf_cut', name: 'Layered Wolf Cut' },
                      { id: 'low_buns', name: 'Double Odango Buns' },
                      { id: 'spiky_short', name: 'Short Spikes' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateProp('backHairStyle', item.id as BackHairStyle)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          character.backHairStyle === item.id
                            ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 font-bold text-purple-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'hair_colors' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                      Hair Color Presets
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {HAIR_COLORS.map((hc) => (
                        <button
                          key={hc.name}
                          onClick={() => {
                            sound.playClick();
                            onUpdateCharacter({
                              ...character,
                              hairColor: hc.color,
                              hairHighlightColor: hc.highlight,
                            });
                          }}
                          className={`p-2 rounded-2xl border flex items-center gap-2 transition-all ${
                            character.hairColor === hc.color
                              ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-300 font-bold'
                              : 'border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-xl border border-black/10 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: hc.color }}
                          />
                          <span className="text-xs truncate">{hc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-pink-50/50 p-3 rounded-2xl border border-pink-100">
                    <div>
                      <span className="text-xs font-bold text-zinc-700 block mb-1">Custom Color:</span>
                      <input
                        type="color"
                        value={character.hairColor}
                        onChange={(e) => updateProp('hairColor', e.target.value)}
                        className="w-12 h-9 rounded-xl cursor-pointer border border-zinc-300 p-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-700 block mb-1">Highlight Tone:</span>
                      <input
                        type="color"
                        value={character.hairHighlightColor}
                        onChange={(e) => updateProp('hairHighlightColor', e.target.value)}
                        className="w-12 h-9 rounded-xl cursor-pointer border border-zinc-300 p-0.5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CLOTHES CATEGORY CONTENT */}
          {activeCategory === 'clothes' && (
            <>
              {activeSubTab === 'top' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Top / Shirts / Blazers
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'sailor_uniform', name: 'School Sailor Uniform' },
                      { id: 'hoodie_casual', name: 'Casual Street Hoodie' },
                      { id: 'idol_vest', name: 'Pop Idol Stage Vest' },
                      { id: 'magical_corset', name: 'Magical Girl Corset' },
                      { id: 'chibi_sweater', name: 'Cozy Knit Sweater' },
                      { id: 'leather_jacket_top', name: 'Biker Leather Top' },
                      { id: 'kimono_top', name: 'Silk Yukata / Kimono' },
                      { id: 'cyber_suit', name: 'Neo Cyber Armor' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateProp('topStyle', item.id as TopStyle)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          character.topStyle === item.id
                            ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300 font-bold text-pink-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'bottom' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Bottoms / Skirts / Pants
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'pleated_skirt', name: 'School Pleated Skirt' },
                      { id: 'denim_shorts', name: 'Casual Denim Shorts' },
                      { id: 'cargo_pants', name: 'Urban Cargo Pants' },
                      { id: 'frill_tier_skirt', name: 'Tiered Frill Skirt' },
                      { id: 'maid_apron_skirt', name: 'Cafe Maid Apron' },
                      { id: 'athletic_leggings', name: 'Sporty Leggings' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateProp('bottomStyle', item.id as BottomStyle)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          character.bottomStyle === item.id
                            ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 font-bold text-purple-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'shoes' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Shoes & Boots
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'sneakers_chunky', name: 'Chunky Sneakers' },
                      { id: 'mary_janes', name: 'School Mary Janes' },
                      { id: 'idol_boots', name: 'Knee-high Idol Boots' },
                      { id: 'combat_boots', name: 'Heavy Combat Boots' },
                      { id: 'cute_slippers', name: 'Bunny House Slippers' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateProp('shoesStyle', item.id as ShoesStyle)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          character.shoesStyle === item.id
                            ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300 font-bold text-pink-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'jackets' && (
                <div>
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                    Jackets / Capes / Scarves
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'none', name: 'None' },
                      { id: 'cape_hero', name: 'Flowing Hero Cape' },
                      { id: 'fluffy_scarf', name: 'Fluffy Winter Scarf' },
                      { id: 'loose_cardigan', name: 'Oversized Cardigan' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateProp('jacketStyle', item.id as JacketStyle)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          character.jacketStyle === item.id
                            ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 font-bold text-purple-900'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'clothing_colors' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                      Top Color
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {CLOTHING_COLORS.map((cc) => (
                        <button
                          key={cc.color}
                          onClick={() => updateProp('topColor', cc.color)}
                          className={`w-8 h-8 rounded-xl border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                            character.topColor === cc.color ? 'border-zinc-900 scale-110 shadow-md' : 'border-white'
                          }`}
                          style={{ backgroundColor: cc.color }}
                        >
                          {character.topColor === cc.color && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={character.topColor}
                        onChange={(e) => updateProp('topColor', e.target.value)}
                        className="w-8 h-8 rounded-xl cursor-pointer border border-zinc-300 p-0.5"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                      Bottoms / Skirt Color
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {CLOTHING_COLORS.map((cc) => (
                        <button
                          key={cc.color}
                          onClick={() => updateProp('bottomColor', cc.color)}
                          className={`w-8 h-8 rounded-xl border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                            character.bottomColor === cc.color ? 'border-zinc-900 scale-110 shadow-md' : 'border-white'
                          }`}
                          style={{ backgroundColor: cc.color }}
                        >
                          {character.bottomColor === cc.color && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={character.bottomColor}
                        onChange={(e) => updateProp('bottomColor', e.target.value)}
                        className="w-8 h-8 rounded-xl cursor-pointer border border-zinc-300 p-0.5"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                      Shoes Color
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {CLOTHING_COLORS.map((cc) => (
                        <button
                          key={cc.color}
                          onClick={() => updateProp('shoesColor', cc.color)}
                          className={`w-8 h-8 rounded-xl border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                            character.shoesColor === cc.color ? 'border-zinc-900 scale-110 shadow-md' : 'border-white'
                          }`}
                          style={{ backgroundColor: cc.color }}
                        >
                          {character.shoesColor === cc.color && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={character.shoesColor}
                        onChange={(e) => updateProp('shoesColor', e.target.value)}
                        className="w-8 h-8 rounded-xl cursor-pointer border border-zinc-300 p-0.5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ACCESSORIES CATEGORY CONTENT */}
          {activeCategory === 'accessories' && (
            <>
              {activeSubTab === 'hats' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                      Hats & Headgear
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'none', name: 'None' },
                        { id: 'cat_ears', name: 'Neko Cat Ears' },
                        { id: 'bunny_ears', name: 'Bunny Ears' },
                        { id: 'witch_hat', name: 'Witch Sorceress Hat' },
                        { id: 'golden_halo', name: 'Divine Angel Halo' },
                        { id: 'royal_crown', name: 'Gold Royal Crown' },
                        { id: 'gaming_headphones', name: 'RGB Headphones' },
                        { id: 'big_ribbon', name: 'Cute Anime Ribbon' },
                        { id: 'demon_horns', name: 'Demon Horns' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => updateProp('hatStyle', item.id as HatStyle)}
                          className={`p-3.5 rounded-2xl border text-center transition-all ${
                            character.hatStyle === item.id
                              ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300 font-bold text-pink-900'
                              : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          <span className="text-xs">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {character.hatStyle !== 'none' && (
                    <div>
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                        Hat / Headgear Color
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {CLOTHING_COLORS.map((cc) => (
                          <button
                            key={cc.color}
                            onClick={() => updateProp('hatColor', cc.color)}
                            className="w-7 h-7 rounded-xl border border-white hover:scale-110 transition-transform"
                            style={{ backgroundColor: cc.color }}
                          />
                        ))}
                        <input
                          type="color"
                          value={character.hatColor}
                          onChange={(e) => updateProp('hatColor', e.target.value)}
                          className="w-8 h-8 rounded-xl cursor-pointer border border-zinc-300 p-0.5"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'wings' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                      Wings / Back Accessories
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'none', name: 'None' },
                        { id: 'angel_feathers', name: 'Feathered Angel Wings' },
                        { id: 'bat_devil', name: 'Demonic Bat Wings' },
                        { id: 'fairy_sparkle', name: 'Fairy Wings' },
                        { id: 'cyber_wings', name: 'Photon Cyber Wings' },
                        { id: 'butterfly_wings', name: 'Butterfly Wings' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => updateProp('wingStyle', item.id as WingStyle)}
                          className={`p-3.5 rounded-2xl border text-center transition-all ${
                            character.wingStyle === item.id
                              ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 font-bold text-purple-900'
                              : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          <span className="text-xs">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {character.wingStyle !== 'none' && (
                    <div>
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                        Wing Color
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {CLOTHING_COLORS.map((cc) => (
                          <button
                            key={cc.color}
                            onClick={() => updateProp('wingColor', cc.color)}
                            className="w-7 h-7 rounded-xl border border-white hover:scale-110 transition-transform"
                            style={{ backgroundColor: cc.color }}
                          />
                        ))}
                        <input
                          type="color"
                          value={character.wingColor}
                          onChange={(e) => updateProp('wingColor', e.target.value)}
                          className="w-8 h-8 rounded-xl cursor-pointer border border-zinc-300 p-0.5"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'weapons_items' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">
                      Hand Items & Weapons
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'none', name: 'None' },
                        { id: 'star_staff', name: 'Star Magic Staff ★' },
                        { id: 'magic_wand', name: 'Crystal Wand' },
                        { id: 'boba_milk_tea', name: 'Boba Milk Tea' },
                        { id: 'katana_sword', name: 'Sakura Katana Blade' },
                        { id: 'game_controller', name: 'RGB Gamepad' },
                        { id: 'singing_mic', name: 'Idol Vocal Mic' },
                        { id: 'spell_book', name: 'Sorcerer Spellbook' },
                        { id: 'plushie_bear', name: 'Chibi Teddy Bear' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => updateProp('handItemStyle', item.id as HandItemStyle)}
                          className={`p-3.5 rounded-2xl border text-center transition-all ${
                            character.handItemStyle === item.id
                              ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300 font-bold text-pink-900'
                              : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          <span className="text-xs">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Action from Vibrant Palette */}
        <div className="pt-3 border-t-2 border-gray-100">
          <button
            onClick={handleRandomize}
            className="w-full bg-[#FF5DA8] text-white py-3.5 rounded-2xl font-bold text-center shadow-lg border-b-4 border-[#d44186] hover:border-b-0 hover:translate-y-1 transition-all cursor-pointer transform active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Dices className="w-5 h-5" />
            <span>RANDOMIZE CHARACTER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
