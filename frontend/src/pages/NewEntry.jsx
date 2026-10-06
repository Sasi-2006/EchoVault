import { useState } from "react";
import { createJournalEntry } from "../services/journal";

function NewEntry({ onBack }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("😊");
  const [tags, setTags] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const moods = [
    "😊",
    "😌",
    "🥰",
    "😔",
    "😡",
    "😴",
    "🤔",
    "✨",
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please write something before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const entry = {
        title: title.trim() || "Untitled thought",
        content: content.trim(),
        mood,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      await createJournalEntry(entry);

      onBack();

    } catch (err) {
      console.error("Failed to create journal entry:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to save your journal entry."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="new-entry-page">

      <div className="new-entry-container">

        <button
          className="back-button"
          onClick={onBack}
          type="button"
        >
          ← Back to Journal
        </button>

        <div className="new-entry-header">
          <p className="eyebrow">
            New reflection
          </p>

          <h1>What's on your mind?</h1>

          <p>
            This space is private. Write freely.
          </p>
        </div>

        <form
          className="new-entry-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="title">
              Title
            </label>

            <input
              id="title"
              type="text"
              placeholder="Give your thought a title..."
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>
              How are you feeling?
            </label>

            <div className="mood-selector">

              {moods.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    mood === item
                      ? "mood-button active"
                      : "mood-button"
                  }
                  onClick={() => setMood(item)}
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          <div className="form-group">

            <label htmlFor="content">
              Your thoughts
            </label>

            <textarea
              id="content"
              rows="12"
              placeholder="Write whatever is on your mind..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label htmlFor="tags">
              Tags
            </label>

            <input
              id="tags"
              type="text"
              placeholder="college, personal, goals"
              value={tags}
              onChange={(e) =>
                setTags(e.target.value)
              }
            />

            <small>
              Separate tags with commas.
            </small>

          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-actions">

            <button
              type="button"
              onClick={onBack}
              className="secondary-button"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Entry"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default NewEntry;