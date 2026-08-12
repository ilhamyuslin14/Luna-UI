import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import useBuatLowonganForm from '../../../hooks/lowongan/useBuatLowonganForm.js';
import { DROPDOWN_OPTIONS } from '../../../utils/dropdownOptions.js';
import MobileToast from '../../components/MobileToast.jsx';
import MobileRichTextEditor from '../../components/MobileRichTextEditor.jsx';
import '../../../../css/mobile/lowongan/buat-lowongan-form.css';

const IconClose = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const IconBack = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>);
const IconChevronRight = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>);
const IconUpload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
const IconAi = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>);
const IconPlus = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const IconSpinner = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="mblf-spin"><path d="M21 12a9 9 0 1 1-6.22-8.56" /></svg>);

const SELECT_META = {
  levelJabatan: { label: 'Level Jabatan', options: DROPDOWN_OPTIONS.levelJabatan },
  ikatanKerja: { label: 'Ikatan Kerja', options: DROPDOWN_OPTIONS.ikatanKerja },
  siklusUpah: { label: 'Siklus Upah', options: DROPDOWN_OPTIONS.siklusUpah },
  pendidikan: { label: 'Minimal Pendidikan', options: DROPDOWN_OPTIONS.pendidikan },
};

function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MobileBuatLowonganForm({ navigate }) {
  const { companyId, companyPlan } = useAuth() || {};
  const {
    form, setField, setUpah,
    departments, createNewDepartment, isCreatingDept,
    lokasiSuggestions, handleLokasiChange, selectLokasi,
    isUploading, uploadFileName, handleFileUpload,
    isSaving, submit, cancel,
    isFreePlan, statusOptions,
    toast, setToast,
  } = useBuatLowonganForm(companyId, companyPlan, navigate);

  const [phase, setPhase] = useState('form'); // 'form' | 'review'
  const [activeSheet, setActiveSheet] = useState(null);
  const [newDeptMode, setNewDeptMode] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [descExpanded, setDescExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  // Panjang teks polos deskripsi, dilacak lewat textContent tiap ketikan
  // (murah, tidak menyentuh HTML/innerHTML sama sekali) — dipakai buat
  // charcount & progress bar tanpa memicu re-render EditableContent.
  const [liveDescLen, setLiveDescLen] = useState(() => form.deskripsi.replace(/<[^>]*>/g, '').trim().length);

  const closeSheet = () => { setActiveSheet(null); setNewDeptMode(false); setNewDeptName(''); };

  const syncDeskripsiFromEditor = () => {
    if (editorRef.current) setField('deskripsi', editorRef.current.innerHTML);
  };

  const departemenNama = departments.find(d => d.id === form.departemen)?.name || '';

  const onFileSelected = async (file) => {
    const html = await handleFileUpload(file);
    if (html && editorRef.current) {
      editorRef.current.innerHTML = html;
      setLiveDescLen(editorRef.current.textContent.length);
    }
  };

  const handleSubmitClick = async () => {
    const liveHtml = editorRef.current ? editorRef.current.innerHTML : undefined;
    await submit(liveHtml);
  };

  return (
    <>
      {phase === 'form' ? (
        <>
          <div className="mblf-top">
            <button className="mblf-iconbtn" onClick={cancel}><IconClose /></button>
            <span className="mblf-toptitle">Buat Lowongan</span>
            <span className="mblf-topspacer" />
          </div>

          <div className="mblf-body">
            <div className="mblf-upload" onClick={() => !isUploading && fileInputRef.current?.click()}>
              <div className="mblf-upload-ic">{isUploading ? <IconSpinner /> : <IconUpload />}</div>
              <div className="mblf-upload-text">
                <div className="mblf-upload-title">{isUploading ? 'Mengekstrak dokumen…' : uploadFileName ? uploadFileName : 'Sudah punya draf JD?'}</div>
                <div className="mblf-upload-sub">{isUploading ? 'Mohon tunggu sebentar' : 'Unggah .pdf/.docx, form di bawah terisi otomatis'}</div>
              </div>
              {!isUploading && <span className="mblf-upload-cta">Unggah</span>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files[0]; if (f) onFileSelected(f); e.target.value = ''; }}
            />
            <div className="mblf-or-divider">atau isi manual</div>

            <div className="mblf-section-label first">Detail Posisi</div>
            <div>
              <div className="mblf-field-label">Nama Jabatan <span className="req">*</span></div>
              <input className="mblf-input" placeholder="mis. Product Designer" value={form.jabatan} onChange={e => setField('jabatan', e.target.value)} />
            </div>
            <div>
              <div className="mblf-field-label">Level Jabatan</div>
              <button className="mblf-select" onClick={() => setActiveSheet('levelJabatan')}>
                <span className={form.levelJabatan ? '' : 'ph'}>{form.levelJabatan || 'Pilih level jabatan'}</span><IconChevronDown />
              </button>
            </div>
            <div>
              <div className="mblf-field-label">Departemen</div>
              <button className="mblf-select" onClick={() => setActiveSheet('departemen')}>
                <span className={departemenNama ? '' : 'ph'}>{departemenNama || 'Pilih departemen'}</span><IconChevronDown />
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <div className="mblf-field-label">Lokasi</div>
              <input className="mblf-input" placeholder="mis. Jakarta Selatan" value={form.lokasi} onChange={e => handleLokasiChange(e.target.value)} />
              {lokasiSuggestions.length > 0 && (
                <div className="mblf-suggest">
                  {lokasiSuggestions.map(s => (
                    <div className="mblf-suggest-item" key={s.name} onClick={() => selectLokasi(s)}>
                      {s.name}{s.province ? <span>{s.province}</span> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="mblf-field-label">Ikatan Kerja</div>
              <button className="mblf-select" onClick={() => setActiveSheet('ikatanKerja')}>
                <span className={form.ikatanKerja ? '' : 'ph'}>{form.ikatanKerja || 'Pilih ikatan kerja'}</span><IconChevronDown />
              </button>
            </div>

            <div className="mblf-section-label">Kompensasi & Jadwal</div>
            <div>
              <div className="mblf-field-label">Status Rekrutmen <span className="req">*</span></div>
              <button className="mblf-select" onClick={() => setActiveSheet('status')}>
                <span>{form.statusRekrutmen}</span><IconChevronDown />
              </button>
            </div>
            <div>
              <div className="mblf-field-label">Jumlah Rekrut</div>
              <input className="mblf-input" type="number" inputMode="numeric" placeholder="mis. 2" value={form.jumlahRekrut} onChange={e => setField('jumlahRekrut', e.target.value)} />
            </div>
            <div className="mblf-row2">
              <div>
                <div className="mblf-field-label">Upah Min</div>
                <input className="mblf-input" inputMode="numeric" placeholder="Rp 0" value={form.upahMin} onChange={e => setUpah('upahMin')(e.target.value)} />
              </div>
              <div>
                <div className="mblf-field-label">Upah Maks</div>
                <input className="mblf-input" inputMode="numeric" placeholder="Rp 0" value={form.upahMax} onChange={e => setUpah('upahMax')(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="mblf-field-label">Siklus Upah</div>
              <button className="mblf-select" onClick={() => setActiveSheet('siklusUpah')}>
                <span className={form.siklusUpah ? '' : 'ph'}>{form.siklusUpah || 'Pilih siklus upah'}</span><IconChevronDown />
              </button>
            </div>
            <div className="mblf-row2">
              <div>
                <div className="mblf-field-label">Tgl Mulai</div>
                <input className="mblf-input" type="date" value={form.tglMulai} onChange={e => setField('tglMulai', e.target.value)} />
              </div>
              <div>
                <div className="mblf-field-label">Target Onboard</div>
                <input className="mblf-input" type="date" value={form.tglOnboarding} onChange={e => setField('tglOnboarding', e.target.value)} />
              </div>
            </div>
            <div>
              <div className="mblf-field-label">Minimal Pendidikan</div>
              <button className="mblf-select" onClick={() => setActiveSheet('pendidikan')}>
                <span className={form.pendidikan ? '' : 'ph'}>{form.pendidikan || 'Pilih minimal pendidikan'}</span><IconChevronDown />
              </button>
            </div>
            <div>
              <div className="mblf-field-label">Minimal Pengalaman (Tahun)</div>
              <input className="mblf-input" type="number" inputMode="numeric" placeholder="mis. 3" value={form.pengalaman} onChange={e => setField('pengalaman', e.target.value)} />
            </div>

            <div className="mblf-section-label">Deskripsi Pekerjaan</div>
            <div>
              <div className="mblf-field-label">Deskripsi <span className="req">*</span></div>
              <MobileRichTextEditor
                editorRef={editorRef}
                initialHtml={form.deskripsi}
                onInput={e => setLiveDescLen(e.currentTarget.textContent.length)}
                onBlur={syncDeskripsiFromEditor}
                placeholder="Jelaskan tanggung jawab & kualifikasi posisi ini…"
              />
            </div>
            <div className="mblf-charcount">
              <span>Minimal 300 karakter untuk kriteria otomatis</span>
              <b>{liveDescLen} / 300</b>
            </div>
            <div className="mblf-progress-bar"><div className="mblf-progress-fill" style={{ width: `${Math.min(100, (liveDescLen / 300) * 100)}%` }} /></div>
            {!isFreePlan ? (
              <div className="mblf-ai-hint">
                <IconAi />
                <p><b>Kriteria penilaian AI</b> akan otomatis disusun dari deskripsi ini begitu lowongan diterbitkan — tidak perlu diisi manual.</p>
              </div>
            ) : (
              <div className="mblf-ai-hint muted">
                <IconAi />
                <p>Paket Free tidak termasuk perumusan kriteria otomatis oleh AI — kriteria bisa ditambahkan manual nanti di halaman detail lowongan.</p>
              </div>
            )}
          </div>

          <div className="mblf-footer">
            <button className="mblf-btn-primary" onClick={() => { syncDeskripsiFromEditor(); setPhase('review'); }}>
              Lanjut ke Review<IconChevronRight />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mblf-top">
            <button className="mblf-iconbtn" onClick={() => setPhase('form')}><IconBack /></button>
            <span className="mblf-toptitle">Review & Terbitkan</span>
            <span className="mblf-topspacer" />
          </div>
          <div className="mblf-body">
            <div className="mblf-rv-card">
              <div className="mblf-rv-top">
                <div className="mblf-rv-job">{form.jabatan || 'Belum diisi'}</div>
                <button className="mblf-rv-edit" onClick={() => setPhase('form')}>Ubah</button>
              </div>
              <div className="mblf-rv-badges">
                {form.levelJabatan && <span className="mblf-rv-badge">{form.levelJabatan}</span>}
                {departemenNama && <span className="mblf-rv-badge">{departemenNama}</span>}
                {form.lokasi && <span className="mblf-rv-badge">{form.lokasi}</span>}
                {form.ikatanKerja && <span className="mblf-rv-badge">{form.ikatanKerja}</span>}
              </div>
              <div className="mblf-rv-divider" />
              <span className="mblf-rv-status">{form.statusRekrutmen}</span>
              <div className="mblf-rv-row"><span>Jumlah Rekrut</span><span>{form.jumlahRekrut ? `${form.jumlahRekrut} orang` : '-'}</span></div>
              <div className="mblf-rv-row"><span>Estimasi Upah</span><span>{form.upahMin || form.upahMax ? `${form.upahMin || '-'} – ${form.upahMax || '-'}` : '-'}</span></div>
              <div className="mblf-rv-row"><span>Tgl Mulai</span><span>{fmtDate(form.tglMulai) || '-'}</span></div>
              <div className="mblf-rv-row"><span>Target Onboard</span><span>{fmtDate(form.tglOnboarding) || '-'}</span></div>
              <div className="mblf-rv-row"><span>Pendidikan Min.</span><span>{form.pendidikan || '-'}</span></div>
              <div className="mblf-rv-row"><span>Pengalaman Min.</span><span>{form.pengalaman ? `${form.pengalaman} Tahun` : '-'}</span></div>
              <div className="mblf-rv-desc-label">Deskripsi</div>
              {form.deskripsi.trim() ? (
                <>
                  <div className={`mblf-rv-desc${descExpanded ? ' expanded' : ''}`} dangerouslySetInnerHTML={{ __html: form.deskripsi }} />
                  <span className="mblf-rv-more" onClick={() => setDescExpanded(v => !v)}>{descExpanded ? 'Sembunyikan' : 'Lihat selengkapnya'}</span>
                </>
              ) : (
                <div className="mblf-rv-desc empty">Belum diisi</div>
              )}
            </div>
            {!isFreePlan && (
              <div className="mblf-ai-hint">
                <IconAi />
                <p>Begitu diterbitkan, <b>kriteria penilaian AI</b> disusun otomatis di latar belakang (±30 detik) — bisa dipantau &amp; diedit di halaman detail lowongan.</p>
              </div>
            )}
          </div>
          <div className="mblf-footer">
            <button className="mblf-btn-ghost" onClick={() => setPhase('form')}>Kembali</button>
            <button className="mblf-btn-primary" disabled={isSaving} onClick={handleSubmitClick}>
              {isSaving ? <IconSpinner /> : <IconCheck />}Terbitkan Lowongan
            </button>
          </div>
        </>
      )}

      {/* ── sheet: pilihan (level/ikatan/siklus/pendidikan/status/departemen) ── */}
      {createPortal(
        <>
          <div className={`msh-sheet-overlay${activeSheet ? ' open' : ''}`} onClick={closeSheet} />
          <div className={`msh-sheet${activeSheet ? ' open' : ''}`}>
            <div className="msh-sheet-handle" />
            {activeSheet === 'status' ? (
              <>
                <div className="mblf-sheet-title">Status Rekrutmen</div>
                {DROPDOWN_OPTIONS.statusRekrutmen.map(opt => {
                  const locked = isFreePlan && !statusOptions.includes(opt);
                  return (
                    <button
                      key={opt}
                      className={`mblf-sheet-opt${locked ? ' locked' : ''}`}
                      onClick={() => { if (locked) return; setField('statusRekrutmen', opt); closeSheet(); }}
                    >
                      <span>{opt}</span>
                      {locked ? <span className="mblf-sheet-lock">Berbayar</span> : form.statusRekrutmen === opt && <IconCheck />}
                    </button>
                  );
                })}
              </>
            ) : activeSheet === 'departemen' ? (
              <>
                <div className="mblf-sheet-title">Pilih Departemen</div>
                {departments.map(d => (
                  <button key={d.id} className="mblf-sheet-opt" onClick={() => { setField('departemen', d.id); closeSheet(); }}>
                    <span>{d.name}</span>
                    {form.departemen === d.id && <IconCheck />}
                  </button>
                ))}
                {newDeptMode ? (
                  <div className="mblf-newdept-row">
                    <input
                      className="mblf-input"
                      placeholder="Nama departemen baru"
                      value={newDeptName}
                      autoFocus
                      onChange={e => setNewDeptName(e.target.value)}
                    />
                    <button
                      className="mblf-newdept-save"
                      disabled={isCreatingDept || !newDeptName.trim()}
                      onClick={async () => { const d = await createNewDepartment(newDeptName); if (d) closeSheet(); }}
                    >
                      {isCreatingDept ? <IconSpinner /> : 'Simpan'}
                    </button>
                  </div>
                ) : (
                  <button className="mblf-sheet-newdept" onClick={() => setNewDeptMode(true)}><IconPlus />Buat Departemen Baru</button>
                )}
              </>
            ) : activeSheet && SELECT_META[activeSheet] ? (
              <>
                <div className="mblf-sheet-title">{SELECT_META[activeSheet].label}</div>
                {SELECT_META[activeSheet].options.map(opt => (
                  <button key={opt} className="mblf-sheet-opt" onClick={() => { setField(activeSheet, opt); closeSheet(); }}>
                    <span>{opt}</span>
                    {form[activeSheet] === opt && <IconCheck />}
                  </button>
                ))}
              </>
            ) : null}
          </div>
        </>,
        document.body
      )}

      <MobileToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
