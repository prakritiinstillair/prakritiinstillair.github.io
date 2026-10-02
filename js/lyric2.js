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

  document.body.appendChild(a);

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
// 8. 接続線描画用 Canvas & 描画ループ
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
});

let animTime = 0;

function renderConnections() {
  ctx.clearRect(0, 0, width, height);
  animTime += 0.03;

  const elements = Array.from(document.querySelectorAll('.floating-lyric'));
  const nodes = [];

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const opacity = parseFloat(window.getComputedStyle(el).opacity);
    if (opacity <= 0.01) return;

    nodes.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      scale: parseFloat(el.dataset.scale || 1),
      opacity: opacity,
      el: el
    });
  });

  const maxDistance = 280;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];

      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        const alpha = (1 - dist / maxDistance) * Math.min(n1.opacity, n2.opacity) * 1.2;
        
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2;
        const curveOffset = Math.sin(animTime + dist) * 20;
        const controlX = midX + (dy / dist) * curveOffset;
        const controlY = midY - (dx / dist) * curveOffset;

        // 1. 曲線描画
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.quadraticCurveTo(controlX, controlY, n2.x, n2.y);

        const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
        grad.addColorStop(0, `rgba(255, 182, 193, ${alpha})`);
        grad.addColorStop(1, `rgba(173, 216, 230, ${alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8 * Math.min(n1.scale, n2.scale);
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. 移動バブル
        const t = (Math.sin(animTime * 1.5 + i + j) + 1) / 2;
        const bubbleX = (1 - t) * (1 - t) * n1.x + 2 * (1 - t) * t * controlX + t * t * n2.x;
        const bubbleY = (1 - t) * (1 - t) * n1.y + 2 * (1 - t) * t * controlY + t * t * n2.y;

        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 3.5 * n1.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fill();
      }
    }

    // 3. ノード（円）
    ctx.beginPath();
    const pulseRadius = (4 + Math.sin(animTime * 3 + i) * 1.5) * nodes[i].scale;
    ctx.arc(nodes[i].x, nodes[i].y, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 192, 203, ${nodes[i].opacity * 0.8})`;
    ctx.fill();
  }

  requestAnimationFrame(renderConnections);
}

renderConnections();
