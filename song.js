import "./define-types.js";

import { displayEmptySong } from "./display.js";

let song = [];

/**
 * 노래 설정
 * @returns {Promise<SongItem[]>}
 */
export async function initSong() {
    const tempSong = await handleLoadCSV();

    // 노래가 없는 경우
    if (tempSong.length < 1) {
        displayEmptySong();
        return;
    }

    song = setSortSong(tempSong);

    return song;
}

/**
 * CSV 파일 불러오기
 * @returns {Promise<SongItem[]>}
 */
async function handleLoadCSV() {
    try {
        const response = await fetch("data/song.csv");
        const data = await response.text();

        // 파싱
        const parseList = Papa.parse(data, {
            header: true,
            delimiter: "|", // 구분자가 | 임을 명시
            skipEmptyLines: true,
        });

        return parseList.data;
    } catch (error) {
        console.error("CSV 파일 로드 오류:", error);

        return [];
    }
}

/**
 * 노래 정렬
 * @param {Array<SongItem>} list
 */
function setSortSong(list) {
    // 날짜 역순으로 정렬
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
}
