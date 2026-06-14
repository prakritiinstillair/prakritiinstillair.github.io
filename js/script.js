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

// スクロール時の微細グリッチ演出
(function() {
  let scrollTimeout;
  const body = document.body;

  window.addEventListener('scroll', () => {
    // スクロールが始まったらクラスを付与
    body.classList.add('scrolling');

    // スクロールが動いている間はタイマーを常にリセット
    clearTimeout(scrollTimeout);

    // スクロールが止まって150ms後にクラスを削除（静止状態に戻る）
    scrollTimeout = setTimeout(() => {
      body.classList.remove('scrolling');
    }, 150);
  }, { passive: true });
})();

// ===============================
// MASCOT CONTROL
// ===============================
(function() {
  const mascot = document.getElementById('scroll-mascot');
  
  // HTML側にマスコットの要素がない場合のコードエラーを防ぐ安全弁
  if (!mascot) return; 

  let mascotTimeout;

  window.addEventListener('scroll', () => {
    // スクロールが始まったら出現＆アニメ開始クラスを付与
    mascot.classList.add('is-moving');

    // スクロール中の間はタイマーをクリアし続ける
    clearTimeout(mascotTimeout);

    // スクロールが止まって200ms後に引っ込める
    mascotTimeout = setTimeout(() => {
      mascot.classList.remove('is-moving');
    }, 200); 
  }, { passive: true }); // パフォーマンス向上のためpassiveを追加
})();





