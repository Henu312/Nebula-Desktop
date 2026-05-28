import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchApps } from "../../ipc";
import type { AppSearchResult } from "../../ipc";
import { LauncherInput } from "./LauncherInput";
import { LauncherResultList } from "./LauncherResultList";
import type { LauncherProps, LauncherResult } from "./launcher.types";

const MAX_RESULTS = 8;

export function Launcher({
  open,
  pinnedApps,
  runningApps,
  recentItems,
  onClose,
  onLaunchPinnedApp,
  onLaunchSearchApp,
  onOpenRecentItem,
  onActivateRunningApp,
}: LauncherProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [appResults, setAppResults] = useState<AppSearchResult[]>([]);

  const results = useMemo(
    () => buildResults(query, pinnedApps, runningApps, recentItems, appResults),
    [query, pinnedApps, runningApps, recentItems, appResults],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery("");
    setSelectedIndex(0);
    setAppResults([]);
    window.setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const apps = await searchApps(query);

        if (!cancelled) {
          setAppResults(apps);
        }
      } catch {
        if (!cancelled) {
          setAppResults([]);
        }
      }
    }, 160);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  function execute(result: LauncherResult | undefined) {
    if (!result) {
      return;
    }

    if (result.kind === "pinned") {
      onLaunchPinnedApp(result.app);
    } else if (result.kind === "app") {
      onLaunchSearchApp(result.app);
    } else if (result.kind === "recent") {
      onOpenRecentItem(result.item);
    } else {
      onActivateRunningApp(result.app);
    }

    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) =>
        results.length === 0 ? 0 : (current + 1) % results.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) =>
        results.length === 0
          ? 0
          : (current - 1 + results.length) % results.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      execute(results[selectedIndex]);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 bg-black/30 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/12 bg-nebula-panel/92 shadow-2xl shadow-black/45 backdrop-blur-xl"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <LauncherInput
              ref={inputRef}
              value={query}
              onChange={setQuery}
              onKeyDown={handleKeyDown}
            />
            <LauncherResultList
              results={results}
              selectedIndex={selectedIndex}
              onSelect={execute}
            />
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-xs text-slate-500">
              <span>↑↓ 选择</span>
              <span>Enter 执行 · Esc 关闭</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function buildResults(
  query: string,
  pinnedApps: LauncherProps["pinnedApps"],
  runningApps: LauncherProps["runningApps"],
  recentItems: LauncherProps["recentItems"],
  appResults: AppSearchResult[],
) {
  const normalizedQuery = query.trim().toLowerCase();

  const pinnedResults: LauncherResult[] = pinnedApps.map((app) => ({
    id: `pinned:${app.id}`,
    kind: "pinned",
    title: app.name,
    subtitle: app.path,
    app,
  }));

  const runningResults: LauncherResult[] = runningApps.map((app) => ({
    id: `running:${app.windowId}`,
    kind: "running",
    title: app.title,
    subtitle: app.processPath ?? `PID ${app.processId}`,
    app,
  }));

  const recentResults: LauncherResult[] = recentItems.map((item) => ({
    id: `recent:${item.id}`,
    kind: "recent",
    title: item.title,
    subtitle: item.path,
    item,
  }));

  const appSearchResults: LauncherResult[] = appResults.map((app) => ({
    id: `app:${app.id}`,
    kind: "app",
    title: app.name,
    subtitle: app.path,
    app,
  }));

  return [...pinnedResults, ...runningResults, ...recentResults, ...appSearchResults]
    .filter((result) => {
      if (!normalizedQuery) {
        return true;
      }

      return `${result.title} ${result.subtitle}`.toLowerCase().includes(
        normalizedQuery,
      );
    })
    .slice(0, MAX_RESULTS);
}
