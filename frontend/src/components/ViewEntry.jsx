import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";

import { reflectOnEntry } from "../services/ai";

function ViewEntry({
  entry,
  onBack,
  onEdit,
  onDelete,
  onToggleFavorite,
}) {
  const [reflection, setReflection] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  async function handleAIReflection() {
    try {
      setLoadingAI(true);
      setAiError("");
      setReflection("");

      const data = await reflectOnEntry(entry.id);

      setReflection(data.reflection);
    } catch (error) {
      console.error("AI reflection failed:", error);

      setAiError(
        error.response?.data?.detail ||
          "Unable to generate AI reflection."
      );
    } finally {
      setLoadingAI(false);
    }
  }

  const date = new Date(entry.created_at);

  const formattedDate = date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const formattedTime = date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );

  return (
    <div className="view-entry-page">
      <div className="view-entry-container">

        <button
          className="back-button"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={18} />
          Back to Journal
        </button>

        <article className="view-entry-card">

          <div className="view-entry-top">

            <div className="view-entry-mood">
              {entry.mood}
            </div>

            <div className="view-entry-actions">

              <button
                className={`icon-button ${
                  entry.favorite
                    ? "favorite-active"
                    : ""
                }`}
                onClick={() =>
                  onToggleFavorite?.(entry)
                }
                type="button"
                title="Favorite"
              >
                <Heart
                  size={20}
                  fill={
                    entry.favorite
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>

              <button
                className="icon-button"
                onClick={() => onEdit?.(entry)}
                type="button"
                title="Edit"
              >
                <Pencil size={20} />
              </button>

              <button
                className="icon-button delete-button"
                onClick={() =>
                  onDelete?.(entry.id)
                }
                type="button"
                title="Delete"
              >
                <Trash2 size={20} />
              </button>

            </div>
          </div>

          <div className="view-entry-meta">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{formattedTime}</span>
          </div>

          <h1>
            {entry.title}
          </h1>

          <div className="view-entry-content">
            {entry.content}
          </div>

          {entry.tags?.length > 0 && (
            <div className="view-entry-tags">
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

          {/* =========================
              AI REFLECTION
          ========================= */}

          <div className="view-entry-actions">

            <button
              className="ai-reflection-button"
              onClick={handleAIReflection}
              disabled={loadingAI}
              type="button"
            >
              <Sparkles size={18} />

              {loadingAI
                ? "Reflecting..."
                : "Reflect with AI"}
            </button>

          </div>

          {aiError && (
            <div className="form-error">
              {aiError}
            </div>
          )}

          {reflection && (
            <div className="ai-reflection-card">

              <div className="ai-reflection-header">

                <div className="ai-reflection-icon">
                  <Sparkles size={20} />
                </div>

                <div>
                  <h3>
                    EchoVault Reflection
                  </h3>

                  <p>
                    A gentle reflection on your thoughts
                  </p>
                </div>

              </div>

              <div className="ai-reflection-content">
                {reflection}
              </div>

            </div>
          )}

        </article>
      </div>
    </div>
  );
}

export default ViewEntry;