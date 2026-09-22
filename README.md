# ChatHub

## 中文

ChatHub 是一个面向 Windows 的 AI 网页工作台。它基于 Electron + WebView，将 ChatGPT、Gemini、DeepSeek 以及用户自定义 AI 网页整合到同一个桌面窗口中。

### 维护状态

ChatHub 已发布正式版 `v1.5.0`，并进入稳定维护期。本项目作为自用小工具，后续主要维护 bug 修复、网页兼容性、安装 / 卸载和性能细节优化。

### 功能特性

- 内置 ChatGPT、Gemini、DeepSeek 入口。
- 支持添加自定义 AI 网页。
- 使用单个可复用 WebView 运行时，降低内存占用。
- 支持任务状态管理：运行中、已挂起、已完成。
- 支持左右分屏，并可拖动中间分隔线在 25% / 75% 范围内调整两侧比例。
- 登录状态保存在本机 Electron 持久化分区中。
- 支持按当前网页或全部网页清理登录状态。
- 支持系统托盘和关闭窗口行为设置。
- 顶部提供当前网页的快捷刷新按钮；自定义网页还会显示快捷删除按钮。
- 顶部提供当前页面缩放控件，缩放比例按任务保存。
- 设置中提供关于窗口，展示版本、作者和 GitHub 仓库信息。
- 设置支持跟随系统、浅色和深色主题；支持系统主题的网页会同步切换。
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

### 依赖安全状态

2026-07-21 的审计基线曾报告 8 个受影响依赖包：7 个高危、1 个严重。

Electron 已升级至 `43.2.0`、electron-builder 已升级至 `26.15.3`。当前 `npm audit --omit=dev` 报告 0 个运行时已知漏洞；全量 `npm audit` 仍报告 5 个仅影响开发 / 构建工具链的高危依赖告警，已记录为后续独立维护项。自动化构建与启动烟测已通过；网页登录、OAuth、覆盖安装和卸载仍建议在真实使用中持续验证。

这 5 项是依赖包分组，不等同于只有 5 条漏洞公告；均为间接开发依赖，当前不随日常运行的 ChatHub 功能路径使用：

| 依赖包 | 简单影响 | 使用场景 |
| --- | --- | --- |
| `@xmldom/xmldom` | 恶意 XML 可能导致解析异常、资源消耗或生成错误内容。 | 打包工具处理 XML。 |
| `brace-expansion` | 特制通配符可能耗尽内存，造成构建卡死。 | 打包时处理文件匹配规则。 |
| `fast-uri` | 特制 URL 可能被错误解析，理论上可能请求错误地址。 | 打包配置校验。 |
| `js-yaml` | 特制 YAML 可能造成 CPU 长时间占用。 | 打包工具读取配置。 |
| `undici` | 特制网络响应可能使构建下载或原生模块重建异常。 | Electron 下载与原生模块构建。 |

因此，直接运行 `ChatHub.exe`、登录网站和日常网页使用不经过这些路径；仍应避免在不可信项目目录或网络环境中执行 `npm install`、`npm run dist` 等构建命令。

项目继续启用上下文隔离并关闭网页的 Node.js 权限；使用时仍应避免添加来源不明的自定义网页。详细基线与验证记录见 [`DEPENDENCY_SECURITY.md`](DEPENDENCY_SECURITY.md)。

## English

ChatHub is a Windows desktop workspace for AI chat websites. It uses Electron + WebView to bring ChatGPT, Gemini, DeepSeek, and custom AI web pages into one desktop window.

### Maintenance Status

ChatHub has released stable version `v1.5.0` and is now in stable maintenance mode. As a personal utility, future work focuses on bug fixes, website compatibility, installer / uninstaller behavior, and small performance refinements.

### Features

- Built-in entries for ChatGPT, Gemini, and DeepSeek.
- Add custom AI web pages.
- Single reusable WebView runtime for lower memory usage.
- Task status management: running, paused, and finished.
- Adjustable side-by-side split view with a draggable divider constrained between 25% and 75%.
- Local login/session storage through Electron's persistent partition.
- Clear login state for the current page or all pages.
- Configurable close behavior with system tray support.
- Quick refresh button in the top bar; custom pages also show a quick delete button.
- Current page zoom controls in the top bar, with zoom saved per task.
- About dialog in settings with version, author, and GitHub repository information.
- Appearance settings for system, light, and dark themes; websites that support system themes update with the selected preference.
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

### Dependency Security Status

The 2026-07-21 audit baseline reported eight affected dependency packages: seven high-severity and one critical.

Electron has been updated to `43.2.0` and electron-builder to `26.15.3`. `npm audit --omit=dev` currently reports zero known runtime vulnerabilities. The full `npm audit` still reports five high-severity dependency groups used only by development and build tooling; they are recorded for a separate maintenance update. Automated packaging and startup smoke tests pass; website login, OAuth, upgrade installation, and uninstallation should still be validated in normal use.

The five findings are dependency groups, not only five individual advisories. They are indirect development dependencies and are not part of the normal ChatHub runtime path:

| Dependency | Plain-language impact | Build-only use |
| --- | --- | --- |
| `@xmldom/xmldom` | Malicious XML could cause parsing errors, resource use, or incorrect generated content. | XML handling in packaging tools. |
| `brace-expansion` | Crafted wildcard patterns could exhaust memory and stall a build. | File-pattern matching during packaging. |
| `fast-uri` | Crafted URLs could be parsed incorrectly and theoretically target the wrong address. | Packaging configuration validation. |
| `js-yaml` | Crafted YAML could keep the CPU busy for a long time. | Packaging-tool configuration parsing. |
| `undici` | Crafted network responses could disrupt build downloads or native-module rebuilds. | Electron downloads and native-module builds. |

Running `ChatHub.exe`, signing in to websites, and ordinary web use do not traverse these paths. Still, avoid running `npm install` or `npm run dist` in untrusted project directories or network environments.

Context isolation remains enabled and Node.js integration remains disabled for web content. Users should still avoid adding untrusted custom websites. See [`DEPENDENCY_SECURITY.md`](DEPENDENCY_SECURITY.md) for the detailed baseline and validation record.
