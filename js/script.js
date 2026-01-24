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
