const T = THREE, $ = s => document.querySelector(s);
let renderer;

try {
  renderer = new T.WebGLRenderer({ canvas: $("#c"), antialias: true });
} catch (e) {
  $("#nogl").style.display = "grid";
  throw e;
}

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const SKY = 0x8ecbff, scene = new T.Scene();
scene.background = new T.Color(SKY);
scene.fog = new T.Fog(SKY, 45, 115);

const camera = new T.PerspectiveCamera(55, 1, .1, 200);
scene.add(new T.HemisphereLight(0xcfe9ff, 0x4a6a3a, .95));

const sun = new T.DirectionalLight(0xfff2cc, .75);
sun.position.set(20, 30, 12);
scene.add(sun);

// ---------- Helpers ----------
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const mats = {}, M = c => mats[c] || (mats[c] = new T.MeshLambertMaterial({ color: c }));
const box = (g, w, h, d, c, x, y, z) => {
  const m = new T.Mesh(new T.BoxGeometry(w, h, d), M(c));
  m.position.set(x, y + h / 2, z);
  g.add(m);
  return m;
};

function tex(b, v, rx, ry) {
  const c = document.createElement("canvas");
  c.width = c.height = 16;
  const x = c.getContext("2d");
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      const n = Math.floor(Math.random() * v);
      x.fillStyle = `rgb(${b[0] + n},${b[1] + n},${b[2] + n})`;
      x.fillRect(i, j, 1, 1);
    }
  }
  const t = new T.CanvasTexture(c);
  t.magFilter = T.NearestFilter;
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.repeat.set(rx, ry);
  return t;
}

// ---------- Ground ----------
const grass = new T.MeshLambertMaterial({ map: tex([62, 140, 52], 34, 30, 30) });
const dirt = new T.MeshLambertMaterial({ map: tex([118, 84, 54], 28, 30, 2) });
const ground = new T.Mesh(new T.BoxGeometry(60, 4, 60), [dirt, dirt, grass, dirt, dirt, dirt]);
ground.position.y = -2;
scene.add(ground);

// ---------- Buildings ----------
function house(g) {
  box(g, 6, 3.2, 5, 0xb8854f, 0, 0, 0);
  box(g, 7, .6, 6, 0x8a3b2e, 0, 3.2, 0);
  box(g, 5, .6, 4.6, 0x8a3b2e, 0, 3.8, 0);
  box(g, 3, .6, 3, 0x8a3b2e, 0, 4.4, 0);
  box(g, 1.2, 2, .2, 0x4a2e1a, 0, 0, 2.55);
  box(g, 1, 1, .2, 0x9fd8ff, -2, 1.2, 2.55);
  box(g, 1, 1, .2, 0x9fd8ff, 2, 1.2, 2.55);
  box(g, 1, 2.2, 1, 0x777b78, 2, 3.2, -1);
}

function tower(g) {
  box(g, 4, 12, 4, 0x8c928d, 0, 0, 0);
  box(g, 4.8, 1, 4.8, 0x7a807b, 0, 12, 0);
  [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(p => box(g, 1, 1, 1, 0x7a807b, p[0], 13, p[1]));
  box(g, 1.2, 2, .2, 0x4a2e1a, 0, 0, 2.05);
  [3.5, 6.5, 9.5].forEach(y => box(g, 1, 1.4, .2, 0xffd36b, 0, y, 2.05));
  box(g, 1.4, 1.4, .2, 0x6b4930, -1.2, 2.4, 2.1);
}

function workshop(g) {
  box(g, 7, 3, 5, 0x6e6a66, 0, 0, 0);
  box(g, 8, .5, 6, 0x4a4038, 0, 3, 0);
  box(g, 1, 3, 1, 0x555555, 2, 3.5, -1);
  box(g, 1.6, 1.6, 1.6, 0x333333, -4.6, 0, 1);
  box(g, .8, .6, .1, 0xff8a2a, -4.6, .4, 1.85);
  box(g, 1.2, .6, .8, 0x222222, 4.7, .6, 1.6);
  box(g, .6, .6, .6, 0x222222, 4.7, 0, 1.6);
  box(g, 1.6, 2, .2, 0x4a2e1a, 0, 0, 2.55);
}

function sign(g) {
  [-1.8, 1.8].forEach(x => box(g, .4, 3.2, .4, 0x6b4930, x, 0, 0));
  box(g, 4.8, 2.2, .3, 0x9b6b3d, 0, 2, .1);
  [3.5, 3.05, 2.6].forEach((y, i) => box(g, 3.4 - i * .5, .2, .35, 0xf1f0d9, 0, y, .1));
}

function portal(g) {
  const c = 0x1a1028;
  box(g, 1, 5, 1, c, -1.5, 0, 0);
  box(g, 1, 5, 1, c, 1.5, 0, 0);
  box(g, 2, 1, 1, c, 0, 0, 0);
  box(g, 2, 1, 1, c, 0, 4, 0);
  const p = new T.Mesh(new T.PlaneGeometry(2, 3), new T.MeshBasicMaterial({ color: 0x9b3df0, transparent: true, opacity: .8, side: T.DoubleSide }));
  p.position.y = 2.5;
  g.add(p);
  g.userData.glow = p;
}

const S = [
  { id: "about", x: -10, z: -3, f: house, ly: 6.5, t: "🏡 Spawn House" },
  { id: "profile", x: 1, z: 16, f: billboard, ly: 9.5, t: "📸 Billboard Farid", cy: 4, r: 17 },
  { id: "skills", x: 0, z: -13, f: tower, ly: 15, t: "📚 Knowledge Tower", cy: 5, r: 19 },
  { id: "projects", x: 11, z: -3, f: workshop, ly: 6, t: "⚒️ Developer Workshop" },
  { id: "journey", x: -5, z: 7, f: sign, ly: 5, t: "🪧 Quest Log" },
  { id: "contact", x: 9, z: 9, f: portal, ly: 6.5, t: "🌀 Nether Portal" }
];

const groups = [], avoid = [[0, 0, 6]];
const PHOTO = "";
const bc = document.createElement("canvas");
bc.width = 560;
bc.height = 328;
const bt = new T.CanvasTexture(bc);
const portrait = document.createElement("canvas");
portrait.width = portrait.height = 240;
let photo = null;

function drawBoard() {
  const p = portrait.getContext("2d"), x = bc.getContext("2d");
  p.imageSmoothingEnabled = false;
  if (photo) {
    const r = Math.max(240 / photo.width, 240 / photo.height), w = photo.width * r, h = photo.height * r;
    p.drawImage(photo, (240 - w) / 2, (240 - h) * .2, w, h);
  } else {
    p.fillStyle = "#355d38";
    p.fillRect(0, 0, 240, 240);
    const R = ["hhhhhhhh", "hhhhhhhh", "hssssssh", "swpsspws", "ssssssss", "sssmmsss", "ssmmmmss", "ssssssss"],
          K = { h: "#3b2a1a", s: "#c58c5f", w: "#ffffff", p: "#3a5fcf", m: "#7a4a32" };
    R.forEach((row, j) => [...row].forEach((c, i) => { p.fillStyle = K[c]; p.fillRect(i * 30, j * 30, 30, 30); }));
  }
  x.fillStyle = "#172820";
  x.fillRect(0, 0, 560, 328);
  x.fillStyle = "#b5f477";
  x.fillRect(24, 34, 252, 252);
  x.drawImage(portrait, 30, 40);
  x.fillStyle = "#f1f0d9";
  x.font = "24px 'Press Start 2P',monospace";
  x.fillText("FARID", 300, 95);
  x.fillText("MUSTHOFA", 300, 135);
  x.fillStyle = "#a8b9a8";
  x.font = "16px 'Space Grotesk',sans-serif";
  x.fillText("Informatics Student · UMS", 300, 178);
  x.fillText("Web developer in progress", 300, 204);
  x.fillStyle = "#75d66b";
  x.fillRect(300, 236, 236, 50);
  x.fillStyle = "#102016";
  x.font = "10px 'Press Start 2P',monospace";
  x.fillText("KLIK UNTUK KENALAN", 316, 266);
  bt.needsUpdate = true;
}

drawBoard();
if (document.fonts) document.fonts.load("24px 'Press Start 2P'").then(drawBoard);
if (PHOTO) {
  photo = new Image();
  photo.onload = drawBoard;
  photo.src = PHOTO;
}

function billboard(g) {
  [-3, 3].forEach(x => box(g, .6, 4, .6, 0x6b4930, x, 0, 0));
  box(g, 7.6, 4.6, .5, 0x2b1f14, 0, 3, 0);
  const f = new T.Mesh(new T.PlaneGeometry(7, 4.1), new T.MeshBasicMaterial({ map: bt }));
  f.position.set(0, 5.3, .26);
  g.add(f);
  [-2.5, 2.5].forEach(x => box(g, .4, .4, .4, 0xffe08a, x, 7.6, .5));
}

S.forEach(s => {
  const g = new T.Group();
  s.f(g);
  g.position.set(s.x, 0, s.z);
  g.rotation.y = Math.atan2(-s.x, -s.z);
  g.userData.id = s.id;
  scene.add(g);
  groups.push(g);
  s.g = g;
  avoid.push([s.x, s.z, 7]);
  const d = Math.hypot(s.x, s.z),
        p = new T.Mesh(new T.BoxGeometry(1.8, .06, d), M(0xb99a6a));
  p.position.set(s.x / 2, .03, s.z / 2);
  p.rotation.y = Math.atan2(s.x, s.z);
  scene.add(p);
});

// ---------- Trees & Clouds ----------
for (let i = 0; i < 70; i++) {
  const x = rnd() * 56 - 28, z = rnd() * 56 - 28;
  if (avoid.some(a => Math.hypot(x - a[0], z - a[1]) < a[2])) continue;
  const g = new T.Group(), k = .8 + rnd() * .6;
  box(g, 1, 3, 1, 0x6b4930, 0, 0, 0);
  box(g, 3, 2, 3, rnd() > .5 ? 0x3f9a4e : 0x358a45, 0, 3, 0);
  box(g, 2, 1, 2, 0x4cae5a, 0, 5, 0);
  g.position.set(x, 0, z);
  g.scale.setScalar(k);
  scene.add(g);
}

const clouds = [];
for (let i = 0; i < 7; i++) {
  const g = new T.Group(), m = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9 });
  [[0, 0], [3, .5], [-3, -.5]].forEach(o => {
    const b = new T.Mesh(new T.BoxGeometry(5, 1.4, 3), m);
    b.position.set(o[0], 0, o[1]);
    g.add(b);
  });
  g.position.set(rnd() * 90 - 45, 24 + rnd() * 5, rnd() * 80 - 40);
  scene.add(g);
  clouds.push(g);
}

// ---------- Content Data ----------
const chips = a => `<div class="chips">${a.map(x => `<span class="chip">${x}</span>`).join("")}</div>`;
const C = {
  about: {
    k: "Player profile",
    t: "Farid Musthofa",
    h: `<p>Mahasiswa Informatika UMS yang sedang membangun perjalanan di dunia web development. Tertarik pada pengembangan website, pemecahan masalah, dan dunia kreatif digital.</p><div class="item"><h3>🎯 Misi saat ini</h3><p>Memperdalam JavaScript dan membangun fondasi web development yang kuat.</p></div><div class="item"><h3>🎬 Sisi kreatif</h3><p>Berpengalaman mengedit video dan mengolah konten visual.</p></div><div class="item"><h3>🚀 Tujuan berikutnya</h3><p>Menjadi web developer yang membuat produk digital bermanfaat.</p></div>`
  },
  skills: {
    k: "Inventory",
    t: "Toolkit saat ini",
    h: `<div class="item"><h3>🌐 Web basics</h3><p>HTML, CSS, JavaScript — terus memperkuat fundamental.</p></div><div class="item"><h3>⚙️ Backend</h3><p>PHP, Laravel, dan dasar pengembangan aplikasi web.</p></div><div class="item"><h3>🗄️ Database</h3><p>MySQL, pengelolaan data, dan relasi tabel.</p></div><div class="item"><h3>🎥 Creative tools</h3><p>Video editing dan pengolahan konten visual.</p></div>`
  },
  projects: {
    k: "Selected builds",
    t: "Project yang kukerjakan",
    h: `<div class="item"><h3>Inventory Management</h3><p>Aplikasi inventaris berbasis Laravel untuk data barang, kondisi, peminjaman, dan pengembalian.</p>${chips(["Laravel", "PHP", "MySQL"])}</div><div class="item"><h3>AeroX Coin</h3><p>Game 2D sederhana dengan Greenfoot: kumpulkan koin, hindari musuh, kejar skor.</p>${chips(["Java", "Greenfoot", "Game logic"])}</div><div class="item"><h3>Belle Home Store</h3><p>Eksplorasi website katalog produk homeware dengan tampilan bersih.</p>${chips(["Laravel", "Tailwind", "Web design"])}</div>`
  },
  journey: {
    k: "Quest log",
    t: "Perjalanan sejauh ini",
    h: `<div class="item"><h3>Menjelajahi dunia IT</h3><p>Mengenal dasar pemrograman, algoritma, dan cara berpikir komputasional.</p></div><div class="item"><h3>Membangun dengan kode</h3><p>Project dengan Java, PHP, Laravel, dan database.</p></div><div class="item"><h3>Tumbuh di web development</h3><p>Memperdalam JavaScript menuju React dan Next.js.</p></div><div class="item"><h3>Misi berikutnya</h3><p>Membangun, menguji, dan mempublikasikan produk yang lebih matang.</p></div>`
  },
  contact: {
    k: "Let’s connect",
    t: "Punya ide? Ayo bangun bareng",
    h: `<p>Terbuka untuk belajar bareng, diskusi project, dan kolaborasi kreatif.</p><a class="btn" href="mailto:hello@example.com">Kirim email</a>`
  }
};
C.profile = {
  k: "Data diri",
  t: "Kenalan sama Farid",
  h: `<img class="portrait" id="pimg" alt="Foto Farid"><div class="item"><h3>Nama</h3><p>Farid Musthofa</p></div><div class="item"><h3>Pendidikan</h3><p>Mahasiswa Informatika · UMS</p></div><div class="item"><h3>Fokus</h3><p>Web development: HTML, CSS, JavaScript, PHP, Laravel, dan MySQL.</p></div><div class="item"><h3>Minat</h3><p>Pengembangan website, pemecahan masalah, dan konten visual kreatif.</p></div>`
};
const name = { about: "🏡 Tentang", profile: "📸 Profil", skills: "📚 Keahlian", projects: "⚒️ Project", journey: "🪧 Perjalanan", contact: "🌀 Kontak" };

// ---------- Camera & Controls ----------
const cam = { yaw: .7, pitch: .5, r: 46, t: new T.Vector3(0, 2, 0) },
      goal = { yaw: .7, pitch: .5, r: 46, t: new T.Vector3(0, 2, 0) };
let started = false, idle = 0, active = null, offX = 0, offY = 0;

function fly(id) {
  const s = S.find(o => o.id === id);
  if (!s) {
    goal.t.set(0, 2, 0);
    goal.r = innerWidth <= 640 ? 40 : 30;
    goal.pitch = .5;
    return;
  }
  const y = Math.atan2(-s.x, -s.z),
        d = Math.atan2(Math.sin(y - goal.yaw), Math.cos(y - goal.yaw));
  goal.yaw += d;
  goal.pitch = .3;
  goal.r = (s.r || 13) * (innerWidth <= 640 ? 1.35 : 1);
  goal.t.set(s.x, s.cy || 2, s.z);
}

const panel = $("#panel");

function openPanel(id) {
  active = id;
  const c = C[id];
  $("#pc").innerHTML = `<div class="sub px">${c.k}</div><h2>${c.t}</h2>${c.h}`;
  const pi = $("#pimg");
  if (pi) pi.src = portrait.toDataURL();
  panel.classList.add("open");
  panel.scrollTop = 0;
  fly(id);
  mark();
}

function closeP() {
  active = null;
  panel.classList.remove("open");
  fly(null);
  mark();
}

function mark() {
  document.querySelectorAll(".dock button").forEach(b => b.classList.toggle("on", b.dataset.id === active));
}

$("#close").onclick = closeP;
addEventListener("keydown", e => { if (e.key === "Escape") closeP(); });

const dock = $("#dock"), labels = $("#labels");
S.forEach(s => {
  const b = document.createElement("button");
  b.dataset.id = s.id;
  b.textContent = name[s.id];
  b.onclick = () => openPanel(s.id);
  dock.appendChild(b);

  const l = document.createElement("button");
  l.className = "label";
  l.textContent = s.t;
  l.onclick = () => openPanel(s.id);
  labels.appendChild(l);
  s.l = l;
});
$("#start").onclick = () => { started = true; $("#intro").classList.add("hide"); fly(null); };

// ---------- Input Handling ----------
const ray = new T.Raycaster(), mouse = new T.Vector2(), ptrs = new Map();
let moved = 0, pinch = 0, hov = null;
const cv = $("#c");

function pick(e) {
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const h = ray.intersectObjects(groups, true)[0];
  if (!h) return null;
  let o = h.object;
  while (o && !o.userData.id) o = o.parent;
  return o;
}

cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, e); moved = 0; idle = 0; });
cv.addEventListener("pointermove", e => {
  idle = 0;
  const p = ptrs.get(e.pointerId);
  if (!p) {
    const o = started && e.pointerType === "mouse" ? pick(e) : null;
    hov = o;
    cv.classList.toggle("hover", !!o);
    return;
  }
  if (ptrs.size === 2) {
    ptrs.set(e.pointerId, e);
    const [a, b] = [...ptrs.values()],
          d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    if (pinch) goal.r = Math.min(60, Math.max(8, goal.r * pinch / d));
    pinch = d;
    moved = 99;
    return;
  }
  const dx = e.clientX - p.clientX, dy = e.clientY - p.clientY;
  moved += Math.abs(dx) + Math.abs(dy);
  ptrs.set(e.pointerId, e);
  goal.yaw -= dx * .006;
  goal.pitch = Math.min(1.3, Math.max(.1, goal.pitch + dy * .004));
});

const up = e => {
  if (ptrs.has(e.pointerId)) {
    ptrs.delete(e.pointerId);
    pinch = 0;
    if (moved < 6 && started) {
      const o = pick(e);
      if (o) openPanel(o.userData.id);
    }
  }
};
cv.addEventListener("pointerup", up);
cv.addEventListener("pointercancel", e => { ptrs.delete(e.pointerId); pinch = 0; });
cv.addEventListener("wheel", e => {
  e.preventDefault();
  goal.r = Math.min(60, Math.max(8, goal.r * (1 + e.deltaY * .001)));
  idle = 0;
}, { passive: false });

// ---------- Animation Loop ----------
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

const v = new T.Vector3(), clock = new T.Clock();
(function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), .05), tm = clock.elapsedTime;
  idle += dt;
  if ((idle > 4 || !started) && !active) goal.yaw += dt * .08;

  const k = 1 - Math.pow(.001, dt);
  cam.yaw += (goal.yaw - cam.yaw) * k;
  cam.pitch += (goal.pitch - cam.pitch) * k;
  cam.r += (goal.r - cam.r) * k;
  cam.t.lerp(goal.t, k);

  camera.position.set(
    cam.t.x + cam.r * Math.sin(cam.yaw) * Math.cos(cam.pitch),
    Math.max(.8, cam.t.y + cam.r * Math.sin(cam.pitch)),
    cam.t.z + cam.r * Math.cos(cam.yaw) * Math.cos(cam.pitch)
  );
  camera.lookAt(cam.t);

  {
    const m = innerWidth <= 640,
          tx = active && !m ? (panel.offsetWidth + 16) / 2 : 0,
          ty = active && m ? panel.offsetHeight / 2 : 0;
    offX += (tx - offX) * k;
    offY += (ty - offY) * k;
    if (Math.abs(offX) + Math.abs(offY) > .5) {
      camera.setViewOffset(innerWidth, innerHeight, offX, offY, innerWidth, innerHeight);
    } else {
      camera.clearViewOffset();
    }
  }
  camera.updateMatrixWorld();

  groups.forEach(g => {
    const s = g === hov ? 1.05 : 1;
    g.scale.x += (s - g.scale.x) * .2;
    g.scale.y = g.scale.z = g.scale.x;
    if (g.userData.glow) {
      g.userData.glow.material.opacity = .65 + Math.sin(tm * 3) * .2;
    }
  });

  clouds.forEach(c => {
    c.position.x += dt * .8;
    if (c.position.x > 50) c.position.x = -50;
  });

  S.forEach(s => {
    v.set(s.x, s.ly, s.z);
    const dist = camera.position.distanceTo(v),
          front = v.clone().applyMatrix4(camera.matrixWorldInverse).z < -1;
    v.project(camera);
    const on = started && front && dist > 8 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1 && !(active && innerWidth <= 640);
    s.l.style.display = on ? "block" : "none";
    s.l.style.zIndex = Math.round(100 - dist);
    if (on) s.l.style.transform = `translate(${(v.x * .5 + .5) * innerWidth}px,${(-v.y * .5 + .5) * innerHeight}px) translate(-50%,-100%)`;
  });

  renderer.render(scene, camera);
})();