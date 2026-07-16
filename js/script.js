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

if (menuIcon && closeBtn && menu) {
  menuIcon.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  // メニュー内リンクを押したら閉じる
  document.querySelectorAll("#slide-menu a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}

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

// ===============================
// NAP TIME CONTROL (時間判定 & 時計)
// ===============================
(function() {
  function checkNapTimeAndRefreshClock() {
    // 1. 常に日本時間（Asia/Tokyo）の現在時刻を取得
    const jstString = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
    const jstDate = new Date(jstString);
    const hours = jstDate.getHours();

    // 2. お昼寝判定（JST 9:00 から 16:59 まで）
    if (hours >= 9 && hours < 24) {
      document.body.classList.add('is-napping');
    } else {
      document.body.classList.remove('is-napping');
    }

    // 3. 時計の文字列を更新 (JSTのデジタル表記 hh:mm:ss を適用)
    const clockElement = document.getElementById('jst-clock');
    if (clockElement) {
      const timeString = jstDate.toLocaleString("en-US", {
        timeZone: "Asia/Tokyo",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      clockElement.textContent = timeString;
    }
  }

  // ページ読み込み時に初期化し、その後は1秒（1000ms）ごとに更新処理を実行
  window.addEventListener('DOMContentLoaded', () => {
    checkNapTimeAndRefreshClock();
    setInterval(checkNapTimeAndRefreshClock, 1000);
  });
})();
