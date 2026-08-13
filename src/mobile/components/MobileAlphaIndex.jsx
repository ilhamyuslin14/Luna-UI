import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../../css/mobile/shared/alpha-index.css';

// Indikator huruf mengambang ala toast — cuma dipasang saat list ini
// sedang diurutkan berdasarkan nama (asc/desc), dipakai bareng oleh
// Kandidat & tab Kandidat di Lowongan Detail. Bubble nampilin huruf awal
// item paling atas yang lagi kelihatan begitu list discroll, lalu hilang
// sendiri kalau scroll-nya berhenti — tidak ada rail/scrollbar A-Z yang
// nempel terus di layar.
export default function MobileAlphaIndex({ items, getLetter, virtualizer, active }) {
  const hideTimer = useRef(null);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    if (!active) return;
    const el = document.querySelector('.msh-content');
    if (!el) return;
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setScrolling(false), 700);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [active]);

  if (!active || items.length === 0 || !scrolling) return null;

  // getVirtualItems()[0] adalah baris pertama yang di-render virtualizer,
  // tapi baris itu sering ketutup header sticky (judul+search+chip) di atas
  // list — jadi hurufnya gak sesuai sama baris yang kelihatan di layar.
  // Cari baris asli pertama yang muncul di BAWAH tepi header, bukan cuma
  // index pertama virtualizer. Header sticky selalu jadi child pertama
  // `.msh-content` (lihat KandidatMobile/LowonganMobile — head duluan,
  // baru list).
  const virtualItems = virtualizer.getVirtualItems();
  let topIndex = virtualItems[0]?.index ?? 0;
  const scrollEl = document.querySelector('.msh-content');
  const headerEl = scrollEl?.children?.[0];
  if (headerEl) {
    const headerBottom = headerEl.getBoundingClientRect().bottom;
    const rows = scrollEl.querySelectorAll('[data-index]');
    for (const row of rows) {
      if (row.getBoundingClientRect().bottom > headerBottom) {
        topIndex = Number(row.dataset.index);
        break;
      }
    }
  }
  const letter = getLetter(items[topIndex] ?? items[0]);

  return createPortal(<div className="mai-bubble">{letter}</div>, document.body);
}
