import {
  APP_VERSION_STORAGE_KEY,
  DEFAULT_GROUP_ID,
  GROUPS_STORAGE_KEY,
  LEGACY_CUSTOM_SERVICES_KEY,
  TASKS_STORAGE_KEY,
  TaskStatus,
  defaultTaskSeeds,
  text,
} from "./constants.js";
import { fallbackUrlForTask, isHttpUrl, now, originFromUrl } from "./utils.js";

export function createTask(seed) {
  const timestamp = now();
  const candidateUrl = seed.url || seed.lastUrl || seed.initialUrl;
  const fallbackUrl = fallbackUrlForTask(seed);
  const url = isHttpUrl(candidateUrl) ? candidateUrl : fallbackUrl;
  const groupId = seed.groupId || seed.group || DEFAULT_GROUP_ID;
  const hidden = false;

  return {
    id: seed.id,
    title: seed.title,
    name: seed.name || seed.title,
    deleted: Boolean(seed.deleted),
    url,
    initialUrl: seed.initialUrl || url,
    origin: seed.origin || originFromUrl(url),
    color: seed.color || "#172033",
    custom: Boolean(seed.custom),
    groupId,
    group: groupId,
    hidden: Boolean(hidden),
    visible: !hidden,
    status: seed.status || TaskStatus.PAUSED,
    messages: Array.isArray(seed.messages) ? seed.messages : [],
    inputDraft: seed.inputDraft || "",
    scroll: seed.scroll || { x: 0, y: 0 },
    createdAt: seed.createdAt || timestamp,
    updatedAt: seed.updatedAt || timestamp,
  };
}

export function createGroup(seed) {
  const timestamp = now();

  return {
    id: seed.id,
    name: seed.name,
    collapsed: Boolean(seed.collapsed),
    createdAt: seed.createdAt || timestamp,
    updatedAt: seed.updatedAt || timestamp,
  };
}

export function createCustomTask(name, url) {
  const id = `task-custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return createTask({
    id,
    title: name.trim(),
    url,
    color: "#172033",
    custom: true,
  });
}

export class TaskManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.tasks = this.loadTasks();
    this.groups = this.loadGroups();
    this.migrateForAppVersion(window.aiChatHub?.version || "unknown");
    this.normalizeTaskGroups();
    this.activeTaskId = this.all()[0]?.id;
  }

  loadTasks() {
    const saved = this.storageManager.readJson(TASKS_STORAGE_KEY);

    if (Array.isArray(saved) && saved.length > 0) {
      return this.mergeDefaultTasks(saved.map((task) => createTask(task)));
    }

    const legacyCustomTasks = this.loadLegacyCustomTasks();
    return [...defaultTaskSeeds.map((seed) => createTask(seed)), ...legacyCustomTasks];
  }

  loadLegacyCustomTasks() {
    const legacyServices = this.storageManager.readJson(LEGACY_CUSTOM_SERVICES_KEY);
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
          custom: true,
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

  persist() {
    this.storageManager.writeJson(TASKS_STORAGE_KEY, this.tasks);
  }

  persistGroups() {
    this.storageManager.writeJson(GROUPS_STORAGE_KEY, this.groups);
  }

  migrateForAppVersion(currentVersion) {
    const savedVersion = this.storageManager.readString(APP_VERSION_STORAGE_KEY);

    if (savedVersion === currentVersion) {
      return;
    }

    this.tasks = this.tasks.map((task) => ({
      ...task,
      inputDraft: "",
      messages: [],
      scroll: { x: 0, y: 0 },
      updatedAt: now(),
    }));
    this.persist();
    this.storageManager.writeString(APP_VERSION_STORAGE_KEY, currentVersion);
  }

  loadGroups() {
    const saved = this.storageManager.readJson(GROUPS_STORAGE_KEY);
    const defaultGroup = createGroup({
      id: DEFAULT_GROUP_ID,
      name: text.defaultGroupName,
      collapsed: false,
    });

    if (!Array.isArray(saved) || saved.length === 0) {
      return [defaultGroup];
    }

    const groups = saved
      .filter((group) => group && group.id && group.name)
      .map((group) => createGroup(group));

    if (!groups.some((group) => group.id === DEFAULT_GROUP_ID)) {
      groups.unshift(defaultGroup);
    }

    return groups;
  }

  normalizeTaskGroups() {
    const groupIds = new Set(this.groups.map((group) => group.id));
    let changed = false;

    this.tasks = this.tasks.map((task) => {
      if (groupIds.has(task.groupId)) {
        return { ...task, group: task.groupId, visible: !task.hidden };
      }

      changed = true;
      return { ...task, groupId: DEFAULT_GROUP_ID, group: DEFAULT_GROUP_ID, visible: !task.hidden };
    });

    if (changed) {
      this.persist();
    }
  }

  all() {
    return this.tasks.filter((task) => !task.deleted);
  }

  allGroups() {
    return this.groups;
  }

  grouped() {
    return this.groups.map((group) => ({
      ...group,
      tasks: this.tasks.filter((task) => task.groupId === group.id && !task.hidden && !task.deleted),
    }));
  }

  active() {
    return this.get(this.activeTaskId);
  }

  get(taskId) {
    return this.tasks.find((task) => task.id === taskId && !task.deleted);
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

  addGroup(name) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error(text.groupNameRequired);
    }

    if (this.groups.some((group) => group.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error(text.duplicateGroupName);
    }

    const group = createGroup({
      id: `group-custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmedName,
    });

    this.groups = [...this.groups, group];
    this.persistGroups();
    return group;
  }

  removeGroup(groupId) {
    if (groupId === DEFAULT_GROUP_ID) {
      throw new Error(text.deleteDefaultGroupDenied);
    }

    const group = this.groups.find((item) => item.id === groupId);
    if (!group) {
      return null;
    }

    this.tasks = this.tasks.map((task) =>
      task.groupId === groupId
        ? {
            ...task,
            groupId: DEFAULT_GROUP_ID,
            group: DEFAULT_GROUP_ID,
            updatedAt: now(),
          }
        : task
    );
    this.groups = this.groups.filter((item) => item.id !== groupId);
    this.persist();
    this.persistGroups();
    return group;
  }

  remove(taskId) {
    const task = this.tasks.find((item) => item.id === taskId && !item.deleted);
    if (!task) {
      return null;
    }

    this.tasks = task.custom
      ? this.tasks.filter((item) => item.id !== taskId)
      : this.tasks.map((item) =>
          item.id === taskId ? { ...item, deleted: true, updatedAt: now() } : item
        );
    this.activeTaskId = this.all()[0]?.id;
    this.persist();
    return task;
  }

  update(taskId, patch) {
    this.tasks = this.tasks.map((task) =>
      task.id === taskId ? { ...task, ...patch, updatedAt: now() } : task
    );
    this.persist();
  }

  renameTask(taskId, title) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new Error(text.nameRequired);
    }

    if (
      this.all().some(
        (task) => task.id !== taskId && task.title.toLowerCase() === trimmedTitle.toLowerCase()
      )
    ) {
      throw new Error(text.duplicateName);
    }

    this.update(taskId, { title: trimmedTitle, name: trimmedTitle });
  }

  updateTaskSite(taskId, { title, url }) {
    const task = this.get(taskId);
    if (!task) {
      throw new Error(text.addFailed);
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new Error(text.nameRequired);
    }

    if (
      this.all().some(
        (item) => item.id !== taskId && item.title.toLowerCase() === trimmedTitle.toLowerCase()
      )
    ) {
      throw new Error(text.duplicateName);
    }

    const urlChanged = task.url !== url;
    this.update(taskId, {
      title: trimmedTitle,
      name: trimmedTitle,
      url,
      initialUrl: url,
      origin: originFromUrl(url),
      ...(urlChanged
        ? {
            inputDraft: "",
            messages: [],
            scroll: { x: 0, y: 0 },
          }
        : {}),
    });

    return {
      task: this.get(taskId),
      urlChanged,
    };
  }

  renameGroup(groupId, name) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error(text.groupNameRequired);
    }

    if (
      this.groups.some(
        (group) => group.id !== groupId && group.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      throw new Error(text.duplicateGroupName);
    }

    this.updateGroup(groupId, { name: trimmedName });
  }

  updateGroup(groupId, patch) {
    this.groups = this.groups.map((group) =>
      group.id === groupId ? { ...group, ...patch, updatedAt: now() } : group
    );
    this.persistGroups();
  }

  toggleGroup(groupId) {
    const group = this.groups.find((item) => item.id === groupId);
    if (!group) {
      return;
    }

    this.updateGroup(groupId, { collapsed: !group.collapsed });
  }

  reorderGroup(sourceGroupId, targetGroupId) {
    if (sourceGroupId === targetGroupId) {
      return;
    }

    const sourceIndex = this.groups.findIndex((group) => group.id === sourceGroupId);
    const targetIndex = this.groups.findIndex((group) => group.id === targetGroupId);

    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const groups = [...this.groups];
    const [sourceGroup] = groups.splice(sourceIndex, 1);
    groups.splice(targetIndex, 0, { ...sourceGroup, updatedAt: now() });
    this.groups = groups;
    this.persistGroups();
  }

  setTaskGroup(taskId, groupId) {
    if (!this.get(taskId) || !this.groups.some((group) => group.id === groupId)) {
      return;
    }

    this.update(taskId, { groupId, group: groupId, hidden: false, visible: true });
  }

  setTaskHidden(taskId, hidden) {
    if (!this.get(taskId)) {
      return;
    }

    this.update(taskId, { hidden: Boolean(hidden), visible: !hidden });
  }

  showAllTasks() {
    this.tasks = this.tasks.map((task) => ({
      ...task,
      hidden: false,
      visible: true,
      updatedAt: now(),
    }));
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
      status: task.status === TaskStatus.FINISHED ? TaskStatus.FINISHED : TaskStatus.PAUSED,
    });
  }
}
