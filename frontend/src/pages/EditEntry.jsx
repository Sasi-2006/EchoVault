import { useState } from "react";
import { updateJournalEntry } from "../services/journal";

function EditEntry({ entry, onBack, onUpdated }) {
  const [title, setTitle] = useState(
    entry.title || ""
  );

  const [content, setContent] = useState(
    entry.content || ""
  );

  const [mood, setMood] = useState(
    entry.mood || "😊"
  );

  const [tags, setTags] = useState(
    entry.tags?.join(", ") || ""
  );

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
      setError(
        "Please write something before saving."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedEntry = {
        title:
          title.trim() ||
          "Untitled thought",

        content: content.trim(),

        mood,

        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const response =
        await updateJournalEntry(
          entry.id,
          updatedEntry
        );

      onUpdated(response);

    } catch (err) {
      console.error(
        "Failed to update journal entry:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to update your journal entry."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="new-entry-page">

      <div className="new-entry-container">

        {/* Back button */}

        <button
          className="back-button"
          onClick={onBack}
          type="button"
        >
          ← Back to Journal
        </button>

        {/* Header */}

        <div className="new-entry-header">

          <p className="eyebrow">
            Edit reflection
          </p>

          <h1>
            Update your thoughts
          </h1>

          <p>
            Make changes to your journal entry.
          </p>

        </div>

        {/* Form */}

        <form
          className="new-entry-form"
          onSubmit={handleSubmit}
        >

          {/* Title */}

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

          {/* Mood */}

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
                  onClick={() =>
                    setMood(item)
                  }
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

          {/* Content */}

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

          {/* Tags */}

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

          {/* Error */}

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* Actions */}

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
                : "Update Entry"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditEntry;