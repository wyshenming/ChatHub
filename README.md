# ChatHub

ChatHub is a Windows desktop workspace for AI chat websites. It wraps ChatGPT,
Gemini, DeepSeek, and custom web pages in an Electron/WebView shell so they can
be used from one app window.

## Features

- Built-in entries for ChatGPT, Gemini, and DeepSeek
- Add custom AI web pages from the settings panel
- Single reusable WebView runtime for lower memory overhead
- Task state management for active, paused, and finished tasks
- Local login/session storage through Electron's persistent partition
- Optional login-state clearing per task or for all tasks
- Configurable close behavior with system tray support
- Windows x64 build target

## Download

Download the latest Windows installer from the GitHub Releases page.

The current installer artifact is:

```text
ChatHub-Setup-x64.exe
```

## Development

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm start
```

Build the x64 Windows app and installer:

```bash
npm run dist
```

Build only the unpacked x64 app:

```bash
npm run dist:dir
```

## Architecture

The renderer layer is split by responsibility:

- `renderer.js`: UI adapter, DOM rendering, and event binding
- `controller.js`: UI-to-business orchestration
- `task-manager.js`: task and session state
- `webview-manager.js`: WebView lifecycle and page loading
- `storage-manager.js`: local storage and Electron IPC persistence
- `constants.js`: shared constants and default tasks
- `utils.js`: URL and status helpers

## Notes

ChatHub stores website login state locally in the Electron user data directory.
The installer does not include personal account cookies or login credentials.
