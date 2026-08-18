export default function MobileNotifications({
  open,
  onClose,
  onViewAll,
  navigate,
  notifications,
  isNotifLoading,
  unreadCount,
  readNotifKeys,
  markNotifAsRead,
  markAllAsRead,
}) {
  const handleItemClick = (item, key) => {
    markNotifAsRead(key);
    onClose();
    if (item.type === 'seleksi' || item.type === 'scoring') navigate('lowongan_001');
    else if (item.type === 'kandidat' || item.type === 'upload') navigate('kandidat_001');
  };

  return (
    <>
      <div className={`msh-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`msh-notif-sheet${open ? ' open' : ''}`}>
        <div className="msh-notif-handle" />
        <div className="msh-notif-head">
          <div className="msh-notif-title-wrap">
            <span className="msh-notif-title">Notifikasi</span>
            <span className="msh-notif-count">{notifications.length} Aktivitas</span>
          </div>
          {unreadCount > 0 && (
            <button className="msh-notif-mark-all" onClick={markAllAsRead}>Tandai dibaca</button>
          )}
        </div>
        <div className="msh-notif-list">
          {isNotifLoading ? (
            <div className="msh-notif-empty">Memuat notifikasi terbaru...</div>
          ) : notifications.length === 0 ? (
            <div className="msh-notif-empty">Belum ada aktivitas rekrutmen terbaru.</div>
          ) : (
            notifications.map((item, idx) => {
              const itemKey = item.id || item.dateStr || `${item.type}_${item.timestamp}_${idx}`;
              const isRead = readNotifKeys.includes(itemKey);
              const isUnread = !isRead && idx < unreadCount;
              return (
                <button
                  key={idx}
                  className={`msh-notif-item ${isUnread ? 'unread' : 'read'}`}
                  onClick={() => handleItemClick(item, itemKey)}
                >
                  <span className={isUnread ? 'msh-notif-dot-unread' : 'msh-notif-dot-read'} />
                  <span className="msh-notif-body">
                    <span className="msh-notif-row">
                      <span className="msh-notif-text">{item.text}</span>
                      {isUnread && <span className="msh-notif-new-badge">BARU</span>}
                    </span>
                    <span className="msh-notif-time">{item.time}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
        {!isNotifLoading && notifications.length > 0 && (
          <button className="msh-notif-footer" onClick={onViewAll}>Lihat Semua Aktivitas</button>
        )}
      </div>
    </>
  );
}
