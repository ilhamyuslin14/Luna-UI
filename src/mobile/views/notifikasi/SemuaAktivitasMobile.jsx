import { useAuth } from '../../../context/AuthContext.jsx';
import useSemuaAktivitas from '../../../hooks/notifikasi/useSemuaAktivitas.js';
import '../../../../css/mobile/notifikasi/semua-aktivitas.css';

const IconBack = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>);
const IconChevronDown = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
const IconBriefcase = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>);
const IconUserPlus = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>);
const IconChart = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>);
const IconUpload = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
const IconEmpty = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="9" y1="10" x2="15" y2="10" /></svg>);

const TYPE_META = {
  seleksi: { Icon: IconBriefcase, cls: 'seleksi' },
  kandidat: { Icon: IconUserPlus, cls: 'kandidat' },
  scoring: { Icon: IconChart, cls: 'scoring' },
  upload: { Icon: IconUpload, cls: 'upload' },
};

const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateLabel(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const now = new Date();
  if (isSameDay(d, now)) return 'Hari Ini';
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return 'Kemarin';
  return `${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}

// Kelompokkan daftar (sudah terurut terbaru-dulu dari server) jadi bucket
// per label tanggal, berurutan sesuai kemunculan pertama tiap label —
// tidak perlu sort ulang karena datanya sudah urut.
function groupByDate(items) {
  const groups = [];
  let current = null;
  items.forEach(item => {
    const label = dateLabel(item.timestamp);
    if (!current || current.label !== label) {
      current = { label, items: [] };
      groups.push(current);
    }
    current.items.push(item);
  });
  return groups;
}

export default function SemuaAktivitasMobile({ navigate, back, unreadCount, readNotifKeys, markNotifAsRead, markAllAsRead }) {
  const { companyId } = useAuth() || {};
  const { isLoading, activities, visible, hasMore, loadMore } = useSemuaAktivitas(companyId);

  const itemKey = (item, idx) => item.id || item.dateStr || `${item.type}_${item.timestamp}_${idx}`;

  const handleItemClick = (item, idx) => {
    markNotifAsRead(itemKey(item, idx));
    if (item.type === 'seleksi' || item.type === 'scoring') navigate('lowongan_001');
    else if (item.type === 'kandidat' || item.type === 'upload') navigate('kandidat_001');
  };

  const groups = groupByDate(visible);

  return (
    <>
      <div className="sa-head">
        <button className="sa-back" onClick={back}><IconBack /></button>
        <div className="sa-head-text">
          <div className="sa-title">Semua Aktivitas</div>
          {!isLoading && <div className="sa-sub">{activities.length} aktivitas rekrutmen</div>}
        </div>
        {unreadCount > 0 && (
          <button className="sa-mark-all" onClick={markAllAsRead}>Tandai dibaca</button>
        )}
      </div>

      {isLoading ? (
        <div className="sa-list" style={{ paddingTop: 14 }}>
          <div className="msh-skel" style={{ height: 60, marginBottom: 10 }} />
          <div className="msh-skel" style={{ height: 60, marginBottom: 10 }} />
          <div className="msh-skel" style={{ height: 60 }} />
        </div>
      ) : activities.length === 0 ? (
        <div className="sa-empty">
          <div className="sa-empty-icon"><IconEmpty /></div>
          <h3>Belum ada aktivitas</h3>
          <p>Aktivitas rekrutmen seperti lowongan baru, kandidat masuk, dan skoring AI akan muncul di sini.</p>
        </div>
      ) : (
        <>
          {groups.map((group, gi) => (
            <div key={gi}>
              <div className="sa-daterow">{group.label}</div>
              <div className="sa-list">
                {group.items.map((item) => {
                  const idx = visible.indexOf(item);
                  const key = itemKey(item, idx);
                  const isUnread = !readNotifKeys.includes(key) && idx < unreadCount;
                  const meta = TYPE_META[item.type] || TYPE_META.seleksi;
                  return (
                    <button className="sa-item" key={key} onClick={() => handleItemClick(item, idx)}>
                      <div className={`sa-icon ${meta.cls}`}><meta.Icon /></div>
                      <div className="sa-body">
                        <div className="sa-text">{item.text}</div>
                        <span className="sa-time">{item.time}</span>
                      </div>
                      {isUnread && <span className="sa-unread-dot" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="sa-footer">
            {hasMore ? (
              <button className="sa-loadmore" onClick={loadMore}>Muat Lebih Banyak<IconChevronDown /></button>
            ) : (
              <span className="sa-done">Semua aktivitas telah ditampilkan</span>
            )}
          </div>
        </>
      )}
    </>
  );
}
