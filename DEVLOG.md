# DEVLOG

## 2026-06-26 交接日志

### 本轮已经完成

- 检查了当前项目目录结构。
- 阅读了 `package.json`、`README.md`、`src/main.js`、`src/preload.js`、renderer / WebView 相关模块和打包脚本。
- 确认项目是 Electron + WebView 的 AI 网页工作台，面向 Windows x64。
- 确认 renderer 层已经完成一次基础分层：
  - `renderer.js`：UI Adapter，负责 DOM 查询、渲染和事件绑定。
  - `controller.js`：UI 到业务逻辑的中间层。
  - `task-manager.js`：任务状态和自定义网页管理。
  - `webview-manager.js`：单实例 WebView 生命周期、加载、reload、草稿/滚动保存恢复。
  - `storage-manager.js`：localStorage 和 preload 暴露的 IPC API。
  - `constants.js` / `utils.js`：常量和工具函数。
- 本轮只生成/更新交接文档，不修改业务代码。

### 已经修改 / 新增过的关键文件

本轮交接文档：

- `AGENTS.md`
- `DEVLOG.md`
- `TODO.md`

既有关键业务文件（本轮只阅读）：

- `src/main.js`
- `src/preload.js`
- `src/renderer/renderer.js`
- `src/renderer/controller.js`
- `src/renderer/task-manager.js`
- `src/renderer/webview-manager.js`
- `src/renderer/storage-manager.js`
- `scripts/copy-x64-app-exe.js`
- `scripts/set-exe-metadata.js`

### 当前项目状态

- Git 分支：`main`，远程为 `https://github.com/wyshenming/ChatHub.git`。
- `package.json` 版本：`0.4.3`。
- 本地存在 `node_modules/`、`dist/`、`releases/`。
- `README.md` 已说明运行、打包和当前架构。

### 当前能否运行

本轮未重新运行。之前已验证过 `npm start` / `dist\ChatHub.exe` 可启动，但台式机接手后必须重新验证。

### 当前能否打包

本轮未重新打包。当前配置显示：

- `npm run dist:dir`：构建 x64 unpacked 应用。
- `npm run dist`：构建 x64 unpacked 应用和 NSIS 安装包。

需要在台式机重新验证。

### 已知问题

- `src/main.js` 中托盘菜单和关闭确认弹窗的中文文本存在乱码现象，需要后续修复并验证编码。
- NSIS 安装器外壳可能显示 ia32 PE 头，这是 NSIS bootstrap 特性；重点验证实际安装后的 `ChatHub.exe` 是否为 x64。
- `dist\ChatHub.exe` 不能单独脱离旁边 DLL / `resources` 运行；当前脚本会把完整 runtime 复制到 `dist/`。
- Release 上传到 GitHub Releases 的状态需要台式机使用已登录的 `gh` 重新确认。

### 给台式机 Codex 的交接说明

先拉取 GitHub 最新代码，再运行 `npm install`。不要清理用户登录缓存。先读三个交接文档并总结当前理解，然后按 `TODO.md` 小步验证运行、打包、安装包和 Release 状态。

## 2026-06-26 顶部快捷按钮调整

### 本轮已经完成

- 按当前环境 `E:\codex\ChatHub` 继续开发。
- 阅读了 `package.json`、`README.md`、`src/main.js`、`src/preload.js`、renderer / WebView 相关模块和打包脚本。
- 将“刷新当前页”从设置弹窗移动到顶部右侧状态区，放在“已就绪”等状态文本旁边。
- 将“删除自定义网页”移动到同一顶部状态区，仅当前任务是自定义网页时显示。
- 保留原有 Controller / Manager 调用路径，不改 WebView 生命周期和登录缓存策略。
- 设置弹窗的“网页”分组保留“添加网页”和“浏览器打开”，不再放刷新 / 删除入口。

### 已经修改的文件

- `src/renderer/index.html`
- `src/renderer/styles.css`

### 验证结果

- `node --check` 已通过：`src/main.js`、`src/preload.js`、`src/renderer/renderer.js`、`src/renderer/controller.js`、`src/renderer/task-manager.js`、`src/renderer/webview-manager.js`、`src/renderer/storage-manager.js`。
- 首次 `npm install` 因 Electron 下载中断失败；使用临时 `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/` 后安装成功。
- 已短暂启动 Electron，应用进程能正常启动，8 秒后手动停止。

### 仍需后续验证

- 需要人工确认 ChatGPT / Gemini / DeepSeek / 自定义网页加载、刷新按钮和自定义网页删除按钮的真实交互体验。
- 本轮未运行 `npm run dist:dir` 或 `npm run dist`。

## 2026-06-26 x64 可执行文件打包

### 本轮已经完成

- 运行 `npm run dist:dir`，生成 x64 unpacked 应用。
- 产物位置：`dist\ChatHub.exe`。
- `dist\ChatHub.exe` 需要与同目录下的 DLL、`resources`、`locales` 等运行时文件一起保留，不能单独脱离目录运行。

### 验证结果

- 确认 `dist\ChatHub.exe`、`dist\ffmpeg.dll`、`dist\resources`、`dist\locales`、`dist\win-unpacked\ChatHub.exe` 均存在。
- 已短暂启动 `dist\ChatHub.exe`，应用进程能正常启动，8 秒后手动停止。
- PE 头检查确认 `dist\ChatHub.exe` 为 x64：`machine=0x8664`。

### 仍需后续验证

- 本轮未运行完整 `npm run dist`，因此未生成 / 验证 NSIS 安装包。
- 仍需人工确认网页加载、登录状态、刷新 / 删除按钮交互。

## 2026-06-26 单实例运行机制

### 本轮已经完成

- 在 `src/main.js` 使用 Electron 官方 `app.requestSingleInstanceLock()` 增加单实例锁。
- 锁获取失败时，当前进程直接 `app.quit()`，不注册 `whenReady()` 创建新窗口。
- 监听 `second-instance`，对已有 `mainWindow` 执行恢复、显示、置前和聚焦。
- 将托盘打开逻辑复用为窗口显示 / 聚焦，不影响 renderer、TaskManager、WebViewManager 或登录缓存。
- 重新运行 `npm run dist:dir`，更新 `dist\ChatHub.exe`。

### 已经修改的文件

- `src/main.js`
- `DEVLOG.md`
- `TODO.md`

### 验证结果

- `node --check src\main.js` 通过。
- 开发版双启动验证通过：第一次启动保持运行，第二次启动快速退出。
- 打包版 `dist\ChatHub.exe` 双启动验证通过：第一次启动保持运行，第二次启动快速退出并交给已有实例处理。
- 注意：Electron 单个应用实例本身会包含主进程、renderer、GPU 等多个子进程；本次验证的是不会生成第二个应用实例或第二个窗口。

## 2026-06-26 双语说明与 Release 安装包

### 本轮已经完成

- 将 `README.md` 改为中英双语版。
- 新增 `releases\README.md`，提供中英双语安装包说明。
- 运行完整 `npm run dist`，生成新的 NSIS 安装包。
- 将 `dist\ChatHub-Setup-x64.exe` 复制覆盖到 `releases\ChatHub-Setup-x64.exe`，用于提交到仓库。

### 验证结果

- `npm run dist` 成功完成。
- 新安装包位置：`releases\ChatHub-Setup-x64.exe`。
- 安装包大小：79,871,797 字节。
- NSIS 安装器 PE 头显示 `machine=0x14c`，符合已知 NSIS bootstrap 特性；实际 unpacked `ChatHub.exe` 已在上一轮确认是 x64。

### 仍需后续验证

- 本机没有 `gh` 命令，GitHub Release 页面正文无法在本轮直接更新；双语 release 说明已提交到 `releases\README.md`。
- 如需同步 GitHub Releases 页面正文，可将 `releases\README.md` 内容复制到对应 Release 描述。

### 发布修正

- 后续找到本机 GitHub CLI：`C:\Program Files\GitHub CLI\gh.exe`。
- 先前覆盖过 `v0.4.3` 的 Release 资产；已从 Git 历史恢复原 `v0.4.3` 安装包和原 Release 说明。
- 新功能发布改为新版本 `v0.4.4`，并重新生成 `releases\ChatHub-Setup-x64.exe`。
