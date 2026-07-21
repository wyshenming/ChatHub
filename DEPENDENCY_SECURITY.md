# 依赖安全记录

## 2026-07-21 npm audit 基线

### 当前结果

在 ChatHub `v1.2.6`、Node.js `v24.18.0`、npm `v11.16.0` 环境执行：

```bash
npm audit
```

报告共包含 8 个受影响依赖包：7 个高危、1 个严重。

| 依赖包 | 等级 | 当前版本 | 主要影响范围 |
| --- | --- | --- | --- |
| `electron` | 高危 | `31.7.7` | 应用运行时 |
| `electron-builder` | 高危 | `24.13.3` | 构建与打包 |
| `app-builder-lib` | 高危 | `24.13.3` | 构建与打包 |
| `dmg-builder` | 高危 | `24.13.3` | macOS 打包，当前 Windows 构建不使用 |
| `electron-builder-squirrel-windows` | 高危 | `24.13.3` | Squirrel 打包，当前 NSIS 构建不使用 |
| `brace-expansion` | 高危 | `1.1.15` / `2.1.1` | 构建时文件匹配可能被恶意输入拖慢 |
| `js-yaml` | 高危 | `4.2.0` | 构建时解析恶意 YAML 可能耗尽 CPU |
| `tar` | 严重 | `6.2.1` | 构建时处理恶意压缩包可能越界写文件或拒绝服务 |

这里的“8 个”是 8 个受影响依赖包，不等同于 8 条独立安全公告。`electron` 和 `tar` 各自聚合了多条公告。

### 对本项目的实际影响

- ChatHub 是个人自用项目，源码、依赖和构建流程由项目所有者与 Codex 共同维护，不处理第三方提交的不可信构建配置或压缩包。
- 7 个构建工具链依赖主要影响开发机打包阶段，通常不会参与 ChatHub 的日常网页运行；在当前可信构建来源下实际风险较低。
- `electron` 会进入最终应用运行时，是当前最需要长期关注的项目。旧版 Electron 在特定条件下可能被恶意网页触发崩溃、安全隔离绕过或非预期操作。
- ChatHub 当前设置了 `contextIsolation: true` 和 `nodeIntegration: false`，可以降低网页直接访问本机能力的风险。
- 应避免添加来源不明的自定义网页，并继续只从可信来源获取项目依赖。
- `npm audit --omit=dev` 会报告 0 个漏洞，因为这些包都声明在开发依赖树中；但 Electron 运行时仍会被打包进最终应用，不能据此忽略 Electron 公告。

### 当前处理决定

- 当前版本继续自用，不进行紧急强制升级。
- 不执行 `npm audit fix --force`，避免跨主版本升级破坏 WebView、登录状态、分屏、安装和卸载流程。
- 后续有合适时机时，在独立升级分支中处理 Electron 与 electron-builder，不直接在稳定分支试验。

### 后续升级分支验收范围

1. 升级 Electron 和 electron-builder，并重新执行完整 `npm audit`。
2. 验证 ChatGPT、Gemini、DeepSeek 与自定义网页加载。
3. 验证 Cookie、网页登录状态和持久化分区不丢失。
4. 验证单 WebView 复用、白屏恢复、OAuth 登录和弹窗处理。
5. 验证任务切换、网页标签、分屏及 25% 至 75% 拖动比例。
6. 验证单实例、托盘、关闭行为和清理登录状态功能。
7. 执行 `npm run dist:dir`、`npm run dist`、x64 PE 检查和启动烟测。
8. 人工验证 NSIS 安装、覆盖升级与卸载流程。

### 复查命令

```bash
npm audit
npm audit --omit=dev
npm ls electron electron-builder app-builder-lib dmg-builder electron-builder-squirrel-windows tar brace-expansion js-yaml --all
```

每次依赖升级或正式发布前，应重新执行审计，并在本文件追加新的日期基线；不要覆盖历史记录。
