import {
  LEGACY_CUSTOM_SERVICES_KEY,
  TASKS_STORAGE_KEY,
  TaskStatus,
  defaultTaskSeeds,
} from "./constants.js";
import { fallbackUrlForTask, isHttpUrl, now, originFromUrl } from "./utils.js";

export function createTask(seed) {
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
    this.activeTaskId = this.tasks[0]?.id;
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
      status: task.status === TaskStatus.FINISHED ? TaskStatus.FINISHED : TaskStatus.PAUSED,
    });
  }
}
