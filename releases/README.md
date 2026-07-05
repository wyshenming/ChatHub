# ChatHub Releases / ChatHub 发布说明

## 中文

当前版本：v0.7.0

维护状态：ChatHub 已进入稳定维护期，后续不再规划功能性扩展，主要只做 bug 修复、网页兼容性、安装 / 卸载和性能细节优化。

当前安装包：

```text
ChatHub-Setup-x64.exe
```

### v0.7.0 维护修复

- 停用 ChatHub 自己的网页输入草稿采集和恢复逻辑。
- 启动时一次性清理旧任务中的 `inputDraft`、`messages`、`scroll` 临时状态。
- 保留 WebViewPool、任务切换、登录状态和站点持久化数据不变。
- 已确认 SillyTavern 另有官方 `Restore User Input` 设置；若关闭后输入框不再恢复，说明该部分由 SillyTavern 自身控制。

### 适用平台

- Windows x64

### 主要能力

- Electron + WebView 桌面版 ChatHub。
- 内置 ChatGPT、Gemini、DeepSeek。
- 支持添加和编辑自定义 AI 网页。
- 侧边栏支持折叠为窄栏，并保留任务首字母 / 首字符徽标和设置入口。
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

Current version: v0.7.0

Maintenance status: ChatHub is now in stable maintenance mode. Future work will focus on bug fixes, website compatibility, installer / uninstaller behavior, and small performance refinements rather than feature expansion.

Current installer:

```text
ChatHub-Setup-x64.exe
```

### v0.7.0 Maintenance Fix

- Disabled ChatHub's own web input draft capture and restore logic.
- Added a one-time startup migration to clear old task `inputDraft`, `messages`, and `scroll` transient state.
- Kept WebViewPool, task switching, login state, and website persistent storage unchanged.
- Confirmed SillyTavern has its own official `Restore User Input` setting; if disabling it stops the draft from returning, that behavior is controlled by SillyTavern itself.

### Platform

- Windows x64

### Included In This Build

- Electron + WebView desktop ChatHub.
- Built-in ChatGPT, Gemini, and DeepSeek entries.
- Custom AI web pages can be added and edited.
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
