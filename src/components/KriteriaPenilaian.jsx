import { useState } from 'react';

const EditIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
    <path d="M1 3.5h12M4.5 3.5V2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1.5M5.5 7v5M8.5 7v5M2 3.5l.7 9.8a1 1 0 0 0 1 .9h6.6a1 1 0 0 0 1-.9L12 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, pointerEvents: 'none' }}>
    <path d="M1 1L5 5L9 1"/>
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
export default function KriteriaPenilaian({ kriteria, onChange, isGenerating = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState([]);

  const startEdit = () => { setDraft(kriteria); setIsEditing(true); };
  const cancel    = () => setIsEditing(false);
  const save      = () => { onChange(draft); setIsEditing(false); };

  const addItem = () =>
    setDraft(prev => [
      ...prev,
      { id: Math.max(0, ...prev.map(k => k.id)) + 1, kategori: 'Wajib', teks: '', bobot: 'sedang' },
    ]);

  const deleteItem = (id) => setDraft(prev => prev.filter(k => k.id !== id));
  const updateItem = (id, field, val) =>
    setDraft(prev => prev.map(k => k.id === id ? { ...k, [field]: val } : k));

  return (
    <div className="sd-card">
      <div className="sd-card-header">
        <span className="sd-card-title">Kriteria Penilaian</span>
        {!isEditing && (
          <button className="sd-edit-btn" onClick={startEdit}>
            <EditIcon /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="sd-kriteria-content">
          <div className="sd-kriteria-edit-list">
            {draft.map(k => (
              <div className="sd-kriteria-edit-item" key={k.id}>
                <div className="sd-kriteria-edit-main">
                  <div className="sd-kriteria-edit-header">
                    <span className="sd-kriteria-edit-label">Kategori</span>
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
          <div className="sd-kriteria-edit-footer">
            <button className="sd-kriteria-add-btn" onClick={addItem}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add Criteria
            </button>
            <div className="sd-kriteria-footer-right">
              <button className="sd-kriteria-cancel-btn" onClick={cancel}>Batal</button>
              <button className="sd-edit-save-btn" onClick={save}>Simpan</button>
            </div>
          </div>
        </div>
      ) : isGenerating ? (
        <div className="sd-kriteria-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', gap: '1rem', textAlign: 'center' }}>
          <svg style={{ animation: 'sd-spin 0.8s linear infinite', width: 28, height: 28, color: '#0977be' }} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2"/>
            <path fill="currentColor" opacity="0.8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#171e2c', margin: 0 }}>Sedang Membuat Kriteria Penilaian</p>
            <p style={{ fontSize: '0.8rem', color: '#7e8799', margin: '4px 0 0 0' }}>AI sedang menganalisis Job Description...</p>
          </div>
        </div>
      ) : (
        <div className="sd-kriteria-content">
          <div className="sd-ai-badge">
            <div className="sd-ai-icon">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 0L7.64 4.86L13 6.5L7.64 8.14L6.5 13L5.36 8.14L0 6.5L5.36 4.86L6.5 0Z" fill="#0977be"/>
                <path d="M2 0.5L2.45 2.05L4 2.5L2.45 2.95L2 4.5L1.55 2.95L0 2.5L1.55 2.05L2 0.5Z" fill="#0977be" opacity="0.6"/>
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
                    {items.map(k => (
                      <div className="sd-kriteria-item" key={k.id}>
                        <ul className="sd-kriteria-list"><li>{k.teks}</li></ul>
                        <span className={`sd-bobot-badge ${k.bobot}`}>{BOBOT_LABEL[k.bobot]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
