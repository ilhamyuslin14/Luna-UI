import { useVirtualizer } from '@tanstack/react-virtual';

// Virtualisasi list mobile lewat container scroll bersama `.msh-content`
// (lihat MobileApp.jsx) — bukan tiap list punya box scroll sendiri, karena
// seluruh laman mobile memang scroll lewat satu div itu. `estimateSize`
// boleh kasar; tinggi asli tiap baris diukur otomatis lewat
// `virtualizer.measureElement` yang dipasang sebagai ref di setiap baris.
export default function useVirtualizedList(count, estimateSize = 140) {
  return useVirtualizer({
    count,
    getScrollElement: () => document.querySelector('.msh-content'),
    estimateSize: () => estimateSize,
    overscan: 6,
  });
}
