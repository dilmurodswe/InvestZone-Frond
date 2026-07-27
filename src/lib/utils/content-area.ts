/**
 * The `<main>` next to the sidebar — portal target for modals that should open
 * inside the page content area instead of floating over the whole viewport.
 *
 * Read on demand rather than kept in state: by the time a modal renders, the
 * layout around it is already mounted.
 */
export function contentAreaElement(): HTMLElement | null {
    if (typeof document === "undefined") return null
    return document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]')
}
