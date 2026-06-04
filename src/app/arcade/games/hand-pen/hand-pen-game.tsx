"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Trash2, 
  Camera as CameraIcon, 
  Download, 
  Eye, 
  EyeOff, 
  Info, 
  ArrowLeft,
  ChevronRight,
  Settings,
  AlertTriangle,
  Activity
} from "lucide-react";
import "./hand-pen.css";

// --- Types & Interfaces ---
interface Point {
  x: number;
  y: number;
}

interface StrokePath {
  points: Point[];
  color: string;
  width: number;
}

// Preset Neon Colors
const BRUSH_COLORS = [
  { name: "Gold", hex: "#F5D061" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Green", hex: "#10B981" },
  { name: "Pink", hex: "#EC4899" },
  { name: "White", hex: "#FFFFFF" }
];

// --- Ramer–Douglas–Peucker point decimation ---
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    const ex = point.x - lineStart.x;
    const ey = point.y - lineStart.y;
    return Math.sqrt(ex * ex + ey * ey);
  }
  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSq));
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;
  const ex = point.x - projX;
  const ey = point.y - projY;
  return Math.sqrt(ex * ex + ey * ey);
}

function rdpSimplify(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > maxDist) {
      maxDist = d;
      maxIndex = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, maxIndex + 1), epsilon);
    const right = rdpSimplify(points.slice(maxIndex), epsilon);
    return left.slice(0, -1).concat(right);
  } else {
    return [points[0], points[end]];
  }
}

// --- Helper: draw a stroke path using quadratic curves for smoothness ---
function drawStrokePath(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    // Use quadratic curves through midpoints for smooth rendering
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    // Connect to the last point
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  ctx.stroke();
  // Reset shadow immediately to avoid bleeding into subsequent draws
  ctx.shadowBlur = 0;
}

// --- Constants ---
const RDP_EPSILON = 1.5; // Tolerance for point decimation
const MAX_POINTS_BEFORE_SIMPLIFY = 500;
const DEAD_ZONE_PX = 1.5; // Ignore micro-movements smaller than this
const CAMERA_WIDTH = 960;
const CAMERA_HEIGHT = 540;

export default function HandPenGame() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  
  // Game control states (for UI rendering only)
  const [selectedColor, setSelectedColor] = useState("#F5D061");
  const [brushSize, setBrushSize] = useState(6);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [drawModeActive, setDrawModeActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showFps, setShowFps] = useState(false);
  const [fps, setFps] = useState(0);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs mirroring state for the render loop (avoids useEffect dep restarts)
  const selectedColorRef = useRef(selectedColor);
  const brushSizeRef = useRef(brushSize);
  const showSkeletonRef = useRef(showSkeleton);
  const drawModeActiveRef = useRef(drawModeActive);
  const showFpsRef = useRef(showFps);

  // Sync state → refs on every change (no effect restart needed)
  useEffect(() => { selectedColorRef.current = selectedColor; }, [selectedColor]);
  useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);
  useEffect(() => { showSkeletonRef.current = showSkeleton; }, [showSkeleton]);
  useEffect(() => { drawModeActiveRef.current = drawModeActive; }, [drawModeActive]);
  useEffect(() => { showFpsRef.current = showFps; }, [showFps]);

  // Refs for tracking drawing states without triggering state re-renders in animation frame
  const drawingPathsRef = useRef<StrokePath[]>([]);
  const currentPathRef = useRef<Point[]>([]);
  const isShiftPressedRef = useRef(false);
  const isDrawingRef = useRef(false);
  const lastXRef = useRef<number | null>(null);
  const lastYRef = useRef<number | null>(null);
  
  // Offscreen canvas buffer for completed strokes
  const offscreenCanvasRef = useRef<OffscreenCanvas | HTMLCanvasElement | null>(null);
  const offscreenDirtyRef = useRef(true);
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  
  // FPS tracking
  const fpsRef = useRef({ frames: 0, lastTime: performance.now(), value: 0 });
  
  const cameraInstanceRef = useRef<any>(null);
  const handsInstanceRef = useRef<any>(null);

  // Helper to load CDN scripts sequentially
  useEffect(() => {
    let active = true;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.crossOrigin = "anonymous";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      });
    };

    const loadAll = async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
        
        if (active) {
          setScriptsLoaded(true);
        }
      } catch (err) {
        console.error("Error loading MediaPipe from CDN:", err);
        if (active) {
          setCameraError("ไม่สามารถดาวน์โหลดระบบวิเคราะห์มือจากเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
        }
      }
    };

    loadAll();

    return () => {
      active = false;
    };
  }, []);

  // Key listeners for Shift and Spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        isShiftPressedRef.current = true;
      }
      if (e.code === "Space") {
        e.preventDefault();
        clearCanvas();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        isShiftPressedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle clear canvas
  const clearCanvas = useCallback(() => {
    drawingPathsRef.current = [];
    currentPathRef.current = [];
    isDrawingRef.current = false;
    lastXRef.current = null;
    lastYRef.current = null;
    offscreenDirtyRef.current = true;
  }, []);

  // Rebuild offscreen buffer with all completed strokes
  const rebuildOffscreen = useCallback((width: number, height: number) => {
    if (!offscreenCanvasRef.current || 
        canvasSizeRef.current.width !== width || 
        canvasSizeRef.current.height !== height) {
      // Create or resize offscreen canvas
      try {
        offscreenCanvasRef.current = new OffscreenCanvas(width, height);
      } catch {
        // Fallback for browsers without OffscreenCanvas
        const fallback = document.createElement("canvas");
        fallback.width = width;
        fallback.height = height;
        offscreenCanvasRef.current = fallback;
      }
      canvasSizeRef.current = { width, height };
    }

    const offCtx = offscreenCanvasRef.current.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    if (!offCtx) return;

    // Clear offscreen buffer
    offCtx.clearRect(0, 0, width, height);

    // Render all completed strokes (excluding the current in-progress stroke which is the last one if drawing)
    const paths = drawingPathsRef.current;
    const endIdx = isDrawingRef.current ? paths.length - 1 : paths.length;

    for (let i = 0; i < endIdx; i++) {
      const path = paths[i];
      if (path.points.length < 2) continue;
      drawStrokePath(offCtx as CanvasRenderingContext2D, path.points, path.color, path.width);
    }

    offscreenDirtyRef.current = false;
  }, []);

  // Canvas ResizeObserver — only resize when the container actually changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dw = Math.round(width);
        const dh = Math.round(height);
        if (canvas.width !== dw || canvas.height !== dh) {
          canvas.width = dw;
          canvas.height = dh;
          offscreenDirtyRef.current = true;
        }
      }
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Main tracking & camera process loop — deps are ONLY scriptsLoaded and cameraEnabled
  useEffect(() => {
    if (!scriptsLoaded || !videoRef.current || !canvasRef.current) return;

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "ไม่สามารถเข้าถึงกล้องได้เนื่องจากการเชื่อมต่อไม่ปลอดภัย (ต้องใช้ HTTPS หรือ localhost)\n\nCamera API is not supported in non-secure contexts (HTTP). Please access via HTTPS or localhost."
      );
      return;
    }

    if (!cameraEnabled) {
      setCameraActive(false);
      setHandDetected(false);
      
      const canvasElement = canvasRef.current;
      const ctx = canvasElement.getContext("2d");
      if (ctx) {
        // Ensure canvas has size
        if (canvasElement.width === 0 || canvasElement.height === 0) {
          canvasElement.width = canvasElement.clientWidth || 640;
          canvasElement.height = canvasElement.clientHeight || 480;
        }
        ctx.fillStyle = "rgba(5, 3, 1, 0.95)";
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        
        // Flip canvas horizontally in code before drawing text to counteract the CSS mirroring
        ctx.save();
        ctx.translate(canvasElement.width, 0);
        ctx.scale(-1, 1);
        
        ctx.fillStyle = "#F5D061";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#F5D061";
        ctx.shadowBlur = 8;
        ctx.fillText("CAMERA DEACTIVATED / ปิดกล้องอยู่", canvasElement.width / 2, canvasElement.height / 2 - 20);
        
        ctx.fillStyle = "rgba(241, 245, 249, 0.6)";
        ctx.shadowBlur = 0;
        ctx.font = "11px monospace";
        ctx.fillText("Click 'Turn On Camera' in settings to start drawing.", canvasElement.width / 2, canvasElement.height / 2 + 10);
        
        ctx.restore();
      }
      return;
    }

    const w = window;
    const Hands = (w as any).Hands;
    const Camera = (w as any).Camera;
    const drawConnectors = (w as any).drawConnectors;
    const drawLandmarks = (w as any).drawLandmarks;
    const HAND_CONNECTIONS = (w as any).HAND_CONNECTIONS;

    if (!Hands || !Camera) {
      setCameraError("ตรวจไม่พบไลบรารี MediaPipe กรุณารีเฟรชหน้าจอนี้อีกครั้ง");
      return;
    }

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    let localHandDetected = false;

    // Handle frame tracking results
    const onResults = (results: any) => {
      // FPS tracking
      const now = performance.now();
      fpsRef.current.frames++;
      if (now - fpsRef.current.lastTime >= 1000) {
        const currentFps = fpsRef.current.frames;
        fpsRef.current.value = currentFps;
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;
        if (showFpsRef.current) {
          setFps(currentFps);
        }
      }

      const cw = canvasElement.width;
      const ch = canvasElement.height;

      // Skip frame if canvas has no size yet
      if (cw === 0 || ch === 0) return;

      // Draw background camera frame with aspect-ratio-preserving cover fit
      const imgW = results.image.width || CAMERA_WIDTH;
      const imgH = results.image.height || CAMERA_HEIGHT;
      const canvasAspect = cw / ch;
      const imgAspect = imgW / imgH;
      let sx = 0, sy = 0, sw = imgW, sh = imgH;
      if (imgAspect > canvasAspect) {
        // Image is wider than canvas — crop sides
        sw = imgH * canvasAspect;
        sx = (imgW - sw) / 2;
      } else {
        // Image is taller than canvas — crop top/bottom
        sh = imgW / canvasAspect;
        sy = (imgH - sh) / 2;
      }
      ctx.drawImage(results.image, sx, sy, sw, sh, 0, 0, cw, ch);

      // Apply a futuristic darkened overlay for neon drawing visibility
      ctx.fillStyle = "rgba(5, 3, 1, 0.83)";
      ctx.fillRect(0, 0, cw, ch);

      // Rebuild offscreen buffer if dirty (strokes changed or canvas resized)
      if (offscreenDirtyRef.current) {
        rebuildOffscreen(cw, ch);
      }

      // Blit completed strokes from offscreen buffer in one operation
      if (offscreenCanvasRef.current) {
        ctx.drawImage(offscreenCanvasRef.current as any, 0, 0);
      }

      // Draw the current in-progress stroke (the last path if we're currently drawing)
      if (isDrawingRef.current && currentPathRef.current.length >= 2) {
        drawStrokePath(ctx, currentPathRef.current, selectedColorRef.current, brushSizeRef.current);
      }

      // Check if hands are in view
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        if (!localHandDetected) {
          localHandDetected = true;
          setHandDetected(true);
        }

        const landmark = results.multiHandLandmarks[0];

        // Read latest settings from refs (no effect restart needed)
        const currentShowSkeleton = showSkeletonRef.current;
        const currentColor = selectedColorRef.current;
        const currentBrushSize = brushSizeRef.current;
        const currentDrawMode = drawModeActiveRef.current;

        // Draw skeleton connections if enabled
        if (currentShowSkeleton && drawConnectors && drawLandmarks) {
          drawConnectors(ctx, landmark, HAND_CONNECTIONS, {
            color: "rgba(245, 208, 97, 0.28)",
            lineWidth: 2,
          });
          drawLandmarks(ctx, landmark, {
            color: "#FFFFFF",
            lineWidth: 1,
            radius: 2,
          });
        }

        // Get index finger tip (landmark index 8)
        const indexTip = landmark[8];
        const rawX = indexTip.x * cw;
        const rawY = indexTip.y * ch;

        // Adaptive 1-Euro filter: fast follow for large moves, slow for small
        let smoothX = rawX;
        let smoothY = rawY;
        if (lastXRef.current !== null && lastYRef.current !== null) {
          const dx = rawX - lastXRef.current;
          const dy = rawY - lastYRef.current;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Dead zone — ignore micro-movements to eliminate hand tremor
          if (dist < DEAD_ZONE_PX) {
            smoothX = lastXRef.current;
            smoothY = lastYRef.current;
          } else {
            // Adaptive alpha: higher for large movements, lower for small
            const alpha = Math.min(0.5, 0.15 + dist * 0.008);
            smoothX = lastXRef.current + dx * alpha;
            smoothY = lastYRef.current + dy * alpha;
          }
        }

        lastXRef.current = smoothX;
        lastYRef.current = smoothY;

        // Draw tracking pointer dot
        ctx.beginPath();
        ctx.arc(smoothX, smoothY, currentBrushSize / 2 + 3, 0, 2 * Math.PI);
        const shouldDraw = isShiftPressedRef.current || currentDrawMode;

        if (shouldDraw) {
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = currentColor;
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = "rgba(245, 208, 97, 0.45)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow after pointer draw

        // Handle drawing path additions
        if (shouldDraw) {
          if (!isDrawingRef.current) {
            isDrawingRef.current = true;
            currentPathRef.current = [];
            drawingPathsRef.current.push({
              points: currentPathRef.current,
              color: currentColor,
              width: currentBrushSize,
            });
          }
          
          currentPathRef.current.push({ x: smoothX, y: smoothY });
        } else {
          if (isDrawingRef.current) {
            isDrawingRef.current = false;
            
            // Simplify completed stroke if it has too many points
            const lastPath = drawingPathsRef.current[drawingPathsRef.current.length - 1];
            if (lastPath && lastPath.points.length > MAX_POINTS_BEFORE_SIMPLIFY) {
              lastPath.points = rdpSimplify(lastPath.points, RDP_EPSILON);
            }

            // Mark offscreen as dirty so it gets rebuilt with the new completed stroke
            offscreenDirtyRef.current = true;
          }
        }
      } else {
        if (localHandDetected) {
          localHandDetected = false;
          setHandDetected(false);
        }
        
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          
          // Simplify completed stroke
          const lastPath = drawingPathsRef.current[drawingPathsRef.current.length - 1];
          if (lastPath && lastPath.points.length > MAX_POINTS_BEFORE_SIMPLIFY) {
            lastPath.points = rdpSimplify(lastPath.points, RDP_EPSILON);
          }

          offscreenDirtyRef.current = true;
        }
        
        lastXRef.current = null;
        lastYRef.current = null;
      }
    };

    // Instantiate hands model with optimized settings
    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,           // Lite model — ~2× faster inference
      minDetectionConfidence: 0.6,   // Raised from 0.52 to reduce false positives
      minTrackingConfidence: 0.55,   // Raised from 0.52 for more stable tracking
    });

    hands.onResults(onResults);
    handsInstanceRef.current = hands;

    // Start camera stream at lower resolution for faster processing
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        try {
          await hands.send({ image: videoElement });
        } catch (e) {
          // Frame skip errors occasionally happen, ignore
        }
      },
      width: CAMERA_WIDTH,
      height: CAMERA_HEIGHT,
    });

    camera.start()
      .then(() => {
        setCameraActive(true);
        setCameraError(null);
      })
      .catch((err: any) => {
        console.error("Camera access error:", err);
        setCameraError("ไม่สามารถเปิดใช้งานกล้องเว็บแคมได้ กรุณาตรวจสอบสิทธิ์การใช้งานกล้องในบราวเซอร์ของคุณ");
      });

    cameraInstanceRef.current = camera;

    return () => {
      // Stop webcam and hand tracker instances on clean up
      if (cameraInstanceRef.current) {
        try {
          cameraInstanceRef.current.stop();
        } catch (e) {
          console.error("Failed to stop camera stream:", e);
        }
        cameraInstanceRef.current = null;
      }
      if (handsInstanceRef.current) {
        try {
          handsInstanceRef.current.close();
        } catch (e) {
          console.error("Failed to close MediaPipe Hands:", e);
        }
        handsInstanceRef.current = null;
      }

      // Release hardware camera tracks explicitly
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoElement.srcObject = null;
      }
    };
    // CRITICAL: Only scriptsLoaded and cameraEnabled should restart the pipeline.
    // All other settings are read from refs inside onResults.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptsLoaded, cameraEnabled]);

  // Export current canvas drawing as an image file
  const handleSaveDrawing = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `hand-pen-art-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="hand-pen-container">
      {/* Underlying raw camera feed, processed and rendered on screen via canvas */}
      <video ref={videoRef} className="video-element" playsInline muted />

      {/* Primary mirrored rendering surface */}
      <div className="camera-wrapper">
        <canvas ref={canvasRef} className="drawing-canvas" />
      </div>

      {/* Script & Assets loading indicator */}
      {!scriptsLoaded && (
        <div className="loading-overlay">
          <div className="loader-element" />
          <div className="loading-text">Loading MediaPipe Models...</div>
        </div>
      )}

      {/* Camera permission/system error alert overlay */}
      {cameraError && (
        <div className="loading-overlay">
          <div className="bg-slate-900 border-2 border-red-500/50 p-6 rounded-xl max-w-md text-center flex flex-col items-center gap-4 shadow-2xl backdrop-blur-md">
            <AlertTriangle className="size-12 text-red-500 animate-bounce" />
            <h2 className="text-red-400 font-bold text-lg tracking-wide uppercase">System Alert</h2>
            <p className="text-slate-300 text-sm leading-relaxed font-sans" style={{ whiteSpace: "pre-line" }}>{cameraError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-5 py-2.5 bg-red-600/90 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-500 transition-colors"
            >
              Retry / รีโหลดหน้าจอ
            </button>
            <Link 
              href="/arcade"
              className="px-4 py-2 border border-slate-700 hover:border-slate-500 rounded-lg text-xs uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
            >
              Back to Arcade
            </Link>
          </div>
        </div>
      )}

      {/* HUD User Interface Layer */}
      <div className="hud-layer">
        
        {/* Top Header Row */}
        <div className="hud-header">
          <div className="hud-title-panel hud-interactive">
            <h1>HAND PEN 🌙</h1>
            <p>GESTURE DRAWING & ART SYSTEM</p>
          </div>

          <div className="flex gap-4">
            {/* FPS Indicator (rendered in HTML HUD to prevent overlap with Back to Arcade button) */}
            {showFps && (
              <div className="hud-status-badge font-mono text-[#10B981] border-[#10B981]/30">
                <Activity className="size-3.5 animate-pulse" />
                <span>FPS: {fps}</span>
              </div>
            )}

            {/* Status indicators */}
            <div className="hud-status-badge">
              <span className="opacity-70">TRACKING:</span>
              <span className={`status-dot ${handDetected ? "active" : ""}`} />
              <span className="font-bold">{handDetected ? "CONNECTED" : "DISCONNECTED"}</span>
            </div>

            {/* Sidebar toggle */}
            <button 
              className="hud-status-badge hud-interactive cursor-pointer hover:border-[#F5D061]/50 hover:bg-[#F5D061]/5"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Settings className="size-3.5 text-[#F5D061] animate-spin-slow" />
              <span>{isSidebarOpen ? "HIDE CONTROL" : "SHOW CONTROL"}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Controls panel */}
        {scriptsLoaded && !cameraError && isSidebarOpen && (
          <div className="hud-sidebar">
            <div className="hud-sidebar-title">System Settings</div>

            {/* Color section */}
            <div className="hud-section">
              <div className="hud-section-label">Neon Colors</div>
              <div className="grid grid-cols-5 gap-2 mt-1.5 w-full">
                {BRUSH_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    className={`aspect-square w-full rounded-md cursor-pointer border-2 transition-all duration-200 ${
                      selectedColor === c.hex 
                        ? "border-white scale-110 shadow-[0_0_8px_currentColor]" 
                        : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex, color: c.hex }}
                    onClick={() => setSelectedColor(c.hex)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size section */}
            <div className="hud-section">
              <div className="hud-section-label">Brush Size</div>
              <div className="slider-container">
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="slider-input"
                />
                <span className="slider-value">{brushSize}px</span>
              </div>
              <div className="brush-preview">
                <div 
                  className="brush-preview-dot"
                  style={{ 
                    width: `${brushSize}px`, 
                    height: `${brushSize}px`,
                    backgroundColor: selectedColor,
                    color: selectedColor
                  }}
                />
              </div>
            </div>

            {/* Options Toggles */}
            <div className="hud-section">
              <div className="hud-section-label">Draw Mode</div>
              <button 
                className={`toggle-btn ${drawModeActive ? "active" : ""}`}
                onClick={() => setDrawModeActive(!drawModeActive)}
              >
                <span>{drawModeActive ? "Auto-Draw (Locked ON)" : "Gesture Shift-Draw"}</span>
                <span className="toggle-indicator" />
              </button>
            </div>

            <div className="hud-section">
              <div className="hud-section-label">Preferences</div>
              
              <button 
                className={`toggle-btn ${cameraEnabled ? "active" : ""}`}
                onClick={() => setCameraEnabled(!cameraEnabled)}
              >
                <span className="flex items-center gap-2">
                  <CameraIcon className="size-3.5" />
                  {cameraEnabled ? "Turn Off Camera (ปิดกล้อง)" : "Turn On Camera (เปิดกล้อง)"}
                </span>
                <span className="toggle-indicator" />
              </button>

              <button 
                className={`toggle-btn ${showSkeleton ? "active" : ""}`}
                onClick={() => setShowSkeleton(!showSkeleton)}
              >
                <span className="flex items-center gap-2">
                  {showSkeleton ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  Show Hand Skeleton
                </span>
                <span className="toggle-indicator" />
              </button>

              <button 
                className={`toggle-btn ${showFps ? "active" : ""}`}
                onClick={() => setShowFps(!showFps)}
              >
                <span className="flex items-center gap-2">
                  <Activity className="size-3.5" />
                  FPS Monitor
                </span>
                <span className="toggle-indicator" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile touch Drawing hold pad */}
        {scriptsLoaded && !cameraError && (
          <div className="mobile-draw-pad">
            <button
              className={`virtual-draw-btn hud-interactive ${isShiftPressedRef.current ? "active" : ""}`}
              onTouchStart={() => {
                isShiftPressedRef.current = true;
              }}
              onTouchEnd={() => {
                isShiftPressedRef.current = false;
              }}
              onMouseDown={() => {
                isShiftPressedRef.current = true;
              }}
              onMouseUp={() => {
                isShiftPressedRef.current = false;
              }}
              onMouseLeave={() => {
                isShiftPressedRef.current = false;
              }}
            >
              <Sparkles className="size-5" />
              <span>DRAW</span>
            </button>
          </div>
        )}

        {/* Bottom HUD Controls Row */}
        <div className="hud-footer">
          {/* Shortcuts panel (desktop only) */}
          <div className="hud-shortcuts hud-interactive">
            <div className="shortcut-item">
              <span className="shortcut-key">SHIFT</span>
              <span>Hold Shift to draw in the air</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-key">SPACE</span>
              <span>Press Space to clear canvas</span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="hud-actions">
            <button 
              className="action-btn danger" 
              onClick={clearCanvas}
              title="Clear Canvas (Spacebar)"
            >
              <Trash2 className="size-4" />
              <span>CLEAR</span>
            </button>
            <button 
              className="action-btn" 
              onClick={handleSaveDrawing}
              title="Export drawing as PNG"
            >
              <Download className="size-4" />
              <span>SAVE</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
