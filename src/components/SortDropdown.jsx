import { useRef, useEffect } from 'react';

const SortSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
    <line x1="15" y1="18" x2="15" y2="6"></line>
    <polyline points="11 10 15 6 19 10"></polyline>
    <line x1="9" y1="6" x2="9" y2="18"></line>
    <polyline points="5 14 9 18 13 14"></polyline>
  </svg>
);

const CheckSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function SortDropdown({ options, activeSort, onSortChange, isOpen, onToggleOpen }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) onToggleOpen();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggleOpen]);

  // Find active label and default sort value
  const activeLabel = options.find(opt => opt.value === activeSort)?.label || 'Urutkan';
  const defaultSortValue = options[0]?.value;
  const isSortActive = activeSort !== defaultSortValue;

  return (
    <div className="filter-dropdown-container sort-dropdown-container" ref={dropdownRef}>
      <button
        className={`filter-dropdown-btn${(isOpen || isSortActive) ? ' active' : ''}`}
        onClick={onToggleOpen}
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <SortSvg />
          Urutkan
        </span>
      </button>

      {isOpen && (
        <div className="filter-dropdown" onClick={e => e.stopPropagation()} style={{ right: 0, left: 'auto', minWidth: 200, padding: 0 }}>
          <div className="filter-dropdown-group-wrap" style={{ display: 'block' }}>
            <div className="filter-dropdown-col" style={{ width: '100%', padding: '12px 16px' }}>
              <span className="filter-dropdown-col-title" style={{ display: 'block', marginBottom: 12 }}>URUTKAN BERDASARKAN</span>
              {options.map((opt, oi) => (
                <div key={opt.value}>
                  <label className="filter-dropdown-item" style={{ marginBottom: oi < options.length - 1 ? 8 : 0 }}>
                    <input
                      type="checkbox"
                      className="filter-dropdown-checkbox"
                      checked={activeSort === opt.value}
                      onChange={() => {
                        onSortChange(opt.value);
                        onToggleOpen();
                      }}
                    />
                    <span>{opt.label}</span>
                  </label>
                  {oi < options.length - 1 && <div className="filter-dropdown-divider-h" style={{ margin: '8px -16px' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
