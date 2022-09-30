import { useState } from "react";
import { useUser } from "../../contexts/ethier";

export function SettingsPage() {
  const { deleteAccountOrLogout } = useUser();
  const [network, setNetwork] = useState("Mainnet");

  return (
    <div className="ethier-widget-page settings-page flex-centered column">
      <h1 className="brand-text">Settings</h1>
      <div className="settings-page-setting flex align-start justify-center column">
        <span className="desc-text">Network</span>
        <div className="select-group">
          <select value={network} onChange={(e) => setNetwork(e.target.value)}>
            {["Mainnet"].map((network) => (
              <option key={network} value={network}>
                {network}
              </option>
            ))}
          </select>
          <i className="fa-solid fa-angle-down"></i>
        </div>
      </div>
      <button
        className="full-width error-btn"
        onClick={() => deleteAccountOrLogout(false)}
      >
        Sign Out
      </button>
      <span
        className="link-btn error-link-btn"
        onClick={() => deleteAccountOrLogout(true)}
      >
        Delete Account
      </span>
    </div>
  );
}
