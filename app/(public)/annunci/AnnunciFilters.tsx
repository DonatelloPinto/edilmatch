"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CATEGORIES, ITALIAN_PROVINCES } from "@/lib/config/constants";
import { detectLocationWithGoogle } from "@/lib/geolocation-client";

export function AnnunciFilters({ initialCategoria, initialProvincia }: { initialCategoria: string; initialProvincia: string }) {
  const [provincia, setProvincia] = useState(initialProvincia);
  const [categoria, setCategoria] = useState(initialCategoria);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUseMyLocation() {
    try {
      setLoading(true);
      setMessage("");
      const location = await detectLocationWithGoogle();
      setProvincia(location.provincia);
      setMessage(`Provincia rilevata: ${location.provincia}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore durante la geolocalizzazione.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form method="GET" className="grid gap-3 sm:grid-cols-4">
      <select
        name="categoria"
        value={categoria}
        onChange={(event) => setCategoria(event.target.value)}
        className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
      >
        <option value="">Tutte le categorie</option>
        {CATEGORIES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        name="provincia"
        value={provincia}
        onChange={(event) => setProvincia(event.target.value)}
        className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
      >
        <option value="">Tutte le province</option>
        {ITALIAN_PROVINCES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <Button type="button" variant="outline" onClick={handleUseMyLocation} disabled={loading}>
        {loading ? "Rilevamento..." : "Usa la mia posizione"}
      </Button>
      <Button type="submit">Filtra</Button>
      <input type="hidden" name="page" value="1" />
      {message ? <p className="sm:col-span-4 text-xs text-[var(--color-muted)]">{message}</p> : null}
    </form>
  );
}
