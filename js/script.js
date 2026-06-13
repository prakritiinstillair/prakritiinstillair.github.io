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

// 即時停止型・ページ全体スクロールグリッチ演出（最適化版）
(function() {
  let scrollTimeout;
  const body = document.body;
  let isGlitching = false;

  window.addEventListener('scroll', () => {
    if (isGlitching) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(stopGlitch, 60);
      return;
    }

    // スクロール開始、bodyを直接バグらせる
    isGlitching = true;
    body.classList.add('scrolling');

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(stopGlitch, 60);
  }, { passive: true });

  function stopGlitch() {
    isGlitching = false;
    body.classList.remove('scrolling');
  }
})();





