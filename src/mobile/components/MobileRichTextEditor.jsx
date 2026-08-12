import { memo, useRef, useState } from 'react';
import '../../../css/mobile/shared/rich-text-editor.css';

const IconBullet = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></svg>);
const IconNumbered = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="1" y="8.5" fontSize="7" fill="currentColor" stroke="none" fontWeight="800">1</text><text x="1" y="14.5" fontSize="7" fill="currentColor" stroke="none" fontWeight="800">2</text><text x="1" y="20.5" fontSize="7" fill="currentColor" stroke="none" fontWeight="800">3</text></svg>);

// contentEditable memoized total — dibuat sekali dari `initialHtml`, setelah
// itu diam-diam mengabaikan re-render dari parent (`() => true`) supaya caret
// user tidak lompat tiap kali state lain di parent berubah. Kalau parent
// perlu isi editor ke-reset (mis. dibuka ulang buat sesi edit baru), remount
// lewat prop `key` di pemanggilnya — bukan lewat prop initialHtml berubah.
const EditableContent = memo(
  ({ htmlRef, initialHtml, onInput, onBlur }) => (
    <div
      ref={htmlRef}
      contentEditable
      suppressContentEditableWarning
      className="mrte-editor"
      onInput={onInput}
      onBlur={onBlur}
      dangerouslySetInnerHTML={{ __html: initialHtml }}
    />
  ),
  () => true
);

// Dipakai bareng oleh MobileBuatLowonganForm.jsx & LowonganDetailMobile.jsx
// (editor deskripsi pekerjaan) — toolbar + area contentEditable, sama persis
// tampilan & perilakunya di kedua tempat.
export default function MobileRichTextEditor({ editorRef, initialHtml, onInput, onBlur, placeholder }) {
  const savedRangeRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(() => {
    const tmp = document.createElement('div');
    tmp.innerHTML = initialHtml || '';
    return !tmp.textContent.trim();
  });

  const handleInput = (e) => {
    setIsEmpty(e.currentTarget.textContent.trim().length === 0);
    onInput?.(e);
  };

  return (
    <>
      <div className="mrte-toolbar">
        <select
          className="mrte-tb-select"
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
          <option value="h1">Headline 1</option>
          <option value="h2">Headline 2</option>
          <option value="h3">Headline 3</option>
        </select>
        <span className="mrte-tb-sep" />
        {/* onPointerDown (bukan onClick) + preventDefault supaya selection di
            editor tidak hilang duluan sebelum document.execCommand dijalankan. */}
        <button type="button" className="mrte-tb-btn" title="Tebal" onPointerDown={e => { e.preventDefault(); document.execCommand('bold', false, null); }}><b>B</b></button>
        <button type="button" className="mrte-tb-btn" title="Miring" onPointerDown={e => { e.preventDefault(); document.execCommand('italic', false, null); }}><i>I</i></button>
        <span className="mrte-tb-sep" />
        <button type="button" className="mrte-tb-btn" title="Poin" onPointerDown={e => { e.preventDefault(); document.execCommand('insertUnorderedList', false, null); }}><IconBullet /></button>
        <button type="button" className="mrte-tb-btn" title="Bernomor" onPointerDown={e => { e.preventDefault(); document.execCommand('insertOrderedList', false, null); }}><IconNumbered /></button>
      </div>
      <div className="mrte-editor-wrap">
        <EditableContent htmlRef={editorRef} initialHtml={initialHtml} onInput={handleInput} onBlur={onBlur} />
        {isEmpty && <div className="mrte-editor-placeholder">{placeholder}</div>}
      </div>
    </>
  );
}
