import { useState, useRef, useEffect, memo } from 'react';

// ── Icons ──────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
    <path d="M6.364 0.636a1.5 1.5 0 0 1 2.121 2.121L3.06 8.182 0.5 8.5l.318-2.56L6.364.636Z" stroke="#555f71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="7.5" stroke="#0977be" strokeWidth="1"/>
    <path d="M8.5 5.5v6M5.5 8.5h6" stroke="#0977be" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ── Toolbar icons (identik dengan Seleksi-Ringkasan) ───────────────
const IcOrderedList = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="5" y1="2.5" x2="13" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="8.5" x2="13" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="0.5" y="0.5" width="2.5" height="4" rx="0.4" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M0.5 8.5h1.5c.55 0 1 .45 1 1s-.45 1-1 1H0.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcUnorderedList = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <circle cx="1.5" cy="2.5" r="1.3" fill="currentColor"/>
    <circle cx="1.5" cy="8.5" r="1.3" fill="currentColor"/>
    <line x1="5" y1="2.5" x2="13" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="8.5" x2="13" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignLeft = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="10" x2="8" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignCenter = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2.5" y1="4" x2="10.5" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="2.5" y1="10" x2="10.5" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignRight = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IcAlignJustify = () => (
  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
    <line x1="0" y1="1" x2="13" y2="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="0" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ── Toolbar button (identik dengan Seleksi-Ringkasan) ─────────────
const TBtn = ({ title, cmd, val, children, onClick }) => (
  <button
    className="sd-deskripsi-toolbar-btn"
    title={title}
    onMouseDown={e => {
      e.preventDefault();
      if (onClick) { onClick(); return; }
      document.execCommand(cmd, false, val ?? null);
    }}
  >
    {children}
  </button>
);

// ── Memoized contenteditable (identik dengan Seleksi-Ringkasan) ───
const EditableContent = memo(
  ({ htmlRef, initialHtml }) => (
    <div
      ref={htmlRef}
      contentEditable
      suppressContentEditableWarning
      className="sd-deskripsi-content sd-deskripsi-editable"
      dangerouslySetInnerHTML={{ __html: initialHtml }}
    />
  ),
  () => true
);

// ── Field definitions ─────────────────────────────────────────────
const DETAIL_FIELDS = [
  { key: 'name',     label: 'Departement Name',    type: 'text' },
  { key: 'website',  label: 'Departement Website',  type: 'add'  },
  { key: 'industry', label: 'Departement Industry', type: 'add'  },
  { key: 'location', label: 'Departement Location', type: 'add'  },
  { key: 'address',  label: 'Departement Address',  type: 'add'  },
  { key: 'contact',  label: 'Contact',              type: 'add'  },
];

// ── Main component ─────────────────────────────────────────────────
export default function DepartemenRingkasan({ departemen = 'Human Resource' }) {
  // Details card state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [details, setDetails]                   = useState({
    name: departemen, website: '', industry: '', location: '', address: '', contact: '',
  });
  const detailsSnap = useRef(null);

  // Description card state
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descHtml, setDescHtml]           = useState('');
  const editorRef                         = useRef(null);
  const savedRangeRef                     = useRef(null);

  // Inline add state
  const [inlineAddKey, setInlineAddKey] = useState(null);
  const [inlineAddValue, setInlineAddValue] = useState('');

  useEffect(() => {
    if (isEditingDesc && editorRef.current) {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      editorRef.current.focus();
    }
  }, [isEditingDesc]);

  const set = (key, val) => setDetails(prev => ({ ...prev, [key]: val }));

  const startEditDetails = () => { detailsSnap.current = { ...details }; setIsEditingDetails(true); };
  const cancelDetails    = () => { setDetails(detailsSnap.current); setIsEditingDetails(false); };
  const saveDetails      = () => setIsEditingDetails(false);

  const handleSaveDesc   = () => { if (editorRef.current) setDescHtml(editorRef.current.innerHTML); setIsEditingDesc(false); };
  const handleCancelDesc = () => setIsEditingDesc(false);

  const renderDetailValue = (field) => {
    const val = details[field.key] ?? '';

    if (!isEditingDetails) {
      if (inlineAddKey === field.key) {
        return (
          <div style={{ width: '285px', flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type={field.type === 'date' ? 'date' : 'text'}
              className={`sd-detail-input ${field.type === 'date' ? 'sd-detail-input--date' : ''}`}
              value={inlineAddValue}
              onChange={e => setInlineAddValue(e.target.value)}
              placeholder="Tambahkan data"
              autoFocus
              style={{ flex: 1, minWidth: 0, width: '100%', margin: 0, height: '32px' }}
            />
            <button onClick={() => setInlineAddKey(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }} title="Batal">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#dc3545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 10.5L10.5 3.5M3.5 3.5l7 7"/></svg>
            </button>
            <button onClick={() => { set(field.key, inlineAddValue); setInlineAddKey(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }} title="Simpan">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#28a745" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.8 7l2.8 2.8 5.6-5.6"/></svg>
            </button>
          </div>
        );
      }

      if (field.type === 'add' && !val) {
        return (
          <span className="sd-detail-value add-data" style={{ cursor: 'pointer' }} onClick={() => { setInlineAddKey(field.key); setInlineAddValue(''); }}>
            Tambahkan data <AddIcon />
          </span>
        );
      }
      return (
        <span className="sd-detail-value" style={{ color: '#323b4d', fontWeight: 400 }}>
          {val || (
            <span
              className="sd-detail-value add-data"
              style={{ cursor: 'pointer', gap: 4 }}
              onClick={() => { setInlineAddKey(field.key); setInlineAddValue(''); }}
            >
              Tambahkan data <AddIcon />
            </span>
          )}
        </span>
      );
    }

    return (
      <input
        className="sd-detail-input"
        value={val}
        onChange={e => set(field.key, e.target.value)}
        placeholder={field.type === 'add' ? 'Tambahkan data' : field.label}
      />
    );
  };

  return (
    <div className="sd-columns" style={{ width: '569px', maxWidth: '100%' }}>
      <div className="sd-col-left" style={{ width: '100%', flex: 'none' }}>

        {/* ── Details Card ── */}
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title" style={{ textTransform: 'uppercase', letterSpacing: '0.65px', fontSize: '13px' }}>
              Details
            </span>
            {!isEditingDetails && (
              <button className="sd-edit-btn" onClick={startEditDetails}>
                <EditIcon /> Edit
              </button>
            )}
          </div>

          <div className="sd-detail-rows">
            {DETAIL_FIELDS.map(field => (
              <div className="sd-detail-row" key={field.key}>
                <span className="sd-detail-label">{field.label}</span>
                {renderDetailValue(field)}
              </div>
            ))}
          </div>

          {isEditingDetails && (
            <div className="sd-detail-edit-footer">
              <button className="sd-edit-cancel-btn" onClick={cancelDetails}>Batal</button>
              <button className="sd-edit-save-btn" onClick={saveDetails}>Simpan</button>
            </div>
          )}
        </div>

        {/* ── Description Card ── */}
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title" style={{ textTransform: 'uppercase', letterSpacing: '0.65px', fontSize: '13px' }}>
              Description
            </span>
            {!isEditingDesc && (
              <button className="sd-edit-btn" onClick={() => setIsEditingDesc(true)}>
                <EditIcon /> Edit
              </button>
            )}
          </div>

          {isEditingDesc ? (
            /* ── Edit mode: rich text editor identik dengan Seleksi-Ringkasan ── */
            <div className="sd-deskripsi-editor">
              <div className="sd-deskripsi-toolbar">
                <select
                  className="sd-deskripsi-style-select"
                  defaultValue="p"
                  onMouseDown={() => {
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                  }}
                  onChange={e => {
                    if (savedRangeRef.current) {
                      const sel = window.getSelection();
                      sel.removeAllRanges();
                      sel.addRange(savedRangeRef.current);
                      savedRangeRef.current = null;
                    }
                    editorRef.current?.focus();
                    document.execCommand('formatBlock', false, e.target.value);
                  }}
                >
                  <option value="p">Body</option>
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                </select>
                <span className="sd-deskripsi-toolbar-sep" />
                <TBtn title="Bold" cmd="bold"><b>B</b></TBtn>
                <TBtn title="Italic" cmd="italic"><i>I</i></TBtn>
                <TBtn title="Underline" cmd="underline"><u>U</u></TBtn>
                <span className="sd-deskripsi-toolbar-sep" />
                <TBtn title="Ordered List" cmd="insertOrderedList"><IcOrderedList /></TBtn>
                <TBtn title="Unordered List" cmd="insertUnorderedList"><IcUnorderedList /></TBtn>
                <span className="sd-deskripsi-toolbar-sep" />
                <TBtn title="Align Left" cmd="justifyLeft"><IcAlignLeft /></TBtn>
                <TBtn title="Align Center" cmd="justifyCenter"><IcAlignCenter /></TBtn>
                <TBtn title="Align Right" cmd="justifyRight"><IcAlignRight /></TBtn>
                <TBtn title="Justify" cmd="justifyFull"><IcAlignJustify /></TBtn>
              </div>

              <EditableContent htmlRef={editorRef} initialHtml={descHtml} />

              <div className="sd-detail-edit-footer">
                <button className="sd-edit-cancel-btn" onClick={handleCancelDesc}>Batal</button>
                <button className="sd-edit-save-btn" onClick={handleSaveDesc}>Simpan</button>
              </div>
            </div>
          ) : (
            /* ── View mode ── */
            descHtml ? (
              <div
                className="sd-deskripsi-content"
                dangerouslySetInnerHTML={{ __html: descHtml }}
              />
            ) : (
              <div className="sd-detail-rows">
                <div className="sd-detail-row" style={{ borderBottom: 'none' }}>
                  <span className="sd-detail-label">Departement Description</span>
                  <span className="sd-detail-value add-data">
                    Tambahkan data <AddIcon />
                  </span>
                </div>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
