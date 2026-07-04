import { AppController } from "./controller.js";
import { APP_AUTHOR, APP_REPOSITORY_URL, DEFAULT_GROUP_ID } from "./constants.js";
import { StorageManager } from "./storage-manager.js";
import { TaskManager } from "./task-manager.js";
import { WebViewManager } from "./webview-manager.js";
import { getSoftColor, statusLabel } from "./utils.js";

const serviceList = document.querySelector("#service-list");
const appShell = document.querySelector(".app-shell");
const sidebar = document.querySelector(".sidebar");
const webviewFrame = document.querySelector("#webview-frame");
const title = document.querySelector("#current-title");
const status = document.querySelector("#status");
const reloadButton = document.querySelector("#reload-current");
const toggleSidebarButton = document.querySelector("#toggle-sidebar");
const openSettingsButton = document.querySelector("#open-settings");
const settingsModal = document.querySelector("#settings-modal");
const closeSettingsButton = document.querySelector("#close-settings");
const openAboutButton = document.querySelector("#open-about");
const closeBehaviorInputs = [...document.querySelectorAll("input[name='close-behavior']")];
const maxWebViewPoolSizeSelect = document.querySelector("#max-webview-pool-size");
const aboutModal = document.querySelector("#about-modal");
const closeAboutButton = document.querySelector("#close-about");
const openRepositoryButton = document.querySelector("#open-repository");
const aboutVersion = document.querySelector("#about-version");
const aboutAuthor = document.querySelector("#about-author");
const aboutRepository = document.querySelector("#about-repository");
const addSiteModal = document.querySelector("#add-site-modal");
const addSiteForm = document.querySelector("#add-site-form");
const addSiteTitle = document.querySelector("#add-site-title");
const closeAddSiteButton = document.querySelector("#close-add-site");
const cancelAddSiteButton = document.querySelector("#cancel-add-site");
const submitAddSiteButton = document.querySelector("#submit-add-site");
const siteNameInput = document.querySelector("#site-name");
const siteUrlInput = document.querySelector("#site-url");
const formError = document.querySelector("#form-error");
const textPromptModal = document.querySelector("#text-prompt-modal");
const textPromptForm = document.querySelector("#text-prompt-form");
const textPromptTitle = document.querySelector("#text-prompt-title");
const textPromptLabel = document.querySelector("#text-prompt-label");
const textPromptInput = document.querySelector("#text-prompt-input");
const closeTextPromptButton = document.querySelector("#close-text-prompt");
const cancelTextPromptButton = document.querySelector("#cancel-text-prompt");

let controller = null;
let contextMenu = null;
let textPromptResolve = null;
let sidebarCollapsed = false;
let editingSiteTaskId = null;

function closeContextMenu() {
  contextMenu?.remove();
  contextMenu = null;
}

function addContextMenuItem(menu, label, action, danger = false) {
  const item = document.createElement("button");
  item.className = "context-menu-item";
  item.type = "button";
  item.textContent = label;
  item.classList.toggle("danger", danger);
  item.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeContextMenu();
    window.setTimeout(action, 0);
  });
  menu.append(item);
}

function openContextMenu(event, items) {
  event.preventDefault();
  closeContextMenu();

  contextMenu = document.createElement("div");
  contextMenu.className = "context-menu";
  contextMenu.setAttribute("role", "menu");

  items.forEach((item) => {
    if (item === "separator") {
      const separator = document.createElement("div");
      separator.className = "context-menu-separator";
      contextMenu.append(separator);
      return;
    }

    addContextMenuItem(contextMenu, item.label, item.action, item.danger);
  });

  document.body.append(contextMenu);

  const { innerWidth, innerHeight } = window;
  const rect = contextMenu.getBoundingClientRect();
  const left = Math.min(event.clientX, innerWidth - rect.width - 8);
  const top = Math.min(event.clientY, innerHeight - rect.height - 8);
  contextMenu.style.left = `${Math.max(8, left)}px`;
  contextMenu.style.top = `${Math.max(8, top)}px`;
}

function completeTextPrompt(value) {
  textPromptModal.hidden = true;
  if (settingsModal.hidden && aboutModal.hidden && addSiteModal.hidden) {
    document.body.classList.remove("modal-open");
  }

  const resolve = textPromptResolve;
  textPromptResolve = null;
  resolve?.(value);
}

function getTaskInitial(value) {
  const firstCharacter = Array.from(String(value || "").trim())[0] || "?";
  return /[a-z]/i.test(firstCharacter) ? firstCharacter.toUpperCase() : firstCharacter;
}

function setSidebarCollapsed(collapsed, persist = true) {
  sidebarCollapsed = Boolean(collapsed);
  appShell.classList.toggle("sidebar-collapsed", sidebarCollapsed);
  toggleSidebarButton.textContent = sidebarCollapsed ? ">" : "<";
  toggleSidebarButton.setAttribute("aria-pressed", String(sidebarCollapsed));
  toggleSidebarButton.setAttribute(
    "aria-label",
    sidebarCollapsed ? "\u5c55\u5f00\u4fa7\u8fb9\u680f" : "\u6298\u53e0\u4fa7\u8fb9\u680f"
  );
  toggleSidebarButton.title = sidebarCollapsed ? "\u5c55\u5f00\u4fa7\u8fb9\u680f" : "\u6298\u53e0\u4fa7\u8fb9\u680f";

  if (persist) {
    storageManager.setUiSettings({ sidebarCollapsed });
  }
}

const view = {
  setStatus(label, state = "") {
    status.textContent = label;
    status.className = `status ${state}`.trim();
  },

  renderTasks({ groups, availableGroups, activeTaskId, activeTask }) {
    serviceList.replaceChildren();

    groups.forEach((group) => {
      const groupBlock = document.createElement("section");
      groupBlock.className = "task-group";
      groupBlock.dataset.group = group.id;
      groupBlock.addEventListener("dragover", (event) => {
        event.preventDefault();
        groupBlock.classList.add("drag-over");
      });
      groupBlock.addEventListener("dragleave", () => {
        groupBlock.classList.remove("drag-over");
      });
      groupBlock.addEventListener("drop", (event) => {
        event.preventDefault();
        groupBlock.classList.remove("drag-over");
        const sourceGroupId = event.dataTransfer.getData("text/chathub-group");
        const taskId = event.dataTransfer.getData("text/chathub-task");
        if (sourceGroupId) {
          controller.moveGroup(sourceGroupId, group.id);
          return;
        }

        if (taskId) {
          controller.moveTaskToGroup(taskId, group.id);
        }
      });

      const header = document.createElement("button");
      header.className = "group-button";
      header.type = "button";
      header.draggable = true;
      header.dataset.group = group.id;
      header.setAttribute("aria-expanded", String(!group.collapsed));
      header.addEventListener("click", () => controller.toggleGroup(group.id));
      header.addEventListener("dragstart", (event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/chathub-group", group.id);
        groupBlock.classList.add("dragging");
      });
      header.addEventListener("dragend", () => {
        groupBlock.classList.remove("dragging");
      });
      header.addEventListener("contextmenu", (event) => {
        const items = [
          {
            label: group.collapsed ? "\u5c55\u5f00\u5206\u7ec4" : "\u6298\u53e0\u5206\u7ec4",
            action: () => controller.toggleGroup(group.id),
          },
          {
            label: "\u91cd\u547d\u540d\u5206\u7ec4",
            action: () => controller.renameGroup(group.id),
          },
        ];

        if (group.id !== DEFAULT_GROUP_ID) {
          items.push("separator", {
            label: "\u5220\u9664\u5206\u7ec4",
            action: () => controller.deleteGroup(group.id),
            danger: true,
          });
        }

        openContextMenu(event, items);
      });

      const indicator = document.createElement("span");
      indicator.className = "group-indicator";
      indicator.textContent = group.collapsed ? "\u25b6" : "\u25be";

      const name = document.createElement("span");
      name.className = "group-name";
      name.textContent = group.name;

      const count = document.createElement("span");
      count.className = "group-count";
      count.textContent = String(group.tasks.length);

      header.append(indicator, name, count);
      groupBlock.append(header);

      if (!group.collapsed) {
        const taskList = document.createElement("div");
        taskList.className = "group-task-list";

        group.tasks.forEach((task) => {
          const button = document.createElement("button");
          button.className = "service-button";
          button.type = "button";
          button.dataset.task = task.id;
          button.draggable = true;
          button.classList.toggle("active", task.id === activeTaskId);
          button.addEventListener("click", () => controller.selectTask(task.id));
          button.addEventListener("dragstart", (event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/chathub-task", task.id);
            button.classList.add("dragging");
          });
          button.addEventListener("dragend", () => {
            button.classList.remove("dragging");
          });
          button.addEventListener("contextmenu", (event) => {
            const items = [
              {
                label: "\u6dfb\u52a0\u5230\u65b0\u5206\u7ec4",
                action: () => controller.addTaskToNewGroup(task.id),
              },
              {
                label: "\u4fee\u6539\u7f51\u9875",
                action: () => controller.editTaskSite(task.id),
              },
              {
                label: "\u91cd\u65b0\u52a0\u8f7d\u9875\u9762",
                action: () => controller.reloadTask(task.id),
              },
              {
                label: "\u6e05\u7406\u7f13\u5b58\uff08\u4fdd\u7559\u767b\u5f55\u72b6\u6001\uff09",
                action: () => controller.clearTaskCache(task.id),
              },
            ];

            const moveItems = availableGroups
              .filter((targetGroup) => targetGroup.id !== task.groupId)
              .map((targetGroup) => ({
                label: `\u79fb\u5230\u300c${targetGroup.name}\u300d`,
                action: () => controller.moveTaskToGroup(task.id, targetGroup.id),
              }));

            if (moveItems.length > 0) {
              items.push("separator", ...moveItems);
            }

            items.push("separator", {
              label: "\u5220\u9664\u4efb\u52a1",
              action: () => controller.deleteTask(task.id),
              danger: true,
            });

            openContextMenu(event, items);
          });

          const dot = document.createElement("span");
          dot.className = "service-dot";
          dot.style.background = getSoftColor(task.title || task.name || task.id);
          dot.textContent = getTaskInitial(task.title || task.name || task.id);

          const copy = document.createElement("span");
          copy.className = "task-copy";

          const taskTitle = document.createElement("span");
          taskTitle.className = "task-title";
          taskTitle.textContent = task.title;

          const taskState = document.createElement("span");
          taskState.className = "task-state";
          taskState.textContent = statusLabel(task.status);

          copy.append(taskTitle, taskState);
          button.append(dot, copy);
          taskList.append(button);
        });

        groupBlock.append(taskList);
      }

      serviceList.append(groupBlock);
    });

    if (activeTask) {
      title.textContent = activeTask.title;
    }
  },

  openAddSiteModal() {
    editingSiteTaskId = null;
    addSiteTitle.textContent = "\u6dfb\u52a0\u81ea\u5b9a\u4e49\u7f51\u9875";
    submitAddSiteButton.textContent = "\u6dfb\u52a0";
    formError.textContent = "";
    addSiteForm.reset();
    document.body.classList.add("modal-open");
    addSiteModal.hidden = false;

    window.setTimeout(() => {
      siteNameInput.focus();
      siteNameInput.select();
    }, 0);
  },

  openEditSiteModal(task) {
    editingSiteTaskId = task.id;
    addSiteTitle.textContent = "\u4fee\u6539\u7f51\u9875";
    submitAddSiteButton.textContent = "\u4fdd\u5b58";
    formError.textContent = "";
    siteNameInput.value = task.title || task.name || "";
    siteUrlInput.value = task.url || task.initialUrl || "";
    document.body.classList.add("modal-open");
    addSiteModal.hidden = false;

    window.setTimeout(() => {
      siteNameInput.focus();
      siteNameInput.select();
    }, 0);
  },

  closeAddSiteModal() {
    addSiteModal.hidden = true;
    editingSiteTaskId = null;
    if (settingsModal.hidden && aboutModal.hidden && textPromptModal.hidden) {
      document.body.classList.remove("modal-open");
    }
  },

  openSettingsModal() {
    document.body.classList.add("modal-open");
    settingsModal.hidden = false;
  },

  closeSettingsModal() {
    settingsModal.hidden = true;
    if (addSiteModal.hidden && aboutModal.hidden && textPromptModal.hidden) {
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
    if (settingsModal.hidden && addSiteModal.hidden && textPromptModal.hidden) {
      document.body.classList.remove("modal-open");
    }
  },

  setCloseBehavior(behavior) {
    closeBehaviorInputs.forEach((input) => {
      input.checked = input.value === behavior;
    });
  },

  setMaxWebViewPoolSize(value) {
    maxWebViewPoolSizeSelect.value = String(value);
  },

  setFormError(message) {
    formError.textContent = message;
  },

  confirm(message) {
    return window.confirm(message);
  },

  prompt(message, defaultValue = "") {
    closeContextMenu();

    if (textPromptResolve) {
      completeTextPrompt(null);
    }

    textPromptTitle.textContent = message;
    textPromptLabel.textContent = message;
    textPromptInput.value = defaultValue;
    document.body.classList.add("modal-open");
    textPromptModal.hidden = false;

    window.setTimeout(() => {
      textPromptInput.focus();
      textPromptInput.select();
    }, 0);

    return new Promise((resolve) => {
      textPromptResolve = resolve;
    });
  },

  alert(message) {
    window.alert(message);
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

openSettingsButton.addEventListener("click", () => {
  controller.openSettings();
});

toggleSidebarButton.addEventListener("click", () => {
  setSidebarCollapsed(!sidebarCollapsed);
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

maxWebViewPoolSizeSelect.addEventListener("change", () => {
  controller.setMaxWebViewPoolSize(maxWebViewPoolSizeSelect.value);
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
  if (editingSiteTaskId) {
    controller.submitTaskSiteEdit(editingSiteTaskId, {
      name: siteNameInput.value,
      url: siteUrlInput.value,
    });
    return;
  }

  controller.submitCustomSite({
    name: siteNameInput.value,
    url: siteUrlInput.value,
  });
});

closeTextPromptButton.addEventListener("click", () => {
  completeTextPrompt(null);
});

cancelTextPromptButton.addEventListener("click", () => {
  completeTextPrompt(null);
});

textPromptModal.addEventListener("click", (event) => {
  if (event.target === textPromptModal) {
    completeTextPrompt(null);
  }
});

textPromptForm.addEventListener("submit", (event) => {
  event.preventDefault();
  completeTextPrompt(textPromptInput.value);
});

sidebar.addEventListener("contextmenu", (event) => {
  const isWorkspaceItem = event.target.closest(".service-button, .group-button");
  const isFooter = event.target.closest(".sidebar-footer");
  const isBrand = event.target.closest(".brand");
  if (isWorkspaceItem || isFooter || isBrand) {
    return;
  }

  openContextMenu(event, [
    {
      label: "\u6dfb\u52a0\u7f51\u9875",
      action: () => controller.openAddSite(),
    },
    {
      label: "\u65b0\u5efa\u5206\u7ec4",
      action: async () => {
        const groupName = await view.prompt("\u8bf7\u8f93\u5165\u65b0\u5206\u7ec4\u540d\u79f0", "");
        if (groupName !== null) {
          controller.createGroup(groupName);
        }
      },
    },
  ]);
});

window.addEventListener("beforeunload", () => {
  controller.beforeUnload();
});

window.addEventListener("click", closeContextMenu);
window.addEventListener("blur", closeContextMenu);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeContextMenu();
  }
});

setSidebarCollapsed(storageManager.getUiSettings().sidebarCollapsed, false);
controller.start();
