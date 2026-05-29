import { useState } from 'react';
import DepartemenSeleksi from './Departemen-Seleksi.jsx';
import DepartemenRingkasan from './Departemen-Ringkasan.jsx';

export default function DepartemenDetail({ departemen = 'Human Resource', navigate, back }) {
  const [activeTab, setActiveTab] = useState('ringkasan');

  return (
    <div className="sd-view">
      <div className="sd-title-bar">
        <h1 className="sd-title">{departemen}</h1>
      </div>

      <div className="sd-subnav">
        <div className="sd-tabs">
          <button className={`sd-tab${activeTab === 'ringkasan' ? ' active' : ''}`} onClick={() => setActiveTab('ringkasan')}>Ringkasan</button>
          <button className={`sd-tab${activeTab === 'seleksi' ? ' active' : ''}`} onClick={() => setActiveTab('seleksi')}>Seleksi</button>
        </div>
      </div>

      <div className="sd-content" style={activeTab === 'seleksi' ? { padding: 0 } : {}}>
        {activeTab !== 'seleksi' && (
          <button className="sd-back-btn" onClick={() => back ? back() : navigate('departemen')} style={{ marginBottom: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Kembali
          </button>
        )}
        {activeTab === 'ringkasan' ? (
          <DepartemenRingkasan departemen={departemen} />
        ) : (
          <DepartemenSeleksi navigate={navigate} />
        )}
      </div>
    </div>
  );
}
