// メニュー開閉
const menuIcon = document.getElementById("menu-icon");
const menu = document.getElementById("slide-menu");
const closeBtn = document.querySelector(".close-btn");

menuIcon.onclick = () => menu.classList.add("open");
closeBtn.onclick = () => menu.classList.remove("open");

// メニューリンククリックで閉じる
document.querySelectorAll("#slide-menu a").forEach(link => {
    link.onclick = () => menu.classList.remove("open");
});

// ---- ピックアップに使うデータ ----
const songs = [
  {
    jacket: "images/lights-camera-action.jpg",
    quote1: "そんなに勝手に　とらないで",
    quote2: "フレームつけて　切り取らないで",
    title: "lights,camera,action!",
    link: "tracks/lights-camera-action.html"
  },
  {
    jacket: "images/nontitle.jpg",
    quote1: "それは同じものがないクラシック",
    quote2: "いつも出来事は偶然だ",
    title: "non title",
    link: "tracks/nontitle.html"
  },
    {
    jacket: "images/turaturatubaki.jpg",
    quote1: "その先にある　その先が知りたい",
    quote2: "にわとりの先の　たまごのその先",
    title: "つらつら椿",
    link: "tracks/turaturatubaki.html"
  },
  {
    jacket: "images/coin-locker.jpg",
    quote1: "海辺の電話ボックスは",
    quote2: "非常口みたいだった",
    title: "コインロッカー",
    link: "tracks/coin-locker.html"
  },
 {
    jacket: "images/rojoukansoku.jpg",
    quote1: "気づいて　しまった",
    quote2: "気づいて　しまった　どうしよう",
    title: "路上観測",
    link: "tracks/rojoukansoku.html"
  },
  {
    jacket: "images/offlineonline.jpg",
    quote1: "デンパにのって　どうでもいいハナシを",
    quote2: "デンパにのって　たわいもないハナシを",
    title: "オフライン online",
    link: "tracks/offlineonline.html"
  },
    {
    jacket: "images/tajigen-spectrum.jpg",
    quote1: "↑↑↓↓←→←→",
    quote2: "魔法のコマンドで　強くなる",
    title: "多次元スペクトラム",
    link: "tracks/tajigen-spectrum.html"
  },
  {
    jacket: "images/yoru-no-mannakade.jpg",
    quote1: "バイパスくぐる　トンネルで",
    quote2: "ワープした先は　青い星",
    title: "夜の真ん中で",
    link: "tracks/yoru-no-mannakade.html"
  },
    {
    jacket: "images/fire-flower.jpg",
    quote1: "花火大会よりも　ハードディスク",
    quote2: "消える前に　バックアップkiss",
    title: "fire flower",
    link: "tracks/fire-flower.html"
  },
  {
    jacket: "images/senjoukousuitai.jpg",
    quote1: "たこ焼きの数え方　知ってる？",
    quote2: "得意げにキミはわらう",
    title: "線上降水帯",
    link: "tracks/senjoukousuitai.html"
  },
  {
    jacket: "images/aromajewel.jpg",
    quote1: "ラムネを開ける　ポン",
    quote2: "シュワシュワあふれ　あふれ　あふれ",
    title: "aroma jewel",
    link: "tracks/aromajewel.html"
  },
  {
    jacket: "images/friends-italian.jpg",
    quote1: "how italian is your italian？",
    quote2: "your italian is really italian ？",
    title: "friend's italian",
    link: "tracks/friends-italian.html"
  },
  {
    jacket: "images/tomato-no-kandume.jpg",
    quote1: "煮込まれても　とけない赤が",
    quote2: "あふれだす",
    title: "トマトの缶詰",
    link: "tracks/tomato-no-kandume.html"
  },
{
    jacket: "images/goodgame.jpg",
    quote1: "12時までの　かぼちゃを引っぱり",
    quote2: "カチカチヤマで踊ってた",
    title: "good game",
    link: "tracks/goodgame.html"
  }
];

// ---- ランダムで2曲取り出す ----
function getRandomSongs(num) {
  const copy = [...songs];
  return [...Array(num)].map(() => {
    const index = Math.floor(Math.random() * copy.length);
    return copy.splice(index, 1)[0];
  });
}

const pickupContainer = document.getElementById("pickup-container");
const picked = getRandomSongs(2);

picked.forEach((song, i) => {
  const direction = i % 2 === 0 ? "pickup-left" : "pickup-right";

  const item = document.createElement("a");
  item.href = song.link;
  item.className = `pickup-item ${direction}`;
  item.style.textDecoration = "none";  // 下線消す
  item.style.color = "inherit";        // 黒文字を引き継ぐ

  item.innerHTML = `
    <img src="${song.jacket}">
    <div class="pickup-text">
      <p>${song.quote1}</p>
      <p>${song.quote2}</p>
      <div class="pickup-from">from ${song.title}</div>
    </div>
  `;

  pickupContainer.appendChild(item);
});
