// 다크 테마 값
const DARK_CLASS = "dark";

/**
 * 테마 변경
 */
const $themeButton = document.getElementById("theme-button");
$themeButton.addEventListener("click", function () {
    document.body.classList.toggle(DARK_CLASS);

    const isDark = document.body.classList.contains(DARK_CLASS);
    localStorage.setItem("theme", isDark ? DARK_CLASS : "light");
});

/**
 * 최초 테마 확인 및 적용
 */
export function initTheme() {
    if (localStorage.getItem("theme") === DARK_CLASS) {
        document.body.classList.add(DARK_CLASS);
    }
}
