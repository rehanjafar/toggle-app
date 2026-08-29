import { useState } from "react";
import { Clock, Check, Plus, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { todayISO, addDays, fmtDate } from "../lib/dates.js";

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

export default function HonestHourSection({ hours, setHours }) {
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
