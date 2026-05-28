import type {
  AppSearchResult,
  PinnedApp,
  RecentItem,
  RunningApp,
} from "../../ipc";

export type LauncherProps = {
  open: boolean;
  pinnedApps: PinnedApp[];
  runningApps: RunningApp[];
  recentItems: RecentItem[];
  onClose: () => void;
  onLaunchPinnedApp: (app: PinnedApp) => void;
  onLaunchSearchApp: (app: AppSearchResult) => void;
  onOpenRecentItem: (item: RecentItem) => void;
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
      kind: "app";
      title: string;
      subtitle: string;
      app: AppSearchResult;
    }
  | {
      id: string;
      kind: "recent";
      title: string;
      subtitle: string;
      item: RecentItem;
    }
  | {
      id: string;
      kind: "running";
      title: string;
      subtitle: string;
      app: RunningApp;
    };
