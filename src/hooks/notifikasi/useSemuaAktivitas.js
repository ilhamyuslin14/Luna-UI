import { useState, useEffect } from 'react';
import { getAllActivities } from '../../services/dashboardService.js';

const PAGE_SIZE = 20;

// Logic (fetch pool aktivitas lengkap + paginasi sisi klien lewat slice)
// dipakai bareng oleh PopupSemuaAktivitas.jsx (desktop) dan
// SemuaAktivitasMobile.jsx — markup & CSS beda total, sumber data & paginasi
// sama.
export default function useSemuaAktivitas(companyId) {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    setIsLoading(true);
    getAllActivities(companyId)
      .then(data => { if (isMounted) setActivities(data || []); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [companyId]);

  const visible = activities.slice(0, visibleCount);
  const hasMore = visibleCount < activities.length;
  const loadMore = () => setVisibleCount(c => c + PAGE_SIZE);

  return { isLoading, activities, visible, hasMore, loadMore };
}
