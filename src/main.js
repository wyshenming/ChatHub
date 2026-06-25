const { app, BrowserWindow, Menu, Tray, dialog, ipcMain, session, shell } = require("electron");
const fs = require("fs");
const path = require("path");

app.setName("ChatHub");
app.setAppUserModelId("local.chathub");
app.setPath("userData", path.join(app.getPath("appData"), "AI Chat Hub"));

const defaultCloseSettings = {
  closeBehavior: "tray",
  rememberChoice: true
};

let mainWindow = null;
let tray = null;
let isQuitting = false;
let isClosePromptOpen = false;

function closeSettingsPath() {
  return path.join(app.getPath("userData"), "close-settings.json");
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

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
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

app.whenReady().then(() => {
  createTray();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && isQuitting) {
    app.quit();
  }
});
