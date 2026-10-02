// ==========================================
// 背景：Three.js 水玉・雪パーティクル
// ==========================================

// --- 1. 丸い水玉テクスチャをJavaScriptで作成 ---
function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2, false);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// --- 2. 基本セットアップ ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 専用のIDを付与してbodyに追加
renderer.domElement.id = 'bg-canvas';
document.body.appendChild(renderer.domElement);

// --- 3. 水玉パーティクルの作成 ---
const particleCount = 250;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const side = Math.random() < 0.5 ? -1 : 1;
  positions[i * 3]     = (Math.random() * 3 + 2.5) * side; // X軸（両端）
  positions[i * 3 + 1] = (Math.random() - 0.5) * 12;      // Y軸
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;      // Z軸
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.35,
  map: createCircleTexture(),
  transparent: true,
  alphaTest: 0.01,
  opacity: 0.1,
  depthWrite: false
});

const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

// --- 4. 移動量とスピードの計算 ---
let lastX = 0;
let lastY = 0;
let velX = 0;
let velY = 0;
let moveSpeed = 0;

function updateInput(currentX, currentY) {
  const deltaX = currentX - lastX;
  const deltaY = currentY - lastY;

  velX += deltaX * 0.0015;
  velY -= deltaY * 0.0015;

  moveSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  lastX = currentX;
  lastY = currentY;
}

// イベントリスナー（window全域でマウス/タッチの動きを監視）
window.addEventListener('touchstart', (e) => {
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  updateInput(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

window.addEventListener('mousemove', (e) => {
  updateInput(e.clientX, e.clientY);
});

// --- 5. アニメーションループ ---
function animateSnow() {
  requestAnimationFrame(animateSnow);

  velX *= 0.95;
  velY *= 0.95;
  moveSpeed *= 0.95;

  material.opacity = Math.min(0.15 + moveSpeed * 0.015, 0.75);

  const pos = particleSystem.geometry.attributes.position.array;
  const snowFallSpeed = 0.02;

  for (let i = 0; i < particleCount; i++) {
    pos[i * 3]     += velX;
    pos[i * 3 + 1] -= snowFallSpeed - velY;

    if (pos[i * 3 + 1] < -6) {
      pos[i * 3 + 1] = 6;
      const side = Math.random() < 0.5 ? -1 : 1;
      pos[i * 3] = (Math.random() * 3 + 2.5) * side;
    }

    if (pos[i * 3] > 8)  pos[i * 3] = -8;
    if (pos[i * 3] < -8) pos[i * 3] = 8;
  }

  particleSystem.geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

animateSnow();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
