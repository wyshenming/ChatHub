const { app, BrowserWindow, Menu, Tray, dialog, ipcMain, session, shell } = require("electron");
const fs = require("fs");
const path = require("path");

app.setName("ChatHub");
app.setAppUserModelId("local.chathub");
app.setPath("userData", path.join(app.getPath("appData"), "AI Chat Hub"));

const hasSingleInstanceLock = app.requestSingleInstanceLock();
const isQuitForUninstall = process.argv.includes("--quit-for-uninstall");

const defaultCloseSettings = {
  closeBehavior: "tray",
  rememberChoice: true
};

const maxLogFileSize = 10 * 1024 * 1024;
const retainedLogSize = 5 * 1024 * 1024;
const logSessionId = createLogSessionId();
const logWriteQueues = new Map();
const logFileNames = {
  webview: "webview.log"
};

let mainWindow = null;
let tray = null;
let isQuitting = false;
let isClosePromptOpen = false;

function quitForUninstall() {
  isQuitting = true;

  for (const window of BrowserWindow.getAllWindows()) {
    window.removeAllListeners("close");
    window.destroy();
  }

  if (tray) {
    tray.destroy();
    tray = null;
  }

  app.quit();
  setTimeout(() => app.exit(0), 1000);
}

function createLogSessionId() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join("-") + `T${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

function closeSettingsPath() {
  return path.join(app.getPath("userData"), "close-settings.json");
}

function logsDir() {
  return path.join(app.getPath("userData"), "logs");
}

function logPathFor(category) {
  const fileName = logFileNames[category];
  if (!fileName || !fileName.endsWith(".log")) {
    return null;
  }

  const baseDir = logsDir();
  const resolvedPath = path.resolve(baseDir, fileName);
  const resolvedBase = path.resolve(baseDir);
  if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
    return null;
  }

  return resolvedPath;
}

async function appendRollingLog(category, entry) {
  const message = typeof entry === "string" ? entry.trimEnd() : "";
  const logPath = logPathFor(category);
  if (!message.trim() || !logPath) {
    return { written: false, path: logPath };
  }

  const writeTask = async () => {
    await fs.promises.mkdir(path.dirname(logPath), { recursive: true });
    await fs.promises.appendFile(logPath, `[Session: ${logSessionId}]\n${message}\n\n`, "utf8");
    await rollLogIfNeeded(logPath);
    return { written: true, path: logPath };
  };

  const previousTask = logWriteQueues.get(logPath) || Promise.resolve();
  const nextTask = previousTask.then(writeTask, writeTask);
  logWriteQueues.set(
    logPath,
    nextTask.catch(() => {
      // Keep the queue alive after a failed diagnostic write.
    })
  );

  return nextTask;
}

async function rollLogIfNeeded(logPath) {
  const stats = await fs.promises.stat(logPath);
  if (stats.size <= maxLogFileSize) {
    return;
  }

  const handle = await fs.promises.open(logPath, "r");
  let buffer;
  try {
    const keepSize = Math.min(retainedLogSize, stats.size);
    buffer = Buffer.alloc(keepSize);
    await handle.read(buffer, 0, keepSize, stats.size - keepSize);
  } finally {
    await handle.close();
  }

  const retainedText = buffer.toString("utf8").replace(/^\u0000+/, "");
  const firstLineBreak = retainedText.indexOf("\n");
  const normalizedRetainedText =
    firstLineBreak >= 0 ? retainedText.slice(firstLineBreak + 1) : retainedText;

  await fs.promises.writeFile(
    logPath,
    `[Session: ${logSessionId}]\n[RollingLog] Trimmed oldest log content.\n\n${normalizedRetainedText}`,
    "utf8"
  );
}

function readCloseSettings() {
  try {
    const parsed = JSON.parse(fs.readFileSync(closeSettingsPath(), "utf8"));
    return {
      closeBehavior: ["tray", "quit", "ask"].includes(parsed.closeBehavior)
        ? parsed.closeBehavior
        : defaultCloseSettings.closeBehavior,
      rememberChoice: Boolean(parsed.rememberChoice)
    };
  } catch {
    return { ...defaultCloseSettings };
  }
}

function writeCloseSettings(settings) {
  const nextSettings = {
    closeBehavior: ["tray", "quit", "ask"].includes(settings.closeBehavior)
      ? settings.closeBehavior
      : defaultCloseSettings.closeBehavior,
    rememberChoice: Boolean(settings.rememberChoice)
  };

  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(closeSettingsPath(), JSON.stringify(nextSettings, null, 2));
  return nextSettings;
}

let closeSettings = readCloseSettings();

ipcMain.handle("append-webview-performance-log", async (_event, entry) => {
  try {
    return await appendRollingLog("webview", entry);
  } catch (error) {
    console.warn("[ChatHub] Failed to write webview log:", error);
    return { written: false, path: logPathFor("webview") };
  }
});

ipcMain.handle("clear-service-data", async (_event, targets) => {
  const normalizedTargets = (Array.isArray(targets) ? targets : [])
    .map((target) => (typeof target === "string" ? { partition: target } : target))
    .filter((target) => target && typeof target.partition === "string")
    .filter((target) => target.partition.startsWith("persist:"));

  for (const target of normalizedTargets) {
    const { partition, origin } = target;
    const targetSession = session.fromPartition(partition);

    if (typeof origin === "string" && origin.startsWith("http")) {
      await targetSession.clearStorageData({ origin });
    } else {
      await targetSession.clearStorageData();
      await targetSession.clearCache();
    }

    targetSession.flushStorageData();
  }

  return { cleared: normalizedTargets.length };
});

ipcMain.handle("clear-service-cache", async (_event, targets) => {
  const normalizedTargets = (Array.isArray(targets) ? targets : [])
    .map((target) => (typeof target === "string" ? { partition: target } : target))
    .filter((target) => target && typeof target.partition === "string")
    .filter((target) => target.partition.startsWith("persist:"));

  for (const target of normalizedTargets) {
    const targetSession = session.fromPartition(target.partition);
    await targetSession.clearCache();
  }

  return { cleared: normalizedTargets.length };
});

ipcMain.handle("get-close-settings", () => closeSettings);

ipcMain.handle("set-close-settings", (_event, settings) => {
  closeSettings = writeCloseSettings(settings || {});
  return closeSettings;
});

function showMainWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }

  focusMainWindow();
}

function focusMainWindow() {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  if (typeof mainWindow.moveTop === "function") {
    mainWindow.moveTop();
  }
  mainWindow.focus();
}

function createTray() {
  if (tray) {
    return tray;
  }

  tray = new Tray(path.join(__dirname, "..", "build", "icon.ico"));
  tray.setToolTip("ChatHub");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "打开 ChatHub",
        click: showMainWindow
      },
      {
        label: "退出应用",
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ])
  );
  tray.on("double-click", showMainWindow);
  return tray;
}

function hideToTray() {
  createTray();
  if (mainWindow) {
    mainWindow.hide();
  }
}

async function handleWindowClose(event) {
  if (isQuitting) {
    return;
  }

  const behavior = closeSettings.closeBehavior || "tray";

  if (behavior === "quit") {
    isQuitting = true;
    return;
  }

  event.preventDefault();

  if (behavior === "tray") {
    hideToTray();
    return;
  }

  if (isClosePromptOpen || !mainWindow) {
    return;
  }

  isClosePromptOpen = true;
  const result = await dialog.showMessageBox(mainWindow, {
    type: "question",
    title: "关闭 ChatHub",
    message: "你想关闭 ChatHub，还是最小化到系统托盘？",
    buttons: ["最小化到托盘", "退出应用", "取消"],
    defaultId: 0,
    cancelId: 2,
    checkboxLabel: "不再询问",
    checkboxChecked: false,
    noLink: true
  });
  isClosePromptOpen = false;

  if (result.response === 0) {
    if (result.checkboxChecked) {
      closeSettings = writeCloseSettings({ closeBehavior: "tray", rememberChoice: true });
    }
    hideToTray();
    return;
  }

  if (result.response === 1) {
    if (result.checkboxChecked) {
      closeSettings = writeCloseSettings({ closeBehavior: "quit", rememberChoice: true });
    }
    isQuitting = true;
    app.quit();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 980,
    minHeight: 640,
    title: "ChatHub",
    icon: path.join(__dirname, "..", "build", "icon.ico"),
    backgroundColor: "#f5f7fb",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  mainWindow.on("close", handleWindowClose);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

if (isQuitForUninstall && hasSingleInstanceLock) {
  app.whenReady().then(quitForUninstall);
} else if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    if (argv.includes("--quit-for-uninstall")) {
      quitForUninstall();
      return;
    }

    focusMainWindow();
  });

  app.whenReady().then(() => {
    createTray();
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && isQuitting) {
    app.quit();
  }
});
