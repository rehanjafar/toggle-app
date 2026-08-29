import { useState } from "react";

const TUTORIAL_STEPS = [
  { title: "This is your den", body: "Toggle tracks habits, tasks, daily photos, and food — all in one place. Switch sections with the tabs up top." },
  { title: "Check off habits", body: "Tap a paw print to mark a habit done for that day. Keep the streak alive and your cat perks up." },
  { title: "Tasks have deadlines", body: "Add one-off things with a due date and priority. Overdue ones turn bright pink." },
  { title: "Daily photos", body: "The Photos tab is a calendar — pick a day, upload one or more photos, and jot a note. Great for a visual journal." },
  { title: "Food log", body: "The Diet tab estimates calories from what you type, using a rough built-in lookup — it's a ballpark, not medical advice." },
  { title: "Honest hours", body: "The Hours tab lets you protect one hour at a time — set a finish line, track whatever you want inside it, then write an honest sentence about what actually happened." },
  { title: "You're set", body: "Tap the paw icon top-right anytime to replay this." },
];
export default function Tutorial({ onClose }) {
  const [step, setStep] = useState(0);
  const s = TUTORIAL_STEPS[step];
  return (
    <div className="tut-overlay">
      <div className="tut-card">
        <div className="tut-progress">{TUTORIAL_STEPS.map((_, i) => <span key={i} className={"tut-dot" + (i === step ? " active" : i < step ? " done" : "")} />)}</div>
        <h3>{s.title}</h3>
        <p>{s.body}</p>
        <div className="tut-row">
          <button className="tut-skip" onClick={onClose}>skip</button>
          <div className="tut-nav">
            {step > 0 && <button className="tut-back" onClick={() => setStep(step - 1)}>back</button>}
            {step < TUTORIAL_STEPS.length - 1 ? <button className="tut-next" onClick={() => setStep(step + 1)}>next</button> : <button className="tut-next" onClick={onClose}>let's go</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
