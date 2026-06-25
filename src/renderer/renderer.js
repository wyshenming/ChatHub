import { AppController } from "./controller.js";
import { StorageManager } from "./storage-manager.js";
import { TaskManager } from "./task-manager.js";
import { WebViewManager } from "./webview-manager.js";
import { statusLabel } from "./utils.js";

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

let controller = null;

const view = {
  setStatus(label, state = "") {
    status.textContent = label;
    status.className = `status ${state}`.trim();
  },

  renderTasks({ tasks, activeTaskId, activeTask }) {
    serviceList.replaceChildren();

    tasks.forEach((task) => {
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
      button.classList.toggle("active", task.id === activeTaskId);
      button.addEventListener("click", () => controller.selectTask(task.id));
      serviceList.append(button);
    });

    if (activeTask) {
      title.textContent = activeTask.title;
      removeCurrentButton.hidden = !activeTask.custom;
    }
  },

  openAddSiteModal() {
    formError.textContent = "";
    addSiteForm.reset();
    document.body.classList.add("modal-open");
    addSiteModal.hidden = false;

    window.setTimeout(() => {
      siteNameInput.focus();
      siteNameInput.select();
    }, 0);
  },

  closeAddSiteModal() {
    addSiteModal.hidden = true;
    if (settingsModal.hidden) {
      document.body.classList.remove("modal-open");
    }
  },

  openSettingsModal() {
    document.body.classList.add("modal-open");
    settingsModal.hidden = false;
  },

  closeSettingsModal() {
    settingsModal.hidden = true;
    if (addSiteModal.hidden) {
      document.body.classList.remove("modal-open");
    }
  },

  setCloseBehavior(behavior) {
    closeBehaviorInputs.forEach((input) => {
      input.checked = input.value === behavior;
    });
  },

  setFormError(message) {
    formError.textContent = message;
  },

  confirm(message) {
    return window.confirm(message);
  },

  openUrl(url) {
    window.open(url);
  },
};

const storageManager = new StorageManager({
  localStorage,
  systemApi: window.aiChatHub,
});
const taskManager = new TaskManager(storageManager);
const webViewManager = new WebViewManager(webviewFrame, {
  onLoading: (taskId) => controller?.handleWebViewLoading(taskId),
  onReady: (taskId) => controller?.handleWebViewReady(taskId),
  onFailed: (taskId) => controller?.handleWebViewFailed(taskId),
});

controller = new AppController({
  taskManager,
  webViewManager,
  storageManager,
  view,
});

reloadButton.addEventListener("click", () => {
  controller.reloadCurrent();
});

pauseCurrentButton.addEventListener("click", () => {
  controller.pauseCurrent();
});

finishCurrentButton.addEventListener("click", () => {
  controller.finishCurrent();
});

openButton.addEventListener("click", () => {
  controller.openCurrentInBrowser();
});

openSettingsButton.addEventListener("click", () => {
  controller.openSettings();
});

closeSettingsButton.addEventListener("click", () => {
  controller.closeSettings();
});

settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    controller.closeSettings();
  }
});

closeBehaviorInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) {
      controller.setCloseBehavior(input.value);
    }
  });
});

addSiteButton.addEventListener("click", () => {
  controller.openAddSite();
});

closeAddSiteButton.addEventListener("click", () => {
  controller.closeAddSite();
});

cancelAddSiteButton.addEventListener("click", () => {
  controller.closeAddSite();
});

addSiteModal.addEventListener("click", (event) => {
  if (event.target === addSiteModal) {
    controller.closeAddSite();
  }
});

addSiteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  controller.submitCustomSite({
    name: siteNameInput.value,
    url: siteUrlInput.value,
  });
});

clearCurrentButton.addEventListener("click", () => {
  controller.clearCurrentLogin();
});

clearAllButton.addEventListener("click", () => {
  controller.clearAllLogins();
});

removeCurrentButton.addEventListener("click", () => {
  controller.removeCurrentCustomTask();
});

window.addEventListener("beforeunload", () => {
  controller.beforeUnload();
});

controller.start();
