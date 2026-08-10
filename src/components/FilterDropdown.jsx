import { useState, useRef, useEffect } from 'react';

export default function FilterDropdown({ groups, activeFilters, onToggle, isOpen, onToggleOpen }) {
  const hasActive = activeFilters.size > 0;
  const [openGroups, setOpenGroups] = useState(() => new Set([0]));
  const wasOpen = useRef(false);

  // Setiap kali panel dibuka, pastikan grup yang punya filter aktif ikut kebuka
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setOpenGroups(prev => {
        const next = new Set(prev);
        groups.forEach((group, gi) => {
          if (group.options.some(opt => activeFilters.has(opt))) next.add(gi);
        });
        return next;
      });
    }
    wasOpen.current = isOpen;
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleGroup = (gi) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(gi) ? next.delete(gi) : next.add(gi);
      return next;
    });
  };

  const resetAll = () => {
    [...activeFilters].forEach(opt => onToggle(opt));
  };

  return (
    <div className="filter-dropdown-container">
      <button
        className={`filter-dropdown-btn${(isOpen || hasActive) ? ' active' : ''}`}
        onClick={onToggleOpen}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1.75 3.5H12.25M3.5 7H10.5M5.25 10.5H8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Filter
        {hasActive && <span className="filter-dropdown-count-badge">{activeFilters.size}</span>}
      </button>
      {isOpen && (
        <div className="filter-dropdown-panel" onClick={e => e.stopPropagation()}>
          {groups.map((group, gi) => {
            const activeInGroup = group.options.filter(opt => activeFilters.has(opt)).length;
            const isGroupOpen = openGroups.has(gi);
            return (
              <div key={group.title} className={`filter-dropdown-group${isGroupOpen ? ' open' : ' collapsed'}`}>
                <button type="button" className="filter-dropdown-group-head" onClick={() => toggleGroup(gi)}>
                  <span className="filter-dropdown-group-head-left">
                    <span className="filter-dropdown-col-title">{group.title}</span>
                    {activeInGroup > 0 && <span className="filter-dropdown-group-count">{activeInGroup}</span>}
                  </span>
                  <svg className="filter-dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isGroupOpen && (
                  <div className="filter-dropdown-group-body">
                    {group.options.map(opt => (
                      <label key={opt} className="filter-dropdown-item">
                        <input
                          type="checkbox"
                          className="filter-dropdown-checkbox"
                          checked={activeFilters.has(opt)}
                          onChange={() => onToggle(opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {hasActive && (
            <div className="filter-dropdown-foot">
              <button type="button" className="filter-dropdown-reset" onClick={resetAll}>Reset semua</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
