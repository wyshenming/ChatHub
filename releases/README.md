# ChatHub Releases / ChatHub 发布说明

## 中文

当前版本：v0.6.0

当前安装包：

```text
ChatHub-Setup-x64.exe
```

### 适用平台

- Windows x64

### 本版本包含

- Electron + WebView 桌面版 ChatHub。
- 内置 ChatGPT、Gemini、DeepSeek。
- 支持添加自定义 AI 网页。
- WebView 缓存池支持按任务复用页面实例，减少任务切换时的重复加载。
- 设置中可配置 WebView 最大常驻数量，在切换速度和内存占用之间取舍。
- WebView 性能日志写入滚动日志文件，避免日志无限增长。
- 卸载程序会先退出 ChatHub 和 Electron 子进程，再清理安装目录。
- 卸载向导新增“删除用户数据”复选框，默认保留登录状态、设置、任务和日志。
- 顶部快捷刷新当前网页。
- 自定义网页支持顶部快捷删除。
- 设置中新增关于窗口，展示版本、作者和 GitHub 仓库信息。
- 可执行文件元数据写入作者：染泓如梦QAQ。
- 设置中移除了手动“挂起当前任务”和“标记完成”，切换任务时仍会自动保存当前状态。
- 左侧任务状态点改为基于任务名称生成的柔和固定颜色，刷新后颜色保持一致。
- 应用图标、窗口图标、托盘/安装包图标和左上角品牌图标已统一更新。
- 单实例运行机制：重复打开程序时会激活已有窗口，不会创建第二个应用窗口。
- 本机保存网页登录状态，安装包不包含个人账号信息。

### 安装说明

1. 下载并运行 `ChatHub-Setup-x64.exe`。
2. 按安装器提示完成安装。
3. 如果已经打开 ChatHub，再次启动会自动切回已有窗口。

## English

Current version: v0.6.0

Current installer:

```text
ChatHub-Setup-x64.exe
```

### Platform

- Windows x64

### Included In This Build

- Electron + WebView desktop ChatHub.
- Built-in ChatGPT, Gemini, and DeepSeek entries.
- Custom AI web page support.
- WebView pool support reuses page instances per task to reduce reloads when switching tasks.
- Configurable maximum WebView pool size balances faster switching with memory usage.
- WebView performance logs now use rolling log files to prevent unbounded growth.
- The uninstaller exits ChatHub and Electron child processes before cleaning the install directory.
- The uninstall wizard now includes a "delete user data" checkbox, with login state, settings, tasks, and logs kept by default.
- Quick refresh for the current page in the top bar.
- Quick delete for custom pages in the top bar.
- About dialog in settings with version, author, and GitHub repository information.
- Executable metadata includes the author: 染泓如梦QAQ.
- Manual pause/finish actions were removed from settings; switching tasks still saves the current state automatically.
- Sidebar task indicators now use stable soft colors generated from task names, so colors remain consistent after refresh.
- App, window, tray/installer, and sidebar brand icons were updated to the new ChatHub icon.
- Single-instance behavior: launching the app again activates the existing window instead of creating a second app window.
- Website login state is stored locally. The installer does not include personal account data.

### Installation

1. Download and run `ChatHub-Setup-x64.exe`.
2. Follow the installer steps.
3. If ChatHub is already running, launching it again will bring the existing window to the front.
