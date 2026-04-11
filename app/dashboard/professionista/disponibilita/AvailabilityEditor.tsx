"use client";

import { useMemo, useState } from "react";

import { upsertAvailabilityDayAction } from "@/actions/availability/upsert-day.action";
import { Button } from "@/components/ui/button";

const SLOT_DEF = [
  { id: "morning", label: "Mattina (8–13)" },
  { id: "afternoon", label: "Pomeriggio (13–18)" },
  { id: "evening", label: "Sera (18–21)" },
] as const;

type DayRow = { date: string; time_slots: string[] };

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export function AvailabilityEditor({ initialRows }: { initialRows: DayRow[] }) {
  const initialMap = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const r of initialRows) m.set(r.date, r.time_slots);
    return m;
  }, [initialRows]);

  const [byDate, setByDate] = useState(() => new Map(initialMap));
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  const matrix = monthMatrix(cursor.y, cursor.m);
  const label = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(new Date(cursor.y, cursor.m, 1));

  function dateStr(day: number) {
    return `${cursor.y}-${pad(cursor.m + 1)}-${pad(day)}`;
  }

  const selectedSlots = selected ? byDate.get(selected) ?? [] : [];

  function toggleSlot(slot: string) {
    if (!selected) return;
    const cur = byDate.get(selected) ?? [];
    const next = cur.includes(slot) ? cur.filter((s) => s !== slot) : [...cur, slot];
    setByDate((prev) => {
      const copy = new Map(prev);
      copy.set(selected, next);
      return copy;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCursor((c) => ({ y: c.m === 0 ? c.y - 1 : c.y, m: c.m === 0 ? 11 : c.m - 1 }))}
        >
          ←
        </Button>
        <p className="font-semibold capitalize text-[var(--color-navy)]">{label}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setCursor((c) => ({ y: c.m === 11 ? c.y + 1 : c.y, m: c.m === 11 ? 0 : c.m + 1 }))}
        >
          →
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--color-muted)]">
        {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
          <div key={d}>{d}</div>
        ))}
        {matrix.map((cell, idx) =>
          cell === null ? (
            <div key={`e-${idx}`} />
          ) : (
            <button
              key={cell}
              type="button"
              onClick={() => setSelected(dateStr(cell))}
              className={`rounded-lg border p-2 text-sm ${
                selected === dateStr(cell) ? "border-[var(--color-orange)] bg-[var(--color-orange-light)]" : "border-[var(--color-border)] bg-white"
              }`}
            >
              {cell}
              {(byDate.get(dateStr(cell))?.length ?? 0) > 0 ? <span className="block text-[10px] text-green-600">●</span> : null}
            </button>
          ),
        )}
      </div>

      {selected ? (
        <form action={upsertAvailabilityDayAction} className="space-y-3 rounded-xl border border-[var(--color-border)] bg-white p-4">
          <input type="hidden" name="date" value={selected} />
          <input type="hidden" name="slots_json" value={JSON.stringify(selectedSlots)} />
          <p className="text-sm font-medium">Giorno {selected}</p>
          <div className="flex flex-wrap gap-2">
            {SLOT_DEF.map((s) => {
              const on = selectedSlots.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-xs ${on ? "border-[var(--color-orange)] bg-[var(--color-orange-light)]" : "border-[var(--color-border)]"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSlot(s.id);
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--color-muted)]">Salva per confermare. Nessuna fascia = giorno cancellato (non disponibile).</p>
          <Button type="submit" className="bg-[var(--color-orange)] text-white">
            Salva giorno
          </Button>
        </form>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">Seleziona un giorno nel calendario.</p>
      )}
    </div>
  );
}
