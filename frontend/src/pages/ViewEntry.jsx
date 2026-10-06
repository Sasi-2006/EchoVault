import { useState } from "react";

import {
  ArrowLeft,
  Heart,
  Pencil,
  Sparkles,
  FileText,
  Brain,
  Trash2,
} from "lucide-react";

import {
  reflectOnEntry,
  summarizeEntry,
  analyzeEntry,
} from "../services/ai";

function ViewEntry({
  entry,
  onBack,
  onEdit,
  onDelete,
  onToggleFavorite,
}) {
  const [reflection, setReflection] = useState("");
  const [summary, setSummary] = useState("");

  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [aiError, setAiError] = useState("");
  const [summaryError, setSummaryError] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  

  async function handleAIReflection() {
    try {
      setLoadingAI(true);
      setAiError("");
      setReflection("");

      const data =
        await reflectOnEntry(entry.id);

      setReflection(data.reflection);
    } catch (error) {
      console.error(
        "AI reflection failed:",
        error
      );

      setAiError(
        error.response?.data?.detail ||
          "Unable to generate AI reflection."
      );
    } finally {
      setLoadingAI(false);
    }
  }

  async function handleAISummary() {
    try {
      setLoadingSummary(true);
      setSummaryError("");
      setSummary("");

      const data =
        await summarizeEntry(entry.id);

      setSummary(data.summary);
    } catch (error) {
      console.error(
        "AI summary failed:",
        error
      );

      setSummaryError(
        error.response?.data?.detail ||
          "Unable to generate AI summary."
      );
    } finally {
      setLoadingSummary(false);
    }
  }
  async function handleAIAnalysis() {
    try {
      setLoadingAnalysis(true);
      setAnalysisError("");
      setAnalysis(null);

      const data = await analyzeEntry(entry.id);

      setAnalysis(data);
    } catch (error) {
      console.error("AI analysis failed:", error);

      setAnalysisError(
        error.response?.data?.detail ||
          "Unable to analyze this journal entry."
      );
    } finally {
      setLoadingAnalysis(false);
    }
  }
  const date =
    new Date(entry.created_at);

  const formattedDate =
    date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const formattedTime =
    date.toLocaleTimeString(
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

          {/* Top section */}

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
                  onToggleFavorite?.(
                    entry
                  )
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
                onClick={() =>
                  onEdit?.(entry)
                }
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

          {/* Date and time */}

          <div className="view-entry-meta">

            <span>
              {formattedDate}
            </span>

            <span>•</span>

            <span>
              {formattedTime}
            </span>

          </div>

          {/* Title */}

          <h1>
            {entry.title}
          </h1>

          {/* Content */}

          <div className="view-entry-content">
            {entry.content}
          </div>

          {/* Tags */}

          {entry.tags?.length > 0 && (
            <div className="view-entry-tags">

              {entry.tags.map(
                (tag) => (
                  <span
                    className="journal-tag"
                    key={tag}
                  >
                    #{tag}
                  </span>
                )
              )}

            </div>
          )}

          {/* =========================
              AI TOOLS
          ========================= */}

          <div className="ai-tools">

            {/* Reflection */}

            <button
              className="ai-reflection-button"
              onClick={
                handleAIReflection
              }
              disabled={loadingAI}
              type="button"
            >
              <Sparkles size={18} />

              {loadingAI
                ? "Reflecting..."
                : "Reflect with AI"}
            </button>

            {/* Summary */}

            <button
              className="ai-summary-button"
              onClick={
                handleAISummary
              }
              disabled={loadingSummary}
              type="button"
            >
              <FileText size={18} />

              {loadingSummary
                ? "Summarizing..."
                : "Summarize with AI"}
            </button>
             
             <button
                className="ai-analysis-button"
                onClick={handleAIAnalysis}
                disabled={loadingAnalysis}
                type="button"
              >
                <Brain size={18} />
                {loadingAnalysis
                  ? "Analyzing..."
                  : "Analyze Mood & Themes"}
              </button>
          </div>

          {/* Reflection error */}

          {aiError && (
            <div className="form-error">
              {aiError}
            </div>
          )}

          {/* Summary error */}

          {summaryError && (
            <div className="form-error">
              {summaryError}
            </div>
          )}
          {analysisError && (
            <div className="form-error">{analysisError}</div>
          )}

          {analysis && (
            <div className="ai-analysis-card">
              <div className="ai-analysis-header">
                <div className="ai-analysis-icon">
                  <Brain size={20} />
                </div>

                <div>
                  <h3>AI Mood & Theme Analysis</h3>
                  <p>What EchoVault noticed in your writing</p>
                </div>
              </div>

              <div className="ai-analysis-section">
                <h4>Mood</h4>
                <p>{analysis.mood}</p>
              </div>

              <div className="ai-analysis-section">
                <h4>Key Themes</h4>

                <ul>
                  {analysis.themes?.map((theme, index) => (
                    <li key={`${theme}-${index}`}>
                      {theme}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ai-analysis-section">
                <h4>Insight</h4>
                <p>{analysis.insight}</p>
              </div>
            </div>
          )}
          {/* =========================
              AI REFLECTION CARD
          ========================= */}

          {reflection && (
            <div className="ai-reflection-card">

              <div className="ai-reflection-header">

                <div className="ai-reflection-icon">
                  <Sparkles
                    size={20}
                  />
                </div>

                <div>

                  <h3>
                    EchoVault Reflection
                  </h3>

                  <p>
                    A gentle reflection
                    on your thoughts
                  </p>

                </div>

              </div>

              <div className="ai-reflection-content">
                {reflection}
              </div>

            </div>
          )}

          {/* =========================
              AI SUMMARY CARD
          ========================= */}

          {summary && (
            <div className="ai-summary-card">

              <div className="ai-summary-header">

                <div className="ai-summary-icon">
                  <FileText
                    size={20}
                  />
                </div>

                <div>

                  <h3>
                    EchoVault Summary
                  </h3>

                  <p>
                    A short summary of
                    your journal entry
                  </p>

                </div>

              </div>

              <div className="ai-summary-content">
                {summary}
              </div>

            </div>
          )}

        </article>

      </div>

    </div>
  );
}

export default ViewEntry;