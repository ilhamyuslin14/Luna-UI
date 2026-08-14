import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../../css/mobile/shared/score-detail-sheet.css';

const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>);
const IconRefresh = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>);
const IconReject = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><line x1="8" y1="8" x2="16" y2="16" /></svg>);

// Tombol ikon-saja untuk footer — keterangannya (mis. "Nilai Ulang") cuma
// muncul saat ditekan-tahan, karena hover-tooltip desktop tidak ada
// padanannya di layar sentuh.
function IconHoldButton({ className, icon, label, onClick, disabled }) {
  const [showTip, setShowTip] = useState(false);
  const timerRef = useRef(null);
  const start = () => { timerRef.current = setTimeout(() => setShowTip(true), 380); };
  const end = () => { clearTimeout(timerRef.current); setShowTip(false); };
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      onTouchStart={start}
      onTouchEnd={end}
      onTouchCancel={end}
      onMouseDown={start}
      onMouseUp={end}
      onMouseLeave={end}
    >
      {icon}
      {showTip && <span className="mss-holdtip">{label}</span>}
    </button>
  );
}

// Sheet detail penilaian AI — dipakai bareng oleh Kandidat Detail (tab
// Ringkasan) dan Lowongan Detail (tab Kandidat), makanya digenericin di sini.
// `item` & keterbukaan sheet (`open`) dipegang parent (masing-masing lewat
// mekanisme history overlay-nya sendiri, karena setiap laman punya
// navigate()-nya sendiri) — komponen ini murni presentasional + state kecil
// utk sheet "ganti status rekrutmen" yang nested di atasnya.
export default function MobileScoreDetailSheet({
  open, item, alurList, isFreePlan,
  onClose, onRescore, onReject, onChangeAlur, onUpgrade,
}) {
  const [alurSheetOpen, setAlurSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const sheetRef = useRef(null);

  // Sheet ini tetap di DOM terus (cuma class "open" yang di-toggle), jadi
  // scrollTop dari kandidat/skor sebelumnya kebawa terus kalau tidak
  // di-reset tiap kali dibuka untuk item baru — total skor di bagian
  // paling atas harus selalu langsung kelihatan begitu dibuka.
  useEffect(() => {
    if (open && sheetRef.current) sheetRef.current.scrollTop = 0;
  }, [open, item?.scoringId]);

  // "Belum dinilai" & "Nilai Ulang" sama-sama beroperasi di atas scoring row
  // yang SUDAH ADA (skor-nya saja yang masih null, mis. lewat jalur
  // skip-scoring paket Free) — jadi keduanya reuse handler yang sama
  // (runRescore lewat onRescore), bukan alur "tambah ke posisi baru".
  const handleRescore = async () => {
    setBusy(true);
    try { await onRescore(); } finally { setBusy(false); }
  };
  const handleChangeAlur = (level) => {
    onChangeAlur(level);
    setAlurSheetOpen(false);
  };

  const shownWajib = item ? item.criteriaData : [];
  const shownNilai = item ? item.prefData : [];
  const allKriteria = [...shownWajib, ...shownNilai];
  const countByLevel = (lvl) => allKriteria.filter(c => c.level === lvl).length;
  const fitColor = item?.fit === 'high' ? 'var(--fit-high, #089F32)' : item?.fit === 'moderate' ? 'var(--fit-moderate, #FD800C)' : 'var(--fit-low, #FB484B)';

  return createPortal(
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-sheet mss-sheet${open ? ' open' : ''}`} ref={sheetRef}>
        <div className="msh-sheet-handle" />
        {busy && (
          <div className="mss-rescore-bar"><span /></div>
        )}
        {item && (
          item.belumDinilai ? (
            <div className="mss-locked">
              <div className="mss-posisi-title" style={{ justifyContent: 'center' }}>{item.posisi}</div>
              {isFreePlan ? (
                <>
                  <p>Paket Free tidak termasuk skoring AI otomatis. Kandidat tetap tersimpan di posisi ini — upgrade paket untuk melihat skor kecocokannya.</p>
                  <button className="mss-rescore-full" onClick={onUpgrade}>Upgrade Paket</button>
                </>
              ) : (
                <>
                  <p>Kandidat sudah tersimpan di posisi ini, tapi penilaian AI belum dijalankan.</p>
                  <button className="mss-rescore-full" disabled={busy} onClick={handleRescore}>
                    <span className={busy ? 'mss-spin' : undefined}><IconRefresh /></span>
                    {busy ? 'Menilai...' : 'Mulai Penilaian AI'}
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="mss-sheet-label first">Penilaian untuk posisi</div>
              <div className="mss-posisi-title">{item.posisi}{item.departemen && <span className="mss-dept">{item.departemen}</span>}</div>

              <div className="mss-gauge-row">
                <div className="mss-gauge-wrap">
                  <svg width="92" height="92" viewBox="0 0 92 92">
                    <circle cx="46" cy="46" r="38" fill="none" stroke="var(--luna-ink-100)" strokeWidth="9" />
                    <circle
                      cx="46" cy="46" r="38" fill="none" stroke={fitColor} strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={`${(item.score / 100) * 238.76} 238.76`} transform="rotate(-90 46 46)"
                    />
                  </svg>
                  <div className="mss-gauge-center">
                    <span className="mss-gauge-label">TOTAL SKOR</span>
                    <span className="mss-gauge-score" style={{ color: fitColor }}>{item.score}</span>
                  </div>
                </div>
                <div className="mss-dist-col">
                  <span className="mss-dist-chip high"><span className="mss-dist-dot" />Tinggi: {countByLevel('high')}/{allKriteria.length}</span>
                  <span className="mss-dist-chip moderate"><span className="mss-dist-dot" />Sedang: {countByLevel('moderate')}/{allKriteria.length}</span>
                  <span className="mss-dist-chip low"><span className="mss-dist-dot" />Rendah: {countByLevel('low')}/{allKriteria.length}</span>
                </div>
              </div>

              <div className="mss-sheet-label">Rangkuman AI</div>
              <div className="mss-summary">{item.aiSummary || 'Belum ada rangkuman dari AI.'}</div>

              {allKriteria.length === 0 ? (
                <>
                  <div className="mss-sheet-label">Rincian Kriteria</div>
                  <div className="mss-empty">Tidak ada rincian kriteria.</div>
                </>
              ) : (
                <>
                  {shownWajib.length > 0 && (
                    <>
                      <div className="mss-sheet-label">Kualifikasi Wajib</div>
                      {shownWajib.map((k, i) => (
                        <div className="mss-krit-item" key={`w-${i}`}>
                          <span className={`mss-krit-dot ${k.level}`} />
                          <div><div className="mss-krit-text">{k.name}</div><div className="mss-krit-desc">{k.desc}</div></div>
                        </div>
                      ))}
                    </>
                  )}
                  {shownNilai.length > 0 && (
                    <>
                      <div className="mss-sheet-label">Nilai Tambah</div>
                      {shownNilai.map((k, i) => (
                        <div className="mss-krit-item" key={`p-${i}`}>
                          <span className={`mss-krit-dot ${k.level}`} />
                          <div><div className="mss-krit-text">{k.name}</div><div className="mss-krit-desc">{k.desc}</div></div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}

              <div className="mss-footer">
                <button className="mss-alur-btn" disabled={item.alur === 0 || busy} onClick={() => setAlurSheetOpen(true)}>
                  <span>{item.alur === 0 ? 'Tidak Sesuai' : (alurList.find(a => a.level === item.alur)?.nama ?? '-')}</span>
                  <IconChevronDown />
                </button>
                {isFreePlan ? (
                  <IconHoldButton className="mss-icon-btn rescore" icon={<IconRefresh />} label="Upgrade untuk Nilai Ulang" disabled={item.alur === 0} onClick={onUpgrade} />
                ) : (
                  <IconHoldButton
                    className="mss-icon-btn rescore"
                    icon={<span className={busy ? 'mss-spin' : undefined}><IconRefresh /></span>}
                    label="Nilai Ulang"
                    disabled={busy || item.alur === 0}
                    onClick={handleRescore}
                  />
                )}
                <IconHoldButton className="mss-icon-btn reject" icon={<IconReject />} label="Tandai Tidak Sesuai" disabled={item.alur === 0 || busy} onClick={onReject} />
              </div>
            </>
          )
        )}
      </div>

      {/* ── nested: ganti status rekrutmen ── */}
      <div className={`msh-sheet-overlay mss-alur-overlay${alurSheetOpen ? ' open' : ''}`} onClick={() => setAlurSheetOpen(false)} />
      <div className={`msh-sheet mss-alur-sheet${alurSheetOpen ? ' open' : ''}`}>
        <div className="msh-sheet-handle" />
        <div className="mss-sheet-title">Ubah Status Rekrutmen</div>
        <div className="mss-alur-list">
          {alurList.filter(opt => opt.level !== 0).map(opt => (
            <button key={opt.level} className="mss-select-opt" onClick={() => handleChangeAlur(opt.level)}>
              <span className="mss-select-opt-label">{opt.nama}</span>
              {item?.alur === opt.level && <span className="mss-select-opt-check"><IconCheck /></span>}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
