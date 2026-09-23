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
// ==========================================================================
// SCROLL RANDOM GLITCH & MASCOT CONTROLLER
// ==========================================================================
(function() {
  let scrollTimeout;
  let glitchInterval = null;
  const body = document.body;
  const root = document.documentElement;
  const mascot = document.getElementById('scroll-mascot');
  let lyricClearTimeout = null;

  // 乱数生成
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // スクロール中にリアルタイムで数値を破滅的に変更
  function triggerRandomGlitch() {
    // 帯1のカット位置とスライド量
    const top1 = rand(5, 70);
    const height1 = rand(8, 25);
    const btm1 = 100 - (top1 + height1);
    const shiftX1 = rand(-2, 2); // vw（画面幅％）単位で横にぶっ飛ばす
    const skew1 = rand(-25, 25);

    // 帯2のカット位置とスライド量
    const top2 = rand(10, 80);
    const height2 = rand(5, 30);
    const btm2 = 100 - (top2 + height2);
    const shiftX2 = rand(-3, 3);
    const skew2 = rand(-20, 20);

    // #main-content（文字・画像本体）のゆがみ
    const bodyShiftX = rand(-0.5, 0.5);
    const bodyShiftY = rand(-1, 1);
    const bodySkew = (Math.random() * 2 - 1).toFixed(1);

    // 色反転と色の回転（ノイズ層の着色）
    const hue = rand(-60, 60);

    // 帯の透明度をランダムに
    const tearOpacity = (Math.random() * 0.12 + 0.04).toFixed(2);

    // CSSプロパティを更新
    root.style.setProperty('--clip-top-1', `${top1}%`);
    root.style.setProperty('--clip-btm-1', `${btm1}%`);
    root.style.setProperty('--shift-x-1', `${shiftX1}vw`);
    root.style.setProperty('--skew-1', `${skew1}deg`);

    root.style.setProperty('--clip-top-2', `${top2}%`);
    root.style.setProperty('--clip-btm-2', `${btm2}%`);
    root.style.setProperty('--shift-x-2', `${shiftX2}vw`);
    root.style.setProperty('--skew-2', `${skew2}deg`);

    root.style.setProperty('--body-shift-x', `${bodyShiftX}px`);
    root.style.setProperty('--body-shift-y', `${bodyShiftY}px`);
    root.style.setProperty('--body-skew', `${bodySkew}deg`);

    root.style.setProperty('--tear-hue', `${hue}deg`);
    root.style.setProperty('--tear-opacity', tearOpacity);
  }

  window.addEventListener('scroll', () => {
    // 1. スクロール開始時のグリッチ起動
    if (!body.classList.contains('scrolling')) {
      body.classList.add('scrolling');
      // 25ms（約秒間40コマ）のスピードで位置と色を変調
      glitchInterval = setInterval(triggerRandomGlitch, 25);
    }

    // 2. マスコット制御
    if (mascot && !mascot.classList.contains('is-moving')) {
      mascot.classList.add('is-moving');

      lyricClearTimeout = setTimeout(() => {
        if (typeof clearAllLyrics === 'function') {
          clearAllLyrics();
        }
      }, 400);
    }

    clearTimeout(scrollTimeout);

    // 3. スクロール停止時の後処理
    scrollTimeout = setTimeout(() => {
      body.classList.remove('scrolling');
      if (mascot) mascot.classList.remove('is-moving');

      clearInterval(glitchInterval);
      glitchInterval = null;

      // 歪み用プロパティのリセット
      root.style.removeProperty('--body-shift-x');
      root.style.removeProperty('--body-shift-y');
      root.style.removeProperty('--body-skew');

      clearTimeout(lyricClearTimeout);
    }, 180);
  }, { passive: true });
})();



/*

// ===============================
// NAP TIME CONTROL (時間判定 & 時計)
// ===============================
(function() {
  function checkNapTimeAndRefreshClock() {
    // 1. 常に日本時間（Asia/Tokyo）の現在時刻を取得
    const jstString = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
    const jstDate = new Date(jstString);
    const hours = jstDate.getHours();
    
    // 2. お昼寝判定（JST 7:48 ～ 17:27）
    const minutesNow = hours * 60 + jstDate.getMinutes();
    const napStart = 7 * 60 + 48;   // 7:48
    const napEnd   = 17 * 60 + 27;  // 17:27

    if (minutesNow >= napStart && minutesNow < napEnd) {
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

// ===============================
// AMBIENT AUDIO CONTROL
// ===============================
// 外部からも音楽を停止できるように、再生停止関数のみスコープを広げて宣言します
let stopNapMusic = () => {};

document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('nap-ambient-sound');
    const audioToggle = document.getElementById('nap-audio-toggle');
    const napOverlay = document.getElementById('nap-overlay');
    
    if (!audio || !audioToggle || !napOverlay) return;

    // --- 1. 画面のどこを触っても再生をスタートする処理 ---
    napOverlay.addEventListener('click', (event) => {
        // もしすでに音楽が流れている場合は、画面クリックでは何もしない
        if (!audio.paused) return;

        // 右上の「♪マーク（一時停止ボタン）」自体を触った場合は、
        // 以下の「♪ボタン専用の処理」に任せるため、ここでは無視する
        if (event.target.closest('#nap-audio-toggle')) return;

        // 画面のどこかが触られたら、音楽を再生
        playAmbient();
    });

    // --- 2. 一時停止は ♪ ボタンだけで行う処理 ---
    audioToggle.addEventListener('click', (event) => {
        // 画面全体のクリックイベントに連鎖（伝播）して、すぐにまた再生されないようにガード
        event.stopPropagation();

        if (!audio.paused) {
            // 音が流れていれば、一時停止してボタンの明滅を消す
            audio.pause();
            audioToggle.classList.remove('is-playing');
        } else {
            // 万が一、止まっている時に ♪ ボタンを押した場合も再生できるようにしておく
            playAmbient();
        }
    });

    // 再生処理をまとめた共通関数
    function playAmbient() {
        audio.play()
            .then(() => {
                audioToggle.classList.add('is-playing');
            })
            .catch(err => {
                console.log("Audio play blocked or failed: ", err);
            });
    }

    // --- 3. お昼寝時間が終わってオーバーレイが消える際、音楽も一緒に止める処理 ---
    stopNapMusic = function() {
        if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0; // 曲の最初に戻す
            audioToggle.classList.remove('is-playing');
        }
    }
});

// ===============================
// CAMEL CARAVAN CONTROL (表示切り替えのみ)
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // body のクラス変化（お昼寝状態のON/OFF）を監視して、音楽の自動停止だけを制御
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (!body.classList.contains('is-napping')) {
                    // お昼寝が終わったら音楽だけを止める
                    // （ラクダはCSS側でお昼寝画面ごと非表示になるので何もしなくてOK）
                    stopNapMusic(); 
                }
            }
        });
    });
    observer.observe(body, { attributes: true });
});
*/
