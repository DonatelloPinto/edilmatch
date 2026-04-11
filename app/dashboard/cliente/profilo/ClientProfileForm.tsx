"use client";

import { useState } from "react";

import { upsertClientProfileAction } from "@/actions/profile/upsert-client-profile.action";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InitialValues = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  provincia: string;
  avatarUrl: string;
};

export function ClientProfileForm({ initial }: { initial: InitialValues }) {
  const [avatarPreview, setAvatarPreview] = useState(initial.avatarUrl || "");

  return (
    <form action={upsertClientProfileAction} className="space-y-6" encType="multipart/form-data">
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
          <div className="space-y-2">
            <Label htmlFor="city">Citta</Label>
            <Input id="city" name="city" defaultValue={initial.city} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provincia">Provincia</Label>
            <Input id="provincia" name="provincia" defaultValue={initial.provincia} maxLength={2} />
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

      <div className="flex gap-3">
        <SubmitButton
          label="Salva profilo"
          pendingLabel="Salvataggio..."
          className="bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)]"
        />
        <Button asChild variant="outline">
          <a href="/dashboard/cliente">Annulla</a>
        </Button>
      </div>
    </form>
  );
}
