import { LauncherResultItem } from "./LauncherResultItem";
import type { LauncherResult } from "./launcher.types";

type LauncherResultListProps = {
  results: LauncherResult[];
  selectedIndex: number;
  onSelect: (result: LauncherResult) => void;
};

export function LauncherResultList({
  results,
  selectedIndex,
  onSelect,
}: LauncherResultListProps) {
  if (results.length === 0) {
    return (
      <div className="grid h-48 place-items-center px-5 text-sm text-slate-500">
        没有匹配结果
      </div>
    );
  }

  return (
    <div className="max-h-[420px] space-y-2 overflow-hidden p-3">
      {results.map((result, index) => (
        <LauncherResultItem
          key={result.id}
          result={result}
          selected={index === selectedIndex}
          onSelect={() => onSelect(result)}
        />
      ))}
    </div>
  );
}
