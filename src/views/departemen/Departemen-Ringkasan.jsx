import { useState, useRef, useEffect, memo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDepartmentByName, updateDepartmentDetails } from '../../services/departmentRingkasanService.js';
import Toast from '../../components/Toast.jsx';
import InlineEditRow from '../../components/InlineEditRow.jsx';

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


export default function DepartemenRingkasan({ departemen = 'Human Resource' }) {
  const { companyId } = useAuth();
  const [departmentId, setDepartmentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (message, subMessage) => {
    setToast({ message, subMessage });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };
  // Details card state
  const [details, setDetails] = useState({
    name: departemen, website: '', industry: '', location: '', address: '', contact: '',
  });

  // Description card state
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descHtml, setDescHtml]           = useState('');
  const editorRef                         = useRef(null);
  const savedRangeRef                     = useRef(null);


  const loadData = async () => {
    if (!companyId || !departemen) return;
    setIsLoading(true);
    try {
      const data = await getDepartmentByName(companyId, departemen);
      if (data) {
        setDepartmentId(data.id);
        setDetails({
          name: data.name || departemen,
          website: data.website || '',
          industry: data.industry || '',
          location: data.location || '',
          address: data.address || '',
          contact: data.contact || '',
        });
        setDescHtml(data.description || '');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat', 'Data departemen tidak ditemukan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId, departemen]);

  useEffect(() => {
    if (isEditingDesc && editorRef.current) {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      editorRef.current.focus();
    }
  }, [isEditingDesc]);

  const set = (key, val) => setDetails(prev => ({ ...prev, [key]: val }));

  const handleSaveField = async (key, val) => {
    set(key, val);
    if (!departmentId) return;
    try {
      await updateDepartmentDetails(departmentId, { [key]: val });
      showToast('Berhasil', 'Data departemen diperbarui');
    } catch (err) {
      showToast('Gagal', 'Terjadi kesalahan saat menyimpan');
    }
  };

  const handleSaveDesc   = async () => { 
    if (!editorRef.current || !departmentId) return;
    const newHtml = editorRef.current.innerHTML;
    try {
      await updateDepartmentDetails(departmentId, { description: newHtml });
      setDescHtml(newHtml);
      setIsEditingDesc(false);
      showToast('Berhasil', 'Deskripsi departemen diperbarui');
    } catch (err) {
      showToast('Gagal', 'Terjadi kesalahan saat menyimpan deskripsi');
    }
  };
  const handleCancelDesc = () => setIsEditingDesc(false);


  if (isLoading) {
    return <div style={{ padding: '24px', color: '#666' }}>Memuat data departemen...</div>;
  }

  return (
    <div className="sd-columns" style={{ width: '569px', maxWidth: '100%' }}>
      <div className="sd-col-left" style={{ width: '100%', flex: 'none' }}>

        {/* ── Details Card ── */}
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title" style={{ textTransform: 'uppercase', letterSpacing: '0.65px', fontSize: '13px' }}>
              Detail
            </span>
          </div>

          <div className="sd-detail-rows">
            <InlineEditRow
              label="Nama Departemen"
              tooltip="Nama resmi departemen yang digunakan di seluruh sistem"
              value={details.name}
              onSave={val => handleSaveField('name', val)}
              width="285px"
            />
            <InlineEditRow
              label="Website"
              tooltip="URL website departemen atau perusahaan, contoh: https://arkademi.com"
              value={details.website}
              onSave={val => handleSaveField('website', val)}
              emptyLabel="Tambahkan data"
              width="285px"
            />
            <InlineEditRow
              label="Industri"
              tooltip="Bidang industri departemen ini beroperasi, contoh: Teknologi, Pendidikan, Keuangan"
              value={details.industry}
              onSave={val => handleSaveField('industry', val)}
              emptyLabel="Tambahkan data"
              width="285px"
            />
            <InlineEditRow
              label="Lokasi"
              tooltip="Kota atau wilayah tempat departemen berada, contoh: Jakarta Selatan"
              type="location"
              value={details.location}
              onSave={val => handleSaveField('location', val)}
              emptyLabel="Tambahkan data"
              width="285px"
            />
            <InlineEditRow
              label="Alamat Lengkap"
              tooltip="Alamat fisik lengkap termasuk nama jalan, nomor gedung, dan kode pos"
              value={details.address}
              onSave={val => handleSaveField('address', val)}
              emptyLabel="Tambahkan data"
              width="285px"
            />
            <InlineEditRow
              label="Kontak"
              tooltip="Nama atau email penanggung jawab departemen yang bisa dihubungi"
              type="tel"
              value={details.contact}
              onSave={val => handleSaveField('contact', val)}
              emptyLabel="Tambahkan data"
              width="285px"
            />
          </div>
        </div>

        {/* ── Description Card ── */}
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title" style={{ textTransform: 'uppercase', letterSpacing: '0.65px', fontSize: '13px' }}>
              Deskripsi
            </span>
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
                className="sd-deskripsi-content sd-deskripsi-content--hoverable"
                dangerouslySetInnerHTML={{ __html: descHtml }}
                onClick={() => setIsEditingDesc(true)}
                title="Klik untuk mengedit"
              />
            ) : (
              <div className="sd-detail-rows">
                <div className="inline-edit-row" style={{ borderBottom: 'none' }}>
                  <div className="inline-edit-label">Deskripsi Departemen</div>
                  <span className="inline-edit-value add-data" onClick={() => setIsEditingDesc(true)} style={{ width: '285px', cursor: 'pointer' }}>
                    Tambahkan data <AddIcon />
                  </span>
                </div>
              </div>
            )
          )}
        </div>

      </div>
      {toast && <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />}
    </div>
  );
}
