export default function FilterDropdown({ groups, activeFilters, onToggle, isOpen, onToggleOpen }) {
  const hasActive = activeFilters.size > 0;

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
      </button>
      {isOpen && (
        <div className="filter-dropdown" onClick={e => e.stopPropagation()}>
          {groups.map((group, gi) => (
            <div key={gi} className="filter-dropdown-group-wrap">
              {gi > 0 && <div className="filter-dropdown-divider-v" />}
              <div className="filter-dropdown-col">
                <span className="filter-dropdown-col-title">{group.title}</span>
                {group.options.map((opt, oi) => (
                  <div key={opt}>
                    <label className="filter-dropdown-item">
                      <input
                        type="checkbox"
                        className="filter-dropdown-checkbox"
                        checked={activeFilters.has(opt)}
                        onChange={() => onToggle(opt)}
                      />
                      <span>{opt}</span>
                    </label>
                    {oi < group.options.length - 1 && <div className="filter-dropdown-divider-h" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
