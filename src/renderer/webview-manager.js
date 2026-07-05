import { RUNTIME_PARTITION } from "./constants.js";

export class WebViewManager {
  constructor(frame, callbacks) {
    this.frame = frame;
    this.callbacks = callbacks;
    this.createdAt = performance.now();
    this.switchStartAt = null;
    this.activeNavigation = null;
    this.currentTaskId = null;
    this.webview = null;
    this.webviewPool = new Map();
    this.maxWebViewPoolSize = 4;

    window.addEventListener("beforeunload", () => {
      this.logPoolDestroy("beforeunload");
    });
  }

  createWebViewRecord(task) {
    const createStart = performance.now();
    const webview = document.createElement("webview");
    const record = {
      taskId: task.id,
      taskTitle: task.title || task.name || task.id,
      webview,
      createdAt: performance.now(),
      isAttached: false,
      isNavigationReady: false,
      isLoading: false,
      isLoadingTarget: false,
      hasLoaded: false,
      loadedUrl: "",
      currentUrl: "",
      targetUrl: task.url || task.initialUrl || "",
      pendingTask: null,
      destroyLogged: false,
      loadStartAt: null,
      loadUrlCallCost: null,
      lastAccessedAt: 0,
    };

    webview.className = "task-webview";
    webview.dataset.taskId = task.id;
    webview.setAttribute("partition", RUNTIME_PARTITION);
    webview.setAttribute("allowpopups", "");
    webview.setAttribute("src", "about:blank");
    this.applyVisibility(record, false);
    this.bindWebViewEvents(record);
    this.frame.appendChild(webview);
    this.observeWebViewRemoval(record);

    this.logPerformance(
      `[WebView]\nTask: ${record.taskTitle}\nAction: Create\nCreate Cost: ${this.formatCost(performance.now() - createStart)}\nReuse Existing: false\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size + 1}\nMemory: ${this.memoryUsage()}`
    );

    return record;
  }

  bindWebViewEvents(record) {
    record.webview.addEventListener("did-attach", () => {
      record.isAttached = true;
      this.logLifecycle(record, "Attached");
      this.flushPendingTask(record);
    });

    record.webview.addEventListener("dom-ready", () => {
      record.isNavigationReady = true;
      record.currentUrl = this.safeGetUrl(record);
      this.logNavigationEvent(record, "dom-ready");
      this.flushPendingTask(record);
      this.notifyReady(record);
      this.restoreTaskContext(record.taskId);
    });

    record.webview.addEventListener("did-start-loading", () => {
      record.isLoading = true;
      record.loadStartAt = performance.now();
      this.logNavigationEvent(record, "did-start-loading");
      this.notifyLoading(record);
    });

    record.webview.addEventListener("did-stop-loading", () => {
      record.isLoading = false;
      record.isNavigationReady = true;
      record.currentUrl = this.safeGetUrl(record);
      this.logNavigationEvent(record, "did-stop-loading");
      this.flushPendingTask(record);
      this.notifyReady(record);
      this.restoreTaskContext(record.taskId);
    });

    record.webview.addEventListener("did-finish-load", () => {
      record.isLoading = false;
      record.isLoadingTarget = false;
      record.isNavigationReady = true;
      record.currentUrl = this.safeGetUrl(record);
      if (record.currentUrl && record.currentUrl !== "about:blank") {
        record.hasLoaded = true;
        record.loadedUrl = record.targetUrl;
      }
      this.logFinishLoad(record);
    });

    record.webview.addEventListener("did-fail-load", (event) => {
      record.isLoading = false;
      record.isLoadingTarget = false;
      record.currentUrl = this.safeGetUrl(record);
      this.logNavigationEvent(record, "did-fail-load", {
        errorCode: event.errorCode,
        validatedURL: event.validatedURL,
      });

      if (event.validatedURL === "about:blank") {
        record.isNavigationReady = true;
        this.flushPendingTask(record);
        return;
      }

      if (event.errorCode !== -3) {
        this.notifyFailed(record);
      }
    });
  }

  loadTask(task) {
    if (!task) {
      return;
    }

    const previousTaskId = this.currentTaskId;
    const isSwitch = previousTaskId !== null && previousTaskId !== task.id;
    const existingRecord = this.webviewPool.get(task.id);
    const record = existingRecord || this.createWebViewRecord(task);
    const targetUrl = task.url || task.initialUrl || "";
    const currentUrl = this.safeGetUrl(record);
    const configuredUrlChanged = Boolean(existingRecord) && !this.isSameUrl(record.loadedUrl || record.targetUrl, targetUrl);
    const waitForExistingLoad = !record.hasLoaded && record.isLoadingTarget && !configuredUrlChanged;
    const needReload = (!record.hasLoaded && !record.isLoadingTarget) || configuredUrlChanged;

    if (!existingRecord) {
      this.webviewPool.set(task.id, record);
    }

    this.switchStartAt = performance.now();
    this.activeNavigation = {
      taskId: task.id,
      taskTitle: task.title || task.name || task.id,
      action: isSwitch ? "Switch" : "Load",
      reuseExisting: Boolean(existingRecord),
      startAt: this.switchStartAt,
      loadUrlStartAt: null,
      loadUrlCallCost: null,
      targetUrl,
      currentUrl,
      needReload,
    };

    this.currentTaskId = task.id;
    this.webview = record.webview;
    record.lastAccessedAt = performance.now();
    record.taskTitle = task.title || task.name || task.id;
    record.targetUrl = targetUrl;
    record.webview.dataset.taskId = task.id;

    this.activateRecord(record);
    this.logSwitchStart(this.activeNavigation);
    this.logSwitchDecision(task, currentUrl, targetUrl, needReload);

    if (waitForExistingLoad) {
      this.notifyLoading(record);
      this.logAwaitExistingLoad(record);
      this.evictOverflow();
      return;
    }

    if (!needReload) {
      record.isNavigationReady = true;
      this.notifyReady(record);
      this.restoreTaskContext(task.id);
      this.logCachedSwitch(record);
      this.evictOverflow();
      return;
    }

    this.notifyLoading(record);
    if (!record.isAttached || !record.isNavigationReady) {
      record.pendingTask = task;
      this.evictOverflow();
      return;
    }

    this.loadTaskUrl(task, record);
    this.evictOverflow();
  }

  activateRecord(targetRecord) {
    for (const record of this.webviewPool.values()) {
      this.applyVisibility(record, record.taskId === targetRecord.taskId);
    }
  }

  applyVisibility(record, isVisible) {
    record.webview.style.visibility = isVisible ? "visible" : "hidden";
    record.webview.style.opacity = isVisible ? "1" : "0";
    record.webview.style.pointerEvents = isVisible ? "auto" : "none";
    record.webview.style.zIndex = isVisible ? "1" : "0";
  }

  flushPendingTask(record) {
    if (!record.pendingTask || !record.isAttached || !record.isNavigationReady) {
      return;
    }

    const task = record.pendingTask;
    record.pendingTask = null;
    this.loadTaskUrl(task, record);
  }

  loadTaskUrl(task, record = this.activeRecord()) {
    if (!record) {
      return;
    }

    const targetUrl = task.url || task.initialUrl || "";
    const currentUrl = this.safeGetUrl(record);
    const configuredUrlChanged = !this.isSameUrl(record.loadedUrl || record.targetUrl, targetUrl);
    const waitForExistingLoad = !record.hasLoaded && record.isLoadingTarget && !configuredUrlChanged;
    const needReload = (!record.hasLoaded && !record.isLoadingTarget) || configuredUrlChanged;

    if (this.activeNavigation?.taskId === task.id) {
      this.activeNavigation.currentUrl = currentUrl;
      this.activeNavigation.targetUrl = targetUrl;
      this.activeNavigation.needReload = needReload;
    }

    this.logSwitchDecision(task, currentUrl, targetUrl, needReload);

    if (waitForExistingLoad) {
      this.notifyLoading(record);
      this.logAwaitExistingLoad(record);
      this.evictOverflow();
      return;
    }

    if (!needReload) {
      record.isNavigationReady = true;
      this.notifyReady(record);
      this.restoreTaskContext(task.id);
      this.logCachedSwitch(record);
      return;
    }

    const loadUrlStart = performance.now();
    record.targetUrl = targetUrl;
    record.isLoadingTarget = true;
    if (this.activeNavigation?.taskId === task.id) {
      this.activeNavigation.loadUrlStartAt = loadUrlStart;
      this.activeNavigation.targetUrl = targetUrl;
    }

    try {
      record.webview.loadURL(targetUrl);
      this.logLoadUrlCall(task, record, targetUrl, loadUrlStart);
    } catch {
      window.setTimeout(() => {
        const retryStart = performance.now();
        try {
          record.webview.loadURL(targetUrl);
          this.logLoadUrlCall(task, record, targetUrl, retryStart, true);
        } catch {
          this.logNavigationEvent(record, "loadURL-failed", { task: task.title || task.id, targetUrl });
          this.notifyFailed(record);
        }
      }, 150);
    }
  }

  async captureState() {
    const record = this.activeRecord();
    const url = this.safeGetUrl(record);

    return {
      url,
      inputDraft: "",
      scroll: { x: 0, y: 0 },
      messages: [],
    };
  }

  async restoreTaskContext(taskId = this.currentTaskId) {
    return Boolean(this.webviewPool.get(taskId));
  }

  reload() {
    const record = this.activeRecord();
    record?.webview.reload();
  }

  setMaxWebViewPoolSize(value) {
    const parsed = Number(value);
    this.maxWebViewPoolSize = [2, 3, 4, 5, 6].includes(parsed) ? parsed : 4;
    this.evictOverflow();
  }

  evictOverflow() {
    while (this.webviewPool.size > this.maxWebViewPoolSize) {
      const candidate = this.findLruEvictionCandidate();
      if (!candidate) {
        return;
      }

      this.evictRecord(candidate, "max-pool-size-exceeded");
    }
  }

  findLruEvictionCandidate() {
    return [...this.webviewPool.values()]
      .filter((record) => record.taskId !== this.currentTaskId)
      .sort((left, right) => left.lastAccessedAt - right.lastAccessedAt)[0];
  }

  evictRecord(record, reason) {
    const poolSizeBefore = this.webviewPool.size;
    this.logWebViewPoolEvict(record, reason, poolSizeBefore, poolSizeBefore - 1);
    this.logDestroy(record, `evict:${reason}`);
    record.webview.remove();
    this.webviewPool.delete(record.taskId);
  }

  removeTask(taskId) {
    const record = this.webviewPool.get(taskId);
    if (!record) {
      return;
    }

    this.logDestroy(record, "task-removed");
    record.webview.remove();
    this.webviewPool.delete(taskId);

    if (this.currentTaskId === taskId) {
      this.currentTaskId = null;
      this.webview = null;
    }
  }

  logWebViewPoolEvict(record, reason, poolSizeBefore, poolSizeAfter) {
    this.logPerformance(
      `[WebViewPool]\nAction: Evict\nReason: ${reason}\nMax Pool Size: ${this.maxWebViewPoolSize}\nPool Size Before: ${poolSizeBefore}\nPool Size After: ${poolSizeAfter}\nEvicted Task: ${record.taskTitle || record.taskId}\nWebView Count: ${this.webViewCount()}\nMemory: ${this.memoryUsage()}`
    );
  }

  clear() {
    this.currentTaskId = null;
    this.webview = null;
    for (const record of this.webviewPool.values()) {
      this.applyVisibility(record, false);
    }
  }

  safeGetUrl(record = this.activeRecord()) {
    try {
      return record?.webview.getURL() || "";
    } catch {
      return "";
    }
  }

  blur() {
    try {
      this.activeRecord()?.webview.blur();
    } catch {
      // The modal can still take focus if the webview is not ready.
    }
  }

  activeRecord() {
    return this.currentTaskId ? this.webviewPool.get(this.currentTaskId) : null;
  }

  isActiveRecord(record) {
    return Boolean(record && record.taskId === this.currentTaskId);
  }

  notifyLoading(record) {
    if (this.isActiveRecord(record)) {
      this.callbacks.onLoading?.(record.taskId);
    }
  }

  notifyReady(record) {
    if (this.isActiveRecord(record)) {
      this.callbacks.onReady?.(record.taskId);
    }
  }

  notifyFailed(record) {
    if (this.isActiveRecord(record)) {
      this.callbacks.onFailed?.(record.taskId);
    }
  }

  logLifecycle(record, action) {
    this.logPerformance(
      `[WebView]\nTask: ${record.taskTitle}\nAction: ${action}\nTime: ${new Date().toISOString()}\nLifetime: ${this.formatCost(performance.now() - record.createdAt)}\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size}\nMemory: ${this.memoryUsage()}`
    );
  }

  logPoolDestroy(reason) {
    for (const record of this.webviewPool.values()) {
      this.logDestroy(record, reason);
    }
  }

  logDestroy(record, reason) {
    if (record.destroyLogged) {
      return;
    }

    record.destroyLogged = true;
    this.logPerformance(
      `[WebView]\nTask: ${record.taskTitle}\nAction: Destroy\nReason: ${reason}\nDestroy Time: ${new Date().toISOString()}\nLifetime: ${this.formatCost(performance.now() - record.createdAt)}\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size}\nMemory: ${this.memoryUsage()}`
    );
  }

  logSwitchStart(navigation) {
    this.logPerformance(
      `[WebView]\nTask: ${navigation.taskTitle}\nAction: ${navigation.action}\nReuse Existing: ${navigation.reuseExisting}\nCurrent URL: ${navigation.currentUrl || ""}\nTarget URL: ${navigation.targetUrl || ""}\nNeed Reload: ${navigation.needReload}\nSwitch Cost: ${this.formatCost(0)}\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size}\nMemory: ${this.memoryUsage()}`
    );
  }

  logSwitchDecision(task, currentUrl, targetUrl, needReload) {
    this.logPerformance(
      `[WebView]\nTask: ${task.title || task.name || task.id}\nAction: Switch Decision\nCurrent URL: ${currentUrl || ""}\nTarget URL: ${targetUrl || ""}\nNeed Reload: ${needReload}\nReason: ${needReload ? "not-yet-loaded-or-url-changed" : "cached-webview-reused"}\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size}\nMemory: ${this.memoryUsage()}`
    );
  }

  logCachedSwitch(record) {
    const switchCost = this.activeNavigation ? performance.now() - this.activeNavigation.startAt : 0;
    this.logPerformance(
      `[WebView]\nTask: ${record.taskTitle}\nAction: Show Cached\nReuse Existing: true\nSwitch Cost: ${this.formatCost(switchCost)}\nCurrent URL: ${this.safeGetUrl(record)}\nNeed Reload: false\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size}\nMemory: ${this.memoryUsage()}`
    );
  }

  logAwaitExistingLoad(record) {
    const switchCost = this.activeNavigation ? performance.now() - this.activeNavigation.startAt : 0;
    this.logPerformance(
      `[WebView]\nTask: ${record.taskTitle}\nAction: Await Existing Load\nReuse Existing: true\nSwitch Cost: ${this.formatCost(switchCost)}\nCurrent URL: ${this.safeGetUrl(record)}\nNeed Reload: false\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size}\nMemory: ${this.memoryUsage()}`
    );
  }

  logLoadUrlCall(task, record, targetUrl, startedAt, retried = false) {
    const cost = performance.now() - startedAt;
    record.loadUrlCallCost = cost;
    if (this.activeNavigation?.taskId === task.id) {
      this.activeNavigation.loadUrlCallCost = cost;
    }

    this.logPerformance(
      `[WebView]\nTask: ${task.title || task.name || task.id}\nAction: loadURL${retried ? " Retry" : ""}\nURL: ${targetUrl}\nloadURL Cost: ${this.formatCost(cost)}\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size}\nMemory: ${this.memoryUsage()}`
    );
  }

  logFinishLoad(record) {
    const finishedAt = performance.now();
    const navigation = this.activeNavigation?.taskId === record.taskId ? this.activeNavigation : null;
    const taskTitle = navigation?.taskTitle || record.taskTitle || record.taskId;
    const switchCost = navigation ? finishedAt - navigation.startAt : 0;
    const loadCost = navigation?.loadUrlStartAt ? finishedAt - navigation.loadUrlStartAt : 0;

    this.logPerformance(
      `[WebView]\nTask: ${taskTitle}\nAction: ${navigation?.action || "Load"}\nReuse Existing: ${navigation?.reuseExisting ?? true}\nSwitch Cost: ${this.formatCost(switchCost)}\ndid-finish-load Time: ${new Date().toISOString()}\ndid-finish-load Cost: ${this.formatCost(loadCost)}\nloadURL Call Cost: ${this.formatCost(record.loadUrlCallCost || navigation?.loadUrlCallCost || 0)}\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size}\nMemory: ${this.memoryUsage()}`
    );
  }

  logNavigationEvent(record, action, extra = {}) {
    const details = Object.entries(extra)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    this.logPerformance(
      `[WebView]\nTask: ${record.taskTitle || record.taskId}\nAction: ${action}\nTime: ${new Date().toISOString()}${details ? `\n${details}` : ""}\nWebView Count: ${this.webViewCount()}\nPool Size: ${this.webviewPool.size}\nMemory: ${this.memoryUsage()}`
    );
  }

  logPerformance(message) {
    console.info(message);
    window.aiChatHub?.appendWebViewPerformanceLog?.(message).catch(() => {
      // File logging is diagnostic only; keep WebView behavior unchanged.
    });
  }

  webViewCount() {
    return document.querySelectorAll("webview").length;
  }

  isSameUrl(currentUrl, targetUrl) {
    if (!currentUrl || !targetUrl) {
      return false;
    }

    try {
      const current = new URL(currentUrl);
      const target = new URL(targetUrl);
      current.hash = "";
      target.hash = "";
      return current.href.replace(/\/$/, "") === target.href.replace(/\/$/, "");
    } catch {
      return currentUrl.replace(/\/$/, "") === targetUrl.replace(/\/$/, "");
    }
  }

  observeWebViewRemoval(record) {
    const observer = new MutationObserver(() => {
      if (!record.webview.isConnected) {
        this.logDestroy(record, "webview-detached");
        observer.disconnect();
      }
    });
    observer.observe(this.frame, { childList: true });
  }

  memoryUsage() {
    const memory = performance.memory;
    if (!memory) {
      return "unavailable";
    }

    return `used=${this.bytesToMb(memory.usedJSHeapSize)} MB, total=${this.bytesToMb(memory.totalJSHeapSize)} MB, limit=${this.bytesToMb(memory.jsHeapSizeLimit)} MB`;
  }

  bytesToMb(value) {
    return Math.round((value / 1024 / 1024) * 10) / 10;
  }

  formatCost(value) {
    return `${Math.round(value)} ms`;
  }
}
