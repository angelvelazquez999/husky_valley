import { Husky, Player, DigSpot, BallEntity, Particle, Direction } from '../types/game';

// Custom Pixel Art Sprite Renderer for 2D Canvas

export class SpriteRenderer {
  // Draw detailed pixel art husky
  public static drawHusky(ctx: CanvasRenderingContext2D, husky: Husky, time: number) {
    ctx.save();
    ctx.translate(husky.x, husky.y);

    const isMoving = husky.state === 'walking' || husky.state === 'following' || husky.state === 'fetching';
    const isSleeping = husky.state === 'sleeping';
    const isSitting = husky.state === 'sitting';
    const isEating = husky.state === 'eating';

    // Walk bounce & frame
    const walkBob = isMoving ? Math.sin(time * 12) * 2 : 0;
    const legOffset = isMoving ? Math.sin(time * 12) * 4 : 0;

    // Tail wag angle calculation
    const wagSpeed = husky.tailWagSpeed * (husky.love > 60 ? 1.6 : 1.0);
    const wagAngle = Math.sin(time * 10 * wagSpeed) * (husky.love > 40 ? 0.35 : 0.2);

    // Husky Colors setup - All 5 huskies have the same dark black & white coat
    const coatPrimary = '#1a1f2c'; // Dark black/charcoal coat
    const coatSecondary = '#ffffff'; // Pure white underbelly, snout, chest, paws
    const innerEar = '#f87171';
    const eyeLeft = '#0ea5e9';
    const eyeRight = '#0ea5e9';
    const hasEyebrows = husky.id === 'cejas';
    const hasBandana = husky.id === 'frida';

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 14, isSleeping ? 18 : 14, isSleeping ? 10 : 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // SLEEPING STATE
    if (isSleeping) {
      ctx.translate(0, 6);
      // Curled body
      ctx.fillStyle = coatPrimary;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // White underbelly curve
      ctx.fillStyle = coatSecondary;
      ctx.beginPath();
      ctx.arc(2, 2, 9, 0, Math.PI * 2);
      ctx.fill();

      // Curled Tail over body
      ctx.fillStyle = coatPrimary;
      ctx.beginPath();
      ctx.ellipse(-8, 6, 8, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = coatSecondary;
      ctx.beginPath();
      ctx.arc(-14, 4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Head tucked
      ctx.fillStyle = coatPrimary;
      ctx.beginPath();
      ctx.arc(6, -4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = coatSecondary;
      ctx.beginPath();
      ctx.arc(8, -2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Ears tucked
      ctx.fillStyle = coatPrimary;
      ctx.beginPath();
      ctx.moveTo(3, -12);
      ctx.lineTo(8, -16);
      ctx.lineTo(10, -10);
      ctx.fill();

      // Closed eye slit
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(6, -3);
      ctx.lineTo(10, -3);
      ctx.stroke();

      // Collar
      ctx.strokeStyle = husky.collarColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(2, 2, 10, 0.5, 1.8);
      ctx.stroke();

      // Floating "Zzz"
      const zOffset = (time * 1.5) % 1;
      ctx.fillStyle = 'rgba(199, 210, 254, ' + (1 - zOffset) + ')';
      ctx.font = 'bold 12px var(--font-pixelify)';
      ctx.fillText('z', 12 + zOffset * 6, -10 - zOffset * 16);
      ctx.fillText('Z', 18 + zOffset * 8, -16 - zOffset * 22);

      ctx.restore();
      return;
    }

    // NORMAL / WALKING / SITTING STATE
    ctx.translate(0, walkBob);

    // TAIL (Wagging behind body)
    ctx.save();
    ctx.translate(husky.facing === 'left' ? 10 : husky.facing === 'right' ? -10 : 0, 4);
    ctx.rotate(wagAngle);
    // Tail base
    ctx.fillStyle = coatPrimary;
    ctx.beginPath();
    ctx.ellipse(0, -8, 6, 12, wagAngle * 0.8, 0, Math.PI * 2);
    ctx.fill();
    // Fluffy tail tip (white)
    ctx.fillStyle = coatSecondary;
    ctx.beginPath();
    ctx.arc(Math.sin(wagAngle) * 4, -16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // LEGS / PAWS
    ctx.fillStyle = coatSecondary;
    if (isSitting) {
      // Sitting paws forward
      ctx.fillRect(-8, 8, 5, 7);
      ctx.fillRect(3, 8, 5, 7);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, 13, 3, 2);
      ctx.fillRect(4, 13, 3, 2);
    } else {
      // Front and back legs walking
      ctx.fillStyle = coatSecondary;
      ctx.fillRect(-8 + legOffset, 7, 5, 9 - legOffset * 0.3);
      ctx.fillRect(3 - legOffset, 7, 5, 9 + legOffset * 0.3);
      // Paws
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-7 + legOffset, 14, 4, 2);
      ctx.fillRect(4 - legOffset, 14, 4, 2);
    }

    // MAIN BODY
    ctx.fillStyle = coatPrimary;
    ctx.beginPath();
    ctx.roundRect(-10, -4, 20, 16, 6);
    ctx.fill();

    // CHEST FLUFF (Secondary Color)
    ctx.fillStyle = coatSecondary;
    ctx.beginPath();
    if (husky.facing === 'up') {
      ctx.roundRect(-6, -2, 12, 12, 4);
    } else if (husky.facing === 'left') {
      ctx.roundRect(-10, -2, 12, 12, 4);
    } else if (husky.facing === 'right') {
      ctx.roundRect(-2, -2, 12, 12, 4);
    } else {
      // Down
      ctx.roundRect(-7, -2, 14, 13, 5);
    }
    ctx.fill();

    // COLLAR OR BANDANA
    if (hasBandana) {
      ctx.fillStyle = '#9333ea';
      ctx.beginPath();
      ctx.moveTo(-9, -2);
      ctx.lineTo(9, -2);
      ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fill();
      // Star pin on bandana
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-1.5, 0, 3, 3);
    } else {
      ctx.fillStyle = husky.collarColor;
      ctx.fillRect(-8, -3, 16, 4);
      // Shiny Gold Tag
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-0.5, 1, 1.5, 1.5);
    }

    // HEAD
    const headY = isSitting ? -12 : -10;
    ctx.fillStyle = coatPrimary;
    ctx.beginPath();
    ctx.roundRect(-11, headY - 10, 22, 18, 6);
    ctx.fill();

    // EARS
    ctx.fillStyle = coatPrimary;
    // Left Ear
    ctx.beginPath();
    ctx.moveTo(-10, headY - 8);
    ctx.lineTo(-7, headY - 19);
    ctx.lineTo(-2, headY - 9);
    ctx.fill();
    ctx.fillStyle = innerEar;
    ctx.beginPath();
    ctx.moveTo(-8, headY - 8);
    ctx.lineTo(-6.5, headY - 16);
    ctx.lineTo(-3.5, headY - 9);
    ctx.fill();

    // Right Ear
    ctx.fillStyle = coatPrimary;
    ctx.beginPath();
    ctx.moveTo(2, headY - 9);
    ctx.lineTo(7, headY - 19);
    ctx.lineTo(10, headY - 8);
    ctx.fill();
    ctx.fillStyle = innerEar;
    ctx.beginPath();
    ctx.moveTo(3.5, headY - 9);
    ctx.lineTo(6.5, headY - 16);
    ctx.lineTo(8, headY - 8);
    ctx.fill();

    // FACIAL MASK (White / Secondary)
    if (husky.facing !== 'up') {
      ctx.fillStyle = coatSecondary;
      ctx.beginPath();
      // Snout and cheek mask
      ctx.ellipse(0, headY + 1, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Forehead blaze (white stripe between eyes)
      ctx.fillRect(-2.5, headY - 9, 5, 8);

      // EYEBROWS (Especially iconic on Cejas)
      if (hasEyebrows) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-7, headY - 7, 4, 2.5);
        ctx.fillRect(3, headY - 7, 4, 2.5);
      }

      // EYES
      // Left Eye
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6.5, headY - 4, 3.5, 4.5);
      ctx.fillStyle = eyeLeft;
      ctx.fillRect(-6, headY - 3.5, 2.5, 3.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5.5, headY - 3.5, 1.2, 1.2); // Eye glint

      // Right Eye
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(3, headY - 4, 3.5, 4.5);
      ctx.fillStyle = eyeRight;
      ctx.fillRect(3.5, headY - 3.5, 2.5, 3.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, headY - 3.5, 1.2, 1.2); // Eye glint

      // NOSE
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, headY + 2, 2.2, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // MOUTH / TONGUE (Panting / Happy)
      if (husky.mood === 'loving' || husky.mood === 'playful' || isEating) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(0, headY + 5, 2.5, 0, Math.PI);
        ctx.fill();
      }
    } else {
      // Facing Up - back of head marking
      ctx.fillStyle = coatPrimary;
      ctx.fillRect(-8, headY - 8, 16, 14);
    }

    // NAME TAG & HEARTS ABOVE HEAD
    ctx.font = 'bold 10px var(--font-pixelify)';
    ctx.textAlign = 'center';
    
    // Background plate for name
    const textWidth = ctx.measureText(husky.name).width;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.roundRect(-textWidth / 2 - 5, headY - 32, textWidth + 10, 14, 4);
    ctx.fill();
    ctx.strokeStyle = husky.collarColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Name text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(husky.name, 0, headY - 21);

    // Floating Mood Icon / Speech Bubble
    if (husky.speechBubble && husky.speechBubble.duration > 0) {
      const bubbleY = headY - 48;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-12, bubbleY - 8, 24, 18, 6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-3, bubbleY + 10);
      ctx.lineTo(0, bubbleY + 14);
      ctx.lineTo(3, bubbleY + 10);
      ctx.fill();

      ctx.fillStyle = '#e11d48';
      if (husky.speechBubble.type === 'heart') {
        ctx.font = '12px sans-serif';
        ctx.fillText('💖', 0, bubbleY + 5);
      } else if (husky.speechBubble.type === 'food') {
        ctx.font = '12px sans-serif';
        ctx.fillText('🍖', 0, bubbleY + 5);
      } else if (husky.speechBubble.type === 'bark') {
        ctx.font = 'bold 10px var(--font-pixelify)';
        ctx.fillStyle = '#1e293b';
        ctx.fillText('🐾', 0, bubbleY + 5);
      }
    }

    ctx.restore();
  }

  // Draw Player Caretaker
  public static drawPlayer(ctx: CanvasRenderingContext2D, player: Player, activeItem: any, time: number) {
    ctx.save();
    ctx.translate(player.x, player.y);

    const isMoving = player.isMoving;
    const walkBob = isMoving ? Math.sin(time * 14) * 2.5 : 0;
    const legOffset = isMoving ? Math.sin(time * 14) * 5 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, walkBob);

    // LEGS & BOOTS
    ctx.fillStyle = '#1e1b4b'; // Dark leggings
    ctx.fillRect(-5 + legOffset, 6, 4, 9);
    ctx.fillRect(1 - legOffset, 6, 4, 9);

    // Cute boots with fur trim
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6 + legOffset, 13, 5, 4);
    ctx.fillRect(1 - legOffset, 13, 5, 4);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-6 + legOffset, 12, 5, 1.5);
    ctx.fillRect(1 - legOffset, 12, 5, 1.5);

    // BACK HAIR (Draping behind shoulders when walking)
    ctx.fillStyle = '#3a1e0d'; // Chestnut brown long hair
    if (player.facing === 'up') {
      // Long hair down back
      ctx.fillRect(-8, -16, 16, 18);
      ctx.beginPath();
      ctx.arc(0, 2, 7, 0, Math.PI);
      ctx.fill();
    } else {
      // Side locks hanging down
      ctx.fillRect(-10, -14, 4, 16 + walkBob);
      ctx.fillRect(6, -14, 4, 16 - walkBob);
    }

    // TORSO / COZY SWEATER & SCARF
    ctx.fillStyle = '#9d174d'; // Cozy Berry-Plum Knit Sweater
    ctx.beginPath();
    ctx.roundRect(-8, -6, 16, 14, 4);
    ctx.fill();

    // Cute golden scarf / neck collar
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-7, -6, 14, 3.5);
    ctx.fillRect(2, -3, 3.5, 6); // Scarf tail

    // ARMS & HANDS
    ctx.fillStyle = '#831843';
    if (player.actionState === 'petting') {
      // Hands outstretched petting
      ctx.fillRect(-11, -4, 4, 10);
      ctx.fillRect(7, -4, 4, 10);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-11, 4, 4, 4);
      ctx.fillRect(7, 4, 4, 4);
    } else if (player.actionState === 'digging') {
      // Holding shovel down
      ctx.fillRect(-9, -2, 4, 10);
      ctx.fillRect(5, 0, 4, 10);
      // Shovel handle & blade
      ctx.fillStyle = '#92400e';
      ctx.fillRect(8, -8, 3, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(6, 12, 7, 7);
    } else {
      // Normal walking arms
      ctx.fillRect(-10 - legOffset * 0.4, -4, 3.5, 10);
      ctx.fillRect(6.5 + legOffset * 0.4, -4, 3.5, 10);
      // Hands
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-10 - legOffset * 0.4, 4, 3.5, 3.5);
      ctx.fillRect(6.5 + legOffset * 0.4, 4, 3.5, 3.5);
    }

    // HEAD
    ctx.fillStyle = '#fed7aa'; // Skin tone
    ctx.beginPath();
    ctx.roundRect(-7, -18, 14, 13, 4);
    ctx.fill();

    // FRONT HAIR & BANGS
    ctx.fillStyle = '#3a1e0d'; // Chestnut brown hair
    // Top hair volume
    ctx.beginPath();
    ctx.roundRect(-8, -23, 16, 8, 4);
    ctx.fill();
    // Cute bangs
    ctx.fillRect(-7, -18, 14, 3.5);
    // Cute side strands
    ctx.fillRect(-8, -17, 3, 7);
    ctx.fillRect(5, -17, 3, 7);

    // Cute pink ribbon / hairclip
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(4, -22, 3, 3);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(5, -21, 1, 1);

    // FACE & GLASSES (If facing down / sideways)
    if (player.facing !== 'up') {
      // Rosy cheeks
      ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
      ctx.fillRect(-6, -11, 2.5, 1.5);
      ctx.fillRect(3.5, -11, 2.5, 1.5);

      // Eyes behind glasses
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-4.5, -14, 2, 2.5);
      ctx.fillRect(2.5, -14, 2, 2.5);

      // GLASSES (LENTES)
      ctx.strokeStyle = '#0f172a'; // Dark retro frames
      ctx.lineWidth = 1.2;
      // Left rim
      ctx.strokeRect(-6, -16, 4.5, 5);
      // Right rim
      ctx.strokeRect(1.5, -16, 4.5, 5);
      // Bridge between lenses
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-1.5, -14, 3, 1);

      // Lens light reflection glint
      ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
      ctx.fillRect(-5, -15, 1.5, 1.5);
      ctx.fillRect(2.5, -15, 1.5, 1.5);

      // Sweet smile
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -9.5, 2, 0, Math.PI);
      ctx.stroke();
    }

    // HELD ITEM (Above or in hand)
    if (activeItem && activeItem.count > 0 && player.actionState !== 'digging') {
      ctx.save();
      ctx.translate(10, 0);
      if (activeItem.type === 'bone' || activeItem.type === 'golden_bone') {
        ctx.fillStyle = activeItem.type === 'golden_bone' ? '#f59e0b' : '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(-4, -6, 8, 4, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-4, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(-4, -8, 2.5, 0, Math.PI * 2);
        ctx.arc(4, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(4, -8, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeItem.type === 'toy_ball') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -6, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeItem.type === 'moon_biscuit') {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, -6, 5, 0.4, 2.4);
        ctx.lineTo(0, -6);
        ctx.fill();
      } else if (activeItem.type === 'magic_star') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -6, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Interactive Dig Spots & Bushes
  public static drawDigSpot(ctx: CanvasRenderingContext2D, spot: DigSpot, time: number) {
    ctx.save();
    ctx.translate(spot.x, spot.y);

    if (spot.type === 'mound') {
      // Dirt Mound
      ctx.fillStyle = '#5c3818';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#804c20';
      ctx.beginPath();
      ctx.ellipse(0, -2, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bone tip peeking if not yet dug
      if (!spot.discovered) {
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.ellipse(2, -4, 4, 2, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle
        const sparkle = Math.sin(time * 6 + spot.x) > 0.4;
        if (sparkle) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(4, -10, 3, 3);
          ctx.fillRect(3, -11, 5, 1);
          ctx.fillRect(5, -13, 1, 5);
        }
      }
    } else if (spot.type === 'bush') {
      // Lush Night Bush
      const sway = Math.sin(time * 3 + spot.x) * 1.5;
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(-6 + sway, -4, 12, 0, Math.PI * 2);
      ctx.arc(6 - sway, -4, 12, 0, Math.PI * 2);
      ctx.arc(0, -12, 14, 0, Math.PI * 2);
      ctx.fill();

      // Bush highlights
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.arc(0, -14, 9, 0, Math.PI * 2);
      ctx.fill();

      // Little night berries / sparkles
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(-4, -10, 2, 0, Math.PI * 2);
      ctx.arc(5, -14, 2.5, 0, Math.PI * 2);
      ctx.arc(1, -6, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (spot.type === 'sparkle') {
      // Mystery Moon Shimmer on ground
      const pulse = 0.6 + Math.sin(time * 5 + spot.x) * 0.4;
      ctx.fillStyle = `rgba(253, 224, 71, ${pulse * 0.8})`;
      ctx.beginPath();
      ctx.arc(0, 0, 8 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1.5, -6, 3, 12);
      ctx.fillRect(-6, -1.5, 12, 3);
    }

    ctx.restore();
  }

  // Draw Bouncing Toy Ball
  public static drawBall(ctx: CanvasRenderingContext2D, ball: BallEntity, time: number) {
    if (!ball.active) return;
    ctx.save();
    ctx.translate(ball.x, ball.y);

    // Ball shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Toy Ball
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Yellow star stripe
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-4, -1.5, 8, 3);

    // Light reflection
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2.5, -4, 2, 2);

    ctx.restore();
  }

  // Draw Environment (Pond, Wooden Fences, Dog Beds, Lanterns)
  public static drawEnvironment(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    // 1. Dog Beds Corner (5 cute colored beds for the 5 huskies)
    const beds = [
      { name: 'Yeiko', color: '#ef4444', x: 200, y: 150 },
      { name: 'Bella', color: '#ec4899', x: 260, y: 150 },
      { name: 'Lola', color: '#eab308', x: 320, y: 150 },
      { name: 'Cejas', color: '#14b8a6', x: 380, y: 150 },
      { name: 'Frida', color: '#a855f7', x: 440, y: 150 },
    ];

    beds.forEach(bed => {
      ctx.save();
      ctx.translate(bed.x, bed.y);

      // Bed Base
      ctx.fillStyle = '#3e220d';
      ctx.beginPath();
      ctx.roundRect(-22, -14, 44, 28, 8);
      ctx.fill();

      // Soft Cushion
      ctx.fillStyle = bed.color;
      ctx.beginPath();
      ctx.roundRect(-18, -11, 36, 22, 6);
      ctx.fill();

      // Little pillow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-16, -9, 12, 10, 3);
      ctx.fill();

      // Paw print emblem
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(6, 0, 3, 0, Math.PI * 2);
      ctx.arc(3, -4, 1.5, 0, Math.PI * 2);
      ctx.arc(9, -4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Name banner on top
      ctx.font = '8px var(--font-pixelify)';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde68a';
      ctx.fillText(bed.name, 0, -17);

      ctx.restore();
    });

    // 3. Water Pond with Moon Shimmer (Top-Right)
    const pondX = 720;
    const pondY = 160;
    ctx.fillStyle = '#0c4a6e';
    ctx.beginPath();
    ctx.ellipse(pondX, pondY, 65, 45, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(pondX, pondY, 55, 36, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Water ripple & moon reflection
    const shimmer = Math.sin(time * 4) * 4;
    ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
    ctx.beginPath();
    ctx.ellipse(pondX + shimmer, pondY, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water lilies
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(pondX - 25, pondY - 10, 8, 0.5, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f472b6'; // Pink lily flower
    ctx.beginPath();
    ctx.arc(pondX - 25, pondY - 10, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(pondX + 20, pondY + 12, 7, 0.4, Math.PI * 2);
    ctx.fill();

    // 4. Wooden Fences & Fairy Lights along the borders
    ctx.fillStyle = '#542d10';
    // Top fence line
    for (let fx = 120; fx < width - 100; fx += 40) {
      ctx.fillRect(fx, 90, 6, 26);
      ctx.fillRect(fx - 2, 96, 44, 4);
      ctx.fillRect(fx - 2, 106, 44, 4);

      // Warm fairy light bulb
      const bulbColor = (fx / 40) % 2 === 0 ? '#fde047' : '#ec4899';
      ctx.fillStyle = bulbColor;
      ctx.beginPath();
      ctx.arc(fx + 20, 98 + Math.sin(time * 3 + fx) * 1.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#542d10';
    }
  }

  // Clear Ambient Night Lighting (Soft lantern and fireflies)
  public static drawNightLighting(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    player: Player,
    time: number,
    fireflies: Particle[]
  ) {
    ctx.save();
    
    // 1. Player gentle lantern glow
    const playerRadius = 70;
    const playerGrad = ctx.createRadialGradient(player.x, player.y, 5, player.x, player.y, playerRadius);
    playerGrad.addColorStop(0, 'rgba(254, 240, 138, 0.20)');
    playerGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = playerGrad;
    ctx.beginPath();
    ctx.arc(player.x, player.y, playerRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Fireflies subtle twinkling halos
    fireflies.forEach(ff => {
      const ffGrad = ctx.createRadialGradient(ff.x, ff.y, 1, ff.x, ff.y, 14);
      ffGrad.addColorStop(0, 'rgba(253, 224, 71, 0.4)');
      ffGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = ffGrad;
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, 14, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Draw Particles (Hearts, Fireflies, Sparkles, Embers)
  public static drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    particles.forEach(p => {
      ctx.save();
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;

      if (p.type === 'heart') {
        ctx.fillStyle = '#f43f5e';
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('💖', p.x, p.y);
      } else if (p.type === 'star' || p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.6, p.size * 0.6);
      } else if (p.type === 'firefly') {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'fire') {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(p.x, p.y, p.size, p.size);
      } else if (p.type === 'dust') {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }
}
