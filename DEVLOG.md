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

## 2026-06-27 Soft Random Color 状态点

### 本轮已经完成

- 为左侧任务状态点新增基于名称 hash 的柔和 HSL 颜色系统。
- 新增 `hashString(str)` 和 `getSoftColor(name)`。
- 任务圆点颜色由任务名称稳定生成，不使用 `Math.random()`。
- 渲染层不再使用旧的 `task.color` 作为圆点颜色。
- 选中状态增加柔和 glow，hover 时轻微提亮。

### 已经修改的文件

- `src/renderer/utils.js`
- `src/renderer/renderer.js`
- `src/renderer/styles.css`
- `DEVLOG.md`
- `TODO.md`

### 验证结果

- `node --check` 已通过：`src/renderer/utils.js`、`src/renderer/renderer.js`、`src/renderer/task-manager.js`、`src/renderer/controller.js`。
- `rg` 确认颜色生成使用 `getSoftColor()` / `hashString()`；`Math.random()` 仅保留在自定义任务 / 分组 ID 生成中，不参与颜色。
- 已运行 `npm run dist:dir`，生成新的 `dist\ChatHub.exe`。
- 已短暂启动新的 `dist\ChatHub.exe`，ChatHub 进程能正常出现，随后手动停止。

## 2026-06-27 替换应用图标

### 本轮已经完成

- 使用用户提供的新图片替换 `build/icon.png`。
- 重新生成 `build/icon.ico`，供 Electron 窗口、托盘、exe 元数据和安装包使用。
- 将左上角 ChatHub 旁边的品牌图标改为同一张图片。
- 将关于弹窗中的品牌图标也改为同一张图片。
- 调整 `.brand-mark` 样式，使其作为图片容器展示。

### 已经修改的文件

- `build/icon.png`
- `build/icon.ico`
- `src/renderer/index.html`
- `src/renderer/styles.css`
- `DEVLOG.md`

### 验证结果

- `node --check` 已通过：`src/renderer/renderer.js`、`src/renderer/utils.js`、`src/main.js`、`src/preload.js`。
- `npm run dist` 成功，生成新的 `dist\ChatHub.exe` 和 `dist\ChatHub-Setup-x64.exe`。
- 已将新的 `dist\ChatHub-Setup-x64.exe` 复制到 `releases\ChatHub-Setup-x64.exe`。
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

## 2026-06-28 v0.5.1 图标与状态点发布

### 本轮已经完成

- 将项目版本号从 `0.5.0` 顺延到 `0.5.1`，用于创建全新的 GitHub Release，避免覆盖历史版本。
- 保留 v0.5.0 的版本迁移逻辑；升级到 v0.5.1 时仍只清理任务草稿、临时消息和滚动草稿，不清理 cookies / session / localStorage / IndexedDB。
- 同步更新 `releases/README.md` 的当前版本和本版本说明。

### 已经修改的文件

- `package.json`
- `package-lock.json`
- `src/preload.js`
- `releases/README.md`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证计划

- 重新运行 `node --check` 检查主要 JS 文件。
- 重新运行完整 `npm run dist`，生成 x64 unpacked exe 和 NSIS 安装包。
- 短暂启动 `dist/ChatHub.exe`，确认进程可启动后关闭。
- 将新安装包复制到 `releases/ChatHub-Setup-x64.exe` 并发布 GitHub Release `v0.5.1`。

### v0.5.1 打包验证结果

- `node --check` 已通过：`src/main.js`、`src/preload.js`、renderer 主要模块。
- `npm run dist` 已成功，生成 `dist/ChatHub.exe` 和 `dist/ChatHub-Setup-x64.exe`。
- `dist/ChatHub.exe` 版本资源显示 `ProductVersion=0.5.1`、`FileVersion=0.5.1`。
- 已复制安装包到 `releases/ChatHub-Setup-x64.exe`。
- 安装包 SHA256：`EF27FCCF93780BBFB7B059C18050D83CC79BEE1491E1082FD34E8BA7752410DC`。
- 已短暂启动 `dist/ChatHub.exe`，ChatHub 进程正常出现，随后已停止。

## 2026-06-28 WebViewManager 性能日志

### 本轮已经完成

- 在 `WebViewManager` 中新增性能日志输出，用于定位切换卡顿来源。
- 记录 WebView 创建、attach、销毁 / 移除、loadURL 调用、did-start-loading、did-stop-loading、did-finish-load、did-fail-load。
- 切换任务时输出任务名、动作、是否复用现有 WebView、切换耗时、WebView 数量和内存信息。
- 内存信息优先读取 Chromium renderer 可见的 `performance.memory`；不可用时输出 `unavailable`。
- 未修改 WebView 生命周期逻辑，未新增 WebView 创建逻辑，未做性能优化。

### 已经修改的文件

- `src/renderer/webview-manager.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证计划

- 运行 `node --check src/renderer/webview-manager.js`。
- 运行 `npm run dist:dir`，确认构建不受影响。
- 短暂启动 `dist/ChatHub.exe`，确认进程可启动。

### 验证结果

- `node --check` 已通过：`src/renderer/webview-manager.js`、`src/renderer/renderer.js`、`src/renderer/controller.js`。
- `git diff --check` 通过，仅有 CRLF 提示。
- `npm run dist:dir` 成功，生成新的 unpacked x64 应用。
- 已短暂启动 `dist/ChatHub.exe`，ChatHub 进程正常出现，随后已停止。

## 2026-06-28 WebView 性能日志落盘

### 本轮已经完成

- 新增主进程 IPC `append-webview-performance-log`，将 WebView 性能日志追加写入本地文件。
- preload 暴露 `appendWebViewPerformanceLog(entry)` 给 renderer 使用。
- `WebViewManager` 的性能日志现在同时输出到 Console 和本地日志文件。
- 日志文件路径：`%APPDATA%\AI Chat Hub\logs\webview-performance.log`。
- 未修改 WebView 生命周期、任务切换逻辑或登录状态策略。

### 已经修改的文件

- `src/main.js`
- `src/preload.js`
- `src/renderer/webview-manager.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check` 已通过：`src/main.js`、`src/preload.js`、`src/renderer/webview-manager.js`。
- `git diff --check` 通过，仅有 CRLF 提示。
- `npm run dist:dir` 成功。
- 已短暂启动 `dist/ChatHub.exe`，日志文件成功生成并写入。
- 本次验证日志路径：`C:\Users\Administer\AppData\Roaming\AI Chat Hub\logs\webview-performance.log`。

## 2026-06-28 WebView 重复 loadURL 排查

### 排查结论

- 当前 `Reuse Existing: true` 只表示复用了同一个 `<webview>` DOM / Chromium 容器对象，并不表示复用了每个任务的页面实例。
- 切换任务链路为：`controller.selectTask()` -> `webViewManager.loadTask()` -> `loadTaskUrl()`。
- 原逻辑在 `loadTaskUrl()` 中无条件执行 `webview.loadURL(targetUrl)`，所以跨任务切换必然触发页面重新导航。
- 这属于逻辑层面的重复导航问题，但在“单 WebView 执行器”架构下，切换到不同站点 URL 时仍然必须导航；真正做到多个任务页面都不重新加载，需要多页面实例缓存或多 WebView / BrowserView 池，属于后续架构方案，当前未做。

### 本轮已经完成

- 切换任务时新增日志字段：`Current URL`、`Target URL`、`Need Reload`。
- 新增 `Switch Decision` 日志，用于说明是否需要调用 `loadURL()` 以及原因。
- 增加轻量防重复导航：当当前 URL 与目标 URL 一致时，不再调用 `loadURL()`，只恢复任务上下文并标记 ready。
- 未改变 WebView 创建 / 销毁策略，未引入多 WebView，未重构架构。

### 验证结果

- `node --check` 已通过：`src/renderer/webview-manager.js`、`src/renderer/controller.js`、`src/main.js`、`src/preload.js`。
- `git diff --check` 通过，仅有 CRLF 提示。
- `npm run dist:dir` 成功。
- 已短暂启动 `dist/ChatHub.exe`，日志文件成功写入 `Switch Decision`、`Current URL`、`Target URL`、`Need Reload`。

## 2026-06-28 WebView 缓存池架构升级

### 本轮已经完成

- 将 `WebViewManager` 从单 WebView 反复 `loadURL()` 切换，升级为 WebView 缓存池机制。
- 新增 `webviewPool = Map<TaskId, WebViewRecord>`，每个任务第一次打开时创建独立 WebView，后续切换复用该 WebView。
- 切换任务时通过 `visibility / opacity / pointer-events / z-index` 显示目标 WebView、隐藏其它 WebView，不销毁、不重新创建。
- 缓存命中时输出 `Action: Show Cached`，且不调用 `loadURL()`。
- 首次创建、目标 URL 未加载、任务配置 URL 变化时才调用 `loadURL()`。
- 区分 `isLoadingTarget`，避免 WebView 初始 `about:blank` 加载被误认为任务页面缓存命中。
- 删除任务时调用 `webViewManager.removeTask(taskId)`，释放对应池内 WebView，避免隐藏 WebView 常驻泄漏。
- 保留现有 Controller / TaskManager / UI 结构，未重写任务系统，未改变登录状态策略。

### 已经修改的文件

- `src/renderer/webview-manager.js`
- `src/renderer/controller.js`
- `src/main.js`
- `src/preload.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check` 已通过：`src/renderer/webview-manager.js`、`src/renderer/controller.js`、`src/renderer/renderer.js`、`src/main.js`、`src/preload.js`。
- `git diff --check` 通过，仅有 CRLF 提示。
- `npm run dist:dir` 成功。
- 已短暂启动 `dist/ChatHub.exe`，进程正常出现，日志文件正常写入 `Pool Size`、`WebView Count`、`Switch Decision`、`loadURL` 等字段。

### 仍需人工验证

- 在真实窗口中依次切换 ChatGPT / Gemini / DeepSeek，再切回已打开任务。
- 缓存命中时日志应出现 `Action: Show Cached`、`Need Reload: false`。
- 已缓存任务切回时不应出现新的 `Action: loadURL`。
- 观察 `Pool Size` 是否随首次打开任务增加，并在删除任务后释放对应 WebView。

## 2026-06-28 WebViewPool 最大常驻数量设置

### 本轮已经完成

- 在设置页新增“性能”区域。
- 新增配置项 `maxWebViewPoolSize`，可选值为 2 / 3 / 4 / 5 / 6，默认值为 4。
- 配置持久化到 renderer localStorage：`chathub.performanceSettings.v1`。
- 应用启动时读取配置并应用到 WebViewPool。
- 设置修改后立即调用 `webViewManager.setMaxWebViewPoolSize()`，并立即执行 LRU 淘汰检查。
- WebViewPool 超过上限时淘汰最久未访问的非当前 WebView。
- 当前正在显示的 WebView 永远不淘汰。
- 淘汰只销毁 WebView DOM，不删除任务，不清理 cookies / localStorage / sessionStorage / IndexedDB。
- 下次点击被淘汰任务时会重新创建 WebView 并加载任务 URL。
- 新增 `[WebViewPool] Action: Evict` 日志，包含 Max Pool Size、Pool Size Before / After、Evicted Task。

### 已经修改的文件

- `src/renderer/index.html`
- `src/renderer/styles.css`
- `src/renderer/renderer.js`
- `src/renderer/controller.js`
- `src/renderer/storage-manager.js`
- `src/renderer/webview-manager.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check` 已通过：`src/renderer/webview-manager.js`、`src/renderer/controller.js`、`src/renderer/renderer.js`、`src/renderer/storage-manager.js`。
- `npm run dist:dir` 成功。
- 已短暂启动 `dist/ChatHub.exe`，进程正常出现，日志文件正常写入。

### 仍需人工验证

- 在设置中将 WebView 最大常驻数量改为 2 或 3。
- 依次打开超过上限数量的任务。
- 日志应出现 `[WebViewPool] Action: Evict`。
- 确认被淘汰任务仍在任务列表中，下次点击会重新创建 WebView 并加载页面。
- 确认当前正在显示的 WebView 不会被淘汰。

## 2026-06-28 Rolling Log 日志滚动系统

### 本轮已经完成

- 将 WebView 性能日志统一迁移到 `%APPDATA%\AI Chat Hub\logs\webview.log`。
- 新增 `maxLogFileSize = 10 * 1024 * 1024`，单个日志文件超过 10MB 后触发滚动裁剪。
- 裁剪时保留最近约 5MB 内容，删除最旧内容，并继续追加新日志。
- 每次应用启动生成本地时间 Session ID，例如 `[Session: 2026-06-28T21-44-13]`，本次启动写入的日志都会带上该 Session ID。
- 日志写入使用主进程异步 `fs.promises.appendFile`，写入失败只输出 `console.warn`，不让应用崩溃。
- 日志分类通过 `logFileNames` 预留扩展入口，目前启用 `webview.log`，后续可扩展 `network.log`、`renderer.log`、`crash.log`。
- 未修改 WebViewPool、TaskManager、设置数据或任何登录状态清理逻辑。

### 已经修改的文件

- `src/main.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check src/main.js` 通过。
- `npm run dist:dir` 通过。
- 使用 11MB 测试日志启动 `dist/ChatHub.exe` 后，`webview.log` 从 `11534464` 字节裁剪到 `5245843` 字节。
- 验证日志头包含 `[RollingLog] Trimmed oldest log content.` 和本地时间 Session ID。

### 已知说明

- 新版本不再写入旧路径 `%APPDATA%\AI Chat Hub\logs\webview-performance.log`。
- 本轮只限制 ChatHub 自己的 `logs/*.log` 写入目标，不删除用户数据，不清理 cookies / session / localStorage / IndexedDB。

## 2026-06-28 NSIS 卸载流程优化

### 本轮已经完成

- 新增 `build/installer.nsh`，并在 `package.json` 的 `build.nsis.include` 中接入。
- 卸载前检查 `ChatHub.exe` 是否仍在运行；如果运行，提示用户确认后使用 `taskkill /T /F /IM ChatHub.exe` 关闭主进程和 Electron 子进程。
- 卸载程序默认只删除安装目录程序文件，默认保留用户数据。
- 非静默卸载时新增确认框：是否同时删除用户数据。
- 选择保留时，不删除设置、任务、日志、Cookies、Cache、Local Storage、IndexedDB、GPUCache。
- 选择删除时，删除当前项目可能使用过的用户数据目录：
  - `%APPDATA%\AI Chat Hub`
  - `%LOCALAPPDATA%\AI Chat Hub`
  - `%APPDATA%\ChatHub`
  - `%LOCALAPPDATA%\ChatHub`
  - `%APPDATA%\chathub`
  - `%LOCALAPPDATA%\chathub`
- 卸载结束后追加兜底清理 `$INSTDIR` 下的 `ChatHub.exe`、`resources/`、`locales/`、Electron DLL、`.dat`、`.bin`、`.pak` 等程序文件。
- 旧方案曾尝试用重启后删除兜底；该方案已在后续二次修复中移除，避免触发 Windows 重启删除提示。

### 已经修改的文件

- `build/installer.nsh`
- `package.json`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- 第一次打包因 NSIS 变量只在卸载器阶段使用而触发 warning-as-error，已通过 `BUILD_UNINSTALLER` 条件修正。
- `npm run dist` 完整打包通过。
- 已更新 `dist\ChatHub-Setup-x64.exe` 和 `releases\ChatHub-Setup-x64.exe`。
- 新安装包 SHA256：`6BB8A5BF5A8050EFE1809626EF3346034D24A0838547BF636A07463F0C81BA7E`。

### 仍需人工验证

- 使用新安装包安装到测试目录，例如 `D:\ChatHub`。
- 启动 ChatHub 后从安装目录运行 `uninstall.exe`。
- 选择“保留用户数据”后确认安装目录不再残留 `ChatHub.exe`、`resources/`、DLL、`.dat`、`.bin` 等程序文件。
- 确认 `%APPDATA%\AI Chat Hub` 仍然保留，重新安装后登录状态和设置可恢复。
- 再做一次“删除所有数据”测试时，先确认不需要保留登录状态。

## 2026-06-28 NSIS 卸载残留二次修复

### 本轮已经完成

- 新增主进程卸载退出参数 `--quit-for-uninstall`。
- 当正在运行的 ChatHub 收到第二实例参数 `--quit-for-uninstall` 时，执行 `quitForUninstall()`：
  - 设置 `isQuitting = true`
  - 销毁所有窗口
  - 销毁托盘
  - 调用 `app.quit()`
  - 1 秒后兜底调用 `app.exit(0)`
- NSIS 卸载前先运行 `"$INSTDIR\ChatHub.exe" --quit-for-uninstall`，等待应用自行释放 WebView / renderer / GPU / utility 子进程。
- 如果仍检测到 `ChatHub.exe`，再使用 `taskkill /T /F /IM ChatHub.exe` 关闭进程树。
- 移除所有 `/REBOOTOK`，禁止使用 Windows pending file rename / 重启后删除机制。
- 卸载阶段保留 `RMDir /r "$INSTDIR"` 强制递归删除安装目录。
- 增加延迟清理脚本 `%TEMP%\chathub-cleanup.cmd`：
  - 先 `cd /d "%TEMP%"`，避免脚本继承安装目录作为当前目录。
  - 延迟约 3 秒。
  - 执行 `rmdir /s /q "$INSTDIR"`。
  - 最后删除脚本自身。
- 默认仍保留 AppData 用户数据；只在用户选择删除数据时清理用户数据目录。

### 已经修改的文件

- `src/main.js`
- `build/installer.nsh`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check src/main.js` 通过。
- `npm run dist` 完整打包通过。
- 使用 `D:\codex\ChatHub_UninstallSmoke` 做静默安装 / 启动 / 静默卸载烟测：
  - 安装退出码：`0`
  - 卸载退出码：`0`
  - 卸载后测试安装目录存在：`False`
  - 卸载后 ChatHub 进程数量：`0`
  - `%APPDATA%\AI Chat Hub` 仍存在：`True`
- 已更新 `dist\ChatHub-Setup-x64.exe` 和 `releases\ChatHub-Setup-x64.exe`。
- 新安装包 SHA256：`0A90092C8E4D19F228AE06E43D0020A3AA4A3C6F8158BFD3305C2853404A460B`。

### 已知说明

- 本轮已验证独立测试目录可完全删除；仍建议在真实 `D:\ChatHub` 安装目录上再做一次手动卸载确认。
- 卸载默认保留用户数据，不影响登录状态、设置、任务和日志。

## 2026-06-28 NSIS 延迟清理隐藏窗口修复

### 本轮已经完成

- 将卸载后的延迟清理脚本从 `%TEMP%\chathub-cleanup.cmd` 改为 `%TEMP%\chathub-cleanup.vbs`。
- 使用 `wscript.exe` 后台执行 VBS，避免卸载完成后弹出命令提示符窗口。
- VBS 保持原有逻辑：
  - 切换当前目录到 `%TEMP%`
  - 延迟 3 秒
  - 删除安装目录
  - 删除脚本自身
- 未修改用户数据清理策略，默认仍保留 AppData。

### 验证结果

- `npm run dist` 完整打包通过。
- 使用 `D:\codex\ChatHub_UninstallSmoke` 做静默安装 / 启动 / 静默卸载烟测：
  - 安装退出码：`0`
  - 卸载退出码：`0`
  - 卸载后测试安装目录存在：`False`
  - 卸载后 ChatHub 进程数量：`0`
  - `%APPDATA%\AI Chat Hub` 仍存在：`True`
  - `%TEMP%\chathub-cleanup.vbs` 已自删：`False`
- 已更新 `dist\ChatHub-Setup-x64.exe` 和 `releases\ChatHub-Setup-x64.exe`。
- 新安装包 SHA256：`FAAC0418CD043FF6ED75A9A5D5C4B8030FBD6B4A4221972CD73FA645F4EFF8B3`。

## 2026-06-28 NSIS 卸载向导页优化

### 本轮已经完成

- 将卸载时“是否删除用户数据”的 MessageBox 改为 Windows Wizard 风格自定义卸载页。
- 使用 `customUnWelcomePage` 替换默认卸载欢迎页，确保用户选择发生在卸载执行前。
- 页面只保留清晰信息层级：
  - 标题：`卸载 ChatHub`
  - 说明：`将从本机移除 ChatHub 程序`
  - 安装目录：`$INSTDIR`
  - 复选框：`删除用户数据（登录状态 / 缓存 / 日志 / 设置 / 任务）`
- 默认不勾选删除用户数据，用户必须主动选择删除。
- 移除 Cookies / IndexedDB / GPUCache 等技术字段展示，降低用户决策负担。
- 将默认按钮文字改为 `卸载`，保留系统 `取消` 按钮。

### 验证结果

- 初次打包发现 `customUninstallPage` 插入时机太晚，改用 `customUnWelcomePage`。
- 初次尝试 `MUI_HEADER_TEXT` 被当前 NSIS 模板拒绝，改为在自定义页正文中展示标题和说明。
- 变量声明按 `BUILD_UNINSTALLER` 条件修正，避免主安装器编译警告。
- `npm run dist` 完整打包通过。
- 使用 `D:\codex\ChatHub_UninstallSmoke` 做静默安装 / 启动 / 静默卸载烟测：
  - 安装退出码：`0`
  - 卸载退出码：`0`
  - 卸载后测试安装目录存在：`False`
  - 卸载后 ChatHub 进程数量：`0`
  - `%APPDATA%\AI Chat Hub` 仍存在：`True`
  - `%TEMP%\chathub-cleanup.vbs` 已自删：`False`
- 已更新 `dist\ChatHub-Setup-x64.exe` 和 `releases\ChatHub-Setup-x64.exe`。
- 新安装包 SHA256：`3D9B830CD342F2E6EB878E2C7445E8A5CBD6A163F2D00A535C06792FC2FA6847`。

### 仍需人工验证

- 用新安装包做一次非静默卸载，确认卸载页视觉接近 Windows 原生向导风格。
- 确认复选框默认未勾选。
- 确认点击 `卸载` 后仍能删除安装目录，且不弹命令提示符窗口。

## 2026-06-28 NSIS 卸载向导页布局修正

### 本轮已经完成

- 根据非静默卸载截图反馈，确认“删除用户数据”复选框位置过低，被底部按钮区挤出可见区域。
- 收紧卸载页纵向布局：
  - 标题从 `14u` 调整为 `12u`
  - 副标题上移到 `16u`
  - 主说明上移到 `42u`
  - 安装目录上移到 `78u`
  - 删除用户数据复选框上移到 `112u`
- 保持默认不勾选删除用户数据。
- 未修改卸载清理逻辑和 AppData 保留策略。

### 验证结果

- `npm run dist` 完整打包通过。
- 静默安装 / 启动 / 卸载烟测通过：
  - 安装退出码：`0`
  - 卸载退出码：`0`
  - 卸载后测试安装目录存在：`False`
  - 卸载后 ChatHub 进程数量：`0`
  - `%APPDATA%\AI Chat Hub` 仍存在：`True`
  - `%TEMP%\chathub-cleanup.vbs` 已自删：`False`
- 已更新 `dist\ChatHub-Setup-x64.exe` 和 `releases\ChatHub-Setup-x64.exe`。
- 新安装包 SHA256：`B5FD706933A4709E5DEE2C75ED0ACAC085324637B64B423FBEA6AF66ED3CB6E9`。

### 仍需人工验证

- 用新安装包做一次非静默卸载，确认“删除用户数据”复选框已经显示在安装目录下方。

## 2026-06-28 发布 v0.6.0

### 本轮已经完成

- 按用户要求将版本号升级到 `0.6.0`。
- 同步更新：
  - `package.json`
  - `package-lock.json`
  - `src/preload.js`
  - `releases/README.md`
- 完整构建 Windows x64 安装包。
- 更新仓库内安装包副本 `releases\ChatHub-Setup-x64.exe`。
- 准备发布 GitHub Release `v0.6.0`，遵循不覆盖旧 Release 的规则。

### 版本重点

- WebView 缓存池和最大常驻数量设置。
- WebView 性能日志与 Rolling Log。
- NSIS 卸载流程修复：退出进程、清理安装目录、保留用户数据。
- Windows Wizard 风格卸载页，默认不删除用户数据。
- 卸载延迟清理改为后台 VBS，避免命令提示符窗口。

### 验证结果

- `npm run dist` 完整打包通过。
- 使用 `D:\codex\ChatHub_UninstallSmoke` 做静默安装 / 启动 / 静默卸载烟测：
  - 安装退出码：`0`
  - `FileVersion=0.6.0`
  - `ProductVersion=0.6.0`
  - 卸载退出码：`0`
  - 卸载后测试安装目录存在：`False`
  - 卸载后 ChatHub 进程数量：`0`
  - `%APPDATA%\AI Chat Hub` 仍存在：`True`
  - `%TEMP%\chathub-cleanup.vbs` 已自删：`False`
- 新安装包 SHA256：`5BEA2CF1910C3CDCF62929BB4F9332CBCA24DB98C8B71ABF8757C9C50006D700`。

### 发布状态

- 待提交到 GitHub。
- 待创建 tag `v0.6.0`。
- 待创建 GitHub Release `v0.6.0` 并上传安装包。

## 2026-07-03 侧边栏折叠窄栏

### 本轮已经完成

- 在左侧品牌区新增侧边栏折叠 / 展开按钮。
- 折叠后侧边栏变为窄栏，只保留品牌图标、分组展开指示、任务状态圆点和设置齿轮入口。
- 展开后恢复原有侧边栏布局。
- 新增 UI 设置持久化 `chathub.uiSettings.v1`，保存 `sidebarCollapsed`。
- 仅通过 CSS class 切换布局，不修改 WebViewPool、TaskManager、分组、任务切换或登录状态逻辑。

### 已经修改的文件

- `src/renderer/index.html`
- `src/renderer/styles.css`
- `src/renderer/renderer.js`
- `src/renderer/storage-manager.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check src\renderer\renderer.js` 通过。
- `node --check src\renderer\storage-manager.js` 通过。
- `git diff --check` 通过，仅有 CRLF 提示。
- 首次 `npm run dist:dir` 因旧的 `dist\ChatHub.exe` 正在运行而无法覆盖。
- 关闭残留 ChatHub 进程后，`npm run dist:dir` 通过。

### 仍需人工验证

- 打开应用后点击侧边栏按钮，确认折叠 / 展开状态视觉正常。
- 折叠状态下确认任务圆点可点击切换，设置齿轮可打开设置。
- 重启应用后确认侧边栏折叠状态能恢复。

## 2026-07-03 窄栏任务徽标

### 本轮已经完成

- 折叠侧边栏时，任务入口从单纯圆点改为显示任务名称首字母 / 首字符。
- 展开侧边栏时仍保持原有柔和圆点视觉，不显示字母。
- 英文任务取首字母大写，中文任务取第一个字符。
- 未修改任务状态、分组或 WebView 切换逻辑。

### 验证结果

- `node --check src\renderer\renderer.js` 通过。
- `git diff --check` 通过，仅有 CRLF 提示。

## 2026-07-04 发布 v0.6.5

### 本轮已经完成

- 按用户要求将版本号升级到 `0.6.5`。
- 将侧边栏折叠窄栏和任务首字母徽标纳入本版发布。
- README 和 `releases/README.md` 增加稳定维护期说明：
  - 后续不再规划功能性扩展。
  - 后续主要只做 bug 修复、网页兼容性、安装 / 卸载和性能细节优化。
- 同步更新：
  - `package.json`
  - `package-lock.json`
  - `src/preload.js`
  - `README.md`
  - `releases/README.md`

### 版本重点

- 侧边栏可折叠为窄栏。
- 窄栏任务入口显示任务名称首字母 / 首字符。
- 折叠状态持久化。
- 明确项目进入稳定维护期。

### 发布状态

- `npm run dist` 完整打包通过。
- 使用 `D:\codex\ChatHub_UninstallSmoke` 做静默安装 / 启动 / 静默卸载烟测：
  - 安装退出码：`0`
  - `FileVersion=0.6.5`
  - `ProductVersion=0.6.5`
  - 卸载退出码：`0`
  - 卸载后测试安装目录存在：`False`
  - 卸载后 ChatHub 进程数量：`0`
  - `%APPDATA%\AI Chat Hub` 仍存在：`True`
  - `%TEMP%\chathub-cleanup.vbs` 已自删：`False`
- 新安装包 SHA256：`696AEDEB25F03BD5FF04A9B26CC507544D2D238B41D73EBDCC0CF99BAEAE914A`。
- 待提交到 GitHub。
- 待创建 tag `v0.6.5`。
- 待创建 GitHub Release `v0.6.5` 并上传安装包。

## 2026-07-04 右键修改网页

### 本轮已经完成

- 将任务右键菜单中的“重命名任务”替换为“修改网页”。
- 复用原“添加网页”弹窗，支持同时修改任务名称和链接。
- 修改链接后会释放该任务旧的 WebView 缓存实例，并在当前任务被修改时重新加载新链接。
- 仅释放任务对应 WebView，不清理 cookies / localStorage / sessionStorage / IndexedDB，不影响登录状态。

### 已经修改的文件

- `src/renderer/index.html`
- `src/renderer/renderer.js`
- `src/renderer/controller.js`
- `src/renderer/task-manager.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check src\renderer\renderer.js` 通过。
- `node --check src\renderer\controller.js` 通过。
- `node --check src\renderer\task-manager.js` 通过。
- `git diff --check` 通过，仅有 CRLF 提示。
- `npm run dist:dir` 通过。
- 待人工验证：右键任务选择“修改网页”，确认名称和链接都能保存。

## 2026-07-04 发布 v0.6.6

### 本轮已经完成

- 按用户要求将版本号升级到 `0.6.6`。
- 将“右键修改网页”维护修复纳入本版发布。
- 清理并重写 `releases/README.md` 为正常 UTF-8 中英双语发布说明。

### 待完成发布步骤

- 已验证：`npm run dist` 完整打包通过。
- 已验证：`dist\ChatHub.exe` 元数据显示 `FileVersion=0.6.6`、`ProductVersion=0.6.6`。
- 已完成：安装包复制到 `releases/ChatHub-Setup-x64.exe`。
- 新安装包 SHA256：`9DE33EA66FD575E7F7D4DC9DF1AB51636434050D6920C4C678BA7E0B6FBDD3DA`。
- 已提交到 GitHub。
- 已创建 tag `v0.6.6`。
- 已创建 GitHub Release `v0.6.6` 并上传安装包。
- Release 地址：`https://github.com/wyshenming/ChatHub/releases/tag/v0.6.6`。

## 2026-07-05 输入草稿重复恢复排查与修复

### 问题原因

- ChatHub 会在任务切换 / 关闭前通过 WebView JS 抓取网页 `textarea / input / contenteditable` 内容，保存为任务 `inputDraft`。
- 页面重新加载后，WebViewManager 会把保存的 `inputDraft` 再写回网页输入框。
- 构建前如果输入框里有文字，该文字可能已保存到本机 `%APPDATA%\AI Chat Hub` 的任务状态中；构建后的 exe 继续使用同一用户数据目录，因此刷新页面仍会恢复该文字。
- “清理缓存（保留登录状态）”只调用 Electron session `clearCache()`，不会清理 ChatHub 自己的任务状态，也不会清理站点 localStorage / IndexedDB，因此无法移除该草稿。

### 本轮已经完成

- 停止从网页输入框采集 `inputDraft`。
- 停止向网页输入框恢复 `inputDraft`。
- 保留任务切换、WebViewPool、登录状态和站点持久化分区不变。
- 新增一次性任务临时状态迁移，清理旧的 `inputDraft`、`messages`、`scroll`。

### 已经修改的文件

- `src/renderer/constants.js`
- `src/renderer/task-manager.js`
- `src/renderer/webview-manager.js`
- `DEVLOG.md`
- `TODO.md`
- `DEVICE_LOG.md`

### 验证结果

- `node --check src\renderer\constants.js` 通过。
- `node --check src\renderer\task-manager.js` 通过。
- `node --check src\renderer\webview-manager.js` 通过。
- `git diff --check` 通过，仅有 CRLF 提示。
- `npm run dist:dir` 通过。
- 启动应用后确认旧输入草稿不再自动出现在网页输入框里。
- 确认登录状态不受影响。

## 2026-07-05 发布 v0.7.0

### 本轮已经完成

- 按用户要求将版本号升级到 `0.7.0`。
- 将输入草稿恢复修复纳入本版发布。
- 更新 `releases/README.md`，说明 ChatHub 已停用自身输入草稿恢复，同时记录 SillyTavern `Restore User Input` 设置结论。

### 待完成发布步骤

- 已验证：`npm run dist` 完整打包通过。
- 已验证：`dist\ChatHub.exe` 元数据显示 `FileVersion=0.7.0`、`ProductVersion=0.7.0`。
- 已完成：安装包复制到 `releases/ChatHub-Setup-x64.exe`。
- 新安装包 SHA256：`566B258BEF56E3648DC895B98ACCD6995B9B7B8D5A973F204EEBA14D60120C17`。
- 待完成：提交 GitHub 仓库。
- 待完成：创建 tag `v0.7.0`。
- 待完成：创建 GitHub Release `v0.7.0` 并上传安装包。
