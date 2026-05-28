import type { AppConfig, PinnedApp, RunningApp } from "../ipc";

export const WINDOW_REFRESH_INTERVAL_MS = 2_500;
export const RECENT_ITEM_LIMIT = 12;
export const TASKBAR_OVERLAY_THICKNESS = 80;

export const fallbackConfig: AppConfig = {
  taskbarPosition: "top",
  dockEnabled: false,
  blur: true,
  theme: "dark",
  launcherHotkey: "Alt+N",
  taskbarThickness: 56,
};

export const fallbackApps: RunningApp[] = [
  {
    windowId: "preview-editor",
    title: "Visual Studio Code",
    processId: 1001,
    processPath: null,
    isForeground: true,
    isMinimized: false,
  },
  {
    windowId: "preview-terminal",
    title: "Windows Terminal",
    processId: 1002,
    processPath: null,
    isForeground: false,
    isMinimized: false,
  },
  {
    windowId: "preview-browser",
    title: "Microsoft Edge",
    processId: 1003,
    processPath: null,
    isForeground: false,
    isMinimized: true,
  },
];

export const fallbackPinnedApps: PinnedApp[] = [
  {
    id: "explorer",
    name: "Explorer",
    path: "explorer.exe",
    iconPath: null,
    sortOrder: 0,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: "terminal",
    name: "Terminal",
    path: "wt.exe",
    iconPath: null,
    sortOrder: 1,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: "browser",
    name: "Browser",
    path: "msedge.exe",
    iconPath: null,
    sortOrder: 2,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: "notepad",
    name: "Notepad",
    path: "notepad.exe",
    iconPath: null,
    sortOrder: 3,
    createdAt: 0,
    updatedAt: 0,
  },
];
