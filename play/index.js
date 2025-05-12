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
		const {
			videoUrl
		} = getUrlParams();
		const basePath = videoUrl.split('/').slice(0, -1).join('/');
		const infoPath = `${basePath}/info.json`;

		const response = await fetch(infoPath);
		if (!response.ok) throw new Error('信息文件加载失败');
		const data = await response.json();

		const mainInfo = data.Main.reduce((acc, item) => ({
			...acc,
			...item
		}), {});
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
			const [key, value] = Object.entries(staff)[0];
			item.innerHTML = `
        <span>${key}</span><br>
        <span>${value}</span>
    `;
			staffList.appendChild(item);
		});

	} catch (error) {
		console.error('加载番剧信息失败:', error);
	}
});

window.addEventListener('DOMContentLoaded', () => {
	const isLoggedIn = sessionStorage.getItem('isLoggedIn');
	const username = sessionStorage.getItem('username');
	const historyContent = document.getElementById('history-content');

	if (isLoggedIn) {
		// 更新用户信息
		document.getElementById('user-icon').src = '../svg/admin.svg';
		document.getElementById('user-text').textContent = username;
		document.getElementById('no-user').textContent = "";
		document.getElementById('user').href = '#';
		const historyPopup = document.querySelector('.history-popup');
		if (historyPopup) {
			historyPopup.style.left = '90.5%';
		}

		// 模拟获取历史记录数据
		const historyData = [{
				title: '天才治疗师 第1集',
				url: 'play/index.html?videoUrl=../media/Anime/1/1.mp4&title=天才治疗师退队作为无照治疗师快乐过活'
			},
			{
				title: '葬送的芙莉莲 第1集',
				url: 'play/index.html?videoUrl=../media/Anime/2/1.mp4&title=葬送的芙莉莲'
			},
			{
				title: '某科学的超电磁炮 第1集',
				url: 'play/index.html?videoUrl=../media/Anime/4/1.mp4&title=某科学的超电磁炮'
			}
		];

		// 生成带链接的历史记录
		historyContent.innerHTML = `
            <ul>
                ${historyData.map(item => `
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                        <a href="${item.url}" style="color: inherit; text-decoration: none;">
                            ${item.title}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;

		const sheets = document.styleSheets;
		let ruleIndex;
		let ruleFound = false;

		for (let i = 0; i < sheets.length && !ruleFound; i++) {
			const sheet = sheets[i];
			try {
				for (let j = 0; j < sheet.cssRules.length; j++) {
					if (sheet.cssRules[j].selectorText === "#history::after") {
						ruleIndex = j;
						ruleFound = true;
						break;
					}
				}
			} catch (e) {
				console.error("Error accessing style sheet:", e);
			}
		}
		if (ruleFound) {
			sheets[0].cssRules[ruleIndex].style.left = "90.5%";
		} else {
			console.log("对应样式规则未找到");
		}
	} else {
		historyContent.innerHTML = '<div class="no-history">无历史记录</div>';
	}
});

document.getElementById('user').addEventListener('click', () => {
	if (sessionStorage.getItem('isLoggedIn')) {
		sessionStorage.clear();
		location.reload();
	}
});