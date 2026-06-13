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

// 即時停止型・強力スクロールグリッチ演出
(function() {
  let scrollTimeout;
  const body = document.body;
  const blockCount = 5; // グリッチブロックの数
  let glitchBlocks = [];
  let isGlitching = false;

  // 1. グリッチ用のブロックを動的に生成
  function createGlitchBlocks() {
    for (let i = 0; i < blockCount; i++) {
      const block = document.createElement('div');
      block.classList.add('glitch-block');
      body.appendChild(block);
      glitchBlocks.push(block);
    }
  }
  createGlitchBlocks();

  // 2. ブロックの位置と動きをランダムに設定・適用
  function updateGlitchEffect() {
    if (!isGlitching) return;

    glitchBlocks.forEach((block) => {
      const height = Math.random() * 40 + 10; // 10vh〜50vh
      const top = Math.random() * (100 - height);

      block.style.height = `${height}vh`;
      block.style.top = `${top}vh`;
      
      const translateX = (Math.random() - 0.5) * 60; // ズレ幅を少し強化
      block.style.transform = `translateX(${translateX}px)`;
      
      block.classList.add('active');
    });

    requestAnimationFrame(updateGlitchEffect);
  }

  // 3. スクロールイベントの処理
  window.addEventListener('scroll', () => {
    if (isGlitching) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(stopGlitch, 60); // 60ms動かなければ停止とみなす
      return;
    }

    // スクロール開始
    isGlitching = true;
    body.classList.add('scrolling');
    requestAnimationFrame(updateGlitchEffect);

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(stopGlitch, 60);
  }, { passive: true });

  // 4. グリッチを「完全に、即座に」止める関数
  function stopGlitch() {
    isGlitching = false;
    body.classList.remove('scrolling');
    
    glitchBlocks.forEach(block => {
      block.classList.remove('active');
      block.style.transform = 'none';
      block.style.height = '0';
    });
  }
})();


