"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function collectImages(formData: FormData, key: string): File[] {
  return formData.getAll(key).filter((item): item is File => item instanceof File && item.size > 0);
}

export async function createPortfolioProjectAction(formData: FormData) {
  const title = toText(formData.get("title"));
  const description = toText(formData.get("description"));
  const category = toText(formData.get("category"));
  const beforeFiles = collectImages(formData, "before_images");
  const afterFiles = collectImages(formData, "after_images");

  if (!title) {
    redirect("/dashboard/professionista/portfolio?error=Titolo%20obbligatorio.");
  }

  const total = beforeFiles.length + afterFiles.length;
  if (total === 0) {
    redirect("/dashboard/professionista/portfolio?error=Carica%20almeno%20un%20immagine%20(prima%20o%20dopo).");
  }
  if (total > 5) {
    redirect("/dashboard/professionista/portfolio?error=Massimo%205%20immagini%20totali%20(prima%20%2B%20dopo).");
  }

  for (const file of [...beforeFiles, ...afterFiles]) {
    if (!file.type.startsWith("image/")) {
      redirect("/dashboard/professionista/portfolio?error=Sono%20ammesse%20solo%20immagini.");
    }
    if (file.size > 6 * 1024 * 1024) {
      redirect("/dashboard/professionista/portfolio?error=Ogni%20file%20deve%20essere%20inferiore%20a%206%20MB.");
    }
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "professionista") {
    redirect("/dashboard/professionista/portfolio?error=Operazione%20non%20consentita.");
  }

  const projectId = randomUUID();
  const basePath = `${user.id}/portfolio/${projectId}`;

  async function uploadList(files: File[], prefix: "before" | "after"): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const path = `${basePath}/${prefix}_${i}.${ext}`;
      const { error: upErr } = await supabase.storage.from("profile-images").upload(path, file, {
        upsert: false,
        contentType: file.type || "image/jpeg",
      });
      if (upErr) {
        redirect(`/dashboard/professionista/portfolio?error=${encodeURIComponent("Upload fallito: " + upErr.message)}`);
      }
      const { data: pub } = supabase.storage.from("profile-images").getPublicUrl(path);
      urls.push(pub.publicUrl);
    }
    return urls;
  }

  const before_images = await uploadList(beforeFiles, "before");
  const after_images = await uploadList(afterFiles, "after");

  const { error: insErr } = await supabase.from("portfolio_projects").insert({
    id: projectId,
    professional_id: user.id,
    title,
    description: description || null,
    category: category || null,
    before_images,
    after_images,
  });

  if (insErr) {
    redirect(`/dashboard/professionista/portfolio?error=${encodeURIComponent(insErr.message)}`);
  }

  revalidatePath("/dashboard/professionista/portfolio");
  revalidatePath(`/professionisti/${user.id}`);
  revalidatePath("/");
  redirect("/dashboard/professionista/portfolio?success=Progetto%20pubblicato.");
}
