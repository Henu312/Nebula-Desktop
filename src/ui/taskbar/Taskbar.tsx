import { motion } from "framer-motion";
import { TaskbarItem } from "./TaskbarItem";
import { TaskbarPinnedItem } from "./TaskbarPinnedItem";
import { TaskbarStatusArea } from "./TaskbarStatusArea";
import type { TaskbarProps } from "./taskbar.types";

const positionClass = {
  top: "left-1/2 top-5 h-16 w-[min(1180px,calc(100vw-48px))] -translate-x-1/2 flex-row",
  bottom:
    "bottom-5 left-1/2 h-16 w-[min(1180px,calc(100vw-48px))] -translate-x-1/2 flex-row",
  left: "left-5 top-1/2 h-[min(820px,calc(100vh-48px))] w-16 -translate-y-1/2 flex-col",
  right:
    "right-5 top-1/2 h-[min(820px,calc(100vh-48px))] w-16 -translate-y-1/2 flex-col",
} as const;

const overlayPositionClass = {
  top: "inset-x-3 top-2 bottom-2 flex-row",
  bottom: "inset-x-3 top-2 bottom-2 flex-row",
  left: "inset-y-3 left-2 right-2 flex-col",
  right: "inset-y-3 left-2 right-2 flex-col",
} as const;

export function Taskbar({
  mode = "desktop",
  position,
  pinnedApps,
  runningApps,
  notificationIndicators,
  ipcState,
  appVersion,
  onLaunchPinnedApp,
  onActivateRunningApp,
  onOpenLauncher,
  onOpenControlCenter,
}: TaskbarProps) {
  const vertical = position === "left" || position === "right";
  const visiblePinnedApps = pinnedApps.slice(0, vertical ? 5 : 6);
  const visibleApps = runningApps.slice(0, vertical ? 7 : 10);
  const placementClass =
    mode === "overlay" ? overlayPositionClass[position] : positionClass[position];

  return (
    <motion.nav
      initial={{ opacity: 0, y: vertical ? 0 : -8, x: vertical ? -8 : 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.22 }}
      className={`fixed z-30 flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-nebula-panel/82 p-2 shadow-2xl shadow-black/35 backdrop-blur-xl ${placementClass}`}
    >
      <button
        type="button"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-nebula-accent text-sm font-black text-slate-950 shadow-lg shadow-nebula-accent/20 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/80"
        title="打开 Launcher"
        onClick={onOpenLauncher}
      >
        N
      </button>

      <div
        className={
          vertical
            ? "flex min-h-0 flex-1 flex-col items-center gap-2 overflow-hidden"
            : "flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden"
        }
      >
        {visiblePinnedApps.map((app) => (
          <TaskbarPinnedItem
            key={app.id}
            app={app}
            vertical={vertical}
            isRunning={isPinnedAppRunning(app.path, runningApps)}
            isForeground={isPinnedAppForeground(app.path, runningApps)}
            badgeStatus={pinnedBadgeStatus(
              app.path,
              runningApps,
              notificationIndicators,
            )}
            onLaunch={onLaunchPinnedApp}
          />
        ))}
        {visiblePinnedApps.length > 0 && visibleApps.length > 0 ? (
          <span
            className={
              vertical
                ? "my-1 h-px w-8 shrink-0 bg-white/12"
                : "mx-1 h-8 w-px shrink-0 bg-white/12"
            }
          />
        ) : null}
        {visibleApps.map((app) => (
          <TaskbarItem
            key={app.windowId}
            app={app}
            vertical={vertical}
            badgeStatus={runningBadgeStatus(app, notificationIndicators)}
            onActivate={onActivateRunningApp}
          />
        ))}
      </div>

      <TaskbarStatusArea
        vertical={vertical}
        ipcState={ipcState}
        appCount={runningApps.length}
        appVersion={appVersion}
        onOpenControlCenter={onOpenControlCenter}
      />
    </motion.nav>
  );
}

function isPinnedAppRunning(path: string, runningApps: TaskbarProps["runningApps"]) {
  const pinnedExecutable = executableName(path);

  if (!pinnedExecutable) {
    return false;
  }

  return runningApps.some((app) => executableName(app.processPath) === pinnedExecutable);
}

function isPinnedAppForeground(
  path: string,
  runningApps: TaskbarProps["runningApps"],
) {
  const pinnedExecutable = executableName(path);

  if (!pinnedExecutable) {
    return false;
  }

  return runningApps.some(
    (app) => app.isForeground && executableName(app.processPath) === pinnedExecutable,
  );
}

function pinnedBadgeStatus(
  path: string,
  runningApps: TaskbarProps["runningApps"],
  notificationIndicators: TaskbarProps["notificationIndicators"],
) {
  const pinnedExecutable = executableName(path);

  if (!pinnedExecutable) {
    return undefined;
  }

  const runningApp = runningApps.find(
    (app) => executableName(app.processPath) === pinnedExecutable,
  );

  return runningApp ? runningBadgeStatus(runningApp, notificationIndicators) : undefined;
}

function runningBadgeStatus(
  app: TaskbarProps["runningApps"][number],
  notificationIndicators: TaskbarProps["notificationIndicators"],
) {
  const indicator = notificationIndicators.find(
    (item) => item.windowId === app.windowId || item.processId === app.processId,
  );

  if (indicator) {
    return indicator.status;
  }

  if (app.isMinimized) {
    return "attention";
  }

  return app.isForeground ? "active" : "normal";
}

function executableName(path?: string | null) {
  if (!path) {
    return "";
  }

  return path.split(/[\\/]/).pop()?.toLowerCase() ?? "";
}
