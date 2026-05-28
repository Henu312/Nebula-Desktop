import type { PinnedApp, RunningApp } from "../../ipc";

export type LauncherProps = {
  open: boolean;
  pinnedApps: PinnedApp[];
  runningApps: RunningApp[];
  onClose: () => void;
  onLaunchPinnedApp: (app: PinnedApp) => void;
  onActivateRunningApp: (app: RunningApp) => void;
};

export type LauncherResult =
  | {
      id: string;
      kind: "pinned";
      title: string;
      subtitle: string;
      app: PinnedApp;
    }
  | {
      id: string;
      kind: "running";
      title: string;
      subtitle: string;
      app: RunningApp;
    };
