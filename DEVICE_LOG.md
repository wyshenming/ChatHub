# DEVICE_LOG

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
