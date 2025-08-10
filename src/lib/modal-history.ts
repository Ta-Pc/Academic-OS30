export type ModalState = { modal?: string; id?: string };

/** Push a modal state onto history and update URL search params. */
export function pushModal(modal: string, id?: string) {
  const url = new URL(window.location.toString());
  url.searchParams.set('modal', modal);
  if (id) url.searchParams.set('id', id); else url.searchParams.delete('id');
  window.history.pushState({ modal, id }, '', url.toString());
}

/** Close current modal by navigating back if history state has modal. */
export function closeModal() {
  const st = window.history.state as ModalState | null;
  if (st?.modal) {
    window.history.back();
  }
}

/** Subscribe to popstate modal changes. Returns unsubscribe. */
export function listenModal(cb: (state: ModalState | null) => void) {
  function handler() {
    const s = window.history.state as ModalState | null;
    // If URL no longer contains modal param treat as null
    const url = new URL(window.location.toString());
    if (!url.searchParams.get('modal')) cb(null); else cb(s || null);
  }
  window.addEventListener('popstate', handler);
  return () => window.removeEventListener('popstate', handler);
}
