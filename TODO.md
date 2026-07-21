# TODO

## v1.2.7 发布

- 已完成：应用与文档版本统一升级到 `1.2.7`。
- 已完成：新增 v1.2.7 中英双语维护版说明。
- 已完成：完整构建 x64 unpacked 应用与 NSIS 安装包，版本、架构、退出烟测和哈希校验通过。
- 已完成：安装包副本已更新，SHA256 为 `7BDDF72121A6348126BF84D93465AE96ADE5AA0D737C84F0E15B06206B7493CC`。
- 已完成：提交并推送 v1.2.7 代码，创建全新 annotated tag / GitHub Release 并上传安装包。
- 已完成：线上 Release 资产大小和 SHA256 与本地构建产物一致。

## 分屏加载状态与弹窗层级

- 已完成：右侧分屏 WebView 的加载、就绪和失败状态可以正常更新对应工具栏。
- 已完成：打开设置、添加网页、关于和文本输入等模态页面时隐藏分屏中线。
- 已完成：自动恢复最多重建 1 次，初始化 `about:blank` 不再错误清零计数，持续网络异常时停止无休止重试。
- 已完成：刷新按钮增加短暂旋转反馈并立即显示“正在刷新”，反馈期间禁用按钮以防连续点击。
- 已完成：删除分屏一侧后保持 TaskManager、Controller 与 WebViewManager 的主任务状态一致，首次重新拖入即可正常分屏。
- 待验证：右侧页面加载完成、失败及刷新后不再持续显示“正在加载”。
- 待验证：所有模态页面打开时中线不可见，关闭后恢复且分屏比例不变。
- 待验证：删除左侧或右侧分屏任务后，拖入任意其他任务一次即可恢复分屏显示。

## 依赖安全升级

- 已完成：在 `DEPENDENCY_SECURITY.md` 建立 2026-07-21 审计基线，记录 7 个高危、1 个严重依赖告警及实际影响。
- 已完成：在 `README.md` 增加中英双语依赖安全状态说明。
- 当前决定：个人自用和可信构建来源场景下继续使用稳定版，不执行 `npm audit fix --force`。
- 待处理：有合适时机时创建独立升级分支，升级 Electron 与 electron-builder。
- 待验证：升级分支必须完整验证 WebView、登录状态、OAuth、分屏、单实例、托盘、NSIS 安装、覆盖升级和卸载流程。

## v1.2.6 发布

- 已完成：应用与文档版本统一升级到 `1.2.6`。
- 已完成：新增 v1.2.6 中英双语维护版说明。
- 已完成：`npm run dist` 完整打包通过，两个应用 EXE 元数据版本均为 `1.2.6`。
- 已完成：安装包副本已更新，SHA256 已记录且与 GitHub Release 资产一致。
- 已完成：提交并推送 v1.2.6 代码。
- 已完成：创建全新 tag / GitHub Release `v1.2.6` 并上传安装包。

## 分屏比例拖动调整

- 已完成：分屏默认保持 50% / 50%。
- 已完成：增加左右页面中间的可拖动分隔条，实时调整两侧宽度。
- 已完成：任一侧比例限制为最小 25%、最大 75%。
- 已完成：拖动期间避免 WebView 抢占指针事件，并补充键盘微调能力。
- 已完成：`node --check`、静态接线检查、`git diff --check`、`npm run dist:dir` 和无界面启动 / 退出烟测通过。
- 待人工验证：实际拖动中线到两个极限，确认页面显示、点击和登录状态不受影响。

## v1.2.5 发布

- 已完成：应用与文档版本统一升级到 `1.2.5`。
- 已完成：新增 v1.2.5 中英双语维护版说明。
- 已完成：修复发布前审查发现的站内导航恢复、恢复次数重置和 OAuth hash 脱敏问题。
- 已完成：`npm run dist` 完整打包通过，EXE 元数据版本为 `1.2.5`。
- 已完成：无界面启动 / 退出烟测通过，安装包 SHA256 已记录。
- 已完成：提交并推送 v1.2.5 代码。
- 已完成：创建新 tag / GitHub Release `v1.2.5` 并上传安装包。

## 网页标签拖拽分屏

- 已撤回：网页分页标签拖出后创建分屏的功能已从代码中移除。
- 已保留：侧边栏任务拖拽分屏和左右页面互换不受影响。
- 暂不实现：等待后续重新确认交互方案后再考虑。

## 安装图标小尺寸

- 已完成：确认 PNG 原图没有缺损，问题来自 ICO 缺少 Windows 高 DPI 常用尺寸。
- 已完成：补齐 16 至 256 像素的多尺寸 ICO，并在打包前自动生成。
- 待人工验证：在当前 Windows 缩放比例下运行新安装包，确认安装向导右上角图标完整。

## WebView 白屏卡加载恢复

- 已完成：Firebase `signInViaPopup` 登录处理页不再被转成 ChatHub 标签页，改为受限子窗口，保留 OAuth opener 会话。
- 已完成：Firebase / Google 重定向登录期间保留原 WebView，禁止自动重建导致 `sessionStorage` 回调状态丢失。
- 已完成：认证保护范围限定为真实回调 / 授权 URL，普通登录入口可正常从白屏恢复。
- 已完成：诊断日志脱敏 OAuth URL 的一次性回调参数。
- 已完成：为加载超时、渲染进程异常和卡住时的手动刷新增加 WebView 重建恢复；自动恢复最多尝试一次，避免循环重建。
- 已完成：重建只作用于对应 WebView，保留任务、页面标签、缩放与登录持久化数据。
- 待人工验证：自定义网页和内置网页出现白屏后，等待约 30 秒或点击刷新，确认不再无限显示“正在加载”。
- 待人工验证：恢复后确认网站登录状态、分屏和标签页状态正常。

## 2026-07-16 构建复核

- 已完成：确认本地 `main` 与 `origin/main` 一致，当前提交为 `b53cb18`（v1.2.2）。
- 已完成：重新运行 `npm run dist`，生成 x64 NSIS 安装包 `dist/ChatHub-Setup-x64.exe`。
- 待人工验证：如需实际安装，使用本次生成的安装包完成安装向导并启动应用。

## 台式机接手后的第一步

1. 克隆或拉取最新仓库：

```bash
git clone https://github.com/wyshenming/ChatHub.git
cd ChatHub
```

如果已存在本地仓库，执行：

```bash
git pull
git status -sb
```

2. 先阅读：

- `AGENTS.md`
- `DEVLOG.md`
- `TODO.md`
- `README.md`

先总结理解，不要立即修改代码。

## 重新安装依赖

```bash
npm install
```

如出现 Electron 下载问题，检查代理环境和 `ELECTRON_MIRROR`。不要提交 `node_modules/`。

## 重新验证运行命令

```bash
npm start
```

需要检查：

- 主窗口能打开。
- ChatGPT / Gemini / DeepSeek 能加载。
- 设置弹窗可打开。
- 自定义网页添加可用。
- 关闭窗口行为和托盘菜单可用。

## 需要检查的核心文件

- `package.json`
- `src/main.js`
- `src/preload.js`
- `src/renderer/renderer.js`
- `src/renderer/controller.js`
- `src/renderer/task-manager.js`
- `src/renderer/webview-manager.js`
- `src/renderer/storage-manager.js`
- `scripts/copy-x64-app-exe.js`
- `scripts/set-exe-metadata.js`

## 最近交互验证

- 待人工验证：添加网页和修改网页弹窗在点击应用其他区域时保持打开，仅可通过右上角 `×`、取消或提交操作结束。

## 打包与 exe 排查任务

1. 运行：

```bash
npm run dist:dir
```

当前 E 盘环境已完成：`dist\ChatHub.exe` 已生成并可启动，PE 头确认为 x64。

2. 验证：

- `dist\ChatHub.exe` 可直接运行。
- `dist\ffmpeg.dll`、`dist\resources`、`dist\locales` 存在。
- 任务管理器不显示 `ChatHub.exe (32 位)`。

3. 运行完整打包：

```bash
npm run dist
```

当前 E 盘环境已完成：新的 `releases\ChatHub-Setup-x64.exe` 已由 `dist\ChatHub-Setup-x64.exe` 覆盖更新。

4. 验证：

- 生成 `dist\ChatHub-Setup-x64.exe`。
- 安装后应用可启动。
- 安装后的 WebView 登录状态策略符合预期。

5. portable / 免安装版本：当前没有正式 portable target。不要贸然恢复旧 portable 配置，除非明确验证 NSIS 完整性和图标资源问题。

## 后续重构任务

- 已完成：在主进程加入 `app.requestSingleInstanceLock()`，防止重复打开时创建第二个窗口 / 应用实例。
- 已完成：将“刷新当前页”和“删除自定义网页”移动到顶部状态区，便于当前网页直接操作。
- 已完成：在设置中新增“关于 ChatHub”弹窗，并为 exe 版本资源写入作者信息。
- 已完成：从设置弹窗移除“挂起当前任务”和“标记完成”，保留切换任务自动挂起机制。
- 已完成：顺延版本到 `v0.4.5`，完成完整 `npm run dist` 打包并更新 `releases\ChatHub-Setup-x64.exe`。
- 已完成：新增 WebView 任务分组与折叠系统，支持自定义分组、折叠、移动当前任务、隐藏 / 显示任务。
- 已完成：升级工作区管理系统，支持任务拖拽到分组、分组拖拽排序、右键菜单、删除分组自动回收任务。
- 已完成：按 Windows 风格重构左侧右键操作，设置页移除业务级任务 / 分组管理入口。
- 已完成：任务右键新增“清理缓存（保留登录状态）”，仅调用 session `clearCache()`。
- 已完成：版本升级到 `0.5.0`，启动时版本变化会清理任务草稿和临时消息，不清登录状态。
- 已完成：左侧任务状态点改为基于任务名称 hash 的柔和固定 HSL 色。
- 已完成：替换应用图标、托盘 / 窗口图标资源和左上角 / 关于弹窗品牌图标。
- 验证分组折叠和任务隐藏不会触发 WebView 销毁、登录状态清理或多 WebView 常驻。
- 验证右键菜单和拖拽分组时不会影响当前 WebView 运行状态。
- 验证空白区域 / 任务 / 分组三层右键菜单，以及删除任务、重命名、删除分组自动回收。
- 修复 `src/main.js` 中托盘菜单和关闭确认弹窗中文乱码。
- 继续保持 UI → Controller → Manager 的调用方向。
- 可考虑给 Controller / Manager 增加轻量单元测试，但不要为了测试重写结构。
- 梳理 GitHub Release 流程：每次发布必须创建新版本 tag 和新 Release，禁止覆盖旧 Release；Release Notes 必须包含中文说明和 English Description。

## 禁止重复做的事情

- 不要重新创建本地备份目录。
- 不要清理 Electron 用户数据或登录缓存。
- 不要把 `node_modules/`、完整 `dist/` 提交到仓库。
- 不要把项目重写成新框架。
- 不要把多个 WebView 改回常驻模式。

## 维护要求

每完成一个任务后，更新：

- `DEVLOG.md`：记录做了什么、验证结果和问题。
- `TODO.md`：勾掉或调整下一步任务。

## v0.5.1 发布收尾

- 已完成：顺延版本到 `0.5.1`，用于发布图标替换和柔和状态点更新，不覆盖 `v0.5.0` Release。
- 待验证：完整 `npm run dist` 后确认 `dist/ChatHub.exe` 可启动，`releases/ChatHub-Setup-x64.exe` 与 Release 资产一致。
- 待完成：创建 GitHub tag / Release `v0.5.1`，Release Notes 必须包含中文说明和 English Description。

### v0.5.1 验证结果

- 已完成：`npm run dist` 完整打包通过。
- 已完成：`dist/ChatHub.exe` 显示版本 `0.5.1`，短暂启动验证通过。
- 已完成：`releases/ChatHub-Setup-x64.exe` 已更新，SHA256 为 `EF27FCCF93780BBFB7B059C18050D83CC79BEE1491E1082FD34E8BA7752410DC`。

## WebViewManager 性能日志

- 已完成：新增 WebView 创建 / 销毁 / 切换 / loadURL / did-finish-load / 数量 / 内存日志。
- 待验证：通过开发者工具或控制台观察真实切换日志，判断卡顿来自 WebView 重建、页面重载、网络请求还是 Chromium 恢复。
- 禁止：本阶段不要基于日志直接做优化，先收集数据。

### 验证结果

- 已完成：`node --check` 通过。
- 已完成：`npm run dist:dir` 通过。
- 已完成：短暂启动 `dist/ChatHub.exe` 验证进程正常出现。

## WebView 性能日志落盘

- 已完成：WebView 性能日志写入 `%APPDATA%\AI Chat Hub\logs\webview-performance.log`。
- 已完成：日志仍保留 Console 输出，便于开发者工具实时观察。
- 已完成：短暂启动 `dist/ChatHub.exe` 后确认日志文件生成并写入。
- 后续分析：切换 ChatGPT / Gemini / DeepSeek 后查看日志里的 `Switch Cost`、`loadURL Cost`、`did-finish-load Cost`、`WebView Count` 和 `Memory`。

## WebView 重复 loadURL 排查

- 已完成：确认当前 `Reuse Existing: true` 是复用 WebView 对象，不是复用每个任务的页面实例。
- 已完成：确认旧逻辑在任务切换时无条件调用 `loadURL()`。
- 已完成：新增 `Current URL`、`Target URL`、`Need Reload` 日志。
- 已完成：当前 URL 与目标 URL 相同时跳过 `loadURL()`，避免同 URL 重复导航。
- 后续分析：如果跨 ChatGPT / Gemini / DeepSeek 切换仍然 `Need Reload: true`，原因是单 WebView 当前只能承载一个页面实例；要做到跨站点无 reload，需要另行设计页面实例缓存，不在本轮改动范围内。

## WebView 缓存池验证任务

- 已完成：`WebViewManager` 升级为 `webviewPool = Map<TaskId, WebViewRecord>` 缓存池。
- 已完成：任务切换改为显示 / 隐藏 WebView，缓存命中不再 `loadURL()`。
- 已完成：删除任务时释放对应 WebView 池记录。
- 已完成：构建和短启动验证通过。
- 待人工验证：真实点击 ChatGPT / Gemini / DeepSeek 多轮切换，确认第二次切回已有任务时日志出现 `Action: Show Cached`，且没有新的 `Action: loadURL`。
- 待人工验证：观察多任务打开后的内存增长是否可接受；缓存池会用内存换切换速度。
- 后续可选：如果内存占用过高，再设计池容量上限 / LRU 回收，不要本轮继续扩大改动。

## WebViewPool 最大常驻数量设置

- 已完成：设置页新增“性能”区域和 `maxWebViewPoolSize` 选项。
- 已完成：默认值为 4，可选 2 / 3 / 4 / 5 / 6。
- 已完成：设置修改后立即应用，并触发 LRU 淘汰检查。
- 已完成：淘汰只释放 WebView，不删除任务，不清理登录 / 站点存储。
- 已完成：新增 `[WebViewPool] Action: Evict` 日志。
- 待人工验证：设置为 2 后连续打开 3 个以上任务，确认日志出现 Evict，且当前 WebView 不被淘汰。

## Rolling Log 日志滚动系统

- 已完成：WebView 性能日志写入 `%APPDATA%\AI Chat Hub\logs\webview.log`。
- 已完成：单个日志文件超过 10MB 后保留最近约 5MB 内容并删除最旧内容。
- 已完成：每次启动写入本地时间 Session ID，便于区分不同启动周期。
- 已完成：日志写入失败只 warning，不影响应用启动和 WebView 运行。
- 已验证：11MB 测试日志启动后裁剪到约 5.25MB。
- 待人工验证：长时间使用后确认 `webview.log` 不会持续增长到 10MB 以上。
- 待人工验证：确认旧的 `webview-performance.log` 不再产生新内容，后续如需清理旧日志只能手动处理，不要碰登录数据目录。

## NSIS 卸载流程

- 已完成：新增 `build/installer.nsh`，接入 electron-builder 的 `nsis.include`。
- 已完成：卸载前自动关闭 `ChatHub.exe` 进程树，覆盖主进程和 Electron 子进程。
- 已完成：卸载默认保留用户数据。
- 已完成：非静默卸载增加“是否同时删除用户数据？”确认框。
- 已完成：选择删除时清理 `%APPDATA%` / `%LOCALAPPDATA%` 下的 `AI Chat Hub`、`ChatHub`、`chathub` 数据目录。
- 已完成：卸载后兜底删除 `$INSTDIR` 下的程序文件、`resources/`、`locales/` 和 Electron runtime 文件。
- 已完成：`npm run dist` 打包通过，`releases/ChatHub-Setup-x64.exe` 已更新。
- 待人工验证：安装到 `D:\ChatHub` 后运行 `uninstall.exe`，选择保留用户数据，确认安装目录无程序文件残留。
- 待人工验证：确认 `%APPDATA%\AI Chat Hub` 仍保留，重新安装后登录状态和设置恢复。
- 待人工验证：需要清空环境时再测试“删除所有数据”，测试前先确认账号登录状态不需要保留。

### 二次修复验证

- 已完成：新增 `--quit-for-uninstall`，让运行中的 ChatHub 在卸载前通过 Electron 自身执行 `app.quit()` 和 `app.exit(0)`。
- 已完成：移除所有 `/REBOOTOK`，避免触发 Windows 重启删除提示。
- 已完成：使用 `%TEMP%\chathub-cleanup.vbs` 后台延迟清理安装目录，脚本先切换到 `%TEMP%` 再删除 `$INSTDIR`。
- 已验证：`D:\codex\ChatHub_UninstallSmoke` 静默安装 / 启动 / 静默卸载后测试目录不存在。
- 已验证：卸载后 `ChatHub` 进程数为 0，`%APPDATA%\AI Chat Hub` 仍保留。
- 已验证：`%TEMP%\chathub-cleanup.vbs` 会自删。
- 待人工验证：用新安装包安装到真实 `D:\ChatHub`，从安装目录运行 `Uninstall ChatHub.exe`，确认不再出现重启删除提示。
- 待人工验证：确认卸载结束后不再弹出命令提示符窗口。

### 卸载向导页

- 已完成：将删除用户数据确认从 MessageBox 改为 Windows Wizard 风格卸载页。
- 已完成：页面展示标题、说明、安装目录和唯一关键复选框。
- 已完成：默认不勾选“删除用户数据”。
- 已完成：不再展示 Cookies / IndexedDB / GPUCache 等技术字段。
- 已完成：按钮文字改为 `卸载` / `取消`。
- 已验证：`npm run dist` 打包通过。
- 已验证：静默安装 / 启动 / 卸载烟测仍能删除测试安装目录并保留 AppData。
- 待人工验证：非静默卸载时检查页面视觉和交互是否符合预期。
- 已完成：根据截图将“删除用户数据”复选框从 `140u` 上移到 `112u`，避免被底部按钮区遮挡。
- 待人工验证：确认复选框已经显示在安装目录下方。

## v0.6.0 发布

- 已完成：版本号升级到 `0.6.0`。
- 已完成：`package.json`、`package-lock.json`、`src/preload.js`、`releases/README.md` 同步版本。
- 已完成：`npm run dist` 完整打包通过。
- 已完成：`dist/ChatHub.exe` 元数据显示 `FileVersion=0.6.0`、`ProductVersion=0.6.0`。
- 已完成：静默安装 / 启动 / 卸载烟测通过。
- 已完成：`releases/ChatHub-Setup-x64.exe` 已更新。
- 已完成：提交 GitHub 仓库。
- 已完成：创建 tag `v0.6.0`。
- 已完成：创建 GitHub Release `v0.6.0` 并上传安装包。

## 侧边栏折叠窄栏

- 已完成：新增侧边栏折叠 / 展开按钮。
- 已完成：折叠后只保留图标、任务首字母徽标、分组指示和设置齿轮。
- 已完成：折叠状态保存到 `chathub.uiSettings.v1`。
- 已完成：未修改 WebViewPool、TaskManager、任务分组和登录状态逻辑。
- 已验证：`node --check` 和 `npm run dist:dir` 通过。
- 待人工验证：折叠后任务切换、设置入口和重启恢复状态是否符合预期。
- 已完成：窄栏任务入口从纯圆点改为任务名称首字母 / 首字符，提升辨识度。

## v0.6.5 发布

- 已完成：版本号升级到 `0.6.5`。
- 已完成：README 和 releases README 增加稳定维护期说明。
- 已完成：侧边栏折叠窄栏作为最后的体验打磨纳入本版。
- 已完成：完整打包并验证。
- 已完成：`dist/ChatHub.exe` 元数据显示 `FileVersion=0.6.5`、`ProductVersion=0.6.5`。
- 已完成：静默安装 / 启动 / 卸载烟测通过。
- 待完成：提交 GitHub 仓库。
- 待完成：创建 tag `v0.6.5`。
- 待完成：创建 GitHub Release `v0.6.5` 并上传安装包。

## 维护期待验证：右键修改网页

- 待验证：右键已有任务，菜单中应显示“修改网页”，不再显示“重命名任务”。
- 待验证：修改任务名称后，左侧列表、当前标题和持久化任务数据同步更新。
- 待验证：修改任务链接后，当前任务应加载新链接；其他任务和登录状态不应受影响。
- 待验证：重复名称、空名称、非法链接仍然显示表单错误。
- 禁止扩展：不要把该入口继续扩展成复杂任务编辑器，只保留名称和链接修改。

## v0.6.6 发布

- 已完成：版本号升级到 `0.6.6`。
- 已完成：完整打包并更新 `releases/ChatHub-Setup-x64.exe`。
- 已完成：提交 GitHub 仓库。
- 已完成：创建 tag `v0.6.6`。
- 已完成：创建 GitHub Release `v0.6.6` 并上传安装包。

## 输入草稿重复恢复 Bug

- 已完成：分析原因，确认来自 ChatHub 自己的 `inputDraft` 保存 / 恢复机制和本机持久化用户数据目录。
- 已完成：停止保存网页输入框草稿。
- 已完成：停止恢复网页输入框草稿。
- 已完成：新增一次性迁移，清理旧任务中的 `inputDraft`、`messages`、`scroll`。
- 已确认：SillyTavern 自身的 `Restore User Input` 设置也会恢复未发送输入，关闭该设置后可停止酒馆侧草稿恢复。
- 待验证：启动 v0.7.0 应用确认 ChatHub 不再主动恢复旧输入框文字。
- 待验证：确认 cookies / 登录状态没有被清理。
- 禁止回退：不要重新启用自动填写网页输入框草稿，除非后续有明确设置项和默认关闭策略。

## v0.7.0 发布

- 已完成：版本号升级到 `0.7.0`。
- 已完成：完整打包并更新 `releases/ChatHub-Setup-x64.exe`。
- 已完成：提交 GitHub 仓库。
- 已完成：创建 tag `v0.7.0`。
- 已完成：创建 GitHub Release `v0.7.0` 并上传安装包。

## 当前页面缩放控件

- 已完成：顶部刷新按钮旁新增放大镜缩放入口。
- 已完成：放大镜入口替换为用户提供的 SVG 图标。
- 已完成：缩放气泡显示当前比例，并提供 `-`、`+`、`重置`。
- 已完成：按任务保存缩放比例。
- 待验证：确认所有缩放档位都能按顺序切换。
- 待验证：确认切换任务后能恢复各自缩放比例。
- 待验证：确认缩放不影响登录状态和 WebViewPool。
- 暂不实现：移动端模式 / User-Agent 切换，避免引入网页兼容风险。

## 界面图标资产替换

- 已完成：将用户下载的图标整理到 `src/renderer/assets/icons/`。
- 已完成：替换侧边栏折叠 / 展开、分组折叠 / 展开、设置、刷新、缩放、加减、重置、关闭、关于、GitHub 等当前可见入口。
- 待验证：确认所有 SVG 在开发版和打包版中都能正常加载。
- 待验证：确认窄栏状态下图标居中，按钮不挤压、不变形。
- 暂不实现：保存、返回等尚未出现在界面中的图标，等实际按钮出现后再接入。

## v1.0.0 正式版发布

- 已完成：版本号升级到 `1.0.0`。
- 已完成：README 与 releases README 改为正式版说明。
- 已完成：完整打包并更新 `releases/ChatHub-Setup-x64.exe`。
- 已完成：`dist\ChatHub.exe` 元数据显示 `FileVersion=1.0.0`、`ProductVersion=1.0.0`。
- 已完成：新安装包 SHA256 为 `4357252B4B6779EBE4086E9486F3F38F1AA526B5CA718065BC2289FA52A87E0D`。
- 已完成：提交 GitHub 仓库。
- 已完成：创建 tag `v1.0.0`。
- 已完成：创建 GitHub Release `v1.0.0` 并上传安装包。
- 发布后原则：项目进入稳定维护期，不再默认新增功能，只做 bug 修复、网页兼容和必要的安装 / 性能维护。

## 分屏对照模式

- 已完成：任务右键新增“在右侧打开”。
- 已完成：主工作区支持左右两栏同时显示两个 WebView。
- 已完成：分屏时可分别关闭左侧或右侧，关闭后保留另一侧页面为单栏。
- 已完成：WebViewPool LRU 不淘汰正在显示的左右两个 WebView。
- 已完成：支持拖动左侧任务到工作区左 / 右半边，直接打开主页面或右侧分屏。
- 已完成：分屏时拖动左右任务到对侧可调换位置，保留页面实例不重新加载。
- 已完成：拖动任务时显示覆盖在 WebView 上方的左右投放层，提升拖拽分屏触发率。
- 已完成：刷新、缩放、关闭按钮移动到页面面板右上角。
- 已完成：单页不显示关闭按钮；分屏时左右页面各自显示关闭按钮。
- 已完成：右侧页面刷新 / 缩放直接作用于右侧任务。
- 已完成：页面面板顶部预留工具条空间，避免按钮遮挡网页。
- 已完成：顶部当前任务区域缩小，为页面内容留出更多空间。
- 已完成：页面工具条改为矩形头部条，分屏时左右两个页面卡片边界更清楚。
- 已完成：分屏时可拖动页面工具栏到另一侧工具栏，直接交换左右页面位置。
- 待验证：分屏打开 ChatGPT / Gemini 等页面时无需重新登录。
- 待验证：关闭左侧 / 右侧后任务标题、状态、缩放控件恢复正确。
- 待验证：拖放分屏的左 / 右半边提示和实际落点一致。
- 待验证：页面内工具条不遮挡主要输入区域，且在单页 / 分屏下位置一致。
- 待验证：单页状态下关闭按钮完全隐藏。
- 待验证：分屏时两个页面看起来是两个独立矩形，不出现红色示意边框。
- 待验证：工具栏拖拽互换不会影响按钮点击和缩放弹窗。
- 待验证：打包版中分屏布局与窗口缩放表现正常。

## 侧边栏分组图标方向

- 已完成：交换分组展开 / 收起图标映射。
- 已完成：折叠状态显示右向图标。
- 已完成：展开状态显示下向图标。
- 待验证：运行打包版确认图标方向正常。

## v1.0.1 维护版

- 已完成：版本号升级到 `1.0.1`。
- 已完成：README 与 releases README 增加 v1.0.1 维护版说明。
- 已完成：完整打包并确认 `dist\ChatHub.exe` 元数据版本为 `1.0.1`。
- 已完成：更新 `releases/ChatHub-Setup-x64.exe` 安装包副本。
- 已完成：提交并推送 GitHub 仓库。
- 暂不处理：GitHub Release 发布，除非用户明确要求同步发布 release。

## v1.0.2 覆盖安装升级修复

- 已完成：分析覆盖安装只卸载不继续安装的原因。
- 已完成：升级模式下跳过自定义完整卸载清理。
- 已完成：新安装器等待旧版本延迟清理脚本结束后再释放新文件。
- 已完成：升级模式下容错旧卸载器“文件已删但返回非 0”的情况。
- 已完成：版本号升级到 `1.0.2`。
- 已完成：完整打包并确认 `dist\ChatHub.exe` 元数据版本为 `1.0.2`。
- 已完成：更新 `releases/ChatHub-Setup-x64.exe` 安装包副本。
- 待人工验证：从旧版本覆盖安装到 `1.0.2`，确认一次运行安装包即可完成升级。
- 待验证：提交 GitHub 仓库。

## 完全退出后恢复默认页面

- 已完成：启动时将任务 URL 从上次运行页面恢复到 `initialUrl`。
- 已完成：启动时清理任务临时状态 `inputDraft/messages/scroll`。
- 已完成：完全退出前清理 WebView runtime cache。
- 已确认设计：不清理 cookies / localStorage / sessionStorage / IndexedDB。
- 已完成：完整打包并更新测试安装包。
- 待验证：完全退出并重新启动后，所有任务回到默认入口。
- 待验证：登录状态保留。

## v1.1.0 发布

- 已完成：版本号升级到 `1.1.0`。
- 已完成：清理测试安装包 `dist\ChatHub-Setup-v1.0.1-test.exe`。
- 已完成：清理测试安装目录 `D:\codex\ChatHub_UpgradeSmoke`。
- 已完成：完整打包并确认 `dist\ChatHub.exe` 元数据版本为 `1.1.0`。
- 已完成：更新 `releases/ChatHub-Setup-x64.exe` 安装包副本。
- 已完成：提交并推送 GitHub 仓库。
- 待确认：是否同步创建 GitHub Release `v1.1.0`。
