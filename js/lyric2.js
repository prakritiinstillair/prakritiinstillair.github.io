// ==========================================
// 1. トラックページの相対パス一覧
// ==========================================
const trackUrls = [
  "tracks/fireflower.html",
  "tracks/aromajewel.html",
  "tracks/senjoukousuitai.html",
  "tracks/friendsitalian.html",
  "tracks/lightscameraaction.html",
  "tracks/rojoukansoku.html",
  "tracks/goodgame.html",
  "tracks/tomatonokandume.html",
  "tracks/offlineonline.html",
  "tracks/nontitle.html",
  "tracks/coinlocker.html",
  "tracks/turaturatubaki.html",
  "tracks/tajigenspectrum.html",
  "tracks/yorunomannakade.html"
];

let extractedLyrics = [];
let lastPos = { top: 0, left: 0 };

// ==========================================
// 1.5 3D歌詞用ステージコンテナの自動生成
// (body全体のperspectiveでposition:fixedが崩れるのを防ぐ)
// ==========================================
let lyricStage = document.getElementById('lyric-stage');
if (!lyricStage) {
  lyricStage = document.createElement('div');
  lyricStage.id = 'lyric-stage';
  document.body.appendChild(lyricStage);
}

// ==========================================
// 2. 各トラックから歌詞を自動取得・分解
// ==========================================
async function loadAllLyrics() {
  for (const url of trackUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      const preTag = doc.querySelector('section.lyrics pre');
      if (!preTag) continue;

      const fullText = preTag.textContent.trim();
      const blocks = fullText.split(/\n\s*\n/);

      blocks.forEach(block => {
        const lines = block
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 0);

        if (lines.length === 0) return;

        const maxLength = Math.min(3, lines.length);
        const phraseLength = Math.floor(Math.random() * maxLength) + 1;
        const maxStart = lines.length - phraseLength;
        const start = Math.floor(Math.random() * (maxStart + 1));

        const phrase = lines
          .slice(start, start + phraseLength)
          .join('\n');

        extractedLyrics.push({
          text: phrase,
          url: url
        });
      });

    } catch (e) {
      console.error(`歌詞の取得に失敗しました: ${url}`, e);
    }
  }
}

loadAllLyrics();

// ==========================================
// 3. 放置検知と歌詞の連続生成ロジック
// ==========================================
let idleTimer = null;
let generateInterval = null;

const IDLE_TIME = 2400;    // 放置判定（ms）
const SPAWN_SPEED = 5000;  // 歌詞生成間隔（ms）
const MAX_LYRICS = 25;     // 歌詞の最大数

function resetIdleTimer() {
  clearTimeout(idleTimer);
  clearInterval(generateInterval);
  generateInterval = null;
  idleTimer = setTimeout(startSpawningLyrics, IDLE_TIME);
}

function startSpawningLyrics() {
  if (generateInterval || extractedLyrics.length === 0) return;
  generateInterval = setInterval(spawnSingleLyric, SPAWN_SPEED);
}

// ==========================================
// 4. 1つの歌詞要素を作成 (3Dパラメータ付き)
// ==========================================
function spawnSingleLyric() {
  const currentCount = document.querySelectorAll('.floating-lyric').length;
  if (currentCount >= MAX_LYRICS) return;

  const data = extractedLyrics[Math.floor(Math.random() * extractedLyrics.length)];

  const a = document.createElement('a');
  a.className = 'floating-lyric typing';
  a.href = data.url;

  let topPos, leftPos;
  let distance = 0;
  let attempts = 0;

  do {
    topPos = Math.floor(Math.random() * 55) + 20;  // 20% 〜 75%
    leftPos = Math.floor(Math.random() * 55) + 10; // 10% 〜 65%

    const diffTop = topPos - lastPos.top;
    const diffLeft = leftPos - lastPos.left;
    distance = Math.sqrt(diffTop * diffTop + diffLeft * diffLeft);
    attempts++;
  } while (distance < 15 && attempts < 5);

  lastPos = { top: topPos, left: leftPos };

  // 3D的な奥行き感（Z軸: -150 〜 150）
  const depthZ = (Math.random() * 300) - 150; 
  const scale = Number((1 + depthZ / 500).toFixed(2)); 

  const rotateDeg = (Math.random() * 6 - 3).toFixed(1);
  const fontSizeVal = (Math.random() * 0.3 + 0.8).toFixed(2);
  const targetOpacity = (Math.random() * 0.2 + 0.15).toFixed(2);

  a.style.top = `${topPos}%`;
  a.style.left = `${leftPos}%`;
  a.style.transform = `translateZ(${depthZ}px) scale(${scale}) rotate(${rotateDeg}deg)`;
  a.style.fontSize = `${fontSizeVal}rem`;

  a.dataset.depthZ = depthZ;
  a.dataset.scale = scale;

  // document.body ではなく #lyric-stage に要素を追加
  lyricStage.appendChild(a);

  typeWriterEffect(a, data.text, targetOpacity);
}

// ==========================================
// 5. タイプライター表示
// ==========================================
function typeWriterEffect(element, text, targetOpacity) {
  let index = 0;

  const timer = setInterval(() => {
    element.textContent += text.charAt(index);
    index++;
    
    if (index >= text.length) {
      clearInterval(timer);
      const WAIT_TIME = 1000;

      setTimeout(() => {
        element.classList.remove('typing');
        element.style.opacity = targetOpacity;
      }, WAIT_TIME);
    }
  }, 140);
}

// ==========================================
// 6. 一括消去関数
// ==========================================
function clearAllLyrics() {
  const elements = document.querySelectorAll('.floating-lyric');
  elements.forEach(el => {
    el.classList.add('lyric-fade-out');
    setTimeout(() => {
      el.remove();
    }, 800);
  });
}

// ==========================================
// 7. ユーザー操作の監視
// ==========================================
['mousemove', 'scroll', 'touchstart', 'keydown'].forEach(evt => {
  window.addEventListener(evt, resetIdleTimer, { passive: true });
});

resetIdleTimer();
// ==========================================
// 8. ノード明滅 ＆ 光の玉（粒子）移動描画ループ
// ==========================================
const canvas = document.createElement('canvas');
canvas.id = 'lyric-canvas';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initAnchorNodes();
});

// 画面外・端のアンカーポイント
let anchorNodes = [];

function initAnchorNodes() {
  anchorNodes = [
    { x: -30, y: -30, scale: 0.8, opacity: 0.25, isAnchor: true },
    { x: width + 30, y: -30, scale: 0.8, opacity: 0.25, isAnchor: true },
    { x: -30, y: height + 30, scale: 0.8, opacity: 0.25, isAnchor: true },
    { x: width + 30, y: height + 30, scale: 0.8, opacity: 0.25, isAnchor: true },
    { x: -40, y: height * 0.5, scale: 0.9, opacity: 0.3, isAnchor: true },
    { x: width + 40, y: height * 0.5, scale: 0.9, opacity: 0.3, isAnchor: true },
    { x: width * 0.3, y: 15, scale: 0.7, opacity: 0.2, isAnchor: true },
    { x: width * 0.7, y: height - 15, scale: 0.7, opacity: 0.2, isAnchor: true }
  ];
}
initAnchorNodes();

let animTime = 0;

function renderConnections() {
  ctx.clearRect(0, 0, width, height);
  animTime += 0.03;

  // 1. 浮遊歌詞からノードを取得
  const elements = Array.from(document.querySelectorAll('.floating-lyric'));
  const lyricNodes = [];

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const opacity = parseFloat(window.getComputedStyle(el).opacity);
    if (opacity <= 0.01) return;

    lyricNodes.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      scale: parseFloat(el.dataset.scale || 1),
      opacity: opacity,
      isAnchor: false
    });
  });

  // 2. アンカーの揺らぎ計算
  const updatedAnchors = anchorNodes.map((a, idx) => ({
    ...a,
    x: a.x + Math.sin(animTime * 0.8 + idx) * 8,
    y: a.y + Math.cos(animTime * 0.8 + idx) * 8
  }));

  const allNodes = [...lyricNodes, ...updatedAnchors];
  const maxDistance = 380;

  // 3. ノード間の光の玉（移動粒子）を描画
  for (let i = 0; i < allNodes.length; i++) {
    for (let j = i + 1; j < allNodes.length; j++) {
      const n1 = allNodes[i];
      const n2 = allNodes[j];

      // アンカー同士の間には走らせない
      if (n1.isAnchor && n2.isAnchor) continue;

      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        const alpha = (1 - dist / maxDistance) * Math.min(n1.opacity, n2.opacity) * 1.2;

        // 湾曲させた軌跡上のコントロールポイント
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2;
        const curveOffset = Math.sin(animTime + dist * 0.01) * 25;
        const controlX = midX + (dy / dist) * curveOffset;
        const controlY = midY - (dx / dist) * curveOffset;

        // 往復移動する位置 (t = 0〜1)
        const t = (Math.sin(animTime * 1.5 + i * 2 + j) + 1) / 2;

        // ベジェ曲線上の現在座標を算出
        const bubbleX = (1 - t) * (1 - t) * n1.x + 2 * (1 - t) * t * controlX + t * t * n2.x;
        const bubbleY = (1 - t) * (1 - t) * n1.y + 2 * (1 - t) * t * controlY + t * t * n2.y;

        // 行き来する光の玉を描画（※線は描画しない）
        ctx.beginPath();
        const ballRadius = (3.5 + Math.sin(animTime * 2 + i) * 1) * Math.min(n1.scale, n2.scale);
        ctx.arc(bubbleX, bubbleY, ballRadius, 0, Math.PI * 2);
        
        // ほんのり発光するグラデーション
        const ballGrad = ctx.createRadialGradient(
          bubbleX, bubbleY, 0,
          bubbleX, bubbleY, ballRadius * 2
        );
        ballGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        ballGrad.addColorStop(0.5, `rgba(173, 216, 230, ${alpha * 0.8})`);
        ballGrad.addColorStop(1, `rgba(173, 216, 230, 0)`);

        ctx.fillStyle = ballGrad;
        ctx.fill();
      }
    }
  }

  // 4. 各ノード（各歌詞・アンカー位置）の明滅バブルを描画
  for (let i = 0; i < allNodes.length; i++) {
    const node = allNodes[i];

    // 画面内に収まる範囲のみ描画
    if (node.x >= -20 && node.x <= width + 20 &&
        node.y >= -20 && node.y <= height + 20) {

      // パルス（脈動・明滅）のサイズと透明度計算
      const pulseProgress = Math.sin(animTime * 2.5 + i * 1.5);
      const pulseRadius = (5 + pulseProgress * 2.5) * node.scale;
      const glowRadius = pulseRadius * 2.5;

      // 外側のボカシ光（グロー効果）
      const glowGrad = ctx.createRadialGradient(
        node.x, node.y, pulseRadius * 0.3,
        node.x, node.y, glowRadius
      );
      glowGrad.addColorStop(0, `rgba(255, 192, 203, ${node.opacity * 0.9})`);
      glowGrad.addColorStop(0.5, `rgba(255, 182, 193, ${node.opacity * 0.4})`);
      glowGrad.addColorStop(1, `rgba(255, 182, 193, 0)`);

      ctx.beginPath();
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // 中心の小さな芯（くっきりした光）
      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.max(1.5, pulseRadius * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${node.opacity * 0.95})`;
      ctx.fill();
    }
  }

  requestAnimationFrame(renderConnections);
}

renderConnections();
