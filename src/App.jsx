import { useState, useEffect } from "react";
import "./styles.css";
import ProfileGate from "./components/ProfileGate.jsx";
import TrackerApp from "./components/TrackerApp.jsx";

const ACTIVE_PROFILE_KEY = "toggle-active-profile";

export default function App() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const last = sessionStorage.getItem(ACTIVE_PROFILE_KEY);
    if (last) setProfile(last);
  }, []);

  function enter(name) {
    sessionStorage.setItem(ACTIVE_PROFILE_KEY, name);
    setProfile(name);
  }
  function switchProfile() {
    sessionStorage.removeItem(ACTIVE_PROFILE_KEY);
    setProfile(null);
  }

  return profile ? (
    <TrackerApp profile={profile} onSwitchProfile={switchProfile} />
  ) : (
    <ProfileGate onEnter={enter} />
  );
}
