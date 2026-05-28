import { useEffect, useMemo, useState } from "react";
import {
  activateWindow,
  getAppVersion,
  getConfig,
  getForegroundWindow,
  getNotificationIndicators,
  getRunningApps,
  getStorageStatus,
  getSystemStatus,
  launchApp,
  listPinnedApps,
  listRecentItems,
  restoreWindow,
  upsertRecentItem,
} from "../ipc";
import type {
  AppConfig,
  AppSearchResult,
  AppVersion,
  NotificationIndicator,
  PinnedApp,
  RecentItem,
  RunningApp,
  StorageStatus,
  SystemStatus,
} from "../ipc";
import { ControlCenter } from "../ui/control-center";
import { Launcher } from "../ui/launcher";
import { Taskbar } from "../ui/taskbar";
import {
  fallbackApps,
  fallbackConfig,
  fallbackPinnedApps,
  RECENT_ITEM_LIMIT,
  WINDOW_REFRESH_INTERVAL_MS,
} from "./desktopDefaults";

type IpcState = "loading" | "ready" | "browser";

export function App() {
  const [appVersion, setAppVersion] = useState<AppVersion | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig>(fallbackConfig);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [pinnedApps, setPinnedApps] = useState<PinnedApp[]>(fallbackPinnedApps);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [runningApps, setRunningApps] = useState<RunningApp[]>(fallbackApps);
  const [notificationIndicators, setNotificationIndicators] = useState<
    NotificationIndicator[]
  >([]);
  const [foregroundWindow, setForegroundWindow] = useState<RunningApp | null>(
    fallbackApps[0],
  );
  const [ipcState, setIpcState] = useState<IpcState>("loading");
  const [launchMessage, setLaunchMessage] = useState("Pinned apps ready");
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDesktopState() {
      try {
        const [
          version,
          status,
          config,
          storage,
          pinned,
          recent,
          apps,
          foreground,
          indicators,
        ] =
          await Promise.all([
            getAppVersion(),
            getSystemStatus(),
            getConfig(),
            getStorageStatus(),
            listPinnedApps(),
            listRecentItems(RECENT_ITEM_LIMIT),
            getRunningApps(),
            getForegroundWindow(),
            getNotificationIndicators(),
          ]);

        if (!cancelled) {
          setAppVersion(version);
          setSystemStatus(status);
          setAppConfig(config);
          setStorageStatus(storage);
          setPinnedApps(pinned.length > 0 ? pinned : fallbackPinnedApps);
          setRecentItems(recent);
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
          setForegroundWindow(foreground ?? apps[0] ?? fallbackApps[0]);
          setNotificationIndicators(indicators);
          setIpcState("ready");
        }
      } catch {
        if (!cancelled) {
          setIpcState("browser");
        }
      }
    }

    loadDesktopState();

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
        const [apps, foreground, indicators] = await Promise.all([
          getRunningApps(),
          getForegroundWindow(),
          getNotificationIndicators(),
        ]);

        if (!cancelled) {
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
          setForegroundWindow(foreground ?? apps[0] ?? fallbackApps[0]);
          setNotificationIndicators(indicators);
        }
      } catch {
        if (!cancelled) {
          setLaunchMessage("Window refresh failed");
        }
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

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if (event.altKey && event.code === "KeyN") {
        event.preventDefault();
        setControlCenterOpen(false);
        setLauncherOpen((open) => !open);
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const activeTitle = foregroundWindow?.title ?? "Nebula Desktop";
  const workspacePadding = useMemo(
    () => workspacePaddingClass(appConfig.taskbarPosition),
    [appConfig.taskbarPosition],
  );

  async function handleLaunchPinnedApp(app: PinnedApp) {
    if (ipcState !== "ready") {
      setLaunchMessage(`${app.name} preview`);
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
      setLaunchMessage(`${app.name} launched`);
      window.setTimeout(async () => {
        try {
          const [apps, foreground] = await Promise.all([
            getRunningApps(),
            getForegroundWindow(),
          ]);
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
          setForegroundWindow(foreground ?? apps[0] ?? fallbackApps[0]);
        } catch {
          setLaunchMessage(`${app.name} launched, refresh failed`);
        }
      }, 800);
    } catch {
      setLaunchMessage(`${app.name} launch failed`);
    }
  }

  async function handleLaunchSearchApp(app: AppSearchResult) {
    if (ipcState !== "ready") {
      setLaunchMessage(`${app.name} preview`);
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
      setLaunchMessage(`${app.name} launched`);
      window.setTimeout(async () => {
        try {
          const [apps, foreground] = await Promise.all([
            getRunningApps(),
            getForegroundWindow(),
          ]);
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
          setForegroundWindow(foreground ?? apps[0] ?? fallbackApps[0]);
        } catch {
          setLaunchMessage(`${app.name} launched, refresh failed`);
        }
      }, 800);
    } catch {
      setLaunchMessage(`${app.name} launch failed`);
    }
  }

  async function handleOpenRecentItem(item: RecentItem) {
    if (ipcState !== "ready") {
      setLaunchMessage(`${item.title} preview`);
      return;
    }

    try {
      await launchApp(item.path);
      await recordRecentItem({
        ...item,
        lastOpenedAt: Date.now(),
      });
      setLaunchMessage(`${item.title} opened`);
    } catch {
      setLaunchMessage(`${item.title} open failed`);
    }
  }

  async function recordRecentItem(item: RecentItem) {
    try {
      await upsertRecentItem(item);
      setRecentItems(await listRecentItems(RECENT_ITEM_LIMIT));
    } catch {
      setLaunchMessage(`${item.title} opened, recent update failed`);
    }
  }

  async function handleActivateRunningApp(app: RunningApp) {
    if (ipcState !== "ready") {
      setForegroundWindow(app);
      setRunningApps((current) =>
        current.map((item) => ({
          ...item,
          isForeground: item.windowId === app.windowId,
        })),
      );
      setLaunchMessage(`${app.title} preview`);
      return;
    }

    try {
      if (app.isMinimized) {
        await restoreWindow(app.windowId);
      } else {
        await activateWindow(app.windowId);
      }

      setLaunchMessage(`${app.title} active`);
      window.setTimeout(async () => {
        try {
          const [apps, foreground] = await Promise.all([
            getRunningApps(),
            getForegroundWindow(),
          ]);
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
          setForegroundWindow(foreground ?? apps[0] ?? fallbackApps[0]);
        } catch {
          setLaunchMessage(`${app.title} active, refresh failed`);
        }
      }, 250);
    } catch {
      setLaunchMessage(`${app.title} activate failed`);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-nebula-bg text-slate-100">
      <DesktopBackdrop />
      <Taskbar
        position={appConfig.taskbarPosition}
        pinnedApps={pinnedApps}
        runningApps={runningApps}
        notificationIndicators={notificationIndicators}
        activeWindowId={foregroundWindow?.windowId}
        ipcState={ipcState}
        appVersion={appVersion?.version}
        onLaunchPinnedApp={handleLaunchPinnedApp}
        onActivateRunningApp={handleActivateRunningApp}
        onOpenLauncher={() => {
          setControlCenterOpen(false);
          setLauncherOpen(true);
        }}
        onOpenControlCenter={() => {
          setLauncherOpen(false);
          setControlCenterOpen(true);
        }}
      />
      <Launcher
        open={launcherOpen}
        pinnedApps={pinnedApps}
        runningApps={runningApps}
        recentItems={recentItems}
        onClose={() => setLauncherOpen(false)}
        onLaunchPinnedApp={handleLaunchPinnedApp}
        onLaunchSearchApp={handleLaunchSearchApp}
        onOpenRecentItem={handleOpenRecentItem}
        onActivateRunningApp={handleActivateRunningApp}
      />
      <ControlCenter
        open={controlCenterOpen}
        position={appConfig.taskbarPosition}
        ipcState={ipcState}
        appCount={runningApps.length}
        systemStatus={systemStatus}
        onClose={() => setControlCenterOpen(false)}
      />

      <section className={`relative z-10 min-h-screen ${workspacePadding}`}>
        <div className="grid min-h-screen grid-cols-12 gap-5 p-6">
          <div className="col-span-12 flex items-end lg:col-span-7">
            <WorkspaceWindow
              title={activeTitle}
              subtitle={
                systemStatus
                  ? `${systemStatus.platform}/${systemStatus.arch}`
                  : "browser preview"
              }
              large
            />
          </div>
          <div className="col-span-12 flex flex-col justify-end gap-5 lg:col-span-5">
            <CompactPanel
              title="Storage"
              value={
                storageStatus
                  ? `${storageStatus.tables.length} tables`
                  : "preview"
              }
            />
            <CompactPanel
              title="Config"
              value={`${appConfig.theme} / ${appConfig.taskbarPosition}`}
            />
            <CompactPanel title="Pinned" value={`${pinnedApps.length} apps`} />
            <CompactPanel title="Launch" value={launchMessage} />
          </div>
        </div>
      </section>
    </main>
  );
}

function DesktopBackdrop() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(104,216,194,0.24),transparent_32%),radial-gradient(circle_at_16%_82%,rgba(243,181,98,0.18),transparent_30%),linear-gradient(135deg,#101214,#1d2b2f_44%,#2b2631)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
    </div>
  );
}

function WorkspaceWindow({
  title,
  subtitle,
  large = false,
}: {
  title: string;
  subtitle: string;
  large?: boolean;
}) {
  return (
    <div
      className={`w-full rounded-2xl border border-white/10 bg-slate-950/42 shadow-2xl shadow-black/30 backdrop-blur-md ${
        large ? "min-h-[430px]" : "min-h-52"
      }`}
    >
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-5">
        <span className="h-3 w-3 rounded-full bg-[#f26b64]" />
        <span className="h-3 w-3 rounded-full bg-nebula-warm" />
        <span className="h-3 w-3 rounded-full bg-nebula-accent" />
        <div className="ml-4 min-w-0">
          <p className="truncate text-sm font-semibold text-slate-200">{title}</p>
          <p className="truncate text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div className="h-5 w-44 rounded bg-nebula-accent/70" />
        <div className="h-3 w-4/5 rounded bg-slate-400/20" />
        <div className="h-3 w-3/5 rounded bg-slate-400/16" />
        <div className="grid gap-3 pt-6 sm:grid-cols-3">
          <div className="h-28 rounded-lg border border-white/8 bg-white/[0.045]" />
          <div className="h-28 rounded-lg border border-white/8 bg-white/[0.055]" />
          <div className="h-28 rounded-lg border border-white/8 bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

function CompactPanel({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/38 p-5 shadow-xl shadow-black/20 backdrop-blur-md">
      <p className="text-xs font-medium uppercase text-slate-500">{title}</p>
      <p className="mt-2 truncate text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function workspacePaddingClass(position: AppConfig["taskbarPosition"]) {
  switch (position) {
    case "bottom":
      return "pb-24";
    case "left":
      return "pl-24";
    case "right":
      return "pr-24";
    case "top":
    default:
      return "pt-24";
  }
}

function recentItemId(kind: string, path: string) {
  return `${kind}:${path.trim().toLowerCase()}`;
}
