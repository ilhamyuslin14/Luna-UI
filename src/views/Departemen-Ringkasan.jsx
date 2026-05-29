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

export default function DepartemenRingkasan({ departemen = 'Human Resource' }) {
  return (
    <div className="sd-columns" style={{ width: '569px', maxWidth: '100%' }}>
      <div className="sd-col-left" style={{ width: '100%', flex: 'none' }}>
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title uppercase" style={{ textTransform: 'uppercase', letterSpacing: '0.65px', fontSize: '13px' }}>Details</span>
            <button className="sd-edit-btn"><EditIcon /> Edit</button>
          </div>
          <div className="sd-detail-rows">
            <div className="sd-detail-row">
              <span className="sd-detail-label">Departement Name</span>
              <span className="sd-detail-value" style={{ color: '#323b4d', fontWeight: 400 }}>{departemen}</span>
            </div>
            {[
              'Departement Website',
              'Departement Industry',
              'Departement Location',
              'Departement Address',
              'Contact'
            ].map((label) => (
              <div className="sd-detail-row" key={label}>
                <span className="sd-detail-label">{label}</span>
                <span className="sd-detail-value add-data">
                  Tambahkan data <AddIcon />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title uppercase" style={{ textTransform: 'uppercase', letterSpacing: '0.65px', fontSize: '13px' }}>Description</span>
            <button className="sd-edit-btn"><EditIcon /> Edit</button>
          </div>
          <div className="sd-detail-rows">
            <div className="sd-detail-row" style={{ borderBottom: 'none' }}>
              <span className="sd-detail-label">Departement Description</span>
              <span className="sd-detail-value add-data">
                Tambahkan data <AddIcon />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
