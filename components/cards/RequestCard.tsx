import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";

type RequestCardProps = {
  id: string;
  categoria?: string | null;
  title: string;
  description?: string | null;
  city?: string | null;
  provincia?: string | null;
  budget?: number | null;
  createdAt: string;
  status: "open" | "in_progress" | "closed";
  ctaLabel?: string;
  ctaHref?: string;
};

function relativeDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  if (hours < 24) return `${hours} ore fa`;
  const days = Math.floor(hours / 24);
  return `${days} giorni fa`;
}

export function RequestCard({
  categoria,
  title,
  description,
  city,
  provincia,
  budget,
  createdAt,
  status,
  ctaLabel = "Dettagli",
  ctaHref,
}: RequestCardProps) {
  return (
    <article className="card-investor border border-[var(--color-border)] bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--color-muted)]">🏗️ {categoria ?? "Lavori edili"}</span>
        <StatusBadge status={status} />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">{description ?? "-"}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
        <span>
          {city ?? "-"} {provincia ?? ""}
        </span>
        <span>•</span>
        <span>{budget ? `${budget} EUR` : "Budget da definire"}</span>
        <span>•</span>
        <span>{relativeDate(createdAt)}</span>
      </div>
      <div className="mt-4 flex justify-end">
        {ctaHref ? (
          <Button asChild size="sm" className="bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)] transition-all duration-200">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        ) : (
          <Button size="sm" className="bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)] transition-all duration-200">
            {ctaLabel}
          </Button>
        )}
      </div>
    </article>
  );
}
