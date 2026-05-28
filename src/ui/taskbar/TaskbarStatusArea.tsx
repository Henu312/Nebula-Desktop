import { useEffect, useState } from "react";

type TaskbarStatusAreaProps = {
  vertical: boolean;
  ipcState: "loading" | "ready" | "browser";
  appCount: number;
  appVersion?: string;
};

export function TaskbarStatusArea({
  vertical,
  ipcState,
  appCount,
  appVersion,
}: TaskbarStatusAreaProps) {
  const [time, setTime] = useState(() => formatTime());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatTime()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className={
        vertical
          ? "flex flex-col items-center gap-2"
          : "flex items-center gap-2"
      }
    >
      <StatusChip label={ipcState} vertical={vertical} />
      <StatusChip label={`${appCount}`} vertical={vertical} />
      <StatusChip label={appVersion ?? time} vertical={vertical} />
      <StatusChip label={time} vertical={vertical} />
    </div>
  );
}

function StatusChip({ label, vertical }: { label: string; vertical: boolean }) {
  return (
    <span
      className={
        vertical
          ? "grid min-h-9 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.06] px-1 text-[11px] font-medium text-slate-300"
          : "rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-slate-300"
      }
    >
      {label}
    </span>
  );
}

function formatTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}
