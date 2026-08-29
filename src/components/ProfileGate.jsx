import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Paw from "./Paw.jsx";
import { loadProfiles, saveProfiles } from "../lib/storage.js";

export default function ProfileGate({ onEnter }) {
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState("pick");

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  function persistProfiles(list) {
    setProfiles(list);
    saveProfiles(list);
  }
  function createProfile() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (profiles.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) return;
    const list = [...profiles, { name: trimmed, pin: pin.trim() }];
    persistProfiles(list);
    onEnter(trimmed);
  }
  function enterProfile(p) {
    if (p.pin) {
      const attempt = prompt(`PIN for ${p.name}:`);
      if (attempt !== p.pin) return;
    }
    onEnter(p.name);
  }

  return (
    <div className="gate-root">
      <div className="gate-card">
        <div className="gate-ears"><div className="ear" /><div className="ear" /></div>
        <h1 className="gate-title">Toggle</h1>
        <p className="gate-sub">whose paws are these?</p>
        {mode === "pick" && (
          <>
            <div className="gate-list">
              {profiles.map((p) => (
                <button key={p.name} className="gate-profile" onClick={() => enterProfile(p)}>
                  <Paw size={16} color="#ff2d78" /> {p.name}{p.pin && <span className="gate-lock">🔒</span>}
                </button>
              ))}
            </div>
            <button className="gate-new" onClick={() => setMode("new")}><Plus size={15} /> new profile</button>
          </>
        )}
        {mode === "new" && (
          <div className="gate-form">
            <input placeholder="your name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <input placeholder="PIN (optional)" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={6} />
            <div className="gate-form-row">
              <button className="gate-submit" onClick={createProfile}>Start</button>
              {profiles.length > 0 && <button className="gate-cancel" onClick={() => setMode("pick")}>Back</button>}
            </div>
            <p className="gate-note">This PIN just keeps profiles separate on one shared device — it isn't secure account authentication. Everything stays in this browser, nothing is sent anywhere.</p>
          </div>
        )}
      </div>
    </div>
  );
}
