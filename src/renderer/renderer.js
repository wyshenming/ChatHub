const TASKS_STORAGE_KEY = "chathub.tasks.v1";
const LEGACY_CUSTOM_SERVICES_KEY = "chathub.customServices.v1";
const RUNTIME_PARTITION = "persist:chathub-runtime";

const TaskStatus = {
  RUNNING: "running",
  PAUSED: "paused",
  FINISHED: "finished"
};

const text = {
  loading: "\u6b63\u5728\u52a0\u8f7d",
  ready: "\u5df2\u5c31\u7eea",
  paused: "\u5df2\u6302\u8d77",
  running: "\u8fd0\u884c\u4e2d",
  finished: "\u5df2\u5b8c\u6210",
  loadFailed: "\u52a0\u8f7d\u5931\u8d25",
  switching: "\u6b63\u5728\u5207\u6362",
  clearing: "\u6b63\u5728\u6e05\u7406",
  cleared: "\u5df2\u6e05\u7406",
  invalidUrl: "\u4ec5\u652f\u6301 http \u6216 https \u94fe\u63a5\u3002",
  nameRequired: "\u8bf7\u8f93\u5165\u540d\u79f0\u3002",
  duplicateName: "\u8fd9\u4e2a\u540d\u79f0\u5df2\u7ecf\u5b58\u5728\u3002",
  addFailed: "\u65e0\u6cd5\u6dfb\u52a0\u8fd9\u4e2a\u7f51\u9875\u3002",
  clearAllConfirm: "\u8981\u6e05\u7406\u6240\u6709\u4efb\u52a1\u7684\u767b\u5f55\u72b6\u6001\u548c\u7f13\u5b58\u5417\uff1f"
};

const defaultTaskSeeds = [
  {
    id: "task-chatgpt",
    title: "ChatGPT",
    url: "https://chatgpt.com/",
    color: "#10a37f",
    custom: false
  },
  {
    id: "task-gemini",
    title: "Gemini",
    url: "https://gemini.google.com/app",
    color: "#5b6ee1",
    custom: false
  },
  {
    id: "task-deepseek",
    title: "DeepSeek",
    url: "https://chat.deepseek.com/",
    color: "#2f6bff",
    custom: false
  }
];

const serviceList = document.querySelector("#service-list");
const webviewFrame = document.querySelector("#webview-frame");
const title = document.querySelector("#current-title");
const status = document.querySelector("#status");
const reloadButton = document.querySelector("#reload-current");
const openButton = document.querySelector("#open-current");
const addSiteButton = document.querySelector("#add-site");
const pauseCurrentButton = document.querySelector("#pause-current");
const finishCurrentButton = document.querySelector("#finish-current");
const clearCurrentButton = document.querySelector("#clear-current");
const clearAllButton = document.querySelector("#clear-all");
const removeCurrentButton = document.querySelector("#remove-current");
const openSettingsButton = document.querySelector("#open-settings");
const settingsModal = document.querySelector("#settings-modal");
const closeSettingsButton = document.querySelector("#close-settings");
const closeBehaviorInputs = [...document.querySelectorAll("input[name='close-behavior']")];
const addSiteModal = document.querySelector("#add-site-modal");
const addSiteForm = document.querySelector("#add-site-form");
const closeAddSiteButton = document.querySelector("#close-add-site");
const cancelAddSiteButton = document.querySelector("#cancel-add-site");
const siteNameInput = document.querySelector("#site-name");
const siteUrlInput = document.querySelector("#site-url");
const formError = document.querySelector("#form-error");

function now() {
  return new Date().toISOString();
}

function statusLabel(value) {
  return text[value] || value;
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(candidate);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(text.invalidUrl);
  }

  return url.toString();
}

function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function fallbackUrlForTask(seed) {
  const defaultSeed = defaultTaskSeeds.find((task) => task.id === seed.id);
  return defaultSeed?.url || seed.initialUrl || seed.url || "";
}

function originFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

function createTask(seed) {
  const timestamp = now();
  const candidateUrl = seed.url || seed.lastUrl || seed.initialUrl;
  const fallbackUrl = fallbackUrlForTask(seed);
  const url = isHttpUrl(candidateUrl) ? candidateUrl : fallbackUrl;

  return {
    id: seed.id,
    title: seed.title,
    url,
    initialUrl: seed.initialUrl || url,
    origin: seed.origin || originFromUrl(url),
    color: seed.color || "#172033",
    custom: Boolean(seed.custom),
    status: seed.status || TaskStatus.PAUSED,
    messages: Array.isArray(seed.messages) ? seed.messages : [],
    inputDraft: seed.inputDraft || "",
    scroll: seed.scroll || { x: 0, y: 0 },
    createdAt: seed.createdAt || timestamp,
    updatedAt: seed.updatedAt || timestamp
  };
}

function createCustomTask(name, url) {
  const id = `task-custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return createTask({
    id,
    title: name.trim(),
    url,
    color: "#172033",
    custom: true
  });
}

class TaskManager {
  constructor(storage) {
    this.storage = storage;
    this.tasks = this.loadTasks();
    this.activeTaskId = this.tasks[0]?.id;
  }

  loadTasks() {
    const saved = this.readJson(TASKS_STORAGE_KEY);

    if (Array.isArray(saved) && saved.length > 0) {
      return this.mergeDefaultTasks(saved.map((task) => createTask(task)));
    }

    const legacyCustomTasks = this.loadLegacyCustomTasks();
    return [...defaultTaskSeeds.map((seed) => createTask(seed)), ...legacyCustomTasks];
  }

  loadLegacyCustomTasks() {
    const legacyServices = this.readJson(LEGACY_CUSTOM_SERVICES_KEY);
    if (!Array.isArray(legacyServices)) {
      return [];
    }

    return legacyServices
      .filter((service) => service && service.title && service.url)
      .map((service) =>
        createTask({
          id: service.id?.startsWith("task-") ? service.id : `task-${service.id || Date.now()}`,
          title: service.title,
          url: service.url,
          color: service.color,
          custom: true
        })
      );
  }

  mergeDefaultTasks(savedTasks) {
    const byId = new Map(savedTasks.map((task) => [task.id, task]));

    defaultTaskSeeds.forEach((seed) => {
      if (!byId.has(seed.id)) {
        byId.set(seed.id, createTask(seed));
      }
    });

    return [...byId.values()];
  }

  readJson(key) {
    try {
      return JSON.parse(this.storage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  persist() {
    this.storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
  }

  all() {
    return this.tasks;
  }

  active() {
    return this.get(this.activeTaskId);
  }

  get(taskId) {
    return this.tasks.find((task) => task.id === taskId);
  }

  setActive(taskId) {
    if (this.get(taskId)) {
      this.activeTaskId = taskId;
    }
  }

  add(task) {
    this.tasks = [...this.tasks, task];
    this.activeTaskId = task.id;
    this.persist();
  }

  remove(taskId) {
    const task = this.get(taskId);
    if (!task?.custom) {
      return null;
    }

    this.tasks = this.tasks.filter((item) => item.id !== taskId);
    this.activeTaskId = this.tasks[0]?.id;
    this.persist();
    return task;
  }

  update(taskId, patch) {
    this.tasks = this.tasks.map((task) =>
      task.id === taskId ? { ...task, ...patch, updatedAt: now() } : task
    );
    this.persist();
  }

  mark(taskId, taskStatus) {
    this.update(taskId, { status: taskStatus });
  }

  saveSnapshot(taskId, snapshot) {
    const task = this.get(taskId);
    if (!task || !snapshot) {
      return;
    }

    const url = isHttpUrl(snapshot.url) ? snapshot.url : task.url;

    this.update(taskId, {
      url,
      origin: originFromUrl(url) || task.origin,
      inputDraft: snapshot.inputDraft || task.inputDraft || "",
      messages: Array.isArray(snapshot.messages) ? snapshot.messages : task.messages,
      scroll: snapshot.scroll || task.scroll || { x: 0, y: 0 },
      status: task.status === TaskStatus.FINISHED ? TaskStatus.FINISHED : TaskStatus.PAUSED
    });
  }
}

class WebViewManager {
  constructor(frame, callbacks) {
    this.frame = frame;
    this.callbacks = callbacks;
    this.webview = this.createWebView();
    this.currentTaskId = null;
    this.isAttached = false;
    this.isNavigationReady = false;
    this.pendingTask = null;
    this.restoreQueue = new Map();
    this.frame.replaceChildren(this.webview);
  }

  createWebView() {
    const view = document.createElement("webview");
    view.className = "task-webview";
    view.setAttribute("partition", RUNTIME_PARTITION);
    view.setAttribute("allowpopups", "");
    view.setAttribute("src", "about:blank");

    view.addEventListener("did-attach", () => {
      this.isAttached = true;
      this.flushPendingTask();
    });

    view.addEventListener("dom-ready", () => {
      this.isNavigationReady = true;
      this.flushPendingTask();
      this.callbacks.onReady?.(this.currentTaskId);
      this.restoreTaskContext();
    });

    view.addEventListener("did-start-loading", () => {
      this.callbacks.onLoading?.(this.currentTaskId);
    });

    view.addEventListener("did-stop-loading", () => {
      this.isNavigationReady = true;
      this.flushPendingTask();
      this.callbacks.onReady?.(this.currentTaskId);
      this.restoreTaskContext();
    });

    view.addEventListener("did-fail-load", (event) => {
      if (event.validatedURL === "about:blank") {
        this.isNavigationReady = true;
        this.flushPendingTask();
        return;
      }

      if (event.errorCode !== -3) {
        this.callbacks.onFailed?.(this.currentTaskId);
      }
    });

    return view;
  }

  loadTask(task) {
    if (!task) {
      return;
    }

    this.currentTaskId = task.id;
    this.webview.dataset.taskId = task.id;
    this.restoreQueue.set(task.id, {
      inputDraft: task.inputDraft,
      scroll: task.scroll
    });
    this.callbacks.onLoading?.(task.id);

    if (!this.isAttached || !this.isNavigationReady) {
      this.pendingTask = task;
      return;
    }

    this.loadTaskUrl(task);
  }

  flushPendingTask() {
    if (!this.pendingTask) {
      return;
    }

    const task = this.pendingTask;
    this.pendingTask = null;
    this.loadTaskUrl(task);
  }

  loadTaskUrl(task) {
    const targetUrl = task.url || task.initialUrl;
    try {
      this.webview.loadURL(targetUrl);
    } catch {
      window.setTimeout(() => {
        try {
          this.webview.loadURL(targetUrl);
        } catch {
          this.callbacks.onFailed?.(task.id);
        }
      }, 150);
    }
  }

  async captureState() {
    const url = this.safeGetUrl();
    let inputDraft = "";
    let scroll = { x: 0, y: 0 };

    try {
      const state = await this.webview.executeJavaScript(
        `(() => {
          const active = document.activeElement;
          const editable = active && (active.matches?.("textarea, input[type='text'], input:not([type]), [contenteditable='true']"));
          const target = editable ? active : document.querySelector("textarea, [contenteditable='true'], input[type='text']");
          return {
            inputDraft: target ? (target.value ?? target.innerText ?? "") : "",
            scroll: { x: window.scrollX || 0, y: window.scrollY || 0 }
          };
        })();`,
        true
      );
      inputDraft = state?.inputDraft || "";
      scroll = state?.scroll || scroll;
    } catch {
      inputDraft = "";
    }

    return {
      url,
      inputDraft,
      scroll,
      messages: []
    };
  }

  async restoreTaskContext() {
    const queued = this.restoreQueue.get(this.currentTaskId);
    if (!queued) {
      return;
    }

    this.restoreQueue.delete(this.currentTaskId);

    try {
      await this.webview.executeJavaScript(
        `(() => {
          const draft = ${JSON.stringify(queued.inputDraft || "")};
          const scroll = ${JSON.stringify(queued.scroll || { x: 0, y: 0 })};
          const target = document.querySelector("textarea, [contenteditable='true'], input[type='text']");
          if (draft && target) {
            const current = target.value ?? target.innerText ?? "";
            if (!current.trim()) {
              if ("value" in target) {
                target.value = draft;
                target.dispatchEvent(new Event("input", { bubbles: true }));
              } else {
                target.innerText = draft;
                target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: draft }));
              }
            }
          }
          window.scrollTo(scroll.x || 0, scroll.y || 0);
          return true;
        })();`,
        true
      );
    } catch {
      // Cross-site restoration is best-effort.
    }
  }

  reload() {
    this.webview.reload();
  }

  safeGetUrl() {
    try {
      return this.webview.getURL() || "";
    } catch {
      return "";
    }
  }

  blur() {
    try {
      this.webview.blur();
    } catch {
      // The modal can still take focus if the webview is not ready.
    }
  }
}

const taskManager = new TaskManager(localStorage);
const webViewManager = new WebViewManager(webviewFrame, {
  onLoading: (taskId) => {
    if (taskId) {
      taskManager.mark(taskId, TaskStatus.RUNNING);
      renderTasks();
    }
    setStatus(text.loading);
  },
  onReady: (taskId) => {
    if (taskId) {
      taskManager.mark(taskId, TaskStatus.RUNNING);
      renderTasks();
    }
    setStatus(text.ready, "ready");
  },
  onFailed: (taskId) => {
    if (taskId) {
      taskManager.mark(taskId, TaskStatus.PAUSED);
      renderTasks();
    }
    setStatus(text.loadFailed, "error");
  }
});

function setStatus(label, state = "") {
  status.textContent = label;
  status.className = `status ${state}`.trim();
}

function renderTasks() {
  serviceList.replaceChildren();

  taskManager.all().forEach((task) => {
    const button = document.createElement("button");
    button.className = "service-button";
    button.type = "button";
    button.dataset.task = task.id;
    button.innerHTML = `
      <span class="service-dot" style="background:${task.color}"></span>
      <span class="task-copy">
        <span class="task-title">${task.title}</span>
        <span class="task-state">${statusLabel(task.status)}</span>
      </span>
    `;
    button.classList.toggle("active", task.id === taskManager.activeTaskId);
    button.addEventListener("click", () => selectTask(task.id));
    serviceList.append(button);
  });

  const active = taskManager.active();
  if (active) {
    title.textContent = active.title;
    removeCurrentButton.hidden = !active.custom;
  }
}

async function persistCurrentTaskAsPaused() {
  const currentTask = taskManager.active();
  if (!currentTask) {
    return;
  }

  const snapshot = await webViewManager.captureState();
  taskManager.saveSnapshot(currentTask.id, snapshot);
}

async function selectTask(taskId) {
  const nextTask = taskManager.get(taskId);
  const currentTask = taskManager.active();

  if (!nextTask) {
    return;
  }

  if (nextTask.id === currentTask?.id && webViewManager.currentTaskId === nextTask.id) {
    return;
  }

  setStatus(text.switching);
  await persistCurrentTaskAsPaused();
  taskManager.setActive(nextTask.id);
  renderTasks();
  webViewManager.loadTask(taskManager.active());
}

function openAddSiteModal() {
  formError.textContent = "";
  addSiteForm.reset();
  document.body.classList.add("modal-open");
  addSiteModal.hidden = false;
  webViewManager.blur();

  window.setTimeout(() => {
    siteNameInput.focus();
    siteNameInput.select();
  }, 0);
}

function closeAddSiteModal() {
  addSiteModal.hidden = true;
  if (settingsModal.hidden) {
    document.body.classList.remove("modal-open");
  }
}

function openSettingsModal() {
  document.body.classList.add("modal-open");
  settingsModal.hidden = false;
  webViewManager.blur();
  loadCloseSettings();
}

function closeSettingsModal() {
  settingsModal.hidden = true;
  if (addSiteModal.hidden) {
    document.body.classList.remove("modal-open");
  }
}

async function clearTaskData(targetTasks) {
  const targets = targetTasks.map((task) => ({
    partition: RUNTIME_PARTITION,
    origin: task.origin || originFromUrl(task.url)
  }));
  const result = await window.aiChatHub.clearServiceData(targets);

  const active = taskManager.active();
  if (targetTasks.some((task) => task.id === active?.id)) {
    webViewManager.reload();
  }

  return result;
}

reloadButton.addEventListener("click", () => {
  webViewManager.reload();
  closeSettingsModal();
});

pauseCurrentButton.addEventListener("click", async () => {
  const task = taskManager.active();
  if (!task) {
    return;
  }

  await persistCurrentTaskAsPaused();
  taskManager.mark(task.id, TaskStatus.PAUSED);
  renderTasks();
  setStatus(text.paused, "ready");
  closeSettingsModal();
});

finishCurrentButton.addEventListener("click", async () => {
  const task = taskManager.active();
  if (!task) {
    return;
  }

  await persistCurrentTaskAsPaused();
  taskManager.mark(task.id, TaskStatus.FINISHED);
  renderTasks();
  setStatus(text.finished, "ready");
  closeSettingsModal();
});

openButton.addEventListener("click", () => {
  const active = taskManager.active();
  const targetUrl = webViewManager.safeGetUrl() || active?.url;
  if (targetUrl) {
    window.open(targetUrl);
  }
  closeSettingsModal();
});

openSettingsButton.addEventListener("click", openSettingsModal);
closeSettingsButton.addEventListener("click", closeSettingsModal);
settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    closeSettingsModal();
  }
});

async function loadCloseSettings() {
  try {
    const settings = await window.aiChatHub.getCloseSettings();
    const behavior = settings?.closeBehavior || "tray";
    closeBehaviorInputs.forEach((input) => {
      input.checked = input.value === behavior;
    });
  } catch {
    closeBehaviorInputs.forEach((input) => {
      input.checked = input.value === "tray";
    });
  }
}

closeBehaviorInputs.forEach((input) => {
  input.addEventListener("change", async () => {
    if (!input.checked) {
      return;
    }

    await window.aiChatHub.setCloseSettings({
      closeBehavior: input.value,
      rememberChoice: true
    });
  });
});

addSiteButton.addEventListener("click", () => {
  closeSettingsModal();
  openAddSiteModal();
});
closeAddSiteButton.addEventListener("click", closeAddSiteModal);
cancelAddSiteButton.addEventListener("click", closeAddSiteModal);

addSiteModal.addEventListener("click", (event) => {
  if (event.target === addSiteModal) {
    closeAddSiteModal();
  }
});

addSiteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";

  try {
    const name = siteNameInput.value.trim();
    const url = normalizeUrl(siteUrlInput.value);

    if (!name) {
      throw new Error(text.nameRequired);
    }

    if (taskManager.all().some((task) => task.title.toLowerCase() === name.toLowerCase())) {
      throw new Error(text.duplicateName);
    }

    await persistCurrentTaskAsPaused();
    const task = createCustomTask(name, url);
    taskManager.add(task);
    renderTasks();
    webViewManager.loadTask(task);
    closeAddSiteModal();
  } catch (error) {
    formError.textContent = error.message || text.addFailed;
  }
});

clearCurrentButton.addEventListener("click", async () => {
  const task = taskManager.active();
  if (!task) {
    return;
  }

  const confirmed = window.confirm(`\u8981\u6e05\u7406 ${task.title} \u7684\u767b\u5f55\u72b6\u6001\u548c\u7f13\u5b58\u5417\uff1f`);
  if (!confirmed) {
    return;
  }

  setStatus(text.clearing);
  await clearTaskData([task]);
  setStatus(text.cleared, "ready");
  closeSettingsModal();
});

clearAllButton.addEventListener("click", async () => {
  const confirmed = window.confirm(text.clearAllConfirm);
  if (!confirmed) {
    return;
  }

  setStatus(text.clearing);
  await window.aiChatHub.clearServiceData([{ partition: RUNTIME_PARTITION }]);
  webViewManager.reload();
  setStatus(text.cleared, "ready");
  closeSettingsModal();
});

removeCurrentButton.addEventListener("click", async () => {
  const task = taskManager.active();
  if (!task?.custom) {
    return;
  }

  const confirmed = window.confirm(`\u8981\u5220\u9664 ${task.title} \u5e76\u6e05\u7406\u5b83\u7684\u672c\u5730\u767b\u5f55\u6570\u636e\u5417\uff1f`);
  if (!confirmed) {
    return;
  }

  await clearTaskData([task]);
  taskManager.remove(task.id);
  renderTasks();
  webViewManager.loadTask(taskManager.active());
  closeSettingsModal();
});

window.addEventListener("beforeunload", () => {
  persistCurrentTaskAsPaused();
});

renderTasks();
webViewManager.loadTask(taskManager.active());
