/** @jest-environment jsdom */
import { pushModal, listenModal } from '@/lib/modal-history';

// Basic mock for history.pushState/back tracking

describe('modal-history utility', () => {
  test('pushModal sets URL params and listener detects cleared state (simulated back)', () => {
    pushModal('edit', '123');
    const url = new URL(window.location.toString());
    expect(url.searchParams.get('modal')).toBe('edit');
    expect(url.searchParams.get('id')).toBe('123');

  let observed: unknown = null;
    const unsub = listenModal(st => { observed = st; });
    // Simulate user hitting back: clear search params & dispatch popstate
    const cleared = new URL(window.location.toString());
    cleared.searchParams.delete('modal');
    cleared.searchParams.delete('id');
    window.history.replaceState({}, '', cleared.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
    unsub();
    expect(observed).toBeNull();
  });
});
