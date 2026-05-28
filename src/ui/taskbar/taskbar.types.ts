import type { PinnedApp, RunningApp, TaskbarPosition } from "../../ipc";

export type TaskbarProps = {
  position: TaskbarPosition;
  pinnedApps: PinnedApp[];
  runningApps: RunningApp[];
  activeWindowId?: string;
  ipcState: "loading" | "ready" | "browser";
  appVersion?: string;
  onLaunchPinnedApp: (app: PinnedApp) => void;
  onActivateRunningApp: (app: RunningApp) => void;
  onOpenLauncher: () => void;
};

export type TaskbarItemProps = {
  app: RunningApp;
  vertical: boolean;
  onActivate: (app: RunningApp) => void;
};

export type TaskbarPinnedItemProps = {
  app: PinnedApp;
  vertical: boolean;
  isRunning: boolean;
  isForeground: boolean;
  onLaunch: (app: PinnedApp) => void;
};
