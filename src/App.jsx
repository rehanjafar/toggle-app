import { useState, useEffect, useMemo, useRef } from "react";
import { Check, Plus, Flame, X, Calendar, Trash2, ChevronLeft, ChevronRight, HelpCircle, LogOut, Camera, Utensils, ImagePlus, Clock } from "lucide-react";
import { todayISO, addDays, startOfWeek, fmtDay, fmtDate, monthGrid, monthLabel } from "./lib/dates.js";
import { estimateCalories } from "./lib/calories.js";
import { loadProfiles, saveProfiles, loadProfileData, saveProfileData, tutorialSeenKey, estimateStorageUsedMB } from "./lib/storage.js";

const PRIORITY = {
  high: { label: "High", color: "#ff2d78" },
  medium: { label: "Medium", color: "#ff8fb3" },
  low: { label: "Low", color: "#7a7480" },
};

function Paw({ size = 14, filled = true, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth={filled ? 0 : 1.6}>
      <ellipse cx="12" cy="16" rx="6" ry="5" />
      <ellipse cx="4.5" cy="9" rx="2.3" ry="3" />
      <ellipse cx="9.5" cy="5.5" rx="2.3" ry="3" />
      <ellipse cx="14.5" cy="5.5" rx="2.3" ry="3" />
      <ellipse cx="19.5" cy="9" rx="2.3" ry="3" />
    </svg>
  );
}

function CatMascot({ streak, size = 78 }) {
  const stage = streak >= 30 ? 3 : streak >= 14 ? 2 : streak >= 3 ? 1 : 0;
  const purr = ["asleep", "one eye open", "purring", "zoomies"][stage];
  return (
    <div className="cat-mascot">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <ellipse cx="50" cy="62" rx="30" ry="26" fill="#1a1420" stroke="#ff2d78" strokeWidth="2.5" />
        <path d="M24 40 L14 16 L38 32 Z" fill="#1a1420" stroke="#ff2d78" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M76 40 L86 16 L62 32 Z" fill="#1a1420" stroke="#ff2d78" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M25 34 L20 20 L33 30 Z" fill="#ff2d78" />
        <path d="M75 34 L80 20 L67 30 Z" fill="#ff2d78" />
        {stage < 2 ? (
          <>
            <path d="M36 58 Q41 53 46 58" stroke="#ffb3cf" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M54 58 Q59 53 64 58" stroke="#ffb3cf" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="41" cy="58" r="3.4" fill="#ff2d78" />
            <circle cx="59" cy="58" r="3.4" fill="#ff2d78" />
          </>
        )}
        <path d="M47 66 L53 66 L50 70 Z" fill="#ff2d78" />
        <path d={stage >= 1 ? "M42 72 Q50 78 58 72" : "M44 71 Q50 74 56 71"} stroke="#ffb3cf" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M50 70 Q30 68 16 72" stroke="#ffb3cf" strokeWidth="1.2" fill="none" opacity="0.7" />
        <path d="M50 70 Q30 74 16 76" stroke="#ffb3cf" strokeWidth="1.2" fill="none" opacity="0.7" />
        <path d="M50 70 Q70 68 84 72" stroke="#ffb3cf" strokeWidth="1.2" fill="none" opacity="0.7" />
        <path d="M50 70 Q70 74 84 76" stroke="#ffb3cf" strokeWidth="1.2" fill="none" opacity="0.7" />
        {stage >= 1 && <circle cx="30" cy="63" r="4" fill="#ff2d78" opacity="0.35" />}
        {stage >= 1 && <circle cx="70" cy="63" r="4" fill="#ff2d78" opacity="0.35" />}
        {stage >= 2 && <path d="M76 78 Q92 70 88 54" stroke="#1a1420" strokeWidth="7" fill="none" strokeLinecap="round" />}
        {stage >= 3 && (
          <>
            <path d="M12 50 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#ff8fb3" />
            <path d="M88 45 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" fill="#ff2d78" />
          </>
        )}
      </svg>
      <div className="cat-mascot-label">{purr}</div>
    </div>
  );
}

function ProfileGate({ onEnter }) {
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

const TUTORIAL_STEPS = [
  { title: "This is your den", body: "Toggle tracks habits, tasks, daily photos, and food — all in one place. Switch sections with the tabs up top." },
  { title: "Check off habits", body: "Tap a paw print to mark a habit done for that day. Keep the streak alive and your cat perks up." },
  { title: "Tasks have deadlines", body: "Add one-off things with a due date and priority. Overdue ones turn bright pink." },
  { title: "Daily photos", body: "The Photos tab is a calendar — pick a day, upload one or more photos, and jot a note. Great for a visual journal." },
  { title: "Food log", body: "The Diet tab estimates calories from what you type, using a rough built-in lookup — it's a ballpark, not medical advice." },
  { title: "Honest hours", body: "The Hours tab lets you protect one hour at a time — set a finish line, track whatever you want inside it, then write an honest sentence about what actually happened." },
  { title: "You're set", body: "Tap the paw icon top-right anytime to replay this." },
];
function Tutorial({ onClose }) {
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

function useIsWide() {
  const [isWide, setIsWide] = useState(typeof window !== "undefined" ? window.innerWidth >= 860 : false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 860px)");
    const handler = (e) => setIsWide(e.matches);
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    setIsWide(mq.matches);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler));
  }, []);
  return isWide;
}

function PhotoJournal({ photos, setPhotos }) {
  const [monthAnchor, setMonthAnchor] = useState(todayISO());
  const [selected, setSelected] = useState(todayISO());
  const fileRef = useRef(null);
  const cells = useMemo(() => monthGrid(monthAnchor), [monthAnchor]);
  const dayPhotos = photos[selected] || [];
  const storageMB = estimateStorageUsedMB();

  function handleFiles(fileList) {
    const files = Array.from(fileList).slice(0, 6);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => {
          const list = prev[selected] ? [...prev[selected]] : [];
          list.push({ id: crypto.randomUUID(), dataUrl: reader.result, note: "" });
          return { ...prev, [selected]: list };
        });
      };
      reader.readAsDataURL(file);
    });
  }
  function updateNote(id, text) {
    setPhotos((prev) => ({ ...prev, [selected]: (prev[selected] || []).map((p) => (p.id === id ? { ...p, note: text } : p)) }));
  }
  function removePhoto(id) {
    setPhotos((prev) => ({ ...prev, [selected]: (prev[selected] || []).filter((p) => p.id !== id) }));
  }

  return (
    <section className="tg-section">
      <div className="week-nav">
        <button className="icon-btn" aria-label="Previous month" onClick={() => setMonthAnchor(addDays(startOfWeek(monthAnchor), -28))}><ChevronLeft size={17} /></button>
        <div className="week-range">{monthLabel(monthAnchor)}</div>
        <button className="icon-btn" aria-label="Next month" onClick={() => setMonthAnchor(addDays(monthAnchor, 28))}><ChevronRight size={17} /></button>
      </div>
      {storageMB > 3.5 && (
        <div className="storage-warn">Local storage is getting full ({storageMB.toFixed(1)}MB of a ~5–10MB browser limit) — older photos may fail to save. Real long-term photo storage needs cloud storage, not just this browser.</div>
      )}
      <div className="cal-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} className="cal-dow">{d}</div>)}
        {cells.map((iso, i) =>
          iso ? (
            <button key={iso} className={"cal-cell" + (iso === selected ? " selected" : "") + (iso === todayISO() ? " is-today" : "")} onClick={() => setSelected(iso)}>
              {new Date(iso + "T00:00:00").getDate()}
              {photos[iso]?.length > 0 && <span className="cal-dot" />}
            </button>
          ) : <div key={"empty" + i} />
        )}
      </div>
      <div className="day-panel">
        <div className="day-panel-head">
          <Camera size={14} color="#ff2d78" /> {fmtDate(selected)}
          <button className="add-photo-btn" onClick={() => fileRef.current?.click()}><ImagePlus size={14} /> add photo</button>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} style={{ display: "none" }} />
        </div>
        {dayPhotos.length === 0 && <div className="empty-state small">No photos this day yet.</div>}
        <div className="photo-grid">
          {dayPhotos.map((p) => (
            <div key={p.id} className="photo-card">
              <img src={p.dataUrl} alt="" />
              <button className="photo-remove" aria-label="Remove photo" onClick={() => removePhoto(p.id)}><X size={12} /></button>
              <input className="photo-note" placeholder="add a note…" value={p.note} onChange={(e) => updateNote(p.id, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DietSection({ diet, setDiet }) {
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

function HourBlockCard({ block, onUpdate, onRemove, onAddItem, onRemoveItem }) {
  const [itemLabel, setItemLabel] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [expanded, setExpanded] = useState(true);

  function submitItem() {
    if (!itemLabel.trim()) return;
    onAddItem(itemLabel, itemValue);
    setItemLabel("");
    setItemValue("");
  }

  return (
    <div className={"hour-card" + (block.done ? " reviewed" : "")}>
      <div className="hour-card-head" onClick={() => setExpanded((e) => !e)}>
        <Clock size={14} color="#ff2d78" />
        <div className="hour-card-title">
          {block.time && <span className="hour-time">{block.time}</span>}
          <span className="hour-title-text">{block.title}</span>
        </div>
        {block.done && <span className="hour-done-badge">reviewed</span>}
        <button className="delete-mini" aria-label={`Delete hour: ${block.title}`} onClick={(e) => { e.stopPropagation(); onRemove(); }}><Trash2 size={13} /></button>
      </div>
      {expanded && (
        <div className="hour-card-body">
          <label className="hour-field-label">Finish line — what does done look like?</label>
          <input className="hour-input" placeholder="e.g. one section completed" value={block.finishLine} onChange={(e) => onUpdate({ finishLine: e.target.value })} />

          <label className="hour-field-label">Add anything you want to track for this hour</label>
          {block.items.length > 0 && (
            <div className="hour-items">
              {block.items.map((it) => (
                <div key={it.id} className="hour-item-row">
                  <span className="hour-item-label">{it.label}</span>
                  <span className="hour-item-value">{it.value}</span>
                  <button className="delete-mini" aria-label={`Remove ${it.label}`} onClick={() => onRemoveItem(it.id)}><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="add-form-row">
            <input placeholder="label — e.g. distractions removed" value={itemLabel} onChange={(e) => setItemLabel(e.target.value)} />
            <input placeholder="value — e.g. phone in other room" value={itemValue} onChange={(e) => setItemValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitItem()} />
          </div>
          <button className="add-btn small-add" onClick={submitItem}><Plus size={14} /> add item</button>

          <label className="hour-field-label">Honest review — what actually happened?</label>
          <textarea className="hour-textarea" placeholder="one or two honest sentences…" value={block.review} onChange={(e) => onUpdate({ review: e.target.value })} rows={3} />

          <button className={"mark-reviewed-btn" + (block.done ? " active" : "")} onClick={() => onUpdate({ done: !block.done })}>
            <Check size={14} /> {block.done ? "marked reviewed" : "mark reviewed"}
          </button>
        </div>
      )}
    </div>
  );
}

function HonestHourSection({ hours, setHours }) {
  const [dayAnchor, setDayAnchor] = useState(todayISO());
  const dayHours = hours[dayAnchor] || [];
  const [newTime, setNewTime] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  function addBlock() {
    if (!newTitle.trim()) return;
    const block = {
      id: crypto.randomUUID(),
      time: newTime.trim(),
      title: newTitle.trim(),
      finishLine: "",
      items: [],
      review: "",
      done: false,
    };
    setHours((prev) => ({ ...prev, [dayAnchor]: [...(prev[dayAnchor] || []), block] }));
    setNewTime("");
    setNewTitle("");
    setShowAdd(false);
  }
  function updateBlock(id, patch) {
    setHours((prev) => ({
      ...prev,
      [dayAnchor]: (prev[dayAnchor] || []).map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }
  function removeBlock(id) {
    setHours((prev) => ({ ...prev, [dayAnchor]: (prev[dayAnchor] || []).filter((b) => b.id !== id) }));
  }
  function addItem(blockId, label, value) {
    if (!label.trim()) return;
    setHours((prev) => ({
      ...prev,
      [dayAnchor]: (prev[dayAnchor] || []).map((b) =>
        b.id === blockId ? { ...b, items: [...b.items, { id: crypto.randomUUID(), label: label.trim(), value: value.trim() }] } : b
      ),
    }));
  }
  function removeItem(blockId, itemId) {
    setHours((prev) => ({
      ...prev,
      [dayAnchor]: (prev[dayAnchor] || []).map((b) =>
        b.id === blockId ? { ...b, items: b.items.filter((i) => i.id !== itemId) } : b
      ),
    }));
  }

  return (
    <section className="tg-section">
      <div className="week-nav">
        <button className="icon-btn" aria-label="Previous day" onClick={() => setDayAnchor(addDays(dayAnchor, -1))}><ChevronLeft size={17} /></button>
        <div className="week-range">{fmtDate(dayAnchor)}{dayAnchor === todayISO() ? " · today" : ""}</div>
        <button className="icon-btn" aria-label="Next day" onClick={() => setDayAnchor(addDays(dayAnchor, 1))}><ChevronRight size={17} /></button>
        {dayAnchor !== todayISO() && <button className="today-btn" onClick={() => setDayAnchor(todayISO())}>today</button>}
      </div>
      <p className="diet-disclaimer">Pick one hour, decide what it's for, protect it, then tell yourself the truth about what happened. Add whatever you want to track inside each hour.</p>
      {dayHours.length === 0 && <div className="empty-state small">No hours logged for this day yet.</div>}
      <div className="hour-list">
        {dayHours.map((b) => (
          <HourBlockCard
            key={b.id}
            block={b}
            onUpdate={(p) => updateBlock(b.id, p)}
            onRemove={() => removeBlock(b.id)}
            onAddItem={(l, v) => addItem(b.id, l, v)}
            onRemoveItem={(iid) => removeItem(b.id, iid)}
          />
        ))}
      </div>
      {!showAdd ? (
        <button className="add-btn" onClick={() => setShowAdd(true)}><Plus size={16} /> add hour</button>
      ) : (
        <div className="add-form">
          <input autoFocus placeholder="time (e.g. 9:00 AM) — optional" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
          <input placeholder="what is this hour for? e.g. write the opening section" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBlock()} />
          <div className="add-form-row"><button className="primary-btn" onClick={addBlock}>add</button><button className="ghost-btn" onClick={() => setShowAdd(false)}><X size={16} /></button></div>
        </div>
      )}
    </section>
  );
}

function TrackerApp({ profile, onSwitchProfile }) {
  const isWide = useIsWide();
  const [ready, setReady] = useState(false);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [photos, setPhotos] = useState({});
  const [diet, setDiet] = useState({});
  const [hours, setHours] = useState({});
  const [tab, setTab] = useState("habits");
  const [weekAnchor, setWeekAnchor] = useState(startOfWeek(todayISO()));
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDue, setNewTaskDue] = useState(todayISO());
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [taskFilter, setTaskFilter] = useState("open");
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const data = loadProfileData(profile);
    setHabits(data.habits);
    setTasks(data.tasks);
    setPhotos(data.photos);
    setDiet(data.diet);
    setHours(data.hours);
    setReady(true);
    if (!localStorage.getItem(tutorialSeenKey(profile))) setShowTutorial(true);
  }, [profile]);

  useEffect(() => {
    if (!ready) return;
    saveProfileData(profile, { habits, tasks, photos, diet, hours });
  }, [habits, tasks, photos, diet, hours, ready, profile]);

  const today = todayISO();
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekAnchor, i)), [weekAnchor]);

  function closeTutorial() {
    setShowTutorial(false);
    localStorage.setItem(tutorialSeenKey(profile), "1");
  }
  function addHabit() {
    if (!newHabitName.trim()) return;
    setHabits((h) => [...h, { id: crypto.randomUUID(), name: newHabitName.trim(), log: {} }]);
    setNewHabitName("");
    setShowAddHabit(false);
  }
  function toggleHabit(id, iso) {
    setHabits((hs) => hs.map((h) => {
      if (h.id !== id) return h;
      const log = { ...h.log };
      log[iso] ? delete log[iso] : (log[iso] = true);
      return { ...h, log };
    }));
  }
  function deleteHabit(id) { setHabits((hs) => hs.filter((h) => h.id !== id)); }
  function currentStreak(h) {
    let streak = 0, d = today;
    if (!h.log[d]) d = addDays(d, -1);
    while (h.log[d]) { streak++; d = addDays(d, -1); }
    return streak;
  }
  function weekCompletion(h) { return weekDays.filter((iso) => h.log[iso]).length; }
  function addTask() {
    if (!newTaskName.trim()) return;
    setTasks((ts) => [...ts, { id: crypto.randomUUID(), name: newTaskName.trim(), due: newTaskDue, priority: newTaskPriority, done: false }]);
    setNewTaskName(""); setNewTaskDue(today); setNewTaskPriority("medium"); setShowAddTask(false);
  }
  function toggleTask(id) { setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t))); }
  function deleteTask(id) { setTasks((ts) => ts.filter((t) => t.id !== id)); }

  const sortedTasks = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 };
    let list = [...tasks];
    if (taskFilter === "open") list = list.filter((t) => !t.done);
    if (taskFilter === "done") list = list.filter((t) => t.done);
    return list.sort((a, b) => (a.done !== b.done ? (a.done ? 1 : -1) : a.due !== b.due ? (a.due < b.due ? -1 : 1) : order[a.priority] - order[b.priority]));
  }, [tasks, taskFilter]);

  const bestStreak = useMemo(() => (habits.length ? Math.max(0, ...habits.map(currentStreak)) : 0), [habits, today]);
  const todayHabitsDone = habits.filter((h) => h.log[today]).length;
  const openToday = tasks.filter((t) => !t.done && t.due === today).length;
  const overdue = tasks.filter((t) => !t.done && t.due < today).length;

  if (!ready) return <div className="tg-root loading"><div className="paw-loader"><Paw size={22} color="#ff2d78" /></div></div>;

  const TABS = [
    { id: "habits", label: "Habits" },
    { id: "tasks", label: "Tasks" },
    { id: "photos", label: "Photos" },
    { id: "diet", label: "Diet" },
    { id: "hours", label: "Hours" },
  ];

  return (
    <div className="tg-root">
      {showTutorial && <Tutorial onClose={closeTutorial} />}
      <div className="whisker-banner">
        <svg viewBox="0 0 100 20" className="whisker-svg" preserveAspectRatio="none">
          <path d="M0 10 Q25 2 50 10 T100 10" stroke="#ff2d78" strokeWidth="0.6" fill="none" opacity="0.5" />
          <path d="M0 12 Q25 18 50 12 T100 12" stroke="#ff8fb3" strokeWidth="0.4" fill="none" opacity="0.4" />
        </svg>
      </div>
      <header className="tg-header">
        <div className="tg-brand"><span className="tg-ear tg-ear-l" /><span className="tg-ear tg-ear-r" />Toggle</div>
        <div className="tg-header-actions">
          <button className="icon-pill" aria-label="Replay tutorial" onClick={() => setShowTutorial(true)} title="Replay tutorial"><HelpCircle size={16} /></button>
          <button className="icon-pill" aria-label="Switch profile" onClick={onSwitchProfile} title="Switch profile"><LogOut size={16} /></button>
          <CatMascot streak={bestStreak} size={60} />
        </div>
      </header>
      <div className="tg-summary">
        <div className="stat-card"><div className="stat-num">{todayHabitsDone}<span className="stat-den">/{habits.length}</span></div><div className="stat-label"><Paw size={9} color="#6b6673" /> today</div></div>
        <div className="stat-card accent"><div className="stat-num"><Flame size={16} color="#ff2d78" /> {bestStreak}</div><div className="stat-label">streak</div></div>
        <div className="stat-card"><div className="stat-num">{openToday}</div><div className="stat-label">due today</div></div>
        <div className="stat-card"><div className={"stat-num" + (overdue > 0 ? " warn" : "")}>{overdue}</div><div className="stat-label">overdue</div></div>
      </div>
      <nav className="tg-tabs">
        {TABS.map((t) => <button key={t.id} className={tab === t.id ? "tab active" : "tab"} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </nav>
      {tab === "habits" && (
        <section className="tg-section">
          <div className="week-nav">
            <button className="icon-btn" aria-label="Previous week" onClick={() => setWeekAnchor(addDays(weekAnchor, -7))}><ChevronLeft size={17} /></button>
            <div className="week-range">{fmtDate(weekDays[0])} – {fmtDate(weekDays[6])}</div>
            <button className="icon-btn" aria-label="Next week" onClick={() => setWeekAnchor(addDays(weekAnchor, 7))}><ChevronRight size={17} /></button>
            {weekAnchor !== startOfWeek(today) && <button className="today-btn" onClick={() => setWeekAnchor(startOfWeek(today))}>today</button>}
          </div>
          {habits.length === 0 && <div className="empty-state"><p>No habits yet — nothing for the cat to watch. Add the first one below.</p></div>}
          {habits.length > 0 && (
            <div className="habit-table">
              <div className="habit-table-head">
                <div className="habit-name-col" />
                {weekDays.map((iso) => <div key={iso} className={"day-col-head" + (iso === today ? " is-today" : "")}><div className="day-name">{fmtDay(iso)}</div><div className="day-num">{new Date(iso + "T00:00:00").getDate()}</div></div>)}
              </div>
              {habits.map((h) => {
                const streak = currentStreak(h), wk = weekCompletion(h);
                return (
                  <div className="habit-row" key={h.id}>
                    <div className="habit-name-col">
                      <div className="habit-name">{h.name}</div>
                      <div className="habit-meta">
                        {streak > 0 && <span className="streak-chip"><Flame size={11} /> {streak}</span>}
                        <span className="week-chip">{wk}/7</span>
                        <button className="delete-mini" aria-label={`Delete habit: ${h.name}`} onClick={() => deleteHabit(h.id)}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    {weekDays.map((iso) => {
                      const done = !!h.log[iso], future = iso > today;
                      return (
                        <div key={iso} className={"day-col" + (iso === today ? " is-today" : "")}>
                          <button
                            disabled={future}
                            aria-pressed={done}
                            aria-label={`${h.name} — ${fmtDate(iso)}${done ? ", done" : ""}`}
                            className={"paw-btn" + (done ? " checked" : "") + (future ? " future" : "")}
                            onClick={() => toggleHabit(h.id, iso)}
                          >
                            <Paw size={15} filled={done} color={done ? "#fff" : "#3a2836"} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
          {!showAddHabit ? (
            <button className="add-btn" onClick={() => setShowAddHabit(true)}><Plus size={16} /> add habit</button>
          ) : (
            <div className="add-form">
              <input autoFocus placeholder="e.g. stretch, read, drink water" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addHabit()} />
              <div className="add-form-row"><button className="primary-btn" onClick={addHabit}>add</button><button className="ghost-btn" onClick={() => setShowAddHabit(false)}><X size={16} /></button></div>
            </div>
          )}
        </section>
      )}
      {tab === "tasks" && (
        <section className="tg-section">
          <div className="task-filters">{["open", "done", "all"].map((f) => <button key={f} className={taskFilter === f ? "filter-btn active" : "filter-btn"} onClick={() => setTaskFilter(f)}>{f}</button>)}</div>
          {sortedTasks.length === 0 && <div className="empty-state"><p>Nothing here. Add a task to give it a deadline.</p></div>}
          <div className="task-list">
            {sortedTasks.map((t) => {
              const isOverdue = !t.done && t.due < today, isToday = t.due === today;
              return (
                <div key={t.id} className={"task-row" + (t.done ? " done" : "")}>
                  <button aria-pressed={t.done} aria-label={`Mark task ${t.done ? "not done" : "done"}: ${t.name}`} className={"paw-btn small" + (t.done ? " checked" : "")} onClick={() => toggleTask(t.id)}><Paw size={12} filled={t.done} color={t.done ? "#fff" : "#3a2836"} /></button>
                  <div className="task-body">
                    <div className="task-name">{t.name}</div>
                    <div className="task-meta">
                      <span className={"due-chip" + (isOverdue ? " overdue" : isToday ? " today" : "")}>{isOverdue ? "overdue · " : ""}{fmtDate(t.due)}</span>
                      <span className="priority-chip" style={{ "--pc": PRIORITY[t.priority].color }}>{PRIORITY[t.priority].label}</span>
                    </div>
                  </div>
                  <button className="delete-mini" aria-label={`Delete task: ${t.name}`} onClick={() => deleteTask(t.id)}><Trash2 size={13} /></button>
                </div>
              );
            })}
          </div>
          {!showAddTask ? (
            <button className="add-btn" onClick={() => setShowAddTask(true)}><Plus size={16} /> add task</button>
          ) : (
            <div className="add-form">
              <input autoFocus placeholder="what needs doing?" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} />
              <div className="add-form-row">
                <input type="date" value={newTaskDue} onChange={(e) => setNewTaskDue(e.target.value)} className="date-input" />
                <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="priority-select"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
              </div>
              <div className="add-form-row"><button className="primary-btn" onClick={addTask}>add</button><button className="ghost-btn" onClick={() => setShowAddTask(false)}><X size={16} /></button></div>
            </div>
          )}
        </section>
      )}
      {tab === "photos" && <PhotoJournal photos={photos} setPhotos={setPhotos} />}
      {tab === "diet" && <DietSection diet={diet} setDiet={setDiet} />}
      {tab === "hours" && <HonestHourSection hours={hours} setHours={setHours} />}
      <footer className="tg-footer"><Paw size={10} color="#4a4450" /> signed in as {profile} · data stays in this browser</footer>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const last = sessionStorage.getItem("toggle-active-profile");
    if (last) setProfile(last);
  }, []);
  function enter(name) { sessionStorage.setItem("toggle-active-profile", name); setProfile(name); }
  function switchProfile() { sessionStorage.removeItem("toggle-active-profile"); setProfile(null); }
  return (
    <>
      <style>{styles}</style>
      {profile ? <TrackerApp profile={profile} onSwitchProfile={switchProfile} /> : <ProfileGate onEnter={enter} />}
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
* { box-sizing: border-box; }
.tg-root { min-height: 100vh; background: #0c0a0e; color: #f2eef1; font-family: 'Nunito', sans-serif; padding: 16px 16px 40px; max-width: 640px; margin: 0 auto; }
.tg-root.loading { display: flex; align-items: center; justify-content: center; }
.paw-loader { animation: bounce 0.9s ease-in-out infinite; }
@keyframes bounce { 0%,100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-6px); opacity: 1; } }
.gate-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0c0a0e; padding: 20px; }
.gate-card { background: #15111a; border: 2px solid #2a2030; border-radius: 26px; padding: 34px 28px 26px; width: 100%; max-width: 340px; text-align: center; position: relative; }
.gate-ears { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); display: flex; gap: 60px; }
.ear { width: 0; height: 0; border-left: 16px solid transparent; border-right: 16px solid transparent; border-bottom: 26px solid #15111a; }
.gate-title { font-family: 'Fredoka', sans-serif; font-size: 30px; font-weight: 700; color: #ff2d78; margin: 4px 0 0; }
.gate-sub { color: #8a8490; font-size: 13px; margin: 2px 0 22px; }
.gate-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.gate-profile { display: flex; align-items: center; gap: 8px; background: #1c1620; border: 1.5px solid #2a2030; color: #f2eef1; border-radius: 12px; padding: 12px 14px; font-family: 'Nunito', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; }
.gate-profile:hover { border-color: #ff2d78; }
.gate-lock { margin-left: auto; font-size: 11px; }
.gate-new { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: transparent; border: 1.5px dashed #3a2f42; color: #b8b3ba; border-radius: 12px; padding: 11px; font-weight: 600; font-size: 13px; cursor: pointer; }
.gate-form { display: flex; flex-direction: column; gap: 9px; }
.gate-form input { background: #1c1620; border: 1.5px solid #2a2030; border-radius: 10px; padding: 11px 13px; color: #f2eef1; font-family: 'Nunito', sans-serif; font-size: 14px; outline: none; }
.gate-form input:focus { border-color: #ff2d78; }
.gate-form-row { display: flex; gap: 8px; }
.gate-submit { flex: 1; background: #ff2d78; border: none; color: #fff; font-weight: 700; border-radius: 10px; padding: 11px; cursor: pointer; }
.gate-cancel { background: #1c1620; border: 1.5px solid #2a2030; color: #b8b3ba; border-radius: 10px; padding: 11px 14px; cursor: pointer; }
.gate-note { font-size: 10.5px; color: #6b6673; line-height: 1.5; margin-top: 4px; text-align: left; }
.tut-overlay { position: fixed; inset: 0; background: rgba(6,4,8,0.82); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
.tut-card { background: #15111a; border: 2px solid #ff2d78; border-radius: 22px; padding: 26px 24px; max-width: 340px; width: 100%; }
.tut-progress { display: flex; gap: 5px; margin-bottom: 14px; }
.tut-dot { height: 4px; flex: 1; border-radius: 2px; background: #2a2030; }
.tut-dot.active { background: #ff2d78; }
.tut-dot.done { background: #6b2e46; }
.tut-card h3 { font-family: 'Fredoka', sans-serif; font-size: 19px; margin: 0 0 8px; color: #fff; }
.tut-card p { font-size: 13.5px; line-height: 1.55; color: #c4bfc7; margin: 0 0 18px; }
.tut-row { display: flex; align-items: center; justify-content: space-between; }
.tut-skip { background: none; border: none; color: #6b6673; font-size: 12px; cursor: pointer; }
.tut-nav { display: flex; gap: 8px; }
.tut-back { background: #1c1620; border: 1px solid #2a2030; color: #b8b3ba; border-radius: 8px; padding: 8px 14px; cursor: pointer; font-size: 13px; }
.tut-next { background: #ff2d78; border: none; color: #fff; font-weight: 700; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 13px; }
.whisker-banner { height: 18px; margin: 0 -16px 4px; }
.whisker-svg { width: 100%; height: 100%; }
.tg-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 6px 2px 18px; }
.tg-brand { position: relative; font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 26px; color: #fff; padding-top: 8px; }
.tg-ear { position: absolute; top: -4px; width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-bottom: 11px solid #ff2d78; }
.tg-ear-l { left: -2px; transform: rotate(-15deg); }
.tg-ear-r { left: 16px; transform: rotate(15deg); }
.tg-header-actions { display: flex; align-items: center; gap: 8px; }
.icon-pill { background: #171219; border: 1.5px solid #2a2030; color: #b8b3ba; border-radius: 10px; padding: 7px; cursor: pointer; display: flex; }
.icon-pill:hover { border-color: #ff2d78; color: #ff2d78; }
.cat-mascot { display: flex; flex-direction: column; align-items: center; }
.cat-mascot-label { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; color: #8a8490; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1px; }
.tg-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
.stat-card { background: #15111a; border: 1.5px solid #241d29; border-radius: 14px; padding: 12px 6px; text-align: center; }
.stat-card.accent { border-color: #4a1f34; }
.stat-num { font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 19px; color: #f2eef1; display: flex; align-items: center; justify-content: center; gap: 3px; }
.stat-num.warn { color: #ff2d78; }
.stat-den { font-size: 12px; color: #6b6673; font-weight: 500; }
.stat-label { display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 9.5px; color: #6b6673; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.03em; }
.tg-tabs { display: flex; gap: 5px; background: #131015; border: 1.5px solid #221d23; border-radius: 12px; padding: 4px; margin-bottom: 18px; overflow-x: auto; }
.tab { flex: 1; padding: 9px 4px; background: transparent; border: none; border-radius: 9px; color: #8a8490; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap; }
.tab.active { background: #ff2d78; color: #fff; }
.tg-section { display: flex; flex-direction: column; gap: 13px; }
.week-nav { display: flex; align-items: center; gap: 10px; justify-content: center; }
.icon-btn { background: #171219; border: 1.5px solid #241d29; border-radius: 8px; color: #f2eef1; padding: 5px; cursor: pointer; display: flex; }
.week-range { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #b8b3ba; min-width: 130px; text-align: center; }
.today-btn { background: transparent; border: 1.5px solid #ff2d78; color: #ff2d78; border-radius: 20px; font-size: 11px; padding: 4px 10px; cursor: pointer; font-weight: 700; }
.habit-table { background: #100d13; border: 1.5px solid #201a24; border-radius: 16px; overflow: hidden; }
.habit-table-head { display: grid; grid-template-columns: 1fr repeat(7, 32px); gap: 2px; padding: 10px 12px 6px; border-bottom: 1.5px solid #1c1720; }
.day-col-head { text-align: center; }
.day-col-head.is-today .day-num { color: #ff2d78; }
.day-name { font-size: 9px; color: #6b6673; text-transform: uppercase; }
.day-num { font-size: 12px; color: #b8b3ba; font-family: 'JetBrains Mono', monospace; }
.habit-row { display: grid; grid-template-columns: 1fr repeat(7, 32px); gap: 2px; align-items: center; padding: 11px 12px; border-bottom: 1px solid #17131a; }
.habit-row:last-child { border-bottom: none; }
.habit-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.habit-meta { display: flex; align-items: center; gap: 6px; }
.streak-chip { display: flex; align-items: center; gap: 2px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #ff8fb3; background: #2a1520; padding: 2px 6px; border-radius: 10px; }
.week-chip { font-size: 10px; color: #6b6673; font-family: 'JetBrains Mono', monospace; }
.delete-mini { background: none; border: none; color: #46414a; cursor: pointer; padding: 2px; margin-left: auto; display: flex; }
.delete-mini:hover { color: #ff2d78; }
.day-col { display: flex; justify-content: center; }
.paw-btn { width: 29px; height: 29px; border-radius: 50%; border: 1.5px solid #2a2030; background: #171219; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.paw-btn.checked { background: #ff2d78; border-color: #ff2d78; }
.paw-btn.future { opacity: 0.3; cursor: not-allowed; }
.paw-btn.small { width: 24px; height: 24px; min-width: 24px; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 34px 20px; color: #6b6673; text-align: center; }
.empty-state.small { padding: 18px; font-size: 12.5px; }
.empty-state p { font-size: 13px; max-width: 240px; margin: 0; }
.add-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: transparent; border: 1.5px dashed #2e2732; color: #b8b3ba; border-radius: 12px; padding: 12px; font-size: 13px; font-weight: 700; cursor: pointer; }
.add-btn:hover { border-color: #ff2d78; color: #ff2d78; }
.add-form { background: #100d13; border: 1.5px solid #221d23; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.add-form input, .add-form select { background: #171219; border: 1.5px solid #2a2030; border-radius: 8px; padding: 10px 12px; color: #f2eef1; font-family: 'Nunito', sans-serif; font-size: 14px; outline: none; width: 100%; }
.add-form input:focus, .add-form select:focus { border-color: #ff2d78; }
.add-form-row { display: flex; gap: 8px; }
.date-input, .priority-select { flex: 1; }
.primary-btn { background: #ff2d78; border: none; color: #fff; font-weight: 700; font-size: 13px; border-radius: 8px; padding: 10px 18px; cursor: pointer; flex: 1; }
.ghost-btn { background: #171219; border: 1.5px solid #2a2030; color: #b8b3ba; border-radius: 8px; padding: 10px 12px; cursor: pointer; display: flex; align-items: center; }
.task-filters { display: flex; gap: 6px; }
.filter-btn { background: #131015; border: 1.5px solid #221d23; color: #8a8490; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; cursor: pointer; text-transform: capitalize; }
.filter-btn.active { background: #2a1520; border-color: #ff2d78; color: #ff8fb3; }
.task-list { display: flex; flex-direction: column; gap: 8px; }
.task-row { display: flex; align-items: center; gap: 10px; background: #100d13; border: 1.5px solid #1c1720; border-radius: 12px; padding: 12px; }
.task-row.done { opacity: 0.45; }
.task-row.done .task-name { text-decoration: line-through; }
.task-body { flex: 1; min-width: 0; }
.task-name { font-size: 14px; font-weight: 700; }
.task-meta { display: flex; gap: 8px; margin-top: 4px; align-items: center; }
.due-chip { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #6b6673; }
.due-chip.today { color: #ff8fb3; }
.due-chip.overdue { color: #ff2d78; font-weight: 700; }
.priority-chip { font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--pc); border: 1.5px solid var(--pc); padding: 1px 6px; border-radius: 8px; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-dow { text-align: center; font-size: 10px; color: #6b6673; text-transform: uppercase; padding-bottom: 2px; }
.cal-cell { position: relative; aspect-ratio: 1; background: #171219; border: 1.5px solid #241d29; border-radius: 8px; color: #b8b3ba; font-family: 'JetBrains Mono', monospace; font-size: 12px; cursor: pointer; }
.cal-cell.selected { border-color: #ff2d78; background: #2a1520; color: #fff; }
.cal-cell.is-today { border-color: #ff8fb3; }
.cal-dot { position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: #ff2d78; }
.day-panel { background: #100d13; border: 1.5px solid #221d23; border-radius: 14px; padding: 12px; }
.day-panel-head { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px; margin-bottom: 10px; }
.add-photo-btn { margin-left: auto; display: flex; align-items: center; gap: 5px; background: #ff2d78; border: none; color: #fff; font-weight: 700; font-size: 11px; border-radius: 8px; padding: 6px 10px; cursor: pointer; }
.photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
.photo-card { position: relative; background: #171219; border: 1.5px solid #241d29; border-radius: 10px; overflow: hidden; }
.photo-card img { width: 100%; height: 100px; object-fit: cover; display: block; }
.photo-remove { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); border: none; color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.photo-note { width: 100%; background: transparent; border: none; border-top: 1px solid #241d29; color: #f2eef1; font-size: 11px; padding: 6px 8px; outline: none; }
.storage-warn { background: #2a1520; border: 1.5px solid #ff2d78; color: #ffb3cf; font-size: 11.5px; padding: 10px 12px; border-radius: 10px; line-height: 1.5; }
.diet-total { display: flex; align-items: baseline; gap: 8px; background: #15111a; border: 1.5px solid #4a1f34; border-radius: 14px; padding: 16px; }
.diet-total-num { font-family: 'Fredoka', sans-serif; font-size: 28px; font-weight: 700; color: #fff; }
.diet-total-label { font-size: 12px; color: #8a8490; }
.diet-disclaimer { font-size: 11px; color: #6b6673; line-height: 1.5; margin: -4px 0 0; }
.hour-list { display: flex; flex-direction: column; gap: 10px; }
.hour-card { background: #100d13; border: 1.5px solid #221d23; border-radius: 14px; overflow: hidden; }
.hour-card.reviewed { border-color: #4a1f34; }
.hour-card-head { display: flex; align-items: center; gap: 8px; padding: 12px 12px; cursor: pointer; }
.hour-card-title { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.hour-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #ff8fb3; }
.hour-title-text { font-size: 14px; font-weight: 700; color: #f2eef1; }
.hour-done-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #ff8fb3; background: #2a1520; padding: 3px 8px; border-radius: 10px; white-space: nowrap; }
.hour-card-body { padding: 0 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.hour-field-label { font-size: 10.5px; color: #8a8490; text-transform: uppercase; letter-spacing: 0.03em; font-weight: 700; margin-top: 4px; }
.hour-input { background: #171219; border: 1.5px solid #2a2030; border-radius: 8px; padding: 10px 12px; color: #f2eef1; font-family: 'Nunito', sans-serif; font-size: 13.5px; outline: none; width: 100%; }
.hour-input:focus { border-color: #ff2d78; }
.hour-textarea { background: #171219; border: 1.5px solid #2a2030; border-radius: 8px; padding: 10px 12px; color: #f2eef1; font-family: 'Nunito', sans-serif; font-size: 13.5px; outline: none; width: 100%; resize: vertical; }
.hour-textarea:focus { border-color: #ff2d78; }
.hour-items { display: flex; flex-direction: column; gap: 6px; }
.hour-item-row { display: flex; align-items: center; gap: 8px; background: #171219; border: 1px solid #221d23; border-radius: 8px; padding: 8px 10px; font-size: 12.5px; }
.hour-item-label { color: #ff8fb3; font-weight: 700; white-space: nowrap; }
.hour-item-value { color: #c4bfc7; flex: 1; min-width: 0; overflow-wrap: anywhere; }
.add-btn.small-add { padding: 8px; font-size: 12px; }
.mark-reviewed-btn { display: flex; align-items: center; justify-content: center; gap: 6px; background: #171219; border: 1.5px solid #2a2030; color: #b8b3ba; border-radius: 10px; padding: 10px; font-weight: 700; font-size: 13px; cursor: pointer; margin-top: 4px; }
.mark-reviewed-btn.active { background: #ff2d78; border-color: #ff2d78; color: #fff; }
.tg-footer { display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 28px; font-size: 10px; color: #46414a; font-family: 'JetBrains Mono', monospace; }
@media (min-width: 860px) {
  .tg-root { max-width: 720px; padding: 30px 40px 48px; }
  .tg-brand { font-size: 32px; }
  .habit-row:hover, .task-row:hover { background: #15111a; }
  .delete-mini { opacity: 0; }
  .habit-meta:hover .delete-mini, .task-row:hover .delete-mini { opacity: 1; }
}
@supports (padding: max(0px)) {
  .tg-root { padding-left: max(16px, env(safe-area-inset-left)); padding-right: max(16px, env(safe-area-inset-right)); padding-bottom: max(40px, env(safe-area-inset-bottom)); }
}
`;
