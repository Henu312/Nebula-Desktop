import { useEffect, useState } from "react";
import {
  activateWindow,
  getAppVersion,
  getConfig,
  getNotificationIndicators,
  getRunningApps,
  launchApp,
  listPinnedApps,
  registerAppBar,
  restoreWindow,
  unregisterAppBar,
} from "../ipc";
import type {
  AppConfig,
  AppVersion,
  NotificationIndicator,
  PinnedApp,
  RunningApp,
} from "../ipc";
import { Taskbar } from "../ui/taskbar";
import {
  fallbackApps,
  fallbackConfig,
  fallbackPinnedApps,
  TASKBAR_OVERLAY_THICKNESS,
  WINDOW_REFRESH_INTERVAL_MS,
} from "./desktopDefaults";
import { hideOverlayWindow, showOverlayWindow } from "./overlayWindows";

type IpcState = "loading" | "ready" | "browser";

export function TaskbarOverlayApp() {
  const [appConfig, setAppConfig] = useState<AppConfig>(fallbackConfig);
  const [appVersion, setAppVersion] = useState<AppVersion | null>(null);
  const [pinnedApps, setPinnedApps] = useState<PinnedApp[]>(fallbackPinnedApps);
  const [runningApps, setRunningApps] = useState<RunningApp[]>(fallbackApps);
  const [notificationIndicators, setNotificationIndicators] = useState<
    NotificationIndicator[]
  >([]);
  const [ipcState, setIpcState] = useState<IpcState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadOverlayState() {
      try {
        const [version, config, pinned, apps, indicators] = await Promise.all([
          getAppVersion(),
          getConfig(),
          listPinnedApps(),
          getRunningApps(),
          getNotificationIndicators(),
        ]);

        if (!cancelled) {
          setAppVersion(version);
          setAppConfig(config);
          setPinnedApps(pinned.length > 0 ? pinned : fallbackPinnedApps);
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
          setNotificationIndicators(indicators);
          setIpcState("ready");
        }
      } catch {
        if (!cancelled) {
          setIpcState("browser");
        }
      }
    }

    loadOverlayState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ipcState !== "ready") {
      return;
    }

    const thickness = Math.max(
      appConfig.taskbarThickness,
      TASKBAR_OVERLAY_THICKNESS,
    );

    async function registerOverlay() {
      try {
        await registerAppBar(appConfig.taskbarPosition, thickness);
      } catch {
        // AppBar 注册失败时仍保留 overlay UI，避免影响桌面可用性。
      }
    }

    registerOverlay();

    return () => {
      unregisterAppBar().catch(() => undefined);
    };
  }, [appConfig.taskbarPosition, appConfig.taskbarThickness, ipcState]);

  useEffect(() => {
    if (ipcState !== "ready") {
      return;
    }

    let cancelled = false;

    async function refreshWindowState() {
      try {
        const [apps, indicators] = await Promise.all([
          getRunningApps(),
          getNotificationIndicators(),
        ]);

        if (!cancelled) {
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
          setNotificationIndicators(indicators);
        }
      } catch {
        // overlay 不显示错误面板，刷新失败时保留上一帧状态。
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
    function unregisterBeforeUnload() {
      unregisterAppBar().catch(() => undefined);
    }

    window.addEventListener("beforeunload", unregisterBeforeUnload);
    return () => window.removeEventListener("beforeunload", unregisterBeforeUnload);
  }, []);

  async function handleLaunchPinnedApp(app: PinnedApp) {
    if (ipcState !== "ready") {
      return;
    }

    try {
      await launchApp(app.path);
    } catch {
      // overlay 保持安静失败，后续可通过 toast/日志窗口补充。
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
      // overlay 保持安静失败，避免状态区闪烁。
    }
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-transparent text-slate-100">
      <Taskbar
        mode="overlay"
        position={appConfig.taskbarPosition}
        pinnedApps={pinnedApps}
        runningApps={runningApps}
        notificationIndicators={notificationIndicators}
        ipcState={ipcState}
        appVersion={appVersion?.version}
        onLaunchPinnedApp={handleLaunchPinnedApp}
        onActivateRunningApp={handleActivateRunningApp}
        onOpenLauncher={() => {
          hideOverlayWindow("control-center").catch(() => undefined);
          showOverlayWindow("launcher").catch(() => undefined);
        }}
        onOpenControlCenter={() => {
          hideOverlayWindow("launcher").catch(() => undefined);
          showOverlayWindow("control-center").catch(() => undefined);
        }}
      />
    </main>
  );
}
