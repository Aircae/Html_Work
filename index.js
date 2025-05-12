const inItems = document.querySelectorAll('#in .in_item');
const dots = document.querySelectorAll('.dot');
const inContainer = document.getElementById('in');
let currentIndex = 0;

window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const username = sessionStorage.getItem('username');
    const historyContent = document.getElementById('history-content');

    if(isLoggedIn) {
        // 更新用户信息
        document.getElementById('user-icon').src = 'svg/admin.svg';
        document.getElementById('user-text').textContent = username;
        document.getElementById('user').href = '#';
        
        // 模拟获取历史记录数据
        const historyData = [
            { 
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
    } else {
        historyContent.innerHTML = '<div class="no-history">无历史记录</div>';
    }
});
	
	document.getElementById('user').addEventListener('click', () => {
		if(sessionStorage.getItem('isLoggedIn')) {
			sessionStorage.clear();
			location.reload();
		}
	});

function initCarousel() {
	updateCarousel();
	startAutoSlide();

	dots.forEach((dot, index) => {
		dot.addEventListener('click', () => {
			currentIndex = index;
			updateCarousel();
			resetAutoSlide();
		});
	});
}

function updateCarousel() {
	inContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

	dots.forEach(dot => {
		dot.classList.remove('active');
	});
	dots[currentIndex].classList.add('active');
}

let autoSlideInterval;

function startAutoSlide() {
	autoSlideInterval = setInterval(() => {
		currentIndex = (currentIndex + 1) % inItems.length;
		updateCarousel();
	}, 3000);
}

function resetAutoSlide() {
	clearInterval(autoSlideInterval);
	startAutoSlide();
}

const pictureBox = document.getElementById('picture_box');
pictureBox.addEventListener('mouseenter', () => {
	clearInterval(autoSlideInterval);
});
pictureBox.addEventListener('mouseleave', () => {
	startAutoSlide();
});

initCarousel();