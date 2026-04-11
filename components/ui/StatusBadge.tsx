import { cn } from "@/lib/utils";

type StatusVariant = "open" | "in_progress" | "closed" | "pro";

const map = {
  open: "bg-green-50 text-green-700 border-green-200",
  in_progress: "bg-orange-50 text-orange-700 border-orange-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
  pro: "bg-blue-50 text-blue-700 border-blue-200",
} as const;

export function StatusBadge({ status }: { status: StatusVariant }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium", map[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {status.replace("_", " ")}
    </span>
  );
}
