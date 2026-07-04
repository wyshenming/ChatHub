# DEVICE_LOG

### 2026-06-27：替换应用与品牌图标

**小米：** 用户提供了新的 ChatHub 图标图片，希望应用图标和左上角 ChatHub 旁边的图标都统一替换为这张图。

**小米：** 实现判断：Electron 窗口、托盘、exe 元数据和安装包都依赖 `build/icon.ico`，所以需要先替换 `build/icon.png`，再重新生成 `build/icon.ico`。

**小米：** UI 判断：renderer 中原来的 `.brand-mark` 是文本 `CH` 和 CSS 背景，不适合继续复用。改成 `<img>` 引用同一份 `build/icon.png`，左上角和关于弹窗保持一致。

### 2026-06-27：任务状态点柔和固定色

**小米：** 用户希望左侧任务状态点不要统一黑色，而是每个 AI / 任务拥有柔和、稳定、可区分的颜色。

**小米：** 实现判断：颜色不应使用 `Math.random()`，否则刷新后会变化。用任务名称做 hash，再映射到 HSL hue，可以保证同名任务颜色稳定。

**小米：** UI 判断：颜色只影响左侧圆点展示，不改变 running / paused / finished 等任务状态逻辑。选中态用轻微 glow 和边框强调，避免过度鲜艳。

### 2026-06-27：v0.5.0 版本迁移逻辑

**小米：** 用户要求把版本号变更为 `0.5.0`，并在启动时增加版本迁移逻辑，版本变化时清理任务草稿和临时消息，但不能影响登录状态。

**小米：** 边界判断：登录状态属于 Electron session / WebView 内部站点数据，迁移逻辑不能调用 `clearStorageData()`，也不能清 cookies、IndexedDB、localStorage 或 sessionStorage。

**小米：** 实现判断：任务草稿和临时消息目前保存在 renderer localStorage 的 task state 中，因此迁移放在 TaskManager 初始化阶段处理最稳。它只清 `inputDraft`、`messages` 和保存的 `scroll` 草稿，然后写入保存版本。

**小米：** 风险控制：版本迁移使用单独的 `chathub.appVersion.v1` key。只有保存版本与当前 preload 暴露版本不一致时执行，避免每次启动都清草稿。

### 2026-06-27：任务右键新增清理缓存但保留登录

**小米：** 用户希望 WebView 任务右键菜单新增“清理缓存（保留登录状态）”，目标是清掉资源缓存，但绝对不能让用户重新登录。

**小米：** 实现判断：不能复用现有清理登录状态接口，因为那个接口会调用 `clearStorageData()`，可能影响 cookies、localStorage、IndexedDB 等登录相关数据。

**小米：** 边界判断：新功能单独走 `clear-service-cache` IPC，只调用 Electron session 的 `clearCache()`。它清理的是 session cache，不重置 partition，也不清 storage data。

**小米：** 交互判断：菜单项放在任务右键菜单里。执行时先切换到目标任务，再清缓存并 reload，让用户看到页面重新拉取资源，同时保留登录状态。

### 2026-06-27：Windows 风格右键操作重构

**小米：** 用户希望 ChatHub 左侧工作区更贴近 Windows 文件管理器交互：右键负责管理，左键只负责打开或切换任务，设置页只保留全局设置。

**小米：** 架构判断：右键菜单属于 UI 入口，但业务状态必须仍然由 Controller 转发给 TaskManager。UI 只负责显示菜单和收集用户选择，不能直接改任务归属或删除任务。

**小米：** 设置页判断：添加网页、分组管理、隐藏 / 显示任务、登录清理都属于业务操作，不适合继续堆在设置页。本轮移除设置页中的网页、工作区分组和登录状态区块，只保留关闭行为和关于信息。

**小米：** 删除判断：删除分组不能删除任务，所以 TaskManager 删除分组时把组内任务回收到默认分组。默认分组必须始终存在且不可删除。

**小米：** 删除任务判断：内置任务来自默认 seed，直接从列表移除会在下次启动时被自动补回。因此内置任务删除需要记录 `deleted` 状态，自定义任务才直接从数组移除。

**小米：** WebView 判断：删除任务是唯一会影响当前 WebView 展示的管理操作。如果删除当前任务且还有下一个任务，就加载下一个；如果任务删空，则只把单例 WebView 加载到 `about:blank`，不创建或销毁 WebView。

### 2026-06-27：工作区管理系统升级

**小米：** 用户指出展开图标观感奇怪，并希望把左侧 WebView 任务分组升级为更完整的工作区管理系统，包含拖拽、右键菜单和删除分组自动回收。

**小米：** 架构判断：拖拽和右键都是侧边栏组织方式，不应该进入 WebViewManager。WebViewManager 仍然只负责单实例 WebView 加载、恢复和 reload。

**小米：** 状态判断：任务移动分组只改 `groupId`，隐藏只改 `hidden`，删除分组时把任务回收到默认分组。所有这些变化都不触发 WebView 销毁，也不清理登录状态。

**小米：** 兼容判断：用户给出的目标结构里有 `group` 和 `visible` 字段，因此在现有 `groupId` / `hidden` 基础上补充别名字段，避免后续演进时数据模型割裂。

**小米：** 交互判断：右键菜单放在 renderer 里自绘，避免把主进程系统菜单牵进来。分组右键负责折叠和删除，任务右键负责打开、隐藏、移动和自定义网页删除。

### 2026-06-27：WebView 任务分组与折叠系统

**小米：** 用户希望左侧侧边栏不再只是平铺 AI 任务，而是能按“工作 / 开发 / 娱乐”这类工作区分组组织任务，并支持折叠。

**小米：** 架构判断：这次需求本质是“任务展示与组织状态”，不是 WebView 生命周期需求。为了避免破坏单 WebView 执行器模型，不能在折叠或隐藏时创建、销毁或暂停 WebView。

**小米：** 实施边界：WebViewManager 保持不动，分组只扩展 TaskManager 的状态模型，Controller 只负责转发 UI 操作，renderer 只负责把分组树渲染出来。

**小米：** 状态设计：分组单独持久化为 `chathub.groups.v1`，任务增加 `groupId` 和 `hidden` 字段。折叠是 group 的 `collapsed`，隐藏是 task 的 `hidden`，两者都只影响侧边栏可见性。

**小米：** 交互判断：为了不把左侧底部按钮重新堆乱，分组管理入口放在设置弹窗里。左侧只承担树状展示和任务切换，设置里负责新建分组、移动当前任务、隐藏当前任务和显示全部任务。

**小米：** 风险控制：隐藏当前任务后，当前 WebView 仍然继续显示和运行，只是左侧不显示该任务；需要用户通过“显示全部任务”恢复列表入口。这样满足“隐藏不等于销毁”的要求。

## 用途

本文件用于记录 ChatHub 在多设备协作中的“对话式开发过程”。

三层记录体系：

- `TODO.md`：要做什么。
- `DEVLOG.md`：做了什么。
- `DEVICE_LOG.md`：为什么这么做，以及讨论、分析、修复过程。

## 设备角色

- 小米：笔记本，本设备。
- 华硕：台式，另一台设备。

## 记录规则

- 必须使用对话格式记录。
- 只记录架构设计讨论、代码修改原因、重构过程对话、问题分析与修复过程。
- 不记录任务清单；任务清单写入 `TODO.md`。
- 不记录最终结果总结；正式结果写入 `DEVLOG.md`。
- 每次跨设备接手前，先阅读 `AGENTS.md`、`DEVLOG.md`、`TODO.md` 和本文件。
- 新增或修改代码时，如果涉及设计取舍或问题分析，必须同步补充本文件。

## 对话日志

### 2026-06-26：建立设备对话式开发日志系统

**小米：** 当前项目已经有 `AGENTS.md`、`DEVLOG.md`、`TODO.md`，但它们分别偏向规则、正式记录和任务清单。两台设备一起开发时，还缺少一个地方记录“为什么当时这么判断”。

**小米：** 补充判断：如果只看 `DEVLOG.md`，能知道做了什么，但不一定知道当时的讨论背景。比如为什么坚持单 WebView、为什么不恢复 portable、为什么 Release 不能覆盖旧版本，这些更像过程对话。

**小米：** 所以新增 `DEVICE_LOG.md`，不替代现有三份文档，只补上对话过程层。这样后续 Codex 接手时，可以先看规则、正式状态、任务列表，再看这里理解设计原因。

**小米：** 记录约束：日志格式必须保持对话式，避免变成另一个普通开发日志。任务仍交给 `TODO.md`，完成结果仍交给 `DEVLOG.md`。

**小米：** 当前新增本文件，不修改业务代码，也不修改 `AGENTS.md`、`DEVLOG.md`、`TODO.md`，保持现有文档结构不变。

### 2026-06-26：设置中加入关于信息与作者元数据

**小米：** 用户希望设置里有一个“关于”按钮，能查看 ChatHub 的版本、GitHub 仓库等资料，同时希望 Windows 文件属性里能看到作者“染泓如梦QAQ”。

**小米：** 分层判断：这个需求不应该破坏现有 UI → Controller → Manager 分层。设置按钮只负责触发事件，关于弹窗的打开、关闭和仓库跳转仍然交给 Controller 协调。

**小米：** 版本号直接来自 preload 暴露的 `window.aiChatHub.version`，作者和仓库地址放到 renderer 常量里。这样弹窗只展示资料，不碰 WebView、TaskManager 或登录缓存。

**小米：** 元数据判断：exe 属性这边不能只改 `package.json`，因为当前 `signAndEditExecutable` 是关闭的，真正写入 exe 资源的是 `scripts/set-exe-metadata.js`。所以需要在 rcedit 的版本资源里补 `CompanyName`、`Author`、`Authors` 和版权字段。

**小米：** Windows 详情页是否展示自定义 `Author` 字段需要实际构建后人工确认，但先写入多个字段可以提高兼容性。这个改动只影响元数据和关于弹窗，不改变业务功能。

### 2026-06-26：移除手动挂起与标记完成

**小米：** 设置里的“挂起当前任务”和“标记完成”看起来和当前任务模型重复。切换页面时已经会保存当前输入和滚动状态，并把任务视为挂起。

**小米：** 交互判断：这两个按钮继续留在设置里会让用户误以为必须手动管理任务状态，反而增加理解成本。删除 UI 入口更符合“切换即保存”的工作流。

**小米：** 但不能删除 TaskStatus 或 TaskManager 的状态能力，因为 WebView 加载、失败、切换保存仍然依赖 running / paused / finished 等状态字段。

**小米：** 实施边界：所以本次只移除设置按钮、renderer 事件绑定和 Controller 的手动操作方法。底层任务状态、保存快照和 WebView 生命周期不动，风险最小。

### 2026-06-26：按规则发布 v0.4.5

**小米：** 用户要求“发新版 Release”，而 `AGENTS.md` 已明确禁止覆盖旧 Release，所以不能复用 `v0.4.4`，必须顺延到新的 `v0.4.5`。

**小米：** 本次 Release 包含关于弹窗、作者元数据、移除手动挂起 / 标记完成入口，以及对应文档更新。版本号需要同步到 `package.json`、`package-lock.json`、`src/preload.js`、README 和 releases 说明。

**小米：** 打包必须运行完整 `npm run dist`，不能只构建 unpacked exe。生成后将 `dist\ChatHub-Setup-x64.exe` 复制到 `releases\ChatHub-Setup-x64.exe`，确保仓库内安装包副本与 Release 资产一致。

**小米：** 发布时应创建全新 `v0.4.5` tag 和 GitHub Release，并使用中英双语 Release Notes，保留旧版本可回溯。

### 2026-06-28：按规则发布 v0.5.1

**小米：** 用户要求“按照要求提交仓库和 Releases”。由于 `v0.5.0` 已经发布，按照 `AGENTS.md` 的规则不能覆盖旧 Release，只能顺延到新的 `v0.5.1`。
**小米：** 本次发布范围是柔和固定状态点、新 ChatHub 图标、左上角 / 关于弹窗品牌图标、以及对应安装包资源更新。版本迁移逻辑沿用现有机制，只清理任务草稿和临时消息，不碰登录状态。
**小米：** 发布前需要重新完整打包，复制安装包到 `releases/ChatHub-Setup-x64.exe`，再创建全新的 GitHub tag 和 Release，保持历史版本可回溯。

### 2026-06-28：WebViewManager 性能日志

**小米：** 用户希望先定位 WebView 切换卡顿来源，而不是立即优化。因此本轮只增加监控日志，不改变单 WebView 复用架构。
**小米：** 日志放在 WebViewManager 内部，因为创建、loadURL、did-finish-load 和任务切换入口都集中在这里，能直接判断是否发生重建、页面重载、网络耗时或 Chromium 恢复耗时。
**小米：** 内存信息在 renderer 侧只能低风险读取 `performance.memory`，不可用时明确输出 `unavailable`，避免为了监控额外扩大 preload / IPC 边界。

### 2026-06-28：WebView 性能日志落盘

**小米：** 用户觉得控制台日志不方便分析，希望生成本地日志文件。因此新增主进程落盘 IPC，把 renderer 侧 WebView 性能日志追加写入用户数据目录。
**小米：** 日志路径选择 `%APPDATA%\AI Chat Hub\logs\webview-performance.log`，因为这是 Electron 当前 `userData` 所在位置，和登录数据同属应用本地数据区，但只新增日志文件，不读取或清理登录状态。
**小米：** WebViewManager 仍然是唯一日志来源，主进程只负责写文件，避免把 WebView 生命周期或任务逻辑迁移到 System 层。

### 2026-06-28：排查 WebView 重复 loadURL

**小米：** 用户从日志中发现 `Reuse Existing: true` 后仍然出现 `loadURL()` 和完整加载事件，怀疑性能问题来自重复导航。
**小米：** 排查后确认：当前确实复用了同一个 WebView 对象，但 `loadTask()` 每次都会进入 `loadTaskUrl()`，旧逻辑没有比较当前 URL 和目标 URL，所以会无条件导航。
**小米：** 本轮只做最小修正：增加 `Current URL / Target URL / Need Reload` 诊断日志，并在 URL 相同的情况下跳过 `loadURL()`。跨不同站点仍然需要导航，因为单 WebView 只能同时承载一个页面实例。

### 2026-06-28：WebView 缓存池架构升级

**小米：** 用户确认单 WebView 复用仍会在跨任务切换时触发 `loadURL()`，因此要求升级为多 WebView 缓存池，用内存换切换速度。
**小米：** 实施边界定为只重构 WebView 管理层：Controller 仍然调用 `loadTask()`、`reload()`、`captureState()`，TaskManager 和 UI 结构不重写。
**小米：** WebViewManager 内部新增 `webviewPool`，每个任务第一次打开时创建 WebView，之后通过显示 / 隐藏切换。缓存命中输出 `Show Cached`，不调用 `loadURL()`。
**小米：** 需要注意池化会提高内存占用，这是预期交换。后续如果内存过高，应单独设计池容量或 LRU 回收，而不是回退到每次切换 reload。

### 2026-06-28：WebViewPool 最大常驻数量可配置

**小米：** 用户希望 WebViewPool 不无限增长，而是把最大常驻数量做成设置项，默认 4，让用户在切换速度和内存占用之间取舍。
**小米：** 实现边界仍然放在 WebViewManager：设置页只收集数值，Controller 转发，StorageManager 持久化；真正的 LRU 淘汰和日志由 WebViewManager 负责。
**小米：** 淘汰策略只移除池内 WebView，不删除 Task，也不清理 Electron session 或站点存储。这样下次点击任务时会重新创建 WebView，但登录状态仍由原持久化分区保留。

### 2026-06-28：Rolling Log 日志滚动系统

**小米：** 用户希望保留 WebView 性能日志排查能力，但不能让 `logs` 目录无限增长。因此本轮把性能日志从旧的 `webview-performance.log` 收敛到统一命名的 `webview.log`，并在主进程里增加滚动写入能力。
**小米：** 日志滚动属于系统层能力，不应该进入 WebViewPool 或 TaskManager。renderer 仍然只上报 WebView 性能事件，主进程只负责异步写入和裁剪日志文件。
**小米：** 裁剪策略选择“超过 10MB 时保留最近约 5MB”，而不是清空日志。这样既能避免磁盘持续膨胀，也能保留最近一次卡顿或加载失败附近的上下文。
**小米：** 安全边界保持很窄：只处理 ChatHub 自己 `logs` 目录下映射到的 `.log` 文件，不触碰 cookies、session、localStorage、IndexedDB，也不改变任务、分组或 WebView 缓存池状态。
**小米：** Session ID 使用本地时间生成，格式如 `[Session: 2026-06-28T21-44-13]`，方便两台设备或多次启动时直接从日志里区分是哪一次运行周期。

### 2026-06-28：NSIS 卸载流程优化

**小米：** 用户发现从安装目录运行 `uninstall.exe` 后仍残留 Electron runtime 文件，说明问题发生在安装包卸载层，不应该通过应用业务代码解决。
**小米：** 当前项目没有自定义 NSIS include，因此最小风险方案是新增 `build/installer.nsh` 并挂到 `package.json` 的 `build.nsis.include`，不改 WebView、TaskManager 或 renderer 逻辑。
**小米：** 卸载前关闭进程必须覆盖 Electron 子进程，所以使用 `taskkill /T /F /IM ChatHub.exe` 关闭进程树。这样可以避免 DLL、resources 或 `ChatHub.exe` 因占用而删不掉。
**小米：** 用户数据默认必须保留，因为登录状态和设置恢复依赖 AppData。删除用户数据只能在卸载确认框中由用户主动选择。
**小米：** 因为主进程实际把 `userData` 设置为 `%APPDATA%\AI Chat Hub`，而用户需求里也提到 `%APPDATA%\ChatHub`，所以“删除所有数据”覆盖两类路径，但保留选项完全不碰这些目录。
**小米：** 安装目录清理作为 `customUnInstall` 兜底执行，继续依赖 electron-builder 默认卸载流程，同时额外删除 `$INSTDIR` 下的 runtime 文件和目录，并对卸载器自身使用重启后删除机制。

### 2026-06-28：NSIS 卸载残留二次修复

**小米：** 用户反馈仍残留安装目录并触发 Windows 重启删除提示，说明 `/REBOOTOK` 不是合适方案。真正需要解决的是卸载期间进程和当前目录占用，而不是把删除推迟到重启。
**小米：** 因此在 Electron 主进程新增 `--quit-for-uninstall` 入口，让卸载器先启动一个第二实例通知正在运行的 ChatHub 自己退出。运行实例收到参数后销毁窗口和托盘，调用 `app.quit()`，再用 `app.exit(0)` 做 1 秒兜底。
**小米：** NSIS 侧仍保留强制兜底：如果优雅退出后仍存在 `ChatHub.exe`，再执行 `taskkill /T /F /IM ChatHub.exe` 关闭主进程、renderer、GPU、utility 等同名 Electron 子进程。
**小米：** 移除所有 `/REBOOTOK`，避免 pending file rename 和重启提示。安装目录清理使用普通 `RMDir /r "$INSTDIR"`，再启动 `%TEMP%\chathub-cleanup.cmd` 做延迟 `rmdir`。
**小米：** 烟测发现延迟脚本如果继承安装目录作为当前目录，会导致空目录删不掉。所以脚本第一步必须 `cd /d "%TEMP%"`，离开安装目录后再延迟删除。
**小米：** 最终使用独立测试目录完成静默安装、启动、卸载验证：卸载后测试目录不存在，ChatHub 进程数为 0，AppData 用户数据仍保留。

### 2026-06-28：隐藏卸载后的延迟清理窗口

**小米：** 用户确认卸载已经干净，但卸载后会短暂弹出命令提示符窗口。这个窗口来自 `%TEMP%\chathub-cleanup.cmd`，不是卸载失败，而是后台延迟清理脚本的可见控制台。
**小米：** 为了保留“卸载器退出后再删安装目录”的可靠性，同时不打扰用户，将 `.cmd` 换成 `.vbs`，通过 `wscript.exe` 执行。`wscript` 不会弹命令提示符窗口。
**小米：** VBS 仍然先切到 `%TEMP%`，等待 3 秒，再删除 `$INSTDIR` 并删除自身。也就是说只改变执行外观，不改变删除策略和用户数据保留策略。
**小米：** 重新打包后用独立测试目录验证：卸载后目录不存在、ChatHub 进程数为 0、AppData 保留、临时 VBS 自删。

### 2026-06-28：卸载确认界面改为 Wizard 风格

**小米：** 用户希望卸载确认界面像 Clash Verge 那类 Windows 安装向导，而不是工程化 MessageBox。核心是降低决策复杂度：用户只需要理解“卸载程序”和“是否删除用户数据”。
**小米：** electron-builder 的 `customUninstallPage` 插在卸载进度页之后，太晚了，不能用于决定是否删除用户数据。因此改用 `customUnWelcomePage` 替换默认卸载欢迎页，让复选框选择发生在真正卸载前。
**小米：** 页面内容只保留标题、说明、安装目录和一个复选框。不展示 Cookies、IndexedDB、GPUCache 等内部字段，因为这些信息会增加普通用户的不安全感，也不利于快速判断。
**小米：** 默认不勾选删除用户数据，延续当前安全策略：卸载程序默认只删除安装目录；登录状态、设置、任务、日志只有用户主动勾选时才删除。
**小米：** NSIS 模板不支持本轮尝试的 `MUI_HEADER_TEXT` 宏，所以改为在自定义页面正文中绘制标题和说明。按钮文字通过修改 Next 按钮为“卸载”实现。

### 2026-06-28：发布 v0.6.0

**小米：** 用户确认卸载已经干净，并要求同步仓库、版本号改为 `0.6.0`、按发布规则发布 GitHub Release。
**小米：** 本次版本重点不只是一个卸载 UI，而是包含 WebViewPool、可配置池大小、Rolling Log、NSIS 卸载清理链路、隐藏延迟清理窗口和 Wizard 风格卸载页，因此适合作为 `0.6.0` 发布。
**小米：** 发布规则要求不能覆盖旧 Release，所以创建全新 `v0.6.0` tag 和 Release，并使用中英双语 Release Notes。
**小米：** 发布前必须完整 `npm run dist`，并确认 `FileVersion` / `ProductVersion` 都是 `0.6.0`，再复制安装包到 `releases/ChatHub-Setup-x64.exe`。
**小米：** 验证仍要覆盖卸载链路：安装、启动、卸载后安装目录不存在，ChatHub 进程数为 0，AppData 保留，临时清理脚本自删。

### 2026-07-03：侧边栏折叠窄栏

**小米：** 用户提出侧边栏是否可以收起来。这个需求属于界面空间优化，不是新增业务功能，符合“后续不加复杂功能，只做打磨”的方向。
**小米：** 实现边界要很窄：只折叠 UI，不改变 WebViewPool、TaskManager、分组、任务状态或登录策略。折叠只是隐藏文字和收窄网格，不销毁任何 WebView。
**小米：** 折叠状态保存为 `chathub.uiSettings.v1.sidebarCollapsed`，和性能设置、任务数据分开，避免把 UI 偏好混入任务模型。
**小米：** 窄栏仍保留设置入口，使用齿轮符号表示。这样用户不会因为折叠侧边栏而找不到设置。
**小米：** 构建时遇到 `dist\ChatHub.exe` 被残留进程锁住，关闭运行中的 ChatHub 进程后 `npm run dist:dir` 通过。

### 2026-07-04：发布 v0.6.5 与稳定维护期

**小米：** 用户要求版本号改为 `0.6.5`，同步 GitHub 仓库和 Release，并明确项目趋于稳定，后续不再做功能方面更新，只做 bug 修复。
**小米：** 因为用户已经明确“怕麻烦的小工具，复杂了违背初衷”，所以 README 和 Release 说明需要写清楚维护边界：不继续扩展功能，后续关注 bug、网页兼容、安装卸载和性能小问题。
**小米：** 本版包含侧边栏折叠窄栏和首字母徽标，这是体验打磨，不引入新的业务系统。发布后应进入维护模式。
**小米：** 发布仍遵守规则：创建新的 `v0.6.5` tag 和 Release，不覆盖 `v0.6.0` 或更早版本，Release Notes 使用中英双语。
