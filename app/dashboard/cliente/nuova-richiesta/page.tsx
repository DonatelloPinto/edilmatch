"use client";

import Link from "next/link";
import { useState } from "react";

import { createRequestAction } from "@/actions/requests/create-request.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { detectLocationWithGoogle } from "@/lib/geolocation-client";

const categories = ["Ristrutturazione", "Idraulica", "Elettricista", "Imbiancatura", "Pavimenti", "Infissi"];

export default function NuovaRichiestaPage() {
  const [step, setStep] = useState(1);
  const [categoria, setCategoria] = useState("Ristrutturazione");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [provincia, setProvincia] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [budget, setBudget] = useState("");
  const [disponibilita, setDisponibilita] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);

  const progress = `${(step / 3) * 100}%`;

  async function handleDetectLocation() {
    try {
      setLocating(true);
      setLocationMessage("");
      const location = await detectLocationWithGoogle();
      setCity(location.city);
      setProvincia(location.provincia);
      setLocationMessage(`Posizione rilevata: ${location.city} (${location.provincia})`);
    } catch (error) {
      setLocationMessage(error instanceof Error ? error.message : "Errore geolocalizzazione.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="container-app max-w-3xl">
        <Card className="card-investor border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle>Nuova richiesta</CardTitle>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-[var(--color-orange)] transition-all duration-200" style={{ width: progress }} />
            </div>
          </CardHeader>
          <CardContent>
            <form action={createRequestAction} className="space-y-5">
              <input type="hidden" name="categoria" value={categoria} />
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="description" value={`${description}${disponibilita ? `\nDisponibilita: ${disponibilita}` : ""}`} />
              <input type="hidden" name="city" value={city} />
              <input type="hidden" name="provincia" value={provincia} />
              <input type="hidden" name="address_line" value={addressLine} />
              <input type="hidden" name="budget_indicativo" value={budget} />

              {step === 1 ? (
                <section>
                  <h3 className="mb-3 text-lg font-semibold">Step 1: Scegli la categoria</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategoria(item)}
                        className={`rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                          categoria === item ? "border-[var(--color-orange)] bg-[var(--color-orange-light)]" : "border-[var(--color-border)]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {step === 2 ? (
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 2: Dettagli richiesta</h3>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titolo</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrizione</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="city">Citta</Label>
                        <Button type="button" size="sm" variant="outline" onClick={handleDetectLocation} disabled={locating}>
                          {locating ? "Rilevamento..." : "Rileva automaticamente"}
                        </Button>
                      </div>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provincia">Provincia</Label>
                      <Input id="provincia" value={provincia} onChange={(e) => setProvincia(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_line">Indirizzo (opzionale, migliora il posizionamento sulla mappa)</Label>
                    <Input
                      id="address_line"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="Es. Via Roma 12"
                    />
                  </div>
                  {locationMessage ? <p className="text-xs text-[var(--color-muted)]">{locationMessage}</p> : null}
                  <div className="space-y-2">
                    <Label htmlFor="disponibilita">Disponibilita</Label>
                    <Input id="disponibilita" value={disponibilita} onChange={(e) => setDisponibilita(e.target.value)} placeholder="Es. entro 2 settimane" />
                  </div>
                </section>
              ) : null}

              {step === 3 ? (
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 3: Budget e riepilogo</h3>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget indicativo</Label>
                    <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-slate-50 p-4 text-sm text-[var(--color-muted)]">
                    <p>
                      <strong>Categoria:</strong> {categoria}
                    </p>
                    <p>
                      <strong>Titolo:</strong> {title || "-"}
                    </p>
                    <p>
                      <strong>Zona:</strong> {city || "-"} {provincia || ""}
                    </p>
                    <p>
                      <strong>Budget:</strong> {budget || "-"} EUR
                    </p>
                  </div>
                </section>
              ) : null}

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>
                  Indietro
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={() => setStep((s) => Math.min(3, s + 1))} className="bg-[var(--color-navy)] text-white">
                    Avanti
                  </Button>
                ) : (
                  <SubmitButton
                    label="Pubblica richiesta"
                    pendingLabel="Pubblicazione..."
                    className="bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)]"
                  />
                )}
              </div>
              <div>
                <Link href="/dashboard/cliente" className="text-sm text-[var(--color-muted)] hover:underline">
                  Torna alla dashboard
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
