import { GachaItem, Character } from '../types';

export const GACHA_CATALOG: GachaItem[] = [
  // --- UR (Ultra Rare 2%) ---
  {
    id: 'ur_char_celestia',
    name: 'Celestia Divine (UR Hero)',
    rarity: 'ur',
    category: 'character',
    description: 'A celestial deity with radiant angel wings, divine halo and star scepter.',
    iconName: 'Sparkles',
    previewColor: '#fbbf24',
    unlocked: false,
    characterPreset: {
      id: 'char_ur_celestia',
      name: 'Celestia Divine',
      pose: 'cheer',
      skinTone: '#ffffff',
      eyeStyle: 'dramatic_stars',
      eyeColor: '#d97706',
      eyebrowStyle: 'happy',
      mouthStyle: 'smile',
      blushStyle: 'star_cheeks',
      frontHairStyle: 'hime_fringe',
      backHairStyle: 'wavy_long',
      hairColor: '#cbd5e1',
      hairHighlightColor: '#ffffff',
      topStyle: 'magical_corset',
      topColor: '#fef08a',
      topAccentColor: '#f59e0b',
      bottomStyle: 'frill_tier_skirt',
      bottomColor: '#ffffff',
      shoesStyle: 'idol_boots',
      shoesColor: '#fbbf24',
      jacketStyle: 'cape_hero',
      jacketColor: '#fef08a',
      hatStyle: 'golden_halo',
      hatColor: '#f59e0b',
      wingStyle: 'angel_feathers',
      wingColor: '#ffffff',
      handItemStyle: 'star_staff',
      handItemColor: '#fbbf24',
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      flipX: false,
    }
  },
  {
    id: 'ur_wings_cyber',
    name: 'Neo Cyber Photon Wings (UR)',
    rarity: 'ur',
    category: 'wings',
    description: 'High-tech prismatic hologram wings powered by hyper-quantum photon drives.',
    iconName: 'Zap',
    previewColor: '#06b6d4',
    unlocked: false,
    styleValue: 'cyber_wings'
  },
  {
    id: 'ur_char_kuro_dragon',
    name: 'Kuro Dragon Lord (UR Hero)',
    rarity: 'ur',
    category: 'character',
    description: 'Legendary dragon warrior wielding ancient infernal katana and demonic wings.',
    iconName: 'Flame',
    previewColor: '#ef4444',
    unlocked: false,
    characterPreset: {
      id: 'char_ur_kuro',
      name: 'Kuro Dragon Lord',
      pose: 'peace',
      skinTone: '#f5be9e',
      eyeStyle: 'cat_slanted',
      eyeColor: '#dc2626',
      eyebrowStyle: 'angry',
      mouthStyle: 'fang_grin',
      blushStyle: 'none',
      frontHairStyle: 'spiky_hero',
      backHairStyle: 'wolf_cut',
      hairColor: '#ef4444',
      hairHighlightColor: '#fca5a5',
      topStyle: 'cyber_suit',
      topColor: '#18181b',
      topAccentColor: '#ef4444',
      bottomStyle: 'cyber_mini',
      bottomColor: '#18181b',
      shoesStyle: 'combat_boots',
      shoesColor: '#ef4444',
      jacketStyle: 'cape_hero',
      jacketColor: '#991b1b',
      hatStyle: 'demon_horns',
      hatColor: '#ef4444',
      wingStyle: 'bat_devil',
      wingColor: '#7f1d1d',
      handItemStyle: 'katana_sword',
      handItemColor: '#ef4444',
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      flipX: false,
    }
  },
  {
    id: 'ur_backdrop_galaxy',
    name: 'Cosmic Starry Galaxy (UR Backdrop)',
    rarity: 'ur',
    category: 'backdrop',
    description: 'Unlock the mesmerizing infinite universe studio backdrop.',
    iconName: 'Moon',
    previewColor: '#8b5cf6',
    unlocked: false,
    backdropId: 'starry_galaxy'
  },

  // --- SR (Super Rare 8%) ---
  {
    id: 'sr_char_miku_cyber',
    name: 'Holo Vocalist Chibi (SR)',
    rarity: 'sr',
    category: 'character',
    description: 'A vibrant cyber star with teal twin tails and glowing sound synthesizer!',
    iconName: 'Music',
    previewColor: '#14b8a6',
    unlocked: false,
    characterPreset: {
      id: 'char_sr_miku',
      name: 'Holo Vocalist',
      pose: 'peace',
      skinTone: '#ffe0d2',
      eyeStyle: 'sparkle_anime',
      eyeColor: '#06b6d4',
      eyebrowStyle: 'happy',
      mouthStyle: 'big_open',
      blushStyle: 'soft_pink',
      frontHairStyle: 'straight_bangs',
      backHairStyle: 'twin_tails',
      hairColor: '#2ee6d6',
      hairHighlightColor: '#bbfdf8',
      topStyle: 'idol_vest',
      topColor: '#18181b',
      topAccentColor: '#2ee6d6',
      bottomStyle: 'pleated_skirt',
      bottomColor: '#14b8a6',
      shoesStyle: 'idol_boots',
      shoesColor: '#18181b',
      jacketStyle: 'none',
      jacketColor: '#ffffff',
      hatStyle: 'gaming_headphones',
      hatColor: '#2ee6d6',
      wingStyle: 'none',
      wingColor: '#ffffff',
      handItemStyle: 'singing_mic',
      handItemColor: '#2ee6d6',
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      flipX: false,
    }
  },
  {
    id: 'sr_hat_crown',
    name: 'Majestic Royal Crown (SR)',
    rarity: 'sr',
    category: 'hat',
    description: 'Pure gold imperial crown encrusted with glittering ruby gemstones.',
    iconName: 'Crown',
    previewColor: '#f59e0b',
    unlocked: false,
    styleValue: 'royal_crown'
  },
  {
    id: 'sr_wings_butterfly',
    name: 'Ethereal Butterfly Wings (SR)',
    rarity: 'sr',
    category: 'wings',
    description: 'Iridescent glowing wings inspired by magical enchanted butterflies.',
    iconName: 'Feather',
    previewColor: '#ec4899',
    unlocked: false,
    styleValue: 'butterfly_wings'
  },
  {
    id: 'sr_outfit_kimono',
    name: 'Festive Sakura Kimono (SR)',
    rarity: 'sr',
    category: 'clothes',
    description: 'Traditional handcrafted silk kimono with golden obi ribbon and cherry blossom embroidery.',
    iconName: 'Shirt',
    previewColor: '#f43f5e',
    unlocked: false,
    styleValue: 'kimono_top'
  },
  {
    id: 'sr_backdrop_shrine',
    name: 'Moonlit Torii Shrine (SR Backdrop)',
    rarity: 'sr',
    category: 'backdrop',
    description: 'Unlocks the breathtaking ancient Japanese shrine at twilight.',
    iconName: 'Landmark',
    previewColor: '#dc2626',
    unlocked: false,
    backdropId: 'cherry_shrine'
  },
  {
    id: 'sr_weapon_katana',
    name: 'Muramasa Sakura Blade (SR)',
    rarity: 'sr',
    category: 'weapon',
    description: 'Sharp forged steel katana that leaves a trail of razor-sharp glowing petals.',
    iconName: 'Sword',
    previewColor: '#e11d48',
    unlocked: false,
    styleValue: 'katana_sword'
  },

  // --- RARE (20%) ---
  {
    id: 'rare_hair_drill_curls',
    name: 'Ojou Drill Curls (Rare)',
    rarity: 'rare',
    category: 'hair',
    description: 'Iconic anime noble spiral twin drill curls filled with haughty charm!',
    iconName: 'Scissors',
    previewColor: '#eab308',
    unlocked: false,
    styleValue: 'drill_curls'
  },
  {
    id: 'rare_hat_witch',
    name: 'Midnight Sorceress Hat (Rare)',
    rarity: 'rare',
    category: 'hat',
    description: 'Deep violet pointed witch hat with golden crescent buckle.',
    iconName: 'Sparkle',
    previewColor: '#7c3aed',
    unlocked: false,
    styleValue: 'witch_hat'
  },
  {
    id: 'rare_hat_cat_ears',
    name: 'Fluffy Neko Ears (Rare)',
    rarity: 'rare',
    category: 'hat',
    description: 'Super soft animal ears that twitch when excited, nya~!',
    iconName: 'Smile',
    previewColor: '#fb7185',
    unlocked: false,
    styleValue: 'cat_ears'
  },
  {
    id: 'rare_weapon_boba',
    name: 'Brown Sugar Tapioca Boba (Rare)',
    rarity: 'rare',
    category: 'weapon',
    description: 'Delicious iced milk tea drink topped with chewy boba pearls.',
    iconName: 'Coffee',
    previewColor: '#b45309',
    unlocked: false,
    styleValue: 'boba_milk_tea'
  },
  {
    id: 'rare_weapon_gamepad',
    name: 'Pro RGB Game Controller (Rare)',
    rarity: 'rare',
    category: 'weapon',
    description: 'High-precision handheld console for champion e-sports otakus.',
    iconName: 'Gamepad2',
    previewColor: '#3b82f6',
    unlocked: false,
    styleValue: 'game_controller'
  },
  {
    id: 'rare_clothes_corset',
    name: 'Gothic Lolita Corset (Rare)',
    rarity: 'rare',
    category: 'clothes',
    description: 'Intricate ribbon-laced bodice with lace trims and gemstone brooch.',
    iconName: 'Shirt',
    previewColor: '#4c1d95',
    unlocked: false,
    styleValue: 'magical_corset'
  },
  {
    id: 'rare_clothes_maid',
    name: 'Maid Frill Apron Skirt (Rare)',
    rarity: 'rare',
    category: 'clothes',
    description: 'Classic cafe maid skirt with ruffled lace hem and big back bow.',
    iconName: 'Layers',
    previewColor: '#18181b',
    unlocked: false,
    styleValue: 'maid_apron_skirt'
  },

  // --- COMMON (70%) ---
  {
    id: 'com_hair_wolf',
    name: 'Modern Wolf Cut (Common)',
    rarity: 'common',
    category: 'hair',
    description: 'Trendy layered anime shaggy haircut with spiky flair.',
    iconName: 'Scissors',
    previewColor: '#64748b',
    unlocked: false,
    styleValue: 'wolf_cut'
  },
  {
    id: 'com_hat_beret',
    name: 'Artist French Beret (Common)',
    rarity: 'common',
    category: 'hat',
    description: 'Classic felt beret for manga artists and cultured scholars.',
    iconName: 'Compass',
    previewColor: '#94a3b8',
    unlocked: false,
    styleValue: 'beret_hat'
  },
  {
    id: 'com_weapon_plushie',
    name: 'Kuma Chibi Plushie (Common)',
    rarity: 'common',
    category: 'weapon',
    description: 'Cuddly stuffed teddy bear that comforts you during battles.',
    iconName: 'Heart',
    previewColor: '#f59e0b',
    unlocked: false,
    styleValue: 'plushie_bear'
  },
  {
    id: 'com_clothes_sweater',
    name: 'Oversized Pastel Sweater (Common)',
    rarity: 'common',
    category: 'clothes',
    description: 'Super cozy knitted sweater with oversized sleeves.',
    iconName: 'Shirt',
    previewColor: '#a7f3d0',
    unlocked: false,
    styleValue: 'chibi_sweater'
  },
  {
    id: 'com_clothes_cargo',
    name: 'Streetwear Cargo Pants (Common)',
    rarity: 'common',
    category: 'clothes',
    description: 'Loose fit utility pants with lots of straps and pockets.',
    iconName: 'Layers',
    previewColor: '#475569',
    unlocked: false,
    styleValue: 'cargo_pants'
  },
  {
    id: 'com_hat_ribbon',
    name: 'Cute Polka Ribbon (Common)',
    rarity: 'common',
    category: 'hat',
    description: 'Charming hair bow that ties any cute look together.',
    iconName: 'Ribbon',
    previewColor: '#f43f5e',
    unlocked: false,
    styleValue: 'big_ribbon'
  },
  {
    id: 'com_shoes_slippers',
    name: 'Bunny Face Slippers (Common)',
    rarity: 'common',
    category: 'clothes',
    description: 'Comfortable indoor house slippers shaped like fluffy bunnies.',
    iconName: 'Footprints',
    previewColor: '#fda4af',
    unlocked: false,
    styleValue: 'cute_slippers'
  },
  {
    id: 'com_weapon_bouquet',
    name: 'Spring Flower Bouquet (Common)',
    rarity: 'common',
    category: 'weapon',
    description: 'Freshly picked colorful daisies, roses and baby breath flowers.',
    iconName: 'Flower2',
    previewColor: '#ec4899',
    unlocked: false,
    styleValue: 'flower_bouquet'
  }
];

export function performGachaPull(catalog: GachaItem[]): GachaItem {
  // Probabilities: Common 70%, Rare 20%, SR 8%, UR 2%
  const roll = Math.random() * 100;
  let targetRarity: 'ur' | 'sr' | 'rare' | 'common' = 'common';

  if (roll < 2) {
    targetRarity = 'ur';
  } else if (roll < 10) {
    targetRarity = 'sr';
  } else if (roll < 30) {
    targetRarity = 'rare';
  } else {
    targetRarity = 'common';
  }

  const pool = catalog.filter(item => item.rarity === targetRarity);
  if (pool.length === 0) {
    return catalog[Math.floor(Math.random() * catalog.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
