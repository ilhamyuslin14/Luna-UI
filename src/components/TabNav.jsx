export default function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="tabnav">
      <div className="tabnav-list">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tabnav-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
