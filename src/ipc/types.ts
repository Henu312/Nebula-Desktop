export type NebulaError = {
  code: string;
  message: string;
  detail?: string | null;
};

export type AppVersion = {
  name: string;
  version: string;
};

export type VolumeStatus = {
  value: number;
};

export type WindowsSettingsPage =
  | "wifi"
  | "bluetooth"
  | "display"
  | "power"
  | "home";

export type AppSearchResult = {
  id: string;
  name: string;
  path: string;
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

export type AppBarRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type AppBarStatus = {
  registered: boolean;
  hwnd?: string | null;
  position?: TaskbarPosition | null;
  thickness?: number | null;
  rect?: AppBarRect | null;
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

export type NotificationIndicatorStatus = "normal" | "active" | "attention";

export type NotificationIndicator = {
  windowId: string;
  processId: number;
  processPath?: string | null;
  status: NotificationIndicatorStatus;
};
