import { useState } from 'react';
import BackButton from '../../components/BackButton.jsx';
import TabNav from '../../components/TabNav.jsx';
import DepartemenLowongan from './Departemen-Lowongan.jsx';
import DepartemenRingkasan from './Departemen-Ringkasan.jsx';

export default function DepartemenDetail({ departemen = 'Human Resource', navigate, back }) {
  const [activeTab, setActiveTab] = useState('ringkasan');

  return (
    <div className="sd-view">
      <div className="sd-title-bar">
        <h1 className="sd-title">{departemen}</h1>
      </div>

      <TabNav
        tabs={[
          { id: 'ringkasan', label: 'Ringkasan' },
          { id: 'seleksi', label: 'Seleksi' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="sd-content" style={activeTab === 'seleksi' ? { padding: 0 } : {}}>
        {activeTab !== 'seleksi' && (
          <div style={{ margin: '-20px -20px 0', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center' }}>
            <BackButton onClick={() => back ? back() : navigate('departemen')} />
          </div>
        )}
        {activeTab === 'ringkasan' ? (
          <DepartemenRingkasan departemen={departemen} />
        ) : (
          <DepartemenLowongan navigate={navigate} departemen={departemen} onBack={() => back ? back() : navigate('departemen')} />
        )}
      </div>
    </div>
  );
}
