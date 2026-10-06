import { Bell, Search, Moon } from "lucide-react";

function Header({ onNewEntry }) {
  return (
    <header className="header">
      <div className="mobile-brand">
        <div className="brand-icon small">
          <Moon size={17} />
        </div>

        <strong>EchoVault</strong>
      </div>

      <div className="header-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search your thoughts..."
        />
        <span className="search-shortcut">⌘ K</span>
      </div>

      <div className="header-actions">
        <button className="icon-button">
          <Bell size={19} />
        </button>

        <button
          className="header-new-button"
          onClick={onNewEntry}
        >
          <span>+</span>
          New Entry
        </button>
      </div>
    </header>
  );
}

export default Header;