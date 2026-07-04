# ChatHub Releases / ChatHub 发布说明

## 中文

当前版本：v0.6.6

维护状态：ChatHub 已进入稳定维护期，后续不再规划功能性扩展，主要只做 bug 修复、网页兼容性、安装 / 卸载和性能细节优化。

当前安装包：

```text
ChatHub-Setup-x64.exe
```

### v0.6.6 维护修复

- 任务右键菜单中的“重命名任务”已替换为“修改网页”，可同时修改名称和链接。
- 修改链接时仅重建对应任务的 WebView，不清理 cookies、localStorage、sessionStorage 或 IndexedDB。

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

Current version: v0.6.6

Maintenance status: ChatHub is now in stable maintenance mode. Future work will focus on bug fixes, website compatibility, installer / uninstaller behavior, and small performance refinements rather than feature expansion.

Current installer:

```text
ChatHub-Setup-x64.exe
```

### v0.6.6 Maintenance Fix

- Replaced the task context menu "rename" action with "edit page" so the task name and URL can be changed together.
- Changing a task URL only recreates that task's WebView instance and does not clear cookies, localStorage, sessionStorage, or IndexedDB.

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
