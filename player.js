import "./define-types.js";
import { PLAYER_ELEMENT_ID } from "./constants.js";

import { song } from "./script.js";
import { displaySongInfo, handleAutoPlay } from "./display.js";

let player = null; // 유튜브 플레이어
let playingIndex = -1; // 재생 중인 영상 index

/**
 * 플레이어 설정
 * @param {SongItem} songItem
 */

export function setPlayer(songItem, index) {
    playingIndex = index;

    const videoId = extractVideoId(songItem.youtubeLink);

    if (player === null) {
        player = new YT.Player(PLAYER_ELEMENT_ID, {
            height: "100%",
            width: "100%",
            videoId,
            playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                rel: 0,
            },
            events: {
                onStateChange: handlePlayerStateChange,
            },
        });
    } else {
        player.loadVideoById(videoId);
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });

    displaySongInfo(songItem);
}

/**
 * 플레이어 상태 변경 이벤트
 * @param {*} event
 */
function handlePlayerStateChange(event) {
    // 재생 완료
    if (event.data === 0) {
        const nextPlayInex =
            song.length - 1 === playingIndex ? 0 : playingIndex + 1;

        setPlayer(song[nextPlayInex], nextPlayInex);
        handleAutoPlay(nextPlayInex);
    }
}

/**
 * 유튜브 링크에서 비디오 ID 추출
 * @param {string} youtubeLink
 * @returns {string} 유튜브 비디오 ID
 */
function extractVideoId(url) {
    // URL에서 v 파라미터 추출 시도
    const urlParams = new URL(url).searchParams;
    const videoId = urlParams.get("v");

    if (videoId) {
        return videoId;
    }

    // youtu.be 형식 URL 처리
    const youtuBeRegex = /youtu\.be\/([^?]+)/;
    const youtuBeMatch = url.match(youtuBeRegex);

    if (youtuBeMatch && youtuBeMatch[1]) {
        return youtuBeMatch[1];
    }

    // 다른 형식의 URL 처리
    const embedRegex = /embed\/([^?]+)/;
    const embedMatch = url.match(embedRegex);

    if (embedMatch && embedMatch[1]) {
        return embedMatch[1];
    }

    // 위 모든 형식에 맞지 않는 경우, 빈 문자열 반환
    console.error("유튜브 비디오 ID를 추출할 수 없습니다:", url);
    return "";
}
