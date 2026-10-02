// Geometry motion ported from Coucou for Windows' core/anim.ts.
// Source: https://github.com/Louis-CFM/coucou/blob/main/windows/src/core/anim.ts
export const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
export const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

export type EaseFn = (progress: number) => number;

export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EaseFn {
  const component = (t: number, first: number, second: number) =>
    3 * (1 - t) ** 2 * t * first + 3 * (1 - t) * t ** 2 * second + t ** 3;
  return (progress) => {
    let low = 0;
    let high = 1;
    let t = progress;
    for (let i = 0; i < 12; i++) {
      if (component(t, x1, x2) < progress) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return component(t, y1, y2);
  };
}

export const closeCurve = cubicBezier(0.45, 0, 0.2, 1);

export class Spring {
  value: number;
  target: number;
  velocity = 0;
  omega: number;
  damping: number;

  constructor(value: number, response = 0.5, damping = 0.72) {
    this.value = value;
    this.target = value;
    this.omega = (2 * Math.PI) / response;
    this.damping = damping;
  }

  configure(response: number, damping: number) {
    this.omega = (2 * Math.PI) / response;
    this.damping = damping;
  }

  set(value: number) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }

  get settled() {
    return Math.abs(this.target - this.value) < 0.01 && Math.abs(this.velocity) < 0.05;
  }

  step(dt: number) {
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const step = dt / steps;
    for (let i = 0; i < steps; i++) {
      const acceleration = this.omega * this.omega * (this.target - this.value)
        - 2 * this.damping * this.omega * this.velocity;
      this.velocity += acceleration * step;
      this.value += this.velocity * step;
    }
  }
}

/** Open with Coucou's spring; close with its 340 ms curve without overshoot. */
export class Tracked {
  private spring: Spring;
  private curveFrom = 0;
  private curveTo = 0;
  private curveStart = 0;
  private curveDuration = 0;
  private mode: "spring" | "curve" | "idle" = "idle";

  constructor(value: number) {
    this.spring = new Spring(value);
  }

  get value() {
    return this.spring.value;
  }

  get animating() {
    return this.mode !== "idle";
  }

  jump(value: number) {
    this.spring.set(value);
    this.mode = "idle";
  }

  springTo(value: number, response = 0.5, damping = 0.72) {
    this.spring.configure(response, damping);
    this.spring.target = value;
    this.mode = "spring";
  }

  curveTowards(value: number, durationMs = 340, now = performance.now()) {
    this.curveFrom = this.spring.value;
    this.curveTo = value;
    this.curveStart = now;
    this.curveDuration = durationMs;
    this.spring.target = value;
    this.spring.velocity = 0;
    this.mode = "curve";
  }

  step(dt: number, now = performance.now()) {
    if (this.mode === "spring") {
      this.spring.step(dt);
      if (this.spring.settled) {
        this.spring.value = this.spring.target;
        this.spring.velocity = 0;
        this.mode = "idle";
      }
    } else if (this.mode === "curve") {
      const progress = clamp((now - this.curveStart) / this.curveDuration, 0, 1);
      this.spring.value = lerp(this.curveFrom, this.curveTo, closeCurve(progress));
      if (progress >= 1) {
        this.spring.velocity = 0;
        this.mode = "idle";
      }
    }
  }
}
