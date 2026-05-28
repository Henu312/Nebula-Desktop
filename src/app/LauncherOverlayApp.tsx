import { useEffect, useState } from "react";
import {
  activateWindow,
  getRunningApps,
  launchApp,
  listPinnedApps,
  listRecentItems,
  restoreWindow,
  upsertRecentItem,
} from "../ipc";
import type { AppSearchResult, PinnedApp, RecentItem, RunningApp } from "../ipc";
import { Launcher } from "../ui/launcher";
import {
  fallbackApps,
  fallbackPinnedApps,
  RECENT_ITEM_LIMIT,
  WINDOW_REFRESH_INTERVAL_MS,
} from "./desktopDefaults";
import { hideCurrentWindow } from "./overlayWindows";

type IpcState = "loading" | "ready" | "browser";

export function LauncherOverlayApp() {
  const [pinnedApps, setPinnedApps] = useState<PinnedApp[]>(fallbackPinnedApps);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [runningApps, setRunningApps] = useState<RunningApp[]>(fallbackApps);
  const [ipcState, setIpcState] = useState<IpcState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadLauncherState() {
      try {
        const [pinned, recent, apps] = await Promise.all([
          listPinnedApps(),
          listRecentItems(RECENT_ITEM_LIMIT),
          getRunningApps(),
        ]);

        if (!cancelled) {
          setPinnedApps(pinned.length > 0 ? pinned : fallbackPinnedApps);
          setRecentItems(recent);
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
          setIpcState("ready");
        }
      } catch {
        if (!cancelled) {
          setIpcState("browser");
        }
      }
    }

    loadLauncherState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ipcState !== "ready") {
      return;
    }

    let cancelled = false;

    async function refreshWindowState() {
      try {
        const apps = await getRunningApps();

        if (!cancelled) {
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
        }
      } catch {
        // Launcher overlay 保留上一帧，避免搜索时闪烁。
      }
    }

    const timer = window.setInterval(
      refreshWindowState,
      WINDOW_REFRESH_INTERVAL_MS,
    );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [ipcState]);

  async function handleLaunchPinnedApp(app: PinnedApp) {
    if (ipcState !== "ready") {
      return;
    }

    try {
      await launchApp(app.path);
      await recordRecentItem({
        id: recentItemId("app", app.path),
        kind: "app",
        title: app.name,
        path: app.path,
        lastOpenedAt: Date.now(),
      });
    } catch {
      // 后续接 toast/日志；overlay 当前保持安静失败。
    }
  }

  async function handleLaunchSearchApp(app: AppSearchResult) {
    if (ipcState !== "ready") {
      return;
    }

    try {
      await launchApp(app.path);
      await recordRecentItem({
        id: recentItemId("app", app.path),
        kind: "app",
        title: app.name,
        path: app.path,
        lastOpenedAt: Date.now(),
      });
    } catch {
      // 后续接 toast/日志；overlay 当前保持安静失败。
    }
  }

  async function handleOpenRecentItem(item: RecentItem) {
    if (ipcState !== "ready") {
      return;
    }

    try {
      await launchApp(item.path);
      await recordRecentItem({
        ...item,
        lastOpenedAt: Date.now(),
      });
    } catch {
      // 后续接 toast/日志；overlay 当前保持安静失败。
    }
  }

  async function handleActivateRunningApp(app: RunningApp) {
    if (ipcState !== "ready") {
      return;
    }

    try {
      if (app.isMinimized) {
        await restoreWindow(app.windowId);
      } else {
        await activateWindow(app.windowId);
      }
    } catch {
      // 后续接 toast/日志；overlay 当前保持安静失败。
    }
  }

  async function recordRecentItem(item: RecentItem) {
    try {
      await upsertRecentItem(item);
      setRecentItems(await listRecentItems(RECENT_ITEM_LIMIT));
    } catch {
      // 最近项目写入失败不阻断启动动作。
    }
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-transparent text-slate-100">
      <Launcher
        open
        pinnedApps={pinnedApps}
        runningApps={runningApps}
        recentItems={recentItems}
        onClose={() => {
          hideCurrentWindow().catch(() => undefined);
        }}
        onLaunchPinnedApp={handleLaunchPinnedApp}
        onLaunchSearchApp={handleLaunchSearchApp}
        onOpenRecentItem={handleOpenRecentItem}
        onActivateRunningApp={handleActivateRunningApp}
      />
    </main>
  );
}

function recentItemId(kind: string, path: string) {
  return `${kind}:${path.trim().toLowerCase()}`;
}
