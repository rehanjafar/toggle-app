import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Flame, HelpCircle, LogOut, Plus, Trash2, X } from "lucide-react";
import { todayISO, addDays, startOfWeek, fmtDay, fmtDate } from "../lib/dates.js";
import { loadProfileData, saveProfileData, tutorialSeenKey } from "../lib/storage.js";
import Paw from "./Paw.jsx";
import CatMascot from "./CatMascot.jsx";
import Tutorial from "./Tutorial.jsx";
import PhotoJournal from "./PhotoJournal.jsx";
import DietSection from "./DietSection.jsx";
import HonestHourSection from "./HonestHour.jsx";
import useIsWide from "../hooks/useIsWide.js";

const PRIORITY = {
  high: { label: "High", color: "#ff2d78" },
  medium: { label: "Medium", color: "#ff8fb3" },
  low: { label: "Low", color: "#7a7480" },
};

export default function TrackerApp({ profile, onSwitchProfile }) {
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
