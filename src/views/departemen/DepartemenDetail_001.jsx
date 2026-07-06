import { useState } from 'react';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import DepartemenSeleksi_001 from './Departemen-Seleksi_001.jsx';
import DepartemenRingkasan_001 from './Departemen-Ringkasan_001.jsx';

export default function DepartemenDetail_001({ departemen = 'Human Resource', departemenId, navigate, back }) {
  const [activeTab, setActiveTab] = useState('ringkasan');

  return (
    <div className="sd001-view">
      <div className="sd001-title-bar">
        <h1 className="sd001-title">{departemen}</h1>
      </div>

      <TabNav
        tabs={[
          { id: 'ringkasan', label: 'Ringkasan' },
          { id: 'seleksi', label: 'Seleksi' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="sd001-content" style={activeTab === 'seleksi' ? { padding: 0 } : {}}>
        {activeTab !== 'seleksi' && (
          <div style={{ margin: '-20px -20px 0', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center' }}>
            <BackButton onClick={() => back ? back() : navigate('departemen_001')} />
          </div>
        )}
        {activeTab === 'ringkasan' ? (
          <DepartemenRingkasan_001 departemen={departemen} departemenId={departemenId} />
        ) : (
          <DepartemenSeleksi_001 navigate={navigate} departemen={departemen} departemenId={departemenId} onBack={() => back ? back() : navigate('departemen_001')} />
        )}
      </div>
    </div>
  );
}
