# ChatHub 项目交接说明

## 项目简介

ChatHub 是一个基于 Electron + WebView 的 Windows 桌面应用，用一个窗口整合 ChatGPT、Gemini、DeepSeek 以及用户自定义 AI 网页。登录状态保存在 Electron 持久化分区 `persist:chathub-runtime` 和用户数据目录中，安装包不应携带个人账号信息。

## 当前重构目标

当前目标是做“最小风险分层重构”，解决 UI / WebView / Task / System 混杂的问题。现有 renderer 已拆为 UI Adapter、Controller、TaskManager、WebViewManager、StorageManager 等模块，后续只能继续小步整理职责，不能重写。

## 强制规则

- 只允许在当前项目目录 `D:\codex\ChatHub` 内修改。
- 禁止修改旧的原始 ChatHub 目录或任何本地备份目录；当前用户已删除本地备份，以 GitHub 为备份来源。
- 禁止重写项目，禁止删除现有功能。
- 只做最小风险分层重构，保持 UI 行为和 WebView 登录状态。
- 修改前必须先阅读现有目录结构、`package.json`、`README.md`、`src/main.js`、`src/preload.js`、`src/renderer/*`。
- 每次修改后必须说明改了哪些文件、如何验证。

## 项目运行方式

实际命令来自 `package.json`：

```bash
npm install
npm start
```

`npm start` 使用 `electron .` 启动开发版。台式机接手后需要重新验证。

## 构建 / 打包方式

```bash
npm run dist:dir
npm run dist
```

`dist:dir` 构建 x64 unpacked 应用并复制完整 Electron runtime 到 `dist/`。`dist` 构建 x64 unpacked 应用和 NSIS 安装包 `ChatHub-Setup-x64.exe`。台式机上需要重新验证。

## 验收标准

- 应用能启动，主窗口不闪退。
- ChatGPT / Gemini / DeepSeek / 自定义网页 WebView 功能不丢。
- 登录状态不被无意清理。
- 主进程、preload、renderer / WebView 职责边界更清楚。
- 打包后 `dist\ChatHub.exe` 可直接运行；安装包可安装，若失败必须记录问题。

## 后续 Codex 工作方式

接手时先读 `AGENTS.md`、`DEVLOG.md`、`TODO.md`，先总结理解，不要上来就改代码。每次只做小步修改、小步验证。完成任务后同步更新 `DEVLOG.md` 和 `TODO.md`。
