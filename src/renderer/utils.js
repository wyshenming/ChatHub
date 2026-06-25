import { defaultTaskSeeds, text } from "./constants.js";

export function now() {
  return new Date().toISOString();
}

export function statusLabel(value) {
  return text[value] || value;
}

export function normalizeUrl(value) {
  const trimmed = value.trim();
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(candidate);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(text.invalidUrl);
  }

  return url.toString();
}

export function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function fallbackUrlForTask(seed) {
  const defaultSeed = defaultTaskSeeds.find((task) => task.id === seed.id);
  return defaultSeed?.url || seed.initialUrl || seed.url || "";
}

export function originFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}
