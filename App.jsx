import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set, remove, update } from "firebase/database";
import { db, ensureSignedIn } from "./firebase";
import { CATEGORIES, gradientFor } from "./habitLibrary";

const DAY_LABELS = ["PAZ", "PZT", "SAL", "ÇAR", "PER", "CUM", "CMT"];
const PERIODS = [
  { id: "tumu", label: "Tümü" },
  { id: "sabah", label: "☀️ Sabah" },
  { id: "ogle", label: "🌤️ Öğleden Sonra" },
  { id: "aksam", label: "🌙 Akşam" },
];
const TYPES = [
  { id: "duzenli", label: "Düzenli", icon: "🔁", desc: "Günlük rutininizle ilgilidir. Düzenli ve tekrar eden şekilde kontrol edin. Örn. haftada üç kez yoga yapın." },
  { id: "olumsuz", label: "Olumsuz", icon: "🚫", desc: "Bırakmak istediğin bir alışkanlık. O gün yapmadıysan işaretle." },
  { id: "tekseferlik", label: "Tek Seferlik", icon: "✅", desc: "Bir kere yapılıp bitecek bir görev. Tamamlanınca listeden kalkar." },
];

function toDateStr(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function startOfWeek(d) {
  const day = d.getDay();
  const s = new Date(d);
  s.setDate(d.getDate() - day);
  return s;
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function levelFromXP(xp) {
  let level = 1, need = 50, remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level++;
    need = Math.round(need * 1.25);
  }
  return { level, into: remaining, need };
}

export default function App() {
  const [uid, setUid] = useState(null);
  const [habits, setHabits] = useState({});
  const [completions, setCompletions] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [periodFilter, setPeriodFilter] = useState("tumu");
  const [tab, setTab] = useState("bugun");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState("type"); // type -> library | custom
  const [pickedType, setPickedType] = useState("duzenli");
  const [customEmoji, setCustomEmoji] = useState("✨");
  const [customName, setCustomName] = useState("");
  const [customPeriod, setCustomPeriod] = useState("tumu");

  useEffect(() => {
    ensureSignedIn((id) => setUid(id));
  }, []);

  useEffect(() => {
    if (!uid) return;
    const habitsRef = ref(db, `users/${uid}/habits`);
    const compRef = ref(db, `users/${uid}/completions`);
    const unsub1 = onValue(habitsRef, (snap) => setHabits(snap.val() || {}));
    const unsub2 = onValue(compRef, (snap) => setCompletions(snap.val() || {}));
    return () => {
      unsub1();
      unsub2();
    };
  }, [uid]);

  const dateStr = toDateStr(selectedDate);
  const weekDays = useMemo(() => {
    const start = startOfWeek(weekAnchor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [weekAnchor]);

  const habitList = useMemo(() => {
    return Object.entries(habits)
      .map(([id, h], idx) => ({ id, ...h, colorIdx: h.colorIdx ?? idx }))
      .filter((h) => periodFilter === "tumu" || h.period === periodFilter || h.period === "tumu")
      .filter((h) => {
        // tek seferlik habits: once completed (any date), hide from future days
        if (h.type === "tekseferlik") {
          const done = completions[h.id] && Object.keys(completions[h.id]).length > 0;
          if (done && !(completions[h.id] && completions[h.id][dateStr])) return false;
        }
        return true;
      })
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }, [habits, periodFilter, completions, dateStr]);

  // ---------- Actions ----------
  function addHabitFromLibrary(emoji, name) {
    if (!uid) return;
    const habitsRef = ref(db, `users/${uid}/habits`);
    const newRef = push(habitsRef);
    set(newRef, {
      emoji, name, type: "duzenli", period: "tumu",
      colorIdx: Object.keys(habits).length, createdAt: Date.now(),
    });
    setSheetOpen(false);
    setSheetStep("type");
  }

  function addCustomHabit() {
    if (!uid || !customName.trim()) return;
    const habitsRef = ref(db, `users/${uid}/habits`);
    const newRef = push(habitsRef);
    set(newRef, {
      emoji: customEmoji || "✨", name: customName.trim(), type: pickedType,
      period: customPeriod, colorIdx: Object.keys(habits).length, createdAt: Date.now(),
    });
    setCustomName("");
    setCustomEmoji("✨");
    setSheetOpen(false);
    setSheetStep("type");
  }

  function toggleCompletion(habitId) {
    if (!uid) return;
    const isDone = completions[habitId] && completions[habitId][dateStr];
    const compRef = ref(db, `users/${uid}/completions/${habitId}/${dateStr}`);
    if (isDone) set(compRef, null);
    else set(compRef, true);
  }

  function deleteHabit(habitId) {
    if (!uid) return;
    if (!confirm("Bu alışkanlığı silmek istediğine emin misin?")) return;
    remove(ref(db, `users/${uid}/habits/${habitId}`));
    remove(ref(db, `users/${uid}/completions/${habitId}`));
  }

  // ---------- Derived stats ----------
  const totalXP = useMemo(() => {
    let xp = 0;
    Object.values(completions).forEach((byDate) => {
      xp += Object.keys(byDate || {}).length * 10;
    });
    return xp;
  }, [completions]);
  const { level, into, need } = levelFromXP(totalXP);

  function streakFor(habitId) {
    const byDate = completions[habitId] || {};
    let streak = 0;
    let cursor = new Date();
    while (byDate[toDateStr(cursor)]) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  return (
    <div className="app">
      {tab === "bugun" && (
        <div className="screen">
          <div className="header-row">
            <div>
              <h1>BUGÜN</h1>
              <p className="sub">{selectedDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</p>
            </div>
            <button className="fab" onClick={() => setSheetOpen(true)} aria-label="Ekle">+</button>
          </div>

          <div className="week-strip">
            <button className="week-nav" onClick={() => setWeekAnchor(addDays(weekAnchor, -7))}>‹</button>
            <div className="week-days">
              {weekDays.map((d) => {
                const active = toDateStr(d) === dateStr;
                return (
                  <button key={d.toISOString()} className={`day-pill ${active ? "active" : ""}`} onClick={() => setSelectedDate(d)}>
                    <span className="dow">{DAY_LABELS[d.getDay()]}</span>
                    <span className="dom">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <button className="week-nav" onClick={() => setWeekAnchor(addDays(weekAnchor, 7))}>›</button>
          </div>

          <div className="period-tabs">
            {PERIODS.map((p) => (
              <button key={p.id} className={`period-tab ${periodFilter === p.id ? "active" : ""}`} onClick={() => setPeriodFilter(p.id)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="habit-cards">
            {habitList.length === 0 && (
              <div className="empty-note">Bu gün için henüz alışkanlık yok. Sağ üstteki + ile ekleyebilirsin.</div>
            )}
            {habitList.map((h) => {
              const [c1, c2] = gradientFor(h.colorIdx);
              const done = !!(completions[h.id] && completions[h.id][dateStr]);
              const streak = streakFor(h.id);
              return (
                <div key={h.id} className="habit-card" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  <button className={`check ${done ? "done" : ""}`} onClick={() => toggleCompletion(h.id)} aria-label="Tamamlandı">
                    {done ? "✓" : ""}
                  </button>
                  <span className="h-emoji">{h.emoji}</span>
                  <div className="h-info">
                    <span className="h-name">{h.name}</span>
                    {streak > 0 && <span className="h-streak">🔥 {streak} gün</span>}
                  </div>
                  <button className="h-menu" onClick={() => deleteHabit(h.id)} aria-label="Sil">✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "yolculuk" && (
        <div className="screen">
          <h1>YOLCULUK</h1>
          <div className="stat-card">
            <div className="stat-big">{level}</div>
            <div className="stat-lbl">Seviye · {into}/{need} XP</div>
            <div className="xp-track"><div className="xp-fill" style={{ width: `${Math.min(100, (into / need) * 100)}%` }} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-big">{Object.values(completions).reduce((s, b) => s + Object.keys(b || {}).length, 0)}</div>
            <div className="stat-lbl">Toplam tamamlama</div>
          </div>
          <div className="stat-card">
            <div className="stat-big">{Object.keys(habits).length}</div>
            <div className="stat-lbl">Takip edilen alışkanlık</div>
          </div>
        </div>
      )}

      {tab === "gecmis" && (
        <div className="screen">
          <h1>GEÇMİŞ</h1>
          {Object.entries(habits).length === 0 && <div className="empty-note">Henüz geçmiş yok.</div>}
          {Object.entries(habits).map(([id, h]) => {
            const byDate = completions[id] || {};
            const days = Object.keys(byDate).sort().reverse().slice(0, 10);
            return (
              <div key={id} className="history-block">
                <div className="history-title">{h.emoji} {h.name}</div>
                <div className="history-dates">
                  {days.length === 0 ? <span className="sub">Henüz tamamlanmadı</span> : days.map((d) => <span key={d} className="history-chip">{d}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "ben" && (
        <div className="screen">
          <h1>BEN</h1>
          <div className="stat-card">
            <div className="stat-lbl">Cihaz kimliğin (anonim)</div>
            <div className="uid-box">{uid || "bağlanıyor..."}</div>
            <p className="sub">Verilerin bu kimliğe bağlı olarak Firebase'de saklanır ve tarayıcı silinse bile bu cihazda kalıcıdır.</p>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <button className={tab === "bugun" ? "active" : ""} onClick={() => setTab("bugun")}>📅<span>BUGÜN</span></button>
        <button className={tab === "yolculuk" ? "active" : ""} onClick={() => setTab("yolculuk")}>📈<span>YOLCULUK</span></button>
        <button className={tab === "gecmis" ? "active" : ""} onClick={() => setTab("gecmis")}>🗂️<span>GEÇMİŞ</span></button>
        <button className={tab === "ben" ? "active" : ""} onClick={() => setTab("ben")}>👤<span>BEN</span></button>
      </nav>

      {sheetOpen && (
        <div className="sheet-backdrop" onClick={() => { setSheetOpen(false); setSheetStep("type"); }}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            {sheetStep === "type" && (
              <>
                <h2>Yeni bir alışkanlık oluştur</h2>
                <div className="type-row">
                  {TYPES.map((t) => (
                    <button key={t.id} className={`type-btn ${pickedType === t.id ? "active" : ""}`} onClick={() => setPickedType(t.id)}>
                      <span className="type-icon">{t.icon}</span>
                      <span>{t.label.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
                <div className="type-desc">
                  <strong>{TYPES.find((t) => t.id === pickedType).label.toUpperCase()}</strong>
                  <p>{TYPES.find((t) => t.id === pickedType).desc}</p>
                </div>
                <button className="primary-btn" onClick={() => setSheetStep("custom")}>+ KENDİNİZİNKİNİ OLUŞTURUN</button>
                <p className="sub" style={{ textAlign: "center", margin: "14px 0 6px" }}>YA DA ÖN AYARLARDAN SEÇİN</p>
                <div className="preset-list">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.id} className="preset-row" onClick={() => setSheetStep("cat:" + cat.id)}>
                      <span>{cat.title}</span>
                      <span>›</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {sheetStep === "custom" && (
              <>
                <h2>Kendi alışkanlığını oluştur</h2>
                <label className="field-label">Emoji</label>
                <input className="text-input" value={customEmoji} onChange={(e) => setCustomEmoji(e.target.value)} maxLength={4} />
                <label className="field-label">Ad</label>
                <input className="text-input" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Örn. Piyano çalış" />
                <label className="field-label">Zaman dilimi</label>
                <div className="type-row">
                  {PERIODS.map((p) => (
                    <button key={p.id} className={`type-btn small ${customPeriod === p.id ? "active" : ""}`} onClick={() => setCustomPeriod(p.id)}>{p.label}</button>
                  ))}
                </div>
                <button className="primary-btn" onClick={addCustomHabit} disabled={!customName.trim()}>OLUŞTUR</button>
                <button className="link-btn" onClick={() => setSheetStep("type")}>‹ Geri</button>
              </>
            )}

            {sheetStep.startsWith("cat:") && (() => {
              const cat = CATEGORIES.find((c) => "cat:" + c.id === sheetStep);
              return (
                <>
                  <h2>{cat.title}</h2>
                  <div className="preset-list">
                    {cat.habits.map(([emoji, name]) => (
                      <button key={name} className="preset-row" onClick={() => addHabitFromLibrary(emoji, name)}>
                        <span>{emoji} {name}</span>
                        <span>+</span>
                      </button>
                    ))}
                  </div>
                  <button className="link-btn" onClick={() => setSheetStep("type")}>‹ Geri</button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
