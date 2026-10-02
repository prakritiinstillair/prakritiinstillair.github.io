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
// 8. 接続線描画用 Canvas & 描画ループ (画面外・端ノード対応版)
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
  initAnchorNodes(); // 画面リサイズ時に画面端ポイントを再計算
});

// 画面外や端に配置する「固定/ゆらぐアンカーポイント」の配列
let anchorNodes = [];

function initAnchorNodes() {
  anchorNodes = [
    // 四隅（画面の少し外側）
    { x: -30, y: -30, scale: 0.8, opacity: 0.25, isAnchor: true },
    { x: width + 30, y: -30, scale: 0.8, opacity: 0.25, isAnchor: true },
    { x: -30, y: height + 30, scale: 0.8, opacity: 0.25, isAnchor: true },
    { x: width + 30, y: height + 30, scale: 0.8, opacity: 0.25, isAnchor: true },

    // 画面左右の中央付近（外側）
    { x: -40, y: height * 0.5, scale: 0.9, opacity: 0.3, isAnchor: true },
    { x: width + 40, y: height * 0.5, scale: 0.9, opacity: 0.3, isAnchor: true },

    // 上下の端（画面内ギリギリ）
    { x: width * 0.3, y: 15, scale: 0.7, opacity: 0.2, isAnchor: true },
    { x: width * 0.7, y: height - 15, scale: 0.7, opacity: 0.2, isAnchor: true }
  ];
}
initAnchorNodes();

let animTime = 0;

function renderConnections() {
  ctx.clearRect(0, 0, width, height);
  animTime += 0.03;

  // 1. 浮遊歌詞からノードを収集
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

  // 2. 歌詞ノードと画面端アンカーノードを結合
  // アンカーポイントを少し揺らして生きている感じを出す
  const updatedAnchors = anchorNodes.map((a, idx) => ({
    ...a,
    x: a.x + Math.sin(animTime * 0.8 + idx) * 8,
    y: a.y + Math.cos(animTime * 0.8 + idx) * 8
  }));

  const allNodes = [...lyricNodes, ...updatedAnchors];

  // 端へ引っ張るため、最大接続距離を少し広め(380px)に設定
  const maxDistance = 380;

  for (let i = 0; i < allNodes.length; i++) {
    for (let j = i + 1; j < allNodes.length; j++) {
      const n1 = allNodes[i];
      const n2 = allNodes[j];

      // アンカー同士（画面外×画面外）は線を引かない（歌詞との間、または歌詞同士のみ）
      if (n1.isAnchor && n2.isAnchor) continue;

      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        const alpha = (1 - dist / maxDistance) * Math.min(n1.opacity, n2.opacity) * 1.2;
        
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2;
        const curveOffset = Math.sin(animTime + dist * 0.01) * 25;
        const controlX = midX + (dy / dist) * curveOffset;
        const controlY = midY - (dx / dist) * curveOffset;

        // 曲線描画
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.quadraticCurveTo(controlX, controlY, n2.x, n2.y);

        const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
        grad.addColorStop(0, `rgba(255, 182, 193, ${alpha})`);
        grad.addColorStop(1, `rgba(173, 216, 230, ${alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6 * Math.min(n1.scale, n2.scale);
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 移動バブル
        const t = (Math.sin(animTime * 1.5 + i + j) + 1) / 2;
        const bubbleX = (1 - t) * (1 - t) * n1.x + 2 * (1 - t) * t * controlX + t * t * n2.x;
        const bubbleY = (1 - t) * (1 - t) * n1.y + 2 * (1 - t) * t * controlY + t * t * n2.y;

        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 3 * n1.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.fill();
      }
    }

    // ノード（円）描画（歌詞または画面内のアンカーのみ）
    if (allNodes[i].x >= -10 && allNodes[i].x <= width + 10 &&
        allNodes[i].y >= -10 && allNodes[i].y <= height + 10) {
      ctx.beginPath();
      const pulseRadius = (4 + Math.sin(animTime * 3 + i) * 1.5) * allNodes[i].scale;
      ctx.arc(allNodes[i].x, allNodes[i].y, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 192, 203, ${allNodes[i].opacity * 0.8})`;
      ctx.fill();
    }
  }

  requestAnimationFrame(renderConnections);
}

renderConnections();
