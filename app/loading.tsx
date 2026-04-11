export default function Loading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 bg-[var(--color-bg)] px-4">
      <div
        className="size-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-orange)]"
        aria-hidden
      />
      <p className="text-sm text-[var(--color-muted)]">Caricamento...</p>
    </div>
  );
}
