import { useState, useEffect } from 'react';

// Kotak logo perusahaan dengan cadangan inisial. Logo lowongan eksternal
// berasal dari situs lain (bisa hilang atau memblokir hotlink), jadi kalau
// gambar gagal dimuat kotak otomatis kembali ke inisial berwarna.
export default function CompanyLogoBox({ className, src, alt, color, initials }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  const showImg = !!src && !failed;

  return (
    <div className={`${className}${showImg ? ' has-img' : ''}`} style={{ background: showImg ? '#fff' : color }}>
      {showImg ? (
        <img
          src={src}
          alt={alt || ''}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : initials}
    </div>
  );
}
