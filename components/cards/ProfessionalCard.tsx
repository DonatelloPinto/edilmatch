import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Props = {
  id: string;
  name: string;
  verified?: boolean;
  categories: string[];
  rating: number;
  reviewsCount: number;
  provincia?: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfessionalCard({ id, name, verified, categories, rating, reviewsCount, provincia }: Props) {
  return (
    <article className="card-investor border border-[var(--color-border)] bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-orange-light)] font-semibold text-[var(--color-navy)]">
          {initials(name)}
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text)]">{name}</h3>
          {verified ? <StatusBadge status="pro" /> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.slice(0, 4).map((category) => (
          <span key={category} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
            {category}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm text-[var(--color-muted)]">
        ⭐ {rating.toFixed(1)} ({reviewsCount} recensioni)
      </p>
      <p className="text-sm text-[var(--color-muted)]">Provincia: {provincia ?? "-"}</p>
      <div className="mt-4">
        <Button asChild className="bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-mid)] transition-all duration-200">
          <Link href={`/professionisti/${id}`}>Contatta</Link>
        </Button>
      </div>
    </article>
  );
}
