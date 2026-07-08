# ChatHub Releases / ChatHub 发布说明

## 中文

当前版本：v1.0.1

维护状态：ChatHub 已发布第一个正式版。本项目作为自用小工具进入稳定维护期，后续不再规划功能性扩展，主要只做 bug 修复、网页兼容性、安装 / 卸载和性能细节优化。

当前安装包：

```text
ChatHub-Setup-x64.exe
```

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

Current version: v1.0.1

Maintenance status: ChatHub has reached its first stable release. As a personal utility, it is now in stable maintenance mode. Future work will focus on bug fixes, website compatibility, installer / uninstaller behavior, and small performance refinements rather than feature expansion.

Current installer:

```text
ChatHub-Setup-x64.exe
```

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
