import type { LauncherResult } from "./launcher.types";

type LauncherResultItemProps = {
  result: LauncherResult;
  selected: boolean;
  onSelect: () => void;
};

export function LauncherResultItem({
  result,
  selected,
  onSelect,
}: LauncherResultItemProps) {
  const label = result.title.trim().charAt(0).toUpperCase() || "R";

  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={`flex h-16 w-full items-center gap-4 rounded-xl px-4 text-left outline-none transition-colors ${
        selected
          ? "bg-nebula-accent/15 ring-1 ring-nebula-accent/35"
          : "hover:bg-white/[0.055]"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${
          result.kind === "pinned"
            ? "bg-nebula-accent/14 text-nebula-accent"
            : "bg-white/[0.07] text-slate-200"
        }`}
      >
        {label}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-100">
          {result.title}
        </span>
        <span className="mt-1 block truncate text-xs text-slate-500">
          {result.subtitle}
        </span>
      </span>
      <span className="rounded-md border border-white/10 bg-white/[0.045] px-2 py-1 text-[11px] font-medium uppercase text-slate-400">
        {result.kind}
      </span>
    </button>
  );
}
