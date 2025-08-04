import { displayToday } from "./display.js";

const today = new Date();

/**
 * 최초 오늘 날짜 표시
 */
export function initTodayDate() {
    // 날짜 표시
    displayToday(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 * @param {Date} date - 날짜 객체
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function formatDate(date) {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
