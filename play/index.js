function getUrlParams() {
	const params = new URLSearchParams(window.location.search);
	return {
		videoUrl: decodeURIComponent(params.get('videoUrl') || ''),
		videoTitle: decodeURIComponent(params.get('title') || '播放中')
	};
}

const {
	videoUrl,
	videoTitle
} = getUrlParams();
document.title = `${videoTitle}`;

const video = document.getElementById('main-video');
const playBtn = document.getElementById('play-btn');
const volumeSlider = document.getElementById('volume-slider');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const spinner = document.querySelector('.loading-spinner');

video.src = new URL(videoUrl, window.location.href).href;

let hideControlsTimer;
const controls = document.querySelector('.controls-container');
const HIDE_DELAY = 3000;

function resetHideTimer() {
	clearTimeout(hideControlsTimer);
	controls.classList.remove('controls-hidden');
	if (!video.paused) {
		hideControlsTimer = setTimeout(() => {
			controls.classList.add('controls-hidden');
		}, HIDE_DELAY);
	}
}

playBtn.addEventListener('click', () => {
	video[video.paused ? 'play' : 'pause']();
	resetHideTimer();
});

video.addEventListener('play', () => {
	playBtn.textContent = '⏸';
	resetHideTimer();
});

video.addEventListener('pause', () => {
	playBtn.textContent = '▶';
	controls.classList.remove('controls-hidden');
});

volumeSlider.addEventListener('input', (e) => {
	video.volume = e.target.value;
	resetHideTimer();
});

video.addEventListener('timeupdate', () => {
	const progress = (video.currentTime / video.duration) * 100;
	progressBar.style.width = `${progress}%`;

	currentTimeEl.textContent = formatTime(video.currentTime);
	durationEl.textContent = formatTime(video.duration);
});

document.querySelector('.progress-container').addEventListener('click', (e) => {
	const rect = e.target.getBoundingClientRect();
	video.currentTime = (e.clientX - rect.left) / rect.width * video.duration;
	resetHideTimer();
});

document.getElementById('fullscreen-btn').addEventListener('click', () => {
	if (!document.fullscreenElement) {
		document.querySelector('.player-container').requestFullscreen();
	} else {
		document.exitFullscreen();
	}
	resetHideTimer();
});

video.addEventListener('waiting', () => spinner.style.display = 'block');
video.addEventListener('playing', () => spinner.style.display = 'none');

document.addEventListener('keydown', (e) => {
	switch (e.code) {
		case 'Space':
			e.preventDefault();
			video[video.paused ? 'play' : 'pause']();
			break;
		case 'ArrowRight':
			video.currentTime += 5;
			break;
		case 'ArrowLeft':
			video.currentTime -= 5;
			break;
	}
	resetHideTimer();
});

function formatTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	seconds = Math.floor(seconds % 60);
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.addEventListener('mousemove', resetHideTimer);
controls.addEventListener('mouseenter', () => clearTimeout(hideControlsTimer));
controls.addEventListener('mouseleave', resetHideTimer);
video.addEventListener('loadedmetadata', () => {
	durationEl.textContent = formatTime(video.duration);
});
resetHideTimer();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { videoUrl } = getUrlParams();
        const basePath = videoUrl.split('/').slice(0, -1).join('/');
        const infoPath = `${basePath}/info.json`;

        const response = await fetch(infoPath);
        if (!response.ok) throw new Error('信息文件加载失败');
        const data = await response.json();

		const mainInfo = data.Main.reduce((acc, item) => ({...acc, ...item}), {});
		document.getElementById('cover').src = mainInfo.Cover;
		document.getElementById('anime-name').textContent = mainInfo.Name;
		document.getElementById('anime-status').textContent = `状态：${mainInfo.Status}`;
		document.getElementById('anime-year').textContent = `年份：${mainInfo.Year}`;
		document.getElementById('anime-description').textContent = mainInfo.Introduction;
		
		const categoryContainer = document.getElementById('anime-category');
		data.Classification.forEach(cat => {
		    const span = document.createElement('span');
		    span.textContent = cat.attribute;
		    categoryContainer.appendChild(span);
		});

		const seriesList = document.getElementById('series-list');
		data.Series.forEach(ep => {
			const card = document.createElement('div');
			card.className = 'episode-card';
			card.innerHTML = `
                <a href="?videoUrl=${encodeURIComponent(ep.src.split('&')[0])}&title=${ep.src.split('title=')[1]}">
                    <div>第${ep.Number}话</div>
                    <div class="episode-title">${ep.src.split('title=')[1]}</div>
                </a>
            `;
			seriesList.appendChild(card);
		});

		const dubbingList = document.getElementById('dubbing-list');
		data.Dubbing.forEach(cast => {
			const card = document.createElement('div');
			card.className = 'character-card';
			card.innerHTML = `
                <div class="character-info">
                    <div class="character-name">${cast.Character}</div>
                    <div class="cv-name">CV: ${cast.Name}</div>
                </div>
            `;
			dubbingList.appendChild(card);
		});

		const staffList = document.getElementById('staff-list');
		data.STAFF.forEach(staff => {
			const item = document.createElement('div');
			item.className = 'staff-item';
			item.textContent = Object.values(staff)[0];
			staffList.appendChild(item);
		});

	} catch (error) {
		console.error('加载番剧信息失败:', error);
	}
});