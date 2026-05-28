import { motion } from "framer-motion";
import type { TaskbarPinnedItemProps } from "./taskbar.types";

export function TaskbarPinnedItem({
  app,
  vertical,
  isRunning,
  isForeground,
  onLaunch,
}: TaskbarPinnedItemProps) {
  const label = app.name.trim().charAt(0).toUpperCase() || "P";

  return (
    <motion.button
      type="button"
      title={`${app.name} - ${app.path}`}
      whileHover={{ y: vertical ? 0 : -3, x: vertical ? 3 : 0 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onLaunch(app)}
      className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-nebula-accent/30 bg-nebula-accent/14 text-sm font-bold text-nebula-accent shadow-sm outline-none transition-colors hover:bg-nebula-accent/20 focus-visible:ring-2 focus-visible:ring-nebula-accent/70"
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-nebula-accent/12">
        {label}
      </span>
      <span
        className={
          vertical
            ? "absolute left-0 h-5 w-1 rounded-full bg-nebula-accent/80"
            : "absolute top-0 h-1 w-5 rounded-full bg-nebula-accent/80"
        }
      />
      {isRunning ? (
        <span
          className={
            vertical
              ? "absolute right-0 h-4 w-1 rounded-full bg-white/70"
              : "absolute bottom-0 h-1 w-4 rounded-full bg-white/70"
          }
        />
      ) : null}
      {isForeground ? (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-nebula-warm" />
      ) : null}
    </motion.button>
  );
}
