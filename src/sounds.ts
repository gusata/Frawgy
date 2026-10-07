type SoundCue = "tap" | "ingest" | "complete" | "approval";

let enabled = false;
let level = 0.24;
let context: AudioContext | null = null;

export function setGhostySoundEnabled(value: boolean) {
  enabled = value;
  if (enabled) {
    try {
      context ??= new AudioContext();
      if (context.state === "suspended") void context.resume().catch(() => undefined);
    } catch {
      // WebAudio can be unavailable in restricted WebView environments.
    }
  }
}

export function setGhostySoundVolume(value: number) {
  level = Math.max(0, Math.min(1, value));
}

export function playGhostySound(cue: SoundCue) {
  if (!enabled || level <= 0) return;
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume().catch(() => undefined);
    const tones: Record<SoundCue, Array<{ frequency: number; delay: number; duration: number }>> = {
      tap: [{ frequency: 520, delay: 0, duration: 0.055 }],
      ingest: [{ frequency: 640, delay: 0, duration: 0.08 }, { frequency: 470, delay: 0.07, duration: 0.09 }, { frequency: 355, delay: 0.15, duration: 0.1 }],
      complete: [{ frequency: 523, delay: 0, duration: 0.09 }, { frequency: 659, delay: 0.085, duration: 0.11 }, { frequency: 784, delay: 0.17, duration: 0.14 }],
      approval: [{ frequency: 392, delay: 0, duration: 0.12 }, { frequency: 523, delay: 0.12, duration: 0.15 }],
    };
    const now = context.currentTime;
    for (const tone of tones[cue]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + tone.delay;
      const end = start + tone.duration;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(tone.frequency, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(level * 0.14, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, end);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(end + 0.01);
    }
  } catch {
    // A failed optional sound must never affect the interaction.
  }
}
