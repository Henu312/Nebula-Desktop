import { motion } from "framer-motion";
import { TaskbarBadge } from "./TaskbarBadge";
import type { TaskbarItemProps } from "./taskbar.types";

export function TaskbarItem({
  app,
  vertical,
  badgeStatus,
  onActivate,
}: TaskbarItemProps) {
  const label = app.title.trim().charAt(0).toUpperCase() || "A";

  return (
    <motion.button
      type="button"
      title={app.title}
      whileHover={{ y: vertical ? 0 : -3, x: vertical ? 3 : 0 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onActivate(app)}
      className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.07] text-sm font-semibold text-slate-100 shadow-sm outline-none transition-colors hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-nebula-accent/70"
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-slate-100/10">
        {label}
      </span>
      {app.isForeground ? (
        <span
          className={
            vertical
              ? "absolute right-0 h-5 w-1 rounded-full bg-nebula-accent"
              : "absolute bottom-0 h-1 w-5 rounded-full bg-nebula-accent"
          }
        />
      ) : null}
      <TaskbarBadge status={badgeStatus} />
    </motion.button>
  );
}
