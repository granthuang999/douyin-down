// 密码验证
function checkPassword() {
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    if (password === 'scys') {
        document.getElementById('login-box').classList.add('hidden');
        document.getElementById('main-box').classList.remove('hidden');
        errorMessage.style.display = 'none';
    } else {
        errorMessage.style.display = 'block';
        errorMessage.textContent = '密码错误，请重新输入';
    }
}

// 监听回车键
document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkPassword();
    }
});

// 提取链接
function extractLinks() {
    const text = document.getElementById('linkText').value;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    
    if (urls && urls.length > 0) {
        // 取第一个链接
        const url = urls[0];
        processVideo(url);
    } else {
        alert('未找到有效的链接，请检查输入内容');
    }
}

// 处理视频
async function processVideo(url) {
    // 显示加载状态
    document.getElementById('input-section').classList.add('hidden');
    document.getElementById('loading-section').classList.remove('hidden');
    
    try {
        // 这里应该调用实际的API来解析视频
        // 由于这是演示版本，我们模拟一个延迟和结果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 模拟解析结果
        const videoInfo = {
            title: '示例视频标题 - 这是一个演示',
            author: '示例作者',
            description: '这是一个示例视频的描述信息，展示了去水印工具的功能。',
            cover: 'https://via.placeholder.com/300x200?text=视频封面',
            videoUrl: '#', // 实际应用中这里是真实的视频下载链接
            duration: '00:30'
        };
        
        displayResult(videoInfo);
        
    } catch (error) {
        console.error('处理视频时出错:', error);
        alert('处理视频时出现错误，请稍后重试');
        resetToInput();
    }
}

// 显示结果
function displayResult(videoInfo) {
    // 隐藏加载状态
    document.getElementById('loading-section').classList.add('hidden');
    
    // 填充视频信息
    document.getElementById('video-title').textContent = videoInfo.title;
    document.getElementById('video-author').textContent = videoInfo.author;
    document.getElementById('video-description').textContent = videoInfo.description;
    document.getElementById('video-duration').textContent = videoInfo.duration;
    
    // 设置封面图片
    const coverImg = document.getElementById('cover-img');
    const coverPlaceholder = document.getElementById('cover-placeholder');
    
    if (videoInfo.cover) {
        coverImg.src = videoInfo.cover;
        coverImg.style.display = 'block';
        coverPlaceholder.style.display = 'none';
    } else {
        coverImg.style.display = 'none';
        coverPlaceholder.style.display = 'block';
    }
    
    // 设置下载链接
    document.getElementById('download-video').onclick = () => downloadVideo(videoInfo.videoUrl);
    document.getElementById('download-cover').onclick = () => downloadCover(videoInfo.cover);
    
    // 显示结果区域
    document.getElementById('result-section').classList.remove('hidden');
}

// 下载视频
function downloadVideo(url) {
    if (url === '#') {
        alert('这是演示版本，实际使用时会下载真实的无水印视频');
        return;
    }
    
    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = '无水印视频.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 下载封面
function downloadCover(url) {
    if (!url || url.includes('placeholder')) {
        alert('这是演示版本，实际使用时会下载真实的视频封面');
        return;
    }
    
    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = '视频封面.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 重新开始
function resetToInput() {
    document.getElementById('input-section').classList.remove('hidden');
    document.getElementById('loading-section').classList.add('hidden');
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('linkText').value = '';
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 确保初始状态正确
    document.getElementById('main-box').classList.add('hidden');
    document.getElementById('loading-section').classList.add('hidden');
    document.getElementById('result-section').classList.add('hidden');
    
    // 监听文本框的回车键
    document.getElementById('linkText').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            extractLinks();
        }
    });
});