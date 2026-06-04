"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./tetris.css";

// --- Constants & Types ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32;

// Tetromino matrices (0-indexed, 1-7 represents types)
const SHAPES = [
  [], // Index 0 empty
  // 1: I
  [[0, 0, 0, 0],
   [1, 1, 1, 1],
   [0, 0, 0, 0],
   [0, 0, 0, 0]],
  // 2: O
  [[2, 2],
   [2, 2]],
  // 3: T
  [[0, 3, 0],
   [3, 3, 3],
   [0, 0, 0]],
  // 4: S
  [[0, 4, 4],
   [4, 4, 0],
   [0, 0, 0]],
  // 5: Z
  [[5, 5, 0],
   [0, 5, 5],
   [0, 0, 0]],
  // 6: J
  [[6, 0, 0],
   [6, 6, 6],
   [0, 0, 0]],
  // 7: L
  [[0, 0, 7],
   [7, 7, 7],
   [0, 0, 0]]
];

const COLORS = [
  "transparent",
  "#00f0f0", // 1: I (Cyan)
  "#f0f000", // 2: O (Yellow)
  "#a000f0", // 3: T (Purple)
  "#00f000", // 4: S (Green)
  "#f00000", // 5: Z (Red)
  "#0000f0", // 6: J (Blue)
  "#f0a000"  // 7: L (Orange)
];

const LIGHT_COLORS = [
  "transparent",
  "#80f8f8",
  "#ffff80",
  "#d880ff",
  "#80ff80",
  "#ff8080",
  "#8080ff",
  "#ffc080"
];

// Synth Music Notes (Korobeiniki - Tetris Theme A)
const PITCHES: Record<string, number> = {
  E4: 329.63, F4: 349.23, "F#4": 369.99, G4: 392.00, "G#4": 415.30, A4: 440.00, "A#4": 466.16, B4: 493.88,
  C5: 523.25, "C#5": 554.37, D5: 587.33, "D#5": 622.25, E5: 659.25, F5: 698.46, "F#5": 739.99, G5: 783.99,
  A5: 880.00
};

const MELODY = [
  { note: "E5", dur: 2 }, { note: "B4", dur: 1 }, { note: "C5", dur: 1 }, { note: "D5", dur: 2 }, { note: "C5", dur: 1 }, { note: "B4", dur: 1 },
  { note: "A4", dur: 2 }, { note: "A4", dur: 1 }, { note: "C5", dur: 1 }, { note: "E5", dur: 2 }, { note: "D5", dur: 1 }, { note: "C5", dur: 1 },
  { note: "B4", dur: 3 }, { note: "C5", dur: 1 }, { note: "D5", dur: 2 }, { note: "E5", dur: 2 }, { note: "C5", dur: 2 }, { note: "A4", dur: 2 }, { note: "A4", dur: 2 },
  { note: "rest", dur: 1 },
  { note: "D5", dur: 3 }, { note: "F5", dur: 1 }, { note: "A5", dur: 2 }, { note: "G5", dur: 1 }, { note: "F5", dur: 1 },
  { note: "E5", dur: 3 }, { note: "C5", dur: 1 }, { note: "E5", dur: 2 }, { note: "D5", dur: 1 }, { note: "C5", dur: 1 },
  { note: "B4", dur: 2 }, { note: "B4", dur: 1 }, { note: "C5", dur: 1 }, { note: "D5", dur: 2 }, { note: "E5", dur: 2 }, { note: "C5", dur: 2 }, { note: "A4", dur: 2 }, { note: "A4", dur: 2 }
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

// --- Synthesizer Sound Engine Class ---
class SynthEngine {
  private ctx: AudioContext | null = null;
  private mute: boolean = false;
  private bgmTimeout: any = null;
  private melodyIndex: number = 0;
  private isBgmPlaying: boolean = false;
  private currentOsc: OscillatorNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
    this.mute = mute;
    if (mute) {
      this.stopBgm();
    }
  }

  playMove() {
    this.initContext();
    if (this.mute || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playRotate() {
    this.initContext();
    if (this.mute || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playDrop() {
    this.initContext();
    if (this.mute || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playLineClear() {
    this.initContext();
    if (this.mute || !this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 arpeggio
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.06, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.08);
    });
  }

  playTetris() {
    this.initContext();
    if (this.mute || !this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.50]; // Triumphant C major chord
    chords.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  playGameOver() {
    this.initContext();
    if (this.mute || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }

  startBgm() {
    this.initContext();
    if (this.mute || this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.melodyIndex = 0;
    this.playNextBgmNote();
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimeout) {
      clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
    if (this.currentOsc) {
      try {
        this.currentOsc.stop();
      } catch (e) {}
      this.currentOsc = null;
    }
  }

  private playNextBgmNote() {
    if (!this.isBgmPlaying || this.mute) return;
    this.initContext();
    if (!this.ctx) return;

    const noteInfo = MELODY[this.melodyIndex];
    const duration = noteInfo.dur * 140; // 140ms per step

    if (noteInfo.note !== "rest") {
      const freq = PITCHES[noteInfo.note];
      if (freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.003, this.ctx.currentTime + duration / 1000 - 0.01);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration / 1000 - 0.01);
        this.currentOsc = osc;
      }
    }

    this.melodyIndex = (this.melodyIndex + 1) % MELODY.length;
    this.bgmTimeout = setTimeout(() => {
      this.playNextBgmNote();
    }, duration);
  }
}

// --- Tetris Game Component ---
export default function RetroTetris() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "paused" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const holdCanvasRef = useRef<HTMLCanvasElement>(null);
  const soundEngineRef = useRef<SynthEngine | null>(null);

  // Core Game mutable states
  const gridRef = useRef<number[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const currentPieceRef = useRef({
    matrix: [] as number[][],
    x: 0,
    y: 0,
    type: 0
  });
  const bagRef = useRef<number[]>([]);
  const nextPieceTypeRef = useRef<number>(0);
  const holdPieceTypeRef = useRef<number>(0);
  const hasHeldRef = useRef<boolean>(false);

  // Time & Animation variables
  const lastDropTimeRef = useRef<number>(0);
  const lockStartedRef = useRef<number | null>(null);
  const lockDelayMs = 500;
  const particlesRef = useRef<Particle[]>([]);
  const clearingLinesRef = useRef<{ row: number; flashTimer: number }[]>([]);

  // Reference for game loop tick synchronization
  const stateRef = useRef({ gameState, level, score, lines });
  stateRef.current = { gameState, level, score, lines };

  // Init Sound Engine and High Score
  useEffect(() => {
    soundEngineRef.current = new SynthEngine();
    
    if (typeof window !== "undefined") {
      const storedHighScore = localStorage.getItem("narawit-tetris-highscore");
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    }

    return () => {
      if (soundEngineRef.current) {
        soundEngineRef.current.stopBgm();
      }
    };
  }, []);

  // Sync mute state
  useEffect(() => {
    if (soundEngineRef.current) {
      soundEngineRef.current.setMute(muted);
      if (!muted && gameState === "playing") {
        soundEngineRef.current.startBgm();
      }
    }
  }, [muted, gameState]);

  // Bag Randomizer
  const getNextFromBag = (): number => {
    if (bagRef.current.length === 0) {
      const pieces = [1, 2, 3, 4, 5, 6, 7];
      // Shuffle pieces
      for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
      }
      bagRef.current = pieces;
    }
    return bagRef.current.pop() || 1;
  };

  // Check collision
  const checkCollision = (
    matrix: number[][],
    offsetX: number,
    offsetY: number,
    grid: number[][]
  ): boolean => {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const newX = offsetX + c;
          const newY = offsetY + r;

          // Check boundaries
          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }

          // Check block collision (ignore negative rows as they are spawn zones)
          if (newY >= 0 && grid[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Get spawn coordinates based on tetromino shape
  const spawnPiece = (type: number) => {
    const matrix = SHAPES[type];
    const x = Math.floor((COLS - matrix[0].length) / 2);
    const y = type === 1 ? -1 : 0; // adjustments for I piece

    currentPieceRef.current = {
      matrix,
      x,
      y,
      type
    };

    // Check immediate spawn block -> game over
    if (checkCollision(matrix, x, y, gridRef.current)) {
      handleGameOver();
    }
  };

  const handleGameOver = () => {
    setGameState("gameover");
    if (soundEngineRef.current) {
      soundEngineRef.current.stopBgm();
      soundEngineRef.current.playGameOver();
    }

    if (stateRef.current.score > highScore) {
      setHighScore(stateRef.current.score);
      localStorage.setItem("narawit-tetris-highscore", stateRef.current.score.toString());
    }
  };

  // Action methods
  const moveLeft = () => {
    const p = currentPieceRef.current;
    if (!checkCollision(p.matrix, p.x - 1, p.y, gridRef.current)) {
      p.x -= 1;
      lockStartedRef.current = null; // reset lock delay
      if (soundEngineRef.current) soundEngineRef.current.playMove();
      return true;
    }
    return false;
  };

  const moveRight = () => {
    const p = currentPieceRef.current;
    if (!checkCollision(p.matrix, p.x + 1, p.y, gridRef.current)) {
      p.x += 1;
      lockStartedRef.current = null; // reset lock delay
      if (soundEngineRef.current) soundEngineRef.current.playMove();
      return true;
    }
    return false;
  };

  // Drop gravity step
  const moveDown = (): boolean => {
    const p = currentPieceRef.current;
    if (!checkCollision(p.matrix, p.x, p.y + 1, gridRef.current)) {
      p.y += 1;
      lastDropTimeRef.current = Date.now();
      lockStartedRef.current = null; // reset lock delay
      return true;
    }
    return false;
  };

  const rotateClockwise = () => {
    const p = currentPieceRef.current;
    const size = p.matrix.length;
    const rotated = Array(size).fill(null).map(() => Array(size).fill(0));

    // Rotate matrix
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        rotated[c][size - 1 - r] = p.matrix[r][c];
      }
    }

    // Wall kick simple check
    const kicks = [0, -1, 1, -2, 2];
    for (let dx of kicks) {
      if (!checkCollision(rotated, p.x + dx, p.y, gridRef.current)) {
        p.matrix = rotated;
        p.x += dx;
        lockStartedRef.current = null;
        if (soundEngineRef.current) soundEngineRef.current.playRotate();
        return;
      }
    }
  };

  const rotateCounterClockwise = () => {
    const p = currentPieceRef.current;
    const size = p.matrix.length;
    const rotated = Array(size).fill(null).map(() => Array(size).fill(0));

    // Rotate matrix counter-clockwise
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        rotated[size - 1 - c][r] = p.matrix[r][c];
      }
    }

    const kicks = [0, -1, 1, -2, 2];
    for (let dx of kicks) {
      if (!checkCollision(rotated, p.x + dx, p.y, gridRef.current)) {
        p.matrix = rotated;
        p.x += dx;
        lockStartedRef.current = null;
        if (soundEngineRef.current) soundEngineRef.current.playRotate();
        return;
      }
    }
  };

  // Hard Drop
  const hardDrop = () => {
    const p = currentPieceRef.current;
    let droppedRows = 0;
    while (!checkCollision(p.matrix, p.x, p.y + 1, gridRef.current)) {
      p.y += 1;
      droppedRows++;
    }
    
    // Add hard drop scores (2 pts per row)
    setScore(prev => prev + (droppedRows * 2));

    if (soundEngineRef.current) soundEngineRef.current.playDrop();
    lockPiece();
  };

  // Soft Drop score tick
  const softDrop = () => {
    if (moveDown()) {
      setScore(prev => prev + 1);
    }
  };

  // Hold piece implementation
  const triggerHold = () => {
    if (hasHeldRef.current) return;

    const currentType = currentPieceRef.current.type;
    const currentHoldType = holdPieceTypeRef.current;

    if (currentHoldType === 0) {
      // First time holding
      holdPieceTypeRef.current = currentType;
      const nextType = nextPieceTypeRef.current;
      nextPieceTypeRef.current = getNextFromBag();
      spawnPiece(nextType);
    } else {
      // Swap held and current
      holdPieceTypeRef.current = currentType;
      spawnPiece(currentHoldType);
    }

    hasHeldRef.current = true;
    lockStartedRef.current = null;
    if (soundEngineRef.current) soundEngineRef.current.playRotate();
  };

  // Lock piece into the board grid
  const lockPiece = () => {
    const p = currentPieceRef.current;
    const grid = gridRef.current;

    for (let r = 0; r < p.matrix.length; r++) {
      for (let c = 0; c < p.matrix[r].length; c++) {
        if (p.matrix[r][c] !== 0) {
          const gridX = p.x + c;
          const gridY = p.y + r;
          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            grid[gridY][gridX] = p.matrix[r][c];
          }
        }
      }
    }

    checkLineClears();

    // Spawn next piece
    const nextType = nextPieceTypeRef.current;
    nextPieceTypeRef.current = getNextFromBag();
    spawnPiece(nextType);
    hasHeldRef.current = false;
    lockStartedRef.current = null;
  };

  // Particle Generation
  const spawnLineParticles = (row: number, color: string) => {
    for (let col = 0; col < COLS; col++) {
      for (let i = 0; i < 4; i++) {
        particlesRef.current.push({
          x: col * BLOCK_SIZE + BLOCK_SIZE / 2,
          y: row * BLOCK_SIZE + BLOCK_SIZE / 2,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.7) * 8,
          size: Math.random() * 4 + 2,
          color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    }
  };

  // Line clear rules
  const checkLineClears = () => {
    const grid = gridRef.current;
    const rowsToClear: number[] = [];

    for (let r = ROWS - 1; r >= 0; r--) {
      let isFull = true;
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === 0) {
          isFull = false;
          break;
        }
      }
      if (isFull) {
        rowsToClear.push(r);
      }
    }

    if (rowsToClear.length > 0) {
      // Trigger visual flash for these lines
      clearingLinesRef.current = rowsToClear.map(row => ({
        row,
        flashTimer: Date.now()
      }));

      // Generate particles
      rowsToClear.forEach(row => {
        const sampleBlock = grid[row][0] || 1;
        const color = COLORS[sampleBlock];
        spawnLineParticles(row, color);
      });

      // Clear sound
      if (soundEngineRef.current) {
        if (rowsToClear.length === 4) {
          soundEngineRef.current.playTetris();
        } else {
          soundEngineRef.current.playLineClear();
        }
      }

      // Schedule removal of the lines after flashing
      setTimeout(() => {
        const nextGrid = gridRef.current.map(row => [...row]);
        
        // Remove rows (descending sort of index to avoid indexing drift)
        rowsToClear.sort((a, b) => a - b).forEach(row => {
          nextGrid.splice(row, 1);
          nextGrid.unshift(Array(COLS).fill(0));
        });

        gridRef.current = nextGrid;
        clearingLinesRef.current = [];

        // Score update
        const lineCount = rowsToClear.length;
        const scoreMultipliers = [0, 100, 300, 500, 800];
        const baseScore = scoreMultipliers[lineCount] || 800;
        const earned = baseScore * stateRef.current.level;

        setLines(prev => prev + lineCount);
        setScore(prev => prev + earned);

        // Level up formula (every 10 lines)
        const nextLevel = Math.floor((stateRef.current.lines + lineCount) / 10) + 1;
        if (nextLevel > stateRef.current.level) {
          setLevel(nextLevel);
        }
      }, 150); // duration of row flash
    }
  };

  // Ghost block y coordinate calculation
  const getGhostY = (): number => {
    const p = currentPieceRef.current;
    let ghostY = p.y;
    while (!checkCollision(p.matrix, p.x, ghostY + 1, gridRef.current)) {
      ghostY++;
    }
    return ghostY;
  };

  // Level speed conversion
  const getDropInterval = (): number => {
    const lvl = stateRef.current.level;
    // Classic speed adjustments
    if (lvl === 1) return 800;
    if (lvl === 2) return 720;
    if (lvl === 3) return 630;
    if (lvl === 4) return 550;
    if (lvl === 5) return 470;
    if (lvl === 6) return 380;
    if (lvl === 7) return 300;
    if (lvl === 8) return 220;
    if (lvl === 9) return 130;
    return 100; // Level 10+ speed run
  };

  // Keyboard control handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.gameState !== "playing") {
        if (e.key === "p" || e.key === "P" || e.key === "Escape") {
          if (stateRef.current.gameState === "paused") {
            setGameState("playing");
            if (soundEngineRef.current) soundEngineRef.current.startBgm();
          }
        }
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          moveLeft();
          e.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          moveRight();
          e.preventDefault();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          softDrop();
          e.preventDefault();
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case "x":
        case "X":
          rotateClockwise();
          e.preventDefault();
          break;
        case "z":
        case "Z":
          rotateCounterClockwise();
          e.preventDefault();
          break;
        case " ":
          hardDrop();
          e.preventDefault();
          break;
        case "Shift":
        case "c":
        case "C":
          triggerHold();
          e.preventDefault();
          break;
        case "p":
        case "P":
        case "Escape":
          setGameState("paused");
          if (soundEngineRef.current) soundEngineRef.current.stopBgm();
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main playing game loop tick
  useEffect(() => {
    if (gameState !== "playing") return;

    let animId: number;
    let isRunning = true;

    const gameLoop = () => {
      if (!isRunning) return;

      const now = Date.now();
      const p = currentPieceRef.current;

      // Check locking delay logic
      const isTouchingBottom = checkCollision(p.matrix, p.x, p.y + 1, gridRef.current);
      if (isTouchingBottom) {
        if (lockStartedRef.current === null) {
          lockStartedRef.current = now;
        } else if (now - lockStartedRef.current > lockDelayMs) {
          lockPiece();
        }
      } else {
        lockStartedRef.current = null;
      }

      // Drop gravity timer
      const interval = getDropInterval();
      if (!isTouchingBottom && now - lastDropTimeRef.current > interval) {
        moveDown();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    // Reset loop timestamps
    lastDropTimeRef.current = Date.now();
    lockStartedRef.current = null;
    animId = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, level]);

  // Main canvas renderer loop effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let isDrawing = true;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background grid matrix lines (CRT matrix style)
      ctx.strokeStyle = "rgba(40, 42, 70, 0.15)";
      ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * BLOCK_SIZE, 0);
        ctx.lineTo(c * BLOCK_SIZE, canvas.height);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * BLOCK_SIZE);
        ctx.lineTo(canvas.width, r * BLOCK_SIZE);
        ctx.stroke();
      }

      // Draw locked board blocks
      const grid = gridRef.current;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c] !== 0) {
            drawBlock(ctx, c, r, grid[r][c]);
          }
        }
      }

      // Draw Ghost Shadow Piece (outline where block will land)
      if (gameState === "playing" || gameState === "paused") {
        const p = currentPieceRef.current;
        const ghostY = getGhostY();
        for (let r = 0; r < p.matrix.length; r++) {
          for (let c = 0; c < p.matrix[r].length; c++) {
            if (p.matrix[r][c] !== 0) {
              drawGhostBlock(ctx, p.x + c, ghostY + r, p.matrix[r][c]);
            }
          }
        }

        // Draw Active Falling Piece
        for (let r = 0; r < p.matrix.length; r++) {
          for (let c = 0; c < p.matrix[r].length; c++) {
            if (p.matrix[r][c] !== 0) {
              drawBlock(ctx, p.x + c, p.y + r, p.matrix[r][c]);
            }
          }
        }
      }

      // Draw line clear flashes
      clearingLinesRef.current.forEach(fl => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillRect(0, fl.row * BLOCK_SIZE, canvas.width, BLOCK_SIZE);
      });

      // Update and draw particles
      updateAndDrawParticles(ctx);
    };

    const renderLoop = () => {
      if (!isDrawing) return;
      drawGrid();
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isDrawing = false;
      cancelAnimationFrame(animId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Secondary canvas previews effect (Next & Hold boxes)
  useEffect(() => {
    // Redraw Next box
    const nextCanvas = nextCanvasRef.current;
    if (nextCanvas) {
      const ctx = nextCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (nextPieceTypeRef.current > 0) {
          drawMiniPiece(ctx, nextPieceTypeRef.current, nextCanvas.width, nextCanvas.height);
        }
      }
    }

    // Redraw Hold box
    const holdCanvas = holdCanvasRef.current;
    if (holdCanvas) {
      const ctx = holdCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
        if (holdPieceTypeRef.current > 0) {
          drawMiniPiece(ctx, holdPieceTypeRef.current, holdCanvas.width, holdCanvas.height);
        }
      }
    }
  }, [gameState, nextPieceTypeRef.current, holdPieceTypeRef.current]);

  // Block Draw Helpers
  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, type: number) => {
    if (y < 0) return; // don't draw above spawning field
    const px = x * BLOCK_SIZE;
    const py = y * BLOCK_SIZE;

    // Glowing retro blocks
    const baseColor = COLORS[type];
    const lightColor = LIGHT_COLORS[type];

    // Inner bevel gradient
    const grad = ctx.createLinearGradient(px, py, px + BLOCK_SIZE, py + BLOCK_SIZE);
    grad.addColorStop(0, lightColor);
    grad.addColorStop(1, baseColor);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(px + 1.5, py + 1.5, BLOCK_SIZE - 3, BLOCK_SIZE - 3, 4);
    ctx.fill();

    // High gloss inner highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  const drawGhostBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, type: number) => {
    if (y < 0) return;
    const px = x * BLOCK_SIZE;
    const py = y * BLOCK_SIZE;
    const baseColor = COLORS[type];

    // Translucent outline ghost piece
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    
    ctx.beginPath();
    ctx.roundRect(px + 3, py + 3, BLOCK_SIZE - 6, BLOCK_SIZE - 6, 4);
    ctx.fill();
    ctx.stroke();
  };

  // Mini canvas drawing inside previews
  const drawMiniPiece = (
    ctx: CanvasRenderingContext2D,
    type: number,
    canvasW: number,
    canvasH: number
  ) => {
    const matrix = SHAPES[type];
    const size = matrix.length;
    const miniBlockSize = 16;

    // Center matrix math
    const startX = (canvasW - matrix[0].length * miniBlockSize) / 2;
    const startY = (canvasH - matrix.length * miniBlockSize) / 2;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c] !== 0) {
          const px = startX + c * miniBlockSize;
          const py = startY + r * miniBlockSize;

          const baseColor = COLORS[type];
          const lightColor = LIGHT_COLORS[type];

          const grad = ctx.createLinearGradient(px, py, px + miniBlockSize, py + miniBlockSize);
          grad.addColorStop(0, lightColor);
          grad.addColorStop(1, baseColor);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(px + 0.8, py + 0.8, miniBlockSize - 1.6, miniBlockSize - 1.6, 2.5);
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  };

  // Particles animator
  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity pull
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  // Launch Game
  const handlePlayGame = () => {
    // Reset state
    gridRef.current = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    bagRef.current = [];
    holdPieceTypeRef.current = 0;
    hasHeldRef.current = false;
    particlesRef.current = [];
    clearingLinesRef.current = [];

    setScore(0);
    setLines(0);
    setLevel(1);
    
    // Spawn initial pieces
    const firstType = getNextFromBag();
    nextPieceTypeRef.current = getNextFromBag();
    spawnPiece(firstType);

    setGameState("playing");

    if (soundEngineRef.current) {
      soundEngineRef.current.stopBgm();
      soundEngineRef.current.startBgm();
    }
  };

  const handlePauseToggle = () => {
    if (gameState === "playing") {
      setGameState("paused");
      if (soundEngineRef.current) soundEngineRef.current.stopBgm();
    } else if (gameState === "paused") {
      setGameState("playing");
      if (soundEngineRef.current) soundEngineRef.current.startBgm();
    }
  };

  return (
    <div className="tetris-body-wrapper">
      <div className="game-container">
        
        {/* CRT Cabinet Box */}
        <div className="arcade-cabinet">
          <div className="screen-wrapper">
            
            {/* ABSOLUTE CONTROL BUTTONS HEADER */}
            <div className="header-actions">
              {(gameState === "playing" || gameState === "paused") && (
                <button className="action-btn restart-btn" onClick={handlePlayGame}>
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

            {/* Arcade Screen content */}
            <div className="crt-curve">
              
              {/* Menu Overlay */}
              {gameState === "menu" && (
                <div className="menu-overlay">
                  <h1 className="menu-title">RETRO TETRIS</h1>
                  <h2 className="menu-subtitle">Press play to launch grid</h2>
                  
                  <button className="play-btn" onClick={handlePlayGame}>
                    PLAY GAME
                  </button>
                </div>
              )}

              {/* Pause Overlay */}
              {gameState === "paused" && (
                <div className="menu-overlay">
                  <h1 className="menu-title" style={{ color: "#00e5ff" }}>PAUSED</h1>
                  <p className="font-mono text-xs mb-8" style={{ color: "#8c93b2" }}>
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
                  {score >= highScore && score > 0 && (
                    <div className="new-highscore">🏆 NEW HIGH SCORE!</div>
                  )}
                  <h1 className="menu-title" style={{ color: "#ff3e3e" }}>GAME OVER</h1>
                  
                  <p className="font-mono text-sm text-cyan-400 mb-2">FINAL SCORE</p>
                  <p className="font-mono text-xl font-bold mb-8">{score}</p>
                  
                  <div className="flex gap-4">
                    <button className="play-btn" onClick={handlePlayGame}>
                      RETRY
                    </button>
                    <Link href="/arcade" className="play-btn" style={{ background: "#1c1d2e", borderColor: "#3b3e5c" }}>
                      EXIT
                    </Link>
                  </div>
                </div>
              )}

              {/* Game Playing Layout Grid */}
              <div className="tetris-layout">
                
                {/* Left Side Panel (Hold container + Instructions) */}
                <div className="side-panel left-panel">
                  <div className="hud-box">
                    <div className="hud-title">HOLD</div>
                    <div className="preview-canvas-wrapper">
                      <canvas
                        ref={holdCanvasRef}
                        width={90}
                        height={90}
                        className="preview-canvas"
                      />
                    </div>
                  </div>

                  <div className="instructions-box">
                    <h4>CONTROLS</h4>
                    <p>⬅/➡ or A/D: Move</p>
                    <p>⬆ or W/X: Rotate CW</p>
                    <p>Z: Rotate CCW</p>
                    <p>⬇ or S: Soft Drop</p>
                    <p>SPACE: Hard Drop</p>
                    <p>SHIFT/C: Hold Piece</p>
                    <p>P/ESC: Pause</p>
                  </div>
                </div>

                {/* Center Canvas playing field */}
                <div className="center-field">
                  <canvas
                    ref={canvasRef}
                    width={COLS * BLOCK_SIZE}
                    height={ROWS * BLOCK_SIZE}
                    className="game-canvas"
                  />
                </div>

                {/* Right Side Panel (Next container + Scores) */}
                <div className="side-panel right-panel">
                  <div className="hud-box">
                    <div className="hud-title">NEXT</div>
                    <div className="preview-canvas-wrapper">
                      <canvas
                        ref={nextCanvasRef}
                        width={90}
                        height={90}
                        className="preview-canvas"
                      />
                    </div>
                  </div>

                  <div className="hud-box">
                    <div className="hud-title">SCORE</div>
                    <div className="hud-value">{score}</div>
                  </div>

                  <div className="hud-box">
                    <div className="hud-title">LEVEL</div>
                    <div className="hud-value">{level}</div>
                  </div>

                  <div className="hud-box">
                    <div className="hud-title">LINES</div>
                    <div className="hud-value">{lines}</div>
                  </div>

                  <div className="hud-box">
                    <div className="hud-title">TOP SCORE</div>
                    <div className="hud-value" style={{ color: "#ff9d00" }}>{highScore}</div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* MOBILE CONTROLS OVERLAY JOYSTICK */}
        <div className="mobile-controls">
          <div className="joystick-pad">
            <button
              className="joy-btn joy-up"
              onTouchStart={rotateClockwise}
            >
              ↻
            </button>
            <button
              className="joy-btn joy-left"
              onTouchStart={moveLeft}
            >
              ◀
            </button>
            <button
              className="joy-btn joy-right"
              onTouchStart={moveRight}
            >
              ▶
            </button>
            <button
              className="joy-btn joy-down"
              onTouchStart={softDrop}
            >
              ▼
            </button>
          </div>

          <div className="action-buttons">
            <button
              className="circ-btn btn-hold"
              onTouchStart={triggerHold}
            >
              HOLD
            </button>
            <button
              className="circ-btn btn-rotate"
              onTouchStart={rotateCounterClockwise}
            >
              ROT
              Z
            </button>
            <button
              className="circ-btn btn-drop"
              onTouchStart={hardDrop}
            >
              DROP
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
