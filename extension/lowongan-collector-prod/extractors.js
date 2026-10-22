// Dijalankan DI DALAM halaman lowongan lewat chrome.scripting.executeScript,
// jadi fungsinya harus berdiri sendiri (tidak boleh memakai variabel di luar).
// Hanya mengambil teks mentah; pengolahannya ada di parsers.js.
export function extractJobstreetRaw() {
  // Di tampilan panel, daftar lowongan di sebelahnya memakai penanda yang sama
  // (mis. company-logo per kartu). Semua pencarian dibatasi ke panel detail
  // supaya yang terbaca selalu milik lowongan yang sedang dibuka.
  // Area detail: halaman penuh punya jobDetailsPage; tampilan panel atau laci
  // (drawer) di beranda TIDAK punya, jadi dipakai wadah terkecil yang memuat
  // judul sekaligus deskripsi lowongan.
  const titleNode = document.querySelector('[data-automation="job-detail-title"]');
  const descNode = document.querySelector('[data-automation="jobAdDetails"]');
  let detailRoot = document.querySelector('[data-automation="jobDetailsPage"]');
  if (!detailRoot && titleNode && descNode) {
    let node = titleNode;
    while (node && node !== document.body && !node.contains(descNode)) node = node.parentElement;
    if (node && node !== document.body) detailRoot = node;
  }
  const q = (name) => (detailRoot || document).querySelector(`[data-automation="${name}"]`);
  const textOf = (el) => (el ? el.innerText.trim() : null);

  const desc = q('jobAdDetails');
  const page = detailRoot || document.body;

  // Gaji & tanggal posting tidak punya penanda data-automation: cari elemen
  // pendek yang teksnya diawali pola khas, dan (untuk gaji) berada sebelum
  // blok deskripsi supaya tidak tertukar dengan pertanyaan lamaran di bawahnya.
  const beforeDesc = (el) => !desc || (el.compareDocumentPosition(desc) & Node.DOCUMENT_POSITION_FOLLOWING);
  const pickShortest = (list) => {
    const sorted = [...list].sort((a, b) => a.textContent.length - b.textContent.length);
    return sorted[0] ? sorted[0].textContent.trim() : null;
  };
  const candidates = (regex, mustBeBeforeDesc) => [...page.querySelectorAll('span,div,p')].filter(el => {
    const t = el.textContent.trim();
    return t.length < 120 && regex.test(t) && (!mustBeBeforeDesc || beforeDesc(el));
  });
  const shortest = (regex, mustBeBeforeDesc) => pickShortest(candidates(regex, mustBeBeforeDesc));

  // Gaji: utamakan baris berangka yang menyebut periode ("per month"/"per bulan"),
  // lalu baris berangka lain, baru teks seperti "Gaji tidak ditampilkan". Kata
  // "Gaji" saja (label) sengaja tidak dihitung.
  // Baris gaji lowongan = baris pertama setelah baris ikatan kerja. Ada blok
  // lain di halaman (mis. informasi gaji pasar) dengan format sama, jadi
  // "paling pendek" saja tidak cukup — urutan di halaman yang menentukan.
  const workEl = q('job-detail-work-type');
  const afterWork = (el) => !workEl || (workEl.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  const periodRe = /per\s+(month|bulan|year|tahun|week|minggu|day|hari|hour|jam)/i;
  const numeric = candidates(/^(Rp|IDR)\s*\d/i, true).filter(afterWork);
  let salaryText = null;
  if (numeric.length) {
    const first = numeric[0];
    const inside = numeric.filter(el => first.contains(el));
    const withPeriod = inside.filter(el => periodRe.test(el.textContent));
    salaryText = pickShortest(withPeriod.length ? withPeriod : inside);
  } else {
    salaryText = pickShortest(candidates(/^Gaji\s+\S/i, true).filter(afterWork));
  }

  // Petunjuk ID lowongan untuk tampilan panel (URL halaman = daftar pencarian).
  const hrefs = [];
  const applyEl = q('job-detail-apply');
  const applyHref = applyEl ? (applyEl.href || applyEl.querySelector('a')?.href || null) : null;
  if (applyHref) hrefs.push(applyHref);
  page.querySelectorAll('a[href*="/job/"]').forEach(a => { if (hrefs.length < 6) hrefs.push(a.href); });

  const BLOCK = new Set(['P', 'DIV', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SECTION', 'TABLE', 'TR']);
  const walk = (node, out) => {
    if (node.nodeType === 3) { out.push(node.textContent.replace(/\s+/g, ' ')); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName;
    if (tag === 'BR') { out.push('\n'); return; }
    if (tag === 'LI') {
      const inner = [];
      node.childNodes.forEach(c => walk(c, inner));
      out.push('\n- ' + inner.join('').replace(/\s+/g, ' ').trim());
      return;
    }
    const block = BLOCK.has(tag);
    if (block) out.push('\n\n');
    node.childNodes.forEach(c => walk(c, out));
    if (block) out.push('\n\n');
  };
  let description = null;
  if (desc) {
    const out = [];
    walk(desc, out);
    description = out.join('').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  // Logo perusahaan. Hanya gambar DI ATAS judul dalam area detail yang dipakai:
  // gambar di bawah judul milik kartu lowongan lain ("Lowongan pilihan", dll).
  // Urutan, dari yang paling pasti:
  //   1. alt memuat nama perusahaan (mis. "FeiHe Internasional Indonesia logo")
  //   2. gambar di dalam penanda company-logo (halaman penuh / laci beranda)
  //   3. gambar kecil (maks 300x300 tampil) terdekat di atas judul, supaya
  //      banner besar tidak terambil
  // Tidak ada yang cocok -> kosong (tampil inisial), bukan salah perusahaan.
  const isHttp = (u) => /^https?:/i.test(u || '') && String(u).includes('://');
  const imgSrc = (img) => img.currentSrc || img.src || '';
  const above = (el) => titleNode && (el.compareDocumentPosition(titleNode) & Node.DOCUMENT_POSITION_FOLLOWING);
  let logoImg = null;
  if (detailRoot && titleNode) {
    const company = (textOf(q('advertiser-name')) || '').toLowerCase();
    const imgsAbove = [...detailRoot.querySelectorAll('img')].filter(i => above(i) && isHttp(imgSrc(i)));

    logoImg = (company && imgsAbove.find(i => (i.alt || '').toLowerCase().includes(company))) || null;

    if (!logoImg) {
      const marked = [...detailRoot.querySelectorAll('[data-automation="company-logo"]')].filter(above);
      const holder = marked[marked.length - 1];
      const img = holder ? (holder.tagName === 'IMG' ? holder : holder.querySelector('img')) : null;
      if (img && isHttp(imgSrc(img))) logoImg = img;
    }

    if (!logoImg) {
      logoImg = [...imgsAbove].reverse().find(i => {
        const r = i.getBoundingClientRect();
        return r.width > 0 && r.width <= 300 && r.height > 0 && r.height <= 300;
      }) || null;
    }
  }
  const logoUrl = logoImg ? imgSrc(logoImg) : null;

  return {
    logoUrl,
    title: textOf(q('job-detail-title')),
    company: textOf(q('advertiser-name')),
    location: textOf(q('job-detail-location')),
    classification: textOf(q('job-detail-classifications')),
    workType: textOf(q('job-detail-work-type')),
    salaryText,
    postedText: shortest(/^Diposting\b/i, false),
    description,
    hrefs,
  };
}
