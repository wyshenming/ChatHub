import { RUNTIME_PARTITION } from "./constants.js";

export class WebViewManager {
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
      scroll: task.scroll,
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
      messages: [],
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

  clear() {
    this.currentTaskId = null;
    this.webview.dataset.taskId = "";
    try {
      this.webview.loadURL("about:blank");
    } catch {
      // Clearing is best-effort when the task list is empty.
    }
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
