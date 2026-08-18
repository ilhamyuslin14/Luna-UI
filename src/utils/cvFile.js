// File CV di storage dinamai pakai timestamp+random (lihat kandidatService.js),
// bukan nama aslinya — jadi nama file yang ditampilkan/diunduh selalu
// dibentuk dari nama kandidat, bukan diambil mentah dari URL storage.
export function cvFileName(cvUrl, nama) {
  const ext = cvUrl.split('.').pop().split('?')[0] || 'pdf';
  const safeName = (nama || 'Kandidat').replace(/[^a-zA-Z0-9]/g, '_');
  return `CV_${safeName}.${ext}`;
}

export async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download failed, using fallback', err);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
