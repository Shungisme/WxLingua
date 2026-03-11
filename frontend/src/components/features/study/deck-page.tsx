"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { decksApi, type Deck } from "@/lib/api";
import { DeckCard } from "@/components/features/deck-card";
import { CreateDeckDialog } from "@/components/features/create-deck-dialog";
import { StatsPanel } from "@/components/features/stats-panel";
import { StudySession } from "@/components/features/study-session";
import { ForecastChart } from "@/components/features/forecast-chart";
import { ReviewHeatmap } from "@/components/features/review-heatmap";
import { Button } from "@/components/ui/button";
import { DeckCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const deckGridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const deckItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" as const },
  },
};

type TabType = "my-decks" | "public";

export default function DeckPage() {
  const [activeTab, setActiveTab] = useState<TabType>("my-decks");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [studyMode, setStudyMode] = useState<"all" | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    fetchDecks();
  }, [activeTab]);

  const fetchDecks = async () => {
    setIsLoading(true);
    try {
      const isPublic = activeTab === "public";
      const results = await decksApi.list({ public: isPublic });
      setDecks(results);
    } catch (error) {
      console.error("Failed to fetch decks:", error);
      setDecks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (newDeck: Deck) => {
    setDecks([newDeck, ...decks]);
    setShowCreateDialog(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-pixel text-sm text-surface-900 mb-1">Study</h1>
          <p className="font-pixel text-[8px] text-surface-400">
            Track your progress and manage your flashcard decks
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowCharts((v) => !v)}
            size="sm"
          >
            <i className="hn hn-chart-line text-base mr-1.5" />
            <div>Charts</div>
            {showCharts ? (
              <i className="hn hn-chevron-up text-[14px] ml-1" />
            ) : (
              <i className="hn hn-chevron-down text-[14px] ml-1" />
            )}
          </Button>
          {activeTab === "my-decks" && (
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
              size="sm"
            >
              <i className="hn hn-plus text-base mr-1.5" />
              <div>New Deck</div>
            </Button>
          )}
          <Button
            onClick={() => setStudyMode((m) => (m === "all" ? null : "all"))}
            size="sm"
          >
            <i className="hn hn-book-heart text-base mr-1.5" />
            <div>{studyMode === "all" ? "Back to Decks" : "Study All"}</div>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsPanel />

      {/* Inline Study All */}
      <AnimatePresence>
        {studyMode === "all" && (
          <motion.div
            key="study-session"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-surface-0 border-2 border-surface-200 shadow-card p-6 mb-8">
              <h2 className="font-pixel text-[10px] text-surface-800 mb-4">
                All cards
              </h2>
              <StudySession mode="learn" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts (collapsible) */}
      <AnimatePresence>
        {showCharts && (
          <motion.div
            key="charts"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ForecastChart />
              <ReviewHeatmap />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="nes-tabs mb-6">
        <button
          onClick={() => setActiveTab("my-decks")}
          className={cn(
            "nes-tabs__tab",
            activeTab === "my-decks" && "is-active",
          )}
        >
          My Decks
        </button>
        <button
          onClick={() => setActiveTab("public")}
          className={cn("nes-tabs__tab", activeTab === "public" && "is-active")}
        >
          Public
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <DeckCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && decks.length === 0 && (
        <div className="text-center py-16">
          <i className="hn hn-folder-open text-[64px] mx-auto text-surface-300 mb-4 block" />
          <h3 className="font-pixel text-[10px] text-surface-900 mb-2">
            {activeTab === "my-decks"
              ? "No decks yet"
              : "No public decks available"}
          </h3>
          <p className="font-pixel text-[8px] text-surface-500 mb-6">
            {activeTab === "my-decks"
              ? "Create your first deck to start learning"
              : "Check back later for shared decks"}
          </p>
          {activeTab === "my-decks" && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <i className="hn hn-plus text-base mr-1.5" />
              Create Your First Deck
            </Button>
          )}
        </div>
      )}

      {/* Deck Grid */}
      {!isLoading && decks.length > 0 && (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={deckGridVariants}
          initial="hidden"
          animate="visible"
        >
          {decks.map((deck) => (
            <motion.div key={deck.id} variants={deckItemVariants}>
              <DeckCard deck={deck} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Deck Dialog */}
      <CreateDeckDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
