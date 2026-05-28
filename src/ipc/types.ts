export type NebulaError = {
  code: string;
  message: string;
  detail?: string | null;
};

export type AppVersion = {
  name: string;
  version: string;
};

export type SystemStatus = {
  platform: string;
  arch: string;
  debug: boolean;
};

export type TaskbarPosition = "top" | "bottom" | "left" | "right";

export type Theme = "dark" | "light" | "system";

export type AppConfig = {
  taskbarPosition: TaskbarPosition;
  dockEnabled: boolean;
  blur: boolean;
  theme: Theme;
  launcherHotkey: string;
  taskbarThickness: number;
};

export type StorageStatus = {
  path: string;
  tables: string[];
};

export type PinnedApp = {
  id: string;
  name: string;
  path: string;
  iconPath?: string | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

export type RecentItem = {
  id: string;
  kind: string;
  title: string;
  path: string;
  lastOpenedAt: number;
};

export type AppCacheItem = {
  id: string;
  name: string;
  path: string;
  iconCacheKey?: string | null;
  updatedAt: number;
};

export type RunningApp = {
  windowId: string;
  title: string;
  processId: number;
  processPath?: string | null;
  isForeground: boolean;
  isMinimized: boolean;
};
