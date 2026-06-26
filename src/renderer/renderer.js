import { AppController } from "./controller.js";
import { APP_AUTHOR, APP_REPOSITORY_URL } from "./constants.js";
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
const clearCurrentButton = document.querySelector("#clear-current");
const clearAllButton = document.querySelector("#clear-all");
const removeCurrentButton = document.querySelector("#remove-current");
const openSettingsButton = document.querySelector("#open-settings");
const settingsModal = document.querySelector("#settings-modal");
const closeSettingsButton = document.querySelector("#close-settings");
const openAboutButton = document.querySelector("#open-about");
const closeBehaviorInputs = [...document.querySelectorAll("input[name='close-behavior']")];
const aboutModal = document.querySelector("#about-modal");
const closeAboutButton = document.querySelector("#close-about");
const openRepositoryButton = document.querySelector("#open-repository");
const aboutVersion = document.querySelector("#about-version");
const aboutAuthor = document.querySelector("#about-author");
const aboutRepository = document.querySelector("#about-repository");
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
    if (settingsModal.hidden && aboutModal.hidden) {
      document.body.classList.remove("modal-open");
    }
  },

  openSettingsModal() {
    document.body.classList.add("modal-open");
    settingsModal.hidden = false;
  },

  closeSettingsModal() {
    settingsModal.hidden = true;
    if (addSiteModal.hidden && aboutModal.hidden) {
      document.body.classList.remove("modal-open");
    }
  },

  openAboutModal({ version, author, repositoryUrl }) {
    aboutVersion.textContent = version;
    aboutAuthor.textContent = author;
    aboutRepository.textContent = repositoryUrl;
    document.body.classList.add("modal-open");
    aboutModal.hidden = false;
  },

  closeAboutModal() {
    aboutModal.hidden = true;
    if (settingsModal.hidden && addSiteModal.hidden) {
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
  aboutInfo: {
    version: window.aiChatHub?.version || "unknown",
    author: APP_AUTHOR,
    repositoryUrl: APP_REPOSITORY_URL,
  },
});

reloadButton.addEventListener("click", () => {
  controller.reloadCurrent();
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

openAboutButton.addEventListener("click", () => {
  controller.openAbout();
});

closeAboutButton.addEventListener("click", () => {
  controller.closeAbout();
});

openRepositoryButton.addEventListener("click", () => {
  controller.openRepository();
});

settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    controller.closeSettings();
  }
});

aboutModal.addEventListener("click", (event) => {
  if (event.target === aboutModal) {
    controller.closeAbout();
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
