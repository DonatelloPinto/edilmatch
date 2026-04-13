"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/config/constants";
import { detectLocationWithGoogle } from "@/lib/geolocation-client";

export function HeroSearchBar() {
  const router = useRouter();
  const [categoria, setCategoria] = useState("");
  const [city, setCity] = useState("");
  const [provincia, setProvincia] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function detectLocation() {
    try {
      setLoading(true);
      setMessage("");
      const location = await detectLocationWithGoogle();
      setCity(location.city);
      setProvincia(location.provincia);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore geolocalizzazione.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    const query = new URLSearchParams();
    if (categoria) query.set("categoria", categoria);
    if (provincia) query.set("provincia", provincia);
    router.push(`/annunci?${query.toString()}`);
  }

  return (
    <div className="mx-auto mt-8 grid max-w-3xl gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur sm:grid-cols-[1fr_1fr_auto_auto]">
      <select
        value={categoria}
        onChange={(event) => setCategoria(event.target.value)}
        className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white"
      >
        <option value="">Tutte le categorie</option>
        {CATEGORIES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2">
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="w-full bg-transparent text-sm text-white placeholder:text-white/70 outline-none"
          placeholder="Inserisci citta"
        />
        <button
          type="button"
          onClick={detectLocation}
          aria-label="Rileva posizione"
          className="text-white/90 transition-all duration-200 hover:text-white"
          title="Rileva posizione"
        >
          {loading ? "..." : "📍"}
        </button>
      </div>
      <Button
        type="button"
        className="bg-[var(--color-orange)] text-white transition-all duration-200 hover:bg-orange-500"
        onClick={handleSearch}
      >
        Cerca
      </Button>
      {message ? <p className="text-left text-xs text-white/90 sm:col-span-4">{message}</p> : null}
    </div>
  );
}
