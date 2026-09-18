export type HuskyId = 'yeiko' | 'bella' | 'lola' | 'cejas' | 'frida';

export type HuskyMood = 'playful' | 'happy' | 'curious' | 'sleepy' | 'hungry' | 'loving' | 'excited';

export type Direction = 'down' | 'up' | 'left' | 'right';

export type HuskyState = 'idle' | 'walking' | 'sleeping' | 'eating' | 'playing' | 'following' | 'jumping' | 'sitting' | 'fetching';

export interface Husky {
  id: HuskyId;
  name: string;
  subtitle: string;
  bio: string;
  personality: string;
  coatColor: string; // e.g. "Negro y Blanco Clásico"
  eyeColor: string;  // e.g. "Azul Zafiro"
  collarColor: string; // Hex color for badge/collar
  tagSymbol: string;
  favoriteItemId: string;
  favoriteItemName: string;
  dislikeItemName: string;
  love: number; // 0 - 100
  hearts: number; // 0 - 5 (love / 20)
  mood: HuskyMood;
  isFollowing: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: Direction;
  state: HuskyState;
  stateTimer: number;
  tailWagSpeed: number;
  tailAngle: number;
  animFrame: number;
  animTimer: number;
  speechBubble?: {
    text: string;
    duration: number;
    type: 'bark' | 'heart' | 'question' | 'sleep' | 'food';
  };
  memoriesUnlocked: number[]; // e.g. [25, 50, 75, 100]
  customDescription?: string;
}

export type ItemType = 'bone' | 'golden_bone' | 'moon_biscuit' | 'toy_ball' | 'brush' | 'magic_star' | 'water_bowl';

export interface Item {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  iconName: string;
  loveBonus: number; // base love added
  count: number;
  usableOnGround?: boolean;
}

export interface DigSpot {
  id: string;
  x: number;
  y: number;
  type: 'mound' | 'sparkle' | 'bush' | 'stump';
  itemId: string;
  discovered: boolean;
  digProgress: number; // 0 to 100
  respawnTimer: number;
}

export interface BallEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  bounces: number;
  carrierId: HuskyId | null;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'heart' | 'star' | 'sparkle' | 'firefly' | 'smoke' | 'dust' | 'note' | 'fire';
}

export interface Player {
  x: number;
  y: number;
  facing: Direction;
  isMoving: boolean;
  animFrame: number;
  animTimer: number;
  actionState: 'none' | 'digging' | 'petting' | 'throwing' | 'calling';
  actionTimer: number;
  interactingTargetId: HuskyId | null;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  rewardText: string;
  rewardItem?: Item;
}

export interface Memory {
  id: string;
  huskyId: HuskyId;
  huskyName: string;
  title: string;
  description: string;
  threshold: number; // 25, 50, 75, 100
  unlocked: boolean;
  dateUnlocked?: string;
  illustrationKey: string;
}

export interface GameTime {
  hour: number;
  minute: number;
  dayCount: number;
  timeSpeed: number; // how fast minutes advance
}
