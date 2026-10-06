import {
  BookOpen,
  CalendarDays,
  Heart,
  Home,
  LogOut,
  Settings,
  Sparkles,
  Plus,
} from "lucide-react";

function Sidebar({
  activePage,
  setActivePage,
  onLogout,
  onNewEntry,
  user,
  onNavigate,
}) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: Home,
    },
    {
      name: "My Journal",
      icon: BookOpen,
    },
    {
      name: "Favorites",
      icon: Heart,
    },
    {
      name: "Calendar",
      icon: CalendarDays,
    },
    {
      name: "AI Companion",
      icon: Sparkles,
    },
  ];

  const userName = user?.name || "User";

  const avatarLetter =
    userName.charAt(0).toUpperCase();

  function handleNavigation(page) {
    if (page === "AI Companion") {
      onNavigate?.(page);
      return;
    }

    setActivePage?.(page);
  }

  function handleSettings() {
    setActivePage?.("Settings");
  }

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="brand">
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>

        <div>
          <h2>EchoVault</h2>
          <span>Your quiet space</span>
        </div>
      </div>

      {/* New Entry */}
      <button
        className="sidebar-new-entry"
        onClick={onNewEntry}
        type="button"
      >
        <Plus size={18} />
        <span>New Entry</span>
      </button>

      {/* Main Navigation */}
      <nav className="sidebar-nav">

        <p className="nav-label">
          MENU
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              type="button"
              className={`nav-item ${
                activePage === item.name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation(item.name)
              }
            >
              <Icon size={19} />

              <span>
                {item.name}
              </span>
            </button>
          );
        })}

      </nav>

      {/* Bottom Navigation */}
      <div className="sidebar-bottom">

        <button
          type="button"
          className={`nav-item ${
            activePage === "Settings"
              ? "active"
              : ""
          }`}
          onClick={handleSettings}
        >
          <Settings size={19} />

          <span>
            Settings
          </span>
        </button>

        <button
          type="button"
          className="nav-item logout"
          onClick={onLogout}
        >
          <LogOut size={19} />

          <span>
            Logout
          </span>
        </button>

        {/* User Profile */}
        <div className="profile-card">

          <div className="avatar">
            {avatarLetter}
          </div>

          <div className="profile-info">

            <strong>
              {userName}
            </strong>

            <span>
              My private space
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;