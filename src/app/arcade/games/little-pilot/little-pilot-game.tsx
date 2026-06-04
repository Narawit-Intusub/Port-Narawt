"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./little-pilot.css";

// --- Types & Interfaces ---
interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  color: "blue" | "brown" | "green" | "red";
  frame: number;
  frameCounter: number;
  speed: number;
}

interface Explosion {
  x: number;
  y: number;
  frame: number;
  timer: number;
}

// --- Sound Engine Class ---
class SoundManager {
  private sounds: Record<string, HTMLAudioElement> = {};
  private muted: boolean = false;
  private currentBgm: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.sounds.menu = new Audio("/sounds/games/little-pilot/Ove Melaa - ItaloLoopDikkoDikko.wav");
      this.sounds.menu.loop = true;
      this.sounds.menu.volume = 0.04;

      this.sounds.fight = new Audio("/sounds/games/little-pilot/fight_looped.wav");
      this.sounds.fight.loop = true;
      this.sounds.fight.volume = 0.04;

      this.sounds.laser = new Audio("/sounds/games/little-pilot/laser.wav");
      this.sounds.laser.volume = 0.12;

      this.sounds.hit = new Audio("/sounds/games/little-pilot/chon.wav");
      this.sounds.hit.volume = 0.3;

      this.sounds.gameover = new Audio("/sounds/games/little-pilot/game_over.wav");
      this.sounds.gameover.volume = 0.25;
    }
  }

  setMute(mute: boolean) {
    this.muted = mute;
    Object.values(this.sounds).forEach(audio => {
      audio.muted = mute;
    });
  }

  playBgm(type: "menu" | "fight") {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.currentTime = 0;
    }
    const audio = this.sounds[type];
    if (audio) {
      this.currentBgm = audio;
      audio.muted = this.muted;
      audio.play().catch(err => console.log("Audio play blocked:", err));
    }
  }

  stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.currentTime = 0;
      this.currentBgm = null;
    }
  }

  playSound(name: "laser" | "hit" | "gameover") {
    const audio = this.sounds[name];
    if (audio) {
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.muted = this.muted;
      clone.volume = audio.volume;
      clone.play().catch(err => console.log("Sound play blocked:", err));
    }
  }
}

export default function LittlePilot() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [muted, setMuted] = useState(false);
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const assetsRef = useRef<Record<string, HTMLImageElement>>({});

  // Ref to avoid stale closure when reading gameState in callbacks
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Game engine mutable state
  const playerRef = useRef({
    x: 50,
    y: 350,
    width: 120,
    height: 75,
    angle: 0,
    frame: 0,
    frameCounter: 0,
    invulnerable: false,
    invulnerabilityStart: 0,
    lives: 3,
    score: 0,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const bgScrollRef = useRef(0);
  const selectedBgRef = useRef("/images/games/little-pilot/bg1.png");
  const lastBulletTimeRef = useRef(0);
  const nextEnemyTimeRef = useRef(0);
  const heartFrameRef = useRef({ index: 0, counter: 0 });

  const keysPressed = useRef<Record<string, boolean>>({});
  const touchState = useRef({ active: false, x: 0, y: 0 });

  // Init Sound Engine
  useEffect(() => {
    soundManagerRef.current = new SoundManager();
    // Play menu bgm initially on user click — use ref to avoid stale closure
    const handleFirstClick = () => {
      if (soundManagerRef.current && gameStateRef.current === "menu") {
        soundManagerRef.current.playBgm("menu");
      }
      window.removeEventListener("click", handleFirstClick);
    };
    window.addEventListener("click", handleFirstClick);

    return () => {
      if (soundManagerRef.current) {
        soundManagerRef.current.stopBgm();
      }
      window.removeEventListener("click", handleFirstClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync mute state
  useEffect(() => {
    if (soundManagerRef.current) {
      soundManagerRef.current.setMute(muted);
    }
  }, [muted]);

  // Load Assets
  useEffect(() => {
    const imageSources = [
      "/images/games/little-pilot/bg1.png",
      "/images/games/little-pilot/bg2.png",
      "/images/games/little-pilot/bg3.png",
      "/images/games/little-pilot/main.png",
      "/images/games/little-pilot/bullet.png",
      "/images/games/little-pilot/player/fly0.png",
      "/images/games/little-pilot/player/fly1.png",
      "/images/games/little-pilot/hearts/heart0.png",
      "/images/games/little-pilot/hearts/heart1.png",
      "/images/games/little-pilot/hearts/heart2.png",
      "/images/games/little-pilot/hearts/heart3.png",
      "/images/games/little-pilot/enemy/blue0.png",
      "/images/games/little-pilot/enemy/blue1.png",
      "/images/games/little-pilot/enemy/brown0.png",
      "/images/games/little-pilot/enemy/brown1.png",
      "/images/games/little-pilot/enemy/green0.png",
      "/images/games/little-pilot/enemy/green1.png",
      "/images/games/little-pilot/enemy/red0.png",
      "/images/games/little-pilot/enemy/red1.png",
      "/images/games/little-pilot/explosion/Explosion0.png",
      "/images/games/little-pilot/explosion/Explosion1.png",
      "/images/games/little-pilot/explosion/Explosion2.png",
      "/images/games/little-pilot/explosion/Explosion3.png",
      "/images/games/little-pilot/explosion/Explosion4.png",
      "/images/games/little-pilot/explosion/Explosion5.png",
      "/images/games/little-pilot/explosion/Explosion6.png",
    ];

    let loadedCount = 0;
    const totalCount = imageSources.length;

    imageSources.forEach(src => {
      const img = new Image();
      img.onload = () => {
        assetsRef.current[src] = img;
        loadedCount++;
        if (loadedCount === totalCount) {
          setIsAssetsLoaded(true);
        }
      };
      img.onerror = () => {
        console.error("Failed to load:", src);
        setErrorMessage(`Failed to load asset: ${src.split("/").pop()}`);
        loadedCount++;
        if (loadedCount === totalCount) {
          setIsAssetsLoaded(true);
        }
      };
      img.src = src;
    });
  }, []);

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== "playing") {
        if (e.key === "p" || e.key === "P" || e.key === "Escape") {
          if (gameStateRef.current === "paused") {
            setGameState("playing");
            if (soundManagerRef.current) soundManagerRef.current.playBgm("fight");
          }
        }
        return;
      }

      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        setGameState("paused");
        if (soundManagerRef.current) soundManagerRef.current.stopBgm();
        e.preventDefault();
        return;
      }

      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      keysPressed.current = {};
    };
  }, []);

  // Main Playing Game loop effect
  useEffect(() => {
    if (gameState !== "playing" || !isAssetsLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let isRunning = true;

    // Reset game logic variables
    const bgList = [
      "/images/games/little-pilot/bg1.png",
      "/images/games/little-pilot/bg2.png",
      "/images/games/little-pilot/bg3.png",
    ];
    selectedBgRef.current = bgList[Math.floor(Math.random() * bgList.length)];
    bgScrollRef.current = 0;
    bulletsRef.current = [];
    enemiesRef.current = [];
    explosionsRef.current = [];
    lastBulletTimeRef.current = 0;
    nextEnemyTimeRef.current = Date.now() + 1000;

    playerRef.current = {
      x: 50,
      y: 350,
      width: 120,
      height: 75,
      angle: 0,
      frame: 0,
      frameCounter: 0,
      invulnerable: false,
      invulnerabilityStart: 0,
      lives: 3,
      score: 0,
    };

    setLives(3);
    setScore(0);

    if (soundManagerRef.current) {
      soundManagerRef.current.playBgm("fight");
    }

    const gameWidth = 1200;
    const gameHeight = 800;
    const paddingX = 50;
    const paddingY = 50;
    const bulletCooldown = 300;

    const updateGame = () => {
      const now = Date.now();
      const p = playerRef.current;

      // Invulnerability tick
      if (p.invulnerable && now - p.invulnerabilityStart > 1000) {
        p.invulnerable = false;
      }

      // Keyboard Controls
      let movingUp = keysPressed.current["arrowup"] || keysPressed.current["w"];
      let movingDown = keysPressed.current["arrowdown"] || keysPressed.current["s"];
      let movingLeft = keysPressed.current["arrowleft"] || keysPressed.current["a"];
      let movingRight = keysPressed.current["arrowright"] || keysPressed.current["d"];

      // Speed variable
      const pSpeed = 6;

      if (movingUp) {
        p.y -= pSpeed;
        p.angle = 15;
      } else if (movingDown) {
        p.y += pSpeed;
        p.angle = -15;
      } else {
        p.angle = 0;
      }

      if (movingLeft) {
        p.x -= pSpeed;
        if (p.angle === 0) p.angle = 10;
      }
      if (movingRight) {
        p.x += pSpeed;
        if (p.angle === 0) p.angle = -10;
      }

      // Touch / Drag controls
      if (touchState.current.active) {
        const targetX = touchState.current.x - p.width / 2;
        const targetY = touchState.current.y - p.height / 2;

        const diffX = targetX - p.x;
        const diffY = targetY - p.y;

        // Smooth move player towards touch
        p.x += diffX * 0.15;
        p.y += diffY * 0.15;

        // Apply visual tilt based on movement direction
        if (Math.abs(diffY) > 5) {
          p.angle = diffY > 0 ? -12 : 12;
        } else {
          p.angle = 0;
        }

        // Auto fire bullet on drag
        if (now - lastBulletTimeRef.current > bulletCooldown) {
          const bX = p.x + p.width;
          const bY = p.y + p.height / 2;
          bulletsRef.current.push({
            x: bX,
            y: bY - 25, // offset bullet center
            width: 50,
            height: 50,
          });
          lastBulletTimeRef.current = now;
          if (soundManagerRef.current) {
            soundManagerRef.current.playSound("laser");
          }
        }
      }

      // Bound player position inside screen padding
      if (p.x < paddingX) p.x = paddingX;
      if (p.x > gameWidth - p.width - paddingX) p.x = gameWidth - p.width - paddingX;
      if (p.y < paddingY) p.y = paddingY;
      if (p.y > gameHeight - p.height - paddingY) p.y = gameHeight - p.height - paddingY;

      // Animate player
      p.frameCounter++;
      if (p.frameCounter >= 10) {
        p.frame = p.frame === 0 ? 1 : 0;
        p.frameCounter = 0;
      }

      // Spacebar Fire
      if (keysPressed.current[" "] && now - lastBulletTimeRef.current > bulletCooldown) {
        const bX = p.x + p.width;
        const bY = p.y + p.height / 2;
        bulletsRef.current.push({
          x: bX,
          y: bY - 25, // center bullet
          width: 50,
          height: 50,
        });
        lastBulletTimeRef.current = now;
        if (soundManagerRef.current) {
          soundManagerRef.current.playSound("laser");
        }
      }

      // Scroll Background
      bgScrollRef.current += 1.5;
      if (bgScrollRef.current >= gameWidth) {
        bgScrollRef.current = 0;
      }

      // Move and check bullet boundaries
      bulletsRef.current.forEach((b) => {
        b.x += 10; // bullet speed
      });
      bulletsRef.current = bulletsRef.current.filter((b) => b.x < gameWidth);

      // Enemy Spawner
      if (now > nextEnemyTimeRef.current) {
        // Resolve speed based on score (matching Python game)
        let eSpeed = 3;
        if (p.score > 5 && p.score <= 10) eSpeed = 3.5;
        else if (p.score > 10 && p.score <= 15) eSpeed = 4;
        else if (p.score > 15 && p.score <= 30) eSpeed = 4.5;
        else if (p.score > 30) eSpeed = 5;

        // Choose random color
        const colors: ("blue" | "brown" | "green" | "red")[] = ["blue", "brown", "green", "red"];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Choose random height
        const eY = Math.floor(Math.random() * (gameHeight - paddingY * 3)) + paddingY;

        enemiesRef.current.push({
          x: gameWidth,
          y: eY,
          width: 50,
          height: 50,
          color,
          frame: 0,
          frameCounter: 0,
          speed: eSpeed,
        });

        // Set next enemy spawn time (matching Python difficulty levels)
        let minDelay = 250;
        let maxDelay = 2500;
        if (p.score <= 5) {
          maxDelay = 2500;
        } else if (p.score <= 10) {
          maxDelay = 2000;
        } else if (p.score <= 15) {
          maxDelay = 1500;
        } else if (p.score <= 30) {
          maxDelay = 1000;
        } else if (p.score <= 35) {
          maxDelay = 500;
        } else {
          maxDelay = 250;
        }
        const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
        nextEnemyTimeRef.current = now + delay;
      }

      // Update Enemies
      enemiesRef.current.forEach((e) => {
        e.x -= e.speed;
        e.frameCounter++;
        if (e.frameCounter >= 10) {
          e.frame = e.frame === 0 ? 1 : 0;
          e.frameCounter = 0;
        }
      });

      // Bullet - Enemy Collision
      bulletsRef.current.forEach((b) => {
        enemiesRef.current.forEach((e, eIndex) => {
          // AABB Collision
          if (
            b.x < e.x + e.width &&
            b.x + b.width > e.x &&
            b.y < e.y + e.height &&
            b.y + b.height > e.y
          ) {
            // Register score & create explosion
            p.score += 1;
            setScore(p.score);

            explosionsRef.current.push({
              x: e.x,
              y: e.y,
              frame: 0,
              timer: now,
            });

            // Mark enemy and bullet for removal
            e.x = -9999;
            b.x = 9999;

            if (soundManagerRef.current) {
              soundManagerRef.current.playSound("hit");
            }
          }
        });
      });

      // Filter out destroyed elements
      enemiesRef.current = enemiesRef.current.filter((e) => e.x > -100);
      bulletsRef.current = bulletsRef.current.filter((b) => b.x < gameWidth);

      // Player - Enemy Collision
      if (!p.invulnerable) {
        enemiesRef.current.forEach((e) => {
          if (
            p.x < e.x + e.width &&
            p.x + p.width - 20 > e.x && // slightly shrink boundary box for fairer play
            p.y + 10 < e.y + e.height &&
            p.y + p.height - 10 > e.y
          ) {
            // Hit logic
            p.lives -= 1;
            setLives(p.lives);
            p.invulnerable = true;
            p.invulnerabilityStart = now;

            explosionsRef.current.push({
              x: e.x,
              y: e.y,
              frame: 0,
              timer: now,
            });

            e.x = -9999; // destroy enemy

            if (soundManagerRef.current) {
              soundManagerRef.current.playSound("hit");
            }

            // Check gameover
            if (p.lives <= 0) {
              isRunning = false;
              if (soundManagerRef.current) {
                soundManagerRef.current.stopBgm();
                soundManagerRef.current.playSound("gameover");
              }
              setGameState("gameover");
            }
          }
        });
      }

      // Filter dead enemies
      enemiesRef.current = enemiesRef.current.filter((e) => e.x > -100);

      // Update Explosions (frame switches every 60ms)
      explosionsRef.current.forEach((exp) => {
        if (now - exp.timer > 60) {
          exp.frame += 1;
          exp.timer = now;
        }
      });
      // Filter complete explosions (7 frames: 0 to 6)
      explosionsRef.current = explosionsRef.current.filter((exp) => exp.frame < 7);

      // Heart Hud animation
      heartFrameRef.current.counter++;
      if (heartFrameRef.current.counter >= 12) {
        heartFrameRef.current.index = (heartFrameRef.current.index + 1) % 4;
        heartFrameRef.current.counter = 0;
      }
    };

    const drawGame = () => {
      ctx.clearRect(0, 0, gameWidth, gameHeight);

      // 1. Draw Background
      const bgImg = assetsRef.current[selectedBgRef.current];
      if (bgImg) {
        ctx.drawImage(bgImg, -bgScrollRef.current, 0, gameWidth, gameHeight);
        ctx.drawImage(bgImg, gameWidth - bgScrollRef.current, 0, gameWidth, gameHeight);
      }

      // 2. Draw Bullets
      const bulletImg = assetsRef.current["/images/games/little-pilot/bullet.png"];
      bulletsRef.current.forEach((b) => {
        if (bulletImg) {
          ctx.drawImage(bulletImg, b.x, b.y, b.width, b.height);
        } else {
          // Fallback shape
          ctx.fillStyle = "#ffaa00";
          ctx.beginPath();
          ctx.arc(b.x + 25, b.y + 25, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Draw Enemies
      enemiesRef.current.forEach((e) => {
        const enemyKey = `/images/games/little-pilot/enemy/${e.color}${e.frame}.png`;
        const enemyImg = assetsRef.current[enemyKey];
        if (enemyImg) {
          // Flip enemy image so they face left (pygame flip)
          ctx.save();
          ctx.translate(e.x + e.width / 2, e.y + e.height / 2);
          ctx.scale(-1, 1);
          ctx.drawImage(enemyImg, -e.width / 2, -e.height / 2, e.width, e.height);
          ctx.restore();
        } else {
          // Fallback rect
          ctx.fillStyle = e.color;
          ctx.fillRect(e.x, e.y, e.width, e.height);
        }
      });

      // 4. Draw Explosions
      explosionsRef.current.forEach((exp) => {
        const expKey = `/images/games/little-pilot/explosion/Explosion${exp.frame}.png`;
        const expImg = assetsRef.current[expKey];
        if (expImg) {
          ctx.drawImage(expImg, exp.x - 20, exp.y - 20, 90, 90);
        }
      });

      // 5. Draw Player
      const p = playerRef.current;
      let drawPlayer = true;

      // Flash logic if invulnerable
      if (p.invulnerable) {
        const elapsed = Date.now() - p.invulnerabilityStart;
        if (Math.floor(elapsed / 150) % 2 === 0) {
          drawPlayer = false; // periodically don't draw
        }
      }

      if (drawPlayer) {
        const playerKey = `/images/games/little-pilot/player/fly${p.frame}.png`;
        const playerImg = assetsRef.current[playerKey];

        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        if (p.angle !== 0) {
          ctx.rotate((p.angle * Math.PI) / 180);
        }

        if (playerImg) {
          ctx.drawImage(playerImg, -p.width / 2, -p.height / 2, p.width, p.height);
        } else {
          // Fallback player
          ctx.fillStyle = "#dba111";
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }
        ctx.restore();
      }

      // 6. Draw HUD (drawn directly on canvas matching Python game)
      // Hearts (Animated)
      const heartKey = `/images/games/little-pilot/hearts/heart${heartFrameRef.current.index}.png`;
      const heartImg = assetsRef.current[heartKey];
      for (let i = 0; i < p.lives; i++) {
        if (heartImg) {
          ctx.drawImage(heartImg, 20 + i * 45, 20, 35, 35);
        } else {
          // Fallback heart symbol
          ctx.fillStyle = "#ff0000";
          ctx.font = "24px Arial";
          ctx.fillText("♥", 20 + i * 35, 45);
        }
      }

      // Score (centered to avoid header button overlap)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px 'Press Start 2P', Courier, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`SCORE: ${p.score}`, gameWidth / 2, 45);
    };

    // Render loop function
    const loop = () => {
      if (!isRunning) return;
      updateGame();
      drawGame();
      animId = requestAnimationFrame(loop);
    };

    // Run loop
    animId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [gameState, isAssetsLoaded]);

  // Handle Play Click
  const handlePlayGame = () => {
    setGameState("playing");
    if (soundManagerRef.current) {
      soundManagerRef.current.stopBgm();
      soundManagerRef.current.playBgm("fight");
    }
  };

  // Handle Pause Toggle
  const handlePauseToggle = () => {
    if (gameStateRef.current === "playing") {
      setGameState("paused");
      if (soundManagerRef.current) {
        soundManagerRef.current.stopBgm();
      }
    } else if (gameStateRef.current === "paused") {
      setGameState("playing");
      if (soundManagerRef.current) {
        soundManagerRef.current.playBgm("fight");
      }
    }
  };

  // Handle Restart
  const handleRestartGame = () => {
    // Reset game logic variables
    const bgList = [
      "/images/games/little-pilot/bg1.png",
      "/images/games/little-pilot/bg2.png",
      "/images/games/little-pilot/bg3.png",
    ];
    selectedBgRef.current = bgList[Math.floor(Math.random() * bgList.length)];
    bgScrollRef.current = 0;
    bulletsRef.current = [];
    enemiesRef.current = [];
    explosionsRef.current = [];
    lastBulletTimeRef.current = 0;
    nextEnemyTimeRef.current = Date.now() + 1000;

    playerRef.current = {
      x: 50,
      y: 350,
      width: 120,
      height: 75,
      angle: 0,
      frame: 0,
      frameCounter: 0,
      invulnerable: false,
      invulnerabilityStart: 0,
      lives: 3,
      score: 0,
    };

    setLives(3);
    setScore(0);
    setGameState("playing");

    if (soundManagerRef.current) {
      soundManagerRef.current.stopBgm();
      soundManagerRef.current.playBgm("fight");
    }
  };

  // Virtual controller callbacks for mobile layout
  const triggerMobileMove = (direction: "up" | "down" | "left" | "right") => {
    const p = playerRef.current;
    if (direction === "up" && p.y > 60) p.y -= 30;
    if (direction === "down" && p.y < 800 - p.height - 60) p.y += 30;
    if (direction === "left" && p.x > 60) p.x -= 30;
    if (direction === "right" && p.x < 1200 - p.width - 60) p.x += 30;
  };

  const handleMobileFire = () => {
    const p = playerRef.current;
    const now = Date.now();
    if (now - lastBulletTimeRef.current > 150) {
      // faster manual fire for button clicks
      bulletsRef.current.push({
        x: p.x + p.width,
        y: p.y + p.height / 2 - 25,
        width: 50,
        height: 50,
      });
      lastBulletTimeRef.current = now;
      if (soundManagerRef.current) {
        soundManagerRef.current.playSound("laser");
      }
    }
  };

  const setVirtualKey = (key: string, isPressed: boolean) => {
    keysPressed.current[key.toLowerCase()] = isPressed;
  };

  return (
    <div className="little-pilot-body-wrapper">
      <div className="game-container">
        
        {/* Arcade Cabinet Screen */}
        <div className="arcade-cabinet">
          <div className="screen-wrapper">
            
            {/* ABSOLUTE CONTROL BUTTONS HEADER */}
            <div className="header-actions">
              {(gameState === "playing" || gameState === "paused") && (
                <button className="action-btn restart-btn" onClick={handleRestartGame}>
                  ↻ RESTART
                </button>
              )}
              {gameState === "playing" && (
                <button className="action-btn pause-btn" onClick={handlePauseToggle}>
                  ⏸ PAUSE
                </button>
              )}
              {gameState === "paused" && (
                <button className="action-btn pause-btn" onClick={handlePauseToggle}>
                  ▶ RESUME
                </button>
              )}
              <button
                className="action-btn sound-btn"
                onClick={() => setMuted(!muted)}
              >
                {muted ? "🔇 MUTE" : "🔊 SOUND"}
              </button>
            </div>

            {/* Menu Overlay */}
            {gameState === "menu" && (
              <div className="menu-overlay">
                <h1 className="menu-title">LITTLE PILOT</h1>
                
                <div className="menu-instructions">
                  <h3>🎮 HOW TO PLAY (วิธีเล่น)</h3>
                  <p>⌨️ DESKTOP: Use Arrow Keys or WASD to Move. Press SPACEBAR to Shoot.</p>
                  <p>📱 MOBILE/TABLET: Tap and drag plane to Move & Fire automatically, or use virtual buttons below.</p>
                </div>

                {!isAssetsLoaded ? (
                  <p className="font-mono text-cyan-400 animate-pulse">
                    {errorMessage ? errorMessage : "LOADING GAME ASSETS..."}
                  </p>
                ) : (
                  <button className="play-btn" onClick={handlePlayGame}>
                    PLAY GAME
                  </button>
                )}
              </div>
            )}

            {/* Pause Overlay */}
            {gameState === "paused" && (
              <div className="menu-overlay">
                <h1 className="menu-title" style={{ color: "#4a8ee6" }}>PAUSED</h1>
                <p className="font-mono text-xs mb-8" style={{ color: "#c5d3e8" }}>
                  Press button below to resume playing
                </p>
                
                <button className="play-btn" onClick={handlePauseToggle}>
                  RESUME
                </button>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState === "gameover" && (
              <div className="menu-overlay">
                <h1 className="menu-title" style={{ color: "#ff0000" }}>GAME OVER</h1>
                <p className="font-mono text-xl mb-6">FINAL SCORE: {score}</p>
                
                <div className="flex gap-4">
                  <button className="play-btn" onClick={handleRestartGame}>
                    RESTART
                  </button>
                  <Link href="/arcade" className="play-btn" style={{ background: "#282a46", borderColor: "#4a8ee6" }}>
                    LOBBY
                  </Link>
                </div>
              </div>
            )}

            {/* Game Canvas */}
            <div className="crt-curve">
              <canvas
                ref={canvasRef}
                width={1200}
                height={800}
                className="game-canvas"
                onTouchStart={(e) => {
                  if (gameState !== "playing") return;
                  touchState.current.active = true;
                  const touch = e.touches[0];
                  if (canvasRef.current) {
                    const coords = {
                      clientX: touch.clientX,
                      clientY: touch.clientY,
                    };
                    const rect = canvasRef.current.getBoundingClientRect();
                    touchState.current.x = ((coords.clientX - rect.left) / rect.width) * 1200;
                    touchState.current.y = ((coords.clientY - rect.top) / rect.height) * 800;
                  }
                }}
                onTouchMove={(e) => {
                  if (gameState !== "playing") return;
                  const touch = e.touches[0];
                  if (canvasRef.current) {
                    const rect = canvasRef.current.getBoundingClientRect();
                    touchState.current.x = ((touch.clientX - rect.left) / rect.width) * 1200;
                    touchState.current.y = ((touch.clientY - rect.top) / rect.height) * 800;
                  }
                }}
                onTouchEnd={() => {
                  touchState.current.active = false;
                }}
                onMouseDown={(e) => {
                  if (gameState !== "playing") return;
                  touchState.current.active = true;
                  if (canvasRef.current) {
                    const rect = canvasRef.current.getBoundingClientRect();
                    touchState.current.x = ((e.clientX - rect.left) / rect.width) * 1200;
                    touchState.current.y = ((e.clientY - rect.top) / rect.height) * 800;
                  }
                }}
                onMouseMove={(e) => {
                  if (gameState !== "playing" || !touchState.current.active) return;
                  if (canvasRef.current) {
                    const rect = canvasRef.current.getBoundingClientRect();
                    touchState.current.x = ((e.clientX - rect.left) / rect.width) * 1200;
                    touchState.current.y = ((e.clientY - rect.top) / rect.height) * 800;
                  }
                }}
                onMouseUp={() => {
                  touchState.current.active = false;
                }}
                onMouseLeave={() => {
                  touchState.current.active = false;
                }}
              />
            </div>
            
          </div>
        </div>

        {/* Mobile Virtual Controller Controls (displayed only on mobile viewports) */}
        {gameState === "playing" && (
          <div className="mobile-controls">
            <div className="joystick-pad">
              <button
                className="joy-btn joy-up select-none touch-none"
                onTouchStart={(e) => { e.preventDefault(); setVirtualKey("w", true); }}
                onTouchEnd={(e) => { e.preventDefault(); setVirtualKey("w", false); }}
                onMouseDown={() => setVirtualKey("w", true)}
                onMouseUp={() => setVirtualKey("w", false)}
                onMouseLeave={() => setVirtualKey("w", false)}
              >
                ▲
              </button>
              <button
                className="joy-btn joy-left select-none touch-none"
                onTouchStart={(e) => { e.preventDefault(); setVirtualKey("a", true); }}
                onTouchEnd={(e) => { e.preventDefault(); setVirtualKey("a", false); }}
                onMouseDown={() => setVirtualKey("a", true)}
                onMouseUp={() => setVirtualKey("a", false)}
                onMouseLeave={() => setVirtualKey("a", false)}
              >
                ◀
              </button>
              <button
                className="joy-btn joy-right select-none touch-none"
                onTouchStart={(e) => { e.preventDefault(); setVirtualKey("d", true); }}
                onTouchEnd={(e) => { e.preventDefault(); setVirtualKey("d", false); }}
                onMouseDown={() => setVirtualKey("d", true)}
                onMouseUp={() => setVirtualKey("d", false)}
                onMouseLeave={() => setVirtualKey("d", false)}
              >
                ▶
              </button>
              <button
                className="joy-btn joy-down select-none touch-none"
                onTouchStart={(e) => { e.preventDefault(); setVirtualKey("s", true); }}
                onTouchEnd={(e) => { e.preventDefault(); setVirtualKey("s", false); }}
                onMouseDown={() => setVirtualKey("s", true)}
                onMouseUp={() => setVirtualKey("s", false)}
                onMouseLeave={() => setVirtualKey("s", false)}
              >
                ▼
              </button>
            </div>
            
            <div className="action-pad">
              <button
                className="fire-btn select-none touch-none"
                onTouchStart={(e) => { e.preventDefault(); setVirtualKey(" ", true); }}
                onTouchEnd={(e) => { e.preventDefault(); setVirtualKey(" ", false); }}
                onMouseDown={() => setVirtualKey(" ", true)}
                onMouseUp={() => setVirtualKey(" ", false)}
                onMouseLeave={() => setVirtualKey(" ", false)}
              >
                FIRE
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
