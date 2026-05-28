import { useEffect, useState } from "react";
import {
  getConfig,
  getRunningApps,
  getSystemStatus,
} from "../ipc";
import type { AppConfig, RunningApp, SystemStatus } from "../ipc";
import { ControlCenter } from "../ui/control-center";
import {
  fallbackApps,
  fallbackConfig,
  WINDOW_REFRESH_INTERVAL_MS,
} from "./desktopDefaults";
import { hideCurrentWindow } from "./overlayWindows";

type IpcState = "loading" | "ready" | "browser";

export function ControlCenterOverlayApp() {
  const [appConfig, setAppConfig] = useState<AppConfig>(fallbackConfig);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [runningApps, setRunningApps] = useState<RunningApp[]>(fallbackApps);
  const [ipcState, setIpcState] = useState<IpcState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadControlCenterState() {
      try {
        const [config, status, apps] = await Promise.all([
          getConfig(),
          getSystemStatus(),
          getRunningApps(),
        ]);

        if (!cancelled) {
          setAppConfig(config);
          setSystemStatus(status);
          setRunningApps(apps.length > 0 ? apps : fallbackApps);
          setIpcState("ready");
        }
      } catch {
        if (!cancelled) {
          setIpcState("browser");
        }
      }
    }

    loadControlCenterState();

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
        // Control Center overlay 保留上一帧，避免面板闪烁。
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

  return (
    <main className="h-screen w-screen overflow-hidden bg-transparent text-slate-100">
      <ControlCenter
        open
        position={appConfig.taskbarPosition}
        ipcState={ipcState}
        appCount={runningApps.length}
        systemStatus={systemStatus}
        onClose={() => {
          hideCurrentWindow().catch(() => undefined);
        }}
      />
    </main>
  );
}
