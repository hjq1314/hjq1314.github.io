# README.md（图片管理网站部署&使用说明文档）
```markdown
# 图片管理网站 - 部署与使用指南
本项目是一套轻量型图片管理系统，基于纯前端技术+GitHub Pages静态托管，无需后端服务器，支持「管理员上传图片+用户通过链接查看图片」的核心流程，免费且易维护。


## 一、项目核心信息
### 1.1 功能概览
| 角色       | 核心操作                                                                 |
|------------|--------------------------------------------------------------------------|
| 管理员     | 固定账号密码登录 → 图片上传（自动压缩+8位随机命名） → 图片管理（复制链接/删除） |
| 普通用户   | 输入图片访问链接 → 弹窗预览图片 → 重新加载失效图片                         |

### 1.2 技术栈
- 前端：原生 HTML/CSS/JavaScript（无框架依赖，轻量易修改）
- 样式：响应式设计（适配 PC/平板/手机）+ Font Awesome 图标库
- 托管：GitHub Pages（免费静态托管，无需服务器）
- 存储：本地 `image-storage` 文件夹（存图片）+ localStorage（存图片记录）


## 二、文件结构说明
```
image-management-site/          # 项目根目录（建议以此命名，便于管理）
├─ admin.html                   # 管理员后台（登录/上传/图片管理）
├─ user.html                    # 用户页面（输入链接/预览图片）
├─ style.css                    # 共用样式文件（统一视觉风格）
├─ script.js                    # 共用交互逻辑（核心功能实现）
├─ README.md                    # 部署&使用说明（本文档）
└─ image-storage/               # 图片存储文件夹（必须同名，存所有上传图片）
    ├─ a3B7z9X2.png             # 示例：管理员上传的图片（8位随机文件名）
    └─ 7xY92kP5.webp            # 示例：不同格式的图片文件
```


## 三、本地测试步骤（无需部署，直接运行）
### 3.1 准备工作
1. 在电脑本地新建文件夹，命名为 `image-management-site`（项目根目录）。
2. 将 `admin.html`、`user.html`、`style.css`、`script.js` 4个文件放入根目录。
3. 在根目录内新建子文件夹，命名为 `image-storage`（用于存放测试图片，必须严格同名）。

### 3.2 测试管理员功能
1. 双击打开根目录的 `admin.html` 文件（自动用默认浏览器打开）。
2. 登录验证：
   - 账号：`*******`（固定，可在 `script.js` 中修改）
   - 密码：`******`（固定，大小写敏感，可在 `script.js` 中修改）
   - 验证码：填写页面生成的4位字符（看不清可点击图片或「刷新」按钮更换）
   - 点击「登录」→ 登录成功后，会显示「图片上传」和「图片列表」区域。
3. 图片上传测试：
   - 点击「选择图片」按钮 → 选择一张 ≤5MB 的图片（支持 PNG/JPG/WEBP 格式）。
   - 预览图加载后，点击「确认上传」→ 页面会弹出「请选择本地 image-storage 文件夹」的提示。
   - 点击绿色的「必须下载到 → 本地image-storage文件夹」按钮 → 浏览器弹出「另存为」窗口。
   - 在窗口中选择根目录的 `image-storage` 文件夹 → 点击「保存」（图片会自动以8位随机名存储，无需手动改名）。
4. 图片管理测试：
   - 上传完成后，「图片列表」会自动显示新上传的记录（含序号、文件名、上传时间、访问链接）。
   - 复制链接：点击列表中的「复制」按钮 → 提示「链接已复制到剪贴板」即成功。
   - 删除图片：点击「删除」按钮 → 确认后，列表记录会删除（本地 `image-storage` 中的图片需手动删除）。

### 3.3 测试用户功能
1. 双击打开根目录的 `user.html` 文件。
2. 在输入框中粘贴管理员复制的测试链接（格式示例：`./image-storage/a3B7z9X2.png`，本地测试用相对路径）。
3. 点击「查看图片」→ 若 `image-storage` 中存在该图片，会弹出弹窗显示图片；若图片不存在，会提示「图片加载失败」。


## 四、GitHub Pages 部署步骤（实现公网访问）
本地测试正常后，部署到 GitHub Pages，让所有人都能通过公网链接访问图片。

### 4.1 新建 GitHub 仓库
1. 登录 GitHub 账号（无账号需先注册：[github.com](https://github.com)）。
2. 点击右上角「+」→ 选择「New repository」（新建仓库）。
3. 填写仓库信息：
   - Repository name：建议命名为 `image-management-site`（与本地根目录同名，便于识别）。
   - Description：可选，填写「轻量图片管理网站，支持管理员上传、用户查看」。
   - Visibility：选择「Public」（公开仓库，GitHub Pages 免费支持）。
   - 勾选「Add a README file」→ 点击「Create repository」（创建仓库）。

### 4.2 上传项目文件到 GitHub
1. 进入新建的仓库页面 → 点击「Add file」→ 选择「Upload files」（上传文件）。
2. 上传根目录文件：
   - 点击「drag files here to upload」区域 → 选择本地根目录的 `admin.html`、`user.html`、`style.css`、`script.js`、`README.md` 5个文件，拖拽到上传区域。
3. 上传图片存储文件夹：
   - 上传完成根目录文件后，点击仓库页面的「Add file」→ 选择「Create new file」。
   - 在「Name your file」输入框中输入 `image-storage/`（末尾加斜杠，代表创建文件夹）→ 按回车确认。
   - 进入 `image-storage` 文件夹后，点击「Add file」→「Upload files」→ 选择本地 `image-storage` 中的所有图片，拖拽上传。
4. 提交文件：
   - 下拉到页面底部，在「Commit changes」输入框中填写提交说明（如「初始化项目：上传所有文件和图片」）。
   - 点击「Commit changes」（提交更改）→ 等待文件上传完成。

### 4.3 配置 GitHub Pages
1. 在仓库页面点击顶部的「Settings」（设置）→ 下拉找到「Pages」选项（左侧菜单栏也可直接找到）。
2. 配置部署来源：
   - 「Source」→ 点击下拉框 → 选择「Deploy from a branch」（从分支部署）。
   - 「Branch」→ 点击第一个下拉框选择「main」（或「master」，取决于你的默认分支名）→ 第二个下拉框选择「/(root)」（根目录）→ 点击「Save」（保存）。
3. 等待部署完成：
   - 页面会显示「Your site is live at https://[用户名].github.io/[仓库名]/」（如 `https://hjq1314.github.io/image-management-site/`）。
   - 部署需要 1-5 分钟，若暂时无法访问，稍等 5 分钟后刷新页面重试。

### 4.4 关键配置：修改 `script.js` 中的图片链接路径
部署后必须修改 `script.js` 的 `baseUrl`，否则图片链接无效！
1. 在 GitHub 仓库页面 → 找到 `script.js` 文件 → 点击文件名进入文件详情页。
2. 点击右上角的铅笔图标（「Edit this file」）进入编辑模式。
3. 找到文件顶部的 `CONFIG` 配置对象：
   ```javascript
   const CONFIG = {
       // 原默认路径（需替换为你的 GitHub Pages 路径）
       baseUrl: 'https://hjq1314.github.io/image-storage/',
       compressQuality: { jpg: 0.8, png: 1, webp: 0.8 },
       adminAccount: 'f240925',
       adminPassword: 'HJQ1314'
   };
   ```
4. 替换 `baseUrl` 为你的 GitHub Pages 图片存储路径：
   - 格式：`https://[你的GitHub用户名].github.io/[你的仓库名]/image-storage/`
   - 示例：若你的 GitHub 用户名是 `zhangsan`，仓库名是 `image-management-site`，则修改为：
     ```javascript
     baseUrl: 'https://zhangsan.github.io/image-management-site/image-storage/',
     ```
5. 点击页面底部的「Commit changes」→ 输入提交说明（如「修改 baseUrl 为 GitHub Pages 路径」）→ 再次点击「Commit changes」保存。


## 五、常见问题与解决方案
### 5.1 问题1：管理员登录失败
- 可能原因：验证码输入错误、账号密码拼写错误、大小写不匹配。
- 解决方法：
  1. 确认账号是 `*******`（纯数字，无空格），密码是 `******`（H/J/Q 大写，其余小写）。
  2. 验证码区分大小写，若看不清，点击验证码图片或「刷新」按钮更换。
  3. 若仍失败，按 F12 打开浏览器控制台（Console 面板），查看是否有报错（如元素未找到）。

### 5.2 问题2：用户输入链接后图片加载失败
- 可能原因：
  1. `script.js` 的 `baseUrl` 配置错误（最常见）。
  2. `image-storage` 文件夹未上传到 GitHub，或图片未放入该文件夹。
  3. 图片文件名大小写不匹配（如链接是 `a3B7z9X2.png`，实际文件是 `a3B7z9x2.png`，GitHub 区分大小写）。
- 解决方法：
  1. 重新检查 `baseUrl` 配置（参考步骤 4.4），确保路径格式正确（末尾需加 `/`）。
  2. 确认 GitHub 仓库中存在 `image-storage` 文件夹，且目标图片已在其中。
  3. 复制链接中的文件名，在 GitHub 的 `image-storage` 文件夹中搜索，确认文件名完全一致。

### 5.3 问题3：页面样式异常（按钮错位、弹窗变形）
- 可能原因：`style.css` 文件路径错误，或未与 HTML 文件在同一目录。
- 解决方法：
  1. 打开 `admin.html` 或 `user.html` → 按 F12 打开开发者工具 → 切换到「Elements」面板，查看 `<link rel="stylesheet" href="style.css">` 是否有红色下划线（有则代表路径错误）。
  2. 确认 `style.css` 与 `admin.html`/`user.html` 在 GitHub 仓库的同一目录（根目录），文件名是否为 `style.css`（大小写敏感，如 `Style.css` 会失效）。

### 5.4 问题4：上传图片时提示「文件过大」
- 可能原因：选择的图片超过 5MB 限制（代码中默认限制，可修改）。
- 解决方法：
  1. 用图片压缩工具（如 [TinyPNG](https://tinypng.com/)、微信截图）将图片压缩至 5MB 以内。
  2. 若需修改大小限制，打开 `script.js` → 找到 `handleImageSelect` 函数中的 `const maxSize = 5 * 1024 * 1024;` → 修改数字（如 `10 * 1024 * 1024` 代表 10MB）。


## 六、注意事项
1. **静态托管限制说明**：  
   GitHub Pages 是纯静态服务，无法实现图片「全自动上传」—— 前端仅能完成图片压缩和预览，需管理员手动将压缩后的图片保存到本地 `image-storage`，再上传到 GitHub（步骤 3.2.3 已优化，无需手动移动图片）。
2. **localStorage 局限性**：  
   管理员页面的图片列表记录存储在浏览器 localStorage 中，换设备或清除浏览器数据后，列表会清空（但 GitHub 中的图片仍存在，可重新上传记录）。
3. **安全性提示**：  
   管理员账号密码是固定的，若需提高安全性，可在 `script.js` 中修改 `CONFIG.adminAccount` 和 `CONFIG.adminPassword`，并避免向无关人员泄露账号。
4. **带宽与存储限制**：  
   GitHub Pages 对公开仓库的带宽有限制（通常每月 100GB，足够个人使用），若访问量过大，建议迁移到云服务器（如阿里云 ECS、腾讯云轻量应用服务器）。


## 七、功能扩展建议（可选）
1. **批量上传功能**：  
   在 `admin.html` 中修改图片选择框为多文件选择（`<input type="file" multiple>`），并在 `script.js` 中适配批量压缩和下载逻辑。
2. **密码修改功能**：  
   在管理员页面添加「密码修改」模块，将新密码存储到 localStorage，避免硬编码风险。
3. **图片过期清理**：  
   在 `script.js` 中添加「过期时间判断」逻辑，自动标记超过 30 天的图片，并提示管理员删除。
4. **访问统计功能**：  
   集成百度统计或 Google Analytics，在 `admin.html` 中添加统计代码，查看用户访问量和图片查看次数。
```