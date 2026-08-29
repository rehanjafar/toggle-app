import { useState } from "react";
import { Utensils, Trash2 } from "lucide-react";
import { todayISO } from "../lib/dates.js";
import { estimateCalories } from "../lib/calories.js";

export default function DietSection({ diet, setDiet }) {
  const today = todayISO();
  const [name, setName] = useState("");
  const entries = diet[today] || [];
  const total = entries.reduce((sum, e) => sum + e.calories, 0);

  function addEntry() {
    if (!name.trim()) return;
    const calories = estimateCalories(name);
    setDiet((prev) => ({ ...prev, [today]: [...(prev[today] || []), { id: crypto.randomUUID(), name: name.trim(), calories }] }));
    setName("");
  }
  function removeEntry(id) {
    setDiet((prev) => ({ ...prev, [today]: (prev[today] || []).filter((e) => e.id !== id) }));
  }

  return (
    <section className="tg-section">
      <div className="diet-total">
        <Utensils size={16} color="#ff2d78" />
        <span className="diet-total-num">{total}</span>
        <span className="diet-total-label">est. calories today</span>
      </div>
      <p className="diet-disclaimer">Rough estimate from a built-in lookup table, not a nutrition database — treat it as a ballpark, not medical or dietary advice. Resets automatically each new day.</p>
      <div className="add-form" style={{ marginBottom: 4 }}>
        <input placeholder="what did you eat? e.g. chicken and rice" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEntry()} />
        <button className="primary-btn" onClick={addEntry}>log it</button>
      </div>
      {entries.length === 0 && <div className="empty-state small">Nothing logged yet today.</div>}
      <div className="task-list">
        {entries.map((e) => (
          <div key={e.id} className="task-row">
            <div className="task-body">
              <div className="task-name">{e.name}</div>
              <div className="task-meta"><span className="due-chip">~{e.calories} kcal</span></div>
            </div>
            <button className="delete-mini" aria-label={`Remove ${e.name}`} onClick={() => removeEntry(e.id)}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}

