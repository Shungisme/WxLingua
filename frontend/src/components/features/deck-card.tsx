"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group border-2 border-surface-200 bg-surface-0 p-5",
        "shadow-card hover:shadow-card-hover transition-all duration-200",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-surface-100 p-2 border border-surface-200">
            <i className="hn hn-folder-open text-base text-surface-500" />
          </div>
          <Link href={`/decks/${deck.id}`}>
            <h3 className="font-pixel text-[9px] text-surface-900 hover:text-accent-600 transition-colors">
              {deck.name}
            </h3>
          </Link>
        </div>
        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          {deck.isPublic ? (
            <>
              <i className="hn hn-globe text-[14px] text-surface-400" />
              <span className="font-pixel text-[8px] text-surface-400 uppercase tracking-wider">
                Public
              </span>
            </>
          ) : (
            <>
              <i className="hn hn-lock text-[14px] text-accent-500" />
              <span className="font-pixel text-[8px] text-accent-600 uppercase tracking-wider">
                Private
              </span>
            </>
          )}
        </div>
      </div>

      {deck.description && (
        <p className="font-pixel text-[8px] mt-2 text-surface-400 line-clamp-2">
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

        <div className="flex items-center gap-1.5">
          {deck.dueCount != null && deck.dueCount > 0 && (
            <Link href={`/decks/${deck.id}/study?mode=review`}>
              <Button
                size="sm"
                variant="outline"
                className="text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400 !flex"
              >
                <i className="hn hn-refresh text-[14px] mr-1" />
                Review {deck.dueCount}
              </Button>
            </Link>
          )}
          <Link href={`/decks/${deck.id}/study?mode=learn`}>
            <Button size="sm">
              <i className="hn hn-book-heart text-[14px] mr-1.5" />
              Study
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
