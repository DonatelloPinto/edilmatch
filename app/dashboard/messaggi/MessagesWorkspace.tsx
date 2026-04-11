"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db/supabase.types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export type ConversationListItem = {
  id: string;
  partnerName: string;
  partnerAvatar: string | null;
  requestTitle: string;
  otherUserId: string;
  unread: number;
  updatedAt: string;
};

type MessagesWorkspaceProps = {
  currentUserId: string;
  initialConversations: ConversationListItem[];
  initialMessages: MessageRow[];
  initialConversationId: string | null;
  successMessage?: string;
};

export function MessagesWorkspace({
  currentUserId,
  initialConversations,
  initialMessages,
  initialConversationId,
  successMessage,
}: MessagesWorkspaceProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(!!initialConversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => getSupabaseClient(), []);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const loadMessages = useCallback(
    async (conversationId: string) => {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setMessages(data ?? []);
    },
    [supabase],
  );

  const markConversationRead = useCallback(
    async (conversationId: string) => {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .eq("receiver_id", currentUserId)
        .eq("read", false);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)),
      );
      router.refresh();
    },
    [currentUserId, supabase, router],
  );

  useEffect(() => {
    if (!selectedId) return;
    void loadMessages(selectedId);
    void markConversationRead(selectedId);
  }, [selectedId, loadMessages, markConversationRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  useEffect(() => {
    if (!selectedId) return;

    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row].sort((a, b) => a.created_at.localeCompare(b.created_at));
          });
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedId ? { ...c, updatedAt: row.created_at } : c)),
          );
          if (row.receiver_id === currentUserId) {
            void markConversationRead(selectedId);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedId, supabase, currentUserId, markConversationRead]);

  useEffect(() => {
    const channel = supabase
      .channel("messages-inbox")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          if (row.conversation_id === selectedId) return;
          setConversations((prev) =>
            [...prev]
              .map((c) =>
                c.id === row.conversation_id
                  ? { ...c, unread: c.unread + 1, updatedAt: row.created_at }
                  : c,
              )
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId, selectedId]);

  async function sendMessage() {
    if (!selectedId || !selected) return;
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    const receiverId = selected.otherUserId;
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      setError("Sessione non valida.");
      setSending(false);
      return;
    }
    const { data: inserted, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedId,
        sender_id: userData.user.id,
        receiver_id: receiverId,
        content: text,
        read: false,
      })
      .select()
      .single();
    setSending(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setDraft("");
    if (inserted) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === inserted.id)) return prev;
        return [...prev, inserted].sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
      setConversations((prev) =>
        [...prev]
          .map((c) => (c.id === selectedId ? { ...c, updatedAt: inserted.created_at } : c))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      );
    }
  }

  function selectConversation(id: string) {
    setSelectedId(id);
    setMobileShowChat(true);
    router.replace(`/dashboard/messaggi?conversation=${encodeURIComponent(id)}`, { scroll: false });
  }

  function backToList() {
    setMobileShowChat(false);
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col bg-[var(--color-bg)] md:flex-row">
      <aside
        className={`flex w-full flex-col border-b border-[var(--color-border)] bg-white md:w-[360px] md:min-w-[320px] md:border-b-0 md:border-r ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-[var(--color-border)] p-4">
          <h1 className="text-lg font-bold text-[var(--color-navy)]">Messaggi</h1>
          <p className="text-xs text-[var(--color-muted)]">Chat con i professionisti dopo un preventivo accettato</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-[var(--color-muted)]">
              Nessuna conversazione. Accetta un preventivo per aprire la chat.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => selectConversation(c.id)}
                    className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 ${
                      selectedId === c.id ? "bg-[var(--color-orange-light)]" : ""
                    }`}
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-navy)] text-sm font-bold text-white">
                      {c.partnerAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.partnerAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        c.partnerName.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold text-[var(--color-text)]">{c.partnerName}</span>
                        {c.unread > 0 ? (
                          <span className="shrink-0 rounded-full bg-[var(--color-orange)] px-2 py-0.5 text-xs font-bold text-white">
                            {c.unread}
                          </span>
                        ) : null}
                      </span>
                      <span className="line-clamp-1 text-xs text-[var(--color-muted)]">{c.requestTitle}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section
        className={`flex min-h-[420px] flex-1 flex-col bg-[#ece5dd] md:min-h-[calc(100vh-72px)] ${
          !mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        {!selectedId || !selected ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-[var(--color-muted)]">
            Seleziona una conversazione per iniziare a chattare.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[#f0f2f5] px-4 py-3">
              <button
                type="button"
                className="rounded-md border border-[var(--color-border)] px-2 py-1 text-sm md:hidden"
                onClick={backToList}
              >
                ← Lista
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--color-text)]">{selected.partnerName}</p>
                <p className="truncate text-xs text-[var(--color-muted)]">{selected.requestTitle}</p>
              </div>
            </div>

            {successMessage ? (
              <div className="border-b border-green-200 bg-green-50 px-4 py-2 text-center text-xs text-green-800">{successMessage}</div>
            ) : null}

            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {error ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
                ) : null}
                {messages.map((m) => {
                  const mine = m.sender_id === currentUserId;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[min(100%,28rem)] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          mine
                            ? "rounded-br-md bg-[var(--color-orange)] text-white"
                            : "rounded-bl-md bg-white text-[var(--color-text)]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-white/80" : "text-[var(--color-muted)]"}`}>
                          {new Date(m.created_at).toLocaleString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-[var(--color-border)] bg-[#f0f2f5] p-3">
                <div className="flex gap-2">
                  <textarea
                    rows={1}
                    className="min-h-[44px] flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy-mid)]"
                    placeholder="Scrivi un messaggio..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendMessage();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    className="shrink-0 bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)]"
                    disabled={sending || !draft.trim()}
                    onClick={() => void sendMessage()}
                  >
                    Invia
                  </Button>
                </div>
                <p className="mt-1 text-center text-[10px] text-[var(--color-muted)]">Invio invia · Shift+Invio va a capo</p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
