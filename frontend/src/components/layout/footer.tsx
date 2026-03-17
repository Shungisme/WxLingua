import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t-4 border-black bg-surface-0">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[9px] text-accent-600 leading-none">
            Wx
          </span>
          <span className="font-pixel text-[9px] text-surface-900">
            WxLingua
          </span>
          <i
            className="nes-icon heart is-small"
            style={{ transform: "scale(0.5)" }}
          />
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/dictionary"
            className="font-pixel text-[8px] text-surface-400 hover:text-accent-600 transition-colors no-underline"
          >
            Dictionary
          </Link>
          <Link
            href="/radicals"
            className="font-pixel text-[8px] text-surface-400 hover:text-accent-600 transition-colors no-underline"
          >
            Radicals
          </Link>
          <Link
            href="/decks"
            className="font-pixel text-[8px] text-surface-400 hover:text-accent-600 transition-colors no-underline"
          >
            Decks
          </Link>
        </div>
        <p className="font-pixel text-[8px] text-surface-300">
          &copy; {new Date().getFullYear()} WxLingua
        </p>
      </div>
    </footer>
  );
}
