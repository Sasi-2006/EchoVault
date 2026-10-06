import { BookOpen, PenLine } from "lucide-react";

function EmptyState({ onNewEntry }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <BookOpen size={30} />
      </div>

      <h3>Your journal is waiting for you</h3>

      <p>
        This is your private space to capture thoughts,
        memories, ideas, and everything in between.
      </p>

      <button
        className="primary-button"
        onClick={onNewEntry}
      >
        <PenLine size={18} />
        Write your first entry
      </button>
    </div>
  );
}

export default EmptyState;