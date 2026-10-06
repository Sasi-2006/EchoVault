import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  ArrowLeft,
} from "lucide-react";

function Settings({
  user,
  onBack,
  onLogout,
}) {
  return (
    <div className="settings-page">
      <div className="settings-container">

        <button
          className="back-button"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="settings-header">
          <p className="eyebrow">
            Account
          </p>

          <h1>Settings</h1>

          <p>
            Manage your EchoVault account.
          </p>
        </div>

        <div className="settings-card">

          <div className="settings-section">
            <div className="settings-section-icon">
              <User size={20} />
            </div>

            <div>
              <h3>Profile</h3>
              <p>Your account information</p>
            </div>
          </div>

          <div className="settings-row">
            <span>Name</span>
            <strong>
              {user?.name || "User"}
            </strong>
          </div>

          <div className="settings-row">
            <span>Email</span>
            <strong>
              {user?.email || "Not available"}
            </strong>
          </div>

        </div>

        <div className="settings-card">

          <div className="settings-section">
            <div className="settings-section-icon">
              <Mail size={20} />
            </div>

            <div>
              <h3>Email</h3>
              <p>
                Your registered email address
              </p>
            </div>
          </div>

          <div className="settings-info">
            <Mail size={18} />

            <span>
              {user?.email || "Not available"}
            </span>
          </div>

        </div>

        <div className="settings-card">

          <div className="settings-section">
            <div className="settings-section-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3>Privacy</h3>
              <p>
                Your journal belongs to your account.
              </p>
            </div>
          </div>

          <div className="settings-privacy">
            <ShieldCheck size={18} />

            <span>
              Your journal entries are protected
              by authentication and are only
              accessible to your account.
            </span>
          </div>

        </div>

        <div className="settings-card danger-card">

          <div className="settings-section">
            <div className="settings-section-icon">
              <LogOut size={20} />
            </div>

            <div>
              <h3>Sign out</h3>
              <p>
                Sign out from this EchoVault account.
              </p>
            </div>
          </div>

          <button
            className="settings-logout-button"
            onClick={onLogout}
            type="button"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}

export default Settings;