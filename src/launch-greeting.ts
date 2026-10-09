const GREETING_WIDTH = 640;
const GREETING_HEIGHT = 150;
const CARD = { x: 10, y: 36, width: 620, height: 104, radius: 20 };
const CENTER = { x: 320, y: 90 };
const DURATION = 4.6;

type WarpStreak = { xNorm: number; speed: number; length: number; thickness: number; alpha: number; startsAt: number };
type RingDot = { angle: number; jitter: number; size: number; alpha: number };

function makeParticles() {
  let seed = 7;
  const random = () => {
    seed = (Math.imul(seed, 1_103_515_245) + 12_345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const warps: WarpStreak[] = Array.from({ length: 70 }, () => ({
    xNorm: random(),
    speed: 400 + random() * 300,
    length: 6 + random() * 16,
    thickness: 1 + random() * 0.5,
    alpha: 0.25 + random() * 0.55,
    startsAt: random() * 0.35,
  }));
  const ring: RingDot[] = Array.from({ length: 90 }, () => ({
    angle: random() * Math.PI * 2,
    jitter: (random() - 0.5) * 0.22,
    size: 0.7 + random() * 0.9,
    alpha: 0.45 + random() * 0.55,
  }));
  return { warps, ring };
}

const PARTICLES = makeParticles();

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function segment(value: number, start: number, end: number) {
  return clamp((value - start) / (end - start), 0, 1);
}

function easeOut(value: number) {
  return 1 - (1 - value) ** 3;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = clamp(radius, 0, Math.min(width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/** Adapted from Coucou's MIT-licensed launch greeting particle renderer. */
export class LaunchGreeting {
  private readonly context: CanvasRenderingContext2D | null;
  private readonly pixelRatio: number;
  private frame = 0;
  private startedAt = 0;
  private complete: (() => void) | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.context = canvas.getContext("2d");
    this.pixelRatio = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = Math.round(GREETING_WIDTH * this.pixelRatio);
    canvas.height = Math.round(GREETING_HEIGHT * this.pixelRatio);
  }

  start(startedAt: number, complete: () => void) {
    this.stop();
    this.startedAt = startedAt;
    this.complete = complete;
    this.frame = requestAnimationFrame(this.draw);
  }

  stop() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.complete = null;
  }

  private readonly draw = (now: number) => {
    const ctx = this.context;
    if (!ctx) {
      const complete = this.complete;
      this.stop();
      complete?.();
      return;
    }
    const elapsed = Math.max(0, (now - this.startedAt) / 1000);
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    ctx.clearRect(0, 0, GREETING_WIDTH, GREETING_HEIGHT);

    const cardAlpha = segment(elapsed, 0.18, 0.45);
    if (cardAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = cardAlpha;
      drawRoundedRect(ctx, CARD.x, CARD.y, CARD.width, CARD.height, CARD.radius);
      ctx.fillStyle = "#141518";
      ctx.fill();
      ctx.restore();

      ctx.save();
      drawRoundedRect(ctx, CARD.x, CARD.y, CARD.width, CARD.height, CARD.radius);
      ctx.clip();
      this.drawParticles(ctx, elapsed, cardAlpha);
      ctx.restore();
    }

    if (elapsed >= DURATION) {
      const complete = this.complete;
      this.stop();
      complete?.();
      return;
    }
    this.frame = requestAnimationFrame(this.draw);
  };

  private drawParticles(ctx: CanvasRenderingContext2D, elapsed: number, cardAlpha: number) {
    if (elapsed < 0.55) {
      const reveal = segment(elapsed, 0, 0.5);
      const growth = Math.sin((Math.PI * reveal) / 2) + 0.04 * Math.sin(Math.PI * reveal) * reveal;
      const islandWidth = lerp(80, GREETING_WIDTH, growth);
      const fadeOut = 1 - segment(elapsed, 0.4, 0.55);
      ctx.lineCap = "butt";
      for (const streak of PARTICLES.warps) {
        if (elapsed < streak.startsAt) continue;
        const bottom = (elapsed - streak.startsAt) * streak.speed;
        if (bottom <= 0) continue;
        const x = GREETING_WIDTH / 2 - islandWidth / 2 + streak.xNorm * islandWidth;
        ctx.strokeStyle = `rgba(255,255,255,${streak.alpha * fadeOut})`;
        ctx.lineWidth = streak.thickness;
        ctx.beginPath();
        ctx.moveTo(x, Math.max(0, bottom - streak.length));
        ctx.lineTo(x, Math.min(GREETING_HEIGHT, bottom));
        ctx.stroke();
      }
    }

    const expansion = segment(elapsed, 0.45, 1.8);
    if (expansion <= 0 || expansion >= 1) return;
    const radiusX = lerp(14, 380, easeOut(expansion));
    const radiusY = radiusX * 0.34;
    const fade = (1 - expansion) * (expansion < 0.08 ? expansion / 0.08 : 1) * cardAlpha;
    for (const dot of PARTICLES.ring) {
      const radius = 1 + dot.jitter;
      ctx.fillStyle = `rgba(255,255,255,${dot.alpha * fade})`;
      ctx.fillRect(
        CENTER.x + Math.cos(dot.angle) * radiusX * radius,
        CENTER.y + Math.sin(dot.angle) * radiusY * radius,
        dot.size,
        dot.size,
      );
    }
  }
}
