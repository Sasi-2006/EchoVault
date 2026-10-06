import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";
import JournalCard from "../components/JournalCard";
import EmptyState from "../components/EmptyState";
import CalendarView from "../components/CalendarView";

import {
  getJournalEntries,
  deleteJournalEntry,
  updateJournalEntry,
  semanticSearch,
} from "../services/journal";

import { Search, Plus, X } from "lucide-react";

function Dashboard({
  user,
  onLogout,
  onNewEntry,
  onEditEntry,
  onViewEntry,
  onNavigate,
}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activePage, setActivePage] =
    useState("Dashboard");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedTag, setSelectedTag] =
    useState("All");

  const [selectedMood, setSelectedMood] =
    useState("All");
  
  const [semanticResults, setSemanticResults] = useState(null);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticError, setSemanticError] = useState("");
  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getJournalEntries();

      setEntries(data);
    } catch (err) {
      console.error(
        "Failed to load journal entries:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load your journal entries."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this journal entry?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteJournalEntry(id);

      setEntries((currentEntries) =>
        currentEntries.filter(
          (entry) => entry.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete journal entry:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Unable to delete this journal entry."
      );
    }
  }

  async function handleToggleFavorite(entry) {
    try {
      const updatedEntry =
        await updateJournalEntry(
          entry.id,
          {
            favorite: !entry.favorite,
          }
        );

      setEntries((currentEntries) =>
        currentEntries.map((item) =>
          item.id === entry.id
            ? updatedEntry
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to update favorite:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Unable to update favorite."
      );
    }
  }

  async function handleSemanticSearch() {
    if (!searchTerm.trim()) {
      setSemanticResults(null);
      return;
    }

    try {
      setSemanticLoading(true);
      setSemanticError("");

      const results = await semanticSearch(searchTerm);

      setSemanticResults(results);
    } catch (error) {
      console.error("Semantic search failed:", error);

      setSemanticError(
        error.response?.data?.detail ||
          "Unable to perform semantic search."
      );
    } finally {
      setSemanticLoading(false);
    }
  }

  function handlePageChange(page) {
    if (page === "AI Companion") {
      onNavigate?.(page);
      return;
    }

    // Settings is handled by App.jsx routing
    if (page === "Settings") {
      onNavigate?.(page);
      return;
  }

  setActivePage(page);

  // Reset filters when changing section
  setSearchTerm("");
  setSelectedTag("All");
  setSelectedMood("All");
  }

  /*
   * Collect all unique tags
   */
  const availableTags = useMemo(() => {
    const tags = new Set();

    entries.forEach((entry) => {
      entry.tags?.forEach((tag) => {
        tags.add(tag);
      });
    });

    return Array.from(tags);
  }, [entries]);

  /*
   * Filter entries
   */
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    /*
     * Page filter
     */
    if (activePage === "Favorites") {
      result = result.filter(
        (entry) => entry.favorite
      );
    }

    /*
     * Search filter
     */
    if (searchTerm.trim()) {
      const search = searchTerm
        .toLowerCase()
        .trim();

      result = result.filter((entry) => {
        return (
          entry.title
            ?.toLowerCase()
            .includes(search) ||
          entry.content
            ?.toLowerCase()
            .includes(search) ||
          entry.tags?.some((tag) =>
            tag.toLowerCase().includes(search)
          )
        );
      });
    }

    /*
     * Tag filter
     */
    if (selectedTag !== "All") {
      result = result.filter((entry) =>
        entry.tags?.includes(selectedTag)
      );
    }

    /*
     * Mood filter
     *
     * NewEntry.jsx stores the mood as
     * the emoji itself:
     *
     * 😊 😌 🥰 😔 😡 😴 🤔 ✨
     */
    if (selectedMood !== "All") {
      result = result.filter(
        (entry) => entry.mood === selectedMood
      );
    }

    /*
     * Dashboard only shows recent 6
     *
     * When a filter/search is active,
     * show all matching entries.
     */
    if (
      activePage === "Dashboard" &&
      !searchTerm &&
      selectedTag === "All" &&
      selectedMood === "All"
    ) {
      result = result.slice(0, 6);
    }

    return result;
  }, [
    entries,
    activePage,
    searchTerm,
    selectedTag,
    selectedMood,
  ]);

  const userName = user?.name || "there";

  function getPageTitle() {
    if (activePage === "Favorites") {
      return "Favorite entries";
    }

    if (activePage === "My Journal") {
      return "My Journal";
    }

    return "Recent entries";
  }

  function getPageSubtitle() {
    if (activePage === "Favorites") {
      return "The thoughts you've chosen to keep close.";
    }

    if (activePage === "My Journal") {
      return "All your private thoughts in one place.";
    }

    return "Your latest thoughts and reflections.";
  }

  /*
   * Calendar
   */
  if (activePage === "Calendar") {
    return (
      <div className="app-layout">

        <Sidebar
          user={user}
          onLogout={onLogout}
          onNewEntry={onNewEntry}
          activePage={activePage}
          setActivePage={handlePageChange}
          onNavigate={onNavigate}
        />

        <main className="main-content">

          <section className="dashboard-content">

            <div className="dashboard-heading">

              <div>

                <p className="eyebrow">
                  Your memories
                </p>

                <h1>
                  Journal Calendar 📅
                </h1>

                <p className="dashboard-subtitle">
                  Explore your thoughts by date.
                </p>

              </div>

              <button
                className="new-entry-button"
                onClick={onNewEntry}
                type="button"
              >
                <Plus size={18} />
                New Entry
              </button>

            </div>

            {loading ? (
              <div className="dashboard-status">
                <p>
                  Loading your journal...
                </p>
              </div>
            ) : (
              <CalendarView
                entries={entries}
                onEdit={onEditEntry}
              />
            )}

          </section>

        </main>

      </div>
    );
  }

  /*
   * Settings is handled by App.jsx
   */
  return (
    <div className="app-layout">

      <Sidebar
        user={user}
        onLogout={onLogout}
        onNewEntry={onNewEntry}
        activePage={activePage}
        setActivePage={handlePageChange}
        onNavigate={onNavigate}
      />

      <main className="main-content">

        <section className="dashboard-content">

          {/* Dashboard heading */}

          <div className="dashboard-heading">

            <div>

              <p className="eyebrow">
                Your private space
              </p>

              <h1>
                Welcome back, {userName} 👋
              </h1>

              <p className="dashboard-subtitle">
                {getPageSubtitle()}
              </p>

            </div>

            <button
              className="new-entry-button"
              onClick={onNewEntry}
              type="button"
            >
              <Plus size={18} />
              New Entry
            </button>

          </div>

          {/* Search */}

          <div className="dashboard-search">

            <Search size={20} />

            <input
              type="text"
              placeholder="Search your journal..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
            <button
              type="button"
              onClick={handleSemanticSearch}
              disabled={semanticLoading || !searchTerm.trim()}
            >
              {semanticLoading
                ? "Searching..."
                : "✨ Search by Meaning"}
            </button>

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
                title="Clear search"
              >
                <X size={17} />
              </button>
            )}

            {semanticError && (
            <div className="form-error">
              {semanticError}
            </div>
          )}

          {semanticResults && (
            <div className="semantic-search-results">
              <div className="semantic-search-header">
                <h3>✨ Related Entries</h3>
                <button
                  type="button"
                  onClick={() => setSemanticResults(null)}
                >
                  Clear
                </button>
              </div>

              {semanticResults.length === 0 ? (
                <p>No semantically related entries found.</p>
              ) : (
                semanticResults.map((entry) => (
                  <div
                    className="semantic-result-card"
                    key={entry.id}
                  >
                    <div className="semantic-result-top">
                      <span>{entry.mood}</span>

                      <span>
                        {Math.round(entry.similarity * 100)}% match
                      </span>
                    </div>

                    <h4>{entry.title}</h4>

                    <p>
                      {entry.content.length > 180
                        ? `${entry.content.slice(0, 180)}...`
                        : entry.content}
                    </p>

                    {entry.tags?.length > 0 && (
                      <div className="journal-tags">
                        {entry.tags.map((tag) => (
                          <span
                            className="journal-tag"
                            key={tag}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          </div>

          {/* Tags */}

          {availableTags.length > 0 && (
            <div className="tag-filter-section">

              <span className="tag-filter-label">
                Tags:
              </span>

              <button
                type="button"
                className={`tag-filter ${
                  selectedTag === "All"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedTag("All")
                }
              >
                All
              </button>

              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-filter ${
                    selectedTag === tag
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedTag(tag)
                  }
                >
                  #{tag}
                </button>
              ))}

            </div>
          )}

          {/* Mood Filter */}

          <div className="mood-filter-section">

            <span className="mood-filter-label">
              Mood:
            </span>

            {[
              "All",
              "😊",
              "😌",
              "🥰",
              "😔",
              "😡",
              "😴",
              "🤔",
              "✨",
            ].map((mood) => (
              <button
                key={mood}
                type="button"
                className={`mood-filter ${
                  selectedMood === mood
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedMood(mood)
                }
              >
                {mood}
              </button>
            ))}

          </div>

          {/* Loading */}

          {loading && (
            <div className="dashboard-status">

              <div className="loading-spinner" />

              <p>
                Loading your journal...
              </p>

            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="dashboard-error">

              <p>{error}</p>

              <button
                type="button"
                onClick={loadEntries}
              >
                Try Again
              </button>

            </div>
          )}

          {/* Empty */}

          {!loading &&
            !error &&
            filteredEntries.length === 0 && (
              <div className="dashboard-empty">

                {searchTerm ? (
                  <>
                    <div className="empty-search-icon">
                      🔍
                    </div>

                    <h3>
                      No entries found
                    </h3>

                    <p>
                      Try a different search term.
                    </p>
                  </>
                ) : activePage === "Favorites" ? (
                  <>
                    <div className="empty-search-icon">
                      ❤️
                    </div>

                    <h3>
                      No favorite entries yet
                    </h3>

                    <p>
                      Favorite your important
                      thoughts to see them here.
                    </p>
                  </>
                ) : (
                  <EmptyState />
                )}

              </div>
            )}

          {/* Entries */}

          {!loading &&
            !error &&
            filteredEntries.length > 0 && (
              <section className="recent-entries">

                <div className="section-heading">

                  <div>

                    <p className="eyebrow">
                      {activePage ===
                      "Favorites"
                        ? "Saved thoughts"
                        : activePage ===
                          "My Journal"
                        ? "Your collection"
                        : "Your thoughts"}
                    </p>

                    <h2>
                      {getPageTitle()}
                    </h2>

                  </div>

                  <span className="entry-count">
                    {filteredEntries.length}{" "}
                    {filteredEntries.length === 1
                      ? "entry"
                      : "entries"}
                  </span>

                </div>

                <div className="journal-grid">

                  {filteredEntries.map(
                    (entry) => (
                      <JournalCard
                        key={entry.id}
                        entry={entry}
                        onDelete={handleDelete}
                        onToggleFavorite={
                          handleToggleFavorite
                        }
                        onEdit={onEditEntry}
                        onView={onViewEntry}
                      />
                    )
                  )}

                </div>

              </section>
            )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;