// ===============================
// SLIDE MENU
// ===============================
const menuIcon = document.getElementById("menu-icon");
const menu = document.getElementById("slide-menu");
const closeBtn = document.querySelector(".close-btn");

function openMenu() {
  menu.classList.add("open");
  menuIcon.style.display = "none";
}

function closeMenu() {
  menu.classList.remove("open");
  menuIcon.style.display = "block";
}

menuIcon.addEventListener("click", openMenu);
closeBtn.addEventListener("click", closeMenu);

// メニュー内リンクを押したら閉じる
document.querySelectorAll("#slide-menu a").forEach(link => {
  link.addEventListener("click", closeMenu);
});


// 新・強力スクロールグリッチ演出
(function() {
  let scrollTimeout;
  const body = document.body;
  const blockCount = 5; // グリッチブロックの数（多いほど派手になるが重くなる）
  let glitchBlocks = [];
  let isGlitching = false;

  // 1. グリッチ用のブロック（HTML要素）を動的に生成
  function createGlitchBlocks() {
    for (let i = 0; i < blockCount; i++) {
      const block = document.createElement('div');
      block.classList.add('glitch-block');
      body.appendChild(block);
      glitchBlocks.push(block);
    }
  }
  createGlitchBlocks();

  // 2. ブロックの位置と動きをランダムに設定・適用する関数
  function updateGlitchEffect() {
    if (!isGlitching) return;

    glitchBlocks.forEach((block, index) => {
      // ランダムな高さと位置（Y軸）を設定
      const height = Math.random() * 40 + 10; // 10vh〜50vh
      const top = Math.random() * (100 - height); // 0〜100 - height

      // スタイルを適用（CSSアニメーションと組み合わせる）
      block.style.height = `${height}vh`;
      block.style.top = `${top}vh`;
      
      // 左右に引きちぎる動き（transform）をランダムに
      const translateX = (Math.random() - 0.5) * 50; // -25px〜25px
      block.style.transform = `translateX(${translateX}px)`;
      
      // ブロックを活性化
      block.classList.add('active');
    });

    // 次のフレームで再度アップデート（高速連打）
    requestAnimationFrame(updateGlitchEffect);
  }

  // 3. スクロールイベントの処理
  window.addEventListener('scroll', () => {
    // 既にグリッチ中なら何もしない（多重起動防止）
    if (isGlitching) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(stopGlitch, 150); // スクロール停止検知
      return;
    }

    // スクロール開始！
    isGlitching = true;
    body.classList.add('scrolling');
    requestAnimationFrame(updateGlitchEffect); // グリッチ描画ループを開始

    // スクロールが止まって150ms後にグリッチを止める
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(stopGlitch, 150);
  }, { passive: true });

  // 4. グリッチを止める関数
  function stopGlitch() {
    isGlitching = false;
    body.classList.remove('scrolling');
    // 全ブロックを非活性化し、transformをリセット
    glitchBlocks.forEach(block => {
      block.classList.remove('active');
      block.style.transform = 'none'; // これを入れないとブロックが画面に残る
    });
  }
})();
