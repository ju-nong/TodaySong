// 페이징 관련 설정
const SONGS_PER_PAGE = 5; // 페이지당 노래 수
let currentPage = 1;
let allPreviousSongs = []; // 모든 이전 노래를 저장할 배열

// 다크 테마 값
const darkClass = "dark";

// 현재 날짜 표시
document.addEventListener('DOMContentLoaded', () => {
    // 오늘 날짜 가져오기
    const today = new Date();
    const formattedDate = formatDate(today);

    // 날짜 표시
    document.getElementById('todayDate').textContent = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    // CSV 데이터 로드
    loadSongData(formattedDate);

    // 테마 확인
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === darkClass) {
      document.body.classList.add(darkClass);
    }
});

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 * @param {Date} date - 날짜 객체
 * @returns {string} 포맷팅된 날짜 문자열
 */
function formatDate(date) {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * CSV 파일에서 노래 데이터 로드
 * @param {string} today - 오늘 날짜 (YYYY-MM-DD 형식)
 */
function loadSongData(today) {
    // CSV 파일 경로
    const csvFilePath = 'data/song.csv';

    // CSV 파일 가져오기
    fetch(csvFilePath)
        .then(response => response.text())
        .then(csvData => {
            // CSV 데이터 파싱
            Papa.parse(csvData, {
                header: true,
                delimiter: '|', // 구분자가 | 임을 명시
                skipEmptyLines: true,
                complete: function(results) {
                    // 파싱된 데이터 처리
                    processData(results.data, today);
                },
                error: function(error) {
                    console.error('CSV 파싱 오류:', error);
                }
            });
        })
        .catch(error => {
            console.error('CSV 파일 로드 오류:', error);
        });
}

/**
 * 파싱된 데이터 처리
 * @param {Array} data - 파싱된 CSV 데이터
 * @param {string} today - 오늘 날짜 (YYYY-MM-DD 형식)
 */
function processData(data, today) {
    // 오늘 날짜를 Date 객체로 변환
    const todayDate = new Date(today);

    // 오늘의 노래 필터링
    const todaySong = data.find(song => song.date === today);

    // 이전 노래 필터링 (오늘 날짜 이전만, 날짜 역순으로 정렬)
    allPreviousSongs = data
        .filter(song => {
            const songDate = new Date(song.date);
            // 오늘 날짜와 다르고, 오늘 날짜보다 이전인 경우만 포함
            return song.date !== today && songDate <= todayDate;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // 오늘의 노래 표시
    if (todaySong) {
        displayTodaySong(todaySong);
    } else {
        // 오늘 노래가 없는 경우, 가장 최신 노래 표시 (오늘 이전 날짜만)
        const pastSongs = data.filter(song => {
            const songDate = new Date(song.date);
            return songDate <= todayDate;
        });

        if (pastSongs.length > 0) {
            const latestSong = pastSongs.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            displayTodaySong(latestSong);

            // 이전 노래 목록에서 최신 노래 제외
            allPreviousSongs = allPreviousSongs.filter(song => song.date !== latestSong.date);
        } else {
            // 과거 노래가 없는 경우 처리
            document.getElementById('songTitle').textContent = "노래가 없습니다";
            document.getElementById('songArtist').textContent = "";
            document.getElementById('songCountry').textContent = "";
            document.getElementById('youtubePlayer').innerHTML = "";
        }
    }

    // 페이지네이션 생성 및 이전 노래 표시
    updatePagination();
    displayPreviousSongs();
}

/**
 * 페이지네이션 업데이트
 */
function updatePagination() {
    const totalPages = Math.ceil(allPreviousSongs.length / SONGS_PER_PAGE);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // 페이지가 1페이지 이하면 페이지네이션 숨기기
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    } else {
        paginationContainer.style.display = 'flex';
    }

    // 이전 버튼
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            displayPreviousSongs();
        }
    });
    paginationContainer.appendChild(prevButton);

    // 페이지 버튼
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            updatePagination();
            displayPreviousSongs();
        });
        paginationContainer.appendChild(pageButton);
    }

    // 다음 버튼
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            displayPreviousSongs();
        }
    });
    paginationContainer.appendChild(nextButton);
}

/**
 * 오늘의 노래 표시
 * @param {Object} song - 노래 데이터 객체
 */
function displayTodaySong(song) {
    // 노래 정보 표시
    document.getElementById('songTitle').textContent = song.name;
    document.getElementById('songArtist').textContent = `아티스트: ${song.author}`;
    document.getElementById('songCountry').textContent = `장르: ${song.country}`;

    // 유튜브 링크에서 비디오 ID 추출
    const videoId = extractVideoId(song.youtubeLink);

    // 유튜브 플레이어 생성
    const playerDiv = document.getElementById('youtubePlayer');
    playerDiv.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=0" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}

/**
 * 이전 노래 목록 표시 (페이징 적용)
 */
function displayPreviousSongs() {
    const previousSongsList = document.getElementById('previousSongsList');
    previousSongsList.innerHTML = ''; // 목록 초기화

    if (allPreviousSongs.length === 0) {
        previousSongsList.innerHTML = '<li>이전 노래가 없습니다.</li>';
        return;
    }

    // 현재 페이지에 표시할 노래 계산
    const startIndex = (currentPage - 1) * SONGS_PER_PAGE;
    const endIndex = Math.min(startIndex + SONGS_PER_PAGE, allPreviousSongs.length);
    const currentPageSongs = allPreviousSongs.slice(startIndex, endIndex);

    // 각 노래에 대한 목록 항목 생성
    currentPageSongs.forEach(song => {
        const videoId = extractVideoId(song.youtubeLink);

        // 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
        const [year, month, day] = song.date.split('-');
        const formattedDate = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;

        const li = document.createElement('li');
        // 데이터 속성 추가
        li.dataset.name = song.name;
        li.dataset.artist = song.author;
        li.dataset.country = song.country;
        li.dataset.videoId = videoId;

        li.innerHTML = `
            <div class="song-item">
                <div class="song-name">${song.name}</div>
                <div class="song-artist">${song.author}</div>
                <div class="song-country">${song.country}</div>
            </div>
            <div class="song-date">${formattedDate}</div>
            <button class="play-button" data-video-id="${videoId}">재생</button>
        `;

        previousSongsList.appendChild(li);
    });

    // 이전 노래 재생 버튼 이벤트 리스너 추가
    addPlayButtonListeners();
}

/**
 * 재생 버튼에 이벤트 리스너 추가
 */
function addPlayButtonListeners() {
    const playButtons = document.querySelectorAll('.play-button');

    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const listItem = this.closest('li');

            // 데이터 속성에서 노래 정보 가져오기
            const songName = listItem.dataset.name;
            const songArtist = listItem.dataset.artist;
            const songCountry = listItem.dataset.country;
            const videoId = listItem.dataset.videoId;

            // 노래 정보 업데이트
            document.getElementById('songTitle').textContent = songName;
            document.getElementById('songArtist').textContent = `아티스트: ${songArtist}`;
            document.getElementById('songCountry').textContent = `장르: ${songCountry}`;

            // 유튜브 플레이어 업데이트
            const playerDiv = document.getElementById('youtubePlayer');
            playerDiv.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;

            // 페이지 상단으로 스크롤
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * 유튜브 링크에서 비디오 ID 추출
 * @param {string} url - 유튜브 URL
 * @returns {string} 유튜브 비디오 ID
 */
function extractVideoId(url) {
    // URL에서 v 파라미터 추출 시도
    const urlParams = new URL(url).searchParams;
    const videoId = urlParams.get('v');

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
    console.error('유튜브 비디오 ID를 추출할 수 없습니다:', url);
    return '';
}

/**
 * 테마 변경
 */
const $themeButton = document.getElementById("theme-button");
$themeButton.addEventListener("click", function(){
    document.body.classList.toggle(darkClass);

    const isDark = document.body.classList.contains(darkClass);
    localStorage.setItem('theme', isDark ? darkClass : 'light');

})