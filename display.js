import "./define-types.js";
import {
    PLAYER_CONTAINER_ELEMENT_ID,
    SONG_TITLE_ELEMENT_ID,
    SONG_ARTIST_ELEMENT_ID,
    SONG_GENRE_ELEMENT_ID,
    PAGINATION_CONTAINER_ELEMENT_ID,
    PAGINATION_ELEMENT_ID,
    PAGINATION_BUTTON_FIRST_ELEMENT_ID,
    PAGINATION_BUTTON_LAST_ELEMENT_ID,
    PAGINATION_BUTTON_PREV_ELEMENT_ID,
    PAGINATION_BUTTON_NEXT_ELEMENT_ID,
    SONG_LIST_ELEMENT_ID,
    PAGE_SIZE,
} from "./constants.js";

import { song } from "./script.js";
import { setPlayer } from "./player.js";

const ACTIVE_PAGE_BUTTON_CLASS = "active";

let totalPage = 1;
let currentPage = 1;
let currentIndex = 1;

let tempPage = 1;

// song info elements
const $title = document.getElementById(SONG_TITLE_ELEMENT_ID);
const $artist = document.getElementById(SONG_ARTIST_ELEMENT_ID);
const $genre = document.getElementById(SONG_GENRE_ELEMENT_ID);

// pagination elements
const $paginationContainer = document.getElementById(
    PAGINATION_CONTAINER_ELEMENT_ID,
);
const $pagination = document.getElementById(PAGINATION_ELEMENT_ID);

const $paginationButtonFirst = document.getElementById(
    PAGINATION_BUTTON_FIRST_ELEMENT_ID,
);
$paginationButtonFirst.addEventListener("click", () => {
    handleClickPageButton(1);
});
const $paginationButtonLast = document.getElementById(
    PAGINATION_BUTTON_LAST_ELEMENT_ID,
);
$paginationButtonLast.addEventListener("click", () => {
    handleClickPageButton(totalPage);
});
const $paginationButtonPrev = document.getElementById(
    PAGINATION_BUTTON_PREV_ELEMENT_ID,
);
$paginationButtonPrev.addEventListener("click", () => {
    if (tempPage < 2) {
        return;
    }

    handleClickPageButton(tempPage - 1);
});
const $paginationButtonNext = document.getElementById(
    PAGINATION_BUTTON_NEXT_ELEMENT_ID,
);
$paginationButtonNext.addEventListener("click", () => {
    if (tempPage === totalPage) {
        return;
    }

    handleClickPageButton(tempPage + 1);
});

// song elements
const $songList = document.getElementById(SONG_LIST_ELEMENT_ID);

/**
 * 페이지네이션 설정
 * @param {number} page
 * @param {number} index
 */
export function initPagination(page = 1, index = 1) {
    currentPage = page;
    currentIndex = index;

    tempPage = page;

    totalPage = Math.ceil(song.length / PAGE_SIZE);

    if (totalPage < 1) {
        $paginationContainer.style.display = "none";
        totalPage = 1;
        return;
    }

    displayPageButton(page);

    // // 페이지 버튼
    // for (let i = 1; i < totalPage + 1; i++) {
    //     const $pageButton = document.createElement("button");
    //     $pageButton.textContent = i;
    //     $pageButton.classList.toggle(ACTIVE_PAGE_BUTTON_CLASS, i === page);

    //     $pageButton.addEventListener("click", () => handleClickPageButton(i));

    //     $pagination.appendChild($pageButton);
    // }

    displaySongList(page, index);
}

/**
 * 페이지 버튼 클릭 이벤트
 * @param {number} page
 * @param {boolean} action	// 사용자가 직접 클릭한 것인지 여부
 */
function handleClickPageButton(page, action = true) {
    // for (let i = 0; i < $pagination.childElementCount; i++) {
    //     $pagination.children[i].classList.remove(ACTIVE_PAGE_BUTTON_CLASS);
    // }

    // $pagination.children[page - 1].classList.add(ACTIVE_PAGE_BUTTON_CLASS);
    displayPageButton(page);

    if (action) {
        tempPage = page;
        displaySongList(page);
    }
}

/**
 * 페이지 버튼 표시
 * @param {number} page
 */
function displayPageButton(page) {
    $pagination.innerHTML = "";

    if (totalPage < 11) {
        for (let i = 1; i < totalPage + 1; i++) {
            const $pageButton = document.createElement("button");
            $pageButton.textContent = i;
            $pageButton.classList.toggle(ACTIVE_PAGE_BUTTON_CLASS, i === page);

            $pageButton.addEventListener("click", () =>
                handleClickPageButton(i),
            );

            $pagination.appendChild($pageButton);
        }
        return;
    }

    let startPoint = page - 5;
    let endPoint = page + 4;
    if (startPoint < 1) {
        // startPoint가 1미만일 경우

        endPoint = endPoint + Math.abs(1 - startPoint);
        startPoint = 1;
    }
    if (endPoint > totalPage) {
        // endPoint가 total 초과일 경우

        startPoint = startPoint - Math.abs(totalPage - endPoint);
        endPoint = totalPage;
    }

    for (let i = startPoint; i < endPoint + 1; i++) {
        const $pageButton = document.createElement("button");
        $pageButton.textContent = i;
        $pageButton.classList.toggle(ACTIVE_PAGE_BUTTON_CLASS, i === page);

        $pageButton.addEventListener("click", () => handleClickPageButton(i));

        $pagination.appendChild($pageButton);
    }
}

/**
 * 페이지에 해당하는 노래 목록 표시
 * @param {number} page
 * @param {number} index
 */
async function displaySongList(page = 1, index = 1) {
    const splitSongList = song.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (splitSongList.length < 1) {
        $songList.innerHTML = "<li>이전 노래가 없습니다.</li>";
        return;
    }

    $songList.innerHTML = "";

    for (let i = 0; i < splitSongList.length; i++) {
        const { date, name, author, genre } = splitSongList[i];

        // 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
        const [year, month, day] = date.split("-");
        const formattedDate = `${year}년 ${parseInt(month)}월 ${parseInt(
            day,
        )}일`;

        const $li = document.createElement("li");
        $li.innerHTML = `
            <div class="song-item">
                <div class="song-name">${name}</div>
                <div class="song-artist">${author}</div>
                <div class="song-genre">${genre}</div>
            </div>
            <div class="song-date">${formattedDate}</div>
        `;

        if (currentPage === page && currentIndex === i + 1) {
            $li.classList.add("current");
        }

        const $playButton = document.createElement("button");
        $playButton.classList.add("play-button");

        const isPlayingSong = currentPage === page && currentIndex === i + 1;

        $playButton.textContent = isPlayingSong ? "재생 중" : "재생";
        $playButton.addEventListener("click", () => {
            // 같은 거 누르면 막음
            if (isPlayingSong) {
                return;
            }

            replaceURL(page, i + 1);

            setPlayer(splitSongList[i], (page - 1) * PAGE_SIZE + i);
            displaySongList(page, i + 1);
        });
        $li.appendChild($playButton);

        $songList.appendChild($li);
    }
}

/**
 * 오늘 날짜 표시
 * @param {number} year
 * @param {number} month
 * @param {number} date
 */
export function displayToday(year, month, date) {
    document.getElementById(
        "todayDate",
    ).textContent = `${year}년 ${month}월 ${date}일`;
}

/**
 * 저장된 노래가 없는 경우 예외 문구 표시
 */
export function displayEmptySong() {
    document.getElementById(PLAYER_CONTAINER_ELEMENT_ID).style.display = "none";
    $title.textContent = "노래가 없습니다";
}

/**
 * 노래 정보 표시
 * @param {SongItem} songItem
 */
export function displaySongInfo(songItem) {
    const { name, author, genre } = songItem;

    $title.textContent = name;
    $artist.textContent = `아티스트: ${author}`;
    $genre.textContent = `장르: ${genre}`;
}

/**
 * URL 변경
 * @param {number} page
 * @param {number} index
 */
function replaceURL(page, index) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page);
    params.set("index", index);

    currentPage = page;
    currentIndex = index;

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl); // 현재 상태 덮어쓰기
}

/**
 * 자동 재생 이벤트
 * @param {number} index
 */
export function handleAutoPlay(index) {
    const playingPage = Math.floor(index / PAGE_SIZE) + 1;

    // 페이지가 변경 됐을 시
    if (currentPage !== playingPage) {
        currentPage = playingPage;

        handleClickPageButton(playingPage, false);
    }

    const playingIndex = index - (playingPage - 1) * PAGE_SIZE + 1;
    currentIndex = playingIndex;

    displaySongList(playingPage, playingIndex);
    replaceURL(playingPage, playingIndex);
}
