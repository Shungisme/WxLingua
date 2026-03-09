"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  FolderOpen,
  BookOpen,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { decksApi, type Deck } from "@/lib/api";
import { DeckCard } from "@/components/features/deck-card";
import { CreateDeckDialog } from "@/components/features/create-deck-dialog";
import { StatsPanel } from "@/components/features/stats-panel";
import { StudySession } from "@/components/features/study-session";
import { ForecastChart } from "@/components/features/forecast-chart";
import { ReviewHeatmap } from "@/components/features/review-heatmap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabType = "my-decks" | "public";

export default function DecksPage() {
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
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Study</h1>
          <p className="text-sm text-surface-400">
            Track your progress and manage your flashcard decks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCharts((v) => !v)}
            size="sm"
          >
            <BarChart2 className="h-4 w-4 mr-1.5" />
            Charts
            {showCharts ? (
              <ChevronUp className="h-3.5 w-3.5 ml-1" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            )}
          </Button>
          {activeTab === "my-decks" && (
            <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Deck
            </Button>
          )}
          <Button
            onClick={() => setStudyMode((m) => (m === "all" ? null : "all"))}
          >
            <BookOpen className="h-4 w-4 mr-1.5" />
            {studyMode === "all" ? "Back to Decks" : "Study All"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsPanel />

      {/* Inline Study All */}
      {studyMode === "all" && (
        <div className="bg-surface-0 border border-surface-200 rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-base font-semibold text-surface-800 mb-4">
            All due cards
          </h2>
          <StudySession />
        </div>
      )}

      {/* Charts (collapsible) */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ForecastChart />
          <ReviewHeatmap />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-surface-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("my-decks")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "my-decks"
              ? "bg-surface-0 text-surface-900 shadow-sm"
              : "text-surface-500 hover:text-surface-700",
          )}
        >
          My Decks
        </button>
        <button
          onClick={() => setActiveTab("public")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "public"
              ? "bg-surface-0 text-surface-900 shadow-sm"
              : "text-surface-500 hover:text-surface-700",
          )}
        >
          Public
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
          <span className="ml-3 text-surface-500">Loading...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && decks.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="h-16 w-16 mx-auto text-surface-300 mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">
            {activeTab === "my-decks"
              ? "No decks yet"
              : "No public decks available"}
          </h3>
          <p className="text-sm text-surface-500 mb-6">
            {activeTab === "my-decks"
              ? "Create your first deck to start learning"
              : "Check back later for shared decks"}
          </p>
          {activeTab === "my-decks" && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Your First Deck
            </Button>
          )}
        </div>
      )}

      {/* Deck Grid */}
      {!isLoading && decks.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
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
