'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Husky, Player, DigSpot, BallEntity, Particle,
  Item, GameTime, HuskyId, Direction, HuskyState
} from '../../types/game';
import {
  INITIAL_HUSKIES, INITIAL_ITEMS, INITIAL_DIG_SPOTS,
  INITIAL_QUESTS, HUSKY_MEMORIES, HUSKY_DIALOGUES
} from '../../data/gameData';
import { SpriteRenderer } from '../../utils/spriteRenderer';
import { soundEngine } from '../../utils/soundEngine';
import { HuskyHUD } from './HuskyHUD';
import { HuskyDialogueModal } from './HuskyDialogueModal';
import { HuskyAlbumModal } from './HuskyAlbumModal';
import { QuestLogModal } from './QuestLogModal';
import { VictoryModal } from './VictoryModal';
import { VirtualControls } from './VirtualControls';

export const PixelCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game World State
  const [huskies, setHuskies] = useState<Husky[]>(INITIAL_HUSKIES);
  const [inventory, setInventory] = useState<Item[]>(INITIAL_ITEMS);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [digSpots, setDigSpots] = useState<DigSpot[]>(INITIAL_DIG_SPOTS);
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [unlockedMemoryIds, setUnlockedMemoryIds] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameTime, setGameTime] = useState<GameTime>({ hour: 9, minute: 30, dayCount: 1, timeSpeed: 1 });

  // Modals & Active UI
  const [activeHusky, setActiveHusky] = useState<Husky | null>(null);
  const [showAlbum, setShowAlbum] = useState<boolean>(false);
  const [showQuests, setShowQuests] = useState<boolean>(false);
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);

  // Entities Ref for High-Frequency 60fps Loop
  const gameStateRef = useRef({
    player: {
      x: 480,
      y: 350,
      facing: 'down' as Direction,
      isMoving: false,
      animFrame: 0,
      animTimer: 0,
      actionState: 'none' as Player['actionState'],
      actionTimer: 0,
      interactingTargetId: null as HuskyId | null,
    } as Player,
    huskies: INITIAL_HUSKIES,
    digSpots: INITIAL_DIG_SPOTS,
    ball: {
      x: 480,
      y: 350,
      vx: 0,
      vy: 0,
      active: false,
      bounces: 0,
      carrierId: null as HuskyId | null,
    } as BallEntity,
    particles: [] as Particle[],
    keys: {} as Record<string, boolean>,
    virtualKeys: { up: false, down: false, left: false, right: false },
    time: 0,
    camera: { x: 0, y: 0 },
    nearbyInteraction: null as { type: 'husky' | 'spot'; id: string; name: string } | null,
  });

  // World bounds
  const WORLD_WIDTH = 960;
  const WORLD_HEIGHT = 640;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Update Quest Progress helper
  const updateQuest = useCallback((questId: string, amount: number = 1) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.completed) {
          const nextCur = Math.min(q.target, q.current + amount);
          const isDone = nextCur >= q.target;
          if (isDone) {
            soundEngine.playVictory();
            showToast(`⭐ ¡Misión Completada: ${q.title}!`);
          }
          return { ...q, current: nextCur, completed: isDone };
        }
        return q;
      })
    );
  }, [showToast]);

  // Check & Unlock Memory helper
  const checkMemoryMilestones = useCallback((husky: Husky, newLove: number) => {
    const thresholds = [25, 50, 75, 100];
    thresholds.forEach((thresh) => {
      if (newLove >= thresh) {
        const memory = HUSKY_MEMORIES.find(
          (m) => m.huskyId === husky.id && m.threshold === thresh
        );
        if (memory) {
          setUnlockedMemoryIds((prev) => {
            if (!prev.includes(memory.id)) {
              soundEngine.playHeartChime();
              showToast(`📸 ¡Nueva Foto Polaroid Desbloqueada de ${husky.name}!`);
              return [...prev, memory.id];
            }
            return prev;
          });
        }
      }
    });
  }, [showToast]);

  // Spawn Particle helper
  const spawnParticles = (x: number, y: number, type: Particle['type'], count: number = 5, color?: string) => {
    const newParts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.5;
      newParts.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'heart' || type === 'star' ? 1.2 : 0),
        color: color || (type === 'heart' ? '#f43f5e' : type === 'star' ? '#fde047' : '#ffffff'),
        size: type === 'heart' ? 14 : 3 + Math.random() * 3,
        life: 1.0,
        maxLife: 0.8 + Math.random() * 0.6,
        type,
      });
    }
    gameStateRef.current.particles.push(...newParts);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      gameStateRef.current.keys[k] = true;

      // Item selection hotkeys 1-6
      if (['1', '2', '3', '4', '5', '6'].includes(k)) {
        const idx = parseInt(k, 10) - 1;
        if (idx < inventory.length) {
          setActiveItemIndex(idx);
          soundEngine.playItemPickup();
        }
      }

      // Quick keys
      if (k === 'f') {
        handleWhistle();
      } else if (k === 'q') {
        handleThrowBall();
      } else if (k === 'e' || k === ' ') {
        handleActionPress('interact');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      gameStateRef.current.keys[k] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inventory]);

  // Pet Action
  const handlePetHusky = (huskyId: string) => {
    const husky = gameStateRef.current.huskies.find((h) => h.id === huskyId);
    if (!husky) return;

    soundEngine.playHeartChime();
    soundEngine.playBark(husky.id === 'bella' ? 1.4 : husky.id === 'cejas' ? 0.8 : 1.1);

    const loveGain = 8;
    const newLove = Math.min(100, husky.love + loveGain);

    spawnParticles(husky.x, husky.y - 12, 'heart', 8);

    setHuskies((prev) =>
      prev.map((h) => {
        if (h.id === huskyId) {
          const updated = {
            ...h,
            love: newLove,
            hearts: Math.floor(newLove / 20),
            mood: 'loving' as const,
            speechBubble: { text: '💖', duration: 3.5, type: 'heart' as const },
          };
          const refH = gameStateRef.current.huskies.find((rh) => rh.id === huskyId);
          if (refH) {
            refH.love = newLove;
            refH.hearts = Math.floor(newLove / 20);
          }
          return updated;
        }
        return h;
      })
    );

    gameStateRef.current.player.actionState = 'petting';
    gameStateRef.current.player.actionTimer = 0.8;

    updateQuest('pet_all', 1);
    checkMemoryMilestones(husky, newLove);
    showToast(`💖 ¡Acariciaste a ${husky.name}! (+${loveGain}%)`);
  };

  // Feed Action
  const handleFeedHusky = (huskyId: string, item: Item) => {
    if (item.count <= 0) {
      showToast('⚠️ No te quedan unidades de este alimento.');
      return;
    }

    const husky = gameStateRef.current.huskies.find((h) => h.id === huskyId);
    if (!husky) return;

    soundEngine.playCrunchEat();
    soundEngine.playHeartChime();

    // Calculate love bonus (extra if favorite!)
    const isFavorite = husky.favoriteItemId === item.type || husky.favoriteItemId === item.id;
    const bonus = isFavorite ? item.loveBonus * 1.5 : item.loveBonus;
    const newLove = Math.min(100, Math.round(husky.love + bonus));

    spawnParticles(husky.x, husky.y - 10, 'star', 10, '#fde047');
    spawnParticles(husky.x, husky.y - 10, 'heart', 6);

    // Consume 1 item
    setInventory((prev) =>
      prev.map((inv) => (inv.id === item.id ? { ...inv, count: inv.count - 1 } : inv))
    );

    setHuskies((prev) =>
      prev.map((h) => {
        if (h.id === huskyId) {
          const updated = {
            ...h,
            love: newLove,
            hearts: Math.floor(newLove / 20),
            mood: 'happy' as const,
            speechBubble: { text: isFavorite ? '⭐ ¡DELICIOSO!' : '🍖 ¡GRACIAS!', duration: 4.0, type: 'food' as const },
          };
          const refH = gameStateRef.current.huskies.find((rh) => rh.id === huskyId);
          if (refH) {
            refH.love = newLove;
            refH.hearts = Math.floor(newLove / 20);
          }
          return updated;
        }
        return h;
      })
    );

    updateQuest('first_treat', 1);
    checkMemoryMilestones(husky, newLove);
    showToast(`🍖 ¡${husky.name} saboreó ${item.name}! (+${Math.round(bonus)}%)`);
  };

  // Update Custom Description
  const handleUpdateDescription = (huskyId: string, desc: string) => {
    setHuskies((prev) =>
      prev.map((h) => (h.id === huskyId ? { ...h, customDescription: desc } : h))
    );
    if (activeHusky && activeHusky.id === huskyId) {
      setActiveHusky((prev) => (prev ? { ...prev, customDescription: desc } : null));
    }
  };

  // Toggle Follow Command
  const handleToggleFollow = (huskyId: string) => {
    soundEngine.playWhistle();
    let nextFollowState = false;

    // Direct synchronization with 60fps loop state
    const targetHusky = gameStateRef.current.huskies.find((h) => h.id === huskyId);
    if (targetHusky) {
      targetHusky.isFollowing = !targetHusky.isFollowing;
      targetHusky.state = targetHusky.isFollowing ? 'following' : 'idle';
      nextFollowState = targetHusky.isFollowing;
    }

    setHuskies((prev) => {
      const updated = prev.map((h) => {
        if (h.id === huskyId) {
          showToast(nextFollowState ? `🐾 ¡${h.name} ahora te seguirá!` : `💤 ${h.name} se quedó jugando.`);
          return { ...h, isFollowing: nextFollowState, state: (nextFollowState ? 'following' : 'idle') as HuskyState };
        }
        return h;
      });

      const followingCount = updated.filter((h) => h.isFollowing).length;
      if (followingCount >= 3) {
        updateQuest('pack_train', followingCount);
      }
      return updated;
    });

    if (activeHusky && activeHusky.id === huskyId) {
      setActiveHusky((prev) => (prev ? { ...prev, isFollowing: nextFollowState } : null));
    }
  };

  // Whistle to Call All / Toggle Conga Line
  const handleWhistle = () => {
    soundEngine.playWhistle();
    spawnParticles(gameStateRef.current.player.x, gameStateRef.current.player.y - 20, 'note', 8, '#38bdf8');

    // Check if any husky is currently following
    const anyFollowing = gameStateRef.current.huskies.some((h) => h.isFollowing);
    const nextVal = !anyFollowing;

    // Directly update loop state
    gameStateRef.current.huskies.forEach((h) => {
      h.isFollowing = nextVal;
      h.state = nextVal ? 'following' : 'idle';
      h.speechBubble = { text: nextVal ? '¡Auuu!' : '¡Wuf!', duration: 2.5, type: 'bark' };
    });

    setHuskies((prev) => {
      showToast(nextVal ? '📢 ¡Silbaste! ¡Toda la manada te sigue!' : '📢 ¡La manada se dispersa a explorar!');
      return prev.map((h) => ({
        ...h,
        isFollowing: nextVal,
        state: (nextVal ? 'following' : 'idle') as HuskyState,
        speechBubble: { text: nextVal ? '¡Auuu!' : '¡Wuf!', duration: 2.5, type: 'bark' as const },
      }));
    });

    if (nextVal) {
      updateQuest('pack_train', 5);
    }

    soundEngine.playHowl();
  };

  // Throw Ball Action (Fetch Mini-Game)
  const handleThrowBall = () => {
    const ballItem = inventory.find((i) => i.type === 'toy_ball');
    if (!ballItem || ballItem.count <= 0) {
      showToast('⚠️ Necesitas la Pelota Chillona en tu inventario para jugar.');
      return;
    }

    const player = gameStateRef.current.player;
    soundEngine.playThrow();

    let vx = 0;
    let vy = 0;
    if (player.facing === 'down') vy = 7;
    else if (player.facing === 'up') vy = -7;
    else if (player.facing === 'left') vx = -7;
    else if (player.facing === 'right') vx = 7;

    gameStateRef.current.ball = {
      x: player.x,
      y: player.y,
      vx,
      vy,
      active: true,
      bounces: 0,
      carrierId: null,
    };

    spawnParticles(player.x, player.y, 'dust', 6);
    showToast('🎾 ¡Lanzaste la pelota! ¡Los huskies corren a buscarla!');
  };

  // General Action Button Handler
  const handleActionPress = (action: 'interact' | 'dig' | 'throw' | 'whistle') => {
    if (action === 'whistle') return handleWhistle();
    if (action === 'throw') return handleThrowBall();

    const player = gameStateRef.current.player;

    // Check nearest husky
    const nearestHusky = gameStateRef.current.huskies.find((h) => {
      const dist = Math.hypot(h.x - player.x, h.y - player.y);
      return dist < 42;
    });

    if (nearestHusky) {
      setActiveHusky(nearestHusky);
      return;
    }

    // Check nearest Dig Spot / Bush
    const nearestSpot = gameStateRef.current.digSpots.find((s) => {
      const dist = Math.hypot(s.x - player.x, s.y - player.y);
      return dist < 36;
    });

    if (nearestSpot && !nearestSpot.discovered) {
      // Dig the spot
      soundEngine.playDig();
      spawnParticles(nearestSpot.x, nearestSpot.y, 'dust', 10);
      player.actionState = 'digging';
      player.actionTimer = 0.5;

      const foundItem = INITIAL_ITEMS.find((i) => i.id === nearestSpot.itemId) || INITIAL_ITEMS[0];

      // Add to inventory
      setInventory((prev) =>
        prev.map((inv) => (inv.id === foundItem.id ? { ...inv, count: inv.count + 1 } : inv))
      );

      // Mark spot as discovered temporarily
      nearestSpot.discovered = true;
      setDigSpots((prev) =>
        prev.map((s) => (s.id === nearestSpot.id ? { ...s, discovered: true } : s))
      );

      soundEngine.playItemPickup();
      spawnParticles(nearestSpot.x, nearestSpot.y, 'star', 8, '#fde047');
      updateQuest('dig_treasures', 1);
      showToast(`¡Desenterraste: ${foundItem.name}! (+1 al inventario)`);

      // Relocate the bone/spot to a new random location in the patio after a short delay!
      setTimeout(() => {
        let newX = 160 + Math.random() * (WORLD_WIDTH - 320);
        let newY = 160 + Math.random() * (WORLD_HEIGHT - 280);

        // Avoid water pond (720, 160)
        if (Math.hypot(newX - 720, newY - 160) < 95) {
          newX = 240 + Math.random() * 200;
          newY = 240 + Math.random() * 200;
        }

        const newPos = { x: Math.round(newX), y: Math.round(newY) };
        const possibleItems = ['bone', 'bone', 'golden_bone'];
        const nextItemId = possibleItems[Math.floor(Math.random() * possibleItems.length)];

        setDigSpots((prev) =>
          prev.map((s) =>
            s.id === nearestSpot.id
              ? { ...s, x: newPos.x, y: newPos.y, itemId: nextItemId, discovered: false }
              : s
          )
        );

        const refSpot = gameStateRef.current.digSpots.find((s) => s.id === nearestSpot.id);
        if (refSpot) {
          refSpot.x = newPos.x;
          refSpot.y = newPos.y;
          refSpot.itemId = nextItemId;
          refSpot.discovered = false;
        }

        // Spawn a welcoming sparkle particle at the new location
        spawnParticles(newPos.x, newPos.y, 'star', 6, '#fde047');
      }, 1400);
    }
  };

  // Direction virtual handler
  const handleDirectionPress = (dir: 'up' | 'down' | 'left' | 'right', isPressed: boolean) => {
    gameStateRef.current.virtualKeys[dir] = isPressed;
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Check victory condition (All 5 huskies >= 100% love)
  useEffect(() => {
    const allMaxLove = huskies.every((h) => h.love >= 100);
    if (allMaxLove && !hasWon) {
      setHasWon(true);
      setShowVictory(true);
      updateQuest('master_love', 5);
    }
  }, [huskies, hasWon, updateQuest]);

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Start background lofi music on first interaction
    const startAudio = () => {
      soundEngine.startBackgroundMusic();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);

    let animationFrameId: number;
    let lastTime = performance.now();

    // Spawn initial night fireflies
    for (let i = 0; i < 18; i++) {
      gameStateRef.current.particles.push({
        id: 'firefly_' + i,
        x: 100 + Math.random() * (WORLD_WIDTH - 200),
        y: 100 + Math.random() * (WORLD_HEIGHT - 200),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: '#fde047',
        size: 2.2,
        life: 100,
        maxLife: 100,
        type: 'firefly',
      });
    }

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      gameStateRef.current.time += dt;
      const time = gameStateRef.current.time;

      const { player, ball, keys, virtualKeys, particles } = gameStateRef.current;
      const currentHuskies = gameStateRef.current.huskies;
      const currentDigSpots = gameStateRef.current.digSpots;

      // 1. UPDATE PLAYER MOVEMENT
      let moveX = 0;
      let moveY = 0;
      const speed = 160 * dt;

      if (keys['w'] || keys['arrowup'] || virtualKeys.up) {
        moveY -= speed;
        player.facing = 'up';
      }
      if (keys['s'] || keys['arrowdown'] || virtualKeys.down) {
        moveY += speed;
        player.facing = 'down';
      }
      if (keys['a'] || keys['arrowleft'] || virtualKeys.left) {
        moveX -= speed;
        player.facing = 'left';
      }
      if (keys['d'] || keys['arrowright'] || virtualKeys.right) {
        moveX += speed;
        player.facing = 'right';
      }

      player.isMoving = moveX !== 0 || moveY !== 0;
      player.x = Math.max(120, Math.min(WORLD_WIDTH - 120, player.x + moveX));
      player.y = Math.max(120, Math.min(WORLD_HEIGHT - 100, player.y + moveY));

      if (player.actionTimer > 0) {
        player.actionTimer -= dt;
        if (player.actionTimer <= 0) player.actionState = 'none';
      }

      // Check nearby prompt for interactive huskies or dig spots
      const playerDistToHusky = currentHuskies.find(h => Math.hypot(h.x - player.x, h.y - player.y) < 45);
      const playerDistToSpot = currentDigSpots.find(s => !s.discovered && Math.hypot(s.x - player.x, s.y - player.y) < 40);

      let currentPrompt: string | null = null;
      if (playerDistToHusky) {
        currentPrompt = `💖 [E] o Clic: Acariciar o hablar con ${playerDistToHusky.name}`;
      } else if (playerDistToSpot) {
        if (playerDistToSpot.type === 'bush') {
          currentPrompt = '🌿 [E] o [Espacio]: Revisar arbusto nocturno';
        } else if (playerDistToSpot.type === 'mound') {
          currentPrompt = '⛏️ [E] o [Espacio]: Desenterrar hueso del montículo';
        } else {
          currentPrompt = '⭐ [E] o [Espacio]: Recoger brillo de la luna';
        }
      }

      if (currentPrompt !== gameStateRef.current.nearbyInteraction?.name) {
        gameStateRef.current.nearbyInteraction = currentPrompt ? { type: 'husky', id: '', name: currentPrompt } : null;
        setInteractionPrompt(currentPrompt);
      }

      // 2. UPDATE BALL PHYSICS (Fetch Mini-Game)
      if (ball.active) {
        if (!ball.carrierId) {
          ball.x += ball.vx;
          ball.y += ball.vy;
          ball.vx *= 0.94;
          ball.vy *= 0.94;

          // Wall bounds bounce
          if (ball.x < 140 || ball.x > WORLD_WIDTH - 140) ball.vx *= -0.8;
          if (ball.y < 140 || ball.y > WORLD_HEIGHT - 120) ball.vy *= -0.8;

          if (Math.hypot(ball.vx, ball.vy) < 0.2) {
            ball.vx = 0;
            ball.vy = 0;
          }
        }
      }

      // 3. UPDATE HUSKIES AI & FOLLOWING TRAIN
      let followLeaderX = player.x;
      let followLeaderY = player.y;

      currentHuskies.forEach((husky, index) => {
        // Speech bubble timer
        if (husky.speechBubble && husky.speechBubble.duration > 0) {
          husky.speechBubble.duration -= dt;
        }

        // FETCHING BALL BEHAVIOR
        if (ball.active && !ball.carrierId) {
          const distToBall = Math.hypot(husky.x - ball.x, husky.y - ball.y);
          if (distToBall < 18) {
            // Pick up ball!
            ball.carrierId = husky.id;
            soundEngine.playBark(1.2);
            husky.speechBubble = { text: '¡La tengo!', duration: 2.5, type: 'bark' };
          } else {
            // Run to ball
            const angle = Math.atan2(ball.y - husky.y, ball.x - husky.x);
            const runSpeed = 130 * dt;
            husky.x += Math.cos(angle) * runSpeed;
            husky.y += Math.sin(angle) * runSpeed;
            husky.state = 'fetching';
            husky.facing = Math.cos(angle) > 0 ? 'right' : 'left';
            return;
          }
        } else if (ball.active && ball.carrierId === husky.id) {
          // Bring ball back to player!
          const distToPlayer = Math.hypot(husky.x - player.x, husky.y - player.y);
          if (distToPlayer < 35) {
            // Deliver ball!
            ball.active = false;
            ball.carrierId = null;
            soundEngine.playHeartChime();
            soundEngine.playBark(1.3);
            husky.speechBubble = { text: '¡Toma!', duration: 3, type: 'heart' };
            spawnParticles(husky.x, husky.y, 'heart', 8);

            const loveGain = 12;
            const newLove = Math.min(100, husky.love + loveGain);
            husky.love = newLove;
            updateQuest('play_fetch', 1);
            showToast(`🎾 ¡${husky.name} te trajo la pelota! (+${loveGain}%)`);
          } else {
            // Run toward player
            const angle = Math.atan2(player.y - husky.y, player.x - husky.x);
            const runSpeed = 110 * dt;
            husky.x += Math.cos(angle) * runSpeed;
            husky.y += Math.sin(angle) * runSpeed;
            ball.x = husky.x;
            ball.y = husky.y - 6;
            husky.state = 'fetching';
            husky.facing = Math.cos(angle) > 0 ? 'right' : 'left';
            return;
          }
        }

        // FOLLOWING PLAYER CONGA LINE
        if (husky.isFollowing) {
          const targetDist = 42;
          const distToLeader = Math.hypot(husky.x - followLeaderX, husky.y - followLeaderY);

          if (distToLeader > targetDist) {
            const angle = Math.atan2(followLeaderY - husky.y, followLeaderX - husky.x);
            const followSpeed = (distToLeader > 90 ? 150 : 105) * dt;
            husky.x += Math.cos(angle) * followSpeed;
            husky.y += Math.sin(angle) * followSpeed;
            husky.state = 'following';
            husky.facing = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
              ? Math.cos(angle) > 0 ? 'right' : 'left'
              : Math.sin(angle) > 0 ? 'down' : 'up';
          } else {
            husky.state = 'idle';
          }

          followLeaderX = husky.x;
          followLeaderY = husky.y;
          return;
        }

        // AUTONOMOUS WANDER / REST
        if (husky.state !== 'sleeping') {
          husky.stateTimer -= dt;
          if (husky.stateTimer <= 0) {
            husky.stateTimer = 2.5 + Math.random() * 4.0;
            const rand = Math.random();
            if (rand < 0.45) {
              husky.state = 'walking';
              husky.targetX = Math.max(160, Math.min(WORLD_WIDTH - 160, husky.x + (Math.random() - 0.5) * 160));
              husky.targetY = Math.max(160, Math.min(WORLD_HEIGHT - 140, husky.y + (Math.random() - 0.5) * 140));
            } else if (rand < 0.8) {
              husky.state = 'idle';
            } else {
              husky.state = 'sitting';
            }
          }

          if (husky.state === 'walking') {
            const dist = Math.hypot(husky.targetX - husky.x, husky.targetY - husky.y);
            if (dist > 4) {
              const angle = Math.atan2(husky.targetY - husky.y, husky.targetX - husky.x);
              const walkSpeed = 45 * dt;
              husky.x += Math.cos(angle) * walkSpeed;
              husky.y += Math.sin(angle) * walkSpeed;
              husky.facing = Math.cos(angle) > 0 ? 'right' : 'left';
            } else {
              husky.state = 'idle';
            }
          }
        }
      });

      // 4. UPDATE PARTICLES & FIREFLIES
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 'firefly') {
          // Gentle wandering fireflies
          p.vx += (Math.random() - 0.5) * 0.15;
          p.vy += (Math.random() - 0.5) * 0.15;
          p.vx = Math.max(-0.6, Math.min(0.6, p.vx));
          p.vy = Math.max(-0.6, Math.min(0.6, p.vy));
          if (p.x < 120 || p.x > WORLD_WIDTH - 120) p.vx *= -1;
          if (p.y < 120 || p.y > WORLD_HEIGHT - 120) p.vy *= -1;
        } else {
          p.life -= dt;
          if (p.life <= 0) {
            particles.splice(i, 1);
          }
        }
      }

      // 5. RENDER PASS
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Clear & Vibrant Night Grass (Stardew Valley aesthetic)
      ctx.fillStyle = '#235937';
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // Grass texture checker & clover details
      ctx.fillStyle = '#2a6a42';
      for (let gx = 0; gx < WORLD_WIDTH; gx += 40) {
        for (let gy = 0; gy < WORLD_HEIGHT; gy += 40) {
          if ((gx + gy) % 80 === 0) {
            ctx.fillRect(gx + 2, gy + 2, 36, 36);
          }
        }
      }

      // Little cute wildflowers dotted on grass
      const flowerColors = ['#f472b6', '#fde047', '#93c5fd', '#ffffff', '#c084fc'];
      for (let fx = 130; fx < WORLD_WIDTH - 130; fx += 85) {
        for (let fy = 130; fy < WORLD_HEIGHT - 110; fy += 95) {
          const fColor = flowerColors[(fx + fy) % flowerColors.length];
          ctx.fillStyle = '#15803d'; // Stem/leaves
          ctx.fillRect(fx - 1, fy, 4, 3);
          ctx.fillStyle = fColor; // Petals
          ctx.fillRect(fx, fy - 2, 2, 2);
          ctx.fillRect(fx - 1, fy - 1, 4, 1);
        }
      }

      // Cobblestone path
      ctx.fillStyle = '#334155';
      ctx.fillRect(436, 96, 88, 488);
      ctx.fillRect(196, 316, 568, 68);

      ctx.fillStyle = '#475569';
      ctx.fillRect(440, 100, 80, 480);
      ctx.fillRect(200, 320, 560, 60);

      // Path stepping stones detail
      ctx.fillStyle = '#64748b';
      for (let px = 215; px < 740; px += 35) {
        ctx.fillRect(px, 335, 26, 16);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(px + 2, 337, 8, 4);
        ctx.fillStyle = '#64748b';
      }
      for (let py = 115; py < 560; py += 35) {
        ctx.fillRect(455, py, 26, 16);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(457, py + 2, 8, 4);
        ctx.fillStyle = '#64748b';
      }

      // Draw Environment & Structures
      SpriteRenderer.drawEnvironment(ctx, WORLD_WIDTH, WORLD_HEIGHT, time);

      // Draw Dig Spots & Bushes
      currentDigSpots.forEach((spot) => {
        SpriteRenderer.drawDigSpot(ctx, spot, time);
      });

      // Draw Ball
      SpriteRenderer.drawBall(ctx, ball, time);

      // Draw Huskies & Player sorted by Y for correct isometric depth
      const renderList: Array<{ type: 'player' | 'husky'; y: number; entity: any }> = [
        { type: 'player', y: player.y, entity: player },
        ...currentHuskies.map((h) => ({ type: 'husky' as const, y: h.y, entity: h })),
      ];
      renderList.sort((a, b) => a.y - b.y);

      const activeItem = inventory[activeItemIndex];
      renderList.forEach((item) => {
        if (item.type === 'player') {
          SpriteRenderer.drawPlayer(ctx, item.entity, activeItem, time);
        } else {
          SpriteRenderer.drawHusky(ctx, item.entity, time);
        }
      });

      // Draw Particles
      SpriteRenderer.drawParticles(ctx, particles);

      // Draw Dynamic Night Dark Overlay & Light Sources (Campfire, Player Lantern, Moon, Fireflies)
      const fireflies = particles.filter((p) => p.type === 'firefly');
      SpriteRenderer.drawNightLighting(ctx, WORLD_WIDTH, WORLD_HEIGHT, player, time, fireflies);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
      soundEngine.stopBackgroundMusic();
    };
  }, [inventory, activeItemIndex]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#080c1b] flex items-center justify-center select-none">
      {/* Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={WORLD_WIDTH}
        height={WORLD_HEIGHT}
        className="w-full h-full max-w-[1280px] max-h-[850px] object-contain shadow-2xl rounded-lg"
        style={{ imageRendering: 'pixelated' }}
        onClick={(e) => {
          // Click to interact or move
          const rect = e.currentTarget.getBoundingClientRect();
          const scaleX = WORLD_WIDTH / rect.width;
          const scaleY = WORLD_HEIGHT / rect.height;
          const clickX = (e.clientX - rect.left) * scaleX;
          const clickY = (e.clientY - rect.top) * scaleY;

          // Check if clicked near a husky
          const clickedHusky = gameStateRef.current.huskies.find((h) => {
            return Math.hypot(h.x - clickX, h.y - clickY) < 36;
          });

          if (clickedHusky) {
            setActiveHusky(clickedHusky);
          } else {
            handleActionPress('interact');
          }
        }}
      />

      {/* TOAST MESSAGE NOTIFICATION - High Contrast Solid Card */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pixel-box-parchment px-5 py-2.5 rounded-lg shadow-2xl border-4 border-[#3a1a04] text-[#3a1a04] font-black text-xs sm:text-sm animate-in fade-in slide-in-from-top-4 duration-200 flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="tracking-wide text-[#2e1402] font-black drop-shadow-sm">{toastMessage}</span>
        </div>
      )}

      {/* INTERACTION PROMPT BANNER - High Contrast Solid Card */}
      {interactionPrompt && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 pixel-box-parchment px-4 py-2 rounded-lg shadow-2xl border-3 border-[#4a2405] text-[#2b1301] font-black text-xs sm:text-sm flex items-center gap-2 animate-bounce">
          <span>{interactionPrompt}</span>
        </div>
      )}

      {/* GAME HUD OVERLAY */}
      <HuskyHUD
        huskies={huskies}
        inventory={inventory}
        activeItemIndex={activeItemIndex}
        onSelectItem={(idx) => {
          setActiveItemIndex(idx);
          soundEngine.playItemPickup();
        }}
        gameTime={gameTime}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenHuskyProfile={(h) => setActiveHusky(h)}
        onOpenAlbum={() => setShowAlbum(true)}
        onOpenQuests={() => setShowQuests(true)}
        onWhistle={handleWhistle}
        onThrowBall={handleThrowBall}
        unlockedMemoriesCount={unlockedMemoryIds.length}
        totalMemoriesCount={HUSKY_MEMORIES.length}
        activeQuestsCount={quests.filter((q) => !q.completed).length}
      />

      {/* VIRTUAL CONTROLS FOR TOUCH / MOBILE */}
      <VirtualControls
        onDirectionPress={handleDirectionPress}
        onActionPress={handleActionPress}
      />

      {/* HUSKY INTERACTION & PROFILE MODAL */}
      {activeHusky && (
        <HuskyDialogueModal
          husky={huskies.find((h) => h.id === activeHusky.id) || activeHusky}
          onClose={() => setActiveHusky(null)}
          onPet={handlePetHusky}
          onFeed={handleFeedHusky}
          onToggleFollow={handleToggleFollow}
          inventory={inventory}
          activeItem={inventory[activeItemIndex]}
          onOpenAlbum={() => setShowAlbum(true)}
          onUpdateDescription={handleUpdateDescription}
        />
      )}

      {/* POLAROID ALBUM MODAL */}
      {showAlbum && (
        <HuskyAlbumModal
          onClose={() => setShowAlbum(false)}
          unlockedMemoryIds={unlockedMemoryIds}
        />
      )}

      {/* QUESTS LOG MODAL */}
      {showQuests && (
        <QuestLogModal
          onClose={() => setShowQuests(false)}
          quests={quests}
        />
      )}

      {/* VICTORY 100% LOVE MODAL */}
      {showVictory && (
        <VictoryModal
          onClose={() => setShowVictory(false)}
        />
      )}
    </div>
  );
};
