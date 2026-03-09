import Link from "next/link";
import { FolderOpen, Globe, Lock, BookOpen } from "lucide-react";
import { type Deck } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeckCardProps {
  deck: Deck;
  className?: string;
}

export function DeckCard({ deck, className }: DeckCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-surface-200 bg-surface-0 p-5",
        "shadow-card hover:shadow-card-hover transition-all duration-200",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-surface-100 p-2">
            <FolderOpen className="h-4 w-4 text-surface-500" />
          </div>
          <Link href={`/decks/${deck.id}`}>
            <h3 className="font-semibold text-surface-900 text-sm hover:text-accent-600 transition-colors">
              {deck.name}
            </h3>
          </Link>
        </div>
        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          {deck.isPublic ? (
            <>
              <Globe className="h-3.5 w-3.5 text-surface-400" />
              <span className="text-[10px] font-medium text-surface-400 uppercase tracking-wider">
                Public
              </span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5 text-accent-500" />
              <span className="text-[10px] font-medium text-accent-600 uppercase tracking-wider">
                Private
              </span>
            </>
          )}
        </div>
      </div>

      {deck.description && (
        <p className="mt-2 text-xs text-surface-400 line-clamp-2">
          {deck.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="default">{deck.cardCount} cards</Badge>
          {deck.languageCode && (
            <Badge variant="accent">{deck.languageCode}</Badge>
          )}
        </div>

        <Link href={`/decks/${deck.id}/study`}>
          <Button size="sm" variant="default">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Study
          </Button>
        </Link>
      </div>
    </div>
  );
}
