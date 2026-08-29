import { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Camera, ImagePlus, X } from "lucide-react";
import { todayISO, addDays, startOfWeek, monthGrid, monthLabel, fmtDate } from "../lib/dates.js";
import { estimateStorageUsedMB } from "../lib/storage.js";

export default function PhotoJournal({ photos, setPhotos }) {
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

