import { useEffect } from 'react';
import '../../css/landing/scroll-reveal.css';

// Animasi masuk saat di-scroll untuk halaman landing (kelas lp003-*): tiap SECTION (selain hero) mulai tersembunyi,
// lalu muncul utuh sebagai satu kesatuan begitu bagian atasnya masuk layar. Hero dianimasikan sekali saat halaman dibuka
// (lewat CSS). Dilewati bila pengguna memilih "kurangi gerakan" atau peramban tak punya IntersectionObserver.
// `deps`: nilai yang saat berubah memunculkan section baru (mis. lowongan terbaru yang baru selesai dimuat); section
// yang sudah tampil tidak disembunyikan lagi.
export default function useScrollReveal(rootRef, deps = []) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const kurangiGerak = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (kurangiGerak || typeof IntersectionObserver === 'undefined') return undefined;

    const io = new IntersectionObserver((entri) => {
      entri.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('rv-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

    root.querySelectorAll(':scope > section:not(.lp003-hero), :scope > footer').forEach((bagian) => {
      if (bagian.classList.contains('rv-in')) return;
      bagian.classList.add('rv');
      io.observe(bagian);
    });

    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, ...deps]);
}
