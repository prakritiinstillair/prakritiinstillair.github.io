/* ==========================================
   Record Crate Gallery JavaScript
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 1枚ずつ個別に画像パスとリンク先を指定するデータリスト
  const rawAlbums = [
    {
      id: '01',
      image: 'images/fireflower.jpg',
      url: 'tracks/fireflower.html'
    },
    {
      id: '02',
      image: 'images/senjoukousuitai.jpg',
      url: 'tracks/senjoukousuitai.html'
    },
    {
      id: '03',
      image: 'images/aromajewel.jpg', 
      url: 'tracks/aromajewel.html'
    },
    {
      id: '04',
      image: 'images/friendsitalian.jpg',
      url: 'tracks/friendsitalian.html'
    },
       {
      id: '05',
      image: 'images/lightscameraaction.jpg',
      url: 'tracks/lightscameraaction.html'
    },
    {
      id: '06',
      image: 'images/rojoukansoku.jpg',
      url: 'tracks/rojoukansoku.html'
    },
    {
      id: '07',
      image: 'images/goodgame.jpg', 
      url: 'tracks/goodgame.html'
    },
    {
      id: '08',
      image: 'images/tomatonokandume.jpg',
      url: 'tracks/tomatonokandume.html'
    },
     {
      id: '09',
      image: 'images/offlineonline.jpg',
      url: 'tracks/offlineonline.html'
    },
    {
      id: '10',
      image: 'images/nontitle.jpg',
      url: 'tracks/nontitle.html'
    },
    {
      id: '11',
      image: 'images/coin-locker.jpg', 
      url: 'tracks/coinlocker.html'
    },
    {
      id: '12',
      image: 'images/turaturatubaki.jpg',
      url: 'tracks/turaturatubaki.html'
    },
       {
      id: '13',
      image: 'images/tajigen-spectrum.jpg', 
      url: 'tracks/tajigenspectrum.html'
    },
    {
      id: '14',
      image: 'images/yorunomannakade.jpg',
      url: 'tracks/yorunomannakade.html'
    }
    // 必要な分だけ { id: '...', image: '...', url: '...' }, を追加していきます
  ];

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

      const rotZ = (Math.random() - 0.5) * 2.5;
      const rotY = (Math.random() - 0.5) * 2.0;
      const posX = (Math.random() - 0.5) * 4.0;
      cardOffsets.push({ rotZ, rotY, posX });

      // トラック名・No.を削除し、ジャケット画像と右下の▶ CHECKボタンのみを配置
      card.innerHTML = `
        <img src="${album.image}" alt="" class="card-cover-img" />
        <a href="${album.url}" class="card-link" onclick="event.stopPropagation()">▶ CHECK</a>
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
        card.style.transform = `translate3d(${offset.posX}px, ${yPos}px, ${zPos}px) rotateX(-30deg) rotateZ(${offset.rotZ}deg)`;
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
        const rotX = -22 + (depthIndex * 0.3);

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
