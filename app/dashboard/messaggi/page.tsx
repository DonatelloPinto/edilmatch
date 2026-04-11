import { redirect } from "next/navigation";

import { MessagesWorkspace, type ConversationListItem } from "@/app/dashboard/messaggi/MessagesWorkspace";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db/supabase.types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function MessaggiPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const conversationParam = pickText(searchParams.conversation);
  const successRaw = pickText(searchParams.success);

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    redirect("/login?next=/dashboard/messaggi");
  }

  const { data: convs } = await supabase
    .from("conversations")
    .select("id, client_id, professional_id, request_id, updated_at")
    .or(`client_id.eq.${user.id},professional_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const conversationRows = convs ?? [];
  const partnerIds = conversationRows.map((c) => (c.client_id === user.id ? c.professional_id : c.client_id));
  const requestIds = conversationRows.map((c) => c.request_id);

  const { data: partnerProfiles } =
    partnerIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", partnerIds)
      : { data: [] };

  const { data: requestRows } =
    requestIds.length > 0
      ? await supabase.from("requests").select("id, title").in("id", requestIds)
      : { data: [] };

  const { data: unreadRows } = await supabase
    .from("messages")
    .select("conversation_id")
    .eq("receiver_id", user.id)
    .eq("read", false);

  const unreadByConv = new Map<string, number>();
  for (const row of unreadRows ?? []) {
    const cid = row.conversation_id;
    unreadByConv.set(cid, (unreadByConv.get(cid) ?? 0) + 1);
  }

  const profileMap = new Map((partnerProfiles ?? []).map((p) => [p.id, p]));
  const requestMap = new Map((requestRows ?? []).map((r) => [r.id, r]));

  const initialConversations: ConversationListItem[] = conversationRows.map((c) => {
    const otherId = c.client_id === user.id ? c.professional_id : c.client_id;
    const p = profileMap.get(otherId);
    return {
      id: c.id,
      partnerName: p?.full_name ?? "Utente",
      partnerAvatar: p?.avatar_url ?? null,
      requestTitle: requestMap.get(c.request_id)?.title ?? "Richiesta",
      otherUserId: otherId,
      unread: unreadByConv.get(c.id) ?? 0,
      updatedAt: c.updated_at,
    };
  });

  let initialConversationId: string | null = conversationParam || null;
  if (initialConversationId && !initialConversations.some((c) => c.id === initialConversationId)) {
    initialConversationId = null;
  }

  let initialMessages: MessageRow[] = [];
  if (initialConversationId) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", initialConversationId)
      .order("created_at", { ascending: true })
      .limit(200);
    initialMessages = msgs ?? [];
  }

  return (
    <MessagesWorkspace
      currentUserId={user.id}
      initialConversations={initialConversations}
      initialMessages={initialMessages}
      initialConversationId={initialConversationId}
      successMessage={successRaw || undefined}
    />
  );
}
