import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  getVolume,
  openWindowsSettings,
  setVolume as writeVolume,
} from "../../ipc";
import type {
  SystemStatus,
  TaskbarPosition,
  WindowsSettingsPage,
} from "../../ipc";

type ControlCenterProps = {
  open: boolean;
  position: TaskbarPosition;
  ipcState: "loading" | "ready" | "browser";
  appCount: number;
  systemStatus: SystemStatus | null;
  onClose: () => void;
};

const panelPositionClass = {
  top: "right-6 top-24",
  bottom: "bottom-24 right-6",
  left: "left-24 top-6",
  right: "right-24 top-6",
} as const;

export function ControlCenter({
  open,
  position,
  ipcState,
  appCount,
  systemStatus,
  onClose,
}: ControlCenterProps) {
  const volumeCommitTimer = useRef<number | null>(null);
  const [volume, setVolume] = useState(42);
  const [volumeState, setVolumeState] = useState<"preview" | "ready" | "error">(
    "preview",
  );
  const [brightness, setBrightness] = useState(68);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [nightModeEnabled, setNightModeEnabled] = useState(false);
  const [settingsState, setSettingsState] = useState<
    "idle" | "opened" | "error"
  >("idle");
  const [powerMode, setPowerMode] = useState<"best" | "balanced" | "save">(
    "balanced",
  );

  useEffect(() => {
    if (!open || ipcState !== "ready") {
      setVolumeState("preview");
      return;
    }

    let cancelled = false;

    async function loadVolume() {
      try {
        const status = await getVolume();

        if (!cancelled) {
          setVolume(status.value);
          setVolumeState("ready");
        }
      } catch {
        if (!cancelled) {
          setVolumeState("error");
        }
      }
    }

    loadVolume();

    return () => {
      cancelled = true;
    };
  }, [open, ipcState]);

  useEffect(() => {
    return () => {
      if (volumeCommitTimer.current !== null) {
        window.clearTimeout(volumeCommitTimer.current);
      }
    };
  }, []);

  function handleVolumeChange(value: number) {
    setVolume(value);

    if (ipcState !== "ready") {
      setVolumeState("preview");
      return;
    }

    if (volumeCommitTimer.current !== null) {
      window.clearTimeout(volumeCommitTimer.current);
    }

    volumeCommitTimer.current = window.setTimeout(async () => {
      try {
        const status = await writeVolume(value);
        setVolume(status.value);
        setVolumeState("ready");
      } catch {
        setVolumeState("error");
      }
    }, 120);
  }

  async function handleOpenSettings(page: WindowsSettingsPage) {
    if (ipcState !== "ready") {
      setSettingsState("error");
      return;
    }

    try {
      await openWindowsSettings(page);
      setSettingsState("opened");
    } catch {
      setSettingsState("error");
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.section
            className={`absolute w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/12 bg-nebula-panel/94 shadow-2xl shadow-black/45 backdrop-blur-xl ${panelPositionClass[position]}`}
            initial={{ opacity: 0, y: position === "bottom" ? 14 : -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "bottom" ? 10 : -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-100">
                  Control Center
                </h2>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {systemStatus
                    ? `${systemStatus.platform} / ${systemStatus.arch}`
                    : "browser preview"}
                </p>
              </div>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-sm text-slate-300 outline-none transition-colors hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-white/75"
                title="关闭"
                onClick={onClose}
              >
                x
              </button>
            </header>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3">
                <ToggleTile
                  title="WiFi"
                  value={wifiEnabled}
                  detail={wifiEnabled ? "已连接" : "已关闭"}
                  onChange={setWifiEnabled}
                />
                <ToggleTile
                  title="蓝牙"
                  value={bluetoothEnabled}
                  detail={bluetoothEnabled ? "可发现" : "未启用"}
                  onChange={setBluetoothEnabled}
                />
              </div>

              <SliderControl
                title="音量"
                value={volume}
                detail={volumeStatusLabel(volumeState)}
                onChange={handleVolumeChange}
              />
              <SliderControl
                title="亮度"
                value={brightness}
                onChange={setBrightness}
              />

              <div className="grid grid-cols-2 gap-3">
                <ToggleTile
                  title="夜间模式"
                  value={nightModeEnabled}
                  detail={nightModeEnabled ? "暖色" : "标准"}
                  onChange={setNightModeEnabled}
                />
                <StatusTile
                  title="运行窗口"
                  value={`${appCount}`}
                  detail={ipcState}
                />
              </div>

              <section className="rounded-xl border border-white/10 bg-white/[0.045] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-300">
                    电源模式
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {powerModeLabel(powerMode)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["best", "balanced", "save"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPowerMode(mode)}
                      className={`h-9 rounded-lg border text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/75 ${
                        powerMode === mode
                          ? "border-nebula-accent/50 bg-nebula-accent/18 text-nebula-accent"
                          : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.07]"
                      }`}
                    >
                      {powerModeLabel(mode)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-2">
                <SettingsButton
                  label="显示设置"
                  onClick={() => handleOpenSettings("display")}
                />
                <SettingsButton
                  label="电源设置"
                  onClick={() => handleOpenSettings("power")}
                />
                <SettingsButton
                  label="WiFi 设置"
                  onClick={() => handleOpenSettings("wifi")}
                />
                <SettingsButton
                  label="蓝牙设置"
                  onClick={() => handleOpenSettings("bluetooth")}
                />
              </section>

              <button
                type="button"
                className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.055] text-sm font-medium text-slate-200 outline-none transition-colors hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-white/75"
                onClick={() => handleOpenSettings("home")}
              >
                {settingsButtonLabel(settingsState)}
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ToggleTile({
  title,
  detail,
  value,
  onChange,
}: {
  title: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`h-24 rounded-xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/75 ${
        value
          ? "border-nebula-accent/45 bg-nebula-accent/15"
          : "border-white/10 bg-white/[0.045] hover:bg-white/[0.07]"
      }`}
    >
      <span className="block text-sm font-semibold text-slate-100">{title}</span>
      <span className="mt-2 block text-xs text-slate-500">{detail}</span>
      <span
        className={`mt-4 block h-1.5 w-10 rounded-full ${
          value ? "bg-nebula-accent" : "bg-slate-600"
        }`}
      />
    </button>
  );
}

function SliderControl({
  title,
  detail,
  value,
  onChange,
}: {
  title: string;
  detail?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-xl border border-white/10 bg-white/[0.045] p-3">
      <span className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-300">
        <span>{title}</span>
        <span>{detail ? `${value}% · ${detail}` : `${value}%`}</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="h-2 w-full accent-nebula-accent"
      />
    </label>
  );
}

function volumeStatusLabel(state: "preview" | "ready" | "error") {
  switch (state) {
    case "ready":
      return "系统";
    case "error":
      return "未同步";
    case "preview":
    default:
      return "预览";
  }
}

function StatusTile({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="h-24 rounded-xl border border-white/10 bg-white/[0.045] p-3">
      <span className="block text-sm font-semibold text-slate-100">{title}</span>
      <span className="mt-2 block text-2xl font-bold text-nebula-warm">
        {value}
      </span>
      <span className="block text-xs text-slate-500">{detail}</span>
    </div>
  );
}

function SettingsButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="h-9 rounded-lg border border-white/10 bg-white/[0.045] text-xs font-medium text-slate-300 outline-none transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-white/75"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function settingsButtonLabel(state: "idle" | "opened" | "error") {
  switch (state) {
    case "opened":
      return "Windows 设置已打开";
    case "error":
      return "无法打开 Windows 设置";
    case "idle":
    default:
      return "打开 Windows 设置";
  }
}

function powerModeLabel(mode: "best" | "balanced" | "save") {
  switch (mode) {
    case "best":
      return "性能";
    case "save":
      return "节能";
    case "balanced":
    default:
      return "均衡";
  }
}
