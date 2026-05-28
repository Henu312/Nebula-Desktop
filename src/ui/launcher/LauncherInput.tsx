import { forwardRef } from "react";

type LauncherInputProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const LauncherInput = forwardRef<HTMLInputElement, LauncherInputProps>(
  function LauncherInput({ value, onChange, onKeyDown }, ref) {
    return (
      <div className="flex h-16 items-center gap-4 border-b border-white/10 px-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-nebula-accent/14 text-nebula-accent">
          <span className="h-4 w-4 rounded-full border-2 border-current" />
        </div>
        <input
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-xl font-semibold text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="搜索应用、窗口或命令"
          spellCheck={false}
        />
      </div>
    );
  },
);
