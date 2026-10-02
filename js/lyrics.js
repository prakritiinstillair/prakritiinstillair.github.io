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
  // 新曲（アルバム等）を追加した場合はここにパスを追記するだけでOK
];

// 抽出された「歌詞フレーズ」を保持する配列
let extractedLyrics = [];
// 前回の位置を記憶する変数（関数の外側、スクリプトのトップレベルに配置）
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

      // <section class="lyrics"> 内の <pre> からテキストを取得
      const preTag = doc.querySelector('section.lyrics pre');
      if (!preTag) continue;

      const fullText = preTag.textContent.trim();

      // 空行（改行2つ以上）でブロックごとに分割
      const blocks = fullText.split(/\n\s*\n/);

      blocks.forEach(block => {

        // 各行を整理
        const lines = block
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 0);

        if (lines.length === 0) return;

        // ------------------------------------------
        // ブロック内からランダムに1〜3行を切り出す
        // ------------------------------------------

        // 切り出す行数
        const maxLength = Math.min(3, lines.length);
        const phraseLength =
          Math.floor(Math.random() * maxLength) + 1;

        // 切り出し開始位置
        const maxStart = lines.length - phraseLength;
        const start =
          Math.floor(Math.random() * (maxStart + 1));

        // 実際のフレーズ
        const phrase = lines
          .slice(start, start + phraseLength)
          .join('\n');

        // 登録
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

// ページ読み込み時に歌詞を取得開始
loadAllLyrics();


// ==========================================
// 3. 放置検知と歌詞の連続生成ロジック
// ==========================================
let idleTimer = null;
let generateInterval = null;

const IDLE_TIME = 2400;    // 放置と判定する時間（ミリ秒）
const SPAWN_SPEED = 5000;  // 歌詞を新しく生み出す間隔（ミリ秒）
const MAX_LYRICS = 25;     // 画面上に留める歌詞の最大数


// マウス移動・スクロール等の操作があったらリセット
function resetIdleTimer() {
  clearTimeout(idleTimer);
  clearInterval(generateInterval);

  generateInterval = null;

  // ユーザーが動いたらカウント再始動
  idleTimer = setTimeout(startSpawningLyrics, IDLE_TIME);
}


// 歌詞の生成ループ開始
function startSpawningLyrics() {
  if (generateInterval || extractedLyrics.length === 0) return;

  generateInterval = setInterval(
    spawnSingleLyric,
    SPAWN_SPEED
  );
}
// ==========================================
// 4. 1つの歌詞要素を作成
// ==========================================
function spawnSingleLyric() {
  const currentCount = document.querySelectorAll('.floating-lyric').length;
  if (currentCount >= MAX_LYRICS) return;

  const data = extractedLyrics[Math.floor(Math.random() * extractedLyrics.length)];

  const a = document.createElement('a');
  a.className = 'floating-lyric typing';
  a.href = data.url;

  // --- 位置の決定（前回と被らないように計算） ---
  let topPos, leftPos;
  let distance = 0;
  let attempts = 0;

  // 前回の位置から少なくとも 15% 以上離れた位置が出るまで最大5回リトライ
  do {
    topPos = Math.floor(Math.random() * 55) + 20;  // 20% 〜 75%
    leftPos = Math.floor(Math.random() * 55) + 10; // 10% 〜 65%（左寄りに調整）

    // 直前の位置との直線距離を計算
    const diffTop = topPos - lastPos.top;
    const diffLeft = leftPos - lastPos.left;
    distance = Math.sqrt(diffTop * diffTop + diffLeft * diffLeft);

    attempts++;
  } while (distance < 15 && attempts < 5); // 距離15%未満ならやり直し（無限ループ防止で最大5回）

  // 今回の位置を記録
  lastPos = { top: topPos, left: leftPos };

  // --- その他のパラメータ設定 ---
  const rotateDeg = (Math.random() * 6 - 3).toFixed(1);
  const fontSizeVal = (Math.random() * 0.4 + 0.75).toFixed(2);
  const targetOpacity = (Math.random() * 0.15 + 0.10).toFixed(2);

  a.style.top = `${topPos}%`;
  a.style.left = `${leftPos}%`;
  a.style.transform = `rotate(${rotateDeg}deg)`;
  a.style.fontSize = `${fontSizeVal}rem`;

  document.body.appendChild(a);

  // タイプライター演出を実行
  typeWriterEffect(a, data.text, targetOpacity);
}
// ==========================================
// 5. タイプライター表示
// ==========================================
// 1文字ずつパラパラ表示するタイピング処理
function typeWriterEffect(element, text, targetOpacity) {
  let index = 0;

  const timer = setInterval(() => {
    element.textContent += text.charAt(index);
    index++;
    
    if (index >= text.length) {
      clearInterval(timer);
      
      // ★ここを変更！タイピング完了後、少し時間を置いてから薄くする
      const WAIT_TIME = 1000; // 打ち終わってからピンクを保持する時間（1.0秒）

      setTimeout(() => {
        element.classList.remove('typing');
        element.style.opacity = targetOpacity;
      }, WAIT_TIME);

    }
  }, 140); // 1文字あたりのタイピング速度
}


// ==========================================
// 6. マスコットキャラ登場時などに呼ぶ
//    一括消去関数
// ==========================================
function clearAllLyrics() {

  const elements =
    document.querySelectorAll('.floating-lyric');

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
[
  'mousemove',
  'scroll',
  'touchstart',
  'keydown'
].forEach(evt => {

  window.addEventListener(
    evt,
    resetIdleTimer,
    { passive: true }
  );

});


// ==========================================
// 8. 初期化
// ==========================================
resetIdleTimer();

// ==========================================
// A. 接続線描画用 Canvas の準備
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

// アニメーション用パルスパラメータ
let animTime = 0;

// ==========================================
// B. spawnSingleLyric の改修（3Dパラメータの付与）
// ==========================================
// ※ 既存の spawnSingleLyric 内を一部書き換えます
const originalSpawnSingleLyric = spawnSingleLyric;

spawnSingleLyric = function() {
  const currentCount = document.querySelectorAll('.floating-lyric').length;
  if (currentCount >= MAX_LYRICS) return;

  const data = extractedLyrics[Math.floor(Math.random() * extractedLyrics.length)];

  const a = document.createElement('a');
  a.className = 'floating-lyric typing';
  a.href = data.url;

  // --- 位置と奥行き（Z軸）の決定 ---
  let topPos, leftPos;
  let distance = 0;
  let attempts = 0;

  do {
    topPos = Math.floor(Math.random() * 55) + 20;
    leftPos = Math.floor(Math.random() * 55) + 10;

    const diffTop = topPos - lastPos.top;
    const diffLeft = leftPos - lastPos.left;
    distance = Math.sqrt(diffTop * diffTop + diffLeft * diffLeft);
    attempts++;
  } while (distance < 15 && attempts < 5);

  lastPos = { top: topPos, left: leftPos };

  // 3D的な奥行き感（Z軸: -150 〜 150）
  const depthZ = (Math.random() * 300) - 150; 
  // Z座標に応じたスケール（遠くは小さく, 近くは大きく）
  const scale = Number((1 + depthZ / 500).toFixed(2)); 

  const rotateDeg = (Math.random() * 6 - 3).toFixed(1);
  const fontSizeVal = (Math.random() * 0.3 + 0.8).toFixed(2);
  const targetOpacity = (Math.random() * 0.2 + 0.15).toFixed(2);

  a.style.top = `${topPos}%`;
  a.style.left = `${leftPos}%`;
  // 3D Perspective を効かせたトランスフォーム
  a.style.transform = `translateZ(${depthZ}px) scale(${scale}) rotate(${rotateDeg}deg)`;
  a.style.fontSize = `${fontSizeVal}rem`;

  // Canvas接続用にDOM要素へオリジナル座標データを保持させる
  a.dataset.depthZ = depthZ;
  a.dataset.scale = scale;

  document.body.appendChild(a);

  typeWriterEffect(a, data.text, targetOpacity);
};

// ==========================================
// C. 3D感・ポップな曲線・〇ノードの描画ループ
// ==========================================
function renderConnections() {
  ctx.clearRect(0, 0, width, height);
  animTime += 0.03;

  const elements = Array.from(document.querySelectorAll('.floating-lyric'));
  const nodes = [];

  // 各リリック要素の中心座標を取得
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // タイピング中で完全に消えていないものを対象
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

  // ノード同士の距離をチェックして線と丸を描く
  const maxDistance = 280; // つなぐ最大距離(px)

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];

      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        // 距離と透明度に応じて線の濃さを計算
        const alpha = (1 - dist / maxDistance) * Math.min(n1.opacity, n2.opacity) * 1.2;
        
        // 曲線を描くための制御点（中間地点を少し撓ませる）
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2;
        // ぷるんとした可愛らしさを出すための揺らぎオフセット
        const curveOffset = Math.sin(animTime + dist) * 20;
        const controlX = midX + (dy / dist) * curveOffset;
        const controlY = midY - (dx / dist) * curveOffset;

        // --- 1. 可愛らしい曲線の描画（ピンク〜水色のグラデーション） ---
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.quadraticCurveTo(controlX, controlY, n2.x, n2.y);

        const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
        grad.addColorStop(0, `rgba(255, 182, 193, ${alpha})`); // パステルピンク
        grad.addColorStop(1, `rgba(173, 216, 230, ${alpha})`); // パステルブルー

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8 * Math.min(n1.scale, n2.scale);
        ctx.setLineDash([4, 4]); // サイバー感を出すドット線（実線にするならコメントアウト）
        ctx.stroke();
        ctx.setLineDash([]); // リセット

        // --- 2. 曲線の上を流れる光の〇（バブル） ---
        const t = (Math.sin(animTime * 1.5 + i + j) + 1) / 2; // 0〜1を往復
        // ベジェ曲線上(t)の座標計算
        const bubbleX = (1 - t) * (1 - t) * n1.x + 2 * (1 - t) * t * controlX + t * t * n2.x;
        const bubbleY = (1 - t) * (1 - t) * n1.y + 2 * (1 - t) * t * controlY + t * t * n2.y;

        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 3.5 * n1.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fill();
      }
    }

    // --- 3. 各リリックの根元にある〇（ポップなノード） ---
    ctx.beginPath();
    const pulseRadius = (4 + Math.sin(animTime * 3 + i) * 1.5) * nodes[i].scale;
    ctx.arc(nodes[i].x, nodes[i].y, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 192, 203, ${nodes[i].opacity * 0.8})`;
    ctx.fill();
  }

  requestAnimationFrame(renderConnections);
}

// 描画ループ起動
renderConnections();

