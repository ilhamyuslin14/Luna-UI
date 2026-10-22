// Membagikan halaman lowongan ke aplikasi lain, atau menyalin link. `onDone`
// dipanggil dengan 'opened' | 'copied' | 'instagram' (Instagram tidak punya
// share langsung, jadi link disalin untuk ditempel di bio/story).
export function shareLowongan(platform, { url, text }, onDone) {
  const open = (target) => {
    window.open(target, '_blank', 'noopener,noreferrer');
    onDone?.('opened');
  };
  const copy = () => { if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {}); };

  switch (platform) {
    case 'wa': return open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`);
    case 'linkedin': return open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    case 'facebook': return open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    case 'x': return open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    case 'telegram': return open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    case 'instagram': copy(); return onDone?.('instagram');
    default: copy(); return onDone?.('copied');
  }
}
