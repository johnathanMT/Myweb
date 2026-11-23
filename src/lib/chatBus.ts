/** Lets any component open the PortfolioChat panel that SiteLayout mounts. */
const OPEN = 'mtn:open-chat'

export function openPortfolioChat(): void {
  window.dispatchEvent(new Event(OPEN))
}

export function onOpenPortfolioChat(handler: () => void): () => void {
  window.addEventListener(OPEN, handler)
  return () => window.removeEventListener(OPEN, handler)
}
