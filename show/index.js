class ComicReader {
    constructor() {
        this.currentChapter = 0;
        this.chapterData = [];
        this.init();
    }

    async init() {
        // 获取基础路径
        const urlParams = new URLSearchParams(window.location.search);
        let basePath = urlParams.get('base') || '';
        
        // 路径规范化处理
        basePath = basePath
            .replace(/\/info\.json$/, '')
            .replace(/\/+$/, '') + '/';

        try {
            // 加载漫画数据
            const response = await fetch(`${basePath}info.json`);
            if (!response.ok) throw new Error(`HTTP错误 ${response.status}`);
            
            const data = await response.json();
            this.chapterData = data.Chapters;
            
            // 初始化界面
            this.renderHeader(data.Info);
            this.loadChapter(0);
            
            // 绑定事件
            document.getElementById('PrevChapter').addEventListener('click', () => this.prevChapter());
            document.getElementById('NextChapter').addEventListener('click', () => this.nextChapter());
            document.getElementById('GoTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
            
        } catch (error) {
            this.showError(`加载失败: ${error.message}`);
        }
    }

    renderHeader(info) {
        document.title = info[0].Title;
        document.getElementById('ChapterTitle').textContent = info[0].Title;
        document.getElementById('ChapterInfo').textContent = `更新日期: ${info[1].Data}`;
    }

    loadChapter(index) {
        const chapter = this.chapterData[index];
        if (!chapter) return;

        this.currentChapter = index;
        const container = document.getElementById('ComicContainer');
        
        // 清空容器
        container.innerHTML = '';
        
        // 加载所有页面
        chapter.Pages.forEach(imgPath => {
            const img = document.createElement('img');
            img.className = 'comic-page';
            img.src = imgPath;
            img.alt = `第${chapter.Number}章 第${chapter.Pages.indexOf(imgPath)+1}页`;
            container.appendChild(img);
        });

        // 更新按钮状态
        document.getElementById('PrevChapter').disabled = index === 0;
        document.getElementById('NextChapter').disabled = index === this.chapterData.length - 1;
    }

    prevChapter() {
        if (this.currentChapter > 0) {
            this.loadChapter(this.currentChapter - 1);
        }
    }

    nextChapter() {
        if (this.currentChapter < this.chapterData.length - 1) {
            this.loadChapter(this.currentChapter + 1);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ffeef0;
            color: #dc3545;
            padding: 15px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// 初始化阅读器
window.addEventListener('DOMContentLoaded', () => new ComicReader());