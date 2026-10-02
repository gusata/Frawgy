import "./style.css";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Tracked } from "./anim";

type Shortcut = { id: string; name: string; glyph: string; targets: string[]; action?: "focus"; custom?: boolean };
type PocketItem = { id: string; name: string; kind: "file" | "image" | "text"; value: string; addedAt: number; truncated?: boolean };
type ClipboardEntry = { id: string; text: string; addedAt: number; pinned?: boolean };
type PetSkin = "pearl" | "smoke" | "midnight";
type PetAccessory = "none" | "star" | "bow";
type FocusState = { durationMs: number; remainingMs: number; endsAt: number; running: boolean };
type MediaInfo = { title: string; artist: string; playing: boolean };
type Edge = "left" | "top" | "bottom";
type MenuTab = "home" | "pet" | "shortcuts";
type PetPanel = "pocket" | "customize";
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
};
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
let petPanel: PetPanel | null = null;
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
let petName = localStorage.getItem(KEYS.petName) || "Mochi";
let petSkin: PetSkin = readChoice(KEYS.petSkin, ["pearl", "smoke", "midnight"], "pearl");
let petAccessory: PetAccessory = readChoice(KEYS.petAccessory, ["none", "star", "bow"], "none");
let focusState = readFocusState();
let mediaInfo: MediaInfo = { title: "", artist: "", playing: false };
let petMoodOverride = "";
let petMoodUntil = 0;
let pocketDropActive = false;
let pocketNotice = "Solte arquivos ou texto para guardar";
let petDropFeedback = "";
let petDropFeedbackTimer: number | undefined;
let clipboardNotice = "";
let pendingPocketValues = new Set<string>();
let hoverCloseTimer: number | undefined;
let geometryFrame = 0;
let petPokes = 0;
let petPokeReset: number | undefined;
let petLoveTimer: number | undefined;
let petModeTimer: number | undefined;
let lastPetLove = 0;
let hasGreetedPet = false;
let geometryMotion: {
  body: HTMLElement;
  width: Tracked;
  height: Tracked;
  radius: Tracked;
} | undefined;
let lastPublishedBody: HTMLElement | undefined;
let lastPublishedRect: (CursorPosition & { width: number; height: number }) | undefined;
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
  const rect = body.getBoundingClientRect();
  if (lastPublishedBody !== body) {
    lastPublishedBody = body;
    lastPublishedRect = undefined;
  }
  const next = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
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

function renderPetCharacter(className = "") {
  return `
    <button class="pet ${className}" data-skin="${petSkin}" data-accessory="${petAccessory}" data-mood="${getPetMood()}" type="button" aria-label="${escapeHtml(petName)}">
      <span class="pet-ear left"></span><span class="pet-ear right"></span>
      <span class="pet-face" aria-hidden="true"><i></i><i></i></span>
      <span class="pet-paw" aria-hidden="true"></span>
      <span class="pet-accessory" aria-hidden="true"></span>
    </button>`;
}

function renderPocketItems(limit = 8) {
  if (pocketItems.length === 0) return `<div class="pocket-empty"><span>◌</span><small>${escapeHtml(pocketNotice)}</small></div>`;
  return pocketItems.slice(0, limit).map((item) => `
    <article class="pocket-item" data-pocket-kind="${item.kind}">
      <span class="pocket-item-icon">${item.kind === "image" ? "▧" : item.kind === "text" ? "¶" : "▤"}</span>
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

function renderLauncherItems() {
  const items = [...LAUNCHER_DEFAULTS, ...shortcuts.filter((shortcut) => !shortcut.action)];
  return items.map((item) => `
    <button class="launch-item" data-action="launch-item" data-launch-id="${escapeHtml(item.id)}" data-launch-name="${escapeHtml(item.name.toLowerCase())}">
      <span>${escapeHtml(item.glyph)}</span><small>${escapeHtml(item.name)}</small>
    </button>`).join("");
}

function formatDuration(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function renderFocusTile() {
  const remaining = focusRemainingMs();
  const progress = focusState.durationMs > 0 ? 100 - remaining / focusState.durationMs * 100 : 0;
  return `
    <section class="home-tile home-focus">
      <div class="tile-heading"><span>Foco</span><span class="focus-countdown" id="focus-countdown">${formatDuration(remaining)}</span></div>
      <div class="focus-progress"><i id="focus-progress" style="--progress:${progress}%"></i></div>
      <small class="focus-status" id="focus-status"></small>
      <div class="focus-controls"><label class="duration-control"><input id="focus-minutes" type="number" min="1" max="180" value="${Math.max(1, Math.round(focusState.durationMs / 60_000))}" ${focusState.running ? "disabled" : ""} aria-label="Duração do foco em minutos" /> min</label><button class="tile-action" data-action="focus-toggle">${focusState.running ? "Pausar" : remaining === 0 ? "Recomeçar" : "Iniciar"}</button><button class="tile-action quiet" data-action="focus-reset" aria-label="Reiniciar temporizador" title="Reiniciar">↺</button></div>
    </section>`;
}

function renderHomePage() {
  return `
    <div class="home-grid">
      <section class="home-tile home-volume">
        <div class="tile-heading"><span>Volume</span><output id="volume-value">${volume}%</output></div>
        <input id="volume" type="range" min="0" max="100" value="${volume}" aria-label="Volume do sistema" />
        <div class="range-labels"><span>silencioso</span><span>alto</span></div>
      </section>
      <section class="home-tile home-media">
        <div class="tile-heading"><span>Agora tocando</span><button class="tile-link" data-action="refresh-media">atualizar</button></div>
        <div class="media-copy"><strong class="media-title">${escapeHtml(mediaInfo.title || "Nada tocando agora")}</strong><small class="media-artist">${escapeHtml(mediaInfo.artist || "Se a música estiver tocando, use os controles")}</small></div>
        <div class="media-controls"><button data-action="media-previous" aria-label="Faixa anterior" title="Anterior">|◀</button><button class="media-play" data-action="media-toggle" aria-label="Reproduzir ou pausar" title="Reproduzir ou pausar">${mediaInfo.playing ? "Ⅱ" : "▶"}</button><button data-action="media-next" aria-label="Próxima faixa" title="Próxima">▶|</button></div>
      </section>
      ${renderFocusTile()}
      <section class="home-tile home-launcher">
        <div class="tile-heading"><span>Abre rapidinho</span><button class="tile-link" data-tab="shortcuts">todos</button></div>
        <input class="launcher-search" data-launcher-search placeholder="App, pasta ou site…" aria-label="Buscar aplicativo, pasta ou site" />
        <div class="launcher-items">${renderLauncherItems()}</div>
      </section>
      <section class="home-tile home-pocket">
        <div class="tile-heading"><span>Bolso do ${escapeHtml(petName)}</span><span class="item-count">${pocketItems.length}/8</span></div>
        <div class="pocket-preview">${renderPocketItems(2)}</div>
        <small class="pocket-status">${escapeHtml(pocketNotice)}</small>
        <button class="tile-link pocket-add-clipboard" data-action="pocket-clipboard">guardar texto copiado</button>
      </section>
      <section class="home-tile home-clipboard">
        <div class="tile-heading"><span>Prancheta</span><button class="tile-link" data-action="clipboard-capture">capturar</button></div>
        <div class="clipboard-list">${renderClipboardEntries(3)}</div>
        <small class="clipboard-status">${escapeHtml(clipboardNotice)}</small>
      </section>
      <section class="home-tile home-pet-summary">
        <div class="home-pet-row">${renderPetCharacter("pet-home")}<div class="home-pet-copy"><strong>${escapeHtml(petName)}</strong><small>${escapeHtml(petMoodLabel())}</small></div><button class="tile-link" data-tab="pet">ver</button></div>
      </section>
    </div>`;
}

function renderPetPanel() {
  if (!petPanel) return "";
  const title = petPanel === "pocket" ? `Bolso do ${escapeHtml(petName)}` : "Personalizar o Mochi";
  const content = petPanel === "pocket"
    ? `
      <div class="pocket-dropzone ${pocketDropActive ? "is-dragging" : ""}" data-dropzone="pocket"><span>↓</span><strong>${pocketDropActive ? "Pode soltar, eu pego!" : "Solte um arquivo ou texto no Mochi"}</strong><small>O original continua no lugar.</small></div>
      <small class="pocket-status">${escapeHtml(pocketNotice)}</small>
      <div class="pocket-items">${renderPocketItems()}</div>
      <button class="secondary-action" data-action="pocket-clipboard">＋ guardar o texto copiado</button>`
    : `
      <form class="pet-name-form" data-action="pet-name-form"><input name="pet-name" value="${escapeHtml(petName)}" maxlength="24" aria-label="Nome do pet" /><button class="secondary-action">Salvar nome</button></form>
      <label class="custom-label" for="pet-skin">Aparência</label><select id="pet-skin"><option value="pearl" ${petSkin === "pearl" ? "selected" : ""}>Pérola</option><option value="smoke" ${petSkin === "smoke" ? "selected" : ""}>Fumaça</option><option value="midnight" ${petSkin === "midnight" ? "selected" : ""}>Meia-noite</option></select>
      <label class="custom-label" for="pet-accessory">Acessório</label><select id="pet-accessory"><option value="none" ${petAccessory === "none" ? "selected" : ""}>Sem acessório</option><option value="star" ${petAccessory === "star" ? "selected" : ""}>Estrelinha</option><option value="bow" ${petAccessory === "bow" ? "selected" : ""}>Laço</option></select>`;
  return `
    <button class="pet-panel-backdrop" data-action="pet-panel-close" aria-label="Fechar painel"></button>
    <aside class="pet-panel ${petPanel === "pocket" ? "pet-pocket-card" : "pet-customize"}" aria-label="${title}">
      <header class="pet-panel-heading"><strong>${title}</strong><button class="pet-tool" data-action="pet-panel-close" aria-label="Fechar">×</button></header>
      ${content}
    </aside>`;
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
        <div class="pet-tools" aria-label="Ações do Mochi">
          <button class="pet-tool" data-action="pet-panel-open" data-panel="pocket" aria-label="Abrir bolso do Mochi" title="Bolso">▤</button>
          <button class="pet-tool" data-action="pet-panel-open" data-panel="customize" aria-label="Personalizar Mochi" title="Personalizar">⚙</button>
        </div>
      </div>
      ${renderPetPanel()}
    </div>`;
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
      <div class="page-heading"><span>Atalhos e lançador</span></div>
      <input class="launcher-search full-launcher-search" data-launcher-search placeholder="Buscar, abrir ou pesquisar na web…" aria-label="Buscar aplicativo, pasta ou endereço" />
      <div class="launcher-items launcher-results">${renderLauncherItems()}</div>
      <div class="page-heading shortcut-heading"><span>Seus atalhos</span><small>arraste para reordenar</small></div>
      <div class="shortcut-grid" data-dropzone="shortcuts">${renderShortcuts()}</div>
      <button class="secondary-action add-action-toggle" data-action="toggle-shortcut-form">＋ criar ação personalizada</button>
      <form class="custom-action-form" data-action="shortcut-form" hidden>
        <label>Nome<input name="action-name" maxlength="24" placeholder="Ex.: Começar o dia" required /></label>
        <label>Aplicativo, pasta ou endereço<textarea name="action-targets" rows="2" placeholder="Um destino por linha. Ex.: wt.exe&#10;https://calendar.google.com" required></textarea></label>
        <small>Uma ação pode abrir vários destinos, na ordem indicada.</small>
        <button class="secondary-action">Salvar ação</button>
      </form>
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

function savePocket(): boolean {
  try {
    localStorage.setItem(KEYS.pocket, JSON.stringify(pocketItems.slice(0, 8)));
    return true;
  } catch (error) {
    console.error("Não consegui salvar o Bolso do Mochi", error);
    pocketNotice = "Não consegui salvar no armazenamento deste app";
    return false;
  }
}

function showPetDropFeedback(message: string) {
  petDropFeedback = message;
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

function addPocketItem(item: PocketItem, origin?: { x: number; y: number }) {
  if (pocketItems.some((existing) => existing.value === item.value && existing.kind === item.kind)
    || pendingPocketValues.has(item.value)) {
    pocketNotice = "Esse já está guardado";
    if (origin) showPetDropFeedback("Esse já está no Bolso");
    updateActiveTab(activeTab);
    return;
  }
  const pendingItemsNotInPocket = [...pendingPocketValues].filter((value) =>
    !pocketItems.some((existing) => existing.value === value),
  ).length;
  if (pocketItems.length + pendingItemsNotInPocket >= 8) {
    pocketNotice = "O bolso está cheio — tire algo antes";
    if (origin) showPetDropFeedback("O Bolso está cheio");
    updateActiveTab(activeTab);
    return;
  }
  pendingPocketValues.add(item.value);
  pocketItems.unshift(item);
  pocketItems = pocketItems.slice(0, 8);
  if (!savePocket()) {
    pocketItems = pocketItems.filter((existing) => existing.id !== item.id);
    pendingPocketValues.delete(item.value);
    if (origin) showPetDropFeedback("Não consegui guardar o arquivo");
    updateActiveTab(activeTab);
    return;
  }
  const pet = app.querySelector<HTMLElement>(".tab-view .pet") ?? app.querySelector<HTMLElement>(".brand-mark");
  const bounds = pet?.getBoundingClientRect();
  const start = origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const end = bounds ? { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 } : start;
  const morsel = document.createElement("div");
  morsel.className = "pocket-morsel";
  morsel.textContent = item.kind === "image" ? "▧" : item.kind === "text" ? "¶" : "▤";
  morsel.style.left = `${start.x}px`;
  morsel.style.top = `${start.y}px`;
  morsel.style.setProperty("--morsel-x", `${end.x - start.x}px`);
  morsel.style.setProperty("--morsel-y", `${end.y - start.y}px`);
  document.body.append(morsel);
  if (pet) pet.classList.add("is-eating");
  pocketNotice = `${petName} está comendo…`;
  const petHint = app.querySelector<HTMLElement>(".pet-profile-hint");
  if (petHint) petHint.textContent = `${petName} está comendo ${item.name}`;
  pocketDropActive = false;
  setPetMood("chewing", 720);
  requestAnimationFrame(() => morsel.classList.add("is-flying"));
  window.setTimeout(() => {
    morsel.remove();
    pendingPocketValues.delete(item.value);
    if (pocketItems.some((saved) => saved.id === item.id)) {
      pocketNotice = "Guardado no bolso — o original continua no lugar";
      if (origin) showPetDropFeedback("Guardado no Bolso do Mochi");
    }
    savePocket();
    updateActiveTab(activeTab);
    updatePetAtmosphere();
  }, 650);
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
      updateActiveTab(activeTab);
      return;
    }
    if (intoPocket) {
      addPocketItem({ id: makeId(), name: text.replace(/\s+/g, " ").slice(0, 28) || "Texto", kind: "text", value: text, addedAt: Date.now(), truncated: copiedText.length > MAX_SAVED_TEXT }, origin);
      return;
    }
    const existing = clipboardEntries.filter((entry) => entry.text !== text);
    const pinned = existing.filter((entry) => entry.pinned);
    const fresh = { id: makeId(), text, addedAt: Date.now() };
    const recent = [fresh, ...existing.filter((entry) => !entry.pinned)].slice(0, Math.max(0, 12 - pinned.length));
    clipboardEntries = [...pinned, ...recent].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.addedAt - a.addedAt);
    localStorage.setItem(KEYS.clipboard, JSON.stringify(clipboardEntries));
    clipboardNotice = copiedText.length > MAX_SAVED_TEXT ? "Guardei os primeiros 50 mil caracteres." : "Texto guardado nesta prancheta.";
    updateActiveTab(activeTab);
  } catch {
    if (intoPocket) pocketNotice = "Não consegui ler o texto da prancheta.";
    else clipboardNotice = "Não consegui ler o texto da prancheta.";
    updateActiveTab(activeTab);
  }
}

async function copyClipboardText(text: string) {
  try {
    await invoke("write_clipboard_text", { text });
    clipboardNotice = "Copiado para a área de transferência.";
  } catch {
    clipboardNotice = "Não consegui copiar este texto.";
  }
  updateActiveTab(activeTab);
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
  if (toggle) toggle.textContent = focusState.running ? "Pausar" : remaining === 0 ? "Recomeçar" : "Iniciar";
  const durationInput = app.querySelector<HTMLInputElement>("#focus-minutes");
  if (durationInput) durationInput.disabled = focusState.running;
  const status = app.querySelector<HTMLElement>("#focus-status");
  if (status) status.textContent = focusState.running ? "Mochi está focando com você" : remaining === 0 ? "Ciclo completo · hora de alongar" : "Escolha de 1 a 180 minutos";
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
  app.querySelectorAll<HTMLElement>(".media-artist").forEach((element) => { element.textContent = mediaInfo.artist || "Se a música estiver tocando, use os controles"; });
  app.querySelectorAll<HTMLElement>("[data-action=media-toggle]").forEach((element) => { element.textContent = mediaInfo.playing ? "Ⅱ" : "▶"; });
}

function launchShortcut(shortcut: Shortcut) {
  if (shortcut.action === "focus") {
    if (activeTab !== "home") updateActiveTab("home");
    if (!focusState.running) startFocus();
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
    pet.addEventListener("mouseenter", () => {
      if (petLoveTimer !== undefined) window.clearTimeout(petLoveTimer);
      petLoveTimer = window.setTimeout(() => {
        petLoveTimer = undefined;
        if (pet.matches(":hover") && Date.now() - lastPetLove > 6000) {
          lastPetLove = Date.now();
          pet.classList.add("is-loving");
          setPetMood("happy", 1500);
          window.setTimeout(() => pet.classList.remove("is-loving"), 1500);
        }
      }, 1900);
    });
    pet.addEventListener("mouseleave", () => {
      if (petLoveTimer !== undefined) window.clearTimeout(petLoveTimer);
      petLoveTimer = undefined;
      pet.classList.remove("is-loving");
    });
    pet.addEventListener("click", () => {
      if (petPokeReset !== undefined) window.clearTimeout(petPokeReset);
      if (petModeTimer !== undefined) window.clearTimeout(petModeTimer);
      pet.classList.remove("is-loving", "is-annoyed", "is-dizzy");
      petPokes += 1;
      if (petPokes >= 3) {
        petPokes = 0;
        pet.classList.add("is-dizzy");
        setPetMood("dizzy", 1300);
        petModeTimer = window.setTimeout(() => pet.classList.remove("is-dizzy"), 1300);
      } else {
        pet.classList.add("is-annoyed");
        setPetMood("annoyed", 650);
        petModeTimer = window.setTimeout(() => pet.classList.remove("is-annoyed"), 650);
      }
      petPokeReset = window.setTimeout(() => { petPokes = 0; }, 1800);
    });
  });
}

function bindPocketDropzone(dropzone: HTMLElement) {
  dropzone.addEventListener("dragenter", (event) => { event.preventDefault(); pocketDropActive = true; dropzone.classList.add("is-dragging"); });
  dropzone.addEventListener("dragover", (event) => { event.preventDefault(); dropzone.classList.add("is-dragging"); });
  dropzone.addEventListener("dragleave", (event) => {
    if (!dropzone.contains(event.relatedTarget as Node | null)) {
      pocketDropActive = false;
      dropzone.classList.remove("is-dragging");
    }
  });
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    pocketDropActive = false;
    dropzone.classList.remove("is-dragging");
    const text = event.dataTransfer?.getData("text/plain").trim();
    if (text) addPocketItem({ id: makeId(), name: text.replace(/\s+/g, " ").slice(0, 28), kind: "text", value: text.slice(0, MAX_SAVED_TEXT), addedAt: Date.now(), truncated: text.length > MAX_SAVED_TEXT }, { x: event.clientX, y: event.clientY });
  });
}

async function bindNativeFileDrop() {
  try {
    await getCurrentWindow().onDragDropEvent(async (event) => {
      if (event.payload.type === "enter") {
        pocketDropActive = true;
        if (!settingsOpen) {
          petPanel = null;
          updateActiveTab("pet");
        }
        setExpanded(true);
        app.querySelector<HTMLElement>(".edge-island")?.classList.add("is-file-dragging");
        const dropzone = app.querySelector<HTMLElement>("[data-dropzone=pocket]");
        dropzone?.classList.add("is-dragging");
        const prompt = dropzone?.querySelector<HTMLElement>(".pet-drop-prompt");
        if (prompt) prompt.textContent = "Pode soltar, eu pego!";
        return;
      }
      if (event.payload.type === "over") {
        app.querySelector<HTMLElement>(".edge-island")?.classList.add("is-file-dragging");
        app.querySelector("[data-dropzone=pocket]")?.classList.add("is-dragging");
        return;
      }
      if (event.payload.type === "leave") {
        pocketDropActive = false;
        app.querySelector<HTMLElement>(".edge-island")?.classList.remove("is-file-dragging");
        const dropzone = app.querySelector<HTMLElement>("[data-dropzone=pocket]");
        dropzone?.classList.remove("is-dragging");
        const prompt = dropzone?.querySelector<HTMLElement>(".pet-drop-prompt");
        if (prompt) prompt.textContent = pocketItems.length ? "Arraste mais alguma coisa" : "Solte um arquivo ou texto no Mochi";
        return;
      }

      pocketDropActive = false;
      app.querySelector<HTMLElement>(".edge-island")?.classList.remove("is-file-dragging");
      const dropzone = app.querySelector<HTMLElement>("[data-dropzone=pocket]");
      dropzone?.classList.remove("is-dragging");
      const prompt = dropzone?.querySelector<HTMLElement>(".pet-drop-prompt");
      const paths = event.payload.paths.filter((path) => path.trim().length > 0);
      if (paths.length === 0) {
        pocketNotice = "Não recebi o arquivo. Solte-o sobre o Mochi novamente.";
        showPetDropFeedback("Não recebi o arquivo");
        if (prompt) prompt.textContent = "Não recebi o arquivo";
        updateActiveTab(activeTab);
        return;
      }
      if (prompt) prompt.textContent = `${petName} está comendo…`;
      const scale = await getCurrentWindow().scaleFactor().catch(() => 1);
      const origin = { x: event.payload.position.x / scale, y: event.payload.position.y / scale };
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
      const query = input.value.trim().toLowerCase();
      tabView.querySelectorAll<HTMLElement>(".launch-item").forEach((item) => {
        item.hidden = !!query && !item.dataset.launchName?.includes(query);
      });
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
  tabView.querySelectorAll<HTMLButtonElement>("[data-action=copy-clipboard]").forEach((button) => button.addEventListener("click", () => {
    const entry = clipboardEntries.find((item) => item.id === button.dataset.clipboardId);
    if (entry) void copyClipboardText(entry.text);
  }));
  tabView.querySelectorAll<HTMLButtonElement>("[data-action=toggle-clipboard-pin]").forEach((button) => button.addEventListener("click", () => {
    const entry = clipboardEntries.find((item) => item.id === button.dataset.clipboardId);
    if (!entry) return;
    entry.pinned = !entry.pinned;
    clipboardEntries.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.addedAt - a.addedAt);
    localStorage.setItem(KEYS.clipboard, JSON.stringify(clipboardEntries));
    updateActiveTab(activeTab);
  }));
  tabView.querySelectorAll<HTMLButtonElement>("[data-action=remove-clipboard]").forEach((button) => button.addEventListener("click", () => {
    clipboardEntries = clipboardEntries.filter((item) => item.id !== button.dataset.clipboardId);
    localStorage.setItem(KEYS.clipboard, JSON.stringify(clipboardEntries));
    updateActiveTab(activeTab);
  }));
  tabView.querySelectorAll<HTMLButtonElement>("[data-action=open-pocket]").forEach((button) => button.addEventListener("click", () => {
    const item = pocketItems.find((entry) => entry.id === button.dataset.pocketId);
    if (!item) return;
    if (item.kind === "text") void copyClipboardText(item.value);
    else void invoke("open_targets", { targets: [item.value] }).catch(() => undefined);
  }));
  tabView.querySelectorAll<HTMLButtonElement>("[data-action=remove-pocket]").forEach((button) => button.addEventListener("click", () => {
    pocketItems = pocketItems.filter((entry) => entry.id !== button.dataset.pocketId);
    savePocket();
    updateActiveTab(activeTab);
  }));
  tabView.querySelectorAll<HTMLElement>("[data-dropzone=pocket]").forEach(bindPocketDropzone);

  tabView.querySelectorAll<HTMLButtonElement>("[data-action=pet-panel-open]").forEach((button) => button.addEventListener("click", () => {
    petPanel = button.dataset.panel === "customize" ? "customize" : "pocket";
    updateActiveTab("pet");
  }));
  tabView.querySelectorAll<HTMLButtonElement>("[data-action=pet-panel-close]").forEach((button) => button.addEventListener("click", () => {
    petPanel = null;
    updateActiveTab("pet");
  }));

  tabView.querySelector<HTMLFormElement>("[data-action=pet-name-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = (event.currentTarget as HTMLFormElement).elements.namedItem("pet-name") as HTMLInputElement;
    petName = input.value.trim().slice(0, 24) || "Mochi";
    localStorage.setItem(KEYS.petName, petName);
    updateActiveTab(activeTab);
  });
  tabView.querySelector<HTMLSelectElement>("#pet-skin")?.addEventListener("change", (event) => {
    petSkin = (event.target as HTMLSelectElement).value as PetSkin;
    localStorage.setItem(KEYS.petSkin, petSkin);
    updatePetAtmosphere();
  });
  tabView.querySelector<HTMLSelectElement>("#pet-accessory")?.addEventListener("change", (event) => {
    petAccessory = (event.target as HTMLSelectElement).value as PetAccessory;
    localStorage.setItem(KEYS.petAccessory, petAccessory);
    updatePetAtmosphere();
  });

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

function updateActiveTab(tab: MenuTab) {
  const previousTab = activeTab;
  activeTab = tab;
  if (tab !== "pet") petPanel = null;
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
        <button class="back-button" data-action="settings-back" aria-label="Voltar ao menu">&lsaquo;</button>
        <div><strong>Configurações</strong><small>aparência e comportamento</small></div>
        <button class="icon-button" data-action="close" aria-label="Fechar">&times;</button>
      </header>
      <div class="settings-scroll">
        <p class="settings-intro">Ajuste a barrinha e escolha as telas onde o Edge Mochi aparece.</p>
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
        <p class="settings-note">As curvas do notch acompanham o comprimento e a orientação da barrinha.</p>
        <button class="reset-button" data-action="reset-settings">Restaurar configurações padrão</button>
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
  if (value && !hasGreetedPet) {
    hasGreetedPet = true;
    const pet = island.querySelector<HTMLElement>(".pet");
    pet?.classList.add("is-greeting");
    window.setTimeout(() => pet?.classList.remove("is-greeting"), 2400);
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

function render() {
  app.innerHTML = `
    <section class="edge-island ${expanded ? "is-expanded" : ""} ${settingsOpen ? "settings-open" : ""}" aria-label="Edge Mochi">
      <div class="island-body">
        <button class="peek-line" aria-label="Abrir Edge Mochi"><span></span><span></span><span></span></button>
        <div class="island-content">
          <header class="menu-header">
            <div class="brand-mark">✦</div>
            <div class="header-title"><strong>Edge Mochi</strong><small>controles rápidos</small></div>
            <nav class="menu-tabs" role="group" aria-label="Seções do Edge Mochi">
              <button class="icon-button menu-tab ${activeTab === "home" ? "is-active" : ""}" aria-pressed="${activeTab === "home"}" data-tab="home" aria-label="Início" title="Início">⌂</button>
              <button class="icon-button menu-tab ${activeTab === "pet" ? "is-active" : ""}" aria-pressed="${activeTab === "pet"}" data-tab="pet" aria-label="Pet" title="Pet">◉</button>
              <button class="icon-button menu-tab ${activeTab === "shortcuts" ? "is-active" : ""}" aria-pressed="${activeTab === "shortcuts"}" data-tab="shortcuts" aria-label="Atalhos" title="Atalhos">⌘</button>
            </nav>
            <button class="icon-button settings-button" data-action="settings" aria-label="Abrir configurações" title="Configurações">⚙</button>
            <button class="icon-button close-button" data-action="close" aria-label="Fechar" title="Fechar">×</button>
          </header>
          <main class="tab-view" role="tabpanel">${renderActiveTab()}</main>
          <footer><span>Ctrl + Space</span><span class="footer-hint">encoste na barrinha</span></footer>
        </div>
      </div>
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
    if (expanded) scheduleClose();
  });
  island.querySelector(".peek-line")?.addEventListener("click", (event) => {
    event.stopPropagation();
    setExpanded(!expanded);
  });

  body.addEventListener("pointermove", (event) => {
    if (!expanded) return;
    const pet = app.querySelector<HTMLElement>(".tab-view .pet");
    const petFace = pet?.querySelector<HTMLElement>(".pet-face");
    if (!pet || !petFace) return;
    const rect = pet.getBoundingClientRect();
    const x = Math.max(-2, Math.min(2, (event.clientX - (rect.left + rect.width / 2)) / 9));
    const y = Math.max(-2, Math.min(2, (event.clientY - (rect.top + rect.height / 2)) / 9));
    petFace.style.setProperty("--look-x", `${x}px`);
    petFace.style.setProperty("--look-y", `${y}px`);
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

void listen<LayoutUpdate>("edge-mochi-layout-updated", ({ payload }) => {
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

void listen<CursorPosition>("edge-mochi-cursor", ({ payload }) => {
  const inIsland = payload.inside;
  if (inIsland) {
    if (hoverCloseTimer !== undefined) {
      window.clearTimeout(hoverCloseTimer);
      hoverCloseTimer = undefined;
    }
    if (!expanded) setExpanded(true);
  } else if (!inIsland && wasPointerInNativeIsland && expanded) {
    scheduleClose();
  }
  wasPointerInNativeIsland = inIsland;
});

window.setInterval(tickFeatures, 1000);
window.addEventListener("storage", (event) => {
  if (event.key === KEYS.pocket) pocketItems = readPocketItems();
  else if (event.key === KEYS.clipboard) clipboardEntries = readClipboardEntries();
  else if (event.key === KEYS.shortcuts) shortcuts = readShortcuts();
  else if (event.key === KEYS.petName) petName = localStorage.getItem(KEYS.petName) || "Mochi";
  else if (event.key === KEYS.petSkin) petSkin = readChoice(KEYS.petSkin, ["pearl", "smoke", "midnight"], "pearl");
  else if (event.key === KEYS.petAccessory) petAccessory = readChoice(KEYS.petAccessory, ["none", "star", "bow"], "none");
  else if (event.key === KEYS.focus) focusState = readFocusState();
  else return;
  if (event.key !== KEYS.focus) updateActiveTab(activeTab);
  paintFocusTimer();
});
if (getCurrentWindow().label === "main") void startMainWindow();
else {
  render();
  bindNativeFileDrop();
  void refreshMediaInfo();
  void invoke<number>("get_system_volume").then((value) => { volume = value; }).catch(() => undefined);
}
