import { useState, useRef, useEffect } from 'react';
import PopupKonfirmasi from './PopupKonfirmasi.jsx';

const EditIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
    <path d="M1 3.5h12M4.5 3.5V2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1.5M5.5 7v5M8.5 7v5M2 3.5l.7 9.8a1 1 0 0 0 1 .9h6.6a1 1 0 0 0 1-.9L12 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDown = () => (
  <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, pointerEvents: 'none' }}>
    <path d="M1 1L5 5L9 1" />
  </svg>
);

const BOBOT_OPTS = [
  { val: 'tinggi', label: 'Tinggi' },
  { val: 'sedang', label: 'Sedang' },
  { val: 'rendah', label: 'Rendah' },
];

const BOBOT_LABEL = { tinggi: 'Tinggi', sedang: 'Sedang', rendah: 'Rendah' };

const BobotSelect = ({ value, onChange }) => (
  <div className={`sd001-bobot-select-wrap ${value}`}>
    <select
      className="sd001-bobot-select"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {BOBOT_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
    </select>
    <ChevronDown />
  </div>
);

/**
 * Komponen Kriteria Penilaian — versi compact (Opsi B).
 * Sama fungsinya persis dengan KriteriaPenilaian_001 (edit inline per-item,
 * tambah, hapus, generate ulang) — bedanya cuma tampilan mode-baca:
 * AI badge jadi satu baris teks, judul section jadi label+dot, dan badge
 * bobot pill diganti dot warna + teks kecil.
 *
 * Props:
 *   kriteria  — array of { id, kategori, teks, bobot }
 *   onChange  — (newKriteria: array) => void
 */
export default function KriteriaPenilaian_002({ kriteria, onChange, isGenerating = false, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineDraft, setInlineDraft] = useState(null);
  const [newItemDraft, setNewItemDraft] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);

  const startEdit = () => { setDraft(kriteria); setIsEditing(true); };
  const cancel = () => setIsEditing(false);
  const save = () => { onChange(draft); setIsEditing(false); };

  const addItem = () =>
    setDraft(prev => [
      { id: prev.length ? Math.max(...prev.map(k => k.id)) + 1 : 1, kategori: 'Wajib', teks: '', bobot: 'sedang', point: 100 },
      ...prev,
    ]);

  const deleteItem = (id) => setDraft(prev => prev.filter(k => k.id !== id));
  const updateItem = (id, field, val) =>
    setDraft(prev => prev.map(k => {
      if (k.id !== id) return k;
      const updated = { ...k, [field]: val };
      if (field === 'bobot') {
        if (val === 'tinggi') updated.point = 150;
        else if (val === 'sedang') updated.point = 100;
        else if (val === 'rendah') updated.point = 50;
      }
      return updated;
    }));

  const inlineEditRef = useRef(null);
  const pendingDeleteIdRef = useRef(null);

  useEffect(() => {
    if (!inlineEditId) return;
    const handleClickOutside = (e) => {
      // Jangan tutup kalau popup konfirmasi delete sedang terbuka
      if (pendingDeleteIdRef.current) return;
      if (inlineEditRef.current && !inlineEditRef.current.contains(e.target)) {
        setInlineEditId(null);
        setInlineDraft(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inlineEditId]);

  const startInlineEdit = (item) => {
    setInlineDraft({ ...item });
    setInlineEditId(item.id);
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineDraft(null);
  };

  const deleteInlineItem = (e) => {
    if (e) e.stopPropagation();
    pendingDeleteIdRef.current = inlineEditId; // simpan dulu sebelum click-outside bisa me-reset state
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const idToDelete = pendingDeleteIdRef.current; // ambil dari ref, bukan dari state
    const updatedKriteria = kriteria.filter(k => k.id !== idToDelete);
    onChange(updatedKriteria);
    pendingDeleteIdRef.current = null;
    setShowDeleteConfirm(false);
    setInlineEditId(null);
    setInlineDraft(null);
  };

  const saveInlineEdit = (e) => {
    if (e) e.stopPropagation();
    const updatedKriteria = kriteria.map(k => k.id === inlineEditId ? inlineDraft : k);
    onChange(updatedKriteria);
    setInlineEditId(null);
    setInlineDraft(null);
  };

  const updateInlineDraft = (field, val) => {
    setInlineDraft(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'bobot') {
        if (val === 'tinggi') updated.point = 150;
        else if (val === 'sedang') updated.point = 100;
        else if (val === 'rendah') updated.point = 50;
      }
      return updated;
    });
  };

  const startAddNew = () => {
    setInlineEditId(null); // tutup inline edit yang mungkin sedang terbuka
    setNewItemDraft({ kategori: 'Wajib', teks: '', bobot: 'sedang', point: 100 });
  };

  const cancelAddNew = (e) => {
    if (e) e.stopPropagation();
    setNewItemDraft(null);
  };

  const saveAddNew = (e) => {
    if (e) e.stopPropagation();
    if (!newItemDraft.teks.trim()) return; // jangan simpan kalau kosong
    const newId = kriteria.length ? Math.max(...kriteria.map(k => k.id)) + 1 : 1;
    onChange([...kriteria, { ...newItemDraft, id: newId }]);
    setNewItemDraft(null);
  };

  const updateNewItemDraft = (field, val) => {
    setNewItemDraft(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'bobot') {
        if (val === 'tinggi') updated.point = 150;
        else if (val === 'sedang') updated.point = 100;
        else if (val === 'rendah') updated.point = 50;
      }
      return updated;
    });
  };

  return (
    <div className="sd001-card">
      <div className="sd001-card-header">
        <span className="sd001-card-title">Kriteria Penilaian</span>
        {!isEditing && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onRefresh && (
              <button className="sd001-edit-btn" onClick={() => setShowRefreshConfirm(true)} title="Generate Ulang Kriteria" style={{ padding: '6px 8px' }}>
                <RefreshIcon />
              </button>
            )}
            <button className="sd001-edit-btn" onClick={startEdit}>
              <EditIcon /> Edit
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="sd001-kriteria-content">
          <div className="sd002-ai-line">
            <svg width="11" height="11" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6.5 0L7.64 4.86L13 6.5L7.64 8.14L6.5 13L5.36 8.14L0 6.5L5.36 4.86L6.5 0Z" fill="var(--luna-orange-400)" />
            </svg>
            <span><b>Kriteria Berbasis AI</b> — sesuaikan kriteria jika diperlukan.</span>
          </div>
          <button className="sd001-kriteria-add-new-btn" onClick={addItem}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Tambah Kriteria
          </button>
          <div className="sd001-kriteria-sections" style={{ marginTop: '16px' }}>
            {['Wajib', 'Nilai Tambah'].map(kat => {
              const items = draft.filter(k => k.kategori === kat);
              if (!items.length) return null;
              return (
                <div className="sd001-kriteria-section" key={kat}>
                  <div className="sd001-kriteria-header">
                    <h3 className={`sd001-kriteria-section-title ${kat === 'Wajib' ? 'primary' : 'neutral'}`}>{kat}</h3>
                  </div>
                  <div className="sd001-kriteria-edit-list">
                    {items.map(k => (
                      <div className="sd001-kriteria-edit-item" key={k.id}>
                        <div className="sd001-kriteria-edit-main">
                          <div className="sd001-kriteria-edit-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="sd001-kriteria-edit-label">Tag :</span>
                              <input
                                className="sd001-kriteria-text-input"
                                style={{ width: '160px', flex: 'none', height: '24px', fontSize: '10px', padding: '0 8px' }}
                                value={k.tag || ''}
                                onChange={e => updateItem(k.id, 'tag', e.target.value)}
                                placeholder="Misal: Komunikasi"
                              />
                            </div>
                            <div className="sd001-kriteria-edit-label-group">
                              <span className="sd001-kriteria-edit-label">Bobot Penilaian</span>
                              <BobotSelect value={k.bobot} onChange={val => updateItem(k.id, 'bobot', val)} />
                            </div>
                          </div>
                          <div className="sd001-kriteria-edit-fields">
                            <div className={`sd001-kriteria-kategori-wrap ${k.kategori === 'Wajib' ? 'wajib' : 'tambahan'}`}>
                              <select
                                className="sd001-kriteria-kategori-select"
                                value={k.kategori}
                                onChange={e => updateItem(k.id, 'kategori', e.target.value)}
                              >
                                <option value="Wajib">Wajib</option>
                                <option value="Nilai Tambah">Nilai Tambah</option>
                              </select>
                              <ChevronDown />
                            </div>
                            <input
                              className="sd001-kriteria-text-input"
                              value={k.teks}
                              onChange={e => updateItem(k.id, 'teks', e.target.value)}
                              placeholder="Masukkan kriteria..."
                            />
                          </div>
                        </div>
                        <button className="sd001-kriteria-delete-btn" onClick={() => deleteItem(k.id)}>
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sd001-kriteria-edit-footer">
            <div className="sd001-kriteria-footer-right" style={{ marginLeft: 'auto' }}>
              <button className="sd001-kriteria-cancel-btn" onClick={cancel}>Batal</button>
              <button className="sd001-edit-save-btn" onClick={save}>Simpan</button>
            </div>
          </div>
        </div>
      ) : isGenerating ? (
        <div className="sd001-kriteria-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', gap: '1rem', textAlign: 'center' }}>
          <svg style={{ animation: 'sd001-spin 0.8s linear infinite', width: 28, height: 28, color: 'var(--luna-orange-400)' }} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
            <path fill="currentColor" opacity="0.8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#171e2c', margin: 0 }}>Sedang Membuat Kriteria Penilaian</p>
            <p style={{ fontSize: '0.8rem', color: '#7e8799', margin: '4px 0 0 0' }}>AI sedang menganalisis Job Description...</p>
          </div>
        </div>
      ) : kriteria.length === 0 ? (
        <div className="sd001-kriteria-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#f9fafc', borderRadius: '12px', border: '1px dashed #cbd0db', margin: '1rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px', color: '#abb2c1' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p style={{ fontWeight: 600, fontSize: '1rem', color: '#171e2c', margin: '0 0 8px 0' }}>Belum Ada Kriteria Penilaian</p>
          <p style={{ fontSize: '0.85rem', color: '#555f71', margin: '0 0 20px 0', maxWidth: '380px', lineHeight: 1.6 }}>
            Kriteria penilaian ini wajib diisi karena akan digunakan sebagai panduan utama oleh AI dalam menilai dan menyaring kandidat secara otomatis.
          </p>
          <button
            className="sd001-edit-save-btn"
            onClick={startEdit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Tambah Kriteria
          </button>
        </div>
      ) : (
        <div className="sd002-kriteria-content">
          <div className="sd002-ai-line">
            <svg width="11" height="11" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6.5 0L7.64 4.86L13 6.5L7.64 8.14L6.5 13L5.36 8.14L0 6.5L5.36 4.86L6.5 0Z" fill="var(--luna-orange-400)" />
            </svg>
            <span><b>Kriteria Berbasis AI</b> — hasil analisis Job Description, klik kriteria untuk sesuaikan.</span>
          </div>

          {/* CTA Tambah Kriteria */}
          <button
            className="sd001-kriteria-add-new-btn"
            onClick={startAddNew}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Tambah Kriteria
          </button>

          {/* Form Kriteria Baru — muncul di atas list Wajib */}
          {newItemDraft && (
            <div className="sd001-kriteria-edit-item sd001-kriteria-new-item">
              <div className="sd001-kriteria-edit-main">
                <div className="sd001-kriteria-edit-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="sd001-kriteria-edit-label">Tag :</span>
                    <input
                      className="sd001-kriteria-text-input"
                      style={{ width: '160px', flex: 'none', height: '24px', fontSize: '10px', padding: '0 8px' }}
                      value={newItemDraft.tag || ''}
                      onChange={e => updateNewItemDraft('tag', e.target.value)}
                      placeholder="Misal: Komunikasi"
                      autoFocus
                    />
                  </div>
                  <div className="sd001-kriteria-edit-label-group">
                    <span className="sd001-kriteria-edit-label">Bobot Penilaian</span>
                    <BobotSelect value={newItemDraft.bobot} onChange={val => updateNewItemDraft('bobot', val)} />
                  </div>
                </div>
                <div className="sd001-kriteria-edit-fields">
                  <div className={`sd001-kriteria-kategori-wrap ${newItemDraft.kategori === 'Wajib' ? 'wajib' : 'tambahan'}`}>
                    <select
                      className="sd001-kriteria-kategori-select"
                      value={newItemDraft.kategori}
                      onChange={e => updateNewItemDraft('kategori', e.target.value)}
                    >
                      <option value="Wajib">Wajib</option>
                      <option value="Nilai Tambah">Nilai Tambah</option>
                    </select>
                    <ChevronDown />
                  </div>
                  <input
                    className="sd001-kriteria-text-input"
                    value={newItemDraft.teks}
                    onChange={e => updateNewItemDraft('teks', e.target.value)}
                    placeholder="Masukkan kriteria baru..."
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button onClick={saveAddNew} style={{ background: 'var(--luna-orange-400)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Simpan">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button onClick={cancelAddNew} style={{ background: '#f0f2f6', color: '#555f71', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Batal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="sd002-kriteria-sections">
            {['Wajib', 'Nilai Tambah'].map(kat => {
              const items = kriteria.filter(k => k.kategori === kat);
              if (!items.length) return null;
              return (
                <div className="sd002-kriteria-section" key={kat}>
                  <h3 className={`sd002-kriteria-section-title ${kat === 'Wajib' ? 'wajib' : 'tambahan'}`}>
                    <span className="sd002-kriteria-section-dot" />
                    {kat}
                  </h3>
                  <div className="sd002-kriteria-items">
                    {items.map(k => {
                      if (inlineEditId === k.id) {
                        return (
                          <div className="sd001-kriteria-edit-item" key={k.id} ref={inlineEditRef} style={{ marginBottom: '8px' }}>
                            <div className="sd001-kriteria-edit-main">
                              <div className="sd001-kriteria-edit-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="sd001-kriteria-edit-label">Tag :</span>
                                  <input
                                    className="sd001-kriteria-text-input"
                                    style={{ width: '160px', flex: 'none', height: '24px', fontSize: '10px', padding: '0 8px' }}
                                    value={inlineDraft.tag || ''}
                                    onChange={e => updateInlineDraft('tag', e.target.value)}
                                    placeholder="Misal: Komunikasi"
                                    autoFocus
                                  />
                                </div>
                                <div className="sd001-kriteria-edit-label-group">
                                  <span className="sd001-kriteria-edit-label">Bobot Penilaian</span>
                                  <BobotSelect value={inlineDraft.bobot} onChange={val => updateInlineDraft('bobot', val)} />
                                </div>
                              </div>
                              <div className="sd001-kriteria-edit-fields">
                                <div className={`sd001-kriteria-kategori-wrap ${inlineDraft.kategori === 'Wajib' ? 'wajib' : 'tambahan'}`}>
                                  <select
                                    className="sd001-kriteria-kategori-select"
                                    value={inlineDraft.kategori}
                                    onChange={e => updateInlineDraft('kategori', e.target.value)}
                                  >
                                    <option value="Wajib">Wajib</option>
                                    <option value="Nilai Tambah">Nilai Tambah</option>
                                  </select>
                                  <ChevronDown />
                                </div>
                                <input
                                  className="sd001-kriteria-text-input"
                                  value={inlineDraft.teks}
                                  onChange={e => updateInlineDraft('teks', e.target.value)}
                                  placeholder="Masukkan kriteria..."
                                />
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <button onClick={saveInlineEdit} style={{ background: 'var(--luna-orange-400)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Simpan">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>
                              <button onClick={deleteInlineItem} style={{ background: '#f0f2f6', color: '#555f71', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Hapus">
                                <svg width="13" height="14" viewBox="0 0 14 15" fill="none">
                                  <path d="M1 3.5h12M4.5 3.5V2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1.5M5.5 7v5M8.5 7v5M2 3.5l.7 9.8a1 1 0 0 0 1 .9h6.6a1 1 0 0 0 1-.9L12 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="sd002-kriteria-item" key={k.id} onClick={() => startInlineEdit(k)}>
                          <p className="sd002-kriteria-item-text">{k.teks}</p>
                          <span className="sd002-bobot-slot">
                            <span className="sd002-bobot-wrap">
                              <span className={`sd002-bobot-dot ${k.bobot}`} />
                              <span className="sd002-bobot-text">{BOBOT_LABEL[k.bobot]}</span>
                            </span>
                            <span className="sd002-kriteria-item-edit-label">
                              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Edit
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <PopupKonfirmasi
          title="Hapus Kriteria?"
          body="Kriteria ini akan dihapus secara permanen dari daftar penilaian. Aksi ini tidak dapat dibatalkan."
          confirmLabel="Hapus"
          onConfirm={confirmDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
      {showRefreshConfirm && (
        <PopupKonfirmasi
          title="Generate Ulang Kriteria?"
          body="Sistem AI akan membaca ulang deskripsi pekerjaan dan merumuskan kriteria baru. Data kriteria sebelumnya akan tertimpa. Lanjutkan?"
          confirmLabel="Generate"
          onConfirm={() => {
            setShowRefreshConfirm(false);
            if (onRefresh) onRefresh();
          }}
          onClose={() => setShowRefreshConfirm(false)}
        />
      )}
    </div>
  );
}
