import { RUNTIME_PARTITION, TaskStatus, text } from "./constants.js";
import { createCustomTask } from "./task-manager.js";
import { normalizeUrl, originFromUrl } from "./utils.js";

export class AppController {
  constructor({ taskManager, webViewManager, storageManager, view, aboutInfo }) {
    this.taskManager = taskManager;
    this.webViewManager = webViewManager;
    this.storageManager = storageManager;
    this.view = view;
    this.aboutInfo = aboutInfo;
  }

  start() {
    this.emitTasks();
    this.webViewManager.loadTask(this.taskManager.active());
  }

  handleWebViewLoading(taskId) {
    if (taskId) {
      this.taskManager.mark(taskId, TaskStatus.RUNNING);
      this.emitTasks();
    }
    this.view.setStatus(text.loading);
  }

  handleWebViewReady(taskId) {
    if (taskId) {
      this.taskManager.mark(taskId, TaskStatus.RUNNING);
      this.emitTasks();
    }
    this.view.setStatus(text.ready, "ready");
  }

  handleWebViewFailed(taskId) {
    if (taskId) {
      this.taskManager.mark(taskId, TaskStatus.PAUSED);
      this.emitTasks();
    }
    this.view.setStatus(text.loadFailed, "error");
  }

  emitTasks() {
    this.view.renderTasks({
      tasks: this.taskManager.all(),
      activeTaskId: this.taskManager.activeTaskId,
      activeTask: this.taskManager.active(),
    });
  }

  async persistCurrentTaskAsPaused() {
    const currentTask = this.taskManager.active();
    if (!currentTask) {
      return;
    }

    const snapshot = await this.webViewManager.captureState();
    this.taskManager.saveSnapshot(currentTask.id, snapshot);
  }

  async selectTask(taskId) {
    const nextTask = this.taskManager.get(taskId);
    const currentTask = this.taskManager.active();

    if (!nextTask) {
      return;
    }

    if (nextTask.id === currentTask?.id && this.webViewManager.currentTaskId === nextTask.id) {
      return;
    }

    this.view.setStatus(text.switching);
    await this.persistCurrentTaskAsPaused();
    this.taskManager.setActive(nextTask.id);
    this.emitTasks();
    this.webViewManager.loadTask(this.taskManager.active());
  }

  async reloadCurrent() {
    this.webViewManager.reload();
    this.view.closeSettingsModal();
  }

  openCurrentInBrowser() {
    const active = this.taskManager.active();
    const targetUrl = this.webViewManager.safeGetUrl() || active?.url;
    if (targetUrl) {
      this.view.openUrl(targetUrl);
    }
    this.view.closeSettingsModal();
  }

  async openSettings() {
    this.view.openSettingsModal();
    this.webViewManager.blur();
    await this.loadCloseSettings();
  }

  closeSettings() {
    this.view.closeSettingsModal();
  }

  openAbout() {
    this.view.closeSettingsModal();
    this.view.openAboutModal(this.aboutInfo);
  }

  closeAbout() {
    this.view.closeAboutModal();
  }

  openRepository() {
    this.view.openUrl(this.aboutInfo.repositoryUrl);
  }

  async loadCloseSettings() {
    try {
      const settings = await this.storageManager.getCloseSettings();
      this.view.setCloseBehavior(settings?.closeBehavior || "tray");
    } catch {
      this.view.setCloseBehavior("tray");
    }
  }

  async setCloseBehavior(closeBehavior) {
    await this.storageManager.setCloseSettings({
      closeBehavior,
      rememberChoice: true,
    });
  }

  openAddSite() {
    this.view.closeSettingsModal();
    this.view.openAddSiteModal();
    this.webViewManager.blur();
  }

  closeAddSite() {
    this.view.closeAddSiteModal();
  }

  async submitCustomSite({ name, url }) {
    this.view.setFormError("");

    try {
      const trimmedName = name.trim();
      const normalizedUrl = normalizeUrl(url);

      if (!trimmedName) {
        throw new Error(text.nameRequired);
      }

      if (
        this.taskManager
          .all()
          .some((task) => task.title.toLowerCase() === trimmedName.toLowerCase())
      ) {
        throw new Error(text.duplicateName);
      }

      await this.persistCurrentTaskAsPaused();
      const task = createCustomTask(trimmedName, normalizedUrl);
      this.taskManager.add(task);
      this.emitTasks();
      this.webViewManager.loadTask(task);
      this.view.closeAddSiteModal();
      this.view.setFormError("");
    } catch (error) {
      this.view.setFormError(error.message || text.addFailed);
    }
  }

  async clearCurrentLogin() {
    const task = this.taskManager.active();
    if (!task) {
      return;
    }

    const confirmed = this.view.confirm(
      `\u8981\u6e05\u7406 ${task.title} \u7684\u767b\u5f55\u72b6\u6001\u548c\u7f13\u5b58\u5417\uff1f`
    );
    if (!confirmed) {
      return;
    }

    this.view.setStatus(text.clearing);
    await this.clearTaskData([task]);
    this.view.setStatus(text.cleared, "ready");
    this.view.closeSettingsModal();
  }

  async clearAllLogins() {
    const confirmed = this.view.confirm(text.clearAllConfirm);
    if (!confirmed) {
      return;
    }

    this.view.setStatus(text.clearing);
    await this.storageManager.clearServiceData([{ partition: RUNTIME_PARTITION }]);
    this.webViewManager.reload();
    this.view.setStatus(text.cleared, "ready");
    this.view.closeSettingsModal();
  }

  async removeCurrentCustomTask() {
    const task = this.taskManager.active();
    if (!task?.custom) {
      return;
    }

    const confirmed = this.view.confirm(
      `\u8981\u5220\u9664 ${task.title} \u5e76\u6e05\u7406\u5b83\u7684\u672c\u5730\u767b\u5f55\u6570\u636e\u5417\uff1f`
    );
    if (!confirmed) {
      return;
    }

    await this.clearTaskData([task]);
    this.taskManager.remove(task.id);
    this.emitTasks();
    this.webViewManager.loadTask(this.taskManager.active());
    this.view.closeSettingsModal();
  }

  async clearTaskData(targetTasks) {
    const targets = targetTasks.map((task) => ({
      partition: RUNTIME_PARTITION,
      origin: task.origin || originFromUrl(task.url),
    }));
    const result = await this.storageManager.clearServiceData(targets);

    const active = this.taskManager.active();
    if (targetTasks.some((task) => task.id === active?.id)) {
      this.webViewManager.reload();
    }

    return result;
  }

  beforeUnload() {
    this.persistCurrentTaskAsPaused();
  }
}
