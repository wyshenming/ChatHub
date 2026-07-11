# ChatHub Releases / ChatHub 发布说明

## 中文

当前版本：v1.2.0

维护状态：ChatHub 已发布第一个正式版。本项目作为自用小工具进入稳定维护期，后续不再规划功能性扩展，主要只做 bug 修复、网页兼容性、安装 / 卸载和性能细节优化。

当前安装包：

```text
ChatHub-Setup-x64.exe
```

### v1.2.0 维护版

- 统一单页面拖拽分屏行为：拖到左侧时新页面在左、原页面保留在右；拖到右侧时反之。
- 分屏左右页面分别显示加载状态，交换和关闭单侧时状态会跟随页面。
- 移除页面顶部任务标题区，将任务名放入对应工具栏中央。
- 工具栏新增返回上一页按钮，并替换为专用返回图标。

### v1.1.1 维护版

- 修复添加网页与修改网页弹窗：点击应用其他区域不再误关闭弹窗。
- ChatHub 自身界面的文字默认不可选中，输入框和可编辑内容仍可正常选择、复制和粘贴。

### v1.1.0 维护版

- 修复覆盖安装升级时只执行卸载、需要再次运行安装包才会安装的问题。
- 完全退出应用后重新启动，任务页面恢复默认入口，同时保留登录状态。
- 退出前仅清理 WebView 页面缓存，不清理 cookies / localStorage / sessionStorage / IndexedDB。
- 清理本轮开发产生的测试安装包和临时安装目录。

### v1.0.2 维护版

- 修复覆盖安装升级时只执行卸载、需要再次运行安装包才会安装的问题。
- 升级卸载时跳过自定义完整目录清理，避免把升级流程当作用户主动卸载。
- 兼容旧版本卸载器的延迟清理脚本：新安装器会等待旧清理结束后再释放新文件。
- 默认继续保留用户数据和登录状态。

### v1.0.1 维护版

- 新增主窗口内左右分屏对照模式，可同时查看两个 WebView 页面。
- 分屏时左右页面各自提供刷新、缩放和关闭按钮。
- 支持拖动任务到工作区左 / 右侧打开分屏，并支持拖动页面工具栏交换左右位置。
- 修复左侧侧边栏分组展开 / 收起图标方向用反的问题。
- 保持登录状态和站点持久化数据不变，不清理 cookies / localStorage / IndexedDB。

### v1.0.0 正式版

- 发布 ChatHub 第一个正式版。
- 保留 ChatGPT、Gemini、DeepSeek 和自定义网页工作台能力。
- 保留 WebViewPool、任务分组、右键管理、侧边栏窄栏、当前页面缩放、系统托盘、关于窗口等稳定能力。
- 使用用户提供的 SVG 图标统一当前可见入口，包括设置、刷新、缩放、分组、侧边栏和弹窗关闭。
- 保留登录状态和站点持久化数据，不清理 cookies / localStorage / IndexedDB。
- 项目进入稳定维护期，后续默认只做 bug 修复和网页兼容维护。

### 适用平台

- Windows x64

### 主要能力

- Electron + WebView 桌面版 ChatHub。
- 内置 ChatGPT、Gemini、DeepSeek。
- 支持添加和编辑自定义 AI 网页。
- 侧边栏支持折叠为窄栏，并保留任务首字母 / 首字符徽标和设置入口。
- 顶部提供当前页面缩放控件。
- WebView 缓存池按任务复用页面实例，减少任务切换时的重复加载。
- 设置中可配置 WebView 最大常驻数量。
- WebView 性能日志写入滚动日志文件，避免日志无限增长。
- 卸载程序会先退出 ChatHub 和 Electron 子进程，再清理安装目录。
- 卸载向导提供“删除用户数据”复选框，默认保留登录状态、设置、任务和日志。
- 设置中提供关于窗口，展示版本、作者和 GitHub 仓库信息。
- 单实例运行机制：重复打开程序时会激活已有窗口。
- 网页登录状态保存在本机，安装包不包含个人账号信息。

### 安装说明

1. 下载并运行 `ChatHub-Setup-x64.exe`。
2. 按安装器提示完成安装。
3. 如果已经打开 ChatHub，再次启动会自动切回已有窗口。

## English

Current version: v1.2.0

Maintenance status: ChatHub has reached its first stable release. As a personal utility, it is now in stable maintenance mode. Future work will focus on bug fixes, website compatibility, installer / uninstaller behavior, and small performance refinements rather than feature expansion.

Current installer:

```text
ChatHub-Setup-x64.exe
```

### v1.2.0 Maintenance Release

- Unified single-page drag-to-split behavior: dropping left puts the new page on the left and keeps the original page on the right, with the inverse behavior on the right.
- Split panes now show independent loading states that follow their pages when swapping or closing a pane.
- Removed the page-level task header and moved each task name to the center of its own toolbar.
- Added a back-navigation button to the toolbar with a dedicated back icon.

### v1.1.1 Maintenance Release

- Fixed the add/edit website dialog so clicking elsewhere in the app no longer closes it accidentally.
- ChatHub interface text is no longer selectable by default, while input fields and editable content remain selectable for copy and paste.

### v1.1.0 Maintenance Release

- Fixed upgrade installs that only ran uninstall first and required launching the installer a second time.
- After fully quitting and restarting the app, tasks now return to their default entry pages while preserving login state.
- Clears only WebView page cache before quit, without clearing cookies, localStorage, sessionStorage, or IndexedDB.
- Removed temporary test installer and upgrade smoke-test files from the local workspace.

### v1.0.2 Maintenance Release

- Fixed upgrade installs that only ran uninstall first and required launching the installer a second time.
- Skips custom full install-directory cleanup during upgrade uninstall, so upgrade flow is not treated as a manual uninstall.
- Adds compatibility for legacy delayed cleanup scripts by waiting before extracting the new files.
- User data and login state remain preserved by default.

### v1.0.1 Maintenance Release

- Added in-window split view for comparing two WebView pages side by side.
- Each split pane now has its own refresh, zoom, and close controls.
- Supports dragging tasks to the left / right workspace area and dragging pane toolbars to swap sides.
- Fixed reversed expand / collapse icons in the left sidebar group list.
- Preserves login state and website persistent data without clearing cookies, localStorage, or IndexedDB.

### v1.0.0 Stable Release

- Released the first stable version of ChatHub.
- Kept the ChatGPT, Gemini, DeepSeek, and custom web workspace features.
- Kept stable features such as WebViewPool, task groups, context-menu management, compact sidebar, page zoom, system tray behavior, and the About dialog.
- Unified currently visible UI entries with user-provided SVG icons, including settings, refresh, zoom, groups, sidebar, and modal close buttons.
- Preserved login state and website persistent data without clearing cookies, localStorage, or IndexedDB.
- Entered stable maintenance mode; future changes should default to bug fixes and website compatibility maintenance.

### Platform

- Windows x64

### Included In This Build

- Electron + WebView desktop ChatHub.
- Built-in ChatGPT, Gemini, and DeepSeek entries.
- Custom AI web pages can be added and edited.
- Current page zoom controls are available in the top bar.
- Collapsible sidebar with compact task initial badges and a settings entry.
- WebView pool support reuses page instances per task to reduce reloads when switching tasks.
- Configurable maximum WebView pool size.
- WebView performance logs use rolling log files to prevent unbounded growth.
- The uninstaller exits ChatHub and Electron child processes before cleaning the install directory.
- The uninstall wizard includes a "delete user data" checkbox, with login state, settings, tasks, and logs kept by default.
- About dialog in settings with version, author, and GitHub repository information.
- Single-instance behavior: launching the app again activates the existing window.
- Website login state is stored locally. The installer does not include personal account data.

### Installation

1. Download and run `ChatHub-Setup-x64.exe`.
2. Follow the installer steps.
3. If ChatHub is already running, launching it again will bring the existing window to the front.
