const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");

const itemTypes = {
  amber: { name: "琥珀", kind: "treasure", sprite: 0 },
  bell: { name: "小さな鈴", kind: "treasure", sprite: 1 },
  ribbon: { name: "ピンクのリボン", kind: "treasure", sprite: 2 },
  bottlecap: { name: "王冠キャップ", kind: "trash", sprite: 3 },
  wrapper: { name: "キャンディの包み紙", kind: "trash", sprite: 4 },
  twig: { name: "へんな小枝", kind: "trash", sprite: 5 },
};
const buriedItemIds = Object.keys(itemTypes);

const keys = new Set();
const state = {
  ready: false,
  cat: { x: 512, y: 405, speed: 125, facing: 1, frame: 0, frameTime: 0 },
  destination: null,
  pendingDigSpot: null,
  digSpots: [],
  collection: {},
  notice: "",
  noticeTimer: 0,
  digTimer: 0,
  props: [],
  collision: null,
  hooks: null,
  images: new Map(),
};

const asset = (path) => new URL(path, location.href).href;

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = asset(path);
  });
}

async function boot() {
  const [props, collision, hooks] = await Promise.all([
    fetch(asset("data/forest-cat-props.json")).then((res) => res.json()),
    fetch(asset("data/forest-cat-collision.json")).then((res) => res.json()),
    fetch(asset("data/forest-cat-scene-hooks.json")).then((res) => res.json()),
  ]);

  state.collision = collision;
  state.hooks = hooks;
  state.cat.x = hooks.player_spawn.x;
  state.cat.y = hooks.player_spawn.y;

  const base = await loadImage(props.base);
  state.images.set("base", base);

  await Promise.all(
    Object.entries(props.props).map(async ([id, path]) => {
      state.images.set(id, await loadImage(path));
    }),
  );
  state.images.set("cat", await loadImage("assets/cat/munchkin-walk-sheet.png"));
  state.images.set("items", await loadImage("assets/items/collectibles-sheet.png"));
  state.props = props.placements;
  initDigSpots();
  state.ready = true;
  updateHud();
  requestAnimationFrame(tick);
}

function initDigSpots() {
  state.collection = Object.fromEntries(buriedItemIds.map((id) => [id, 0]));
  state.digSpots = [];
  for (const item of buriedItemIds) {
    const position = randomDigSpotPosition(state.digSpots);
    state.digSpots.push({ id: `buried_${item}`, x: position.x, y: position.y, item, found: false });
  }
}

function randomDigSpotPosition(existingSpots) {
  for (let attempt = 0; attempt < 900; attempt++) {
    const x = 110 + Math.random() * 804;
    const y = 145 + Math.random() * 490;
    if (!canMoveTo(x, y + 18)) continue;
    if (Math.hypot(x - state.cat.x, y - state.cat.y) < 100) continue;
    if (existingSpots.some((spot) => Math.hypot(x - spot.x, y - spot.y) < 115)) continue;
    return { x, y };
  }

  const fallback = [
    { x: 430, y: 318 },
    { x: 592, y: 502 },
    { x: 226, y: 450 },
    { x: 705, y: 310 },
    { x: 332, y: 640 },
    { x: 824, y: 528 },
  ];
  return fallback[existingSpots.length % fallback.length];
}

function updateHud() {
  const found = state.digSpots.filter((spot) => spot.found).length;
  const total = state.digSpots.length;
  const treasure = Object.entries(state.collection)
    .filter(([id, count]) => count > 0 && itemTypes[id].kind === "treasure")
    .map(([id, count]) => `${itemTypes[id].name} x${count}`)
    .join(" / ");
  const trash = Object.entries(state.collection)
    .filter(([id, count]) => count > 0 && itemTypes[id].kind === "trash")
    .map(([id, count]) => `${itemTypes[id].name} x${count}`)
    .join(" / ");
  statusEl.textContent = `コレクション ${found}/${total}${treasure ? ` | 宝: ${treasure}` : ""}${trash ? ` | ごみ: ${trash}` : ""}`;
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

function setDestinationFromClientPoint(clientX, clientY) {
  if (!state.ready) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  const spot = nearestDigSpot(x, y, 44);
  if (spot) {
    state.pendingDigSpot = spot;
    state.destination = nearestWalkablePoint(spot.x, spot.y + 18);
    setNotice("...");
    return;
  }
  state.destination = nearestWalkablePoint(x, y);
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

function tryDig() {
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
  spot.found = true;
  state.pendingDigSpot = null;
  state.destination = null;
  state.digTimer = 0.45;
  state.collection[spot.item] += 1;
  const item = itemTypes[spot.item];
  setNotice(`${item.kind === "trash" ? "ごみ発見" : "宝発見"}: ${item.name}`);
  updateHud();
}

function update(dt) {
  state.noticeTimer = Math.max(0, state.noticeTimer - dt);
  state.digTimer = Math.max(0, state.digTimer - dt);

  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (dx !== 0 || dy !== 0) {
    state.destination = null;
  } else if (state.destination) {
    dx = state.destination.x - state.cat.x;
    dy = state.destination.y - state.cat.y;
    if (Math.hypot(dx, dy) < 4) {
      state.destination = null;
      dx = 0;
      dy = 0;
      if (state.pendingDigSpot && Math.hypot(state.pendingDigSpot.x - state.cat.x, state.pendingDigSpot.y - state.cat.y) < 70) {
        digSpot(state.pendingDigSpot);
      }
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
    if (canMoveTo(nx, state.cat.y)) state.cat.x = nx;
    else state.destination = null;
    if (canMoveTo(state.cat.x, ny)) state.cat.y = ny;
    else state.destination = null;

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
  ctx.drawImage(image, item.x - width / 2, item.y - height, width, height);
}

function drawCat() {
  const image = state.images.get("cat");
  const frameSize = image.width / 2;
  const sx = (state.cat.frame % 2) * frameSize;
  const sy = Math.floor(state.cat.frame / 2) * frameSize;
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
  const item = itemTypes[itemId];
  if (!image || !item) return;
  const cellSize = image.width / 3;
  const sx = (item.sprite % 3) * cellSize;
  const sy = Math.floor(item.sprite / 3) * cellSize;
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
  if (!state.ready) return;
  const dt = Math.min(0.033, (now - last) / 1000 || 0);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(tick);
}

addEventListener("keydown", (event) => {
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

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  canvas.setPointerCapture?.(event.pointerId);
  setDestinationFromClientPoint(event.clientX, event.clientY);
});

canvas.addEventListener("pointermove", (event) => {
  if (event.buttons !== 1 && event.pointerType !== "touch") return;
  event.preventDefault();
  setDestinationFromClientPoint(event.clientX, event.clientY);
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

boot().catch((error) => {
  console.error(error);
  statusEl.textContent = "Failed to load map assets.";
});
