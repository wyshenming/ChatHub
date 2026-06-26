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
      groups: this.taskManager.grouped(),
      availableGroups: this.taskManager.allGroups(),
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

  async reloadTask(taskId) {
    const task = this.taskManager.get(taskId);
    if (!task) {
      return;
    }

    if (task.id !== this.taskManager.activeTaskId) {
      await this.selectTask(task.id);
    }

    this.webViewManager.reload();
  }

  async clearTaskCache(taskId) {
    const task = this.taskManager.get(taskId);
    if (!task) {
      return;
    }

    if (task.id !== this.taskManager.activeTaskId) {
      await this.selectTask(task.id);
    }

    this.view.setStatus(text.clearingCache);
    await this.storageManager.clearServiceCache([{ partition: RUNTIME_PARTITION }]);
    this.webViewManager.reload();
    this.view.setStatus(text.cacheCleared, "ready");
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

  createGroup(name) {
    try {
      const group = this.taskManager.addGroup(name);
      this.emitTasks();
      return group;
    } catch (error) {
      this.view.alert(error.message || text.addFailed);
      return null;
    }
  }

  toggleGroup(groupId) {
    this.taskManager.toggleGroup(groupId);
    this.emitTasks();
  }

  deleteGroup(groupId) {
    const group = this.taskManager.allGroups().find((item) => item.id === groupId);
    if (!group) {
      return;
    }

    const confirmed = this.view.confirm(
      `\u8981\u5220\u9664\u5206\u7ec4\u300c${group.name}\u300d\u5417\uff1f\u5176\u4e2d\u7684\u4efb\u52a1\u4f1a\u81ea\u52a8\u56de\u6536\u5230\u9ed8\u8ba4\u5206\u7ec4\u3002`
    );
    if (!confirmed) {
      return;
    }

    try {
      this.taskManager.removeGroup(groupId);
      this.emitTasks();
    } catch (error) {
      this.view.alert(error.message || text.addFailed);
    }
  }

  async renameGroup(groupId) {
    const group = this.taskManager.allGroups().find((item) => item.id === groupId);
    if (!group) {
      return;
    }

    const nextName = await this.view.prompt(
      "\u8bf7\u8f93\u5165\u65b0\u5206\u7ec4\u540d\u79f0",
      group.name
    );
    if (nextName === null) {
      return;
    }

    try {
      this.taskManager.renameGroup(groupId, nextName);
      this.emitTasks();
    } catch (error) {
      this.view.alert(error.message || text.addFailed);
    }
  }

  moveTaskToGroup(taskId, groupId) {
    this.taskManager.setTaskGroup(taskId, groupId);
    this.emitTasks();
  }

  async addTaskToNewGroup(taskId) {
    const task = this.taskManager.get(taskId);
    if (!task) {
      return;
    }

    const groupName = await this.view.prompt("\u8bf7\u8f93\u5165\u65b0\u5206\u7ec4\u540d\u79f0", "");
    if (groupName === null) {
      return;
    }

    const group = this.createGroup(groupName);
    if (group) {
      this.taskManager.setTaskGroup(taskId, group.id);
      this.emitTasks();
    }
  }

  moveGroup(sourceGroupId, targetGroupId) {
    this.taskManager.reorderGroup(sourceGroupId, targetGroupId);
    this.emitTasks();
  }

  moveCurrentTaskToGroup(groupId) {
    const task = this.taskManager.active();
    if (!task) {
      return;
    }

    this.taskManager.setTaskGroup(task.id, groupId);
    this.emitTasks();
  }

  hideCurrentTask() {
    const task = this.taskManager.active();
    if (!task) {
      return;
    }

    this.taskManager.setTaskHidden(task.id, true);
    this.emitTasks();
    this.view.closeSettingsModal();
  }

  hideTask(taskId) {
    this.taskManager.setTaskHidden(taskId, true);
    this.emitTasks();
  }

  async renameTask(taskId) {
    const task = this.taskManager.get(taskId);
    if (!task) {
      return;
    }

    const nextTitle = await this.view.prompt(
      "\u8bf7\u8f93\u5165\u65b0\u4efb\u52a1\u540d\u79f0",
      task.title
    );
    if (nextTitle === null) {
      return;
    }

    try {
      this.taskManager.renameTask(taskId, nextTitle);
      this.emitTasks();
    } catch (error) {
      this.view.alert(error.message || text.addFailed);
    }
  }

  async deleteTask(taskId) {
    const task = this.taskManager.get(taskId);
    if (!task) {
      return;
    }

    const confirmed = this.view.confirm(
      `\u8981\u5220\u9664\u4efb\u52a1\u300c${task.title}\u300d\u5417\uff1f\u8fd9\u4f1a\u5173\u95ed\u8be5\u4efb\u52a1\u5165\u53e3\uff0c\u4e0d\u4f1a\u6e05\u7406\u5176\u4ed6\u4efb\u52a1\u3002`
    );
    if (!confirmed) {
      return;
    }

    const wasActive = task.id === this.taskManager.activeTaskId;
    this.taskManager.remove(task.id);
    this.emitTasks();

    if (wasActive) {
      const nextTask = this.taskManager.active();
      if (nextTask) {
        this.webViewManager.loadTask(nextTask);
      } else {
        this.webViewManager.clear();
      }
    }
  }

  showAllTasks() {
    this.taskManager.showAllTasks();
    this.emitTasks();
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
