"use client";

import { useMemo, useState } from "react";

import { upsertProfileAction } from "@/actions/profile/upsert-profile.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, ITALIAN_PROVINCES } from "@/lib/config/constants";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { detectLocationWithGoogle } from "@/lib/geolocation-client";

type InitialValues = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  companyName: string;
  vatNumber: string;
  businessAddress: string;
  businessCity: string;
  businessProvincia: string;
  provincia: string;
  services: string[];
  provincesCovered: string[];
  bio: string;
  yearsExperience: string;
  websiteUrl: string;
};

export function ProfileForm({ initial }: { initial: InitialValues }) {
  const [avatarPreview, setAvatarPreview] = useState(initial.avatarUrl || "");
  const [selectedServices, setSelectedServices] = useState<string[]>(initial.services);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(initial.provincesCovered);
  const [businessCity, setBusinessCity] = useState(initial.businessCity);
  const [businessProvincia, setBusinessProvincia] = useState(initial.businessProvincia);
  const [geoMessage, setGeoMessage] = useState("");
  const [locating, setLocating] = useState(false);

  const servicesSet = useMemo(() => new Set(selectedServices), [selectedServices]);
  const provincesSet = useMemo(() => new Set(selectedProvinces), [selectedProvinces]);

  function toggleService(service: string) {
    setSelectedServices((prev) => (prev.includes(service) ? prev.filter((v) => v !== service) : [...prev, service]));
  }

  function toggleProvince(province: string) {
    setSelectedProvinces((prev) => (prev.includes(province) ? prev.filter((v) => v !== province) : [...prev, province]));
  }

  async function detectBusinessLocation() {
    try {
      setLocating(true);
      setGeoMessage("");
      const location = await detectLocationWithGoogle();
      setBusinessCity(location.city);
      setBusinessProvincia(location.provincia);
      setGeoMessage(`Posizione rilevata: ${location.city} (${location.provincia})`);
    } catch (error) {
      setGeoMessage(error instanceof Error ? error.message : "Errore geolocalizzazione.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <form action={upsertProfileAction} className="space-y-8" encType="multipart/form-data">
      <input type="hidden" name="services" value={selectedServices.join(",")} />
      <input type="hidden" name="provinces_covered" value={selectedProvinces.join(",")} />

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Dati personali</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input id="full_name" name="full_name" defaultValue={initial.fullName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input id="phone" name="phone" defaultValue={initial.phone} placeholder="+39 ..." />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email (readonly)</Label>
            <Input id="email" name="email" defaultValue={initial.email} readOnly />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Foto profilo</h3>
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-orange-light)]">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Anteprima profilo" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-[var(--color-muted)]">Nessuna foto</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Carica immagine</Label>
            <Input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Dati aziendali</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_name">Ragione sociale</Label>
            <Input id="company_name" name="company_name" defaultValue={initial.companyName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vat_number">Partita IVA</Label>
            <Input id="vat_number" name="vat_number" defaultValue={initial.vatNumber} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="business_address">Indirizzo sede</Label>
            <Input id="business_address" name="business_address" defaultValue={initial.businessAddress} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="business_city">Citta</Label>
              <Button type="button" size="sm" variant="outline" onClick={detectBusinessLocation} disabled={locating}>
                {locating ? "Rilevamento..." : "Rileva posizione"}
              </Button>
            </div>
            <Input id="business_city" name="business_city" value={businessCity} onChange={(event) => setBusinessCity(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_provincia">Provincia</Label>
            <Input
              id="business_provincia"
              name="business_provincia"
              value={businessProvincia}
              onChange={(event) => setBusinessProvincia(event.target.value.toUpperCase())}
              maxLength={2}
            />
          </div>
        </div>
        {geoMessage ? <p className="text-xs text-[var(--color-muted)]">{geoMessage}</p> : null}
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Servizi offerti</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-all duration-200 ${
                servicesSet.has(category) ? "border-[var(--color-orange)] bg-[var(--color-orange-light)]" : "border-[var(--color-border)]"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={servicesSet.has(category)}
                onChange={() => toggleService(category)}
              />
              {category}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Zone di lavoro</h3>
        <div className="space-y-2">
          <Label htmlFor="provincia">Provincia principale</Label>
          <Input id="provincia" name="provincia" defaultValue={initial.provincia} maxLength={2} required />
        </div>
        <div className="grid max-h-56 gap-2 overflow-auto rounded-lg border border-[var(--color-border)] p-3 sm:grid-cols-4">
          {ITALIAN_PROVINCES.map((province) => (
            <label
              key={province}
              className={`cursor-pointer rounded-md border px-2 py-1 text-xs transition-all duration-200 ${
                provincesSet.has(province) ? "border-[var(--color-orange)] bg-[var(--color-orange-light)]" : "border-[var(--color-border)]"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={provincesSet.has(province)}
                onChange={() => toggleProvince(province)}
              />
              {province}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Presentazione</h3>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio / descrizione</Label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={initial.bio}
            className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="years_experience">Anni di esperienza</Label>
            <Input id="years_experience" name="years_experience" type="number" min="0" defaultValue={initial.yearsExperience} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website_url">Sito web (opzionale)</Label>
            <Input id="website_url" name="website_url" defaultValue={initial.websiteUrl} placeholder="https://..." />
          </div>
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <SubmitButton
          label="Salva profilo"
          pendingLabel="Salvataggio..."
          className="bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)]"
        />
        <Button asChild variant="outline">
          <a href="/dashboard/professionista">Annulla</a>
        </Button>
      </div>
    </form>
  );
}
