/**
 * MemoryTag — a wooden plaque hanging from the tree by a string. Swings via the
 * `.sanctuary-tag` CSS keyframe (transform-origin: top center); the parent adds
 * `.is-paused` to freeze all tags while a modal is open. Glows on hover.
 *
 * Positioned by tag.x / tag.y as percentages within the tree zone.
 */
export default function MemoryTag({ tag, index, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(tag)}
      aria-label={`Read the memory from ${tag.author}`}
      className="sanctuary-tag group absolute z-30 -translate-x-1/2 focus:outline-none"
      style={{ left: `${tag.x}%`, top: `${tag.y}%`, animationDelay: `${-(index * 0.8)}s` }}
    >
      {/* hanging string */}
      <span className="mx-auto block h-9 w-px bg-gradient-to-b from-amber-100/80 to-amber-700/30" />

      {/* wooden plaque */}
      <span className="relative -mt-px block whitespace-nowrap rounded-md border border-amber-900/40 bg-gradient-to-b from-amber-200 to-amber-400 px-3.5 py-2 font-serif text-xs font-semibold text-amber-950 shadow-[0_5px_12px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_0_24px_rgba(253,224,140,0.9)] group-hover:brightness-110 group-focus-visible:shadow-[0_0_24px_rgba(253,224,140,0.9)]">
        {/* nail / hole where the string attaches */}
        <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-900/70 shadow-inner" />
        {tag.author}
      </span>
    </button>
  )
}
