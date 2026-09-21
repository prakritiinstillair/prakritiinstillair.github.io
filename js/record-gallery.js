/* ==========================================
   Record Crate Gallery JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 表示したいデータ（ここを自分のコンテンツに書き換えてください）
  const rawAlbums = Array.from({ length: 20 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    const hue = (i * 137.5) % 360; 
    return {
      id: num,
      title: `TRACK_${num}`,
      color: `hsl(${hue}, 30%, 20%)`,
      url: `#track${num}`
    };
  });

  // シャッフル関数
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const albums = shuffle(rawAlbums);
  const crate = document.getElementById('crate');
  
  // HTML内にクレートが存在しない場合は処理を中断（エラー防止）
  if (!crate) return;

  let cards = [];
  let cardOffsets = [];
  let activeIndex = 0; 

  let startY = 0;
  let distY = 0;
  let isTouch = false;
  const threshold = 25;

  function initCrate() {
    albums.forEach((album, index) => {
      const card = document.createElement('div');
      card.classList.add('record-card');
      card.style.backgroundColor = album.color;

      const rotZ = (Math.random() - 0.5) * 2.5;
      const rotY = (Math.random() - 0.5) * 2.0;
      const posX = (Math.random() - 0.5) * 4.0;
      cardOffsets.push({ rotZ, rotY, posX });

      card.innerHTML = `
        <div class="card-header">
          <span class="card-title">${album.title}</span>
          <span class="card-num">#${album.id}</span>
        </div>
        <a href="${album.url}" class="card-link" onclick="event.stopPropagation()">PLAY TRACK</a>
      `;

      card.addEventListener('pointerdown', (e) => onPointerDown(e, index));
      crate.insertBefore(card, document.getElementById('crateFront'));
      cards.push(card);
    });

    updateCardPositions();
  }

  function updateCardPositions() {
    cards.forEach((card, i) => {
      const offset = cardOffsets[i];

      if (i < activeIndex) {
        const stackIndex = activeIndex - 1 - i; 
        const zPos = Math.min(130, 60 + (stackIndex * 2)); 
        const yPos = 20 + (stackIndex * 1.5); 

        card.style.zIndex = 500 - stackIndex;
        card.style.transform = `translate3d(${offset.posX}px, ${yPos}px, ${zPos}px) rotateX(-24deg) rotateZ(${offset.rotZ}deg)`;
        card.classList.remove('pulled-up');

      } else if (i === activeIndex) {
        card.style.zIndex = 400;
        if (!card.classList.contains('pulled-up')) {
          card.style.transform = `translate3d(0, -15px, 30px) rotateX(-15deg)`;
        }

      } else {
        const depthIndex = i - activeIndex;
        const zPos = 30 - (depthIndex * 7);
        const yPos = -15 - (depthIndex * 2.2); 
        const rotX = -12 + (depthIndex * 0.3);

        card.style.zIndex = 300 - depthIndex;
        card.style.transform = `translate3d(${offset.posX}px, ${yPos}px, ${zPos}px) rotateX(${rotX}deg) rotateY(${offset.rotY}deg) rotateZ(${offset.rotZ}deg)`;
        card.classList.remove('pulled-up');
      }
    });
  }

  function onPointerDown(e, index) {
    const isPastCard = index < activeIndex;
    if (index > activeIndex) return;

    const card = cards[index];
    startY = e.clientY;
    distY = 0;
    isTouch = true;

    try {
      card.setPointerCapture(e.pointerId);
    } catch (err) {}

    const onPointerMove = (e) => {
      if (!isTouch) return;
      distY = e.clientY - startY;
      if (e.cancelable) e.preventDefault();
    };

    const onPointerUp = (e) => {
      if (!isTouch) return;
      isTouch = false;

      try {
        card.releasePointerCapture(e.pointerId);
      } catch (err) {}

      card.removeEventListener('pointermove', onPointerMove);
      card.removeEventListener('pointerup', onPointerUp);
      card.removeEventListener('pointercancel', onPointerUp);

      if (isPastCard) {
        flipBackward();
        return;
      }

      if (Math.abs(distY) < 8) {
        togglePullUp(card);
        return;
      }

      if (distY < -threshold) {
        if (card.classList.contains('pulled-up')) {
          resetCard(card);
        }
        flipBackward();
      } else if (distY > threshold) {
        if (card.classList.contains('pulled-up')) {
          resetCard(card);
        }
        flipForward();
      }
    };

    card.addEventListener('pointermove', onPointerMove, { passive: false });
    card.addEventListener('pointerup', onPointerUp);
    card.addEventListener('pointercancel', onPointerUp);
  }

  function togglePullUp(card) {
    if (card.classList.contains('pulled-up')) {
      resetCard(card);
    } else {
      card.classList.add('pulled-up');
      card.style.transform = `translate3d(0, -210px, 260px) rotateX(0deg)`;
    }
  }

  function resetCard(card) {
    card.classList.remove('pulled-up');
    updateCardPositions();
  }

  function flipForward() {
    if (activeIndex < cards.length - 1) {
      activeIndex++;
    } else {
      activeIndex = 0;
    }
    updateCardPositions();
  }

  function flipBackward() {
    if (activeIndex > 0) {
      activeIndex--;
    } else {
      activeIndex = cards.length - 1;
    }
    updateCardPositions();
  }

  // 初期化実行
  initCrate();
});
