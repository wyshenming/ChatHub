# ChatHub

## 中文

ChatHub 是一个面向 Windows 的 AI 网页工作台。它基于 Electron + WebView，将 ChatGPT、Gemini、DeepSeek 以及用户自定义 AI 网页整合到同一个桌面窗口中。

### 维护状态

ChatHub 已发布正式版 `v1.2.1`，并进入稳定维护期。本项目作为自用小工具，后续不再规划功能性扩展，主要维护方向是 bug 修复、网页兼容性、安装 / 卸载和性能细节优化。

### 功能特性

- 内置 ChatGPT、Gemini、DeepSeek 入口。
- 支持添加自定义 AI 网页。
- 使用单个可复用 WebView 运行时，降低内存占用。
- 支持任务状态管理：运行中、已挂起、已完成。
- 登录状态保存在本机 Electron 持久化分区中。
- 支持按当前网页或全部网页清理登录状态。
- 支持系统托盘和关闭窗口行为设置。
- 顶部提供当前网页的快捷刷新按钮；自定义网页还会显示快捷删除按钮。
- 顶部提供当前页面缩放控件，缩放比例按任务保存。
- 设置中提供关于窗口，展示版本、作者和 GitHub 仓库信息。
- 可执行文件元数据写入作者信息：染泓如梦QAQ。
- 支持单实例运行：重复打开 exe 时会激活已有窗口，不会创建第二个应用窗口。
- 面向 Windows x64 打包。

### 下载

请从 GitHub Releases 页面下载最新 Windows 安装包。

当前安装包文件名：

```text
ChatHub-Setup-x64.exe
```

仓库中的 `releases/ChatHub-Setup-x64.exe` 也保存了一份安装包副本，便于直接取用。

### 开发

安装依赖：

```bash
npm install
```

开发模式运行：

```bash
npm start
```

构建 Windows x64 安装包：

```bash
npm run dist
```

只构建可直接运行的 unpacked x64 应用：

```bash
npm run dist:dir
```

`dist/ChatHub.exe` 需要和同目录下的 DLL、`resources`、`locales` 等文件一起保留，不能单独脱离目录运行。

### 架构

renderer 层按职责拆分：

- `renderer.js`：UI Adapter，负责 DOM 渲染和事件绑定。
- `controller.js`：UI 到业务逻辑的编排层。
- `task-manager.js`：任务和状态管理。
- `webview-manager.js`：WebView 生命周期、页面加载、刷新和上下文恢复。
- `storage-manager.js`：localStorage 和 Electron IPC 持久化能力。
- `constants.js`：共享常量和默认任务。
- `utils.js`：URL、状态等工具函数。

### 注意事项

ChatHub 会把网页登录状态保存在本机 Electron 用户数据目录中。安装包不会携带个人账号 Cookie 或登录凭据。

## English

ChatHub is a Windows desktop workspace for AI chat websites. It uses Electron + WebView to bring ChatGPT, Gemini, DeepSeek, and custom AI web pages into one desktop window.

### Maintenance Status

ChatHub has released stable version `v1.2.1` and is now in stable maintenance mode. As a personal utility, it no longer plans feature expansion; future work focuses on bug fixes, website compatibility, installer / uninstaller behavior, and small performance refinements.

### Features

- Built-in entries for ChatGPT, Gemini, and DeepSeek.
- Add custom AI web pages.
- Single reusable WebView runtime for lower memory usage.
- Task status management: running, paused, and finished.
- Local login/session storage through Electron's persistent partition.
- Clear login state for the current page or all pages.
- Configurable close behavior with system tray support.
- Quick refresh button in the top bar; custom pages also show a quick delete button.
- Current page zoom controls in the top bar, with zoom saved per task.
- About dialog in settings with version, author, and GitHub repository information.
- Executable metadata includes the author: 染泓如梦QAQ.
- Single-instance behavior: opening the exe again activates the existing window instead of creating a second app window.
- Windows x64 build target.

### Download

Download the latest Windows installer from the GitHub Releases page.

Current installer artifact:

```text
ChatHub-Setup-x64.exe
```

The repository also keeps a copy at `releases/ChatHub-Setup-x64.exe` for direct access.

### Development

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm start
```

Build the Windows x64 installer:

```bash
npm run dist
```

Build only the unpacked x64 app:

```bash
npm run dist:dir
```

`dist/ChatHub.exe` must stay together with the DLL files, `resources`, `locales`, and other runtime files in the same directory. It is not a standalone single-file portable executable.

### Architecture

The renderer layer is split by responsibility:

- `renderer.js`: UI adapter, DOM rendering, and event binding.
- `controller.js`: UI-to-business orchestration.
- `task-manager.js`: task and session state.
- `webview-manager.js`: WebView lifecycle, page loading, reload, and context restoration.
- `storage-manager.js`: local storage and Electron IPC persistence.
- `constants.js`: shared constants and default tasks.
- `utils.js`: URL and status helpers.

### Notes

ChatHub stores website login state locally in the Electron user data directory. The installer does not include personal account cookies or login credentials.
