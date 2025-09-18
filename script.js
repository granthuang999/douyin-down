// 全局变量
let currentVideoData = null;
let currentCoverUrl = null;

// 密码验证功能
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');
    const password = passwordInput.value.trim();
    
    if (password === '123456') {
        // 密码正确，显示主界面
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('mainContainer').classList.remove('hidden');
        loginError.textContent = '';
    } else {
        // 密码错误
        loginError.textContent = '密码错误，请重新输入';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// 回车键登录
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
});

// 提取链接的正则表达式
function extractUrl(text) {
    // 匹配 http 或 https 开头的链接
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    
    if (matches && matches.length > 0) {
        return matches[0];
    }
    
    // 如果没有找到完整的 http 链接，尝试匹配抖音短链接格式
    const douyinRegex = /([a-zA-Z0-9]+\.douyin\.com\/[a-zA-Z0-9]+)/g;
    const douyinMatches = text.match(douyinRegex);
    
    if (douyinMatches && douyinMatches.length > 0) {
        return 'https://' + douyinMatches[0];
    }
    
    return null;
}

// 显示错误信息
function showError(message) {
    const parseError = document.getElementById('parseError');
    parseError.textContent = message;
    setTimeout(() => {
        parseError.textContent = '';
    }, 5000);
}

// 显示加载状态
function showLoading(show) {
    const loadingSection = document.getElementById('loadingSection');
    const resultSection = document.getElementById('resultSection');
    
    if (show) {
        loadingSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
    } else {
        loadingSection.classList.add('hidden');
    }
}

// 获取 aweme_id
async function getAwemeId(url) {
    try {
        const response = await fetch(`http://178.128.6.123/api/douyin/web/get_aweme_id?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
            return data.data;
        } else {
            throw new Error('获取视频ID失败');
        }
    } catch (error) {
        console.error('获取aweme_id失败:', error);
        throw error;
    }
}

// 获取视频信息
async function getVideoInfo(awemeId) {
    try {
        const response = await fetch(`http://178.128.6.123/api/douyin/web/fetch_one_video?aweme_id=${awemeId}`);
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.aweme_detail) {
            return data.data.aweme_detail;
        } else {
            throw new Error('获取视频信息失败');
        }
    } catch (error) {
        console.error('获取视频信息失败:', error);
        throw error;
    }
}

// 显示视频信息
function displayVideoInfo(videoInfo) {
    const resultSection = document.getElementById('resultSection');
    const videoTitle = document.getElementById('videoTitle');
    const coverImage = document.getElementById('coverImage');
    const coverPlaceholder = document.getElementById('coverPlaceholder');
    
    // 显示标题
    videoTitle.textContent = videoInfo.desc || '无标题';
    
    // 显示封面
    if (videoInfo.cover_url) {
        currentCoverUrl = videoInfo.cover_url;
        coverImage.src = videoInfo.cover_url;
        coverImage.style.display = 'block';
        coverPlaceholder.style.display = 'none';
        
        // 处理图片加载错误
        coverImage.onerror = function() {
            this.style.display = 'none';
            coverPlaceholder.style.display = 'block';
            coverPlaceholder.textContent = '封面加载失败';
        };
    } else {
        coverImage.style.display = 'none';
        coverPlaceholder.style.display = 'block';
        coverPlaceholder.textContent = '暂无封面';
        currentCoverUrl = null;
    }
    
    // 保存视频数据
    currentVideoData = videoInfo;
    
    // 显示结果区域
    resultSection.classList.remove('hidden');
}

// 解析视频
async function parseVideo() {
    const linkInput = document.getElementById('linkInput');
    const inputText = linkInput.value.trim();
    
    if (!inputText) {
        showError('请输入抖音分享链接');
        return;
    }
    
    // 提取链接
    const extractedUrl = extractUrl(inputText);
    if (!extractedUrl) {
        showError('未找到有效的链接，请检查输入内容');
        return;
    }
    
    console.log('提取到的链接:', extractedUrl);
    
    try {
        showLoading(true);
        
        // 获取 aweme_id
        const awemeId = await getAwemeId(extractedUrl);
        console.log('获取到的aweme_id:', awemeId);
        
        // 获取视频信息
        const videoInfo = await getVideoInfo(awemeId);
        console.log('获取到的视频信息:', videoInfo);
        
        // 显示视频信息
        displayVideoInfo(videoInfo);
        
    } catch (error) {
        console.error('解析失败:', error);
        showError('解析失败: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// 下载文件的通用函数
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 下载视频
function downloadVideo() {
    if (!currentVideoData || !currentVideoData.video || !currentVideoData.video.bit_rate) {
        showError('没有可下载的视频数据');
        return;
    }
    
    try {
        // 获取视频下载链接
        const bitRates = currentVideoData.video.bit_rate;
        if (bitRates.length === 0) {
            showError('没有找到视频下载链接');
            return;
        }
        
        // 取第一个bit_rate的第一个url
        const playAddr = bitRates[0].play_addr;
        if (!playAddr || !playAddr.url_list || playAddr.url_list.length === 0) {
            showError('没有找到有效的视频下载链接');
            return;
        }
        
        const videoUrl = playAddr.url_list[0];
        const filename = `抖音视频_${Date.now()}.mp4`;
        
        console.log('下载视频链接:', videoUrl);
        downloadFile(videoUrl, filename);
        
    } catch (error) {
        console.error('下载视频失败:', error);
        showError('下载视频失败: ' + error.message);
    }
}

// 下载封面
function downloadCover() {
    if (!currentCoverUrl) {
        showError('没有可下载的封面');
        return;
    }
    
    try {
        const filename = `抖音封面_${Date.now()}.jpg`;
        console.log('下载封面链接:', currentCoverUrl);
        downloadFile(currentCoverUrl, filename);
    } catch (error) {
        console.error('下载封面失败:', error);
        showError('下载封面失败: ' + error.message);
    }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 给链接输入框添加回车键解析功能
    const linkInput = document.getElementById('linkInput');
    if (linkInput) {
        linkInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                parseVideo();
            }
        });
    }
    
    console.log('抖音去水印下载工具已加载');
});