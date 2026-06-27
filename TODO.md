# TODO

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
