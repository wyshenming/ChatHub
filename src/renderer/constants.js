export const TASKS_STORAGE_KEY = "chathub.tasks.v1";
export const LEGACY_CUSTOM_SERVICES_KEY = "chathub.customServices.v1";
export const RUNTIME_PARTITION = "persist:chathub-runtime";

export const TaskStatus = {
  RUNNING: "running",
  PAUSED: "paused",
  FINISHED: "finished",
};

export const text = {
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
  clearAllConfirm:
    "\u8981\u6e05\u7406\u6240\u6709\u4efb\u52a1\u7684\u767b\u5f55\u72b6\u6001\u548c\u7f13\u5b58\u5417\uff1f",
};

export const defaultTaskSeeds = [
  {
    id: "task-chatgpt",
    title: "ChatGPT",
    url: "https://chatgpt.com/",
    color: "#10a37f",
    custom: false,
  },
  {
    id: "task-gemini",
    title: "Gemini",
    url: "https://gemini.google.com/app",
    color: "#5b6ee1",
    custom: false,
  },
  {
    id: "task-deepseek",
    title: "DeepSeek",
    url: "https://chat.deepseek.com/",
    color: "#2f6bff",
    custom: false,
  },
];
