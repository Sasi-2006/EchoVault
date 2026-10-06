import { useState } from "react";
import {
  Send,
  Sparkles,
  BookOpen,
  Trash2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import { askAgent } from "../services/ai";

function AICompanion({
  user,
  onLogout,
  onNewEntry,
  onNavigate,
}) {
  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleAsk = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    try {
      setLoading(true);

      // Send previous conversation to the backend
      const conversation = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      const result = await askAgent(
        trimmedQuestion,
        conversation
      );

      // Add user's new message
      const userMessage = {
        role: "user",
        content: trimmedQuestion,
      };

      // Add assistant's response
      const assistantMessage = {
        role: "assistant",
        content: result.answer || "I couldn't generate an answer.",
        memories: result.memories || [],
        toolUsed: result.tool_used || "",
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
        assistantMessage,
      ]);

      setQuestion("");
    } catch (error) {
      console.error("Agent error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleAsk();
    }
  }

  function handleClearChat() {
    setMessages([]);
    setError("");
    setQuestion("");
  }

  function handleSidebarNavigation(page) {
    if (page === "AI Companion") {
      return;
    }

    onNavigate?.(page);
  }

  return (
    <div className="app-layout">

      {/* Sidebar */}

      <Sidebar
        user={user}
        onLogout={onLogout}
        onNewEntry={onNewEntry}
        activePage="AI Companion"
        setActivePage={
          handleSidebarNavigation
        }
        onNavigate={onNavigate}
      />

      {/* Main Content */}

      <main className="main-content">

        <div className="ai-companion-page">

          {/* Header */}

          <div className="ai-companion-header">

            <div className="ai-companion-title">

              <div className="ai-companion-icon">
                <Sparkles size={22} />
              </div>

              <div>
                <h1>
                  AI Companion
                </h1>

                <p>
                  Ask questions about your
                  journal and rediscover your
                  memories.
                </p>
              </div>

            </div>

            {messages.length > 0 && (
              <button
                type="button"
                className="ai-clear-button"
                onClick={handleClearChat}
              >
                <Trash2 size={16} />
                Clear chat
              </button>
            )}

          </div>

          {/* Chat Area */}

          <div className="ai-chat-container">

            {/* Empty State */}

            {messages.length === 0 &&
              !loading && (
                <div className="ai-chat-empty">

                  <div className="ai-chat-empty-icon">
                    <Sparkles size={26} />
                  </div>

                  <h2>
                    How can I help you?
                  </h2>

                  <p>
                    Ask me about your journal
                    memories, thoughts,
                    projects, or things you've
                    been learning.
                  </p>

                  <div className="ai-suggestions">

                    <button
                      type="button"
                      onClick={() =>
                        setQuestion(
                          "What have I been learning about AI recently?"
                        )
                      }
                    >
                      What have I been
                      learning about AI?
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setQuestion(
                          "What projects have I been working on?"
                        )
                      }
                    >
                      What projects have
                      I been working on?
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setQuestion(
                          "What technologies have I been using?"
                        )
                      }
                    >
                      What technologies
                      have I been using?
                    </button>

                  </div>

                </div>
              )}

            {/* Messages */}

            <div className="ai-message-list">

              {messages.map(
                (message, index) => (
                  <div
                    className={`ai-message ${
                      message.role ===
                      "user"
                        ? "ai-user-message"
                        : "ai-assistant-message"
                    }`}
                    key={index}
                  >

                    <div className="ai-message-avatar">

                      {message.role ===
                      "user" ? (
                        user?.name
                          ?.charAt(0)
                          .toUpperCase() ||
                        "U"
                      ) : (
                        <Sparkles
                          size={17}
                        />
                      )}

                    </div>

                    <div className="ai-message-content">

                      <div className="ai-message-name">

                        {message.role ===
                        "user"
                          ? "You"
                          : "EchoVault"}

                      </div>

                      <div className="ai-message-text">
                        {message.content}
                      </div>

                      {/* Agent Information */}

                      {message.role === "assistant" &&
                        (
                          message.toolUsed ||
                          message.memories?.length > 0
                        ) && (
                          <div className="ai-message-sources">

                            {/* Tool Used */}

                            {message.toolUsed && (
                              <div className="ai-message-sources-title">

                                <Sparkles size={15} />

                                <span>
                                  Tool used:{" "}

                                  {message.toolUsed ===
                                  "search_journal_tool"
                                    ? "Journal Search"
                                    : message.toolUsed ===
                                      "recent_journal_tool"
                                    ? "Recent Memories"
                                    : message.toolUsed}
                                </span>

                              </div>
                            )}

                            {/* Memories */}

                            {message.memories?.length > 0 && (
                              <>
                                <div
                                  className="ai-message-sources-title"
                                  style={{
                                    marginTop:
                                      "10px",
                                  }}
                                >
                                  <BookOpen
                                    size={15}
                                  />

                                  <span>
                                    Memories used
                                  </span>
                                </div>

                                <div className="ai-message-source-list">

                                  {message.memories.map(
                                    (
                                      memory,
                                      index
                                    ) => (
                                      <div
                                        className="ai-message-source"
                                        key={
                                          memory._id ||
                                          memory.id ||
                                          index
                                        }
                                      >

                                        <span>
                                          {memory.title ||
                                            "Untitled thought"}
                                        </span>

                                        {memory.similarity !==
                                          undefined && (
                                          <small>
                                            {Math.round(
                                              memory.similarity *
                                                100
                                            )}
                                            %
                                          </small>
                                        )}

                                      </div>
                                    )
                                  )}

                                </div>
                              </>
                            )}

                          </div>
                        )}

                    </div>

                  </div>
                )
              )}

              {/* Loading */}

              {loading && (
                <div className="ai-message ai-assistant-message">

                  <div className="ai-message-avatar">
                    <Sparkles
                      size={17}
                    />
                  </div>

                  <div className="ai-message-content">

                    <div className="ai-message-name">
                      EchoVault
                    </div>

                    <div className="ai-thinking">

                      <span />
                      <span />
                      <span />

                      <label>
                        Thinking...
                      </label>

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="ai-companion-error">
              {error}
            </div>
          )}

          {/* Input */}

          <div className="ai-input-container">

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Ask EchoVault about your memories..."
              rows={2}
              disabled={loading}
            />

            <button
              type="button"
              onClick={handleAsk}
              disabled={
                !question.trim() ||
                loading
              }
              title="Ask EchoVault"
            >
              <Send size={18} />
            </button>

          </div>

          <p className="ai-input-hint">
            Press Enter to ask • Shift + Enter
            for a new line
          </p>

        </div>

      </main>

    </div>
  );
}

export default AICompanion;