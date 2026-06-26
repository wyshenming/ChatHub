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

## 2026-06-26 Release 发布规则文档化

### 本轮已经完成

- 在 `AGENTS.md` 新增 GitHub Release 发布规则。
- 明确每次 Release 必须创建新版本 tag 和全新 Release，禁止覆盖旧版本。
- 明确 Release Notes 必须包含中文说明和 English Description。
- 在 `TODO.md` 同步发布流程提醒。

### 验证结果

- 本轮只修改文档，不涉及业务代码或打包产物。

## 2026-06-26 关于弹窗与作者元数据

### 本轮已经完成

- 在设置弹窗中新增“关于 ChatHub”按钮。
- 新增独立关于弹窗，展示版本号、作者和 GitHub 仓库地址。
- GitHub 仓库跳转继续走 Controller → UI openUrl，不绕过现有分层。
- 将 `package.json` 作者改为 `染泓如梦QAQ`。
- 更新 `scripts\set-exe-metadata.js`，写入 exe 版本资源中的 `CompanyName`、`Author`、`Authors` 和版权字段。

### 已经修改的文件

- `package.json`
- `scripts/set-exe-metadata.js`
- `src/renderer/constants.js`
- `src/renderer/index.html`
- `src/renderer/renderer.js`
- `src/renderer/controller.js`
- `src/renderer/styles.css`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check` 已通过：renderer 模块、`src/main.js`、`src/preload.js`、打包脚本。
- `npm audit --omit=dev` 通过，未发现漏洞。
- `npm run dist:dir` 成功完成。
- `dist\ChatHub.exe` 与 `dist\win-unpacked\ChatHub.exe` 均确认为 x64。
- 已短暂启动 `dist\ChatHub.exe`，主窗口进程正常出现，随后手动停止。
- exe 版本资源中已确认 `CompanyName` 和版权字段显示 `染泓如梦QAQ`；Windows 详情页是否展示自定义 `Author` / `Authors` 字段仍需人工查看属性窗口确认。

## 2026-06-26 移除手动挂起 / 标记完成入口

### 本轮已经完成

- 从设置弹窗中移除“挂起当前任务”和“标记完成”两个按钮。
- 删除 renderer 中对应 DOM 查询和事件绑定。
- 删除 Controller 中对应的手动 `pauseCurrent` / `finishCurrent` 方法。
- 保留 TaskManager 的状态字段和切换任务时保存快照 / 自动挂起逻辑，不改变 WebView 生命周期。

### 已经修改的文件

- `src/renderer/index.html`
- `src/renderer/renderer.js`
- `src/renderer/controller.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check` 已通过：renderer 模块、`src/main.js`、`src/preload.js`、打包脚本。
- `rg` 未发现 `pause-current`、`finish-current`、`pauseCurrent`、`finishCurrent` 残留引用。
- `npm audit --omit=dev` 通过，未发现漏洞。
- `npm run dist:dir` 成功完成。
- 已短暂启动 `dist\ChatHub.exe`，主窗口进程正常出现，随后手动停止。

## 2026-06-26 v0.4.5 打包与发布准备

### 本轮已经完成

- 按 Release 规则将版本从 `0.4.4` 顺延到 `0.4.5`。
- 同步更新 `package.json`、`package-lock.json`、`src/preload.js`、`README.md`、`releases/README.md` 的版本 / 说明。
- 运行完整 `npm run dist`，生成新的 NSIS x64 安装包。
- 将 `dist\ChatHub-Setup-x64.exe` 复制覆盖到 `releases\ChatHub-Setup-x64.exe`，用于提交仓库和上传新版 Release。

### 验证结果

- `node --check` 已通过：renderer 模块、`src/main.js`、`src/preload.js`、打包脚本。
- `npm audit --omit=dev` 通过，未发现漏洞。
- `rg` 未发现手动挂起 / 标记完成入口残留引用。
- `npm run dist` 成功完成。
- `dist\ChatHub.exe` 为 x64，版本资源显示 `ProductVersion=0.4.5`、`CompanyName=染泓如梦QAQ`。
- `releases\ChatHub-Setup-x64.exe` 已更新，大小约 76.2 MB。
- 已短暂启动 `dist\ChatHub.exe`，主窗口进程正常出现，随后手动停止。

### 发布说明

- 本轮应创建全新 GitHub Release：`v0.4.5`。
- 不允许覆盖 `v0.4.4` 或更早版本。

## 2026-06-27 WebView 任务分组与折叠系统

### 本轮已经完成

- 在不修改 WebViewManager 生命周期逻辑的前提下，新增任务分组展示状态。
- 新增默认分组和自定义分组，分组状态持久化到 `chathub.groups.v1`。
- 任务状态中新增 `groupId` 和 `hidden` 字段，用于归属分组和控制左侧列表显示。
- 左侧任务列表改为“分组标题 + 子任务”的树状结构，分组支持展开 / 折叠。
- 设置页新增“工作区分组”区域，支持新建分组、移动当前任务到分组、隐藏当前任务、显示全部任务。
- 折叠分组和隐藏任务只影响 UI 列表，不销毁 WebView，不清理 session / login。

### 已经修改的文件

- `src/renderer/constants.js`
- `src/renderer/task-manager.js`
- `src/renderer/controller.js`
- `src/renderer/renderer.js`
- `src/renderer/index.html`
- `src/renderer/styles.css`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check` 已通过：`src/renderer/constants.js`、`src/renderer/task-manager.js`、`src/renderer/controller.js`、`src/renderer/renderer.js`、`src/renderer/webview-manager.js`。
- 本轮未修改 `src/renderer/webview-manager.js` 的核心创建 / 生命周期逻辑。
- 已短暂启动开发版应用，ChatHub 进程能正常出现，随后手动停止；未发现启动阶段崩溃。
- 已运行 `npm run dist:dir`，生成新的 `dist\ChatHub.exe`。
- 已短暂启动新的 `dist\ChatHub.exe`，ChatHub 进程能正常出现，随后手动停止。

### 仍需后续验证

- 需要人工确认分组折叠、任务隐藏 / 恢复显示、分组移动的真实交互体验。
- 需要确认 ChatGPT / Gemini / DeepSeek 登录状态在折叠和隐藏后不丢失。

## 2026-06-27 工作区管理系统升级

### 本轮已经完成

- 将分组展开图标从不规整的符号替换为更清晰的三角符号。
- 支持拖拽任务到不同分组，拖拽只改变任务归属，不操作 WebView 生命周期。
- 支持拖拽分组排序，分组顺序持久化。
- 新增左侧树状工作区右键菜单：
  - 分组右键：展开 / 折叠、删除非默认分组。
  - 任务右键：打开任务、隐藏任务、移动到其他分组；自定义网页额外支持删除。
- 新增分组删除自动回收机制：删除非默认分组后，其任务自动移动回默认分组。
- Task 状态兼容 `group` / `visible` 字段，同时保留现有 `groupId` / `hidden` 字段。

### 已经修改的文件

- `src/renderer/constants.js`
- `src/renderer/task-manager.js`
- `src/renderer/controller.js`
- `src/renderer/renderer.js`
- `src/renderer/styles.css`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check` 已通过：`src/renderer/constants.js`、`src/renderer/task-manager.js`、`src/renderer/controller.js`、`src/renderer/renderer.js`、`src/renderer/webview-manager.js`。
- `src/renderer/webview-manager.js` 无 diff，未改 WebView 创建 / 生命周期。
- 首次 `npm run dist:dir` 因旧 `dist\ChatHub.exe` 进程占用而失败；结束残留 ChatHub 进程后重新构建成功。
- 已短暂启动新的 `dist\ChatHub.exe`，ChatHub 进程能正常出现，随后手动停止。

### 仍需后续验证

- 需要人工确认拖拽任务、拖拽分组、右键菜单、删除分组回收任务的实际手感。
- 需要确认折叠 / 隐藏 / 拖拽过程中登录状态不丢失。

## 2026-06-27 Windows 风格右键操作重构

### 本轮已经完成

- 将左侧工作区管理入口迁移到右键菜单。
- 空白区域右键支持：添加网页、新建分组。
- 任务右键支持：打开任务、添加到新分组、移动到已有分组、重命名任务、重新加载页面、删除任务。
- 分组右键支持：展开 / 折叠、重命名分组、删除非默认分组。
- 设置页移除业务操作区块，仅保留关闭窗口行为和关于信息。
- 移除隐藏任务右键入口、显示全部任务按钮、当前任务分组设置项。
- 删除分组时，组内任务自动移动回默认分组；默认分组始终保留且不可删除。
- 删除任务统一走 TaskManager；自定义任务直接移除，内置任务记录为 deleted，避免重启后自动恢复。
- 仅在删除最后一个当前任务时调用 WebViewManager `clear()` 加载 `about:blank`，不创建或销毁 WebView。

### 已经修改的文件

- `src/renderer/constants.js`
- `src/renderer/task-manager.js`
- `src/renderer/controller.js`
- `src/renderer/renderer.js`
- `src/renderer/index.html`
- `src/renderer/webview-manager.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check` 已通过：renderer 相关模块和 `webview-manager.js`。
- `rg` 确认设置页业务入口 ID 不再残留。
- 已运行 `npm run dist:dir`，生成新的 `dist\ChatHub.exe`。
- 已短暂启动新的 `dist\ChatHub.exe`，ChatHub 进程能正常出现，随后手动停止。

## 2026-06-27 v0.5.0 版本迁移与打包

### 本轮已经完成

- 将项目版本号从 `0.4.5` 升级到 `0.5.0`。
- 同步更新 `package.json`、`package-lock.json`、`src/preload.js`、`releases/README.md` 中的版本信息。
- 新增启动版本迁移逻辑：
  - 读取保存的应用版本。
  - 如果版本变化，清理任务 `inputDraft`。
  - 清理临时 `messages`。
  - 重置保存的滚动草稿 `scroll`。
  - 写入新的保存版本。
- 迁移逻辑仅操作 renderer localStorage 中的任务状态，不调用 Electron session 清理，不影响 cookies / session / IndexedDB / localStorage 登录状态。

### 已经修改的文件

- `package.json`
- `package-lock.json`
- `src/preload.js`
- `src/renderer/constants.js`
- `src/renderer/storage-manager.js`
- `src/renderer/task-manager.js`
- `releases/README.md`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check` 已通过：`src/main.js`、`src/preload.js`、renderer 相关模块。
- `rg` 确认 `0.4.5` / `v0.4.5` 无残留。
- `rg` 确认版本迁移逻辑只操作 task state；没有新增 session / storage 清理调用。
- `npm run dist` 成功，生成 `dist\ChatHub.exe` 和 `dist\ChatHub-Setup-x64.exe`。
- 已将 `dist\ChatHub-Setup-x64.exe` 复制到 `releases\ChatHub-Setup-x64.exe`。
- `dist\ChatHub.exe` 版本资源显示 `ProductVersion=0.5.0`、`FileVersion=0.5.0`。
- 已短暂启动新的 `dist\ChatHub.exe`，ChatHub 进程能正常出现，随后手动停止。

### 仍需后续验证

- 需要人工验证三层右键菜单、重命名、删除任务、删除分组回收任务的真实交互。
- 需要确认删除当前任务后切换到下一个任务的体验符合预期。

### 右键交互修正

- 修复空白区域右键无反应：右键监听从 `service-list` 扩展到整个 sidebar 空白区，并避开品牌区和设置按钮。
- 修复右键菜单中 prompt 类操作不稳定：菜单项改为 `pointerdown` 执行动作，并延后一帧触发 prompt。
- 任务右键菜单移除“打开任务”。
- 左侧任务列表设置为占满剩余侧栏空间，保证有明确的空白右键区域。
- 已重新运行 `npm run dist:dir`，并短暂启动新的 `dist\ChatHub.exe` 验证进程正常出现。

### 右键输入弹窗修正

- 将右键中的“新建分组 / 添加到新分组 / 重命名任务 / 重命名分组”从原生 `window.prompt()` 改为应用内自定义输入弹窗。
- Controller 中相关方法改为异步等待输入结果，避免把 Promise 当成名称传入。
- 已确认 `window.prompt` 无残留引用。
- 已重新运行 `npm run dist:dir`，并短暂启动新的 `dist\ChatHub.exe` 验证进程正常出现。

### 清理缓存（保留登录状态）

- 在 WebView 任务右键菜单中新增“清理缓存（保留登录状态）”。
- 新增 IPC：`clear-service-cache`。
- preload 暴露 `clearServiceCache`，StorageManager 增加 `clearServiceCache` 封装。
- Controller 新增 `clearTaskCache(taskId)`，执行后重新加载当前任务页面。
- 主进程只调用 Electron session 的 `clearCache()`，不调用 `clearStorageData()`，因此不会主动清理 cookies、localStorage、sessionStorage 或 IndexedDB。

### 验证结果

- `node --check` 已通过：`src/main.js`、`src/preload.js`、renderer 相关模块。
- `rg` 已确认新缓存清理通道只调用 `clearCache()`；`clearStorageData()` 仍只存在于旧的登录清理接口。
- 已运行 `npm run dist:dir`，生成新的 `dist\ChatHub.exe`。
- 已短暂启动新的 `dist\ChatHub.exe`，ChatHub 进程能正常出现，随后手动停止。
