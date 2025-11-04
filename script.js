/**
 * 图片管理网站 - 共用交互逻辑文件
 * 说明：需确保在 HTML 文件中最后引入此脚本（DOM 加载完成后执行）
 * 可根据实际需求修改：baseUrl（GitHub Pages 基础路径）、compressQuality（图片压缩质量）
 */
const CONFIG = {
    // 替换为你的 GitHub Pages 图片存储路径（格式：https://[用户名].github.io/[仓库名]/[存储文件夹名]/）
    // 示例：若你GitHub用户名为“张三”，仓库名为“my-image-site”，存储文件夹为“image-storage”，则改为：
    // baseUrl: 'https://zhangsan.github.io/my-image-site/image-storage/',
    baseUrl: 'https://hjq1314.github.io/image-storage/', 
    compressQuality: { jpg: 0.8, png: 1, webp: 0.8 }, // 可调整压缩质量
    adminAccount: 'f240925', // 固定管理员账号（按需修改）
    adminPassword: 'HJQ1314' // 固定管理员密码（按需修改）
};
// 全局状态：存储当前操作的图片文件、验证码等
let GLOBAL_STATE = {
    currentUploadFile: null, // 当前待上传的图片文件
    verifyCode: '' // 当前有效验证码
};

// DOM 加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    // 1. 初始化页面：根据当前页面（admin/user）加载对应模块
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'admin.html') {
        // 管理员页面：初始化登录、验证码、上传、列表模块
        initAdminPage();
    } else if (currentPage === 'user.html') {
        // 用户页面：初始化弹窗、链接校验模块
        initUserPage();
    }
});


/**
 * 一、管理员页面初始化模块
 * 包含：登录验证、验证码生成、图片上传/压缩、列表管理（复制/删除）
 */
function initAdminPage() {
    // 1. 初始化DOM元素（管理员页面专属）
    const adminElements = {
        // 登录模块
        loginForm: document.getElementById('login-form'),
        adminAccountInput: document.getElementById('admin-account'),
        adminPasswordInput: document.getElementById('admin-password'),
        verifyCodeInput: document.getElementById('verify-code'),
        verifyCodeImg: document.getElementById('verify-code-img'),
        refreshVerifyBtn: document.getElementById('refresh-verify'),
        loginTip: document.getElementById('login-tip'),
        // 模块显示控制
        loginSection: document.getElementById('login-section'),
        uploadSection: document.getElementById('upload-section'),
        imageListSection: document.getElementById('image-list-section'),
        logoutBtn: document.getElementById('logout-btn'),
        // 图片上传模块
        imageUpload: document.getElementById('image-upload'),
        uploadTip: document.getElementById('upload-tip'),
        imagePreview: document.getElementById('image-preview'),
        previewImg: document.querySelector('.preview-img'),
        confirmUploadBtn: document.getElementById('confirm-upload'),
        // 图片列表模块
        listEmpty: document.getElementById('list-empty'),
        imageTable: document.getElementById('image-table'),
        imageTableBody: document.getElementById('image-table-body')
    };

    // 2. 初始化登录状态（页面加载时检查）
    checkAdminLoginStatus(adminElements);

    // 3. 验证码模块：生成初始验证码 + 绑定刷新事件
    generateVerifyCode(adminElements.verifyCodeImg);
    adminElements.verifyCodeImg.addEventListener('click', () => generateVerifyCode(adminElements.verifyCodeImg));
    adminElements.refreshVerifyBtn.addEventListener('click', () => generateVerifyCode(adminElements.verifyCodeImg));

    // 4. 登录表单提交事件（阻止默认提交，自定义验证）
    adminElements.loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAdminLogin(adminElements);
    });

    // 5. 退出登录事件
    adminElements.logoutBtn.addEventListener('click', () => handleAdminLogout(adminElements));

    // 6. 图片选择事件（预览 + 格式/大小校验）
    adminElements.imageUpload.addEventListener('change', (e) => handleImageSelect(e, adminElements));

    // 7. 确认上传事件（压缩图片 + 生成记录）
    adminElements.confirmUploadBtn.addEventListener('click', () => handleImageUpload(adminElements));

    // 8. 初始化图片列表（加载localStorage中的记录）
    renderImageList(adminElements);
}


/**
 * 二、用户页面初始化模块
 * 包含：链接校验、图片弹窗加载/关闭/重新加载
 */
function initUserPage() {
    // 1. 初始化DOM元素（用户页面专属）
    const userElements = {
        linkInput: document.getElementById('image-link'),
        viewImageBtn: document.getElementById('view-image-btn'),
        clearInputBtn: document.getElementById('clear-input-btn'),
        inputTip: document.getElementById('input-tip'),
        // 弹窗模块
        imageModal: document.getElementById('image-modal'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalReloadBtn: document.getElementById('modal-reload-btn'),
        modalLoading: document.getElementById('modal-loading'),
        modalImage: document.getElementById('modal-image'),
        modalError: document.getElementById('modal-error')
    };

    // 2. 绑定核心事件
    // 查看图片（按钮 + 回车键）
    userElements.viewImageBtn.addEventListener('click', () => handleViewImage(userElements));
    userElements.linkInput.addEventListener('keydown', (e) => e.key === 'Enter' && handleViewImage(userElements));
    // 清空输入框
    userElements.clearInputBtn.addEventListener('click', () => {
        userElements.linkInput.value = '';
        userElements.inputTip.innerText = '';
        userElements.inputTip.className = 'tip-text';
    });
    // 弹窗关闭（按钮 + 遮罩层 + ESC键）
    userElements.modalCloseBtn.addEventListener('click', () => hideImageModal(userElements));
    userElements.imageModal.addEventListener('click', (e) => e.target === userElements.imageModal && hideImageModal(userElements));
    document.addEventListener('keydown', (e) => e.key === 'Escape' && hideImageModal(userElements));
    // 弹窗重新加载
    userElements.modalReloadBtn.addEventListener('click', () => handleViewImage(userElements));
}


/**
 * 三、管理员登录相关函数
 */
// 1. 检查登录状态（控制模块显示/隐藏）
function checkAdminLoginStatus(elements) {
    const isLogin = localStorage.getItem('adminLoginStatus') === 'true';
    if (isLogin) {
        elements.loginSection.classList.add('hidden');
        elements.uploadSection.classList.remove('hidden');
        elements.imageListSection.classList.remove('hidden');
        elements.logoutBtn.classList.remove('hidden');
    } else {
        elements.loginSection.classList.remove('hidden');
        elements.uploadSection.classList.add('hidden');
        elements.imageListSection.classList.add('hidden');
        elements.logoutBtn.classList.add('hidden');
    }
}

// 2. 处理登录验证
function handleAdminLogin(elements) {
    const account = elements.adminAccountInput.value.trim();
    const password = elements.adminPasswordInput.value.trim();
    const inputCode = elements.verifyCodeInput.value.trim().toUpperCase();

    // 基础校验
    if (!account || !password || !inputCode) {
        showTip(elements.loginTip, '请填写完整账号、密码和验证码', 'error');
        return;
    }

    // 验证码校验
    if (inputCode !== GLOBAL_STATE.verifyCode.toUpperCase()) {
        showTip(elements.loginTip, '验证码错误，请重新输入', 'error');
        generateVerifyCode(elements.verifyCodeImg); // 刷新验证码
        return;
    }

    // 账号密码校验（固定账号）
    if (account !== CONFIG.adminAccount || password !== CONFIG.adminPassword) {
        showTip(elements.loginTip, '账号或密码错误，请重新输入', 'error');
        generateVerifyCode(elements.verifyCodeImg); // 刷新验证码
        return;
    }

    // 登录成功：存储状态 + 刷新页面
    localStorage.setItem('adminLoginStatus', 'true');
    localStorage.setItem('adminAccount', account);
    showTip(elements.loginTip, '登录成功，正在跳转...', 'success');
    setTimeout(() => {
        checkAdminLoginStatus(elements);
        renderImageList(elements); // 渲染图片列表
        elements.loginForm.reset(); // 清空表单
        generateVerifyCode(elements.verifyCodeImg); // 刷新验证码
    }, 1000);
}

// 3. 处理退出登录
function handleAdminLogout(elements) {
    if (confirm('确定要退出登录吗？未保存的操作将丢失')) {
        localStorage.removeItem('adminLoginStatus');
        localStorage.removeItem('adminAccount');
        checkAdminLoginStatus(elements);
        alert('已成功退出登录');
    }
}


/**
 * 四、验证码生成模块
 */
// 生成4位随机验证码（含干扰色，防止机器识别）
function generateVerifyCode(verifyImgDom) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let code = '';
    // 生成4位随机字符
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    // 存储验证码到全局状态
    GLOBAL_STATE.verifyCode = code;
    // 渲染验证码（背景色随机，文字色对比）
    const bgColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    const textColor = isDarkColor(bgColor) ? '#ffffff' : '#2c3e50';
    verifyImgDom.style.backgroundColor = bgColor;
    verifyImgDom.style.color = textColor;
    verifyImgDom.innerText = code;
}

// 辅助函数：判断颜色是否为深色（用于验证码文字色对比）
function isDarkColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    // 亮度公式：(R*299 + G*587 + B*114)/1000 < 128 为深色
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}


/**
 * 五、图片上传与压缩模块
 */
// 1. 处理图片选择（格式 + 大小校验）
function handleImageSelect(e, elements) {
    const file = e.target.files[0];
    if (!file) return;

    // 格式校验（仅允许png/jpg/webp）
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const fileType = file.type;
    if (!allowedTypes.includes(fileType)) {
        showTip(elements.uploadTip, '不支持该格式！仅允许PNG、JPG、WEBP', 'error');
        elements.imagePreview.classList.add('hidden');
        e.target.value = ''; // 清空选择
        return;
    }

    // 大小校验（≤5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showTip(elements.uploadTip, `文件过大！请上传5MB以内的图片（当前${(file.size/1024/1024).toFixed(2)}MB）`, 'error');
        elements.imagePreview.classList.add('hidden');
        e.target.value = ''; // 清空选择
        return;
    }

    // 校验通过：预览原图 + 存储当前文件
    GLOBAL_STATE.currentUploadFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.previewImg.src = e.target.result;
        elements.imagePreview.classList.remove('hidden');
        showTip(elements.uploadTip, '', ''); // 清空提示
    };
    reader.readAsDataURL(file);
}

// 2. 处理图片压缩与上传（优化：强制引导下载到本地image-storage文件夹）
function handleImageUpload(elements) {
    const file = GLOBAL_STATE.currentUploadFile;
    if (!file) {
        alert('请先选择要上传的图片');
        return;
    }

    // 步骤1：压缩图片（根据格式调整质量）
    compressImage(file, (compressedDataUrl, compressedBlob) => {
        // 步骤2：生成8位随机文件名（数字+大小写字母，避免重复）
        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileName = generateRandomFileName(8) + '.' + fileExt;

        // 步骤3：生成图片访问链接
        const accessLink = CONFIG.baseUrl + fileName;

        // 步骤4：存储图片信息到localStorage（用于列表展示）
        const imageInfo = {
            fileName: fileName,
            originalName: file.name,
            fileSize: (compressedBlob.size / 1024).toFixed(2) + 'KB',
            uploadTime: formatTime(new Date()),
            accessLink: accessLink,
            fileType: file.type
        };
        const imageList = JSON.parse(localStorage.getItem('imageList')) || [];
        imageList.push(imageInfo);
        localStorage.setItem('imageList', JSON.stringify(imageList));

        // ########## 优化1：先检查本地是否有image-storage文件夹（引导用户提前创建） ##########
        alert(`
            重要提示：请确保本地已创建「image-storage」文件夹（与admin.html在同一目录）！
            若未创建，请先关闭此弹窗，在文件管理器中创建后再继续。
        `);

        // ########## 优化2：下载按钮强化指引，明确告知选择目标文件夹 ##########
        // 移除旧下载按钮（避免重复）
        const oldDownloadBtn = document.getElementById('download-compressed');
        if (oldDownloadBtn) oldDownloadBtn.remove();

        // 创建新下载按钮（文本明确指向目标文件夹）
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'download-compressed';
        downloadBtn.className = 'btn btn-success';
        downloadBtn.innerHTML = '<i class="fa fa-download"></i> 必须下载到 → 本地image-storage文件夹';
        downloadBtn.style.backgroundColor = '#27ae60'; // 绿色突出，提醒必点
        downloadBtn.addEventListener('click', () => {
            // 生成下载链接，固定文件名（无需用户改名）
            const downloadLink = document.createElement('a');
            downloadLink.href = compressedDataUrl;
            downloadLink.download = fileName; // 自动填充随机文件名，用户无需修改
            downloadLink.click();

            // ########## 优化3：下载弹窗弹出后，再次提醒选择目标文件夹 ##########
            setTimeout(() => { // 延迟提示，确保下载弹窗已弹出
                alert(`
                    请在浏览器的「下载」窗口中，执行以下操作：
                    1. 点击「浏览」或「保存位置」（不同浏览器名称不同）；
                    2. 找到并选择本地的「image-storage」文件夹；
                    3. 点击「保存」，图片会直接存入该文件夹（无需后续移动）。
                `);
            }, 500);
        });
        elements.imagePreview.appendChild(downloadBtn);

        // ########## 优化4：页面提示文本强化 ##########
        elements.uploadTip.innerText = '图片压缩完成！点击上方绿色按钮，下载到本地image-storage文件夹';
        elements.uploadTip.className = 'tip-text tip-success';
        elements.uploadTip.style.fontWeight = 'bold'; // 加粗提示，避免忽略

        // 步骤5：重置上传区域 + 重新渲染列表
        elements.imageUpload.value = '';
        GLOBAL_STATE.currentUploadFile = null;
        renderImageList(elements);
    });
}
// 3. 图片压缩核心函数（用canvas实现，保留透明度）
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // 创建canvas元素
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // 保持原图比例（可调整maxWidth/maxHeight限制尺寸）
            const maxWidth = 1920; // 最大宽度（避免超大图）
            const maxHeight = 1080; // 最大高度
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            canvas.width = width;
            canvas.height = height;

            // 处理png透明度（背景透明）
            if (file.type === 'image/png') {
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = 'transparent';
                ctx.fillRect(0, 0, width, height);
            }

            // 绘制图片到canvas
            ctx.drawImage(img, 0, 0, width, height);

            // 根据格式获取压缩质量
            let quality = CONFIG.compressQuality.jpg;
            if (file.type === 'image/png') quality = CONFIG.compressQuality.png;
            if (file.type === 'image/webp') quality = CONFIG.compressQuality.webp;

            // 转换为dataURL（预览用）和blob（计算大小用）
            const dataURL = canvas.toDataURL(file.type, quality);
            canvas.toBlob((blob) => {
                callback(dataURL, blob);
            }, file.type, quality);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 4. 生成指定长度的随机文件名（数字+大小写字母）
function generateRandomFileName(length) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    // 避免文件名重复（检查localStorage中是否已存在）
    const imageList = JSON.parse(localStorage.getItem('imageList')) || [];
    const isDuplicate = imageList.some(item => item.fileName.startsWith(result));
    return isDuplicate ? generateRandomFileName(length) : result;
}


/**
 * 六、图片列表管理模块（管理员页面）
 */
// 1. 渲染已上传图片列表
function renderImageList(elements) {
    const imageList = JSON.parse(localStorage.getItem('imageList')) || [];

    // 空列表处理
    if (imageList.length === 0) {
        elements.listEmpty.classList.remove('hidden');
        elements.imageTable.classList.add('hidden');
        return;
    }

    // 非空列表：按上传时间倒序排列（最新在前）
    elements.listEmpty.classList.add('hidden');
    elements.imageTable.classList.remove('hidden');
    const sortedList = imageList.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));

    // 渲染表格内容
    elements.imageTableBody.innerHTML = '';
    sortedList.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.fileName}</td>
            <td>${item.uploadTime}</td>
            <td style="max-width: 300px; word-break: break-all;">${item.accessLink}</td>
            <td>
                <button class="btn btn-primary copy-btn" data-link="${item.accessLink}">
                    <i class="fa fa-copy"></i> 复制
                </button>
                <button class="btn btn-danger delete-btn" data-filename="${item.fileName}">
                    <i class="fa fa-trash"></i> 删除
                </button>
            </td>
        `;
        elements.imageTableBody.appendChild(tr);
    });

    // 绑定复制/删除事件（事件委托，避免动态元素无法绑定）
    bindListEvent(elements);
}

// 2. 绑定列表复制/删除事件（事件委托）
function bindListEvent(elements) {
    // 复制链接
    elements.imageTableBody.addEventListener('click', (e) => {
        if (e.target.closest('.copy-btn')) {
            const link = e.target.closest('.copy-btn').dataset.link;
            copyToClipboard(link, (success) => {
                success ? alert('链接已成功复制到剪贴板') : alert('复制失败，请手动复制链接');
            });
        }
    });

    // 删除图片
    elements.imageTableBody.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const fileName = e.target.closest('.delete-btn').dataset.filename;
            if (confirm(`确定要删除图片「${fileName}」吗？删除后链接将永久失效！`)) {
                const imageList = JSON.parse(localStorage.getItem('imageList')) || [];
                const newList = imageList.filter(item => item.fileName !== fileName);
                localStorage.setItem('imageList', JSON.stringify(newList));
                renderImageList(elements); // 重新渲染列表
                alert('图片已成功删除');
            }
        }
    });
}

// 3. 复制到剪贴板（兼容旧浏览器）
function copyToClipboard(text, callback) {
    // 现代浏览器：Clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => callback(true))
            .catch(() => fallbackCopy(text, callback));
    } else {
        // 降级方案：创建临时输入框
        fallbackCopy(text, callback);
    }
}

// 复制降级方案（兼容IE等旧浏览器）
function fallbackCopy(text, callback) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
        const success = document.execCommand('copy');
        callback(success);
    } catch (err) {
        callback(false);
    } finally {
        document.body.removeChild(input);
    }
}


/**
 * 七、用户页面弹窗控制模块
 */
// 1. 处理图片查看（链接校验 + 加载显示）
function handleViewImage(elements) {
    const inputLink = elements.linkInput.value.trim();

    // 空输入校验
    if (!inputLink) {
        showTip(elements.inputTip, '请输入图片访问链接', 'error');
        return;
    }

    // 链接格式校验（必须包含配置的baseUrl前缀）
    if (!inputLink.startsWith(CONFIG.baseUrl)) {
        showTip(elements.inputTip, `链接格式无效！需以「${CONFIG.baseUrl}」开头`, 'error');
        return;
    }

    // 校验通过：显示弹窗加载状态
    showTip(elements.inputTip, '', '');
    showImageModal(elements);
    elements.modalLoading.style.display = 'flex';
    elements.modalImage.style.display = 'none';
    elements.modalError.style.display = 'none';

    // 加载图片
    elements.modalImage.src = inputLink;
    elements.modalImage.onload = () => {
        // 加载成功：显示图片
        elements.modalLoading.style.display = 'none';
        elements.modalImage.style.display = 'block';
    };
    elements.modalImage.onerror = () => {
        // 加载失败：显示错误提示
        elements.modalLoading.style.display = 'none';
        elements.modalError.style.display = 'block';
    };
}

// 2. 显示图片弹窗
function showImageModal(elements) {
    elements.imageModal.classList.add('show');
    // 禁止页面滚动
    document.body.style.overflow = 'hidden';
}

// 3. 隐藏图片弹窗
function hideImageModal(elements) {
    elements.imageModal.classList.remove('show');
    // 恢复页面滚动
    document.body.style.overflow = '';
    // 重置弹窗状态（避免下次打开残留错误）
    elements.modalLoading.style.display = 'flex';
    elements.modalImage.style.display = 'none';
    elements.modalError.style.display = 'none';
}


/**
 * 八、通用工具函数
 */
// 1. 显示提示文本（统一样式）
function showTip(tipDom, text, type) {
    tipDom.innerText = text;
    if (type === 'error') {
        tipDom.className = 'tip-text tip-error';
    } else if (type === 'success') {
        tipDom.className = 'tip-text tip-success';
    } else {
        tipDom.className = 'tip-text';
    }
}

// 2. 格式化时间（YYYY-MM-DD HH:MM:SS）
function formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}