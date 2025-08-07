import { PAGE_SIZE } from "./constants.js";

import { initSong } from "./song.js";
import { initTodayDate } from "./date.js";
import { initTheme } from "./theme.js";
import { setPlayer } from "./player.js";
import { initPagination } from "./display.js";

/** @type {SongItem[]} */
export let song = [];

document.addEventListener("DOMContentLoaded", async () => {
    // 노래 설정
    song = await initSong();
    init();

    // 오늘 날짜 표시
    initTodayDate();

    // 테마 적용
    initTheme();
});

function init() {
    if (song.length < 1) {
        return;
    }

    const { page, index } = getQueryParameter();

    if (page < 0 || index < 0) {
        setPlayer(song[0], 0);
        initPagination();
    } else {
        const playingIndex = (page - 1) * PAGE_SIZE + (index - 1);
        setPlayer(song[playingIndex], playingIndex);
        initPagination(page, index);
    }
}

/**
 * 쿼리 파라미터 가져오기
 * @returns {{page:number; index:number}}
 */
export function getQueryParameter() {
    const params = new URLSearchParams(window.location.search);

    const page = params.get("page");
    const index = params.get("index");

    return {
        page: page === null ? -1 : parseInt(page),
        index: index === null ? -1 : parseInt(index),
    };
}
