import "./style.css";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Tracked } from "./anim";
import { PetMotionEngine, type PetState } from "./pet-motion";

type Shortcut = { id: string; name: string; glyph: string; targets: string[]; action?: "focus"; custom?: boolean };
type PocketItem = { id: string; name: string; kind: "file" | "image" | "text"; value: string; addedAt: number; truncated?: boolean };
type ClipboardEntry = { id: string; text: string; addedAt: number; pinned?: boolean };
type PetSkin = "pearl" | "smoke" | "midnight";
type PetAccessory = "none" | "star" | "bow";
type FocusState = { durationMs: number; remainingMs: number; endsAt: number; running: boolean };
type MediaInfo = { title: string; artist: string; playing: boolean };
type Edge = "left" | "top" | "bottom";
type MenuTab = "home" | "pet" | "shortcuts";
type UtilityPopupMode = "focus" | "pocket" | "customize" | "clipboard";
type UtilityPopupPosition = { x: number; y: number };
type DisplayInfo = {
  id: string;
  name: string;
  width: number;
  height: number;
  isPrimary: boolean;
};
type CursorPosition = { x: number; y: number; inside: boolean; dragging: boolean };
type LayoutUpdate = {
  edge: Edge;
  barLength: number;
  barThickness: number;
  closeDelay: number;
  allDisplays: boolean;
  selectedDisplayIds: string[];
  displayIds: string[];
  activeLabel: string;
  expanded: boolean;
};
type CodexHookEvent = {
  eventName: string;
  occurredAt: number;
  toolName: string | null;
  agentType: string | null;
  approvalId: string | null;
  approvalDescription: string | null;
  approvalExpiresAt: number | null;
};
type CodexApproval = { requestId: string; toolName: string; description: string; expiresAt: number };
type CodexApprovalDecision = "allow" | "deny";

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: "terminal", name: "Terminal", glyph: "⌘", targets: ["wt.exe"] },
  { id: "capture", name: "Captura", glyph: "⌁", targets: ["ms-screenclip:"] },
  { id: "focus", name: "Foco", glyph: "◉", targets: [], action: "focus" },
  { id: "files", name: "Arquivos", glyph: "▣", targets: ["explorer.exe"] },
];
const LAUNCHER_DEFAULTS: Shortcut[] = [
  { id: "launcher-explorer", name: "Explorador", glyph: "▣", targets: ["explorer.exe"] },
  { id: "launcher-notepad", name: "Bloco de notas", glyph: "▤", targets: ["notepad.exe"] },
  { id: "launcher-settings", name: "Configurações", glyph: "⚙", targets: ["ms-settings:"] },
  { id: "launcher-browser", name: "Pesquisar na web", glyph: "⌕", targets: ["https://www.google.com"] },
];

const KEYS = {
  length: "edge-ghosty.bar-height",
  thickness: "edge-ghosty.bar-width",
  edge: "edge-ghosty.edge",
  closeDelay: "edge-ghosty.close-delay",
  displays: "edge-ghosty.display-ids",
  allDisplays: "edge-ghosty.all-displays",
  shortcuts: "edge-ghosty.shortcuts",
  pocket: "edge-ghosty.pocket",
  clipboard: "edge-ghosty.clipboard",
  petName: "edge-ghosty.pet-name",
  petSkin: "edge-ghosty.pet-skin",
  petAccessory: "edge-ghosty.pet-accessory",
  focus: "edge-ghosty.focus",
  utilityPopup: "edge-ghosty.utility-popup",
  utilityPopupPosition: "edge-ghosty.utility-popup-position",
};
const LEGACY_KEYS = {
  length: "edge-mochi.bar-height",
  thickness: "edge-mochi.bar-width",
  edge: "edge-mochi.edge",
  closeDelay: "edge-mochi.close-delay",
  displays: "edge-mochi.display-ids",
  allDisplays: "edge-mochi.all-displays",
  shortcuts: "edge-mochi.shortcuts",
  pocket: "edge-mochi.pocket",
  clipboard: "edge-mochi.clipboard",
  petName: "edge-mochi.pet-name",
  petSkin: "edge-mochi.pet-skin",
  petAccessory: "edge-mochi.pet-accessory",
  focus: "edge-mochi.focus",
  utilityPopup: "edge-mochi.utility-popup",
  utilityPopupPosition: "edge-mochi.utility-popup-position",
};
for (const name of Object.keys(KEYS) as Array<keyof typeof KEYS>) {
  const legacyValue = localStorage.getItem(LEGACY_KEYS[name]);
  if (localStorage.getItem(KEYS[name]) === null && legacyValue !== null) {
    localStorage.setItem(KEYS[name], name === "petName" && legacyValue === "Mochi" ? "Ghosty" : legacyValue);
  }
}
if (localStorage.getItem(KEYS.petName) === "Mochi") localStorage.setItem(KEYS.petName, "Ghosty");
const DEFAULTS = {
  length: 80,
  thickness: 10,
  edge: "left" as Edge,
  closeDelay: 200,
};
const MIN_LENGTH = 48;
const MAX_LENGTH = 240;
const LENGTH_STEP = 2;
const MIN_THICKNESS = 6;
const MAX_THICKNESS = 18;
const MIN_CLOSE_DELAY = 0;
const MAX_CLOSE_DELAY = 900;
const EAR_RADIUS = 14;
const MAX_SAVED_TEXT = 50_000;

function readNumber(key: string, fallback: number, min: number, max: number, step = 1) {
  const stored = localStorage.getItem(key);
  if (stored === null) return fallback;
  const parsed = Number(stored);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed / step) * step));
}

function readEdge(): Edge {
  const stored = localStorage.getItem(KEYS.edge);
  return stored === "top" || stored === "bottom" ? stored : "left";
}

function readDisplayIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEYS.displays) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

let volume = 62;
let expanded = false;
let settingsOpen = false;
let activeTab: MenuTab = "home";
let utilityPopupMode: UtilityPopupMode | null = null;
let utilityPopupBlurTimer: number | undefined;
let utilityPopupPositionSaveTimer: number | undefined;
let latestUtilityPopupPosition: UtilityPopupPosition | null = null;
let barLength = readNumber(KEYS.length, DEFAULTS.length, MIN_LENGTH, MAX_LENGTH, LENGTH_STEP);
let barThickness = readNumber(KEYS.thickness, DEFAULTS.thickness, MIN_THICKNESS, MAX_THICKNESS);
let edge = readEdge();
let closeDelay = readNumber(KEYS.closeDelay, DEFAULTS.closeDelay, MIN_CLOSE_DELAY, MAX_CLOSE_DELAY, 50);
let allDisplays = localStorage.getItem(KEYS.allDisplays) === "true";
let selectedDisplayIds = readDisplayIds();
let displays: DisplayInfo[] = [];
let draggedId = "";
let shortcuts = readShortcuts();
let pocketItems = readPocketItems();
let clipboardEntries = readClipboardEntries();
let petName = localStorage.getItem(KEYS.petName) || "Ghosty";
let petSkin: PetSkin = readChoice(KEYS.petSkin, ["pearl", "smoke", "midnight"], "pearl");
let petAccessory: PetAccessory = readChoice(KEYS.petAccessory, ["none", "star", "bow"], "none");
let focusState = readFocusState();
let mediaInfo: MediaInfo = { title: "", artist: "", playing: false };
let codexHooksEnabled = false;
let codexHooksBusy = true;
let codexHooksStatusMessage = "Verificando a configuração do Codex…";
let codexPollPending = false;
let latestCodexPetState: { state: PetState; detail: string; occurredAt: number } | null = null;
let codexTaskRunning = false;
let taskCompletionTimer: number | undefined;
let pendingCodexApprovals: CodexApproval[] = [];
let codexApprovalSubmitting = false;
let codexApprovalError = "";
let codexApprovalPresentationKey = "";
const codexApprovalExpiryTimers = new Map<string, number>();
let approvalHitBoundsInterval: number | undefined;
let approvalHitBoundsStopTimer: number | undefined;
let petMoodOverride = "";
let petMoodUntil = 0;
let pocketDropActive = false;
let nativeDragScale = 1;
let pocketNotice = "Solte arquivos ou texto para guardar";
let petDropFeedback = "";
let petDropFeedbackTimer: number | undefined;
let clipboardNotice = "";
let pendingPocketValues = new Set<string>();
let hoverCloseTimer: number | undefined;
let geometryFrame = 0;
let petLoveTimer: number | undefined;
let lastPetLove = 0;
let hasGreetedPet = false;
const petMotionEngines = new WeakMap<HTMLElement, PetMotionEngine>();
let geometryMotion: {
  body: HTMLElement;
  width: Tracked;
  height: Tracked;
  radius: Tracked;
} | undefined;
let lastPublishedBody: HTMLElement | undefined;
let lastPublishedRect: { x: number; y: number; width: number; height: number } | undefined;
let rectPublishAttempt = 0;
let wasPointerInNativeIsland = false;

const app = document.querySelector<HTMLDivElement>("#app")!;

function readJson<T>(key: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    return parsed === null ? fallback : parsed as T;
  } catch {
    return fallback;
  }
}

function readPocketItems(): PocketItem[] {
  const items = readJson<unknown>(KEYS.pocket, []);
  return Array.isArray(items) ? items.filter((item): item is PocketItem => {
    if (!item || typeof item !== "object") return false;
    const value = item as Record<string, unknown>;
    return typeof value.id === "string" && typeof value.name === "string" && typeof value.value === "string"
      && (value.kind === "file" || value.kind === "image" || value.kind === "text");
  }).slice(0, 8) : [];
}

function readClipboardEntries(): ClipboardEntry[] {
  const items = readJson<unknown>(KEYS.clipboard, []);
  return Array.isArray(items) ? items.filter((item): item is ClipboardEntry => {
    if (!item || typeof item !== "object") return false;
    const value = item as Record<string, unknown>;
    return typeof value.id === "string" && typeof value.text === "string" && typeof value.addedAt === "number";
  }).slice(0, 12) : [];
}

function readFocusState(): FocusState {
  const fallback = { durationMs: 25 * 60_000, remainingMs: 25 * 60_000, endsAt: 0, running: false };
  const value = readJson<Partial<FocusState>>(KEYS.focus, fallback);
  if (typeof value.durationMs !== "number" || !Number.isFinite(value.durationMs)
    || typeof value.remainingMs !== "number" || !Number.isFinite(value.remainingMs)
    || typeof value.endsAt !== "number" || !Number.isFinite(value.endsAt)
    || typeof value.running !== "boolean") return fallback;
  return {
    durationMs: Math.max(60_000, Math.min(180 * 60_000, value.durationMs!)),
    remainingMs: Math.max(0, Math.min(180 * 60_000, value.remainingMs!)),
    endsAt: value.endsAt!,
    running: value.running,
  };
}

function readChoice<T extends string>(key: string, choices: readonly T[], fallback: T): T {
  const value = localStorage.getItem(key);
  return choices.includes(value as T) ? value as T : fallback;
}

function readShortcuts(): Shortcut[] {
  const saved = readJson<Shortcut[]>(KEYS.shortcuts, []);
  const custom = Array.isArray(saved) ? saved.filter((item) => item && item.custom && typeof item.id === "string"
    && typeof item.name === "string" && typeof item.glyph === "string"
    && Array.isArray(item.targets) && item.targets.every((target) => typeof target === "string")) : [];
  const available = [...DEFAULT_SHORTCUTS, ...custom];
  const order = Array.isArray(saved) ? saved.map((item) => item?.id).filter((id): id is string => typeof id === "string") : [];
  const ordered = order.map((id) => available.find((item) => item.id === id)).filter((item): item is Shortcut => !!item);
  return [...ordered, ...available.filter((item) => !order.includes(item.id))];
}

function persistShortcuts() {
  localStorage.setItem(KEYS.shortcuts, JSON.stringify(shortcuts));
}

function focusRemainingMs() {
  return focusState.running ? Math.max(0, focusState.endsAt - Date.now()) : Math.max(0, focusState.remainingMs);
}

function persistFocus() {
  focusState.remainingMs = focusRemainingMs();
  localStorage.setItem(KEYS.focus, JSON.stringify(focusState));
}

function getPetMood() {
  if (Date.now() < petMoodUntil && petMoodOverride) return petMoodOverride;
  if (focusState.running) return "focused";
  const held = pocketItems[0];
  if (held) return held.kind === "image" ? "holding-image" : held.kind === "file" ? "holding-file" : "holding-text";
  return "calm";
}

function petMoodLabel(mood = getPetMood()) {
  const labels: Record<string, string> = {
    calm: "de boa", focused: "em foco", chewing: "nhac nhac…", happy: "feliz", annoyed: "emburrado",
    dizzy: "tontinho", "holding-file": "guardando um arquivo", "holding-image": "guardando uma imagem", "holding-text": "guardando uma ideia",
  };
  return labels[mood] ?? "de boa";
}

function updatePetAtmosphere() {
  const mood = getPetMood();
  const item = pocketItems[0];
  app.querySelectorAll<HTMLElement>(".pet-page, .pet-profile").forEach((element) => {
    element.dataset.mood = mood;
    element.dataset.itemType = item?.kind ?? "none";
  });
  app.querySelectorAll<HTMLElement>(".pet").forEach((pet) => {
    pet.dataset.skin = petSkin;
    pet.dataset.accessory = petAccessory;
    pet.dataset.mood = mood;
    petMotionEngines.get(pet)?.setAppearance(petSkin, petAccessory, mood);
  });
  app.querySelectorAll<HTMLElement>(".pet-mood-label, .home-pet-copy small").forEach((label) => {
    label.textContent = petMoodLabel(mood);
  });
}

function radiusString(radius: number) {
  if (edge === "top") return `0 0 ${radius}px ${radius}px`;
  if (edge === "bottom") return `${radius}px ${radius}px 0 0`;
  return `0 ${radius}px ${radius}px 0`;
}

function currentRadius(style: CSSStyleDeclaration) {
  const value = edge === "top"
    ? style.borderBottomLeftRadius
    : edge === "bottom"
      ? style.borderTopLeftRadius
      : style.borderTopRightRadius;
  return Number.parseFloat(value) || 4;
}

function setBodyGeometry(body: HTMLElement, width: number, height: number, radius: number) {
  body.style.width = `${width}px`;
  body.style.height = `${height}px`;
  body.style.borderRadius = radiusString(radius);
  const island = body.closest<HTMLElement>(".edge-island");
  const earSpan = edge === "left" ? height : width;
  island?.style.setProperty("--bar-ear-offset", `${earSpan / 2 + EAR_RADIUS}px`);
  publishNativeHitBounds(body);
}

function publishNativeHitBounds(body: HTMLElement) {
  const rects = [body.getBoundingClientRect()];
  const island = body.closest<HTMLElement>(".edge-island");
  const approvalToast = island?.querySelector<HTMLElement>(".ghosty-completion");
  if (!expanded && pendingCodexApprovals.length > 0 && approvalToast?.getAttribute("aria-hidden") === "false") {
    rects.push(approvalToast.getBoundingClientRect());
  }
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  if (lastPublishedBody !== body) {
    lastPublishedBody = body;
    lastPublishedRect = undefined;
  }
  const next = { x: left, y: top, width: right - left, height: bottom - top };
  if (lastPublishedRect && Math.abs(next.x - lastPublishedRect.x) < 0.5
    && Math.abs(next.y - lastPublishedRect.y) < 0.5
    && Math.abs(next.width - lastPublishedRect.width) < 0.5
    && Math.abs(next.height - lastPublishedRect.height) < 0.5) return;
  lastPublishedRect = next;
  const attempt = ++rectPublishAttempt;
  void invoke("set_island_rect", next).catch(() => {
    if (attempt !== rectPublishAttempt || lastPublishedBody !== body || !body.isConnected) return;
    lastPublishedRect = undefined;
    window.setTimeout(() => {
      if (lastPublishedBody === body && body.isConnected) publishNativeHitBounds(body);
    }, 100);
  });
}

function stopApprovalHitBoundsTracking() {
  if (approvalHitBoundsInterval !== undefined) window.clearInterval(approvalHitBoundsInterval);
  if (approvalHitBoundsStopTimer !== undefined) window.clearTimeout(approvalHitBoundsStopTimer);
  approvalHitBoundsInterval = undefined;
  approvalHitBoundsStopTimer = undefined;
}

function refreshApprovalHitBounds() {
  stopApprovalHitBoundsTracking();
  const body = app.querySelector<HTMLElement>(".island-body");
  if (!body) return;
  publishNativeHitBounds(body);
  if (expanded || pendingCodexApprovals.length === 0) return;
  approvalHitBoundsInterval = window.setInterval(() => {
    if (expanded || pendingCodexApprovals.length === 0 || !body.isConnected) {
      stopApprovalHitBoundsTracking();
      if (body.isConnected) publishNativeHitBounds(body);
      return;
    }
    publishNativeHitBounds(body);
  }, 50);
  approvalHitBoundsStopTimer = window.setTimeout(() => {
    stopApprovalHitBoundsTracking();
    if (body.isConnected) publishNativeHitBounds(body);
  }, 3600);
}

function freezeIslandGeometry(island: HTMLElement) {
  const body = island.querySelector<HTMLElement>(".island-body");
  if (!body) return;
  ++geometryFrame;
  const style = getComputedStyle(body);
  if (geometryMotion?.body !== body) {
    const rect = body.getBoundingClientRect();
    geometryMotion = {
      body,
      width: new Tracked(rect.width),
      height: new Tracked(rect.height),
      radius: new Tracked(currentRadius(style)),
    };
  }
  setBodyGeometry(body, geometryMotion.width.value, geometryMotion.height.value, geometryMotion.radius.value);
}

function animateIsland(open: boolean) {
  const body = app.querySelector<HTMLElement>(".island-body");
  if (!body) return;

  const current = geometryMotion?.body === body ? geometryMotion : undefined;
  const style = getComputedStyle(body);
  const rect = body.getBoundingClientRect();
  const motion = current ?? {
    body,
    width: new Tracked(rect.width),
    height: new Tracked(rect.height),
    radius: new Tracked(currentRadius(style)),
  };
  const target = edge === "left"
    ? {
      width: open ? 360 : barThickness,
      height: open ? Math.min(650, Math.max(220, window.innerHeight - 64)) : barLength,
      radius: open ? 22 : 4,
    }
    : {
      width: open ? Math.min(760, Math.max(220, window.innerWidth - 64)) : barLength,
      height: open ? 280 : barThickness,
      radius: open ? 22 : 4,
    };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const token = ++geometryFrame;
  geometryMotion = motion;
  const now = performance.now();

  if (reducedMotion) {
    motion.width.jump(target.width);
    motion.height.jump(target.height);
    motion.radius.jump(target.radius);
    setBodyGeometry(body, target.width, target.height, target.radius);
    return;
  }

  if (open) {
    motion.width.springTo(target.width);
    motion.height.springTo(target.height);
    motion.radius.springTo(target.radius);
  } else {
    motion.width.curveTowards(target.width, 340, now);
    motion.height.curveTowards(target.height, 340, now);
    motion.radius.curveTowards(target.radius, 340, now);
  }
  let previous = now;
  const frame = (now: number) => {
    if (token !== geometryFrame || motion.body !== body) return;
    const dt = Math.min(0.05, (now - previous) / 1000);
    previous = now;
    motion.width.step(dt, now);
    motion.height.step(dt, now);
    motion.radius.step(dt, now);
    setBodyGeometry(body, motion.width.value, motion.height.value, motion.radius.value);
    if (motion.width.animating || motion.height.animating || motion.radius.animating) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  })[character]!);
}

function getSelectedDisplayIds() {
  if (allDisplays) return displays.map((display) => display.id);
  const availableIds = new Set(displays.map((display) => display.id));
  const filtered = selectedDisplayIds.filter((id) => availableIds.has(id));
  if (filtered.length > 0) return filtered;
  return displays.find((display) => display.isPrimary)?.id
    ? [displays.find((display) => display.isPrimary)!.id]
    : displays.slice(0, 1).map((display) => display.id);
}

function persistSettings() {
  localStorage.setItem(KEYS.length, String(barLength));
  localStorage.setItem(KEYS.thickness, String(barThickness));
  localStorage.setItem(KEYS.edge, edge);
  localStorage.setItem(KEYS.closeDelay, String(closeDelay));
  localStorage.setItem(KEYS.displays, JSON.stringify(selectedDisplayIds));
  localStorage.setItem(KEYS.allDisplays, String(allDisplays));
}

function applyIslandVariables(island: HTMLElement) {
  island.dataset.edge = edge;
  island.style.setProperty("--bar-length", `${barLength}px`);
  island.style.setProperty("--bar-thickness", `${barThickness}px`);
  const body = island.querySelector<HTMLElement>(".island-body");
  const bodyRect = body?.getBoundingClientRect();
  const earSpan = edge === "left" ? bodyRect?.height : bodyRect?.width;
  island.style.setProperty("--bar-ear-offset", `${(earSpan || barLength) / 2 + EAR_RADIUS}px`);
}

function applyDisplayLayout(isExpanded = expanded) {
  if (displays.length === 0) return Promise.resolve();
  const ids = getSelectedDisplayIds();
  return invoke("apply_display_layout", {
    edge,
    barLength,
    barThickness,
    displayIds: ids,
    selectedDisplayIds,
    allDisplays,
    closeDelay,
    expanded: isExpanded,
  }).catch(() => undefined);
}

function makeId() {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type MenuIconName = "brand" | "home" | "pet" | "shortcuts" | "settings" | "close" | "pocket" | "clipboard" | "search" | "chevron" | "back" | "refresh" | "volume" | "previous" | "play" | "pause" | "next" | "plus" | "file" | "image" | "text";

function menuIcon(name: MenuIconName) {
  const paths: Record<MenuIconName, string> = {
    brand: '<path d="M12 2.7 13.7 9l6.3 3-6.3 3-1.7 6.3L10.3 15 4 12l6.3-3L12 2.7Z"/><path d="M19 3v4M17 5h4M4 17v4M2 19h4"/>',
    home: '<path d="m3.5 10 8.5-7 8.5 7v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9Z"/><path d="M9 20v-6h6v6"/>',
    pet: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1" fill="currentColor" stroke="none"/>',
    shortcuts: '<rect x="4" y="4" width="6" height="6" rx="1.4"/><rect x="14" y="4" width="6" height="6" rx="1.4"/><rect x="4" y="14" width="6" height="6" rx="1.4"/><rect x="14" y="14" width="6" height="6" rx="1.4"/>',
    settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    pocket: '<path d="M3 7.5h7l2 2h9v8.7a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 18.2V7.5Z"/><path d="M3 10h18"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h3"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6.8L20 12M4 12l2 5.2A7 7 0 0 0 18.4 15"/>',
    volume: '<path d="M4 10v4h4l5 4V6l-5 4H4Z"/><path d="M17 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/>',
    previous: '<path d="M6 5v14M19 6l-9 6 9 6V6Z"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    next: '<path d="M18 5v14M5 6l9 6-9 6V6Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8 13h8M8 17h8"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 16-5-5L5 20"/>',
    text: '<path d="M5 5h14M5 10h14M5 15h9M5 20h12"/>',
  };
  return `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

function renderPetCharacter(className = "") {
  return `
    <button class="pet ${className}" data-skin="${petSkin}" data-accessory="${petAccessory}" data-mood="${getPetMood()}" type="button" aria-label="${escapeHtml(petName)}">
      <canvas class="pet-canvas" aria-hidden="true"></canvas>
      <span class="pet-activity-tooltip" role="status" aria-live="polite" aria-hidden="true"></span>
    </button>`;
}

function renderPocketItems(limit = 8) {
 if (pocketItems.length === 0) return `<div class="pocket-empty"><span>${menuIcon("pocket")}</span><small>${escapeHtml(pocketNotice)}</small></div>`;
 return pocketItems.slice(0, limit).map((item) => `
   <article class="pocket-item" data-pocket-kind="${item.kind}">
      <span class="pocket-item-icon">${menuIcon(item.kind === "image" ? "image" : item.kind === "text" ? "text" : "file")}</span>
      <span class="pocket-item-copy"><strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong><small>${item.kind === "text" ? item.truncated ? "primeiros 50 mil caracteres" : "texto guardado" : "o original continua no lugar"}</small></span>
      <button class="mini-icon" data-action="open-pocket" data-pocket-id="${escapeHtml(item.id)}" aria-label="Abrir ${escapeHtml(item.name)}" title="Abrir">↗</button>
      <button class="mini-icon" data-action="remove-pocket" data-pocket-id="${escapeHtml(item.id)}" aria-label="Tirar ${escapeHtml(item.name)} do bolso" title="Tirar do bolso">×</button>
    </article>`).join("");
}

function renderClipboardEntries(limit = 4) {
  if (clipboardEntries.length === 0) return '<small class="empty-copy">Sua área de transferência guardada aparece aqui.</small>';
  const sorted = [...clipboardEntries].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.addedAt - a.addedAt);
  return sorted.slice(0, limit).map((entry) => `
    <div class="clipboard-row">
      <button class="clipboard-entry" data-action="copy-clipboard" data-clipboard-id="${escapeHtml(entry.id)}" title="Copiar novamente"><span>¶</span><small>${escapeHtml(entry.text.replace(/\s+/g, " ").slice(0, 150))}</small></button>
      <button class="clipboard-pin ${entry.pinned ? "is-pinned" : ""}" data-action="toggle-clipboard-pin" data-clipboard-id="${escapeHtml(entry.id)}" aria-label="${entry.pinned ? "Desafixar" : "Fixar"}" title="${entry.pinned ? "Desafixar" : "Fixar"}">⌖</button>
      <button class="clipboard-pin clipboard-remove" data-action="remove-clipboard" data-clipboard-id="${escapeHtml(entry.id)}" aria-label="Remover da prancheta" title="Remover">×</button>
    </div>`).join("");
}

function renderLauncherItems(quickLimit?: number) {
  const items = [...LAUNCHER_DEFAULTS, ...shortcuts.filter((shortcut) => !shortcut.action)];
  return items.map((item, index) => `
    <button class="launch-item ${quickLimit !== undefined && index >= quickLimit ? "home-launch-extra" : ""}" data-action="launch-item" data-launch-id="${escapeHtml(item.id)}" data-launch-name="${escapeHtml(item.name.toLowerCase())}">
      <span>${escapeHtml(item.glyph)}</span><small>${escapeHtml(item.name)}</small>
    </button>`).join("");
}

function formatDuration(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function renderHomeShortcutItems(limit = 3) {
  return shortcuts.slice(0, limit).map((shortcut) => `
    <button class="home-shortcut" data-action="run-shortcut" data-shortcut-id="${escapeHtml(shortcut.id)}" title="${escapeHtml(shortcut.name)}">
      <span class="home-shortcut-icon">${escapeHtml(shortcut.glyph)}</span><span class="home-shortcut-name">${escapeHtml(shortcut.name)}</span>
    </button>`).join("");
}

function renderHomePage() {
  return `
    <div class="home-grid">
      <section class="home-context-card">
        <div class="home-message">
          ${renderPetCharacter("pet-home")}
          <div class="home-message-copy">
            <span class="section-kicker">EDGE GHOSTY</span>
            <strong>Tudo tranquilo por aqui.</strong>
            <small>Música, volume e atalhos sempre à mão.</small>
          </div>
        </div>
        <section class="quick-audio">
          <span class="section-kicker home-audio-label">TOCANDO AGORA</span>
          <div class="audio-now">
            <div class="media-copy"><strong class="media-title">${escapeHtml(mediaInfo.title || "Nada tocando agora")}</strong><small class="media-artist">${escapeHtml(mediaInfo.artist || "Quando algo tocar, aparece aqui")}</small></div>
            <div class="media-controls">
              <button data-action="media-previous" aria-label="Faixa anterior" title="Anterior">${menuIcon("previous")}</button>
              <button class="media-play" data-action="media-toggle" aria-label="Reproduzir ou pausar" title="Reproduzir ou pausar"><span class="media-play-icon">${menuIcon(mediaInfo.playing ? "pause" : "play")}</span></button>
              <button data-action="media-next" aria-label="Próxima faixa" title="Próxima">${menuIcon("next")}</button>
            </div>
          </div>
          <label class="volume-control"><span class="volume-icon">${menuIcon("volume")}</span><span class="volume-label">Volume</span><input id="volume" type="range" min="0" max="100" value="${volume}" aria-label="Volume do sistema" /><output id="volume-value">${volume}%</output></label>
        </section>
        <section class="home-shortcuts">
          <span class="section-kicker">ATALHOS</span>
          <div class="home-shortcut-items">${renderHomeShortcutItems(3)}</div>
        </section>
      </section>
    </div>`;
}

function renderPetPage() {
  const mood = getPetMood();
  const held = pocketItems[0];
  return `
    <div class="pet-page" data-mood="${mood}" data-item-type="${held?.kind ?? "none"}">
      <div class="pet-stage ${pocketDropActive ? "is-dragging" : ""} ${petDropFeedback ? "has-drop-feedback" : ""}" data-dropzone="pocket">
        ${renderPetCharacter("pet-large")}
        <span class="pet-name">${escapeHtml(petName)}</span>
        <strong class="pet-drop-prompt" aria-live="polite">${pocketDropActive ? "Pode soltar, eu pego!" : escapeHtml(petDropFeedback)}</strong>
     <div class="pet-tools" aria-label="Ações do Ghosty">
          <button class="pet-tool" data-action="open-utility-popup" data-popup="pocket" aria-label="Abrir bolso do Ghosty" title="Bolso">${menuIcon("pocket")}</button>
          <button class="pet-tool" data-action="open-utility-popup" data-popup="customize" aria-label="Personalizar Ghosty" title="Personalizar">${menuIcon("settings")}</button>
        </div>
      </div>
    </div>`;
}

function readUtilityPopupMode(): UtilityPopupMode | null {
  const mode = localStorage.getItem(KEYS.utilityPopup);
  return mode === "focus" || mode === "pocket" || mode === "customize" || mode === "clipboard" ? mode : null;
}

function readUtilityPopupPosition(): UtilityPopupPosition | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEYS.utilityPopupPosition) ?? "null");
    if (typeof value !== "object" || value === null) return null;
    const position = value as Partial<UtilityPopupPosition>;
    if (typeof position.x !== "number" || !Number.isFinite(position.x)
      || typeof position.y !== "number" || !Number.isFinite(position.y)) return null;
    return { x: Math.round(position.x), y: Math.round(position.y) };
  } catch {
    return null;
  }
}

function flushUtilityPopupPosition() {
  if (utilityPopupPositionSaveTimer !== undefined) {
    window.clearTimeout(utilityPopupPositionSaveTimer);
    utilityPopupPositionSaveTimer = undefined;
  }
  if (latestUtilityPopupPosition) {
    localStorage.setItem(KEYS.utilityPopupPosition, JSON.stringify(latestUtilityPopupPosition));
  }
}

function renderUtilityPopupContent(mode: UtilityPopupMode) {
  if (mode === "focus") {
    const remaining = focusRemainingMs();
    const progress = focusState.durationMs > 0 ? 100 - remaining / focusState.durationMs * 100 : 0;
    return `
      <section class="utility-focus">
        <div class="utility-focus-intro"><span class="section-kicker">TEMPO DE FOCO</span><strong>Um passo de cada vez.</strong><small>O Ghosty acompanha seu ciclo com você.</small></div>
        <div class="utility-focus-clock" id="focus-countdown">${formatDuration(remaining)}</div>
        <div class="focus-progress utility-focus-progress"><i id="focus-progress" style="--progress:${progress}%"></i></div>
        <div class="utility-focus-controls">
          <label class="utility-focus-duration"><input id="focus-minutes" type="number" min="1" max="180" value="${Math.max(1, Math.round(focusState.durationMs / 60_000))}" ${focusState.running ? "disabled" : ""} aria-label="Duração do foco em minutos" /> minutos</label>
          <div><button class="utility-primary-action" data-action="focus-toggle">${focusState.running ? "Pausar" : remaining === 0 ? "Recomeçar" : "Iniciar foco"}</button><button class="utility-secondary-action" data-action="focus-reset" aria-label="Reiniciar temporizador" title="Reiniciar">↺</button></div>
        </div>
        <small class="focus-status utility-focus-status" id="focus-status"></small>
      </section>`;
  }
  if (mode === "pocket") {
    return `
      <section class="utility-pocket">
        <div class="pocket-dropzone ${pocketDropActive ? "is-dragging" : ""}" data-dropzone="pocket"><span>↓</span><strong>${pocketDropActive ? "Pode soltar, eu pego!" : "Solte um arquivo ou texto"}</strong><small>O original continua no lugar.</small></div>
        <small class="pocket-status">${escapeHtml(pocketNotice)}</small>
        <div class="pocket-items">${renderPocketItems()}</div>
        <button class="secondary-action" data-action="pocket-clipboard">${menuIcon("plus")} Guardar texto copiado</button>
      </section>`;
  }
  if (mode === "customize") {
    return `
      <section class="utility-customize">
        <form class="pet-name-form" data-action="pet-name-form"><input name="pet-name" value="${escapeHtml(petName)}" maxlength="24" aria-label="Nome do pet" /><button class="secondary-action">Salvar nome</button></form>
        <label class="custom-label" for="pet-skin">Aparência</label>
        <select id="pet-skin"><option value="pearl" ${petSkin === "pearl" ? "selected" : ""}>Pérola</option><option value="smoke" ${petSkin === "smoke" ? "selected" : ""}>Fumaça</option><option value="midnight" ${petSkin === "midnight" ? "selected" : ""}>Meia-noite</option></select>
        <label class="custom-label" for="pet-accessory">Acessório</label>
        <select id="pet-accessory"><option value="none" ${petAccessory === "none" ? "selected" : ""}>Sem acessório</option><option value="star" ${petAccessory === "star" ? "selected" : ""}>Estrelinha</option><option value="bow" ${petAccessory === "bow" ? "selected" : ""}>Laço</option></select>
      </section>`;
  }
  return `
    <section class="utility-clipboard">
      <div class="clipboard-list">${renderClipboardEntries(12)}</div>
      <small class="clipboard-status">${escapeHtml(clipboardNotice)}</small>
      <button class="secondary-action clipboard-capture" data-action="clipboard-capture">${menuIcon("plus")} Capturar texto</button>
    </section>`;
}

function renderUtilityPopup() {
  utilityPopupMode = readUtilityPopupMode();
  if (!utilityPopupMode) {
    app.innerHTML = "";
    return;
  }
  const copy: Record<UtilityPopupMode, { title: string; subtitle: string }> = {
    focus: { title: "Foco", subtitle: "Seu tempo, no seu ritmo" },
    pocket: { title: `Bolso do ${petName}`, subtitle: `${pocketItems.length}/8 itens · os originais ficam no lugar` },
    customize: { title: "Personalizar o Ghosty", subtitle: "Nome, aparência e acessório" },
    clipboard: { title: "Prancheta", subtitle: `${clipboardEntries.length} itens recentes` },
  };
  const heading = copy[utilityPopupMode];
  app.innerHTML = `
    <main class="utility-popup-window" data-popup="${utilityPopupMode}">
      <section class="utility-popup-card">
        <header class="utility-popup-header">
          <div class="utility-popup-drag-handle"><span class="section-kicker">EDGE GHOSTY</span><strong>${escapeHtml(heading.title)}</strong><small data-popup-subtitle>${escapeHtml(heading.subtitle)}</small></div>
          <button class="utility-popup-close" data-action="popup-close" aria-label="Fechar popup" title="Fechar">${menuIcon("close")}</button>
        </header>
        <div class="utility-popup-body">${renderUtilityPopupContent(utilityPopupMode)}</div>
      </section>
    </main>`;
  bindUtilityPopup();
  if (utilityPopupMode === "focus") paintFocusTimer();
}

function bindUtilityPopup() {
  const popup = app.querySelector<HTMLElement>(".utility-popup-window");
  if (!popup) return;
  popup.querySelector("[data-action=popup-close]")?.addEventListener("click", () => void closeUtilityPopup());
  popup.querySelector<HTMLElement>(".utility-popup-drag-handle")?.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    void getCurrentWindow().startDragging().catch((error) => console.error("NÃ£o consegui mover o popup", error));
  });
  if (utilityPopupMode === "focus") {
    popup.querySelector("[data-action=focus-toggle]")?.addEventListener("click", startFocus);
    popup.querySelector("[data-action=focus-reset]")?.addEventListener("click", resetFocus);
    popup.querySelector<HTMLInputElement>("#focus-minutes")?.addEventListener("change", (event) => {
      if (focusState.running) return;
      focusState.durationMs = Math.max(1, Math.min(180, Number((event.target as HTMLInputElement).value) || 25)) * 60_000;
      focusState.remainingMs = focusState.durationMs;
      persistFocus();
      paintFocusTimer();
    });
  }
  if (utilityPopupMode === "pocket") {
    popup.querySelectorAll<HTMLElement>("[data-dropzone=pocket]").forEach(bindPocketDropzone);
    popup.querySelectorAll<HTMLButtonElement>("[data-action=pocket-clipboard]").forEach((button) => button.addEventListener("click", () => void captureClipboardText(true)));
    bindPocketItemActions(popup);
  }
  if (utilityPopupMode === "clipboard") {
    popup.querySelector("[data-action=clipboard-capture]")?.addEventListener("click", () => void captureClipboardText());
    bindClipboardEntryActions(popup);
  }
  if (utilityPopupMode === "customize") {
    popup.querySelector<HTMLFormElement>("[data-action=pet-name-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget as HTMLFormElement;
      const input = form.elements.namedItem("pet-name") as HTMLInputElement;
      petName = input.value.trim().slice(0, 24) || "Ghosty";
      localStorage.setItem(KEYS.petName, petName);
      updatePetAtmosphere();
      renderUtilityPopup();
    });
    popup.querySelector<HTMLSelectElement>("#pet-skin")?.addEventListener("change", (event) => {
      petSkin = (event.target as HTMLSelectElement).value as PetSkin;
      localStorage.setItem(KEYS.petSkin, petSkin);
      updatePetAtmosphere();
    });
    popup.querySelector<HTMLSelectElement>("#pet-accessory")?.addEventListener("change", (event) => {
      petAccessory = (event.target as HTMLSelectElement).value as PetAccessory;
      localStorage.setItem(KEYS.petAccessory, petAccessory);
      updatePetAtmosphere();
    });
  }
}

async function openUtilityPopup(mode: UtilityPopupMode) {
  localStorage.setItem(KEYS.utilityPopup, mode);
  try {
    const position = readUtilityPopupPosition();
    await invoke("show_utility_popup", {
      positionX: position?.x ?? null,
      positionY: position?.y ?? null,
    });
  } catch (error) {
    console.error("NÃ£o consegui abrir o popup do Edge Ghosty", error);
  }
}

async function closeUtilityPopup() {
  flushUtilityPopupPosition();
  utilityPopupMode = null;
  localStorage.removeItem(KEYS.utilityPopup);
  renderUtilityPopup();
  await getCurrentWindow().hide().catch(() => undefined);
}

function startUtilityPopupWindow() {
  renderUtilityPopup();
  const currentWindow = getCurrentWindow();
  void currentWindow.onMoved(({ payload }) => {
    latestUtilityPopupPosition = { x: payload.x, y: payload.y };
    if (utilityPopupPositionSaveTimer !== undefined) window.clearTimeout(utilityPopupPositionSaveTimer);
    utilityPopupPositionSaveTimer = window.setTimeout(flushUtilityPopupPosition, 160);
  });
  void currentWindow.onFocusChanged(({ payload: focused }) => {
    if (focused) {
      if (utilityPopupBlurTimer !== undefined) window.clearTimeout(utilityPopupBlurTimer);
      utilityPopupBlurTimer = undefined;
      return;
    }
    if (utilityPopupBlurTimer !== undefined) window.clearTimeout(utilityPopupBlurTimer);
    utilityPopupBlurTimer = window.setTimeout(() => {
      utilityPopupBlurTimer = undefined;
      void currentWindow.isFocused().then((stillFocused) => {
        if (!stillFocused && utilityPopupMode) void closeUtilityPopup();
      }).catch(() => undefined);
    }, 160);
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && utilityPopupMode) void closeUtilityPopup();
  });
  void bindNativeFileDrop();
}

function renderShortcuts() {
  return shortcuts.map((shortcut) => `
    <article class="shortcut-item" draggable="true" data-shortcut-id="${escapeHtml(shortcut.id)}">
      <button class="shortcut" data-action="run-shortcut" data-shortcut-id="${escapeHtml(shortcut.id)}"><span>${escapeHtml(shortcut.glyph)}</span><small>${escapeHtml(shortcut.name)}</small></button>
      ${shortcut.custom ? `<button class="shortcut-remove" data-action="remove-shortcut" data-shortcut-id="${escapeHtml(shortcut.id)}" aria-label="Remover ${escapeHtml(shortcut.name)}">×</button>` : ""}
    </article>`).join("");
}

function renderShortcutsPage() {
  return `
    <div class="shortcuts-page">
      <section class="shortcuts-context-card">
        <div class="shortcuts-intro">
          <div class="shortcuts-message">
            <div class="page-heading"><span>Atalhos</span><small>Seus destinos favoritos</small></div>
            <button class="secondary-action add-action-toggle" data-action="toggle-shortcut-form">${menuIcon("plus")} Criar ação</button>
          </div>
          <label class="launcher-field shortcuts-search"><span>${menuIcon("search")}</span><input class="launcher-search full-launcher-search" data-launcher-search placeholder="Buscar app, pasta ou site" aria-label="Buscar aplicativo, pasta ou endereço" /></label>
        </div>
        <div class="home-divider"></div>
        <section class="shortcuts-launcher">
          <div class="section-head"><div class="section-title"><span class="section-kicker">ACESSO RÁPIDO</span><strong>Aplicativos</strong></div></div>
          <div class="launcher-items launcher-results">${renderLauncherItems()}</div>
        </section>
        <button class="home-utility-summary shortcuts-clipboard" data-action="open-utility-popup" data-popup="clipboard">
            <span class="utility-icon">${menuIcon("clipboard")}</span>
            <span class="utility-copy"><strong>Prancheta</strong><small><span class="home-clipboard-count">${clipboardEntries.length}</span> itens recentes</small></span>
            <span class="utility-chevron">${menuIcon("chevron")}</span>
        </button>
        <div class="home-divider"></div>
        <div class="shortcuts-user-heading">
          <div class="section-title"><span class="section-kicker">PERSONALIZADOS</span><strong>Seus atalhos</strong></div>
          <small>Arraste para reordenar</small>
        </div>
        <div class="shortcut-grid" data-dropzone="shortcuts">${renderShortcuts()}</div>
        <form class="custom-action-form" data-action="shortcut-form" hidden>
          <label>Nome<input name="action-name" maxlength="24" placeholder="Ex.: Começar o dia" required /></label>
          <label>Aplicativo, pasta ou endereço<textarea name="action-targets" rows="2" placeholder="Um destino por linha. Ex.: wt.exe&#10;https://calendar.google.com" required></textarea></label>
          <small>Uma ação pode abrir vários destinos, na ordem indicada.</small>
          <button class="secondary-action">Salvar ação</button>
        </form>
      </section>
    </div>`;
}

function renderActiveTab() {
  if (activeTab === "pet") return renderPetPage();
  if (activeTab === "shortcuts") return renderShortcutsPage();
  return renderHomePage();
}

function setPetMood(mood: string, durationMs = 1400) {
  petMoodOverride = mood;
  petMoodUntil = Date.now() + durationMs;
  updatePetAtmosphere();
  window.setTimeout(() => {
    if (Date.now() >= petMoodUntil) {
      petMoodOverride = "";
      updatePetAtmosphere();
    }
  }, durationMs + 30);
}

function setPetActivity(state: PetState, detail = "") {
  app.querySelectorAll<HTMLElement>(".pet").forEach((pet) => petMotionEngines.get(pet)?.setState(state, false, detail));
}

function setCodexPetActivity(state: PetState, detail = "") {
  latestCodexPetState = { state, detail, occurredAt: Date.now() };
  setPetActivity(state, detail);
}

function setCodexTaskRunning(running: boolean) {
  codexTaskRunning = running;
  const island = app.querySelector<HTMLElement>(".edge-island");
  island?.classList.toggle("is-task-running", running);
  if (running) island?.classList.remove("is-task-complete");
  island?.querySelector(".peek-line")?.setAttribute(
    "aria-label",
    running ? "Uma tarefa do Codex está em andamento. Abrir Edge Ghosty." : "Abrir Edge Ghosty",
  );
}

function setCodexApprovalButtons(container: ParentNode, approval: CodexApproval | null) {
  container.querySelectorAll<HTMLButtonElement>("[data-ghosty-approval]").forEach((button) => {
    button.dataset.requestId = approval?.requestId ?? "";
    button.disabled = !approval || codexApprovalSubmitting;
  });
}

function updateCodexApprovalPresentation() {
  const island = app.querySelector<HTMLElement>(".edge-island");
  if (!island) return;
  const approval = pendingCodexApprovals[0] ?? null;
  const toast = island.querySelector<HTMLElement>(".ghosty-completion");
  const inline = island.querySelector<HTMLElement>(".ghosty-inline-approval");
  const externalVisible = Boolean(approval && !expanded);
  const inlineVisible = Boolean(approval && expanded);

  island.classList.toggle("is-approval-pending", Boolean(approval));
  island.classList.toggle("is-approval-inline", inlineVisible);
  toast?.setAttribute("aria-hidden", String(!externalVisible));
  inline?.setAttribute("aria-hidden", String(!inlineVisible));

  const toolLabel = approval?.toolName || "Ferramenta do Codex";
  const presentationKey = approval ? `${inlineVisible ? "inline" : "external"}:${approval.requestId}` : "";
  const presentationChanged = presentationKey !== codexApprovalPresentationKey;
  if (toast) {
    if (externalVisible) {
      if (presentationChanged || !toast.classList.contains("is-approval-entering")) {
        toast.classList.remove("is-approval-entering");
        void toast.offsetWidth;
        toast.classList.add("is-approval-entering");
      }
    } else {
      toast.classList.remove("is-approval-entering");
    }
  }
  if (inline) {
    if (inlineVisible) {
      if (presentationChanged || !inline.classList.contains("is-entering")) {
        inline.classList.remove("is-entering");
        void inline.offsetWidth;
        inline.classList.add("is-entering");
      }
    } else {
      inline.classList.remove("is-entering");
    }
  }
  codexApprovalPresentationKey = presentationKey;
  const copy = island.querySelector<HTMLElement>("#ghosty-completion-copy");
  const liveRegion = island.querySelector<HTMLElement>("#ghosty-completion-live");
  const description = island.querySelector<HTMLElement>("#ghosty-approval-description");
  const tool = island.querySelector<HTMLElement>("#ghosty-approval-tool");
  const inlineDescription = island.querySelector<HTMLElement>("#ghosty-inline-approval-description");
  const inlineTool = island.querySelector<HTMLElement>("#ghosty-inline-approval-tool");
  if (copy && approval) copy.textContent = "Autorizar esta ação?";
  if (liveRegion) liveRegion.textContent = externalVisible && approval
    ? `O Codex pediu autorização para ${approval.toolName}: ${approval.description}`
    : "";
  if (description) {
    description.textContent = approval?.description ?? "";
    description.hidden = !approval;
  }
  if (tool) {
    tool.textContent = toolLabel;
    tool.hidden = !approval;
  }
  if (inlineDescription) inlineDescription.textContent = approval?.description ?? "";
  if (inlineTool) inlineTool.textContent = toolLabel;
  island.querySelectorAll<HTMLElement>(".ghosty-approval-kicker").forEach((kicker) => {
    kicker.hidden = !approval;
  });
  island.querySelectorAll<HTMLElement>(".ghosty-completion-kicker").forEach((kicker) => {
    kicker.textContent = approval ? "SUA DECISÃO" : "PRONTINHO!";
  });
  island.querySelectorAll<HTMLElement>(".ghosty-approval-actions").forEach((actions) => {
    actions.hidden = !approval;
  });
  island.querySelectorAll<HTMLElement>(".ghosty-approval-error").forEach((message) => {
    message.textContent = codexApprovalError;
    message.hidden = !codexApprovalError;
  });
  setCodexApprovalButtons(island, approval);
  refreshApprovalHitBounds();
}

function clearTaskCompletionToast(island = app.querySelector<HTMLElement>(".edge-island")) {
  if (taskCompletionTimer !== undefined) window.clearTimeout(taskCompletionTimer);
  taskCompletionTimer = undefined;
  island?.classList.remove("is-task-complete");
  island?.querySelector("#ghosty-completion-live")?.replaceChildren();
}

function expireCodexApproval(requestId: string) {
  const wasCurrent = pendingCodexApprovals[0]?.requestId === requestId;
  pendingCodexApprovals = pendingCodexApprovals.filter((approval) => approval.requestId !== requestId);
  codexApprovalExpiryTimers.delete(requestId);
  if (wasCurrent) {
    codexApprovalSubmitting = false;
    codexApprovalError = "";
  }
  updateCodexApprovalPresentation();
}

function clearPendingCodexApprovals() {
  for (const timer of codexApprovalExpiryTimers.values()) window.clearTimeout(timer);
  codexApprovalExpiryTimers.clear();
  pendingCodexApprovals = [];
  codexApprovalSubmitting = false;
  codexApprovalError = "";
  updateCodexApprovalPresentation();
}

function queueCodexApproval(event: CodexHookEvent) {
  if (!event.approvalId || !event.approvalDescription || pendingCodexApprovals.some((item) => item.requestId === event.approvalId)) return;
  const expiresAt = event.approvalExpiresAt ?? event.occurredAt + 570_000;
  if (expiresAt <= Date.now()) return;
  pendingCodexApprovals.push({
    requestId: event.approvalId,
    toolName: event.toolName || "Codex",
    description: event.approvalDescription,
    expiresAt,
  });
  codexApprovalError = "";
  const timer = window.setTimeout(() => expireCodexApproval(event.approvalId!), Math.max(0, expiresAt - Date.now()));
  codexApprovalExpiryTimers.set(event.approvalId, timer);
  clearTaskCompletionToast();
  setCodexTaskRunning(true);
  setCodexPetActivity("approval", `Aprovação solicitada para ${event.toolName || "uma ferramenta do Codex"}`);
  updateCodexApprovalPresentation();
}

async function resolveCodexApproval(requestId: string, decision: CodexApprovalDecision) {
  const approval = pendingCodexApprovals[0];
  if (!approval || approval.requestId !== requestId || codexApprovalSubmitting) return;
  codexApprovalSubmitting = true;
  codexApprovalError = "";
  updateCodexApprovalPresentation();
  try {
    await invoke("resolve_codex_approval", { requestId, decision });
  } catch (error) {
    codexApprovalSubmitting = false;
    codexApprovalError = `Não consegui enviar a decisão: ${String(error)}`;
    updateCodexApprovalPresentation();
    return;
  }

  const timer = codexApprovalExpiryTimers.get(requestId);
  if (timer !== undefined) window.clearTimeout(timer);
  codexApprovalExpiryTimers.delete(requestId);
  pendingCodexApprovals = pendingCodexApprovals.filter((item) => item.requestId !== requestId);
  codexApprovalSubmitting = false;
  codexApprovalError = "";
  updateCodexApprovalPresentation();
  setCodexPetActivity(decision === "allow" ? "thinking" : "question", decision === "allow" ? "Ação aprovada" : "Ação recusada");
}

function showGhostyTaskCompletion(message: string) {
  const island = app.querySelector<HTMLElement>(".edge-island");
  const toast = island?.querySelector<HTMLElement>(".ghosty-completion");
  const copy = island?.querySelector<HTMLElement>("#ghosty-completion-copy");
  const liveRegion = island?.querySelector<HTMLElement>("#ghosty-completion-live");
  if (!island || !toast || !copy || !liveRegion || expanded || pendingCodexApprovals.length > 0) return;

  clearTaskCompletionToast(island);
  updateCodexApprovalPresentation();
  copy.textContent = message;
  liveRegion.textContent = message;
  toast.setAttribute("aria-hidden", "false");
  void island.offsetWidth;
  island.classList.add("is-task-complete");
  taskCompletionTimer = window.setTimeout(() => {
    island.classList.remove("is-task-complete");
    toast.setAttribute("aria-hidden", "true");
    liveRegion.textContent = "";
    taskCompletionTimer = undefined;
  }, 3500);
}

function updateCodexIntegrationControls() {
  const button = app.querySelector<HTMLButtonElement>("#codex-hooks-toggle");
  const status = app.querySelector<HTMLElement>("#codex-hooks-status");
  if (button) {
    button.disabled = codexHooksBusy;
    button.textContent = codexHooksBusy ? "Aguarde…" : codexHooksEnabled ? "Desconectar Codex" : "Conectar Codex";
  }
  if (status) status.textContent = codexHooksStatusMessage;
}

async function refreshCodexHooksStatus() {
  try {
    codexHooksEnabled = await invoke<boolean>("codex_hooks_enabled");
    let updated = false;
    if (codexHooksEnabled) {
      const sync = await invoke<{ enabled: boolean; updated: boolean }>("sync_codex_hooks_if_enabled");
      codexHooksEnabled = sync.enabled;
      updated = sync.updated;
    }
    if (!codexHooksEnabled) setCodexTaskRunning(false);
    codexHooksStatusMessage = codexHooksEnabled
      ? updated
        ? "Atualizei o hook. Reinicie o Codex e aprove o hook do Ghosty se solicitado."
        : "Hook configurado. Reinicie o Codex para aplicar as respostas de aprovação pelo Ghosty."
      : "Desativado. O Ghosty não acompanha sessões do Codex.";
  } catch (error) {
    codexHooksStatusMessage = `Não consegui consultar o Codex: ${String(error)}`;
  } finally {
    codexHooksBusy = false;
  }
  updateCodexIntegrationControls();
}

async function toggleCodexHooks() {
  if (codexHooksBusy) return;
  const enabled = !codexHooksEnabled;
  codexHooksBusy = true;
  codexHooksStatusMessage = enabled ? "Configurando o hook local…" : "Removendo o hook do Codex…";
  updateCodexIntegrationControls();
  try {
    codexHooksEnabled = await invoke<boolean>("set_codex_hooks_enabled", { enabled });
    if (!codexHooksEnabled) {
      setCodexTaskRunning(false);
      clearPendingCodexApprovals();
    }
    codexHooksStatusMessage = codexHooksEnabled
      ? "Hook configurado. Reinicie o Codex e aprove a atualização do hook do Ghosty se solicitado."
      : "Desconectado agora. Reinicie o Codex para descarregar o hook; os outros hooks foram preservados.";
  } catch (error) {
    codexHooksStatusMessage = `Não consegui atualizar o Codex: ${String(error)}`;
  } finally {
    codexHooksBusy = false;
    updateCodexIntegrationControls();
  }
}

function applyCodexHookEvents(events: CodexHookEvent[]) {
  for (const event of events) {
    switch (event.eventName) {
      case "SessionStart":
        setCodexTaskRunning(false);
        setCodexPetActivity("idle");
        break;
      case "UserPromptSubmit":
        setCodexTaskRunning(true);
        setCodexPetActivity("thinking", "O Codex está pensando");
        break;
      case "PreToolUse":
        setCodexTaskRunning(true);
        setCodexPetActivity("working", event.toolName ? `O Codex está usando ${event.toolName}` : "O Codex está trabalhando");
        break;
      case "PermissionRequest":
        queueCodexApproval(event);
        break;
      case "PostToolUse":
        setCodexTaskRunning(true);
        setCodexPetActivity("thinking", "O Codex retomou o turno");
        break;
      case "SubagentStart":
        setCodexTaskRunning(true);
        setCodexPetActivity("working", event.agentType ? `O Codex delegou para ${event.agentType}` : "O Codex delegou uma tarefa");
        break;
      case "SubagentStop":
        setCodexTaskRunning(true);
        setCodexPetActivity("thinking", "O Codex retomou o turno");
        break;
      case "Stop":
        setCodexTaskRunning(false);
        clearPendingCodexApprovals();
        setCodexPetActivity("finished", "Tarefa concluída!");
        showGhostyTaskCompletion("Tarefa concluída!");
        break;
      case "Interrupt":
        setCodexTaskRunning(false);
        clearPendingCodexApprovals();
        setCodexPetActivity("question", "O turno do Codex foi interrompido");
        break;
      case "SessionEnd":
        setCodexTaskRunning(false);
        clearPendingCodexApprovals();
        setCodexPetActivity("idle");
        break;
    }
  }
}

async function pollCodexHookEvents() {
  if (!codexHooksEnabled || codexPollPending) return;
  codexPollPending = true;
  try {
    const events = await invoke<CodexHookEvent[]>("drain_codex_events");
    if (events.length > 0) applyCodexHookEvents(events);
  } catch {
    // A temporary queue read failure should not interrupt the island or Codex.
  } finally {
    codexPollPending = false;
  }
}

function savePocket(): boolean {
  try {
    localStorage.setItem(KEYS.pocket, JSON.stringify(pocketItems.slice(0, 8)));
    return true;
  } catch (error) {
    console.error("Não consegui salvar o Bolso do Ghosty", error);
    pocketNotice = "Não consegui salvar no armazenamento deste app";
    return false;
  }
}

function showPetDropFeedback(message: string) {
  petDropFeedback = message;
  const stage = app.querySelector<HTMLElement>(".pet-stage");
  stage?.classList.add("has-drop-feedback");
  const prompt = stage?.querySelector<HTMLElement>(".pet-drop-prompt");
  if (prompt) prompt.textContent = message;
  if (petDropFeedbackTimer !== undefined) window.clearTimeout(petDropFeedbackTimer);
  petDropFeedbackTimer = window.setTimeout(() => {
    petDropFeedback = "";
    petDropFeedbackTimer = undefined;
    const stage = app.querySelector<HTMLElement>(".pet-stage");
    stage?.classList.remove("has-drop-feedback");
    const prompt = stage?.querySelector<HTMLElement>(".pet-drop-prompt");
    if (prompt && !pocketDropActive) prompt.textContent = "";
  }, 1800);
}

function setPetReceivingFile(receiving: boolean, position?: { x: number; y: number }, scale = 1) {
  const pet = app.querySelector<HTMLElement>(".tab-view .pet");
  const motion = pet ? petMotionEngines.get(pet) : undefined;
  if (receiving) {
    const x = position ? position.x / scale : undefined;
    const y = position ? position.y / scale : undefined;
    motion?.prepareForFile(x, y);
  }
  else motion?.cancelFileReceive();
}

function updatePetFileCursor(position: { x: number; y: number }, scale = 1) {
  const pet = app.querySelector<HTMLElement>(".tab-view .pet");
  const motion = pet ? petMotionEngines.get(pet) : undefined;
  motion?.updateFileCursor(position.x / scale, position.y / scale);
}

function addPocketItem(item: PocketItem, origin?: { x: number; y: number }) {
  if (pocketItems.some((existing) => existing.value === item.value && existing.kind === item.kind)
    || pendingPocketValues.has(item.value)) {
    setPetReceivingFile(false);
    pocketNotice = "Esse já está guardado";
    if (origin) showPetDropFeedback("Esse já está no Bolso");
    refreshPocketUi();
    return;
  }
  const pendingItemsNotInPocket = [...pendingPocketValues].filter((value) =>
    !pocketItems.some((existing) => existing.value === value),
  ).length;
  if (pocketItems.length + pendingItemsNotInPocket >= 8) {
    setPetReceivingFile(false);
    pocketNotice = "O bolso está cheio — tire algo antes";
    if (origin) showPetDropFeedback("O Bolso está cheio");
    refreshPocketUi();
    return;
  }
  pendingPocketValues.add(item.value);
  pocketItems.unshift(item);
  pocketItems = pocketItems.slice(0, 8);
  if (!savePocket()) {
    setPetReceivingFile(false);
    pocketItems = pocketItems.filter((existing) => existing.id !== item.id);
    pendingPocketValues.delete(item.value);
    if (origin) showPetDropFeedback("Não consegui guardar o arquivo");
    refreshPocketUi();
    return;
  }
  const pet = app.querySelector<HTMLElement>(".tab-view .pet");
  if (pet) {
    const petTarget = pet.querySelector<HTMLCanvasElement>(".pet-canvas") ?? pet;
    const bounds = petTarget.getBoundingClientRect();
    const start = origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const end = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height * 0.17 };
    const morsel = document.createElement("div");
    morsel.className = "pocket-morsel";
    morsel.textContent = item.kind === "image" ? "▧" : item.kind === "text" ? "¶" : "▤";
    morsel.style.left = `${start.x}px`;
    morsel.style.top = `${start.y}px`;
    morsel.style.setProperty("--morsel-x", `${end.x - start.x}px`);
    morsel.style.setProperty("--morsel-y", `${end.y - start.y}px`);
    document.body.append(morsel);
    petMotionEngines.get(pet)?.gulp();
    pocketNotice = `${petName} está comendo…`;
    const petHint = app.querySelector<HTMLElement>(".pet-profile-hint");
    if (petHint) petHint.textContent = `${petName} está comendo ${item.name}`;
    setPetMood("chewing", 1400);
    requestAnimationFrame(() => morsel.classList.add("is-flying"));
    window.setTimeout(() => morsel.remove(), 500);
  } else {
    pocketNotice = "Guardado no Bolso — o original continua no lugar";
  }
  pocketDropActive = false;
  refreshPocketUi();
  window.setTimeout(() => {
    pendingPocketValues.delete(item.value);
    if (pocketItems.some((saved) => saved.id === item.id)) {
      pocketNotice = "Guardado no bolso — o original continua no lugar";
      if (origin) showPetDropFeedback("Guardado no Bolso do Ghosty");
    }
    savePocket();
    refreshPocketUi();
  }, 1600);
}

function fileKind(path: string): PocketItem["kind"] {
  return /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i.test(path) ? "image" : "file";
}

function fileName(path: string) {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

async function captureClipboardText(intoPocket = false, origin?: { x: number; y: number }) {
  try {
    const copiedText = (await invoke<string>("read_clipboard_text")).trim();
    const text = copiedText.slice(0, MAX_SAVED_TEXT);
    if (!text) {
     if (intoPocket) pocketNotice = "A prancheta está vazia.";
     else clipboardNotice = "A área de transferência está vazia.";
      if (intoPocket) refreshPocketUi();
      else refreshClipboardUi();
      return;
    }
    if (intoPocket) {
      addPocketItem({ id: makeId(), name: text.replace(/\s+/g, " ").slice(0, 28) || "Texto", kind: "text", value: text, addedAt: Date.now(), truncated: copiedText.length > MAX_SAVED_TEXT }, origin);
      return;
    }
    const existing = clipboardEntries.filter((entry) => entry.text !== text);
    const pinned = existing.filter((entry) => entry.pinned);
    const fresh: ClipboardEntry = { id: makeId(), text, addedAt: Date.now() };
    const recent = [fresh, ...existing.filter((entry) => !entry.pinned)].slice(0, Math.max(0, 12 - pinned.length));
    clipboardEntries = [...pinned, ...recent].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.addedAt - a.addedAt);
   localStorage.setItem(KEYS.clipboard, JSON.stringify(clipboardEntries));
   clipboardNotice = copiedText.length > MAX_SAVED_TEXT ? "Guardei os primeiros 50 mil caracteres." : "Texto guardado nesta prancheta.";
    refreshClipboardUi();
 } catch {
   if (intoPocket) pocketNotice = "Não consegui ler o texto da prancheta.";
   else clipboardNotice = "Não consegui ler o texto da prancheta.";
    if (intoPocket) refreshPocketUi();
    else refreshClipboardUi();
  }
}

async function copyClipboardText(text: string) {
  try {
    await invoke("write_clipboard_text", { text });
    clipboardNotice = "Copiado para a área de transferência.";
 } catch {
   clipboardNotice = "Não consegui copiar este texto.";
 }
  refreshClipboardUi();
}

function startFocus() {
  const remaining = focusRemainingMs();
  if (focusState.running) {
    focusState.running = false;
    focusState.remainingMs = remaining;
    focusState.endsAt = 0;
  } else {
    const duration = Math.max(1, Math.min(180, Number(app.querySelector<HTMLInputElement>("#focus-minutes")?.value) || Math.round(focusState.durationMs / 60_000))) * 60_000;
    focusState.durationMs = duration;
    focusState.remainingMs = remaining > 0 ? remaining : duration;
    focusState.endsAt = Date.now() + focusState.remainingMs;
    focusState.running = true;
    petMoodOverride = "";
  }
  persistFocus();
  paintFocusTimer();
}

function resetFocus() {
  focusState.running = false;
  focusState.endsAt = 0;
  focusState.remainingMs = focusState.durationMs;
  persistFocus();
  paintFocusTimer();
}

function paintFocusTimer() {
  const remaining = focusRemainingMs();
  const countdown = app.querySelector<HTMLElement>("#focus-countdown");
  if (countdown) countdown.textContent = formatDuration(remaining);
  const progress = app.querySelector<HTMLElement>("#focus-progress");
  if (progress) progress.style.setProperty("--progress", `${100 - (remaining / Math.max(1, focusState.durationMs)) * 100}%`);
  const toggle = app.querySelector<HTMLButtonElement>("[data-action=focus-toggle]");
  if (toggle) toggle.textContent = focusState.running ? "Pausar" : remaining === 0 ? "Recomeçar" : "Iniciar foco";
  const durationInput = app.querySelector<HTMLInputElement>("#focus-minutes");
  if (durationInput) durationInput.disabled = focusState.running;
  const status = app.querySelector<HTMLElement>("#focus-status");
  if (status) status.textContent = focusState.running ? "Ghosty está focando com você" : remaining === 0 ? "Ciclo completo · hora de alongar" : "Escolha de 1 a 180 minutos";
  updatePetAtmosphere();
  const moodLabel = app.querySelector<HTMLElement>(".pet-mood-label");
  if (moodLabel) moodLabel.textContent = petMoodLabel();
}

function finishFocus() {
  focusState.running = false;
  focusState.remainingMs = 0;
  focusState.endsAt = 0;
  persistFocus();
  setPetMood("happy", 12_000);
  paintFocusTimer();
  app.querySelectorAll<HTMLElement>(".pet").forEach((pet) => petMotionEngines.get(pet)?.setState("finished"));
}

function tickFeatures() {
  if (focusState.running) {
    if (focusRemainingMs() === 0) finishFocus();
    else {
      paintFocusTimer();
      if (Date.now() % 5000 < 1000) persistFocus();
    }
  }
  if (petMoodOverride && Date.now() >= petMoodUntil) {
    petMoodOverride = "";
    updatePetAtmosphere();
    const moodLabel = app.querySelector<HTMLElement>(".pet-mood-label");
    if (moodLabel) moodLabel.textContent = petMoodLabel();
  }
}

async function refreshMediaInfo() {
  try {
    mediaInfo = await invoke<MediaInfo>("get_media_info");
  } catch {
    mediaInfo = { title: "", artist: "", playing: false };
  }
 app.querySelectorAll<HTMLElement>(".media-title").forEach((element) => { element.textContent = mediaInfo.title || "Nada tocando agora"; });
 app.querySelectorAll<HTMLElement>(".media-artist").forEach((element) => { element.textContent = mediaInfo.artist || "Quando algo tocar, aparece aqui"; });
  app.querySelectorAll<HTMLElement>(".media-play-icon").forEach((element) => { element.innerHTML = menuIcon(mediaInfo.playing ? "pause" : "play"); });
}

function launchShortcut(shortcut: Shortcut) {
  if (shortcut.action === "focus") {
    if (!focusState.running) startFocus();
    void openUtilityPopup("focus");
    return;
  }
  void invoke("open_targets", { targets: shortcut.targets }).catch(() => undefined);
}

function launchSearch(value: string) {
  const query = value.trim();
  if (!query) return;
  const match = [...shortcuts, ...LAUNCHER_DEFAULTS].find((item) => item.name.toLowerCase() === query.toLowerCase());
  if (match) {
    launchShortcut(match);
    return;
  }
  const isAddress = /^(https?:\/\/|ms-[a-z-]+:|shell:|[a-z]:[\\/])/i.test(query) || /\.(exe|lnk|url|pdf|docx?|xlsx?|pptx?)$/i.test(query);
  const target = isAddress ? query : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  void invoke("open_targets", { targets: [target] }).catch(() => undefined);
}

function bindPetInteractions(container: HTMLElement) {
  container.querySelectorAll<HTMLElement>(".pet").forEach((pet) => {
    const motion = new PetMotionEngine(pet);
    petMotionEngines.set(pet, motion);
    if (latestCodexPetState && latestCodexPetState.state !== "idle") {
      const age = Date.now() - latestCodexPetState.occurredAt;
      const lifetime = latestCodexPetState.state === "finished" ? 2100 : latestCodexPetState.state === "question" ? 5000 : 30_000;
      if (age <= lifetime) motion.setState(latestCodexPetState.state, false, latestCodexPetState.detail);
    }
    pet.addEventListener("mouseenter", () => {
      if (petLoveTimer !== undefined) window.clearTimeout(petLoveTimer);
      petLoveTimer = window.setTimeout(() => {
        petLoveTimer = undefined;
        if (pet.matches(":hover") && Date.now() - lastPetLove > 6000) {
          lastPetLove = Date.now();
          motion.love();
          setPetMood("happy", 1500);
        }
      }, 2000);
    });
    pet.addEventListener("mouseleave", () => {
      if (petLoveTimer !== undefined) window.clearTimeout(petLoveTimer);
      petLoveTimer = undefined;
      motion.lookAt(0, 0);
    });
    pet.addEventListener("click", () => {
      if (petLoveTimer !== undefined) window.clearTimeout(petLoveTimer);
      petLoveTimer = undefined;
      const reaction = motion.poke();
      if (reaction === "dizzy") setPetMood("dizzy", 1550);
      else if (reaction === "annoyed") setPetMood("annoyed", 800);
    });
  });
}

function bindPocketDropzone(dropzone: HTMLElement) {
  dropzone.addEventListener("dragenter", (event) => {
    event.preventDefault();
    pocketDropActive = true;
    dropzone.classList.add("is-dragging");
    setPetReceivingFile(true, { x: event.clientX, y: event.clientY });
  });
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
    updatePetFileCursor({ x: event.clientX, y: event.clientY });
  });
  dropzone.addEventListener("dragleave", (event) => {
    if (!dropzone.contains(event.relatedTarget as Node | null)) {
      pocketDropActive = false;
      dropzone.classList.remove("is-dragging");
      setPetReceivingFile(false);
    }
  });
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    pocketDropActive = false;
    dropzone.classList.remove("is-dragging");
    const text = event.dataTransfer?.getData("text/plain").trim();
    if (text) {
      setPetReceivingFile(true, { x: event.clientX, y: event.clientY });
      addPocketItem({ id: makeId(), name: text.replace(/\s+/g, " ").slice(0, 28), kind: "text", value: text.slice(0, MAX_SAVED_TEXT), addedAt: Date.now(), truncated: text.length > MAX_SAVED_TEXT }, { x: event.clientX, y: event.clientY });
    }
    else setPetReceivingFile(false);
  });
}

async function bindNativeFileDrop() {
  try {
    await getCurrentWindow().onDragDropEvent(async (event) => {
      if (event.payload.type === "enter") {
        pocketDropActive = true;
        const utilityPopup = getCurrentWindow().label === "utility-popup";
        if (!utilityPopup && !settingsOpen) updateActiveTab("pet");
        if (!utilityPopup) setExpanded(true);
        app.querySelector<HTMLElement>(".edge-island")?.classList.add("is-file-dragging");
        const dropzone = app.querySelector<HTMLElement>("[data-dropzone=pocket]");
        dropzone?.classList.add("is-dragging");
        if (utilityPopup) {
          const prompt = dropzone?.querySelector<HTMLElement>("strong");
          if (prompt) prompt.textContent = "Pode soltar, eu pego!";
        }
        const prompt = dropzone?.querySelector<HTMLElement>(".pet-drop-prompt");
        if (prompt) prompt.textContent = "Pode soltar, eu pego!";
        nativeDragScale = await getCurrentWindow().scaleFactor().catch(() => 1);
        setPetReceivingFile(true, event.payload.position, nativeDragScale);
        return;
      }
      if (event.payload.type === "over") {
        app.querySelector<HTMLElement>(".edge-island")?.classList.add("is-file-dragging");
        app.querySelector("[data-dropzone=pocket]")?.classList.add("is-dragging");
        updatePetFileCursor(event.payload.position, nativeDragScale);
        return;
      }
      if (event.payload.type === "leave") {
        pocketDropActive = false;
        setPetReceivingFile(false);
        app.querySelector<HTMLElement>(".edge-island")?.classList.remove("is-file-dragging");
        const dropzone = app.querySelector<HTMLElement>("[data-dropzone=pocket]");
        dropzone?.classList.remove("is-dragging");
        if (getCurrentWindow().label === "utility-popup") {
          const prompt = dropzone?.querySelector<HTMLElement>("strong");
          if (prompt) prompt.textContent = "Solte um arquivo ou texto";
        }
        const prompt = dropzone?.querySelector<HTMLElement>(".pet-drop-prompt");
        if (prompt) prompt.textContent = pocketItems.length ? "Arraste mais alguma coisa" : "Solte um arquivo ou texto no Ghosty";
        return;
      }

      pocketDropActive = false;
      app.querySelector<HTMLElement>(".edge-island")?.classList.remove("is-file-dragging");
      const dropzone = app.querySelector<HTMLElement>("[data-dropzone=pocket]");
      dropzone?.classList.remove("is-dragging");
      const prompt = dropzone?.querySelector<HTMLElement>(".pet-drop-prompt");
      const paths = event.payload.paths.filter((path) => path.trim().length > 0);
      if (paths.length === 0) {
        setPetReceivingFile(false);
        pocketNotice = "Não recebi o arquivo. Solte-o sobre o Ghosty novamente.";
        showPetDropFeedback("Não recebi o arquivo");
        if (getCurrentWindow().label === "utility-popup") {
          const prompt = dropzone?.querySelector<HTMLElement>("strong");
          if (prompt) prompt.textContent = "Não recebi o arquivo";
        }
        if (prompt) prompt.textContent = "Não recebi o arquivo";
        updateActiveTab(activeTab);
        return;
      }
      if (prompt) prompt.textContent = `${petName} está comendo…`;
      if (getCurrentWindow().label === "utility-popup") {
        const popupPrompt = dropzone?.querySelector<HTMLElement>("strong");
        if (popupPrompt) popupPrompt.textContent = "Guardando no Bolso…";
      }
      const origin = { x: event.payload.position.x / nativeDragScale, y: event.payload.position.y / nativeDragScale };
      updatePetFileCursor(event.payload.position, nativeDragScale);
      for (const path of paths) {
        addPocketItem({ id: makeId(), name: fileName(path), kind: fileKind(path), value: path, addedAt: Date.now() }, origin);
      }
    });
  } catch (error) {
    console.error("Não consegui ativar o arrasto de arquivos", error);
    pocketNotice = "O recebimento de arquivos não foi ativado";
    updateActiveTab(activeTab);
  }
}

function bindTabContent(tabView: HTMLElement) {
  bindPetInteractions(tabView);
  const volumeSlider = tabView.querySelector<HTMLInputElement>("#volume");
  volumeSlider?.addEventListener("input", (event) => {
    volume = Number((event.target as HTMLInputElement).value);
    const output = tabView.querySelector("#volume-value");
    if (output) output.textContent = `${volume}%`;
    void invoke("system_volume", { value: volume }).catch(() => undefined);
  });

  tabView.querySelectorAll<HTMLButtonElement>("[data-action^=media-]").forEach((button) => {
    button.addEventListener("click", () => {
      const actions: Record<string, string> = { "media-previous": "previous", "media-toggle": "play-pause", "media-next": "next" };
      const action = actions[button.dataset.action ?? ""];
      if (!action) return;
      void invoke("media_control", { action }).then(() => window.setTimeout(() => void refreshMediaInfo(), 500)).catch(() => undefined);
    });
  });
  tabView.querySelectorAll<HTMLElement>("[data-action=refresh-media]").forEach((button) => button.addEventListener("click", () => void refreshMediaInfo()));
  tabView.querySelector("[data-action=focus-toggle]")?.addEventListener("click", startFocus);
  tabView.querySelector("[data-action=focus-reset]")?.addEventListener("click", resetFocus);
  tabView.querySelector<HTMLInputElement>("#focus-minutes")?.addEventListener("change", (event) => {
    if (focusState.running) return;
    focusState.durationMs = Math.max(1, Math.min(180, Number((event.target as HTMLInputElement).value) || 25)) * 60_000;
    focusState.remainingMs = focusState.durationMs;
    persistFocus();
    paintFocusTimer();
  });

  tabView.querySelectorAll<HTMLElement>("[data-action=launch-item]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.launchId;
    const shortcut = [...shortcuts, ...LAUNCHER_DEFAULTS].find((item) => item.id === id);
    if (shortcut) launchShortcut(shortcut);
  }));
  tabView.querySelectorAll<HTMLInputElement>("[data-launcher-search]").forEach((input) => {
    input.addEventListener("input", () => {
      const searchText = input.value.trim();
      const query = searchText.toLowerCase();
      tabView.querySelectorAll<HTMLElement>(".launch-item").forEach((item) => {
        const matches = !!query && !!item.dataset.launchName?.includes(query);
        item.hidden = !!query && !matches;
        item.classList.toggle("is-search-match", matches);
      });
      const state = query && !focusState.running ? "searching" : focusState.running ? "working" : "idle";
      setPetActivity(state, state === "searching" ? searchText : "");
    });
    input.addEventListener("blur", () => {
      setPetActivity(focusState.running ? "working" : "idle");
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        launchSearch(input.value);
      }
    });
  });

  tabView.querySelector("[data-action=clipboard-capture]")?.addEventListener("click", () => void captureClipboardText());
  tabView.querySelector("[data-action=pocket-clipboard]")?.addEventListener("click", (event) => {
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    void captureClipboardText(true, { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 });
  });
  bindClipboardEntryActions(tabView);
  bindPocketItemActions(tabView);
  tabView.querySelectorAll<HTMLElement>("[data-dropzone=pocket]").forEach(bindPocketDropzone);

  tabView.querySelectorAll<HTMLButtonElement>("[data-action=open-utility-popup]").forEach((button) => button.addEventListener("click", () => {
    const mode = button.dataset.popup;
    if (mode === "focus" || mode === "pocket" || mode === "customize" || mode === "clipboard") void openUtilityPopup(mode);
  }));

  const form = tabView.querySelector<HTMLFormElement>("[data-action=shortcut-form]");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = (form.elements.namedItem("action-name") as HTMLInputElement).value.trim();
    const targets = (form.elements.namedItem("action-targets") as HTMLTextAreaElement).value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
    if (!name || targets.length === 0) return;
    shortcuts.push({ id: makeId(), name: name.slice(0, 24), glyph: "↗", targets, custom: true });
    persistShortcuts();
    updateActiveTab("shortcuts");
  });
  tabView.querySelector("[data-action=toggle-shortcut-form]")?.addEventListener("click", () => {
    const customForm = tabView.querySelector<HTMLFormElement>("[data-action=shortcut-form]");
    if (!customForm) return;
    customForm.hidden = !customForm.hidden;
    if (!customForm.hidden) (customForm.elements.namedItem("action-name") as HTMLInputElement).focus();
  });
  tabView.querySelectorAll<HTMLButtonElement>("[data-action=run-shortcut]").forEach((button) => button.addEventListener("click", () => {
    const shortcut = shortcuts.find((item) => item.id === button.dataset.shortcutId);
    if (shortcut) launchShortcut(shortcut);
  }));
  tabView.querySelectorAll<HTMLButtonElement>("[data-action=remove-shortcut]").forEach((button) => button.addEventListener("click", () => {
    shortcuts = shortcuts.filter((item) => item.id !== button.dataset.shortcutId);
    persistShortcuts();
    updateActiveTab("shortcuts");
  }));

  const grid = tabView.querySelector<HTMLElement>("[data-dropzone=shortcuts]");
  if (grid) {
    grid.addEventListener("dragover", (event) => { event.preventDefault(); grid.classList.add("is-dragging"); });
    grid.addEventListener("dragleave", () => grid.classList.remove("is-dragging"));
    grid.addEventListener("drop", (event) => {
      event.preventDefault();
      grid.classList.remove("is-dragging");
      const target = (event.target as HTMLElement).closest<HTMLElement>(".shortcut-item");
      const targetId = target?.dataset.shortcutId ?? "";
      if (!draggedId || draggedId === targetId) return;
      const from = shortcuts.findIndex((item) => item.id === draggedId);
      const to = targetId ? shortcuts.findIndex((item) => item.id === targetId) : shortcuts.length - 1;
      if (from < 0 || to < 0) return;
      const [moved] = shortcuts.splice(from, 1);
      shortcuts.splice(Math.min(to, shortcuts.length), 0, moved);
      draggedId = "";
      persistShortcuts();
      updateActiveTab("shortcuts");
    });
    grid.querySelectorAll<HTMLElement>(".shortcut-item").forEach((item) => {
      item.addEventListener("dragstart", (event) => {
        draggedId = item.dataset.shortcutId ?? "";
        item.classList.add("is-dragging");
        event.dataTransfer?.setData("text/plain", draggedId);
      });
      item.addEventListener("dragend", () => { draggedId = ""; item.classList.remove("is-dragging"); grid.classList.remove("is-dragging"); });
    });
  }
  updatePetAtmosphere();
}

function bindPocketItemActions(container: ParentNode) {
  container.querySelectorAll<HTMLButtonElement>("[data-action=open-pocket]").forEach((button) => button.addEventListener("click", () => {
    const item = pocketItems.find((entry) => entry.id === button.dataset.pocketId);
    if (!item) return;
    if (item.kind === "text") void copyClipboardText(item.value);
    else void invoke("open_targets", { targets: [item.value] }).catch(() => undefined);
  }));
  container.querySelectorAll<HTMLButtonElement>("[data-action=remove-pocket]").forEach((button) => button.addEventListener("click", () => {
    pocketItems = pocketItems.filter((entry) => entry.id !== button.dataset.pocketId);
    savePocket();
    refreshPocketUi();
  }));
}

function bindClipboardEntryActions(container: ParentNode) {
  container.querySelectorAll<HTMLButtonElement>("[data-action=copy-clipboard]").forEach((button) => button.addEventListener("click", () => {
    const entry = clipboardEntries.find((item) => item.id === button.dataset.clipboardId);
    if (entry) void copyClipboardText(entry.text);
  }));
  container.querySelectorAll<HTMLButtonElement>("[data-action=toggle-clipboard-pin]").forEach((button) => button.addEventListener("click", () => {
    const entry = clipboardEntries.find((item) => item.id === button.dataset.clipboardId);
    if (!entry) return;
    entry.pinned = !entry.pinned;
    clipboardEntries.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.addedAt - a.addedAt);
    localStorage.setItem(KEYS.clipboard, JSON.stringify(clipboardEntries));
    refreshClipboardUi();
  }));
  container.querySelectorAll<HTMLButtonElement>("[data-action=remove-clipboard]").forEach((button) => button.addEventListener("click", () => {
    clipboardEntries = clipboardEntries.filter((item) => item.id !== button.dataset.clipboardId);
    localStorage.setItem(KEYS.clipboard, JSON.stringify(clipboardEntries));
    refreshClipboardUi();
  }));
}

function refreshClipboardUi() {
  const lists = app.querySelectorAll<HTMLElement>(".clipboard-list");
  lists.forEach((list) => {
    list.innerHTML = renderClipboardEntries(list.closest(".utility-clipboard") ? 12 : 3);
    bindClipboardEntryActions(list);
  });
  app.querySelectorAll<HTMLElement>(".clipboard-status").forEach((status) => { status.textContent = clipboardNotice; });
  app.querySelectorAll<HTMLElement>(".home-clipboard-count").forEach((count) => { count.textContent = String(clipboardEntries.length); });
  refreshUtilityPopupSubtitle();
}

function refreshPocketUi() {
  const status = app.querySelector<HTMLElement>(".pocket-status");
  if (status) status.textContent = pocketNotice;
  const items = app.querySelector<HTMLElement>(".pocket-items");
  if (items) {
    items.innerHTML = renderPocketItems();
    bindPocketItemActions(items);
  }
  const dropPrompt = app.querySelector<HTMLElement>(".pocket-dropzone strong");
  if (dropPrompt) dropPrompt.textContent = pocketDropActive ? "Pode soltar, eu pego!" : "Solte um arquivo ou texto";
  app.querySelectorAll<HTMLElement>(".home-pocket-count").forEach((count) => { count.textContent = `${pocketItems.length}/8`; });
  refreshUtilityPopupSubtitle();
  updatePetAtmosphere();
}

function refreshUtilityPopupSubtitle() {
  const subtitle = app.querySelector<HTMLElement>("[data-popup-subtitle]");
  if (!subtitle || !utilityPopupMode) return;
  if (utilityPopupMode === "pocket") subtitle.textContent = `${pocketItems.length}/8 itens · os originais ficam no lugar`;
  else if (utilityPopupMode === "clipboard") subtitle.textContent = `${clipboardEntries.length} itens recentes`;
}

function updateActiveTab(tab: MenuTab) {
  const previousTab = activeTab;
  activeTab = tab;
  const tabView = app.querySelector<HTMLElement>(".tab-view");
  if (!tabView) return;

  app.querySelectorAll<HTMLButtonElement>(".menu-tabs [data-tab]").forEach((button) => {
    const selected = button.dataset.tab === activeTab;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  tabView.innerHTML = renderActiveTab();
  bindTabContent(tabView);
  if (tab === "home" && previousTab !== "home") void refreshMediaInfo();
}

function renderDisplayOptions() {
  if (displays.length === 0) return '<p class="settings-note">Nenhum monitor foi encontrado.</p>';
  return displays.map((display) => `
    <label class="display-option">
      <input type="checkbox" data-display-id="${escapeHtml(display.id)}" ${allDisplays || selectedDisplayIds.includes(display.id) ? "checked" : ""} ${allDisplays ? "disabled" : ""} />
      <span><strong>${escapeHtml(display.name)}${display.isPrimary ? " · principal" : ""}</strong><small>${display.width} × ${display.height}</small></span>
    </label>`).join("");
}

function renderSettingsContent() {
  const lengthLabel = edge === "left" ? "Altura da barrinha" : "Largura da barrinha";
  return `
    <div class="settings-page">
     <header class="menu-header settings-header">
        <button class="back-button" data-action="settings-back" aria-label="Voltar ao menu">${menuIcon("back")}</button>
        <div><strong>Configurações</strong><small>aparência e comportamento</small></div>
        <button class="icon-button close-button" data-action="close" aria-label="Fechar">${menuIcon("close")}</button>
      </header>
      <div class="settings-scroll">
        <section class="settings-context-card">
        <p class="settings-intro">Ajuste a barrinha e escolha as telas onde o Edge Ghosty aparece.</p>
        <section class="control-card setting-card">
          <div class="setting-heading"><label for="bar-length">${lengthLabel}</label><output id="bar-length-value">${barLength} px</output></div>
          <input id="bar-length" type="range" min="${MIN_LENGTH}" max="${MAX_LENGTH}" step="${LENGTH_STEP}" value="${barLength}" />
          <div class="range-labels"><span>${MIN_LENGTH} px</span><span>${MAX_LENGTH} px</span></div>
        </section>
        <section class="control-card setting-card">
          <div class="setting-heading"><label for="bar-thickness">Espessura da barrinha</label><output id="bar-thickness-value">${barThickness} px</output></div>
          <input id="bar-thickness" type="range" min="${MIN_THICKNESS}" max="${MAX_THICKNESS}" value="${barThickness}" />
          <div class="range-labels"><span>${MIN_THICKNESS} px</span><span>${MAX_THICKNESS} px</span></div>
        </section>
        <section class="control-card setting-card">
          <label class="setting-heading" for="edge-select">Borda da tela</label>
          <select id="edge-select" aria-label="Borda da tela">
            <option value="left" ${edge === "left" ? "selected" : ""}>Esquerda · vertical</option>
            <option value="top" ${edge === "top" ? "selected" : ""}>Em cima · horizontal</option>
            <option value="bottom" ${edge === "bottom" ? "selected" : ""}>Em baixo · horizontal</option>
          </select>
        </section>
        <section class="control-card setting-card displays-card">
          <div class="setting-heading">Monitores</div>
          <label class="display-option all-displays-option">
            <input id="all-displays" type="checkbox" ${allDisplays ? "checked" : ""} />
            <span><strong>Todos os monitores</strong><small>Mostrar em cada tela conectada</small></span>
          </label>
          <div class="display-list">${renderDisplayOptions()}</div>
        </section>
        <section class="control-card setting-card">
          <div class="setting-heading"><label for="close-delay">Tempo para recolher</label><output id="close-delay-value">${closeDelay} ms</output></div>
          <input id="close-delay" type="range" min="${MIN_CLOSE_DELAY}" max="${MAX_CLOSE_DELAY}" step="50" value="${closeDelay}" />
          <div class="range-labels"><span>imediato</span><span>mais lento</span></div>
        </section>
        <section class="control-card setting-card codex-integration-card">
          <div class="setting-heading">Ghosty e Codex</div>
          <p class="codex-integration-copy">Nas sessões locais do Codex, as bolinhas indicam atividade e o Ghosty mostra pedidos de aprovação e conclusões. A descrição resumida da ação pendente fica na fila local só até você decidir; texto do chat e resultados de ferramentas não são guardados nem enviados.</p>
          <small class="codex-integration-status" id="codex-hooks-status" role="status">${escapeHtml(codexHooksStatusMessage)}</small>
          <button class="reset-button codex-integration-toggle" id="codex-hooks-toggle" type="button" ${codexHooksBusy ? "disabled" : ""}>${codexHooksBusy ? "Aguarde…" : codexHooksEnabled ? "Desconectar Codex" : "Conectar Codex"}</button>
        </section>
        <p class="settings-note">As curvas do notch acompanham o comprimento e a orientação da barrinha.</p>
        <button class="reset-button" data-action="reset-settings">Restaurar configurações padrão</button>
        </section>
      </div>
    </div>`;
}

function setExpanded(value: boolean) {
  if (expanded === value) return;
  const island = app.querySelector<HTMLElement>(".edge-island");
  if (!island) return;
  freezeIslandGeometry(island);
  expanded = value;
  island.classList.toggle("is-expanded", value);
  if (value) clearTaskCompletionToast(island);
  updateCodexApprovalPresentation();
  if (value) {
    const pet = island.querySelector<HTMLElement>(".pet");
    const motion = pet ? petMotionEngines.get(pet) : undefined;
    if (motion) {
      if (hasGreetedPet) motion.greet();
      else {
        hasGreetedPet = true;
        motion.welcome();
      }
    }
  }
  if (hoverCloseTimer !== undefined) {
    window.clearTimeout(hoverCloseTimer);
    hoverCloseTimer = undefined;
  }
  animateIsland(value);
}

function scheduleClose() {
  if (hoverCloseTimer !== undefined) window.clearTimeout(hoverCloseTimer);
  hoverCloseTimer = window.setTimeout(() => {
    hoverCloseTimer = undefined;
    const body = app.querySelector<HTMLElement>(".island-body");
    if (expanded && body?.matches(":hover")) return;
    setExpanded(false);
  }, closeDelay);
}

function bindRange(
  selector: string,
  update: (value: number) => void,
  outputSelector: string,
  format: (value: number) => string,
  layout = true,
) {
  app.querySelector<HTMLInputElement>(selector)?.addEventListener("input", (event) => {
    const value = Number((event.target as HTMLInputElement).value);
    update(value);
    const output = app.querySelector<HTMLOutputElement>(outputSelector);
    if (output) output.value = format(value);
    const island = app.querySelector<HTMLElement>(".edge-island");
    if (island) applyIslandVariables(island);
    persistSettings();
    if (layout) void applyDisplayLayout();
  });
}

function bindSettings() {
  app.querySelector<HTMLButtonElement>("#codex-hooks-toggle")?.addEventListener("click", () => void toggleCodexHooks());
  bindRange("#bar-length", (value) => { barLength = value; }, "#bar-length-value", (value) => `${value} px`);
  bindRange("#bar-thickness", (value) => { barThickness = value; }, "#bar-thickness-value", (value) => `${value} px`);
  bindRange("#close-delay", (value) => { closeDelay = value; }, "#close-delay-value", (value) => `${value} ms`);

  app.querySelector<HTMLSelectElement>("#edge-select")?.addEventListener("change", (event) => {
    edge = (event.target as HTMLSelectElement).value as Edge;
    persistSettings();
    render();
    void applyDisplayLayout();
  });
  app.querySelector<HTMLInputElement>("#all-displays")?.addEventListener("change", (event) => {
    allDisplays = (event.target as HTMLInputElement).checked;
    persistSettings();
    render();
    void applyDisplayLayout();
  });
  app.querySelectorAll<HTMLInputElement>("[data-display-id]").forEach((input) => {
    input.addEventListener("change", () => {
      const id = input.dataset.displayId!;
      const next = new Set(selectedDisplayIds);
      if (input.checked) next.add(id);
      else next.delete(id);
      if (next.size === 0) return;
      selectedDisplayIds = [...next];
      allDisplays = false;
      persistSettings();
      render();
      void applyDisplayLayout();
    });
  });
}

function bindCodexApprovalButtons(container: ParentNode) {
  container.querySelectorAll<HTMLButtonElement>("[data-ghosty-approval]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const requestId = button.dataset.requestId;
      const decision = button.dataset.ghostyApproval;
      if (requestId && (decision === "allow" || decision === "deny")) {
        void resolveCodexApproval(requestId, decision);
      }
    });
  });
}

function render() {
  app.innerHTML = `
    <section class="edge-island ${expanded ? "is-expanded" : ""} ${settingsOpen ? "settings-open" : ""} ${codexTaskRunning ? "is-task-running" : ""} ${pendingCodexApprovals.length > 0 ? "is-approval-pending" : ""}" aria-label="Edge Ghosty">
      <div class="island-body">
        <button class="peek-line" aria-label="${codexTaskRunning ? "Uma tarefa do Codex está em andamento. Abrir Edge Ghosty." : "Abrir Edge Ghosty"}"><span></span><span></span><span></span></button>
        <div class="island-content">
          <header class="menu-header">
            <nav class="menu-tabs" role="group" aria-label="Seções do Edge Ghosty">
              <button class="icon-button menu-tab ${activeTab === "home" ? "is-active" : ""}" aria-pressed="${activeTab === "home"}" data-tab="home" aria-label="Início" title="Início">${menuIcon("home")}</button>
              <button class="icon-button menu-tab ${activeTab === "pet" ? "is-active" : ""}" aria-pressed="${activeTab === "pet"}" data-tab="pet" aria-label="Pet" title="Pet">${menuIcon("pet")}</button>
              <button class="icon-button menu-tab ${activeTab === "shortcuts" ? "is-active" : ""}" aria-pressed="${activeTab === "shortcuts"}" data-tab="shortcuts" aria-label="Atalhos" title="Atalhos">${menuIcon("shortcuts")}</button>
            </nav>
            <div class="menu-header-actions">
              <button class="icon-button settings-button" data-action="settings" aria-label="Abrir configurações" title="Configurações">${menuIcon("settings")}</button>
              <button class="icon-button close-button" data-action="close" aria-label="Fechar" title="Fechar">${menuIcon("close")}</button>
            </div>
          </header>
          <main class="tab-view" role="tabpanel">${renderActiveTab()}</main>
          <footer><span>Ctrl + Space</span><span class="footer-hint">encoste na barrinha</span></footer>
        </div>
        <div class="ghosty-inline-approval" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="ghosty-inline-approval-title">
          ${renderPetCharacter("ghosty-inline-approval-pet")}
          <div class="ghosty-inline-approval-card">
            <span class="ghosty-inline-approval-kicker">SUA DECISÃO</span>
            <strong id="ghosty-inline-approval-title">Autorizar esta ação?</strong>
            <small class="ghosty-inline-approval-tool" id="ghosty-inline-approval-tool"></small>
            <p class="ghosty-inline-approval-description" id="ghosty-inline-approval-description"></p>
            <div class="ghosty-approval-actions">
              <button type="button" data-ghosty-approval="deny">Recusar</button>
              <button type="button" data-ghosty-approval="allow">Aprovar</button>
            </div>
            <p class="ghosty-approval-error" role="status" hidden></p>
          </div>
        </div>
      </div>
      <div class="ghosty-completion" aria-hidden="true">
        <div class="pet ghosty-completion-pet" data-skin="${petSkin}" data-accessory="${petAccessory}" data-mood="happy" aria-hidden="true">
          <canvas class="pet-canvas" aria-hidden="true"></canvas>
        </div>
        <div class="ghosty-completion-card">
          <span class="ghosty-completion-kicker">PRONTINHO!</span>
          <strong id="ghosty-completion-copy">Tarefa concluída!</strong>
          <small class="ghosty-approval-tool" id="ghosty-approval-tool" hidden></small>
          <p class="ghosty-approval-description" id="ghosty-approval-description" hidden></p>
          <div class="ghosty-approval-actions" hidden>
            <button type="button" data-ghosty-approval="deny">Recusar</button>
            <button type="button" data-ghosty-approval="allow">Aprovar</button>
          </div>
          <p class="ghosty-approval-error" role="status" hidden></p>
        </div>
      </div>
      <span class="task-completion-live" id="ghosty-completion-live" role="status" aria-live="polite"></span>
    </section>`;

  const island = app.querySelector<HTMLElement>(".edge-island")!;
  applyIslandVariables(island);
  const islandContent = island.querySelector<HTMLElement>(".island-content")!;
  if (settingsOpen) islandContent.innerHTML = renderSettingsContent();

  const body = island.querySelector<HTMLElement>(".island-body")!;
  publishNativeHitBounds(body);
  body.addEventListener("pointerenter", () => {
    if (hoverCloseTimer !== undefined) {
      window.clearTimeout(hoverCloseTimer);
      hoverCloseTimer = undefined;
    }
    setExpanded(true);
  });
  body.addEventListener("pointerleave", () => {
    const pet = app.querySelector<HTMLElement>(".tab-view .pet");
    if (pet) petMotionEngines.get(pet)?.lookAt(0, 0);
    if (expanded) scheduleClose();
  });
  island.querySelector(".peek-line")?.addEventListener("click", (event) => {
    event.stopPropagation();
    setExpanded(!expanded);
  });

  body.addEventListener("pointermove", (event) => {
    if (!expanded) return;
    const pet = app.querySelector<HTMLElement>(".tab-view .pet");
    const motion = pet ? petMotionEngines.get(pet) : undefined;
    if (!pet || !motion) return;
    const rect = pet.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / Math.max(1, rect.width * 0.55);
    const y = (event.clientY - (rect.top + rect.height / 2)) / Math.max(1, rect.height * 0.55);
    motion.lookAt(x, y);
  });

  app.querySelector("[data-action=settings]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    settingsOpen = true;
    render();
  });
  app.querySelector("[data-action=settings-back]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    settingsOpen = false;
    render();
  });
  app.querySelector("[data-action=close]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    setExpanded(false);
  });
  app.querySelector("[data-action=reset-settings]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    barLength = DEFAULTS.length;
    barThickness = DEFAULTS.thickness;
    edge = DEFAULTS.edge;
    closeDelay = DEFAULTS.closeDelay;
    allDisplays = false;
    selectedDisplayIds = displays.find((display) => display.isPrimary)
      ? [displays.find((display) => display.isPrimary)!.id]
      : displays.slice(0, 1).map((display) => display.id);
    persistSettings();
    render();
    void applyDisplayLayout();
  });
  bindSettings();

  const tabView = island.querySelector<HTMLElement>(".tab-view");
  if (tabView) bindTabContent(tabView);
  const completionPet = island.querySelector<HTMLElement>(".ghosty-completion");
  if (completionPet) bindPetInteractions(completionPet);
  const inlineApproval = island.querySelector<HTMLElement>(".ghosty-inline-approval");
  if (inlineApproval) bindPetInteractions(inlineApproval);
  bindCodexApprovalButtons(island);
  updateCodexApprovalPresentation();
  paintFocusTimer();
  island.addEventListener("click", (event) => {
    const tabButton = (event.target as Element).closest<HTMLButtonElement>("[data-tab]");
    if (!tabButton) return;
    event.stopPropagation();
    updateActiveTab(tabButton.dataset.tab as MenuTab);
  });

  
}

async function startMainWindow() {
  render();
  void refreshCodexHooksStatus();
  window.setInterval(() => void pollCodexHookEvents(), 300);
  await bindNativeFileDrop();
  void invoke<number>("get_system_volume").then((value) => {
    volume = value;
    const slider = app.querySelector<HTMLInputElement>("#volume");
    if (slider) slider.value = String(volume);
    const output = app.querySelector<HTMLElement>("#volume-value");
    if (output) output.textContent = `${volume}%`;
  }).catch(() => undefined);
  void refreshMediaInfo();
  try {
    displays = await invoke<DisplayInfo[]>("list_displays");
    if (localStorage.getItem(KEYS.displays) === null) {
      const primary = displays.find((display) => display.isPrimary) ?? displays[0];
      selectedDisplayIds = primary ? [primary.id] : [];
    } else {
      selectedDisplayIds = selectedDisplayIds.filter((id) => displays.some((display) => display.id === id));
    }
    if (selectedDisplayIds.length === 0 && displays.length > 0) {
      const primary = displays.find((display) => display.isPrimary) ?? displays[0];
      selectedDisplayIds = [primary.id];
    }
    persistSettings();
    render();
    await applyDisplayLayout(false);
  } catch {
    // Keep the notch usable if monitor enumeration is temporarily unavailable.
  }
}

void listen<LayoutUpdate>("edge-ghosty-layout-updated", ({ payload }) => {
  if (payload.activeLabel === getCurrentWindow().label) return;
  edge = payload.edge;
  barLength = payload.barLength;
  barThickness = payload.barThickness;
  closeDelay = payload.closeDelay;
  allDisplays = payload.allDisplays;
  selectedDisplayIds = payload.selectedDisplayIds;
  expanded = false;
  persistSettings();
  render();
});

void listen<CursorPosition>("edge-ghosty-cursor", ({ payload }) => {
  const inIsland = payload.inside;
  const bodyRect = app.querySelector<HTMLElement>(".island-body")?.getBoundingClientRect();
  const pointerInBody = Boolean(bodyRect
    && payload.x >= bodyRect.left && payload.x <= bodyRect.right
    && payload.y >= bodyRect.top && payload.y <= bodyRect.bottom);
  const pointerOnApproval = !expanded && pendingCodexApprovals.length > 0 && !pointerInBody;
  if (inIsland) {
    if (hoverCloseTimer !== undefined) {
      window.clearTimeout(hoverCloseTimer);
      hoverCloseTimer = undefined;
    }
    if (!expanded && !pointerOnApproval) setExpanded(true);
  } else if (!inIsland && wasPointerInNativeIsland && expanded) {
    scheduleClose();
  }
  wasPointerInNativeIsland = inIsland;
});

const currentWindowLabel = getCurrentWindow().label;
if (currentWindowLabel === "utility-popup") window.setInterval(() => {
  if (utilityPopupMode === "focus") paintFocusTimer();
}, 250);
else window.setInterval(tickFeatures, 1000);

window.addEventListener("storage", (event) => {
  if (event.key === KEYS.utilityPopup) {
    if (currentWindowLabel === "utility-popup") {
      renderUtilityPopup();
      if (utilityPopupMode && utilityPopupBlurTimer !== undefined) {
        window.clearTimeout(utilityPopupBlurTimer);
        utilityPopupBlurTimer = undefined;
      }
    }
    return;
  }
  if (event.key === KEYS.pocket) pocketItems = readPocketItems();
  else if (event.key === KEYS.clipboard) clipboardEntries = readClipboardEntries();
  else if (event.key === KEYS.shortcuts) shortcuts = readShortcuts();
  else if (event.key === KEYS.petName) petName = localStorage.getItem(KEYS.petName) || "Ghosty";
  else if (event.key === KEYS.petSkin) petSkin = readChoice(KEYS.petSkin, ["pearl", "smoke", "midnight"], "pearl");
  else if (event.key === KEYS.petAccessory) petAccessory = readChoice(KEYS.petAccessory, ["none", "star", "bow"], "none");
  else if (event.key === KEYS.focus) focusState = readFocusState();
  else return;

  if (currentWindowLabel === "utility-popup") {
    if (event.key === KEYS.focus) paintFocusTimer();
    else if (event.key === KEYS.pocket) refreshPocketUi();
    else if (event.key === KEYS.clipboard) refreshClipboardUi();
    else if ([KEYS.petName, KEYS.petSkin, KEYS.petAccessory].includes(event.key)) renderUtilityPopup();
    return;
  }

  if (event.key === KEYS.focus || event.key === KEYS.pocket || event.key === KEYS.petName || event.key === KEYS.petSkin || event.key === KEYS.petAccessory) {
    updatePetAtmosphere();
    app.querySelectorAll<HTMLElement>(".pet-name").forEach((name) => { name.textContent = petName; });
    app.querySelectorAll<HTMLElement>(".pet").forEach((pet) => {
      pet.setAttribute("aria-label", petName);
      pet.dataset.skin = petSkin;
      pet.dataset.accessory = petAccessory;
    });
  }
  if (event.key === KEYS.pocket) refreshPocketUi();
  else if (event.key === KEYS.clipboard) refreshClipboardUi();
  else if (event.key === KEYS.shortcuts) updateActiveTab(activeTab);
  paintFocusTimer();
});
if (currentWindowLabel === "main") void startMainWindow();
else if (currentWindowLabel === "utility-popup") startUtilityPopupWindow();
else {
  render();
  bindNativeFileDrop();
  void refreshMediaInfo();
  void invoke<number>("get_system_volume").then((value) => { volume = value; }).catch(() => undefined);
}
