import {
  Character,
  BackdropId,
  StudioCharacterInstance,
  SpeechBubble,
  PoseType
} from '../types';

export interface RenderOptions {
  width: number;
  height: number;
  backdropId?: BackdropId;
  characters?: StudioCharacterInstance[];
  singleCharacter?: Character;
  bubbles?: SpeechBubble[];
  showGrid?: boolean;
  selectedBubbleId?: string | null;
  selectedCharInstanceId?: string | null;
}

/**
 * Main Canvas 2D Renderer for Gacha Studio.
 * Renders layered anime chibi characters, scenic backdrops, and comic manga speech bubbles.
 */
export class CanvasRenderer {
  public static renderScene(
    ctx: CanvasRenderingContext2D,
    options: RenderOptions
  ) {
    const { width, height, backdropId, characters, singleCharacter, bubbles, showGrid } = options;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Backdrop
    if (backdropId) {
      this.drawBackdrop(ctx, backdropId, width, height);
    } else {
      // Default dress-up background: soft anime studio gradient with subtle polka-dots
      this.drawStudioDefaultBackground(ctx, width, height, showGrid);
    }

    // 2. Draw Characters
    if (characters && characters.length > 0) {
      // Sort characters by zIndex
      const sorted = [...characters].sort((a, b) => a.zIndex - b.zIndex);
      for (const inst of sorted) {
        ctx.save();
        ctx.translate(inst.x, inst.y);
        ctx.scale(inst.flipX ? -inst.scale : inst.scale, inst.scale);
        ctx.rotate((inst.rotation * Math.PI) / 180);

        // Highlight if selected
        if (options.selectedCharInstanceId === inst.instanceId) {
          this.drawSelectionIndicator(ctx);
        }

        // Draw character with instance pose override if provided
        const charToDraw = { ...inst.character, pose: inst.pose || inst.character.pose };
        this.drawLayeredCharacter(ctx, charToDraw);
        ctx.restore();
      }
    } else if (singleCharacter) {
      // Dress Up mode single character
      ctx.save();
      const centerX = width / 2 + (singleCharacter.offsetX || 0);
      const centerY = height / 2 + 30 + (singleCharacter.offsetY || 0);
      ctx.translate(centerX, centerY);
      ctx.scale(singleCharacter.flipX ? -singleCharacter.scale : singleCharacter.scale, singleCharacter.scale);
      ctx.rotate(((singleCharacter.rotation || 0) * Math.PI) / 180);

      this.drawLayeredCharacter(ctx, singleCharacter);
      ctx.restore();
    }

    // 3. Draw Speech Bubbles (Comic Manga style)
    if (bubbles && bubbles.length > 0) {
      for (const bubble of bubbles) {
        const isSelected = options.selectedBubbleId === bubble.id;
        this.drawSpeechBubble(ctx, bubble, isSelected);
      }
    }

    ctx.restore();
  }

  /**
   * Layered Character Drawing:
   * 1. Wings
   * 2. Back Hair
   * 3. Body (Legs, Torso, Arms based on Pose, Neck, Face base)
   * 4. Clothes (Bottoms, Shoes, Top, Jacket/Scarf)
   * 5. Face (Eyes, Pupils, Eyebrows, Nose, Mouth, Blush)
   * 6. Front Hair & Highlights
   * 7. Accessories (Hats, Ears, Crown, Ribbons, Horns)
   * 8. Hand Items / Weapons
   */
  public static drawLayeredCharacter(ctx: CanvasRenderingContext2D, char: Character) {
    ctx.save();

    // 1. Wings (behind everything)
    if (char.wingStyle && char.wingStyle !== 'none') {
      this.drawWings(ctx, char.wingStyle, char.wingColor);
    }

    // 2. Back Hair
    this.drawBackHair(ctx, char.backHairStyle, char.hairColor, char.hairHighlightColor);

    // 3. Body & Skin (Legs, Torso, Head Base, Ears)
    this.drawBodyBase(ctx, char.skinTone, char.pose);

    // 4. Clothes
    this.drawClothes(ctx, char);

    // 5. Face details (Eyes, Brows, Mouth, Blush)
    this.drawFace(ctx, char);

    // 6. Front Hair & Highlights
    this.drawFrontHair(ctx, char.frontHairStyle, char.hairColor, char.hairHighlightColor);

    // 7. Hats & Head Accessories
    if (char.hatStyle && char.hatStyle !== 'none') {
      this.drawHat(ctx, char.hatStyle, char.hatColor);
    }

    // 8. Hand item / weapon
    if (char.handItemStyle && char.handItemStyle !== 'none') {
      this.drawHandItem(ctx, char.handItemStyle, char.handItemColor, char.pose);
    }

    ctx.restore();
  }

  // ==========================================
  // BODY & POSES
  // ==========================================
  private static drawBodyBase(ctx: CanvasRenderingContext2D, skinTone: string, pose: PoseType) {
    ctx.save();
    ctx.fillStyle = skinTone;
    ctx.strokeStyle = '#2b2129';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Drop shadow under feet
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 160, 45, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Legs
    // Left Leg
    ctx.beginPath();
    ctx.roundRect(-22, 60, 16, 75, 8);
    ctx.fill();
    ctx.stroke();

    // Right Leg
    ctx.beginPath();
    if (pose === 'peace' || pose === 'cheer') {
      // Slightly bent cute pose
      ctx.roundRect(7, 60, 16, 70, 8);
    } else {
      ctx.roundRect(7, 60, 16, 75, 8);
    }
    ctx.fill();
    ctx.stroke();

    // Torso (chibi oval/pear shape)
    ctx.beginPath();
    ctx.roundRect(-25, 5, 50, 65, 16);
    ctx.fill();
    ctx.stroke();

    // Neck
    ctx.beginPath();
    ctx.roundRect(-8, -10, 16, 20, 4);
    ctx.fill();
    ctx.stroke();

    // Arms based on Pose
    this.drawArms(ctx, skinTone, pose);

    // Head Base (Chibi rounded head with slight cheek curve)
    ctx.beginPath();
    ctx.moveTo(-52, -75);
    ctx.bezierCurveTo(-65, -30, -55, 12, 0, 18); // Chin
    ctx.bezierCurveTo(55, 12, 65, -30, 52, -75);
    ctx.bezierCurveTo(45, -115, -45, -115, -52, -75);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ears
    [-52, 52].forEach(x => {
      ctx.beginPath();
      ctx.ellipse(x, -35, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  private static drawArms(ctx: CanvasRenderingContext2D, skinTone: string, pose: PoseType) {
    ctx.save();
    ctx.fillStyle = skinTone;
    ctx.strokeStyle = '#2b2129';
    ctx.lineWidth = 3;

    if (pose === 'peace') {
      // Left arm down-relaxed
      ctx.beginPath();
      ctx.roundRect(-38, 12, 14, 52, 7);
      ctx.fill();
      ctx.stroke();

      // Right arm raised with V peace sign
      ctx.beginPath();
      ctx.moveTo(25, 20);
      ctx.lineTo(48, -10);
      ctx.lineTo(38, -35);
      ctx.lineWidth = 12;
      ctx.strokeStyle = skinTone;
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2b2129';

      // Hand & Peace Fingers
      ctx.beginPath();
      ctx.arc(36, -38, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // V fingers
      ctx.beginPath();
      ctx.moveTo(33, -42);
      ctx.lineTo(28, -55);
      ctx.moveTo(37, -42);
      ctx.lineTo(39, -56);
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (pose === 'wave') {
      // Left arm resting
      ctx.beginPath();
      ctx.roundRect(-38, 12, 14, 52, 7);
      ctx.fill();
      ctx.stroke();

      // Right arm waving high
      ctx.beginPath();
      ctx.moveTo(25, 20);
      ctx.lineTo(48, -15);
      ctx.lineWidth = 12;
      ctx.strokeStyle = skinTone;
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2b2129';

      // Waving palm
      ctx.beginPath();
      ctx.arc(50, -22, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (pose === 'cheer') {
      // Both arms up in the air!
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(side * 22, 18);
        ctx.lineTo(side * 46, -20);
        ctx.lineWidth = 12;
        ctx.strokeStyle = skinTone;
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#2b2129';

        ctx.beginPath();
        ctx.arc(side * 48, -25, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    } else if (pose === 'cross_arms') {
      // Arms crossed over chest
      ctx.beginPath();
      ctx.roundRect(-32, 22, 64, 18, 9);
      ctx.fill();
      ctx.stroke();
    } else {
      // Standard stand pose: both arms at sides
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.roundRect(side === -1 ? -38 : 24, 12, 14, 52, 7);
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  // ==========================================
  // BACK HAIR
  // ==========================================
  private static drawBackHair(
    ctx: CanvasRenderingContext2D,
    style: string,
    color: string,
    highlight: string
  ) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#2b2129';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (style) {
      case 'twin_tails':
        // Big iconic bouncy twin tails on left and right!
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.moveTo(side * 40, -50);
          ctx.bezierCurveTo(side * 95, -70, side * 105, 10, side * 60, 110);
          ctx.bezierCurveTo(side * 50, 125, side * 45, 90, side * 50, 70);
          ctx.bezierCurveTo(side * 35, 30, side * 30, -10, side * 35, -45);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Hair strand shadow / highlight
          ctx.save();
          ctx.strokeStyle = highlight;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(side * 75, -20);
          ctx.quadraticCurveTo(side * 85, 40, side * 58, 90);
          ctx.stroke();
          ctx.restore();
        });
        break;

      case 'high_ponytail':
        ctx.beginPath();
        ctx.moveTo(25, -60);
        ctx.bezierCurveTo(90, -85, 110, 0, 75, 105);
        ctx.bezierCurveTo(60, 120, 50, 80, 55, 50);
        ctx.bezierCurveTo(55, 10, 35, -20, 20, -45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'long_straight':
        ctx.beginPath();
        ctx.moveTo(-60, -50);
        ctx.bezierCurveTo(-70, 0, -68, 80, -50, 130);
        ctx.lineTo(50, 130);
        ctx.bezierCurveTo(68, 80, 70, 0, 60, -50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'drill_curls':
        // Elegant spiral drill curls
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.moveTo(side * 42, -45);
          ctx.bezierCurveTo(side * 90, -35, side * 85, 40, side * 65, 80);
          ctx.bezierCurveTo(side * 80, 95, side * 55, 120, side * 45, 130);
          ctx.bezierCurveTo(side * 35, 120, side * 45, 90, side * 50, 70);
          ctx.bezierCurveTo(side * 40, 20, side * 30, -10, side * 35, -40);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        break;

      case 'wavy_long':
        ctx.beginPath();
        ctx.moveTo(-58, -50);
        ctx.bezierCurveTo(-80, 10, -55, 60, -65, 125);
        ctx.lineTo(65, 125);
        ctx.bezierCurveTo(55, 60, 80, 10, 58, -50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'wolf_cut':
        // Shaggy spiky locks
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.moveTo(side * 40, -40);
          ctx.lineTo(side * 68, 0);
          ctx.lineTo(side * 50, 20);
          ctx.lineTo(side * 72, 50);
          ctx.lineTo(side * 40, 65);
          ctx.lineTo(side * 25, -20);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        break;

      case 'low_buns':
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.arc(side * 55, 10, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        break;

      case 'spiky_short':
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.moveTo(side * 45, -55);
          ctx.lineTo(side * 75, -40);
          ctx.lineTo(side * 55, -20);
          ctx.lineTo(side * 72, 0);
          ctx.lineTo(side * 45, 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        break;

      case 'short_bob':
      default:
        // Cute curved bob background hair
        ctx.beginPath();
        ctx.arc(0, -40, 60, Math.PI * 0.1, Math.PI * 0.9);
        ctx.lineTo(0, 45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  // ==========================================
  // CLOTHES
  // ==========================================
  private static drawClothes(ctx: CanvasRenderingContext2D, char: Character) {
    ctx.save();
    ctx.strokeStyle = '#2b2129';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // 1. Bottoms (pants/skirt)
    ctx.fillStyle = char.bottomColor;
    if (char.bottomStyle === 'pleated_skirt') {
      // Classic anime pleated skirt with pleat folds
      ctx.beginPath();
      ctx.moveTo(-25, 42);
      ctx.lineTo(25, 42);
      ctx.lineTo(34, 75);
      ctx.lineTo(-34, 75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pleat lines
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      [-20, -10, 0, 10, 20].forEach(px => {
        ctx.beginPath();
        ctx.moveTo(px * 0.8, 43);
        ctx.lineTo(px * 1.3, 74);
        ctx.stroke();
      });
      ctx.strokeStyle = '#2b2129';
      ctx.lineWidth = 3;
    } else if (char.bottomStyle === 'frill_tier_skirt') {
      // Tiered ruffles
      ctx.beginPath();
      ctx.roundRect(-30, 42, 60, 22, 10);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-36, 60, 72, 22, 12);
      ctx.fill();
      ctx.stroke();
    } else if (char.bottomStyle === 'maid_apron_skirt') {
      ctx.beginPath();
      ctx.roundRect(-32, 42, 64, 38, 12);
      ctx.fill();
      ctx.stroke();
      // White apron layer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-18, 42, 36, 32, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = char.bottomColor;
    } else if (char.bottomStyle === 'cargo_pants' || char.bottomStyle === 'athletic_leggings') {
      // Long pants
      ctx.beginPath();
      ctx.roundRect(-24, 45, 19, 85, 6);
      ctx.roundRect(5, 45, 19, 85, 6);
      ctx.fill();
      ctx.stroke();
    } else {
      // Shorts
      ctx.beginPath();
      ctx.roundRect(-24, 44, 48, 28, 6);
      ctx.fill();
      ctx.stroke();
    }

    // 2. Shoes
    ctx.fillStyle = char.shoesColor;
    // Left shoe
    ctx.beginPath();
    ctx.roundRect(-25, 130, 21, 24, 8);
    ctx.fill();
    ctx.stroke();
    // Right shoe
    ctx.beginPath();
    ctx.roundRect(4, 130, 21, 24, 8);
    ctx.fill();
    ctx.stroke();

    // 3. Top
    ctx.fillStyle = char.topColor;
    ctx.beginPath();
    ctx.roundRect(-25, 6, 50, 40, 10);
    ctx.fill();
    ctx.stroke();

    // Top Details based on TopStyle
    if (char.topStyle === 'sailor_uniform') {
      // Sailor collar
      ctx.fillStyle = char.topAccentColor || '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-20, 6);
      ctx.lineTo(0, 26);
      ctx.lineTo(20, 6);
      ctx.lineTo(26, 18);
      ctx.lineTo(0, 36);
      ctx.lineTo(-26, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Red ribbon bow
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 28, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (char.topStyle === 'hoodie_casual') {
      // Hoodie strings & pocket
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.roundRect(-16, 26, 32, 16, 6);
      ctx.fill();
      ctx.stroke();
      // Draw strings
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 12);
      ctx.lineTo(-6, 28);
      ctx.moveTo(6, 12);
      ctx.lineTo(6, 28);
      ctx.stroke();
    } else if (char.topStyle === 'idol_vest') {
      // Vest cuts and buttons
      ctx.strokeStyle = char.topAccentColor || '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-18, 10, 36, 32);
      ctx.fillStyle = '#fbbf24';
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.arc(0, 18 + side * 8, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (char.topStyle === 'magical_corset') {
      // Corset laces
      ctx.strokeStyle = char.topAccentColor || '#fbbf24';
      ctx.lineWidth = 2;
      [-1, 0, 1].forEach(idx => {
        ctx.beginPath();
        ctx.moveTo(-10, 18 + idx * 8);
        ctx.lineTo(10, 18 + idx * 8);
        ctx.stroke();
      });
    }

    // 4. Jacket / Scarf / Cape (Layered over top)
    if (char.jacketStyle && char.jacketStyle !== 'none') {
      ctx.fillStyle = char.jacketColor;
      ctx.strokeStyle = '#2b2129';
      ctx.lineWidth = 3;

      if (char.jacketStyle === 'fluffy_scarf') {
        // Big cozy winter scarf around neck
        ctx.beginPath();
        ctx.roundRect(-28, -6, 56, 24, 12);
        ctx.fill();
        ctx.stroke();
        // Hanging end
        ctx.beginPath();
        ctx.roundRect(8, 12, 16, 36, 6);
        ctx.fill();
        ctx.stroke();
      } else if (char.jacketStyle === 'cape_hero') {
        // Flowing heroic cape
        ctx.beginPath();
        ctx.moveTo(-32, 10);
        ctx.lineTo(-50, 130);
        ctx.lineTo(50, 130);
        ctx.lineTo(32, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (char.jacketStyle === 'loose_cardigan') {
        // Open cardigan
        ctx.beginPath();
        ctx.roundRect(-30, 8, 14, 46, 6);
        ctx.roundRect(16, 8, 14, 46, 6);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ==========================================
  // FACE & EXPRESSIONS
  // ==========================================
  private static drawFace(ctx: CanvasRenderingContext2D, char: Character) {
    ctx.save();

    // 1. Blush & Special Expressions
    this.drawBlush(ctx, char.blushStyle);

    // 2. Eyebrows
    this.drawEyebrows(ctx, char.eyebrowStyle, char.hairColor);

    // 3. Eyes (The soul of anime art!)
    this.drawEyes(ctx, char.eyeStyle, char.eyeColor);

    // 4. Nose & Mouth
    this.drawMouth(ctx, char.mouthStyle);

    ctx.restore();
  }

  private static drawBlush(ctx: CanvasRenderingContext2D, style: string) {
    if (style === 'none') return;
    ctx.save();

    if (style === 'soft_pink') {
      ctx.fillStyle = 'rgba(255, 110, 150, 0.4)';
      [-30, 30].forEach(x => {
        ctx.beginPath();
        ctx.ellipse(x, -22, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      // Cute anime diagonal blush stripes ///
      ctx.strokeStyle = 'rgba(235, 60, 110, 0.6)';
      ctx.lineWidth = 1.5;
      [-34, -30, -26, 26, 30, 34].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x - 2, -26);
        ctx.lineTo(x + 2, -18);
        ctx.stroke();
      });
    } else if (style === 'heavy_blush') {
      ctx.fillStyle = 'rgba(255, 70, 120, 0.65)';
      [-30, 30].forEach(x => {
        ctx.beginPath();
        ctx.ellipse(x, -20, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (style === 'star_cheeks') {
      ctx.fillStyle = '#fbbf24';
      [-30, 30].forEach(x => {
        this.drawStar(ctx, x, -20, 5, 8, 4);
      });
    } else if (style === 'anime_sweat') {
      // Big blue anime sweatdrop near temple
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(42, -55);
      ctx.bezierCurveTo(48, -48, 52, -40, 42, -35);
      ctx.bezierCurveTo(32, -40, 36, -48, 42, -55);
      ctx.fill();
      ctx.stroke();
    } else if (style === 'crying_tears') {
      // Comical anime waterfall tears
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      [-28, 28].forEach(x => {
        ctx.beginPath();
        ctx.roundRect(x - 5, -20, 10, 35, 5);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  private static drawEyebrows(ctx: CanvasRenderingContext2D, style: string, hairColor: string) {
    ctx.save();
    ctx.strokeStyle = hairColor || '#2b2129';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    switch (style) {
      case 'angry':
        // Slanted downward angry brows
        ctx.beginPath();
        ctx.moveTo(-38, -48);
        ctx.lineTo(-18, -42);
        ctx.moveTo(38, -48);
        ctx.lineTo(18, -42);
        ctx.stroke();
        break;

      case 'worried':
        // Slanted upward worried brows
        ctx.beginPath();
        ctx.moveTo(-38, -42);
        ctx.lineTo(-18, -48);
        ctx.moveTo(38, -42);
        ctx.lineTo(18, -48);
        ctx.stroke();
        break;

      case 'dots':
        // Cute Japanese kuge dot eyebrows
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(-26, -48, 4, 0, Math.PI * 2);
        ctx.arc(26, -48, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'happy':
      case 'normal':
      default:
        // Gentle arch
        ctx.beginPath();
        ctx.moveTo(-38, -45);
        ctx.quadraticCurveTo(-28, -52, -18, -46);
        ctx.moveTo(18, -46);
        ctx.quadraticCurveTo(28, -52, 38, -45);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  private static drawEyes(ctx: CanvasRenderingContext2D, style: string, eyeColor: string) {
    ctx.save();
    const eyePositions = [-26, 26];

    if (style === 'happy_closed') {
      // Cute anime happy squint ^^ eyes
      ctx.strokeStyle = '#2b2129';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      eyePositions.forEach(x => {
        ctx.beginPath();
        ctx.arc(x, -28, 12, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        // Eyelash tick
        ctx.beginPath();
        ctx.moveTo(x + (x > 0 ? 10 : -10), -30);
        ctx.lineTo(x + (x > 0 ? 15 : -15), -35);
        ctx.stroke();
      });
      ctx.restore();
      return;
    }

    if (style === 'wink') {
      // Left eye open, right eye winking
      this.drawSingleOpenEye(ctx, -26, eyeColor, style);

      ctx.strokeStyle = '#2b2129';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(26, -28, 12, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(36, -30);
      ctx.lineTo(41, -34);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Both open eyes
    eyePositions.forEach(x => {
      this.drawSingleOpenEye(ctx, x, eyeColor, style);
    });

    ctx.restore();
  }

  private static drawSingleOpenEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    color: string,
    style: string
  ) {
    ctx.save();
    const isRight = x > 0;

    // Sclera (White eye background)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, -28, 13, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris (Large anime gradient iris)
    const irisGrad = ctx.createLinearGradient(x, -42, x, -15);
    irisGrad.addColorStop(0, '#111827');
    irisGrad.addColorStop(0.4, color);
    irisGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.ellipse(x, -27, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(x, -28, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Star sparkle inside eye for dramatic_stars
    if (style === 'dramatic_stars') {
      ctx.fillStyle = '#fef08a';
      this.drawStar(ctx, x, -28, 4, 6, 2.5);
    }

    // Big glossy anime eye highlights (White circles)
    ctx.fillStyle = '#ffffff';
    // Main highlight (top-left)
    ctx.beginPath();
    ctx.arc(x - 3, -34, 4, 0, Math.PI * 2);
    ctx.fill();

    // Secondary smaller highlight (bottom-right)
    ctx.beginPath();
    ctx.arc(x + 3, -22, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyelash frame (Top thick line + wing)
    ctx.strokeStyle = '#2b2129';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, -33, 13, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();

    // Wing tick
    ctx.beginPath();
    ctx.moveTo(x + (isRight ? 11 : -11), -33);
    ctx.lineTo(x + (isRight ? 17 : -17), -37);
    ctx.stroke();

    ctx.restore();
  }

  private static drawMouth(ctx: CanvasRenderingContext2D, style: string) {
    ctx.save();
    ctx.strokeStyle = '#2b2129';
    ctx.fillStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (style) {
      case 'big_open':
        // Big happy D shaped singing/cheering mouth with tongue
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(10, -5);
        ctx.bezierCurveTo(10, 10, -10, 10, -10, -5);
        ctx.closePath();
        ctx.fillStyle = '#b91c1c';
        ctx.fill();
        ctx.stroke();

        // Cute pink tongue
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.arc(0, 5, 6, 0, Math.PI);
        ctx.fill();
        break;

      case 'cat_w':
        // Anime cat mouth :3
        ctx.beginPath();
        ctx.arc(-4, -6, 4, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(4, -6, 4, 0, Math.PI);
        ctx.stroke();
        break;

      case 'fang_grin':
        // Smug grin with little vampire fang
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.quadraticCurveTo(0, 4, 12, -4);
        ctx.stroke();
        // Fang
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(5, -2);
        ctx.lineTo(8, 4);
        ctx.lineTo(11, -3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'pout':
        // Cute pouty /-\ mouth
        ctx.beginPath();
        ctx.arc(0, 0, 7, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
        break;

      case 'o_shock':
        // Surprised :O mouth
        ctx.beginPath();
        ctx.ellipse(0, -3, 5, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#f43f5e';
        ctx.fill();
        ctx.stroke();
        break;

      case 'neutral':
        ctx.beginPath();
        ctx.moveTo(-7, -4);
        ctx.lineTo(7, -4);
        ctx.stroke();
        break;

      case 'smile':
      default:
        // Gentle happy curve
        ctx.beginPath();
        ctx.arc(0, -9, 8, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  // ==========================================
  // FRONT HAIR
  // ==========================================
  private static drawFrontHair(
    ctx: CanvasRenderingContext2D,
    style: string,
    color: string,
    highlight: string
  ) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#2b2129';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (style) {
      case 'straight_bangs':
        // Classic straight anime blunt bangs with cute side locks
        ctx.beginPath();
        ctx.moveTo(-56, -65);
        ctx.lineTo(-50, -10); // Left side lock
        ctx.lineTo(-42, -40);
        // Bang tips
        ctx.lineTo(-30, -32);
        ctx.lineTo(-20, -38);
        ctx.lineTo(-8, -30);
        ctx.lineTo(4, -38);
        ctx.lineTo(18, -32);
        ctx.lineTo(30, -38);
        ctx.lineTo(42, -40);
        ctx.lineTo(50, -10); // Right side lock
        ctx.lineTo(56, -65);
        ctx.bezierCurveTo(50, -118, -50, -118, -56, -65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'twin_side_bangs':
        ctx.beginPath();
        ctx.moveTo(-54, -65);
        ctx.lineTo(-48, 5); // Long left side lock
        ctx.lineTo(-38, -30);
        ctx.lineTo(-20, -35);
        ctx.lineTo(-5, -28);
        ctx.lineTo(10, -36);
        ctx.lineTo(25, -28);
        ctx.lineTo(38, -30);
        ctx.lineTo(48, 5); // Long right side lock
        ctx.lineTo(54, -65);
        ctx.bezierCurveTo(45, -118, -45, -118, -54, -65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'spiky_hero':
        // Bold spiky shonen hero bangs
        ctx.beginPath();
        ctx.moveTo(-55, -60);
        ctx.lineTo(-38, -15);
        ctx.lineTo(-28, -45);
        ctx.lineTo(-10, -10);
        ctx.lineTo(4, -40);
        ctx.lineTo(24, -8);
        ctx.lineTo(35, -42);
        ctx.lineTo(52, -18);
        ctx.lineTo(55, -60);
        ctx.bezierCurveTo(40, -118, -40, -118, -55, -60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'hime_fringe':
        // Elegant hime cuts
        ctx.beginPath();
        ctx.moveTo(-55, -65);
        ctx.lineTo(-45, 12);
        ctx.lineTo(-38, 12);
        ctx.lineTo(-38, -35);
        ctx.lineTo(0, -35);
        ctx.lineTo(38, -35);
        ctx.lineTo(38, 12);
        ctx.lineTo(45, 12);
        ctx.lineTo(55, -65);
        ctx.bezierCurveTo(45, -118, -45, -118, -55, -65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'side_swept':
      default:
        // Dynamic swooping side-swept fringe
        ctx.beginPath();
        ctx.moveTo(-54, -65);
        ctx.lineTo(-48, -5);
        ctx.lineTo(-38, -38);
        ctx.lineTo(-10, -22);
        ctx.lineTo(15, -26);
        ctx.lineTo(38, -36);
        ctx.lineTo(48, -12);
        ctx.lineTo(54, -65);
        ctx.bezierCurveTo(45, -118, -45, -118, -54, -65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
    }

    // Anime Ring of Light (Hair Halo highlight across forehead)
    ctx.save();
    ctx.strokeStyle = highlight || '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -75, 42, Math.PI * 0.8, Math.PI * 0.2, true);
    ctx.stroke();
    // Little sparkle triangles on highlight
    ctx.fillStyle = highlight || '#ffffff';
    [-18, 0, 18].forEach(hx => {
      ctx.beginPath();
      ctx.arc(hx, -68, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    ctx.restore();
  }

  // ==========================================
  // ACCESSORIES (HATS, WINGS, WEAPONS)
  // ==========================================
  private static drawHat(ctx: CanvasRenderingContext2D, style: string, color: string) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#2b2129';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    switch (style) {
      case 'cat_ears':
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.moveTo(side * 28, -75);
          ctx.lineTo(side * 52, -110);
          ctx.lineTo(side * 58, -70);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Inner pink ear
          ctx.fillStyle = '#fda4af';
          ctx.beginPath();
          ctx.moveTo(side * 34, -75);
          ctx.lineTo(side * 50, -100);
          ctx.lineTo(side * 54, -72);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = color;
        });
        break;

      case 'bunny_ears':
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.roundRect(side * 24 - 8, -135, 18, 55, 9);
          ctx.fill();
          ctx.stroke();
          // Inner pink
          ctx.fillStyle = '#fda4af';
          ctx.beginPath();
          ctx.roundRect(side * 24 - 4, -128, 10, 42, 5);
          ctx.fill();
          ctx.fillStyle = color;
        });
        break;

      case 'witch_hat':
        // Brim
        ctx.beginPath();
        ctx.ellipse(0, -78, 65, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Cone
        ctx.beginPath();
        ctx.moveTo(-35, -78);
        ctx.quadraticCurveTo(-15, -135, 30, -145);
        ctx.quadraticCurveTo(15, -110, 35, -78);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Golden buckle
        ctx.fillStyle = '#fbbf24';
        ctx.strokeRect(-10, -88, 20, 10);
        break;

      case 'golden_halo':
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(0, -115, 38, 12, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Glow
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 14;
        ctx.stroke();
        break;

      case 'royal_crown':
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-24, -80);
        ctx.lineTo(-28, -105);
        ctx.lineTo(-12, -92);
        ctx.lineTo(0, -112);
        ctx.lineTo(12, -92);
        ctx.lineTo(28, -105);
        ctx.lineTo(24, -80);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Ruby gems on crown points
        ctx.fillStyle = '#dc2626';
        [-28, 0, 28].forEach(rx => {
          ctx.beginPath();
          ctx.arc(rx, rx === 0 ? -112 : -105, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'gaming_headphones':
        // Headband
        ctx.lineWidth = 6;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(0, -65, 52, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        // Ear cups
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#2b2129';
        [-52, 52].forEach(hx => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(hx - 8, -45, 16, 26, 8);
          ctx.fill();
          ctx.stroke();
        });
        break;

      case 'big_ribbon':
        // Big cute anime ribbon
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.moveTo(0, -82);
          ctx.bezierCurveTo(side * 25, -105, side * 50, -85, side * 30, -75);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        // Knot
        ctx.beginPath();
        ctx.arc(0, -80, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'demon_horns':
        ctx.fillStyle = color || '#dc2626';
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.moveTo(side * 28, -75);
          ctx.quadraticCurveTo(side * 50, -95, side * 45, -115);
          ctx.quadraticCurveTo(side * 36, -95, side * 36, -75);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        break;
    }

    ctx.restore();
  }

  private static drawWings(ctx: CanvasRenderingContext2D, style: string, color: string) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#2b2129';
    ctx.lineWidth = 3;

    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(side * 24, 25);
      ctx.scale(side, 1);

      if (style === 'angel_feathers') {
        // Grand angel wings
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(45, -45, 85, -60, 95, -40);
        ctx.bezierCurveTo(110, -20, 100, 20, 80, 45);
        ctx.lineTo(65, 30);
        ctx.lineTo(55, 45);
        ctx.lineTo(40, 25);
        ctx.lineTo(25, 35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (style === 'bat_devil') {
        // Demonic bat wings
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(50, -45);
        ctx.lineTo(95, -25);
        ctx.quadraticCurveTo(75, 10, 65, 30);
        ctx.quadraticCurveTo(45, 15, 35, 35);
        ctx.quadraticCurveTo(20, 15, 0, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (style === 'cyber_wings') {
        // Sharp photon polygon wings
        ctx.fillStyle = color || '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(60, -50);
        ctx.lineTo(105, -30);
        ctx.lineTo(75, -10);
        ctx.lineTo(95, 15);
        ctx.lineTo(55, 15);
        ctx.lineTo(70, 45);
        ctx.lineTo(10, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (style === 'butterfly_wings') {
        // Butterfly curves
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(40, -55, 90, -40, 85, 0);
        ctx.bezierCurveTo(80, 35, 55, 65, 0, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });

    ctx.restore();
  }

  private static drawHandItem(
    ctx: CanvasRenderingContext2D,
    style: string,
    color: string,
    pose: PoseType
  ) {
    ctx.save();
    ctx.strokeStyle = '#2b2129';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Position item in right hand
    let itemX = 35;
    let itemY = 45;

    if (pose === 'peace' || pose === 'wave') {
      itemX = 40;
      itemY = -20;
    } else if (pose === 'cheer') {
      itemX = 48;
      itemY = -35;
    }

    ctx.translate(itemX, itemY);

    switch (style) {
      case 'magic_wand':
      case 'star_staff':
        // Staff rod
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-3, -40, 6, 60);
        ctx.strokeRect(-3, -40, 6, 60);
        // Star on top
        ctx.fillStyle = color || '#fbbf24';
        this.drawStar(ctx, 0, -45, 5, 14, 7);
        break;

      case 'katana_sword':
        // Curved steel blade
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(-2, -55);
        ctx.quadraticCurveTo(8, -25, 4, 15);
        ctx.lineTo(-4, 15);
        ctx.quadraticCurveTo(0, -25, -2, -55);
        ctx.fill();
        ctx.stroke();
        // Hilt
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(-6, 15, 12, 20);
        ctx.strokeRect(-6, 15, 12, 20);
        // Guard (tsuba)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-10, 13, 20, 5);
        ctx.strokeRect(-10, 13, 20, 5);
        break;

      case 'boba_milk_tea':
        // Boba cup
        ctx.fillStyle = 'rgba(255, 237, 213, 0.9)';
        ctx.beginPath();
        ctx.roundRect(-10, -12, 20, 26, 4);
        ctx.fill();
        ctx.stroke();
        // Boba pearls
        ctx.fillStyle = '#451a03';
        [-6, 0, 6].forEach(bx => {
          ctx.beginPath();
          ctx.arc(bx, 8, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
        // Straw
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(-2, -22, 4, 14);
        ctx.strokeRect(-2, -22, 4, 14);
        break;

      case 'game_controller':
        ctx.fillStyle = color || '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(-16, -10, 32, 20, 6);
        ctx.fill();
        ctx.stroke();
        // D-pad & Buttons
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(-8, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(8, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'singing_mic':
        // Microphone head
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(0, -10, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Handle
        ctx.fillStyle = color || '#ec4899';
        ctx.fillRect(-3, -1, 6, 22);
        ctx.strokeRect(-3, -1, 6, 22);
        break;

      case 'spell_book':
        ctx.fillStyle = color || '#7c3aed';
        ctx.beginPath();
        ctx.roundRect(-14, -14, 28, 28, 4);
        ctx.fill();
        ctx.stroke();
        // Pages
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(8, -12, 4, 24);
        // Star seal
        ctx.fillStyle = '#fbbf24';
        this.drawStar(ctx, 0, 0, 4, 6, 3);
        break;

      case 'plushie_bear':
        // Teddy bear
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Ears
        [-8, 8].forEach(ex => {
          ctx.beginPath();
          ctx.arc(ex, -10, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        // Muzzle
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, 2, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  // ==========================================
  // BACKDROPS
  // ==========================================
  public static drawBackdrop(
    ctx: CanvasRenderingContext2D,
    backdropId: BackdropId,
    w: number,
    h: number
  ) {
    ctx.save();

    switch (backdropId) {
      case 'school_classroom': {
        // Sky outside window
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
        skyGrad.addColorStop(0, '#7dd3fc');
        skyGrad.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Fluffy anime clouds
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(w * 0.25, h * 0.25, 45, 0, Math.PI * 2);
        ctx.arc(w * 0.32, h * 0.22, 55, 0, Math.PI * 2);
        ctx.arc(w * 0.4, h * 0.26, 40, 0, Math.PI * 2);
        ctx.fill();

        // Classroom Wooden Floor
        const floorGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
        floorGrad.addColorStop(0, '#ca8a04');
        floorGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, h * 0.65, w, h * 0.35);

        // Floor planks lines
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;
        for (let y = h * 0.65; y < h; y += 28) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Window frames
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 10;
        ctx.strokeRect(w * 0.08, h * 0.1, w * 0.84, h * 0.52);
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.1);
        ctx.lineTo(w * 0.5, h * 0.62);
        ctx.moveTo(w * 0.08, h * 0.36);
        ctx.lineTo(w * 0.92, h * 0.36);
        ctx.stroke();

        // Sunlight glare angle
        const sunGrad = ctx.createLinearGradient(w * 0.2, 0, w * 0.8, h);
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.moveTo(w * 0.2, 0);
        ctx.lineTo(w * 0.9, 0);
        ctx.lineTo(w, h);
        ctx.lineTo(w * 0.4, h);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'anime_city': {
        // Night sky
        const nightGrad = ctx.createLinearGradient(0, 0, 0, h);
        nightGrad.addColorStop(0, '#090d16');
        nightGrad.addColorStop(0.5, '#1e1b4b');
        nightGrad.addColorStop(1, '#311042');
        ctx.fillStyle = nightGrad;
        ctx.fillRect(0, 0, w, h);

        // Glowing stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 40; i++) {
          const sx = (Math.sin(i * 99) * 0.5 + 0.5) * w;
          const sy = (Math.cos(i * 33) * 0.5 + 0.5) * h * 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Skyscrapers silhouettes
        const bldgs = [
          { x: 0, w: w * 0.2, h: h * 0.55 },
          { x: w * 0.18, w: w * 0.25, h: h * 0.68 },
          { x: w * 0.4, w: w * 0.22, h: h * 0.48 },
          { x: w * 0.6, w: w * 0.25, h: h * 0.62 },
          { x: w * 0.82, w: w * 0.2, h: h * 0.52 },
        ];

        bldgs.forEach(b => {
          ctx.fillStyle = '#111827';
          ctx.fillRect(b.x, h - b.h, b.w, b.h);

          // Neon windows
          ctx.fillStyle = '#38bdf8';
          for (let wy = h - b.h + 20; wy < h - 80; wy += 24) {
            for (let wx = b.x + 12; wx < b.x + b.w - 12; wx += 16) {
              if (Math.random() > 0.4) {
                ctx.fillRect(wx, wy, 8, 12);
              }
            }
          }
        });

        // Neon Billboard signs in Japanese Akiba style
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(w * 0.22, h * 0.4, w * 0.15, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('GACHA★', w * 0.24, h * 0.4 + 21);

        // Street road
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, h * 0.82, w, h * 0.18);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.82);
        ctx.lineTo(w, h * 0.82);
        ctx.stroke();
        break;
      }

      case 'magical_forest': {
        const forestGrad = ctx.createLinearGradient(0, 0, 0, h);
        forestGrad.addColorStop(0, '#064e3b');
        forestGrad.addColorStop(0.6, '#022c22');
        forestGrad.addColorStop(1, '#14532d');
        ctx.fillStyle = forestGrad;
        ctx.fillRect(0, 0, w, h);

        // Big enchanted tree trunks
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(w * 0.05, h);
        ctx.quadraticCurveTo(w * 0.15, h * 0.4, w * 0.1, 0);
        ctx.lineTo(w * 0.25, 0);
        ctx.quadraticCurveTo(w * 0.2, h * 0.5, w * 0.35, h);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(w * 0.75, h);
        ctx.quadraticCurveTo(w * 0.8, h * 0.4, w * 0.9, 0);
        ctx.lineTo(w * 1.0, 0);
        ctx.lineTo(w * 1.0, h);
        ctx.closePath();
        ctx.fill();

        // Sakura blossom canopy
        ctx.fillStyle = 'rgba(244, 114, 182, 0.75)';
        for (let i = 0; i < 15; i++) {
          const bx = (i * w) / 12;
          const by = Math.sin(i * 1.5) * 40 + 60;
          ctx.beginPath();
          ctx.arc(bx, by, 65, 0, Math.PI * 2);
          ctx.fill();
        }

        // Glowing magical fairy orbs
        for (let o = 0; o < 25; o++) {
          const ox = (Math.sin(o * 77) * 0.5 + 0.5) * w;
          const oy = (Math.cos(o * 44) * 0.5 + 0.5) * (h * 0.8);
          ctx.fillStyle = 'rgba(167, 243, 208, 0.9)';
          ctx.beginPath();
          ctx.arc(ox, oy, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(167, 243, 208, 0.3)';
          ctx.beginPath();
          ctx.arc(ox, oy, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Grassy ground
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, h * 0.78, w, h * 0.22);
        break;
      }

      case 'concert_stage': {
        // Stage background with dark atmosphere & stage lights
        ctx.fillStyle = '#0f051d';
        ctx.fillRect(0, 0, w, h);

        // Stage floor
        const deckGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
        deckGrad.addColorStop(0, '#2e1065');
        deckGrad.addColorStop(1, '#581c87');
        ctx.fillStyle = deckGrad;
        ctx.fillRect(0, h * 0.7, w, h * 0.3);

        // Spotlights from top corners
        const leftSpot = ctx.createLinearGradient(0, 0, w * 0.45, h * 0.8);
        leftSpot.addColorStop(0, 'rgba(236, 72, 153, 0.7)');
        leftSpot.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = leftSpot;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w * 0.15, 0);
        ctx.lineTo(w * 0.55, h * 0.85);
        ctx.lineTo(w * 0.35, h * 0.85);
        ctx.closePath();
        ctx.fill();

        const rightSpot = ctx.createLinearGradient(w, 0, w * 0.55, h * 0.8);
        rightSpot.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
        rightSpot.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = rightSpot;
        ctx.beginPath();
        ctx.moveTo(w, 0);
        ctx.lineTo(w * 0.85, 0);
        ctx.lineTo(w * 0.45, h * 0.85);
        ctx.lineTo(w * 0.65, h * 0.85);
        ctx.closePath();
        ctx.fill();

        // Cheering audience glowsticks at bottom
        for (let i = 0; i < 45; i++) {
          const gx = (i * w) / 40;
          const gy = h - (Math.sin(i * 1.8) * 15 + 15);
          ctx.strokeStyle = i % 2 === 0 ? '#ec4899' : '#06b6d4';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + (i % 3 - 1) * 8, gy - 20);
          ctx.stroke();
        }
        break;
      }

      case 'cozy_bedroom': {
        // Cute pastel wall with pink stripes
        ctx.fillStyle = '#fce7f3';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fbcfe8';
        for (let x = 0; x < w; x += 40) {
          ctx.fillRect(x, 0, 20, h * 0.7);
        }

        // Bedroom Window
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(w * 0.12, h * 0.12, w * 0.28, h * 0.38);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(w * 0.12, h * 0.12, w * 0.28, h * 0.38);

        // Cute anime poster
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(w * 0.65, h * 0.15, w * 0.22, h * 0.28);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(w * 0.65, h * 0.15, w * 0.22, h * 0.28);
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('ANIME★', w * 0.68, h * 0.25);

        // Floor with fluffy rug
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(0, h * 0.7, w, h * 0.3);

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.85, w * 0.35, 45, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'sunset_beach': {
        // Dramatic sunset sky
        const sunSky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
        sunSky.addColorStop(0, '#f97316');
        sunSky.addColorStop(0.4, '#fb923c');
        sunSky.addColorStop(0.7, '#f43f5e');
        sunSky.addColorStop(1, '#fda4af');
        ctx.fillStyle = sunSky;
        ctx.fillRect(0, 0, w, h * 0.65);

        // Giant setting sun
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.45, 60, 0, Math.PI * 2);
        ctx.fill();

        // Ocean waves
        const oceanGrad = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.8);
        oceanGrad.addColorStop(0, '#0284c7');
        oceanGrad.addColorStop(1, '#38bdf8');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, h * 0.55, w, h * 0.25);

        // Sandy beach
        const sandGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
        sandGrad.addColorStop(0, '#fde68a');
        sandGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = sandGrad;
        ctx.fillRect(0, h * 0.75, w, h * 0.25);

        // Palm tree silhouette
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(w * 0.88, h);
        ctx.quadraticCurveTo(w * 0.85, h * 0.4, w * 0.78, h * 0.15);
        ctx.lineTo(w * 0.82, h * 0.15);
        ctx.quadraticCurveTo(w * 0.89, h * 0.4, w * 0.94, h);
        ctx.closePath();
        ctx.fill();

        // Fronds
        for (let f = 0; f < 5; f++) {
          ctx.beginPath();
          ctx.ellipse(w * 0.75 + (f - 2) * 25, h * 0.15 + Math.abs(f - 2) * 15, 45, 12, (f - 2) * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'starry_galaxy': {
        const galGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 30, w * 0.5, h * 0.5, w);
        galGrad.addColorStop(0, '#4c1d95');
        galGrad.addColorStop(0.4, '#1e1b4b');
        galGrad.addColorStop(0.8, '#0f172a');
        galGrad.addColorStop(1, '#020617');
        ctx.fillStyle = galGrad;
        ctx.fillRect(0, 0, w, h);

        // Nebulae swirls
        ctx.fillStyle = 'rgba(236, 72, 153, 0.25)';
        ctx.beginPath();
        ctx.ellipse(w * 0.4, h * 0.35, w * 0.35, h * 0.2, 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.beginPath();
        ctx.ellipse(w * 0.65, h * 0.6, w * 0.3, h * 0.18, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Stars & shooting stars
        for (let i = 0; i < 90; i++) {
          const sx = (Math.sin(i * 123) * 0.5 + 0.5) * w;
          const sy = (Math.cos(i * 77) * 0.5 + 0.5) * h;
          const sr = Math.random() * 2 + 0.8;
          ctx.fillStyle = i % 3 === 0 ? '#fef08a' : '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'cherry_shrine': {
        // Twilight sky
        const twilight = ctx.createLinearGradient(0, 0, 0, h);
        twilight.addColorStop(0, '#1e1b4b');
        twilight.addColorStop(0.5, '#7f1d1d');
        twilight.addColorStop(1, '#450a0a');
        ctx.fillStyle = twilight;
        ctx.fillRect(0, 0, w, h);

        // Huge glowing full moon
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.3, 75, 0, Math.PI * 2);
        ctx.fill();

        // Vermilion Torii Gate silhouette
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 3;

        // Top horizontal beam (kasagi)
        ctx.beginPath();
        ctx.roundRect(w * 0.15, h * 0.3, w * 0.7, 24, 6);
        ctx.fill();
        ctx.stroke();

        // Second beam (shimaki)
        ctx.beginPath();
        ctx.roundRect(w * 0.2, h * 0.38, w * 0.6, 18, 4);
        ctx.fill();
        ctx.stroke();

        // Pillars (hashira)
        ctx.beginPath();
        ctx.roundRect(w * 0.26, h * 0.38, 22, h * 0.62, 4);
        ctx.roundRect(w * 0.7, h * 0.38, 22, h * 0.62, 4);
        ctx.fill();
        ctx.stroke();

        // Floating falling sakura petals
        ctx.fillStyle = '#f472b6';
        for (let p = 0; p < 30; p++) {
          const px = (Math.sin(p * 85) * 0.5 + 0.5) * w;
          const py = (p * 22) % h;
          ctx.beginPath();
          ctx.ellipse(px, py, 7, 4, p * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
    }

    ctx.restore();
  }

  // ==========================================
  // DEFAULT DRESS UP STUDIO BACKGROUND
  // ==========================================
  private static drawStudioDefaultBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    showGrid?: boolean
  ) {
    ctx.save();
    // Warm pastel gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#fdf4ff'); // Soft lavender/pink tint
    grad.addColorStop(1, '#f0fdf4'); // Gentle mint bottom
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle polka dots / grid
    if (showGrid !== false) {
      ctx.fillStyle = 'rgba(216, 180, 254, 0.25)';
      for (let x = 20; x < w; x += 30) {
        for (let y = 20; y < h; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Floor pedestal / circle under character
    ctx.fillStyle = 'rgba(244, 114, 182, 0.15)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 185, 120, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // SPEECH BUBBLES
  // ==========================================
  public static drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    bubble: SpeechBubble,
    isSelected = false
  ) {
    ctx.save();
    const { x, y, width, height, text, speakerName, type, tail, bgColor, textColor, fontSize } = bubble;

    ctx.fillStyle = bgColor || '#ffffff';
    ctx.strokeStyle = isSelected ? '#3b82f6' : '#18181b';
    ctx.lineWidth = isSelected ? 3.5 : 2.5;

    // 1. Draw Bubble Shape
    if (type === 'thought') {
      // Cloud of thought circles
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, height / 2);
      ctx.fill();
      ctx.stroke();

      // Thought circles leading down
      [14, 8, 4].forEach((rad, idx) => {
        const off = (idx + 1) * 14;
        ctx.beginPath();
        ctx.arc(x + 20 - off * 0.4, y + height + off, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    } else if (type === 'shout') {
      // Spiky anime manga action explosion bubble
      ctx.beginPath();
      const points = 16;
      const rx = width / 2;
      const ry = height / 2;
      const cx = x + rx;
      const cy = y + ry;
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const distRatio = i % 2 === 0 ? 1.15 : 0.85;
        const px = cx + Math.cos(angle) * rx * distRatio;
        const py = cy + Math.sin(angle) * ry * distRatio;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Standard Speech Bubble with pointed Tail
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 16);
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.beginPath();
      if (tail === 'bottom_left') {
        ctx.moveTo(x + 25, y + height - 2);
        ctx.lineTo(x + 10, y + height + 20);
        ctx.lineTo(x + 40, y + height - 2);
      } else if (tail === 'bottom_right') {
        ctx.moveTo(x + width - 40, y + height - 2);
        ctx.lineTo(x + width - 10, y + height + 20);
        ctx.lineTo(x + width - 25, y + height - 2);
      } else if (tail === 'top_left') {
        ctx.moveTo(x + 25, y + 2);
        ctx.lineTo(x + 10, y - 20);
        ctx.lineTo(x + 40, y + 2);
      } else {
        ctx.moveTo(x + width - 40, y + 2);
        ctx.lineTo(x + width - 10, y - 20);
        ctx.lineTo(x + width - 25, y + 2);
      }
      ctx.fill();
      ctx.stroke();
    }

    // 2. Speaker Name Tag (if present)
    if (speakerName && speakerName.trim()) {
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.roundRect(x + 12, y - 12, Math.min(100, speakerName.length * 9 + 16), 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(speakerName, x + 18, y + 2);
    }

    // 3. Text content with automatic word wrapping
    ctx.fillStyle = textColor || '#18181b';
    ctx.font = `${fontSize || 14}px sans-serif`;
    ctx.textBaseline = 'top';

    const words = text.split(' ');
    const maxWidth = width - 24;
    const lineHeight = (fontSize || 14) * 1.35;
    let line = '';
    let curY = y + 14;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x + 12, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x + 12, curY);

    ctx.restore();
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private static drawSelectionIndicator(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(-65, -150, 130, 310);
    ctx.restore();
  }

  private static drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
