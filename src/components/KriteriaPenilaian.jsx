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

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="10.5" width="14" height="9" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
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
  <div className={`sd-bobot-select-wrap ${value}`}>
    <select
      className="sd-bobot-select"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {BOBOT_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
    </select>
    <ChevronDown />
  </div>
);

/**
 * Komponen Kriteria Penilaian — reusable, controlled.
 *
 * Props:
 *   kriteria  — array of { id, kategori, teks, bobot }
 *   onChange  — (newKriteria: array) => void
 */
export default function KriteriaPenilaian({ kriteria, onChange, isGenerating = false, onRefresh, isFreePlan = false, navigate }) {
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
    <div className="sd-card">
      <div className="sd-card-header">
        <span className="sd-card-title">Kriteria Penilaian</span>
        {!isEditing && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onRefresh && !isFreePlan && (
              <button className="sd-edit-btn" onClick={() => setShowRefreshConfirm(true)} title="Generate Ulang Kriteria" style={{ padding: '6px 8px' }}>
                <RefreshIcon />
              </button>
            )}
            <button className="sd-edit-btn" onClick={startEdit}>
              <EditIcon /> Edit
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="sd-kriteria-content">
          <div className="sd-ai-badge">
            <div className="sd-ai-icon">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 0L7.64 4.86L13 6.5L7.64 8.14L6.5 13L5.36 8.14L0 6.5L5.36 4.86L6.5 0Z" fill="#0977be" />
                <path d="M2 0.5L2.45 2.05L4 2.5L2.45 2.95L2 4.5L1.55 2.95L0 2.5L1.55 2.05L2 0.5Z" fill="#0977be" opacity="0.6" />
              </svg>
            </div>
            <div className="sd-ai-text-group">
              <p className="sd-ai-title">Kriteria Berbasis AI</p>
              <p className="sd-ai-desc">
                Untuk membantu akurasi AI telah merangkum kriteria berdasarkan data Job Description.<br />
                Sesuaikan kriteria jika diperlukan.
              </p>
            </div>
          </div>
          <button className="sd-kriteria-add-new-btn" onClick={addItem}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Tambah Kriteria
          </button>
          <div className="sd-kriteria-sections" style={{ marginTop: '16px' }}>
            {['Wajib', 'Nilai Tambah'].map(kat => {
              const items = draft.filter(k => k.kategori === kat);
              if (!items.length) return null;
              return (
                <div className="sd-kriteria-section" key={kat}>
                  <div className="sd-kriteria-header">
                    <h3 className={`sd-kriteria-section-title ${kat === 'Wajib' ? 'primary' : 'neutral'}`}>{kat}</h3>
                  </div>
                  <div className="sd-kriteria-edit-list">
                    {items.map(k => (
                      <div className="sd-kriteria-edit-item" key={k.id}>
                        <div className="sd-kriteria-edit-main">
                          <div className="sd-kriteria-edit-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="sd-kriteria-edit-label">Tag :</span>
                              <input
                                className="sd-kriteria-text-input"
                                style={{ width: '160px', flex: 'none', height: '24px', fontSize: '10px', padding: '0 8px' }}
                                value={k.tag || ''}
                                onChange={e => updateItem(k.id, 'tag', e.target.value)}
                                placeholder="Misal: Komunikasi"
                              />
                            </div>
                            <div className="sd-kriteria-edit-label-group">
                              <span className="sd-kriteria-edit-label">Bobot Penilaian</span>
                              <BobotSelect value={k.bobot} onChange={val => updateItem(k.id, 'bobot', val)} />
                            </div>
                          </div>
                          <div className="sd-kriteria-edit-fields">
                            <div className={`sd-kriteria-kategori-wrap ${k.kategori === 'Wajib' ? 'wajib' : 'tambahan'}`}>
                              <select
                                className="sd-kriteria-kategori-select"
                                value={k.kategori}
                                onChange={e => updateItem(k.id, 'kategori', e.target.value)}
                              >
                                <option value="Wajib">Wajib</option>
                                <option value="Nilai Tambah">Nilai Tambah</option>
                              </select>
                              <ChevronDown />
                            </div>
                            <input
                              className="sd-kriteria-text-input"
                              value={k.teks}
                              onChange={e => updateItem(k.id, 'teks', e.target.value)}
                              placeholder="Masukkan kriteria..."
                            />
                          </div>
                        </div>
                        <button className="sd-kriteria-delete-btn" onClick={() => deleteItem(k.id)}>
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sd-kriteria-edit-footer">
            <div className="sd-kriteria-footer-right" style={{ marginLeft: 'auto' }}>
              <button className="sd-kriteria-cancel-btn" onClick={cancel}>Batal</button>
              <button className="sd-edit-save-btn" onClick={save}>Simpan</button>
            </div>
          </div>
        </div>
      ) : isGenerating ? (
        <div className="sd-kriteria-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', gap: '1rem', textAlign: 'center' }}>
          <svg style={{ animation: 'sd-spin 0.8s linear infinite', width: 28, height: 28, color: '#0977be' }} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
            <path fill="currentColor" opacity="0.8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#171e2c', margin: 0 }}>Sedang Membuat Kriteria Penilaian</p>
            <p style={{ fontSize: '0.8rem', color: '#7e8799', margin: '4px 0 0 0' }}>AI sedang menganalisis Job Description...</p>
          </div>
        </div>
      ) : kriteria.length === 0 && isFreePlan ? (
        <div className="sd-kriteria-locked">
          <div className="sd-kriteria-locked-icon"><LockIcon /></div>
          <p className="sd-kriteria-locked-title">Kriteria Penilaian Terkunci</p>
          <p className="sd-kriteria-locked-desc">
            Paket Free tidak termasuk perumusan kriteria &amp; skoring otomatis oleh AI. Upgrade paket untuk membiarkan AI merangkum kriteria dari Job Description dan menilai kandidat secara otomatis.
          </p>
          {navigate && (
            <button className="sd-kriteria-locked-cta" onClick={() => navigate('paket-langganan')}>
              Upgrade Paket
            </button>
          )}
        </div>
      ) : kriteria.length === 0 ? (
        <div className="sd-kriteria-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#f9fafc', borderRadius: '12px', border: '1px dashed #cbd0db', margin: '1rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px', color: '#abb2c1' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p style={{ fontWeight: 600, fontSize: '1rem', color: '#171e2c', margin: '0 0 8px 0' }}>Belum Ada Kriteria Penilaian</p>
          <p style={{ fontSize: '0.85rem', color: '#555f71', margin: '0 0 20px 0', maxWidth: '380px', lineHeight: 1.6 }}>
            Kriteria penilaian ini wajib diisi karena akan digunakan sebagai panduan utama oleh AI dalam menilai dan menyaring kandidat secara otomatis.
          </p>
          <button
            className="sd-edit-save-btn"
            onClick={() => (onRefresh ? onRefresh() : startEdit())}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem' }}
          >
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 0L7.64 4.86L13 6.5L7.64 8.14L6.5 13L5.36 8.14L0 6.5L5.36 4.86L6.5 0Z" fill="currentColor" />
            </svg>
            Generate Kriteria
          </button>
        </div>
      ) : (
        <div className="sd-kriteria-content">
          <div className="sd-ai-badge">
            <div className="sd-ai-icon">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 0L7.64 4.86L13 6.5L7.64 8.14L6.5 13L5.36 8.14L0 6.5L5.36 4.86L6.5 0Z" fill="#0977be" />
                <path d="M2 0.5L2.45 2.05L4 2.5L2.45 2.95L2 4.5L1.55 2.95L0 2.5L1.55 2.05L2 0.5Z" fill="#0977be" opacity="0.6" />
              </svg>
            </div>
            <div className="sd-ai-text-group">
              <p className="sd-ai-title">Kriteria Berbasis AI</p>
              <p className="sd-ai-desc">
                Untuk membantu akurasi AI telah merangkum kriteria berdasarkan data Job Description.<br />
                Klik &lsquo;Edit&rsquo; jika ada penyesuaian kriteria.
              </p>
            </div>
          </div>

          {/* CTA Tambah Kriteria */}
          <button
            className="sd-kriteria-add-new-btn"
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
            <div className="sd-kriteria-edit-item sd-kriteria-new-item">
              <div className="sd-kriteria-edit-main">
                <div className="sd-kriteria-edit-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="sd-kriteria-edit-label">Tag :</span>
                    <input
                      className="sd-kriteria-text-input"
                      style={{ width: '160px', flex: 'none', height: '24px', fontSize: '10px', padding: '0 8px' }}
                      value={newItemDraft.tag || ''}
                      onChange={e => updateNewItemDraft('tag', e.target.value)}
                      placeholder="Misal: Komunikasi"
                      autoFocus
                    />
                  </div>
                  <div className="sd-kriteria-edit-label-group">
                    <span className="sd-kriteria-edit-label">Bobot Penilaian</span>
                    <BobotSelect value={newItemDraft.bobot} onChange={val => updateNewItemDraft('bobot', val)} />
                  </div>
                </div>
                <div className="sd-kriteria-edit-fields">
                  <div className={`sd-kriteria-kategori-wrap ${newItemDraft.kategori === 'Wajib' ? 'wajib' : 'tambahan'}`}>
                    <select
                      className="sd-kriteria-kategori-select"
                      value={newItemDraft.kategori}
                      onChange={e => updateNewItemDraft('kategori', e.target.value)}
                    >
                      <option value="Wajib">Wajib</option>
                      <option value="Nilai Tambah">Nilai Tambah</option>
                    </select>
                    <ChevronDown />
                  </div>
                  <input
                    className="sd-kriteria-text-input"
                    value={newItemDraft.teks}
                    onChange={e => updateNewItemDraft('teks', e.target.value)}
                    placeholder="Masukkan kriteria baru..."
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button onClick={saveAddNew} style={{ background: '#0977be', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Simpan">
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

          <div className="sd-kriteria-sections">
            {['Wajib', 'Nilai Tambah'].map(kat => {
              const items = kriteria.filter(k => k.kategori === kat);
              if (!items.length) return null;
              return (
                <div className="sd-kriteria-section" key={kat}>
                  <div className="sd-kriteria-header">
                    <h3 className={`sd-kriteria-section-title ${kat === 'Wajib' ? 'primary' : 'neutral'}`}>{kat}</h3>
                    <span className="sd-kriteria-bobot-label">Bobot Nilai</span>
                  </div>
                  <div className="sd-kriteria-items">
                    {items.map(k => {
                      if (inlineEditId === k.id) {
                        return (
                          <div className="sd-kriteria-edit-item" key={k.id} ref={inlineEditRef} style={{ marginBottom: '8px' }}>
                            <div className="sd-kriteria-edit-main">
                              <div className="sd-kriteria-edit-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="sd-kriteria-edit-label">Tag :</span>
                                  <input
                                    className="sd-kriteria-text-input"
                                    style={{ width: '160px', flex: 'none', height: '24px', fontSize: '10px', padding: '0 8px' }}
                                    value={inlineDraft.tag || ''}
                                    onChange={e => updateInlineDraft('tag', e.target.value)}
                                    placeholder="Misal: Komunikasi"
                                    autoFocus
                                  />
                                </div>
                                <div className="sd-kriteria-edit-label-group">
                                  <span className="sd-kriteria-edit-label">Bobot Penilaian</span>
                                  <BobotSelect value={inlineDraft.bobot} onChange={val => updateInlineDraft('bobot', val)} />
                                </div>
                              </div>
                              <div className="sd-kriteria-edit-fields">
                                <div className={`sd-kriteria-kategori-wrap ${inlineDraft.kategori === 'Wajib' ? 'wajib' : 'tambahan'}`}>
                                  <select
                                    className="sd-kriteria-kategori-select"
                                    value={inlineDraft.kategori}
                                    onChange={e => updateInlineDraft('kategori', e.target.value)}
                                  >
                                    <option value="Wajib">Wajib</option>
                                    <option value="Nilai Tambah">Nilai Tambah</option>
                                  </select>
                                  <ChevronDown />
                                </div>
                                <input
                                  className="sd-kriteria-text-input"
                                  value={inlineDraft.teks}
                                  onChange={e => updateInlineDraft('teks', e.target.value)}
                                  placeholder="Masukkan kriteria..."
                                />
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <button onClick={saveInlineEdit} style={{ background: '#0977be', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Simpan">
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
                        <div className="sd-kriteria-item" key={k.id} onClick={() => startInlineEdit(k)}>
                          <ul className="sd-kriteria-list"><li>{k.teks}</li></ul>
                          <span className={`sd-bobot-badge ${k.bobot}`}>{BOBOT_LABEL[k.bobot]}</span>
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
