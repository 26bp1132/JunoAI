import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Pause,
  Play,
  HelpCircle,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Zap
} from "lucide-react";

// ============================================================================
// 10 UNIQUE ORIGINAL CUTE SLIME & MONSTER EVOLUTION TIERS
// ============================================================================
export interface MonsterDef {
  level: number;
  name: string;
  radius: number;
  color: string;
  secondaryColor: string;
  points: number;
  description: string;
}

export const MONSTER_DEFS: MonsterDef[] = [
  {
    level: 1,
    name: "Tiny Purple Slime",
    radius: 20,
    color: "#A855F7",
    secondaryColor: "#C084FC",
    points: 10,
    description: "A small, round slime with two large shiny eyes."
  },
  {
    level: 2,
    name: "Blue Blob",
    radius: 28,
    color: "#38BDF8",
    secondaryColor: "#7DD3FC",
    points: 25,
    description: "A cheerful sky-blue creature with a bubbly smile."
  },
  {
    level: 3,
    name: "Green Spiky Slime",
    radius: 36,
    color: "#84CC16",
    secondaryColor: "#BEF264",
    points: 45,
    description: "A lime-green blob with tiny soft jelly spikes."
  },
  {
    level: 4,
    name: "Turquoise Horned Slime",
    radius: 46,
    color: "#06D6A0",
    secondaryColor: "#5EEAD4",
    points: 75,
    description: "A round turquoise creature with two little horns."
  },
  {
    level: 5,
    name: "Orange Monster",
    radius: 56,
    color: "#FB923C",
    secondaryColor: "#FDBA74",
    points: 120,
    description: "A warm orange monster with two tiny cute vampire teeth."
  },
  {
    level: 6,
    name: "Purple Horned Beast",
    radius: 68,
    color: "#7C3AED",
    secondaryColor: "#A78BFA",
    points: 180,
    description: "A chunky purple creature with bigger eyes and curved horns."
  },
  {
    level: 7,
    name: "Red Monster",
    radius: 80,
    color: "#EF4444",
    secondaryColor: "#FCA5A5",
    points: 260,
    description: "A round tomato-red monster with a funny, derpy expression."
  },
  {
    level: 8,
    name: "Crystal Monster",
    radius: 94,
    color: "#EC4899",
    secondaryColor: "#F472B6",
    points: 360,
    description: "A vibrant monster adorned with glowing crystal spikes."
  },
  {
    level: 9,
    name: "Shadow Dragon",
    radius: 108,
    color: "#4F46E5",
    secondaryColor: "#818CF8",
    points: 500,
    description: "A cute dark-purple dragon-like monster with tiny wings."
  },
  {
    level: 10,
    name: "Legendary Slime King",
    radius: 124,
    color: "#FACC15",
    secondaryColor: "#FDE047",
    points: 1000,
    description: "The largest & rarest monster with a tiny golden crown!"
  }
];

// Physical monster inside the container
interface PhysicalMonster {
  id: number;
  level: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  squishX: number;
  squishY: number;
  rotation: number;
  vRot: number;
  settled: boolean;
  markedForDelete?: boolean;
}

// Particle effect
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

// Sound Synthesizer via Web Audio API
const playSound = (
  type: "drop" | "merge" | "gameover" | "correct" | "wrong",
  level = 1,
  enabled = true
) => {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "drop") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "merge") {
      // Pentatonic pitch scale based on monster evolution level
      const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];
      const baseFreq = notes[Math.min(level, notes.length - 1)];

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "triangle";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.2);
      osc2.frequency.setValueAtTime(baseFreq * 2, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.28);
      osc2.stop(now + 0.28);
    } else if (type === "correct") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.setValueAtTime(180, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "gameover") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.6);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    }
  } catch {
    // Ignore audio errors if blocked by browser policy
  }
};

// ============================================================================
// ORIGINAL VECTOR DRAWING FUNCTIONS FOR ALL 10 CHARACTERS
// (Cute, round, cartoon sticker style with big expressive eyes, highlights & cheeks)
// ============================================================================
function drawMonster(
  ctx: CanvasRenderingContext2D,
  level: number,
  x: number,
  y: number,
  radius: number,
  squishX = 1,
  squishY = 1,
  rotation = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(squishX, squishY);

  const def = MONSTER_DEFS[level - 1] || MONSTER_DEFS[0];

  // Base Monster Shadow
  ctx.beginPath();
  ctx.arc(0, radius * 0.15, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fill();

  // Draw Specific Monster Silhouette & Details
  switch (level) {
    case 1: {
      // 1. Tiny Purple Slime: 2 large shiny eyes, tiny shy smile
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#4C1D95";
      ctx.stroke();

      // Top Highlight
      ctx.beginPath();
      ctx.ellipse(-radius * 0.35, -radius * 0.45, radius * 0.25, radius * 0.12, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.fill();

      // Big expressive eyes
      drawCuteEye(ctx, -radius * 0.35, -radius * 0.05, radius * 0.28);
      drawCuteEye(ctx, radius * 0.35, -radius * 0.05, radius * 0.28);

      // Pink blush cheeks
      drawBlush(ctx, -radius * 0.55, radius * 0.25, radius * 0.16, "#F472B6");
      drawBlush(ctx, radius * 0.55, radius * 0.25, radius * 0.16, "#F472B6");

      // Tiny mouth
      ctx.beginPath();
      ctx.arc(0, radius * 0.22, radius * 0.15, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.strokeStyle = "#4C1D95";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    case 2: {
      // 2. Blue Blob: Cheerful sky-blue, happy open smile, rosy cheeks
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#0369A1";
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.ellipse(-radius * 0.3, -radius * 0.45, radius * 0.28, radius * 0.14, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fill();

      // Cute Little Tuft on top
      ctx.beginPath();
      ctx.arc(0, -radius * 0.95, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = def.secondaryColor;
      ctx.fill();
      ctx.strokeStyle = "#0369A1";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cheerful Eyes
      drawCuteEye(ctx, -radius * 0.35, -radius * 0.1, radius * 0.26);
      drawCuteEye(ctx, radius * 0.35, -radius * 0.1, radius * 0.26);

      // Cheeks
      drawBlush(ctx, -radius * 0.58, radius * 0.2, radius * 0.18, "#FDA4AF");
      drawBlush(ctx, radius * 0.58, radius * 0.2, radius * 0.18, "#FDA4AF");

      // Big Happy Open Mouth
      ctx.beginPath();
      ctx.arc(0, radius * 0.15, radius * 0.28, 0, Math.PI);
      ctx.fillStyle = "#BE185D";
      ctx.fill();
      ctx.strokeStyle = "#0369A1";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    case 3: {
      // 3. Green Spiky Slime: Lime-green with 4 tiny soft jelly spikes
      // Jelly spikes
      const spikeAngles = [-Math.PI * 0.65, -Math.PI * 0.45, -Math.PI * 0.25, -Math.PI * 0.05];
      spikeAngles.forEach(ang => {
        const sx = Math.cos(ang) * (radius * 0.95);
        const sy = Math.sin(ang) * (radius * 0.95);
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = def.secondaryColor;
        ctx.fill();
        ctx.strokeStyle = "#365314";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Body
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#365314";
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.ellipse(-radius * 0.32, -radius * 0.4, radius * 0.25, radius * 0.12, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fill();

      // Eyes
      drawCuteEye(ctx, -radius * 0.35, -radius * 0.05, radius * 0.26);
      drawCuteEye(ctx, radius * 0.35, -radius * 0.05, radius * 0.26);

      // Playful tongue sticking out
      ctx.beginPath();
      ctx.arc(0, radius * 0.2, radius * 0.2, 0, Math.PI);
      ctx.strokeStyle = "#365314";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(radius * 0.08, radius * 0.28, radius * 0.12, 0, Math.PI);
      ctx.fillStyle = "#FB7185";
      ctx.fill();
      break;
    }

    case 4: {
      // 4. Turquoise Horned Slime: 2 little horns on top, curious wide eyes
      // Horns
      ctx.beginPath();
      ctx.moveTo(-radius * 0.55, -radius * 0.6);
      ctx.lineTo(-radius * 0.7, -radius * 1.15);
      ctx.lineTo(-radius * 0.3, -radius * 0.8);
      ctx.closePath();
      ctx.fillStyle = "#FFD166";
      ctx.fill();
      ctx.strokeStyle = "#065F46";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(radius * 0.55, -radius * 0.6);
      ctx.lineTo(radius * 0.7, -radius * 1.15);
      ctx.lineTo(radius * 0.3, -radius * 0.8);
      ctx.closePath();
      ctx.fillStyle = "#FFD166";
      ctx.fill();
      ctx.strokeStyle = "#065F46";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#065F46";
      ctx.stroke();

      // Eyes
      drawCuteEye(ctx, -radius * 0.34, -radius * 0.05, radius * 0.26);
      drawCuteEye(ctx, radius * 0.34, -radius * 0.05, radius * 0.26);

      // Cheeks
      drawBlush(ctx, -radius * 0.56, radius * 0.2, radius * 0.16, "#F472B6");
      drawBlush(ctx, radius * 0.56, radius * 0.2, radius * 0.16, "#F472B6");

      // Cat-like cute mouth ':3'
      ctx.beginPath();
      ctx.arc(-radius * 0.08, radius * 0.22, radius * 0.1, 0, Math.PI);
      ctx.arc(radius * 0.08, radius * 0.22, radius * 0.1, 0, Math.PI);
      ctx.strokeStyle = "#065F46";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      break;
    }

    case 5: {
      // 5. Orange Monster: 2 tiny vampire teeth poking out, warm happy eyes
      // Little soft monster ears
      ctx.beginPath();
      ctx.arc(-radius * 0.75, -radius * 0.6, radius * 0.25, 0, Math.PI * 2);
      ctx.arc(radius * 0.75, -radius * 0.6, radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = def.secondaryColor;
      ctx.fill();
      ctx.strokeStyle = "#9A3412";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "#9A3412";
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.ellipse(-radius * 0.35, -radius * 0.45, radius * 0.3, radius * 0.15, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.fill();

      // Eyes
      drawCuteEye(ctx, -radius * 0.36, -radius * 0.1, radius * 0.25);
      drawCuteEye(ctx, radius * 0.36, -radius * 0.1, radius * 0.25);

      // Open smile with tiny white fangs
      ctx.beginPath();
      ctx.arc(0, radius * 0.18, radius * 0.32, 0, Math.PI);
      ctx.fillStyle = "#7C2D12";
      ctx.fill();
      ctx.strokeStyle = "#9A3412";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Little fangs
      ctx.beginPath();
      ctx.moveTo(-radius * 0.18, radius * 0.18);
      ctx.lineTo(-radius * 0.12, radius * 0.32);
      ctx.lineTo(-radius * 0.06, radius * 0.18);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(radius * 0.06, radius * 0.18);
      ctx.lineTo(radius * 0.12, radius * 0.32);
      ctx.lineTo(radius * 0.18, radius * 0.18);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      break;
    }

    case 6: {
      // 6. Purple Horned Beast: Chunky purple, bigger eyes, curved horns
      // Curved horns
      ctx.beginPath();
      ctx.arc(-radius * 0.65, -radius * 0.65, radius * 0.35, Math.PI * 0.2, Math.PI * 1.2, false);
      ctx.lineWidth = radius * 0.25;
      ctx.strokeStyle = "#E9D5FF";
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(radius * 0.65, -radius * 0.65, radius * 0.35, Math.PI * 1.8, Math.PI * 0.8, true);
      ctx.lineWidth = radius * 0.25;
      ctx.strokeStyle = "#E9D5FF";
      ctx.lineCap = "round";
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#3B0764";
      ctx.stroke();

      // Belly Patch
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.35, radius * 0.55, radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = def.secondaryColor;
      ctx.fill();

      // Eyes
      drawCuteEye(ctx, -radius * 0.36, -radius * 0.15, radius * 0.28);
      drawCuteEye(ctx, radius * 0.36, -radius * 0.15, radius * 0.28);

      // Cheeks
      drawBlush(ctx, -radius * 0.6, radius * 0.1, radius * 0.18, "#F472B6");
      drawBlush(ctx, radius * 0.6, radius * 0.1, radius * 0.18, "#F472B6");

      // Silly smile
      ctx.beginPath();
      ctx.arc(0, radius * 0.12, radius * 0.25, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.strokeStyle = "#3B0764";
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }

    case 7: {
      // 7. Red Monster: Tomato red, funny derpy surprised face
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#7F1D1D";
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.ellipse(-radius * 0.35, -radius * 0.45, radius * 0.32, radius * 0.16, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.fill();

      // Big Derpy Wide Eyes with offset pupils
      drawDerpyEye(ctx, -radius * 0.36, -radius * 0.15, radius * 0.3, -radius * 0.05, -radius * 0.05);
      drawDerpyEye(ctx, radius * 0.36, -radius * 0.15, radius * 0.3, radius * 0.05, -radius * 0.05);

      // Cute round shocked "O" mouth
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.3, radius * 0.18, radius * 0.24, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#450A0A";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#7F1D1D";
      ctx.stroke();
      break;
    }

    case 8: {
      // 8. Crystal Monster: Vibrant magenta with colourful crystal spikes
      // Crystal Shards
      const crystalPositions = [-0.6, -0.2, 0.2, 0.6];
      crystalPositions.forEach((pos, i) => {
        ctx.save();
        ctx.translate(pos * radius, -radius * 0.85);
        ctx.rotate((pos * 0.6));
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.35);
        ctx.lineTo(radius * 0.15, 0);
        ctx.lineTo(-radius * 0.15, 0);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "#67E8F9" : "#FDE047";
        ctx.fill();
        ctx.strokeStyle = "#831843";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      });

      // Body
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#831843";
      ctx.stroke();

      // Sparkle Eyes
      drawStarEye(ctx, -radius * 0.36, -radius * 0.1, radius * 0.26);
      drawStarEye(ctx, radius * 0.36, -radius * 0.1, radius * 0.26);

      // Cheeks
      drawBlush(ctx, -radius * 0.6, radius * 0.18, radius * 0.2, "#FBCFE8");
      drawBlush(ctx, radius * 0.6, radius * 0.18, radius * 0.2, "#FBCFE8");

      // Happy smile
      ctx.beginPath();
      ctx.arc(0, radius * 0.2, radius * 0.22, 0, Math.PI);
      ctx.strokeStyle = "#831843";
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }

    case 9: {
      // 9. Shadow Dragon: Dark midnight purple, tiny dragon wings, cute horns & snout
      // Little dragon wings
      ctx.beginPath();
      ctx.moveTo(-radius * 0.9, -radius * 0.2);
      ctx.quadraticCurveTo(-radius * 1.35, -radius * 0.7, -radius * 1.3, -radius * 0.1);
      ctx.quadraticCurveTo(-radius * 1.1, radius * 0.2, -radius * 0.9, 0);
      ctx.fillStyle = def.secondaryColor;
      ctx.fill();
      ctx.strokeStyle = "#1E1B4B";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(radius * 0.9, -radius * 0.2);
      ctx.quadraticCurveTo(radius * 1.35, -radius * 0.7, radius * 1.3, -radius * 0.1);
      ctx.quadraticCurveTo(radius * 1.1, radius * 0.2, radius * 0.9, 0);
      ctx.fillStyle = def.secondaryColor;
      ctx.fill();
      ctx.strokeStyle = "#1E1B4B";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Dragon horns
      ctx.beginPath();
      ctx.moveTo(-radius * 0.45, -radius * 0.75);
      ctx.lineTo(-radius * 0.65, -radius * 1.25);
      ctx.lineTo(-radius * 0.25, -radius * 0.9);
      ctx.fillStyle = "#A5B4FC";
      ctx.fill();
      ctx.strokeStyle = "#1E1B4B";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(radius * 0.45, -radius * 0.75);
      ctx.lineTo(radius * 0.65, -radius * 1.25);
      ctx.lineTo(radius * 0.25, -radius * 0.9);
      ctx.fillStyle = "#A5B4FC";
      ctx.fill();
      ctx.strokeStyle = "#1E1B4B";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = "#1E1B4B";
      ctx.stroke();

      // Dragon snout
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.22, radius * 0.38, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = def.secondaryColor;
      ctx.fill();

      // Nostrils
      ctx.beginPath();
      ctx.arc(-radius * 0.1, radius * 0.18, radius * 0.05, 0, Math.PI * 2);
      ctx.arc(radius * 0.1, radius * 0.18, radius * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = "#1E1B4B";
      ctx.fill();

      // Eyes
      drawCuteEye(ctx, -radius * 0.38, -radius * 0.18, radius * 0.26);
      drawCuteEye(ctx, radius * 0.38, -radius * 0.18, radius * 0.26);
      break;
    }

    case 10: {
      // 10. Legendary Slime King: Royal golden yellow with tiny golden crown!
      // Crown
      ctx.save();
      ctx.translate(0, -radius * 0.92);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.4, 0);
      ctx.lineTo(-radius * 0.45, -radius * 0.4);
      ctx.lineTo(-radius * 0.15, -radius * 0.2);
      ctx.lineTo(0, -radius * 0.5);
      ctx.lineTo(radius * 0.15, -radius * 0.2);
      ctx.lineTo(radius * 0.45, -radius * 0.4);
      ctx.lineTo(radius * 0.4, 0);
      ctx.closePath();
      ctx.fillStyle = "#F59E0B";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#78350F";
      ctx.stroke();

      // Crown Gems
      ctx.beginPath();
      ctx.arc(-radius * 0.35, -radius * 0.32, radius * 0.06, 0, Math.PI * 2);
      ctx.arc(0, -radius * 0.4, radius * 0.07, 0, Math.PI * 2);
      ctx.arc(radius * 0.35, -radius * 0.32, radius * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = "#EF4444";
      ctx.fill();
      ctx.restore();

      // Body
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#78350F";
      ctx.stroke();

      // Jelly Shimmer
      ctx.beginPath();
      ctx.ellipse(-radius * 0.35, -radius * 0.45, radius * 0.35, radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fill();

      // Proud funny smiling eyes with sunglasses or golden shine
      drawCuteEye(ctx, -radius * 0.36, -radius * 0.1, radius * 0.28);
      drawCuteEye(ctx, radius * 0.36, -radius * 0.1, radius * 0.28);

      // Cheeks
      drawBlush(ctx, -radius * 0.6, radius * 0.18, radius * 0.2, "#FB923C");
      drawBlush(ctx, radius * 0.6, radius * 0.18, radius * 0.2, "#FB923C");

      // Smug / Proud Happy Smile
      ctx.beginPath();
      ctx.arc(0, radius * 0.15, radius * 0.32, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#78350F";
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

function drawCuteEye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  // Sclera / eye background (dark pupil)
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#111827";
  ctx.fill();

  // Big white top catchlight
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  // Small bottom catchlight
  ctx.beginPath();
  ctx.arc(x + r * 0.32, y + r * 0.32, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
}

function drawDerpyEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  pupilOffsetX = 0,
  pupilOffsetY = 0
) {
  // White eye
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#111827";
  ctx.stroke();

  // Pupil
  ctx.beginPath();
  ctx.arc(x + pupilOffsetX, y + pupilOffsetY, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "#111827";
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.arc(x + pupilOffsetX - r * 0.12, y + pupilOffsetY - r * 0.12, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
}

function drawStarEye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const ai = a + Math.PI / 5;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(ai) * (r * 0.45), Math.sin(ai) * (r * 0.45));
  }
  ctx.closePath();
  ctx.fillStyle = "#FDE047";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#713F12";
  ctx.stroke();
  ctx.restore();
}

function drawBlush(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================
interface SlimeMergeGameProps {
  deck: Array<{ front: string; back: string }>;
  presentationTitle?: string;
  onClose: () => void;
}

export const SlimeMergeGame: React.FC<SlimeMergeGameProps> = ({
  deck,
  presentationTitle = "Presentation",
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game UI State
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem("junoai_slime_best_score") || "0", 10);
  });
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [highestLevelReached, setHighestLevelReached] = useState(1);
  const [showEvolutionGuide, setShowEvolutionGuide] = useState(false);

  // Upcoming Next Monster Level (Random between 1 and 4)
  const [nextLevel, setNextLevel] = useState(() => Math.floor(Math.random() * 3) + 1);

  // Dropper State
  const dropperXRef = useRef<number>(240);
  const [currentDropLevel, setCurrentDropLevel] = useState(() => Math.floor(Math.random() * 3) + 1);
  const isDroppingRef = useRef(false);

  // Question Pop-Out State
  // Requirement: "after u add thee characters two times it will tell u to answer question like a pop out but not too fast the pop out transitions paired with thje questions for the duration of 0.10s"
  const [dropCounter, setDropCounter] = useState(0);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // Physics World State Refs
  const monstersRef = useRef<PhysicalMonster[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const dangerTimerRef = useRef(0);
  const nextMonsterIdRef = useRef(1);

  // Container Dimensions
  const containerWidth = 480;
  const containerHeight = 650;
  const dangerLineY = 120; // Monsters settled above this trigger danger timer

  // Pick question based on user's presentation script
  const generateScriptQuestion = () => {
    if (deck && deck.length >= 1) {
      const cardIndex = Math.floor(Math.random() * deck.length);
      const targetCard = deck[cardIndex];

      const otherCards = deck.filter((_, i) => i !== cardIndex);
      const distractor1 = otherCards[0]?.back || "Recite verbatim without pausing for audience comprehension.";
      const distractor2 = otherCards[1]?.back || "Dismiss inquiries quickly to maintain slide schedule.";
      const distractor3 = otherCards[2]?.back || "Avoid making eye contact while delivering your conclusions.";

      const options = [targetCard.back, distractor1, distractor2, distractor3];
      // Shuffle options
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      const correctIdx = shuffled.indexOf(targetCard.back);

      return {
        question: `Regarding ${presentationTitle || "your script"}: ${targetCard.front}`,
        options: shuffled,
        correctIndex: correctIdx,
        explanation: `Winning Formula from your speech: "${targetCard.back}"`
      };
    }

    // Default high-quality speech recall questions if no deck is loaded
    const defaults = [
      {
        question: "What is the recommended average speaking speed for an engaging presentation?",
        options: [
          "110 to 140 words per minute with deliberate breath pauses",
          "Over 190 words per minute to pack in as much information as possible",
          "Under 70 words per minute with monotone inflection",
          "Variable speed shifting randomly every slide"
        ],
        correctIndex: 0,
        explanation: "110–140 WPM allows listeners to absorb complex arguments while keeping rhythm engaging."
      },
      {
        question: "What does the PREP method stand for when defending questions from teachers and judges?",
        options: [
          "Point ➔ Reason ➔ Example/Evidence ➔ Point",
          "Pause ➔ Retreat ➔ Evade ➔ Panic",
          "Plan ➔ Read ➔ Explain ➔ Praise",
          "Polite ➔ Repeat ➔ Exit ➔ Proceed"
        ],
        correctIndex: 0,
        explanation: "PREP structures an immediate, confident, and evidence-backed response."
      },
      {
        question: "How should you start your presentation hook to capture instant room attention?",
        options: [
          "With an intriguing question, startling fact, or relatable brief story",
          "By reading the full table of contents slide line by line",
          "By apologizing that you didn't have enough time to finish your slides",
          "By clearing your throat and asking if the microphone is working"
        ],
        correctIndex: 0,
        explanation: "A hook piques audience curiosity in the first 15 seconds."
      }
    ];

    const pick = defaults[Math.floor(Math.random() * defaults.length)];
    return pick;
  };

  // Drop Monster Action
  const handleDrop = () => {
    if (isDroppingRef.current || isPaused || gameOver || isQuestionActive) return;

    isDroppingRef.current = true;
    const dropLevel = currentDropLevel;
    const def = MONSTER_DEFS[dropLevel - 1];

    // Constrain drop X within container
    const clampedX = Math.max(
      def.radius + 15,
      Math.min(containerWidth - def.radius - 15, dropperXRef.current)
    );

    const newMonster: PhysicalMonster = {
      id: nextMonsterIdRef.current++,
      level: dropLevel,
      x: clampedX,
      y: 75,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.5,
      radius: def.radius,
      squishX: 1,
      squishY: 1,
      rotation: 0,
      vRot: (Math.random() - 0.5) * 0.05,
      settled: false
    };

    monstersRef.current.push(newMonster);
    playSound("drop", dropLevel, soundEnabled);

    // Increment drop counter for question popup requirement:
    // Every 4 slimes 1 question from the script pops out with a snappy 0.10s transition
    setDropCounter((prev) => {
      const nextCount = prev + 1;
      if (nextCount % 4 === 0) {
        // Trigger question pop-out smoothly!
        setTimeout(() => {
          setActiveQuestion(generateScriptQuestion());
          setSelectedOption(null);
          setQuestionAnswered(false);
          setIsQuestionActive(true);
        }, 320); // slight buffer so drop lands nicely first
      }
      return nextCount;
    });

    // Prepare Next Monster
    setCurrentDropLevel(nextLevel);
    setNextLevel(Math.floor(Math.random() * 3) + 1);

    // Cooldown before next drop allowed
    setTimeout(() => {
      isDroppingRef.current = false;
    }, 450);
  };

  // Submit Question Answer
  const handleAnswerQuestion = (index: number) => {
    if (questionAnswered || !activeQuestion) return;
    setSelectedOption(index);
    setQuestionAnswered(true);

    const correct = index === activeQuestion.correctIndex;
    setIsCorrectAnswer(correct);

    if (correct) {
      playSound("correct", 1, soundEnabled);
      // Award Bonus Score
      setScore((prev) => {
        const updated = prev + 150;
        if (updated > bestScore) {
          setBestScore(updated);
          localStorage.setItem("junoai_slime_best_score", updated.toString());
        }
        return updated;
      });
    } else {
      playSound("wrong", 1, soundEnabled);
    }
  };

  // Resume game after question
  const handleResumeAfterQuestion = () => {
    setIsQuestionActive(false);
    setActiveQuestion(null);
  };

  // Restart Game
  const handleRestart = () => {
    monstersRef.current = [];
    particlesRef.current = [];
    dangerTimerRef.current = 0;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setIsQuestionActive(false);
    setDropCounter(0);
    setHighestLevelReached(1);
    setCurrentDropLevel(Math.floor(Math.random() * 3) + 1);
    setNextLevel(Math.floor(Math.random() * 3) + 1);
  };

  // ============================================================================
  // PHYSICS ENGINE & RENDER LOOP
  // ============================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const gravity = 0.38;
    const restitution = 0.28; // Bounciness
    const damping = 0.988; // Air/Friction drag

    const render = () => {
      // 1. Clear Frame (Dark charcoal / deep purple canvas background)
      ctx.fillStyle = "#181424";
      ctx.fillRect(0, 0, containerWidth, containerHeight);

      // Subtle Background Grid dots for clean aesthetic
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let gx = 20; gx < containerWidth; gx += 28) {
        for (let gy = 20; gy < containerHeight; gy += 28) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Container Borders
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#4C1D95";
      ctx.strokeRect(4, 4, containerWidth - 8, containerHeight - 8);

      // Danger Line
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = dangerTimerRef.current > 1.2 ? "#EF4444" : "rgba(239, 68, 68, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, dangerLineY);
      ctx.lineTo(containerWidth - 8, dangerLineY);
      ctx.stroke();

      // Danger Warning Label
      ctx.setLineDash([]);
      ctx.fillStyle = dangerTimerRef.current > 1.2 ? "#EF4444" : "rgba(239, 68, 68, 0.6)";
      ctx.font = "bold 10px 'Space Grotesk', sans-serif";
      ctx.fillText(
        dangerTimerRef.current > 0.5
          ? `⚠️ DANGER OVERFLOW (${Math.max(0, 3 - Math.floor(dangerTimerRef.current))}s)`
          : "— DANGER LINE —",
        containerWidth / 2 - 50,
        dangerLineY - 8
      );
      ctx.restore();

      // Skip physics update if paused or question pop-up active or game over
      const shouldUpdatePhysics = !isPaused && !isQuestionActive && !gameOver;

      if (shouldUpdatePhysics) {
        const monsters = monstersRef.current;

        // Apply Gravity, Move, and Container Collisions
        for (let i = 0; i < monsters.length; i++) {
          const m = monsters[i];
          m.vy += gravity;
          m.vx *= damping;
          m.vy *= damping;
          m.rotation += m.vRot;
          m.vRot *= 0.95;

          // Rapid, natural squish restitution - fully restores to normal within ~0.7s
          m.squishX += (1 - m.squishX) * 0.18;
          m.squishY += (1 - m.squishY) * 0.18;
          if (Math.abs(m.squishX - 1) < 0.01) {
            m.squishX = 1;
            m.squishY = 1;
          }

          m.x += m.vx;
          m.y += m.vy;

          // Wall Collisions (Left & Right)
          if (m.x - m.radius < 8) {
            m.x = 8 + m.radius;
            const impactX = Math.abs(m.vx);
            m.vx = -m.vx * restitution;
            if (impactX > 1.2) {
              m.squishX = 0.92;
              m.squishY = 1.08;
            }
          } else if (m.x + m.radius > containerWidth - 8) {
            m.x = containerWidth - 8 - m.radius;
            const impactX = Math.abs(m.vx);
            m.vx = -m.vx * restitution;
            if (impactX > 1.2) {
              m.squishX = 0.92;
              m.squishY = 1.08;
            }
          }

          // Floor Collision - only squash momentarily on real impact, never while resting!
          if (m.y + m.radius > containerHeight - 8) {
            m.y = containerHeight - 8 - m.radius;
            const impactSpeed = Math.abs(m.vy);
            m.vy = -m.vy * restitution;
            m.vx *= 0.92; // floor friction
            if (impactSpeed < 0.6) {
              m.vy = 0;
              m.settled = true;
            } else if (!m.settled && impactSpeed > 1.2) {
              // Gentle impact squash that recovers within 0.7s
              m.squishX = Math.min(1.12, 1 + impactSpeed * 0.02);
              m.squishY = Math.max(0.88, 1 - impactSpeed * 0.02);
            }
          }
        }

        // Circle-Circle Collision & Evolution Merge Resolution
        for (let i = 0; i < monsters.length; i++) {
          for (let j = i + 1; j < monsters.length; j++) {
            const m1 = monsters[i];
            const m2 = monsters[j];

            if (m1.markedForDelete || m2.markedForDelete) continue;

            const dx = m2.x - m1.x;
            const dy = m2.y - m1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = m1.radius + m2.radius;

            if (dist < minDist && dist > 0.001) {
              // SAME LEVEL MERGE CHECK!
              if (m1.level === m2.level && m1.level < 10) {
                m1.markedForDelete = true;
                m2.markedForDelete = true;

                const nextLvl = m1.level + 1;
                const nextDef = MONSTER_DEFS[nextLvl - 1];
                const mergeX = (m1.x + m2.x) / 2;
                const mergeY = (m1.y + m2.y) / 2;

                // Spawn next level monster at collision point
                const evolved: PhysicalMonster = {
                  id: nextMonsterIdRef.current++,
                  level: nextLvl,
                  x: mergeX,
                  y: mergeY,
                  vx: (m1.vx + m2.vx) * 0.4,
                  vy: -1.2, // Small celebratory pop upward
                  radius: nextDef.radius,
                  squishX: 1.15,
                  squishY: 0.88,
                  rotation: 0,
                  vRot: (Math.random() - 0.5) * 0.08,
                  settled: false
                };

                monsters.push(evolved);

                // Burst merge particles
                for (let p = 0; p < 14; p++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = Math.random() * 4 + 1.5;
                  particlesRef.current.push({
                    x: mergeX,
                    y: mergeY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: Math.random() * 3.5 + 2,
                    color: nextDef.color,
                    alpha: 1,
                    life: 0,
                    maxLife: Math.random() * 20 + 20
                  });
                }

                // Award points
                const pts = nextDef.points;
                setScore((prev) => {
                  const updated = prev + pts;
                  if (updated > bestScore) {
                    setBestScore(updated);
                    localStorage.setItem("junoai_slime_best_score", updated.toString());
                  }
                  return updated;
                });

                // Update highest level reached
                setHighestLevelReached((prev) => Math.max(prev, nextLvl));

                // Play satisfying merge chime
                playSound("merge", nextLvl, soundEnabled);
                break;
              }

              // Elastic Circle Collision Resolution
              const overlap = (minDist - dist) * 0.5;
              const nx = dx / dist;
              const ny = dy / dist;

              m1.x -= nx * overlap;
              m1.y -= ny * overlap;
              m2.x += nx * overlap;
              m2.y += ny * overlap;

              // Exchange velocity along collision normal
              const kx = m1.vx - m2.vx;
              const ky = m1.vy - m2.vy;
              const p = 2 * (nx * kx + ny * ky) / 2; // Equal mass assumption

              m1.vx -= p * nx * restitution;
              m1.vy -= p * ny * restitution;
              m2.vx += p * nx * restitution;
              m2.vy += p * ny * restitution;

              // Squish feedback on impact only if significant impact
              if (Math.abs(p) > 1.4) {
                m1.squishX = 1.08;
                m1.squishY = 0.92;
                m2.squishX = 0.92;
                m2.squishY = 1.08;
              }
            }
          }
        }

        // Clean up merged monsters
        monstersRef.current = monsters.filter((m) => !m.markedForDelete);

        // Update Particles
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const pt = particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.08;
          pt.life++;
          pt.alpha = 1 - pt.life / pt.maxLife;
          if (pt.life >= pt.maxLife) {
            particles.splice(i, 1);
          }
        }

        // Danger Line Overflow Check (Monsters settled above line)
        let hasOverflow = false;
        for (const m of monstersRef.current) {
          if (m.y - m.radius < dangerLineY && Math.abs(m.vy) < 0.4 && m.y > 90) {
            hasOverflow = true;
            break;
          }
        }

        if (hasOverflow) {
          dangerTimerRef.current += 1 / 60;
          if (dangerTimerRef.current >= 3.0) {
            setGameOver(true);
            playSound("gameover", 1, soundEnabled);
          }
        } else {
          dangerTimerRef.current = Math.max(0, dangerTimerRef.current - 1 / 60);
        }
      }

      // 2. Render Settled & Moving Monsters
      for (const m of monstersRef.current) {
        drawMonster(ctx, m.level, m.x, m.y, m.radius, m.squishX, m.squishY, m.rotation);
      }

      // 3. Render Particles
      for (const pt of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Render Top Dropper Guide & Holding Monster (Only if game is active)
      if (!gameOver && !isPaused && !isQuestionActive) {
        const curDef = MONSTER_DEFS[currentDropLevel - 1];
        const clampedDropX = Math.max(
          curDef.radius + 15,
          Math.min(containerWidth - curDef.radius - 15, dropperXRef.current)
        );

        // Dotted Dropper Projection Line
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(clampedDropX, 85);
        ctx.lineTo(clampedDropX, containerHeight - 12);
        ctx.stroke();
        ctx.restore();

        // Top Holding Monster
        if (!isDroppingRef.current) {
          drawMonster(ctx, currentDropLevel, clampedDropX, 60, curDef.radius, 1, 1, 0);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isQuestionActive, gameOver, currentDropLevel, soundEnabled, bestScore]);

  // Pointer Move Event for Dropper Control
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || gameOver || isQuestionActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const canvasX = (e.clientX - rect.left) * scaleX;
    dropperXRef.current = canvasX;
  };

  // Keyboard controls for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || gameOver || isQuestionActive) return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        dropperXRef.current = Math.max(40, dropperXRef.current - 25);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        dropperXRef.current = Math.min(containerWidth - 40, dropperXRef.current + 25);
      } else if (e.key === " " || e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleDrop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaused, gameOver, isQuestionActive, currentDropLevel]);

  return (
    <div className="space-y-4 animate-fade-in w-full max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border-3 border-black rounded-3xl p-5 shadow-[6px_6px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#A855F7] rounded-2xl border-2 border-black flex items-center justify-center text-2xl shadow-[3px_3px_0px_#000] text-white">
            👾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-[#FFD166] text-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                Physics Merge
              </span>
              <span className="text-[10px] font-black bg-[#06D6A0] text-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                Script Pop-Out Recall
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-black font-heading mt-0.5">
              Slime & Monster Merge
            </h2>
            <p className="text-xs text-slate-700 font-semibold">
              Drop and merge cute slimes into the Legendary King. Test your presentation knowledge every 2 drops!
            </p>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
          <button
            onClick={() => setShowEvolutionGuide((prev) => !prev)}
            className="px-3 py-2 bg-[#FFF9F2] hover:bg-[#FFD166] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer transition-all"
            title="View Monster Evolution Guide"
          >
            <Sparkles className="w-4 h-4 text-[#A855F7]" />
            <span>Evolution Guide</span>
          </button>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 bg-white hover:bg-slate-100 text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="p-2 bg-white hover:bg-slate-100 text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
            title={isPaused ? "Resume Game" : "Pause Game"}
          >
            {isPaused ? <Play className="w-4 h-4 fill-black" /> : <Pause className="w-4 h-4 fill-black" />}
          </button>

          <button
            onClick={handleRestart}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#EF476F] hover:bg-[#d63b61] text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            Exit Game
          </button>
        </div>
      </div>

      {/* Evolution Guide Modal / Tray */}
      {showEvolutionGuide && (
        <div className="bg-[#181424] border-3 border-black p-4 rounded-3xl shadow-[6px_6px_0px_#000] text-white space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-purple-800/60 pb-2">
            <span className="text-xs font-black uppercase text-[#FDE047] flex items-center gap-1.5 font-heading">
              👑 Monster Evolution Tree (1 to 10)
            </span>
            <button
              onClick={() => setShowEvolutionGuide(false)}
              className="text-xs font-black text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {MONSTER_DEFS.map((m) => (
              <div
                key={m.level}
                className="bg-[#241F35] p-2.5 rounded-2xl border-2 border-purple-900/60 flex items-center gap-2.5 shadow-[2px_2px_0px_#000]"
              >
                <div
                  className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center font-black text-xs text-black shrink-0"
                  style={{ backgroundColor: m.color }}
                >
                  {m.level}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black truncate text-white">{m.name}</p>
                  <p className="text-[9px] text-[#A78BFA] font-bold">+{m.points} Pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Game Stage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Score & Next Monster HUD */}
        <div className="lg:col-span-4 space-y-4">
          {/* Current Score Banner */}
          <div className="bg-white border-3 border-black p-5 rounded-3xl shadow-[5px_5px_0px_#000] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black uppercase text-slate-600">Current Score</span>
              <span className="text-[10px] font-black bg-[#FFD166] text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                Combo Pts
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-[#A855F7] font-heading">{score}</span>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-500 block">Best Score</span>
                <span className="text-sm font-black text-emerald-600 flex items-center gap-1 font-heading">
                  <Trophy className="w-3.5 h-3.5 fill-current" /> {bestScore}
                </span>
              </div>
            </div>
          </div>

          {/* Next Monster Preview Card */}
          <div className="bg-white border-3 border-black p-5 rounded-3xl shadow-[5px_5px_0px_#000] space-y-3 text-center">
            <span className="text-xs font-black uppercase text-slate-600 block">Next Monster in Cue</span>
            <div className="w-24 h-24 mx-auto bg-[#181424] rounded-2xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
              <div
                className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center text-xs font-black text-black shadow-inner animate-pulse"
                style={{ backgroundColor: MONSTER_DEFS[nextLevel - 1].color }}
              >
                Lvl {nextLevel}
              </div>
            </div>
            <p className="text-xs font-black text-black font-heading">
              {MONSTER_DEFS[nextLevel - 1].name}
            </p>
            <p className="text-[10px] text-slate-600 font-semibold">
              {MONSTER_DEFS[nextLevel - 1].description}
            </p>
          </div>

          {/* Question Trigger Progress */}
          <div className="bg-[#FFF9F2] border-3 border-black p-4 rounded-3xl shadow-[5px_5px_0px_#000] space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-black font-heading">
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-[#FF6B35] fill-current" /> Question Pop-Out
              </span>
              <span className="text-[11px] bg-white border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                {dropCounter % 2} / 2 Drops
              </span>
            </div>
            <div className="w-full bg-white h-3 rounded-full border-2 border-black overflow-hidden shadow-[1px_1px_0px_#000]">
              <div
                className="bg-[#FF6B35] h-full transition-all duration-200"
                style={{ width: `${((dropCounter % 2) / 2) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-700 font-medium">
              Every 2 character drops, a script question pops out to earn +150 bonus points!
            </p>
          </div>

          {/* Controls Advice */}
          <div className="bg-white border-2 border-black p-4 rounded-2xl text-xs space-y-1.5 shadow-[3px_3px_0px_#000]">
            <p className="font-black text-black uppercase text-[11px] font-heading">🎮 How to Play:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-semibold text-[11px]">
              <li>Move mouse / touch horizontally across the box to steer.</li>
              <li>Click or tap anywhere on the container to drop!</li>
              <li>Arrow keys [←] [→] + [Space] or [↓] work on keyboard.</li>
              <li>Match two slimes of the same level to merge into larger beasts.</li>
            </ul>
          </div>
        </div>

        {/* Center: Interactive Suika Game Canvas Container */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="relative border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_#000] bg-[#181424]">
            {/* The Main Physics Canvas */}
            <canvas
              ref={canvasRef}
              width={containerWidth}
              height={containerHeight}
              onPointerMove={handlePointerMove}
              onClick={handleDrop}
              className="cursor-crosshair block touch-none w-full max-w-[480px] h-auto"
            />

            {/* Paused Overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white space-y-4 animate-fade-in">
                <span className="text-4xl">⏸️</span>
                <h3 className="text-2xl font-black uppercase font-heading text-white">Game Paused</h3>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-3 bg-[#06D6A0] hover:bg-[#05be8d] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  Resume Playing
                </button>
              </div>
            )}

            {/* Game Over Screen Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in z-20">
                <div className="w-16 h-16 bg-[#EF4444] rounded-2xl border-3 border-black flex items-center justify-center text-3xl shadow-[4px_4px_0px_#000] animate-bounce">
                  💥
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black bg-[#FFD166] text-black px-3 py-1 rounded-full border border-black uppercase tracking-wider">
                    Container Overflow
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading mt-1">
                    Game Over!
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    The slimes piled up over the danger line!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                  <div className="p-3 bg-[#241F35] rounded-xl border-2 border-purple-700/60">
                    <p className="text-[10px] font-black uppercase text-slate-400">Final Score</p>
                    <p className="text-xl font-black text-[#FACC15] font-heading">{score}</p>
                  </div>
                  <div className="p-3 bg-[#241F35] rounded-xl border-2 border-purple-700/60">
                    <p className="text-[10px] font-black uppercase text-slate-400">Max Beast</p>
                    <p className="text-xl font-black text-[#A855F7] font-heading">Lvl {highestLevelReached}</p>
                  </div>
                </div>

                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-[#FACC15] hover:bg-[#eab308] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-2 font-heading"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            )}

            {/* QUESTION POP-OUT MODAL (Duration of 0.10s transition as explicitly instructed) */}
            {isQuestionActive && activeQuestion && (
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-30 transition-all duration-100 ease-out"
                style={{ animationDuration: "0.10s" }}
              >
                <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000] space-y-4 max-w-md w-full text-left transition-all duration-100 ease-out animate-pop-in">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-[#FF6B35] text-white px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                        ⚡ Script Pop-Out
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        4th Drop Bonus
                      </span>
                    </div>
                    <span className="text-xs font-black text-black bg-[#FFD166] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                      +150 Pts
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-[#A855F7] tracking-wider block">
                      Presentation Recall Question:
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-black mt-1 leading-snug font-heading">
                      "{activeQuestion.question}"
                    </h4>
                  </div>

                  {/* 4 Choices */}
                  <div className="space-y-2">
                    {activeQuestion.options.map((opt, oIdx) => {
                      const isSelected = selectedOption === oIdx;
                      let btnBg = "bg-white hover:bg-amber-50";
                      let btnBorder = "border-black";

                      if (questionAnswered) {
                        if (oIdx === activeQuestion.correctIndex) {
                          btnBg = "bg-[#06D6A0] text-black font-black";
                        } else if (isSelected) {
                          btnBg = "bg-[#EF4444] text-white";
                        } else {
                          btnBg = "bg-slate-100 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={questionAnswered}
                          onClick={() => handleAnswerQuestion(oIdx)}
                          className={`w-full p-3 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer flex items-start gap-2 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] ${btnBg} ${btnBorder}`}
                        >
                          <span className="w-5 h-5 rounded-md border border-black flex items-center justify-center text-[10px] font-black shrink-0 bg-white text-black">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Post-Answer Result & Resume button */}
                  {questionAnswered && (
                    <div className="p-3 bg-[#FFF9F2] rounded-xl border-2 border-black space-y-2 animate-fade-in shadow-[2px_2px_0px_#000]">
                      <div className="flex items-center gap-1.5 text-xs font-black">
                        {isCorrectAnswer ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>EXCELLENT RECALL! +150 BONUS PTS!</span>
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>KEEP PRACTICING! HERE'S THE FORMULA:</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-800 font-semibold leading-relaxed">
                        {activeQuestion.explanation}
                      </p>
                      <button
                        onClick={handleResumeAfterQuestion}
                        className="w-full py-2.5 bg-[#A855F7] hover:bg-[#9333ea] text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-1.5 font-heading"
                      >
                        <span>Resume Slime Merge</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
