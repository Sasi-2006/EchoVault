import {
  useEffect,
  useState,
} from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewEntry from "./pages/NewEntry";
import EditEntry from "./pages/EditEntry";
import ViewEntry from "./pages/ViewEntry";
import Settings from "./pages/Settings";
import AICompanion from "./pages/AICompanion";
import {
  deleteJournalEntry,
  updateJournalEntry,
} from "./services/journal";

function App() {

  // ========================================
  // USER
  // ========================================

  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem(
        "echovault_user"
      );

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  // ========================================
  // CURRENT ROUTE
  // ========================================

  const [currentPath, setCurrentPath] =
    useState(
      window.location.pathname
    );

  // ========================================
  // SELECTED ENTRY
  // ========================================

  const [editingEntry, setEditingEntry] =
    useState(null);

  const [viewingEntry, setViewingEntry] =
    useState(null);

  // ========================================
  // NAVIGATION
  // ========================================

  function navigate(path) {
    window.history.pushState(
      {},
      "",
      path
    );

    setCurrentPath(path);
  }

  // ========================================
  // BROWSER BACK/FORWARD
  // ========================================

  useEffect(() => {

    function handlePopState() {
      setCurrentPath(
        window.location.pathname
      );
    }

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };

  }, []);

  // ========================================
  // LOGIN
  // ========================================

  function handleLogin(userData) {

    setUser(userData);

    navigate("/");
  }

  // ========================================
  // REGISTER
  // ========================================

  function handleRegister(userData) {

    setUser(userData);

    navigate("/");
  }

  // ========================================
  // LOGOUT
  // ========================================

  function handleLogout() {

    localStorage.removeItem(
      "echovault_token"
    );

    localStorage.removeItem(
      "echovault_user"
    );

    setUser(null);

    setEditingEntry(null);

    setViewingEntry(null);

    navigate("/login");
  }

  // ========================================
  // EDIT ENTRY
  // ========================================

  function handleEditEntry(entry) {

    setEditingEntry(entry);

    navigate("/edit-entry");
  }

  // ========================================
  // UPDATED ENTRY
  // ========================================

  function handleEntryUpdated(
    updatedEntry
  ) {

    setEditingEntry(updatedEntry);

    setViewingEntry(null);

    navigate("/");
  }

  // ========================================
  // VIEW ENTRY
  // ========================================

  function handleViewEntry(entry) {

    setViewingEntry(entry);

    navigate("/view-entry");
  }

  // ========================================
  // DELETE FROM VIEW PAGE
  // ========================================

  async function handleViewDelete(id) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this journal entry?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteJournalEntry(id);

      setViewingEntry(null);

      navigate("/");

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

  // ========================================
  // FAVORITE FROM VIEW PAGE
  // ========================================

  async function handleViewFavorite(
    entry
  ) {

    try {

      const updatedEntry =
        await updateJournalEntry(
          entry.id,
          {
            favorite:
              !entry.favorite,
          }
        );

      setViewingEntry(
        updatedEntry
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

  // ========================================
  // NOT LOGGED IN
  // ========================================

  if (!user) {

    if (
      currentPath ===
      "/register"
    ) {

      return (
        <Register
          onRegister={
            handleRegister
          }
        />
      );
    }

    return (
      <Login
        onLogin={
          handleLogin
        }
      />
    );
  }

  // ========================================
  // NEW ENTRY
  // ========================================

  if (
    currentPath ===
    "/new-entry"
  ) {

    return (
      <NewEntry
        user={user}
        onBack={() =>
          navigate("/")
        }
      />
    );
  }

  // ========================================
  // EDIT ENTRY
  // ========================================

  if (
    currentPath ===
      "/edit-entry" &&
    editingEntry
  ) {

    return (
      <EditEntry
        entry={editingEntry}
        onBack={() =>
          navigate("/")
        }
        onUpdated={
          handleEntryUpdated
        }
      />
    );
  }

  // ========================================
  // VIEW ENTRY
  // ========================================

  if (
    currentPath ===
      "/view-entry" &&
    viewingEntry
  ) {

    return (
      <ViewEntry
        entry={viewingEntry}

        onBack={() =>
          navigate("/")
        }

        onEdit={(entry) =>
          handleEditEntry(entry)
        }

        onDelete={
          handleViewDelete
        }

        onToggleFavorite={
          handleViewFavorite
        }
      />
    );
  }

  // ========================================
  // SETTINGS
  // ========================================

  if (
    currentPath ===
    "/settings"
  ) {

    return (
      <Settings
        user={user}

        onLogout={
          handleLogout
        }

        onNewEntry={() =>
          navigate(
            "/new-entry"
          )
        }

        activePage="Settings"

        setActivePage={(page) => {

          if (
            page === "Settings"
          ) {
            return;
          }

          navigate("/");
        }}
      />
    );
  }

  // ========================================
  // AI COMPANION
  // ========================================

  
  if (currentPath === "/ai-companion") {
    return (
      <AICompanion
        user={user}
        onLogout={handleLogout}
        onNewEntry={() =>
          navigate("/new-entry")
        }
        onNavigate={(page) => {
          if (page === "AI Companion") {
            navigate("/ai-companion");
            return;
          }

          if (page === "Settings") {
            navigate("/settings");
            return;
          }

          // All Dashboard sections
          navigate("/");
        }}
      />
    );
  }

  // ========================================
  // DASHBOARD
  // ========================================

  return (
    <Dashboard
      user={user}

      onLogout={
        handleLogout
      }

      onNewEntry={() =>
        navigate(
          "/new-entry"
        )
      }

      onEditEntry={
        handleEditEntry
      }

      onViewEntry={
        handleViewEntry
      }

      onNavigate={(page) => {

        if (
          page === "AI Companion"
        ) {
          navigate(
            "/ai-companion"
          );

          return;
        }

        if (
          page === "Settings"
        ) {
          navigate(
            "/settings"
          );

          return;
        }

      }}
    />
  );
}

export default App;