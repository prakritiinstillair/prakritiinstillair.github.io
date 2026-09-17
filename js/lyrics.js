// ==========================================
// 1. トラックページの相対パス一覧
// ==========================================
const trackUrls = [
  "tracks/aromajewel.html",
  "tracks/senjoukousuitai.html",
  "tracks/friendsitalian.html"
  // 新曲（アルバム等）を追加した場合はここにパスを追記するだけでOK
];

// 抽出された「歌詞フレーズ」を保持する配列
let extractedLyrics = [];

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

const IDLE_TIME = 4000;    // 放置と判定する時間（ミリ秒）
const SPAWN_SPEED = 2000;  // 歌詞を新しく生み出す間隔（ミリ秒）
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

  const currentCount =
    document.querySelectorAll('.floating-lyric').length;

  if (currentCount >= MAX_LYRICS) return;

  // 配列からランダムに1つのフレーズを選択
  const data =
    extractedLyrics[
      Math.floor(Math.random() * extractedLyrics.length)
    ];

  // リンク付きの要素（<a>タグ）を作成
  const a = document.createElement('a');

  a.className = 'floating-lyric';
  a.href = data.url;

  // ------------------------------------------
  // ランダムな位置
  // ------------------------------------------

  const topPos =
    Math.floor(Math.random() * 55) + 20; // 20〜75%

  const leftPos =
    Math.floor(Math.random() * 55) + 20; // 20〜75%

  // ------------------------------------------
  // ランダムな透明度
  // ------------------------------------------

  const opacityVal =
    (Math.random() * 0.15 + 0.08).toFixed(2);

  // ------------------------------------------
  // ランダムな傾き
  // ------------------------------------------

  const rotateDeg =
    (Math.random() * 6 - 3).toFixed(1);

  a.style.top = `${topPos}%`;
  a.style.left = `${leftPos}%`;

  a.style.transform =
    `rotate(${rotateDeg}deg)`;

  document.body.appendChild(a);

  // タイプライター演出
  typeWriterEffect(
    a,
    data.text,
    opacityVal
  );
}


// ==========================================
// 5. タイプライター表示
// ==========================================
function typeWriterEffect(
  element,
  text,
  targetOpacity
) {

  let index = 0;

  element.style.opacity = targetOpacity;

  const timer = setInterval(() => {

    element.textContent +=
      text.charAt(index);

    index++;

    if (index >= text.length) {
      clearInterval(timer);
    }

  }, 70);
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
