import { useState, useRef, useEffect } from 'react';
import { ID_REGIONS } from '../utils/idRegions.js';

const ChevronDown = () => (
  <svg width="8" height="5" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, pointerEvents: 'none' }}>
    <path d="M1 1L5 5L9 1"/>
  </svg>
);

export default function InlineEditRow({
  label,
  tooltip,
  value,
  displayValue,
  type = 'text',
  options = [],
  onSave,
  formatRupiah,
  placeholder = 'Tambahkan data',
  emptyLabel = 'Tambahkan data',
  width = '285px'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState('');
  const [isSaving, setIsSaving]   = useState(false);

  // Tooltip (fixed position)
  const [tooltipPos, setTooltipPos] = useState(null);
  const labelRef = useRef(null);

  // Location autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const inputRef    = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const startEdit = () => { setTempValue(value ?? ''); setIsEditing(true); };
  const cancelEdit = () => { setIsEditing(false); setTempValue(''); setSuggestions([]); };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(tempValue);
      setIsEditing(false);
      setSuggestions([]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
  };

  useEffect(() => {
    if (!isEditing) return;
    const handleClickOutside = (e) => {
      const inContainer = containerRef.current?.contains(e.target);
      const inDropdown  = dropdownRef.current?.contains(e.target);
      if (!inContainer && !inDropdown && !isSaving) cancelEdit();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, isSaving]);

  const handleTooltipShow = () => {
    if (!labelRef.current || !tooltip) return;
    const rect = labelRef.current.getBoundingClientRect();
    setTooltipPos({ top: rect.bottom + 6, left: rect.left });
  };

  const finalDisplayValue = displayValue !== undefined ? displayValue : value;

  // ── Location autocomplete handlers ──
  const handleLocationChange = (query) => {
    setTempValue(query);
    if (!query.trim()) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    setSuggestions(ID_REGIONS.filter(r => r.name.toLowerCase().includes(q)).slice(0, 8));
  };

  const handleLocationSelect = async (s) => {
    const val = s.type === 'city' && s.province ? `${s.name}, ${s.province}` : s.name;
    setSuggestions([]);
    setTempValue(val);
    setIsSaving(true);
    try { await onSave(val); setIsEditing(false); }
    finally { setIsSaving(false); }
  };

  const showLocDropdown = type === 'location' && isEditing && tempValue.trim().length >= 1;
  const locInputRect    = showLocDropdown && inputRef.current ? inputRef.current.getBoundingClientRect() : null;

  // ── Label with tooltip ──
  const LabelEl = (
    <div
      ref={labelRef}
      className="inline-edit-label"
      style={tooltip ? { cursor: 'default' } : undefined}
      onMouseEnter={tooltip ? handleTooltipShow : undefined}
      onMouseLeave={tooltip ? () => setTooltipPos(null) : undefined}
    >
      {label}
    </div>
  );

  const TooltipEl = tooltipPos && tooltip && (
    <div
      style={{
        position: 'fixed',
        top: tooltipPos.top,
        left: tooltipPos.left,
        zIndex: 99999,
        background: '#fff',
        border: '1px solid #e2e5ec',
        borderRadius: 8,
        padding: '7px 11px',
        fontSize: 11,
        color: '#555f71',
        lineHeight: 1.5,
        width: 220,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        pointerEvents: 'none',
      }}
    >
      {tooltip}
    </div>
  );

  // ── View mode ──
  if (!isEditing) {
    return (
      <>
        <div className="inline-edit-row" ref={containerRef}>
          {LabelEl}
          <span
            className={`inline-edit-value ${finalDisplayValue ? 'editable' : 'add-data'}`}
            style={{ width }}
            onClick={startEdit}
            title={finalDisplayValue ? 'Klik untuk mengedit' : undefined}
          >
            {finalDisplayValue ? (
              <>
                <span className="inline-edit-text">{finalDisplayValue}</span>
                <svg className="inline-edit-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              </>
            ) : (
              <>
                {emptyLabel}
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <circle cx="8.5" cy="8.5" r="7.5" stroke="var(--luna-orange-400)" strokeWidth="1"/>
                  <path d="M8.5 5.5v6M5.5 8.5h6" stroke="var(--luna-orange-400)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </>
            )}
          </span>
        </div>
        {TooltipEl}
      </>
    );
  }

  // ── Edit mode: build inputEl ──
  let inputEl;

  if (type === 'location') {
    inputEl = (
      <input
        ref={inputRef}
        type="text"
        className="inline-edit-input"
        style={{ flex: 1, minWidth: 0, height: '32px', margin: 0 }}
        value={tempValue}
        onChange={e => handleLocationChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ketik nama kota atau provinsi..."
        autoFocus
        disabled={isSaving}
      />
    );
  } else if (type === 'dropdown') {
    inputEl = (
      <div className="inline-edit-select-wrap" style={{ flex: 1, height: '32px' }}>
        <select
          className="inline-edit-select"
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
        >
          <option value="" disabled>Pilih {label}</option>
          {options.map(opt => {
            if (typeof opt === 'object') return <option key={opt.id} value={opt.id}>{opt.name}</option>;
            return <option key={opt} value={opt}>{opt}</option>;
          })}
        </select>
        <ChevronDown />
      </div>
    );
  } else if (type === 'select') {
    inputEl = (
      <div className="sd-select-wrapper inline-editor-select">
        <select className="sd-input" value={tempValue} onChange={e => setTempValue(e.target.value)} autoFocus>
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((opt, i) => {
            const val = typeof opt === 'object' ? opt.id : opt;
            const text = typeof opt === 'object' ? opt.name : opt;
            return <option key={i} value={val}>{text}</option>;
          })}
        </select>
        <ChevronDown />
      </div>
    );
  } else if (type === 'date') {
    inputEl = (
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="date"
          className="inline-edit-input inline-edit-input--date"
          style={{ width: '100%', height: '32px', boxSizing: 'border-box' }}
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={isSaving}
        />
      </div>
    );
  } else if (type === 'number') {
    inputEl = (
      <input
        type="number"
        min="0"
        className="inline-edit-input"
        style={{ flex: 1, minWidth: 0, height: '32px', margin: 0 }}
        value={tempValue}
        onChange={e => setTempValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="0"
        autoFocus
        disabled={isSaving}
      />
    );
  } else if (type === 'textarea') {
    inputEl = (
      <textarea
        className="inline-edit-input inline-edit-textarea"
        style={{ flex: 1, minWidth: 0, minHeight: '80px', height: 'auto', padding: '10px 12px', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit' }}
        value={tempValue}
        onChange={e => setTempValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); } }}
        placeholder={placeholder}
        autoFocus
        disabled={isSaving}
      />
    );
  } else if (type === 'tel') {
    inputEl = (
      <input
        type="tel"
        className="inline-edit-input"
        style={{ flex: 1, minWidth: 0, height: '32px', margin: 0 }}
        value={tempValue}
        onChange={e => setTempValue(e.target.value.replace(/[^0-9+\-\s()]/g, ''))}
        onKeyDown={handleKeyDown}
        placeholder="Contoh: 08123456789"
        autoFocus
        disabled={isSaving}
      />
    );
  } else {
    inputEl = (
      <input
        type="text"
        className="inline-edit-input"
        style={{ flex: 1, minWidth: 0, height: '32px', margin: 0 }}
        value={tempValue}
        onChange={e => {
          let val = e.target.value;
          if (formatRupiah) {
            const num = val.replace(/[^0-9]/g, '');
            val = num ? formatRupiah(num) : '';
          }
          setTempValue(val);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus
        disabled={isSaving}
      />
    );
  }

  const SaveCancelBtns = (
    <>
      <button className="inline-action-btn cancel" onClick={cancelEdit} title="Batal" disabled={isSaving}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 10.5L10.5 3.5M3.5 3.5l7 7"/>
        </svg>
      </button>
      <button className="inline-action-btn save" onClick={handleSave} title="Simpan" disabled={isSaving}>
        {isSaving ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.8 7l2.8 2.8 5.6-5.6"/>
          </svg>
        )}
      </button>
    </>
  );

  return (
    <>
      <div className="inline-edit-row" ref={containerRef}>
        {LabelEl}
        <div className="inline-edit-input-group" style={{ width, flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
          {inputEl}
          {SaveCancelBtns}
        </div>
      </div>

      {/* Location dropdown — fixed position to avoid clipping */}
      {showLocDropdown && locInputRect && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: locInputRect.bottom + 4,
            left: locInputRect.left,
            width: locInputRect.width,
            background: '#fff',
            border: '1px solid #d4d9e6',
            borderRadius: 8,
            zIndex: 99999,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {suggestions.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: 13, color: '#abb2c1' }}>Tidak ada kota/daerah ditemukan</div>
          ) : suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={e => { e.preventDefault(); handleLocationSelect(s); }}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#323b4d',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                borderBottom: i < suggestions.length - 1 ? '1px solid #f0f2f5' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f4fafe'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>{s.name}{s.province ? `, ${s.province}` : ''}</span>
              <span style={{ fontSize: 10, color: '#abb2c1', flexShrink: 0 }}>
                {s.type === 'city' ? 'Kota/Kab' : 'Provinsi'}
              </span>
            </div>
          ))}
        </div>
      )}

      {TooltipEl}
    </>
  );
}
