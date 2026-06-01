const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");

const keys = new Set();
const state = {
  ready: false,
  cat: { x: 512, y: 405, speed: 125, facing: 1, frame: 0, frameTime: 0 },
  destination: null,
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
  state.props = props.placements;
  state.ready = true;
  statusEl.textContent = "Tap/click to move, or use WASD / arrow keys";
  requestAnimationFrame(tick);
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
  state.destination = nearestWalkablePoint(x, y);
}

function update(dt) {
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
    ctx.drawImage(image, sx, sy, frameSize, frameSize, -width / 2, state.cat.y - height, width, height);
  } else {
    ctx.drawImage(image, sx, sy, frameSize, frameSize, state.cat.x - width / 2, state.cat.y - height, width, height);
  }
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(state.images.get("base"), 0, 0, canvas.width, canvas.height);

  const renderables = [
    ...state.props.map((prop) => ({ y: prop.y, draw: () => drawProp(prop) })),
    { y: state.cat.y, draw: drawCat },
  ].sort((a, b) => a.y - b.y);

  for (const item of renderables) item.draw();
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
