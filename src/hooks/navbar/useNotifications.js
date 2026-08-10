import { useState, useEffect } from 'react';
import { getRecentActivities, getUnreadActivityCount } from '../../services/dashboardService.js';

export default function useNotifications(companyId) {
  const [notifications, setNotifications] = useState([]);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialWatermark, setInitialWatermark] = useState(null);
  const [readNotifKeys, setReadNotifKeys] = useState(() => {
    try {
      const saved = localStorage.getItem(`luna_read_notifs_${companyId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;

    const fetchNotifs = async () => {
      try {
        const data = await getRecentActivities(companyId);
        if (isMounted) setNotifications(data || []);

        const seenKey = `luna_notif_seen_${companyId}`;
        let lastSeenAt = localStorage.getItem(seenKey);
        if (!lastSeenAt) {
          lastSeenAt = new Date().toISOString();
          localStorage.setItem(seenKey, lastSeenAt);
        }
        if (isMounted) setInitialWatermark(lastSeenAt);

        const count = await getUnreadActivityCount(companyId, lastSeenAt);
        if (isMounted) setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        if (isMounted) setIsNotifLoading(false);
      }
    };

    fetchNotifs();

    // Auto update on activity_updated custom event + gentle 10s background polling
    const handleUpdate = () => fetchNotifs();
    window.addEventListener('luna:activity_updated', handleUpdate);
    const timer = setInterval(fetchNotifs, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener('luna:activity_updated', handleUpdate);
      clearInterval(timer);
    };
  }, [companyId]);

  // Dipanggil saat panel notifikasi ditutup — reset watermark & badge unread
  const markSeen = () => {
    if (!companyId) return;
    const nowIso = new Date().toISOString();
    localStorage.setItem(`luna_notif_seen_${companyId}`, nowIso);
    setInitialWatermark(nowIso);
    setUnreadCount(0);
  };

  const markNotifAsRead = (key) => {
    if (!key) return;
    setReadNotifKeys(prev => {
      if (prev.includes(key)) return prev;
      const updated = [...prev, key];
      if (companyId) localStorage.setItem(`luna_read_notifs_${companyId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    const allKeys = notifications.map((item, idx) => item.id || item.dateStr || `${item.type}_${item.timestamp}_${idx}`);
    setReadNotifKeys(allKeys);
    if (companyId) {
      localStorage.setItem(`luna_read_notifs_${companyId}`, JSON.stringify(allKeys));
      localStorage.setItem(`luna_notif_seen_${companyId}`, new Date().toISOString());
    }
    setUnreadCount(0);
  };

  return {
    notifications,
    isNotifLoading,
    unreadCount,
    initialWatermark,
    readNotifKeys,
    markSeen,
    markNotifAsRead,
    markAllAsRead,
  };
}
