import type { NotificationBadgeStatus } from "./taskbar.types";

type TaskbarBadgeProps = {
  status?: NotificationBadgeStatus;
};

export function TaskbarBadge({ status }: TaskbarBadgeProps) {
  if (!status) {
    return null;
  }

  return (
    <span
      className={`pointer-events-none absolute right-1.5 top-1.5 rounded-full ${
        status === "attention"
          ? "h-2.5 w-2.5 animate-pulse bg-nebula-warm shadow-[0_0_0_3px_rgba(243,181,98,0.18)]"
          : status === "active"
            ? "h-2 w-2 bg-nebula-accent shadow-[0_0_0_3px_rgba(104,216,194,0.14)]"
            : "h-1.5 w-1.5 bg-slate-400/75"
      }`}
    />
  );
}
