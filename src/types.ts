export type TabType = 'customizer' | 'studio' | 'gacha' | 'collection';

export type SkinTone = '#ffe0d2' | '#fcd0b9' | '#f5be9e' | '#d89b72' | '#8c593a' | '#f5d6e6' | '#e0f4ff' | '#ffffff';

export type PoseType = 'stand' | 'peace' | 'wave' | 'cheer' | 'cross_arms' | 'shy';

export type EyeStyle = 
  | 'sparkle_anime' 
  | 'gentle_round' 
  | 'tsundere_sharp' 
  | 'cat_slanted' 
  | 'happy_closed' 
  | 'wink' 
  | 'dramatic_stars'
  | 'sleepy';

export type EyebrowStyle = 'normal' | 'happy' | 'serious' | 'worried' | 'angry' | 'dots';

export type MouthStyle = 'smile' | 'big_open' | 'cat_w' | 'fang_grin' | 'pout' | 'neutral' | 'o_shock' | 'teasing';

export type BlushStyle = 'none' | 'soft_pink' | 'heavy_blush' | 'anime_sweat' | 'crying_tears' | 'star_cheeks';

export type FrontHairStyle = 
  | 'straight_bangs' 
  | 'side_swept' 
  | 'twin_side_bangs' 
  | 'messy_anime' 
  | 'curtain_bangs' 
  | 'spiky_hero' 
  | 'hime_fringe' 
  | 'short_parted'
  | 'ahoge_curl';

export type BackHairStyle = 
  | 'short_bob' 
  | 'twin_tails' 
  | 'high_ponytail' 
  | 'long_straight' 
  | 'drill_curls' 
  | 'spiky_short' 
  | 'wavy_long' 
  | 'low_buns'
  | 'wolf_cut';

export type TopStyle = 
  | 'sailor_uniform' 
  | 'hoodie_casual' 
  | 'idol_vest' 
  | 'magical_corset' 
  | 'oversized_tee' 
  | 'kimono_top' 
  | 'leather_jacket_top' 
  | 'chibi_sweater'
  | 'cyber_suit';

export type BottomStyle = 
  | 'pleated_skirt' 
  | 'denim_shorts' 
  | 'cargo_pants' 
  | 'frill_tier_skirt' 
  | 'athletic_leggings' 
  | 'cyber_mini' 
  | 'maid_apron_skirt';

export type ShoesStyle = 
  | 'sneakers_chunky' 
  | 'mary_janes' 
  | 'idol_boots' 
  | 'combat_boots' 
  | 'cute_slippers' 
  | 'sandals';

export type JacketStyle = 
  | 'none' 
  | 'cape_hero' 
  | 'loose_cardigan' 
  | 'fluffy_scarf' 
  | 'trench_coat';

export type HatStyle = 
  | 'none' 
  | 'cat_ears' 
  | 'bunny_ears' 
  | 'witch_hat' 
  | 'golden_halo' 
  | 'royal_crown' 
  | 'beret_hat' 
  | 'gaming_headphones' 
  | 'big_ribbon' 
  | 'demon_horns';

export type WingStyle = 
  | 'none' 
  | 'angel_feathers' 
  | 'bat_devil' 
  | 'fairy_sparkle' 
  | 'cyber_wings' 
  | 'butterfly_wings';

export type HandItemStyle = 
  | 'none' 
  | 'magic_wand' 
  | 'star_staff' 
  | 'boba_milk_tea' 
  | 'katana_sword' 
  | 'game_controller' 
  | 'singing_mic' 
  | 'spell_book' 
  | 'flower_bouquet'
  | 'plushie_bear';

export interface Character {
  id: string;
  name: string;
  pose: PoseType;
  skinTone: string;
  
  // Face
  eyeStyle: EyeStyle;
  eyeColor: string;
  eyebrowStyle: EyebrowStyle;
  mouthStyle: MouthStyle;
  blushStyle: BlushStyle;
  
  // Hair
  frontHairStyle: FrontHairStyle;
  backHairStyle: BackHairStyle;
  hairColor: string;
  hairHighlightColor: string;
  
  // Clothes
  topStyle: TopStyle;
  topColor: string;
  topAccentColor: string;
  
  bottomStyle: BottomStyle;
  bottomColor: string;
  
  shoesStyle: ShoesStyle;
  shoesColor: string;
  
  jacketStyle: JacketStyle;
  jacketColor: string;
  
  // Accessories
  hatStyle: HatStyle;
  hatColor: string;
  
  wingStyle: WingStyle;
  wingColor: string;
  
  handItemStyle: HandItemStyle;
  handItemColor: string;
  
  // Transform & placement (for customizer / preview)
  scale: number;
  rotation: number; // degrees
  offsetX: number;
  offsetY: number;
  flipX: boolean;
}

export type BackdropId = 
  | 'school_classroom' 
  | 'anime_city' 
  | 'magical_forest' 
  | 'concert_stage' 
  | 'cozy_bedroom' 
  | 'sunset_beach' 
  | 'starry_galaxy'
  | 'cherry_shrine';

export interface BackdropInfo {
  id: BackdropId;
  name: string;
  description: string;
  theme: string;
  unlocked: boolean;
}

export interface StudioCharacterInstance {
  instanceId: string;
  characterId: string;
  character: Character;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  pose: PoseType;
  zIndex: number;
}

export type BubbleType = 'speech' | 'thought' | 'shout' | 'whisper';
export type BubbleTail = 'bottom_left' | 'bottom_right' | 'top_left' | 'top_right';

export interface SpeechBubble {
  id: string;
  text: string;
  speakerName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BubbleType;
  tail: BubbleTail;
  bgColor: string;
  textColor: string;
  fontSize: number;
}

export type Rarity = 'common' | 'rare' | 'sr' | 'ur';

export type GachaItemCategory = 'hair' | 'clothes' | 'hat' | 'wings' | 'weapon' | 'backdrop' | 'character';

export interface GachaItem {
  id: string;
  name: string;
  rarity: Rarity;
  category: GachaItemCategory;
  description: string;
  iconName: string;
  previewColor: string;
  unlocked: boolean;
  
  // Item payload to apply if unlocked
  styleValue?: string;
  characterPreset?: Character;
  backdropId?: BackdropId;
}

export interface PullResult {
  item: GachaItem;
  isNew: boolean;
  duplicateGemsReward?: number;
}
