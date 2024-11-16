import { BaseProps } from "../lib/std";

export interface ProgressBarProps extends BaseProps {
  total: number;
  progress: number;
}

export function ProgressBar({ total, progress, className }: ProgressBarProps) {
  return (
    <div className={`flex rounded-sm bg-neutral-500 ${className}`}>
      <div
        className="bg-amber-500 flex-shrink rounded-sm"
        style={{ flexBasis: `${(progress / total) * 100}%` }}
      />
    </div>
  );
}
