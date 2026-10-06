import {
  Eye,
  Heart,
  Pencil,
  Trash2,
} from "lucide-react";

function JournalCard({
  entry,
  onDelete,
  onToggleFavorite,
  onEdit,
  onView,
}) {
  const date = new Date(
    entry.created_at
  );

  const formattedDate =
    date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  const preview =
    entry.content.length > 180
      ? `${entry.content.slice(0, 180)}...`
      : entry.content;

  return (
    <article className="journal-card">

      {/* Top */}
      <div className="journal-card-top">

        <div className="journal-mood">
          {entry.mood}
        </div>

        <div className="journal-card-actions">

          <button
            type="button"
            className="icon-button"
            onClick={() =>
              onView?.(entry)
            }
            title="View entry"
          >
            <Eye size={18} />
          </button>

          <button
            type="button"
            className={`icon-button ${
              entry.favorite
                ? "favorite-active"
                : ""
            }`}
            onClick={() =>
              onToggleFavorite?.(entry)
            }
            title={
              entry.favorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <Heart
              size={18}
              fill={
                entry.favorite
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          <button
            type="button"
            className="icon-button"
            onClick={() =>
              onEdit?.(entry)
            }
            title="Edit entry"
          >
            <Pencil size={18} />
          </button>

          <button
            type="button"
            className="icon-button delete-button"
            onClick={() =>
              onDelete?.(entry.id)
            }
            title="Delete entry"
          >
            <Trash2 size={18} />
          </button>

        </div>
      </div>

      {/* Content */}
      <div className="journal-card-content">

        <p className="journal-date">
          {formattedDate}
        </p>

        <h3>
          {entry.title}
        </h3>

        <p className="journal-preview">
          {preview}
        </p>

      </div>

      {/* Tags */}
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

      {/* View */}
      <div className="journal-card-footer">

        <button
          type="button"
          className="view-entry-link"
          onClick={() =>
            onView?.(entry)
          }
        >
          <span>View entry</span>

          <span className="view-arrow">
            →
          </span>
        </button>

      </div>

    </article>
  );
}

export default JournalCard;