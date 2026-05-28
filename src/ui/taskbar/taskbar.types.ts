import type {
  NotificationIndicator,
  PinnedApp,
  RunningApp,
  TaskbarPosition,
} from "../../ipc";

export type NotificationBadgeStatus = "normal" | "active" | "attention";

export type TaskbarProps = {
  mode?: "desktop" | "overlay";
  position: TaskbarPosition;
  pinnedApps: PinnedApp[];
  runningApps: RunningApp[];
  notificationIndicators: NotificationIndicator[];
  activeWindowId?: string;
  ipcState: "loading" | "ready" | "browser";
  appVersion?: string;
  onLaunchPinnedApp: (app: PinnedApp) => void;
  onActivateRunningApp: (app: RunningApp) => void;
  onOpenLauncher: () => void;
  onOpenControlCenter: () => void;
};

export type TaskbarItemProps = {
  app: RunningApp;
  vertical: boolean;
  badgeStatus?: NotificationBadgeStatus;
  onActivate: (app: RunningApp) => void;
};

export type TaskbarPinnedItemProps = {
  app: PinnedApp;
  vertical: boolean;
  isRunning: boolean;
  isForeground: boolean;
  badgeStatus?: NotificationBadgeStatus;
  onLaunch: (app: PinnedApp) => void;
};
