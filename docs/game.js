const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const frameEl = document.querySelector(".frame");
const hudElements = {
  levelLabel: document.querySelector("#level-label"),
  coinCount: document.querySelector("#coin-count"),
  collectionCount: document.querySelector("#collection-count"),
  gemCount: document.querySelector("#gem-count"),
  missionHoles: document.querySelector("#mission-holes"),
  missionTreasure: document.querySelector("#mission-treasure"),
  missionTrash: document.querySelector("#mission-trash"),
  toolCollection: document.querySelector("#tool-collection"),
  toolBell: document.querySelector("#tool-bell"),
  xpCount: document.querySelector("#xp-count"),
  xpFill: document.querySelector("#xp-fill"),
  digButton: document.querySelector("#dig-button"),
  bagButton: document.querySelector("#bag-button"),
  stageButton: document.querySelector("#stage-button"),
  settingsButton: document.querySelector("#settings-button"),
  settingsModal: document.querySelector("#settings-modal"),
  settingsClose: document.querySelector("#settings-close"),
  debugToggle: document.querySelector("#debug-toggle"),
  debugState: document.querySelector("#debug-state"),
  bagModal: document.querySelector("#bag-modal"),
  bagClose: document.querySelector("#bag-close"),
  bagItems: document.querySelector("#bag-items"),
  stageMenu: document.querySelector("#stage-menu"),
  stageList: document.querySelector("#stage-list"),
  stageClose: document.querySelector("#stage-close"),
  missionPanel: document.querySelector(".mission-panel"),
  missionTitle: document.querySelector(".mission-title"),
};

const itemCatalogs = {
  stage1: {
    amber: { name: "琥珀", kind: "treasure", sprite: 0 },
    bell: { name: "小さな鈴", kind: "treasure", sprite: 1 },
    ribbon: { name: "ピンクのリボン", kind: "treasure", sprite: 2 },
    acorn: { name: "森のどんぐり", kind: "treasure", sprite: 3 },
    shell: { name: "きれいな貝殻", kind: "treasure", sprite: 4 },
    medal: { name: "古いメダル", kind: "treasure", sprite: 5 },
    marble: { name: "青いビー玉", kind: "treasure", sprite: 6 },
    goldenFeather: { name: "金色の羽根", kind: "treasure", sprite: 7 },
    birdCharm: { name: "小鳥のチャーム", kind: "treasure", sprite: 8 },
    bottlecap: { name: "王冠キャップ", kind: "trash", sprite: 9 },
    wrapper: { name: "キャンディの包み紙", kind: "trash", sprite: 10 },
    twig: { name: "へんな小枝", kind: "trash", sprite: 11 },
    tornPaper: { name: "破れた紙切れ", kind: "trash", sprite: 12 },
    emptyCan: { name: "空き缶", kind: "trash", sprite: 13 },
    rustyScrew: { name: "さびたネジ", kind: "trash", sprite: 14 },
    muddyCloth: { name: "泥だらけの布", kind: "trash", sprite: 15 },
    crackedButton: { name: "割れたボタン", kind: "trash", sprite: 16 },
    crumpledBag: { name: "くしゃくしゃ袋", kind: "trash", sprite: 17 },
  },
  stage2: {
    moonstone: { name: "月光石", kind: "treasure", sprite: 0 },
    oldCollar: { name: "古い首輪", kind: "treasure", sprite: 1 },
    blueMushroom: { name: "夜光きのこ", kind: "treasure", sprite: 2 },
    greenVial: { name: "緑の小瓶", kind: "treasure", sprite: 3 },
    forestCharm: { name: "森の護符", kind: "treasure", sprite: 4 },
    silverBerry: { name: "銀色の実", kind: "treasure", sprite: 5 },
    echoBell: { name: "こだまの鈴", kind: "treasure", sprite: 6 },
    mistCrystal: { name: "霧の結晶", kind: "treasure", sprite: 7 },
    oldRing: { name: "古びた指輪", kind: "treasure", sprite: 8 },
    crackedMask: { name: "ひび割れた小面", kind: "trash", sprite: 9 },
    blackFeather: { name: "黒い羽根", kind: "trash", sprite: 10 },
    rustyKey: { name: "錆びた鍵", kind: "trash", sprite: 11 },
    wiltedBouquet: { name: "しおれた花束", kind: "trash", sprite: 12 },
    dirtyBandage: { name: "汚れた包帯", kind: "trash", sprite: 13 },
    chippedGear: { name: "欠けた歯車", kind: "trash", sprite: 14 },
    sootyTag: { name: "すすけた札", kind: "trash", sprite: 15 },
    bentNail: { name: "曲がった釘", kind: "trash", sprite: 16 },
    slimyStone: { name: "ぬめる石", kind: "trash", sprite: 17 },
  },
  stage3: {
    sunShard: { name: "陽だまりの欠片", kind: "treasure", sprite: 0 },
    clearCrystal: { name: "透き通った結晶", kind: "treasure", sprite: 1 },
    ancientCoin: { name: "古代の硬貨", kind: "treasure", sprite: 2 },
    glowingStalactite: { name: "光る鍾乳石片", kind: "treasure", sprite: 3 },
    cavePearl: { name: "洞窟真珠", kind: "treasure", sprite: 4 },
    goldenSand: { name: "金色の砂粒", kind: "treasure", sprite: 5 },
    compassStone: { name: "古い方位石", kind: "treasure", sprite: 6 },
    rainbowDrop: { name: "虹色の雫", kind: "treasure", sprite: 7 },
    sunSigil: { name: "太陽紋の札", kind: "treasure", sprite: 8 },
    batButton: { name: "コウモリのボタン", kind: "trash", sprite: 9 },
    brokenLamp: { name: "壊れたランタン", kind: "trash", sprite: 10 },
    strangeBone: { name: "ふしぎな骨", kind: "trash", sprite: 11 },
    chippedPottery: { name: "欠けた陶片", kind: "trash", sprite: 12 },
    sootyRope: { name: "すすけたロープ", kind: "trash", sprite: 13 },
    dampPapers: { name: "湿った紙束", kind: "trash", sprite: 14 },
    crackedLens: { name: "割れたレンズ", kind: "trash", sprite: 15 },
    emptyBottle: { name: "からっぽの薬瓶", kind: "trash", sprite: 16 },
    rustyClasp: { name: "さびた留め具", kind: "trash", sprite: 17 },
  },
};
const allItemIds = [...new Set(Object.values(itemCatalogs).flatMap((catalog) => Object.keys(catalog)))];
const PATH_GRID = 32;
const PATH_SAMPLE = 10;
const TREE_FADE_ALPHA = 0.42;
const ITEM_SHEET_COLUMNS = 3;
const MAX_BURIED_ITEMS = 8;
const DIG_SPOT_MIN_DISTANCE = 78;
const MAX_LEVEL = 15;
const ASSET_VERSION = "30";

const stages = [
  {
    id: "stage1",
    number: "ステージ1",
    name: "森の入口",
    description: "Lv.0から",
    unlockLevel: 0,
    image: "assets/map/forest-cat-layered-preview.png",
    itemSheet: "assets/items/collectibles-sheet.png",
    files: {
      props: "data/forest-cat-props.json",
      collision: "data/forest-cat-collision.json",
      hooks: "data/forest-cat-scene-hooks.json",
    },
  },
  {
    id: "stage2",
    number: "ステージ2",
    name: "森の奥地",
    description: "Lv.6で解放",
    unlockLevel: 6,
    image: "assets/map/forest-cat-stage2-layered-preview.png",
    itemSheet: "assets/items/stage2-collectibles-sheet.png",
    files: {
      props: "data/forest-cat-stage2-props.json",
      collision: "data/forest-cat-stage2-collision.json",
      hooks: "data/forest-cat-stage2-scene-hooks.json",
    },
  },
  {
    id: "stage3",
    number: "ステージ3",
    name: "日差しの差し込む洞窟",
    description: "Lv.11で解放",
    unlockLevel: 11,
    image: "assets/map/forest-cat-stage3-layered-preview.png",
    itemSheet: "assets/items/stage3-collectibles-sheet.png",
    files: {
      props: "data/forest-cat-stage3-props.json",
      collision: "data/forest-cat-stage3-collision.json",
      hooks: "data/forest-cat-stage3-scene-hooks.json",
    },
  },
];

const keys = new Set();
const state = {
  ready: false,
  loadingStage: false,
  stageMenuOpen: true,
  settingsOpen: false,
  debugMode: false,
  currentStage: null,
  playerLevel: 0,
  cat: { x: 512, y: 405, speed: 125, facing: 1, frame: 0, frameTime: 0 },
  destination: null,
  path: [],
  pendingDigSpot: null,
  digSpots: [],
  stageRecords: {},
  collection: Object.fromEntries(allItemIds.map((id) => [id, 0])),
  notice: "",
  noticeTimer: 0,
  digTimer: 0,
  digCompleteSpot: null,
  audio: null,
  props: [],
  collision: null,
  hooks: null,
  images: new Map(),
};

function asset(path) {
  const url = new URL(path, location.href);
  url.searchParams.set("v", ASSET_VERSION);
  return url.href;
}

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = asset(path);
  });
}

async function boot() {
  state.images.set("cat", await loadImage("assets/cat/munchkin-walk-sheet.png"));
  state.images.set("catDig", await loadImage("assets/cat/munchkin-dig-sheet.png"));
  await loadStage("stage1");
  setStageMenuOpen(true);
  requestAnimationFrame(tick);
}

async function loadStage(stageId) {
  const stage = stages.find((item) => item.id === stageId);
  if (!stage || state.loadingStage) return;
  state.loadingStage = true;
  try {
    state.ready = false;
    state.destination = null;
    state.path = [];
    state.pendingDigSpot = null;
    state.digTimer = 0;
    state.digCompleteSpot = null;

    const [props, collision, hooks] = await Promise.all([
      fetch(asset(stage.files.props)).then((res) => res.json()),
      fetch(asset(stage.files.collision)).then((res) => res.json()),
      fetch(asset(stage.files.hooks)).then((res) => res.json()),
    ]);

    state.currentStage = stage;
    state.collision = collision;
    state.hooks = hooks;
    state.cat.x = hooks.player_spawn.x;
    state.cat.y = hooks.player_spawn.y;
    state.cat.facing = 1;
    state.cat.frame = 0;
    state.cat.frameTime = 0;

    state.images.set("base", await loadImage(props.base));
    state.images.set("items", await loadImage(stage.itemSheet));

    await Promise.all(
      Object.entries(props.props).map(async ([id, path]) => {
        if (!state.images.has(id)) {
          state.images.set(id, await loadImage(path));
        }
      }),
    );
    state.props = props.placements;
    initDigSpots();
    state.ready = true;
    updateHud();
    renderStageMenu();
  } finally {
    state.loadingStage = false;
  }
}

function initDigSpots() {
  if (state.stageRecords[state.currentStage.id]) {
    state.digSpots = state.stageRecords[state.currentStage.id].digSpots;
    return;
  }

  state.digSpots = [];
  currentBuriedItemIds().forEach((item, index) => {
    const position = randomDigSpotPosition(state.digSpots);
    state.digSpots.push({ id: `${state.currentStage.id}_buried_${index}_${item}`, x: position.x, y: position.y, item, found: false });
  });
  state.stageRecords[state.currentStage.id] = { digSpots: state.digSpots };
}

function currentItemTypes() {
  return itemCatalogs[state.currentStage?.id] || itemCatalogs.stage1;
}

function currentBuriedItemIds() {
  const items = Object.entries(currentItemTypes());
  const treasures = items.filter(([, item]) => item.kind === "treasure").map(([id]) => id);
  const trash = items.filter(([, item]) => item.kind === "trash").map(([id]) => id);
  const treasureCount = Math.min(treasures.length, Math.ceil(MAX_BURIED_ITEMS / 2));
  const trashCount = Math.min(trash.length, MAX_BURIED_ITEMS - treasureCount);
  return shuffle([...sampleItems(treasures, treasureCount), ...sampleItems(trash, trashCount)]);
}

function sampleItems(items, count) {
  return shuffle(items).slice(0, count);
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function randomDigSpotPosition(existingSpots) {
  for (let attempt = 0; attempt < 900; attempt++) {
    const x = 110 + Math.random() * 804;
    const y = 145 + Math.random() * 490;
    if (!canMoveTo(x, y + 18)) continue;
    if (Math.hypot(x - state.cat.x, y - state.cat.y) < 100) continue;
    if (existingSpots.some((spot) => Math.hypot(x - spot.x, y - spot.y) < DIG_SPOT_MIN_DISTANCE)) continue;
    return { x, y };
  }

  const fallback = [
    { x: 430, y: 318 },
    { x: 592, y: 502 },
    { x: 226, y: 450 },
    { x: 705, y: 310 },
    { x: 332, y: 640 },
    { x: 824, y: 528 },
    { x: 174, y: 242 },
    { x: 276, y: 318 },
    { x: 522, y: 228 },
    { x: 770, y: 232 },
    { x: 884, y: 360 },
    { x: 168, y: 545 },
    { x: 286, y: 528 },
    { x: 510, y: 610 },
    { x: 650, y: 610 },
    { x: 790, y: 620 },
    { x: 612, y: 420 },
    { x: 388, y: 430 },
  ];
  return fallback[existingSpots.length % fallback.length];
}

function updateHud() {
  const itemTypes = currentItemTypes();
  const found = state.digSpots.filter((spot) => spot.found).length;
  const total = state.digSpots.length;
  const treasureTotal = state.digSpots.filter((spot) => itemTypes[spot.item]?.kind === "treasure").length;
  const trashTotal = state.digSpots.filter((spot) => itemTypes[spot.item]?.kind === "trash").length;
  const treasureFound = state.digSpots.filter((spot) => spot.found && itemTypes[spot.item]?.kind === "treasure").length;
  const trashFound = state.digSpots.filter((spot) => spot.found && itemTypes[spot.item]?.kind === "trash").length;
  const treasure = Object.entries(state.collection)
    .filter(([id, count]) => count > 0 && itemTypes[id]?.kind === "treasure")
    .map(([id, count]) => `${itemTypes[id].name} x${count}`)
    .join(" / ");
  const trash = Object.entries(state.collection)
    .filter(([id, count]) => count > 0 && itemTypes[id]?.kind === "trash")
    .map(([id, count]) => `${itemTypes[id].name} x${count}`)
    .join(" / ");
  const stageName = state.currentStage ? state.currentStage.name : "ステージ";
  const nextGoal = state.playerLevel < 6 ? 6 : state.playerLevel < 11 ? 11 : MAX_LEVEL;
  const progressBase = state.playerLevel < 6 ? 0 : state.playerLevel < 11 ? 6 : 11;
  const progressRange = Math.max(1, nextGoal - progressBase);
  const progress = Math.min(100, ((state.playerLevel - progressBase) / progressRange) * 100);
  statusEl.textContent = `${stageName} コレクション ${found}/${total}${treasure ? ` | 宝: ${treasure}` : ""}${trash ? ` | ごみ: ${trash}` : ""}`;
  hudElements.levelLabel.textContent = `Lv. ${state.playerLevel}`;
  hudElements.coinCount.textContent = (1250 + treasureFound * 125).toLocaleString("ja-JP");
  hudElements.collectionCount.textContent = found;
  hudElements.gemCount.textContent = treasureFound;
  hudElements.missionHoles.textContent = `(${Math.min(found, total)}/${total})`;
  hudElements.missionTreasure.textContent = `(${Math.min(treasureFound, treasureTotal)}/${treasureTotal})`;
  hudElements.missionTrash.textContent = `(${Math.min(trashFound, trashTotal)}/${trashTotal})`;
  hudElements.toolCollection.textContent = found;
  hudElements.toolBell.textContent = state.collection.bell || 0;
  hudElements.xpCount.textContent = `${state.playerLevel}/${nextGoal}`;
  hudElements.xpFill.style.width = `${progress}%`;
  renderBagItems();
  renderStageMenu();
}

function renderBagItems() {
  const itemTypes = currentItemTypes();
  const itemSheet = asset(state.currentStage?.itemSheet || stages[0].itemSheet);
  const collected = Object.keys(itemTypes)
    .map((id) => [id, state.collection[id] || 0])
    .filter(([, count]) => count > 0);
  if (collected.length === 0) {
    hudElements.bagItems.innerHTML = `<div class="bag-empty">まだ何も見つけていません</div>`;
    return;
  }

  hudElements.bagItems.innerHTML = collected
    .map(([id, count]) => {
      const item = itemTypes[id];
      const rows = itemSheetRows(itemTypes);
      const x = spritePositionPercent(item.sprite % ITEM_SHEET_COLUMNS, ITEM_SHEET_COLUMNS);
      const y = spritePositionPercent(Math.floor(item.sprite / ITEM_SHEET_COLUMNS), rows);
      return `
        <div class="bag-item">
          <span class="bag-item-icon" style="background-image: url('${itemSheet}'); background-size: ${ITEM_SHEET_COLUMNS * 100}% ${rows * 100}%; background-position: ${x}% ${y}%"></span>
          <span>
            <span class="bag-item-name">${item.name}</span>
            <span class="bag-item-count">x${count}</span>
          </span>
        </div>
      `;
    })
    .join("");
}

function itemSheetRows(itemTypes) {
  return Math.ceil(Object.keys(itemTypes).length / ITEM_SHEET_COLUMNS);
}

function spritePositionPercent(index, count) {
  return count <= 1 ? 0 : (index / (count - 1)) * 100;
}

function isStageUnlocked(stage) {
  return state.debugMode || state.playerLevel >= stage.unlockLevel;
}

function renderStageMenu() {
  if (!hudElements.stageList) return;
  hudElements.stageList.innerHTML = stages
    .map((stage) => {
      const unlocked = isStageUnlocked(stage);
      const selected = state.currentStage?.id === stage.id;
      const debugUnlocked = state.debugMode && state.playerLevel < stage.unlockLevel;
      const requirement = selected ? "プレイ中" : debugUnlocked ? "デバッグ解放" : unlocked ? stage.description : `Lv.${stage.unlockLevel}で解放`;
      return `
        <button
          class="stage-card"
          type="button"
          data-stage-id="${stage.id}"
          style="--stage-image: url('${asset(stage.image)}')"
          ${unlocked ? "" : "disabled"}
          aria-label="${stage.number} ${stage.name}"
        >
          <span class="stage-number">${stage.number}</span>
          <span class="stage-name">${stage.name}</span>
          <span class="stage-requirement">${requirement}</span>
        </button>
      `;
    })
    .join("");
}

function setStageMenuOpen(open) {
  state.stageMenuOpen = open;
  hudElements.stageMenu.classList.toggle("is-open", open);
  hudElements.stageMenu.setAttribute("aria-hidden", String(!open));
  frameEl.classList.toggle("is-stage-menu-open", open);
  if (open) {
    setBagOpen(false);
    setSettingsOpen(false);
    renderStageMenu();
  }
}

async function chooseStage(stageId) {
  const stage = stages.find((item) => item.id === stageId);
  if (!stage || !isStageUnlocked(stage)) return;
  unlockAudio();
  setStageMenuOpen(false);
  if (state.currentStage?.id !== stage.id) {
    await loadStage(stage.id);
  }
}

function pointInPolygon(point, polygon) {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function hitsBlocker(x, y) {
  for (const blocker of state.collision.blockers) {
    if (blocker.type === "circle") {
      const dx = x - blocker.cx;
      const dy = y - blocker.cy;
      if (Math.hypot(dx, dy) < blocker.r + state.collision.actor_radius) return true;
    }
    if (blocker.type === "ellipse") {
      const rx = blocker.rx + state.collision.actor_radius;
      const ry = blocker.ry + state.collision.actor_radius;
      const nx = (x - blocker.cx) / rx;
      const ny = (y - blocker.cy) / ry;
      if (nx * nx + ny * ny < 1) return true;
    }
  }
  return false;
}

function canMoveTo(x, y) {
  const polygon = state.collision.walkmesh.points;
  return pointInPolygon([x, y], polygon) && !hitsBlocker(x, y);
}

function nearestWalkablePoint(x, y) {
  if (canMoveTo(x, y)) return { x, y };

  let best = null;
  for (let radius = 12; radius <= 140; radius += 12) {
    const steps = Math.max(12, Math.round((Math.PI * 2 * radius) / 16));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (!canMoveTo(px, py)) continue;
      const distance = Math.hypot(px - x, py - y);
      if (!best || distance < best.distance) {
        best = { x: px, y: py, distance };
      }
    }
    if (best) return { x: best.x, y: best.y };
  }
  return null;
}

function canTravelBetween(from, to) {
  if (!from || !to || !canMoveTo(to.x, to.y)) return false;
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(distance / PATH_SAMPLE));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    if (!canMoveTo(x, y)) return false;
  }
  return true;
}

function gridPoint(gx, gy) {
  return { gx, gy, x: gx * PATH_GRID, y: gy * PATH_GRID };
}

function nearestGridNode(point, accepts = () => true) {
  const size = state.collision.size;
  const maxGx = Math.floor(size.width / PATH_GRID);
  const maxGy = Math.floor(size.height / PATH_GRID);
  const baseGx = Math.round(point.x / PATH_GRID);
  const baseGy = Math.round(point.y / PATH_GRID);
  let best = null;

  for (let radius = 0; radius <= 8; radius++) {
    for (let gx = Math.max(0, baseGx - radius); gx <= Math.min(maxGx, baseGx + radius); gx++) {
      for (let gy = Math.max(0, baseGy - radius); gy <= Math.min(maxGy, baseGy + radius); gy++) {
        if (Math.max(Math.abs(gx - baseGx), Math.abs(gy - baseGy)) !== radius) continue;
        const candidate = gridPoint(gx, gy);
        if (!canMoveTo(candidate.x, candidate.y) || !accepts(candidate)) continue;
        const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
        if (!best || distance < best.distance) {
          best = { ...candidate, distance };
        }
      }
    }
    if (best) return best;
  }
  return null;
}

function smoothPath(points) {
  if (points.length <= 1) return points.slice();
  const smoothed = [];
  let index = 0;
  while (index < points.length - 1) {
    let next = points.length - 1;
    while (next > index + 1 && !canTravelBetween(points[index], points[next])) {
      next--;
    }
    smoothed.push(points[next]);
    index = next;
  }
  return smoothed;
}

function buildPath(start, target) {
  if (!target) return [];
  if (canTravelBetween(start, target)) return [target];

  const startNode = nearestGridNode(start, (node) => canTravelBetween(start, node));
  const goalNode = nearestGridNode(target, (node) => canTravelBetween(node, target));
  if (!startNode || !goalNode) return [target];

  const keyFor = (node) => `${node.gx},${node.gy}`;
  const goalKey = keyFor(goalNode);
  const open = new Map();
  const closed = new Set();
  const startKey = keyFor(startNode);
  open.set(startKey, {
    ...startNode,
    key: startKey,
    g: 0,
    f: Math.hypot(goalNode.x - startNode.x, goalNode.y - startNode.y),
    parent: null,
  });

  const offsets = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];

  for (let guard = 0; open.size > 0 && guard < 2500; guard++) {
    let current = null;
    for (const node of open.values()) {
      if (!current || node.f < current.f) current = node;
    }

    open.delete(current.key);
    if (current.key === goalKey) {
      const route = [];
      let node = current;
      while (node) {
        route.push({ x: node.x, y: node.y });
        node = node.parent;
      }
      route.reverse();
      return smoothPath([{ x: start.x, y: start.y }, ...route, target]);
    }

    closed.add(current.key);
    for (const [ox, oy] of offsets) {
      const neighbor = gridPoint(current.gx + ox, current.gy + oy);
      const key = keyFor(neighbor);
      if (closed.has(key) || !canMoveTo(neighbor.x, neighbor.y) || !canTravelBetween(current, neighbor)) continue;

      const moveCost = Math.hypot(neighbor.x - current.x, neighbor.y - current.y);
      const g = current.g + moveCost;
      const existing = open.get(key);
      if (existing && existing.g <= g) continue;
      const h = Math.hypot(goalNode.x - neighbor.x, goalNode.y - neighbor.y);
      open.set(key, { ...neighbor, key, g, f: g + h, parent: current });
    }
  }

  return [target];
}

function setPathTo(target) {
  state.destination = target;
  state.path = target ? buildPath({ x: state.cat.x, y: state.cat.y }, target) : [];
}

function finishDestination() {
  state.destination = null;
  state.path = [];
  if (state.pendingDigSpot && Math.hypot(state.pendingDigSpot.x - state.cat.x, state.pendingDigSpot.y - state.cat.y) < 70) {
    digSpot(state.pendingDigSpot);
  }
}

function setDestinationFromClientPoint(clientX, clientY) {
  if (!state.ready) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  const spot = nearestDigSpot(x, y, 44);
  if (spot) {
    state.pendingDigSpot = spot;
    setPathTo(nearestWalkablePoint(spot.x, spot.y + 18));
    setNotice("ほりほり...");
    return;
  }
  setPathTo(nearestWalkablePoint(x, y));
  state.pendingDigSpot = null;
}

function nearestDigSpot(x, y, range) {
  let nearest = null;
  for (const spot of state.digSpots) {
    if (spot.found) continue;
    const distance = Math.hypot(spot.x - x, spot.y - y);
    if (distance <= range && (!nearest || distance < nearest.distance)) {
      nearest = { ...spot, distance };
    }
  }
  return nearest ? state.digSpots.find((spot) => spot.id === nearest.id) : null;
}

function setNotice(text) {
  state.notice = text;
  state.noticeTimer = 1.8;
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!state.audio) state.audio = new AudioContextClass();
  return state.audio;
}

function unlockAudio() {
  const audio = getAudioContext();
  if (audio && audio.state === "suspended") {
    audio.resume();
  }
}

function playDiscoverySound(kind) {
  const audio = getAudioContext();
  if (!audio) return;
  unlockAudio();

  const now = audio.currentTime;
  if (kind === "trash") {
    playTrashDiscoverySound(audio, now);
    return;
  }

  const output = audio.createGain();
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  output.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
  output.connect(audio.destination);

  const notes = [784, 988, 1319];
  notes.forEach((frequency, index) => {
    const start = now + index * 0.09;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.04, start + 0.08);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.28, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    osc.connect(gain);
    gain.connect(output);
    osc.start(start);
    osc.stop(start + 0.24);
  });
}

function playTrashDiscoverySound(audio, now) {
  const output = audio.createGain();
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
  output.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
  output.connect(audio.destination);

  const osc = audio.createOscillator();
  const toneGain = audio.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(155, now);
  osc.frequency.exponentialRampToValueAtTime(82, now + 0.23);
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.exponentialRampToValueAtTime(0.18, now + 0.012);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  osc.connect(toneGain);
  toneGain.connect(output);
  osc.start(now);
  osc.stop(now + 0.3);

  const noiseLength = Math.max(1, Math.floor(audio.sampleRate * 0.12));
  const noiseBuffer = audio.createBuffer(1, noiseLength, audio.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLength; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseLength);
  }

  const noise = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const noiseGain = audio.createGain();
  noise.buffer = noiseBuffer;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(680, now);
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(output);
  noise.start(now);
}

function tryDig() {
  if (state.stageMenuOpen || state.digTimer > 0) return false;
  const spot = nearestDigSpot(state.cat.x, state.cat.y - 8, 58);
  if (!spot) {
    setNotice("ここには何もなさそう");
    return false;
  }
  digSpot(spot);
  return true;
}

function digSpot(spot) {
  if (!spot || spot.found) return;
  state.pendingDigSpot = null;
  state.destination = null;
  state.path = [];
  state.digCompleteSpot = spot;
  state.digTimer = 0.7;
  setNotice("ほりほり...");
}

function collectDugSpot() {
  const spot = state.digCompleteSpot;
  if (!spot || spot.found) return;
  spot.found = true;
  state.collection[spot.item] += 1;
  const item = currentItemTypes()[spot.item];
  const previousLevel = state.playerLevel;
  state.playerLevel = Math.min(MAX_LEVEL, state.playerLevel + 1);
  if (previousLevel < 6 && state.playerLevel >= 6) {
    setNotice("ステージ2が開放されました！");
  } else {
    setNotice(`${item.kind === "trash" ? "ごみ発見" : "宝発見"}: ${item.name}`);
  }
  playDiscoverySound(item.kind);
  updateHud();
  state.digCompleteSpot = null;
}

function update(dt) {
  if (state.stageMenuOpen) return;
  state.noticeTimer = Math.max(0, state.noticeTimer - dt);
  const wasDigging = state.digTimer > 0;
  state.digTimer = Math.max(0, state.digTimer - dt);
  if (wasDigging && state.digTimer === 0) {
    collectDugSpot();
  }
  if (state.digTimer > 0) {
    state.cat.frameTime += dt;
    return;
  }

  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (dx !== 0 || dy !== 0) {
    state.destination = null;
    state.path = [];
    state.pendingDigSpot = null;
  } else if (state.path.length > 0) {
    const currentPosition = { x: state.cat.x, y: state.cat.y };
    while (state.path.length > 1 && canTravelBetween(currentPosition, state.path[1])) {
      state.path.shift();
    }
    let target = state.path[0];
    let distance = Math.hypot(target.x - state.cat.x, target.y - state.cat.y);
    while (distance < 4 && state.path.length > 0) {
      state.path.shift();
      if (state.path.length === 0) {
        finishDestination();
        target = null;
        break;
      }
      target = state.path[0];
      distance = Math.hypot(target.x - state.cat.x, target.y - state.cat.y);
    }
    if (target) {
      dx = target.x - state.cat.x;
      dy = target.y - state.cat.y;
    }
  }

  const moving = dx !== 0 || dy !== 0;
  if (moving) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
    if (dx !== 0) state.cat.facing = Math.sign(dx);

    const step = state.destination ? Math.min(state.cat.speed * dt, len) : state.cat.speed * dt;
    const nx = state.cat.x + dx * step;
    const ny = state.cat.y + dy * step;
    if (state.destination) {
      if (canMoveTo(nx, ny)) {
        state.cat.x = nx;
        state.cat.y = ny;
      } else {
        state.path = buildPath({ x: state.cat.x, y: state.cat.y }, state.destination);
        if (state.path.length === 0 || !canTravelBetween({ x: state.cat.x, y: state.cat.y }, state.path[0])) {
          state.destination = null;
          state.path = [];
        }
      }
    } else {
      if (canMoveTo(nx, state.cat.y)) state.cat.x = nx;
      if (canMoveTo(state.cat.x, ny)) state.cat.y = ny;
    }

    state.cat.frameTime += dt;
    if (state.cat.frameTime > 0.13) {
      state.cat.frame = (state.cat.frame + 1) % 4;
      state.cat.frameTime = 0;
    }
  } else {
    state.cat.frame = 0;
    state.cat.frameTime = 0;
  }
}

function drawProp(item) {
  const image = state.images.get(item.prop);
  if (!image) return;
  const width = item.w;
  const height = (image.height / image.width) * width;
  ctx.save();
  if (foregroundCoversCat(item, width, height)) {
    ctx.globalAlpha = TREE_FADE_ALPHA;
  }
  ctx.drawImage(image, item.x - width / 2, item.y - height, width, height);
  ctx.restore();
}

function foregroundCoversCat(item, width, height) {
  if (!isForegroundOccluder(item.prop)) return false;
  const propBox = {
    left: item.x - width / 2 + width * 0.12,
    right: item.x + width / 2 - width * 0.12,
    top: item.y - height + height * 0.1,
    bottom: item.y + 8,
  };
  const catBox = {
    left: state.cat.x - 30,
    right: state.cat.x + 30,
    top: state.cat.y - 72,
    bottom: state.cat.y - 4,
  };
  return rectsOverlap(propBox, catBox);
}

function isForegroundOccluder(prop) {
  return prop === "broadleaf_tree" || prop === "deep_forest_tree" || prop === "cave_rock_reef";
}

function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function drawCat() {
  const digging = state.digTimer > 0;
  const image = state.images.get(digging ? "catDig" : "cat");
  const frameSize = image.width / 2;
  const digFrame = digging ? Math.min(3, Math.floor((1 - state.digTimer / 0.7) * 4)) : state.cat.frame;
  const sx = (digFrame % 2) * frameSize;
  const sy = Math.floor(digFrame / 2) * frameSize;
  const width = 78;
  const height = 78;
  ctx.save();
  if (state.cat.facing < 0) {
    ctx.translate(state.cat.x, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(image, sx, sy, frameSize, frameSize, -width / 2, state.cat.y - height + digBob(), width, height);
  } else {
    ctx.drawImage(image, sx, sy, frameSize, frameSize, state.cat.x - width / 2, state.cat.y - height + digBob(), width, height);
  }
  ctx.restore();
}

function digBob() {
  if (state.digTimer <= 0) return 0;
  return Math.sin(state.digTimer * 48) * 3;
}

function drawDigSpot(spot) {
  ctx.save();
  ctx.translate(spot.x, spot.y);
  ctx.globalAlpha = spot.found ? 0.62 : 1;

  ctx.fillStyle = "rgba(83, 55, 25, 0.7)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(158, 118, 58, 0.72)";
  ctx.beginPath();
  ctx.ellipse(-5, -3, 13, 5, -0.15, 0, Math.PI * 2);
  ctx.fill();

  if (!spot.found) {
    ctx.strokeStyle = "rgba(255, 243, 170, 0.78)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -16);
    ctx.lineTo(-1, -9);
    ctx.moveTo(4, -16);
    ctx.lineTo(1, -9);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (spot.found) {
    drawCollectibleIcon(spot.item, -22, -48, 44);
  }
  ctx.restore();
}

function drawCollectibleIcon(itemId, x, y, size) {
  const image = state.images.get("items");
  const item = currentItemTypes()[itemId];
  if (!image || !item) return;
  const cellSize = image.width / ITEM_SHEET_COLUMNS;
  const sx = (item.sprite % ITEM_SHEET_COLUMNS) * cellSize;
  const sy = Math.floor(item.sprite / ITEM_SHEET_COLUMNS) * cellSize;
  ctx.drawImage(image, sx, sy, cellSize, cellSize, x, y, size, size);
}

function drawNotice() {
  if (!state.notice || state.noticeTimer <= 0) return;
  ctx.save();
  ctx.font = "600 18px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const x = canvas.width / 2;
  const y = 56;
  const metrics = ctx.measureText(state.notice);
  const width = Math.min(canvas.width - 40, metrics.width + 34);
  ctx.fillStyle = "rgba(25, 34, 20, 0.72)";
  roundRect(x - width / 2, y - 20, width, 40, 8);
  ctx.fill();
  ctx.fillStyle = "#fff7d8";
  ctx.fillText(state.notice, x, y);
  ctx.restore();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(state.images.get("base"), 0, 0, canvas.width, canvas.height);

  const renderables = [
    ...state.digSpots.map((spot) => ({ y: spot.y - 2, draw: () => drawDigSpot(spot) })),
    ...state.props.map((prop) => ({ y: prop.y, draw: () => drawProp(prop) })),
    { y: state.cat.y, draw: drawCat },
  ].sort((a, b) => a.y - b.y);

  for (const item of renderables) item.draw();
  drawNotice();
}

let last = 0;
function tick(now) {
  if (state.ready) {
    const dt = Math.min(0.033, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    render();
  }
  requestAnimationFrame(tick);
}

addEventListener("keydown", (event) => {
  unlockAudio();
  if (state.stageMenuOpen) {
    if (event.key === "Escape") setStageMenuOpen(false);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
      event.preventDefault();
    }
    return;
  }
  keys.add(event.key.toLowerCase());
  if (event.key === " ") {
    event.preventDefault();
    tryDig();
  }
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }
});

addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

const compactMissionQuery = matchMedia("(max-width: 760px) and (orientation: portrait)");

function setMissionCollapsed(collapsed) {
  hudElements.missionPanel.classList.toggle("is-mission-collapsed", collapsed);
  hudElements.missionTitle.setAttribute("aria-expanded", String(!collapsed));
}

hudElements.missionTitle.setAttribute("role", "button");
hudElements.missionTitle.setAttribute("tabindex", "0");
setMissionCollapsed(compactMissionQuery.matches);

const handleMissionMediaChange = (event) => setMissionCollapsed(event.matches);
if (compactMissionQuery.addEventListener) {
  compactMissionQuery.addEventListener("change", handleMissionMediaChange);
} else {
  compactMissionQuery.addListener(handleMissionMediaChange);
}

hudElements.missionTitle.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  setMissionCollapsed(!hudElements.missionPanel.classList.contains("is-mission-collapsed"));
});

hudElements.missionTitle.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  setMissionCollapsed(!hudElements.missionPanel.classList.contains("is-mission-collapsed"));
});

function setBagOpen(open) {
  hudElements.bagModal.classList.toggle("is-open", open);
  hudElements.bagModal.setAttribute("aria-hidden", String(!open));
  if (open) renderBagItems();
}

function setSettingsOpen(open) {
  state.settingsOpen = open;
  hudElements.settingsModal.classList.toggle("is-open", open);
  hudElements.settingsModal.setAttribute("aria-hidden", String(!open));
  if (open) {
    setBagOpen(false);
    renderSettings();
  }
}

function renderSettings() {
  hudElements.debugToggle.checked = state.debugMode;
  hudElements.debugState.textContent = state.debugMode ? "ON" : "OFF";
}

function setDebugMode(enabled) {
  state.debugMode = enabled;
  renderSettings();
  renderStageMenu();
}

hudElements.bagButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (state.stageMenuOpen) return;
  unlockAudio();
  setBagOpen(true);
});

hudElements.stageButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  unlockAudio();
  setStageMenuOpen(true);
});

hudElements.settingsButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  unlockAudio();
  setSettingsOpen(true);
});

hudElements.settingsClose.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  setSettingsOpen(false);
});

hudElements.settingsClose.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  setSettingsOpen(false);
});

hudElements.settingsModal.addEventListener("pointerdown", (event) => {
  if (event.target !== hudElements.settingsModal) return;
  event.preventDefault();
  setSettingsOpen(false);
});

hudElements.debugToggle.addEventListener("change", (event) => {
  setDebugMode(event.target.checked);
});

hudElements.stageClose.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  setStageMenuOpen(false);
});

hudElements.stageList.addEventListener("pointerdown", (event) => {
  const button = event.target.closest("[data-stage-id]");
  if (!button || button.disabled) return;
  event.preventDefault();
  event.stopPropagation();
  chooseStage(button.dataset.stageId).catch((error) => {
    console.error(error);
    statusEl.textContent = "Failed to load stage assets.";
    setStageMenuOpen(true);
  });
});

hudElements.bagClose.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  setBagOpen(false);
});

hudElements.bagClose.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  setBagOpen(false);
});

hudElements.bagModal.addEventListener("pointerdown", (event) => {
  if (event.target !== hudElements.bagModal) return;
  event.preventDefault();
  setBagOpen(false);
});

addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setBagOpen(false);
    setSettingsOpen(false);
  }
});

hudElements.digButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (state.stageMenuOpen) return;
  unlockAudio();
  tryDig();
});

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (state.stageMenuOpen) return;
  unlockAudio();
  canvas.setPointerCapture?.(event.pointerId);
  setDestinationFromClientPoint(event.clientX, event.clientY);
});

canvas.addEventListener("pointermove", (event) => {
  if (event.buttons !== 1 && event.pointerType !== "touch") return;
  event.preventDefault();
  if (state.stageMenuOpen) return;
  setDestinationFromClientPoint(event.clientX, event.clientY);
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

boot().catch((error) => {
  console.error(error);
  statusEl.textContent = "Failed to load map assets.";
});
