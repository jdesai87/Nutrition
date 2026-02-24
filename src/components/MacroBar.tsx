"use client";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export default function MacroBar({ label, current, target, unit, color }: MacroBarProps) {
  const percent = Math.min((current / target) * 100, 100);
  const over = current > target;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className={`font-medium ${over ? "text-red-500" : "text-zinc-900 dark:text-zinc-100"}`}>
          {Math.round(current)}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-400" : color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
