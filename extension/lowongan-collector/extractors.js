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
    // Butir bernomor/bullet yang masing-masing ditulis sebagai paragraf terpisah menghasilkan
    // baris kosong di antaranya; dirapatkan supaya terbaca sebagai satu daftar.
    const isItem = (l) => /^\s*(\d+[.)]|[-•*])\s/.test(l);
    const rows = description.split('\n');
    description = rows.filter((l, i) => {
      if (l.trim()) return true;
      const prev = rows.slice(0, i).reverse().find(x => x.trim());
      const next = rows.slice(i + 1).find(x => x.trim());
      return !(prev && next && isItem(prev) && isItem(next));
    }).join('\n');
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

  // Profil perusahaan: hanya bidang dan jumlah karyawan. Penanda data-automation-nya tidak
  // diketahui, jadi dicari lewat teks: judul "Profil perusahaan", lalu baris berpola
  // "101-1,000 employees"; bidang = baris tepat sebelum baris itu (selain judul dan nama perusahaan).
  let companyIndustry = null;
  let companySize = null;
  try {
    const sizeRe = /^\s*[\d.,]+(?:\s*[-–]\s*[\d.,]+)?\+?\s*(employees|karyawan|pegawai)\s*$/i;
    const headRe = /^\s*(profil perusahaan|company profile)\s*$/i;
    const isLeaf = (el) => !el.children.length && el.textContent.trim();
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"],span,div,p')]
      .filter(el => isLeaf(el) && headRe.test(el.textContent));
    for (const head of headings) {
      let box = head.parentElement;
      let leaves = [];
      while (box && box !== document.body) {
        leaves = [...box.querySelectorAll('*')].filter(isLeaf);
        if (leaves.some(el => sizeRe.test(el.textContent))) break;
        box = box.parentElement;
      }
      if (!box || box === document.body) continue;
      const sizeIdx = leaves.findIndex(el => sizeRe.test(el.textContent));
      companySize = leaves[sizeIdx].textContent.trim();
      const companyName = (textOf(q('advertiser-name')) || '').toLowerCase();
      for (let i = sizeIdx - 1; i >= 0; i--) {
        const t = leaves[i].textContent.trim();
        if (!t || headRe.test(t) || t.length > 120 || t.toLowerCase() === companyName) continue;
        if (leaves[i] === head) break;
        companyIndustry = t;
        break;
      }
      break;
    }
  } catch { /* profil perusahaan hanya tambahan */ }

  return {
    companyIndustry,
    companySize,
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

// Glints: halaman lowongan dikirim lengkap dari server, dan memuat data terstruktur schema.org "JobPosting"
// (JSON-LD). Itu sumber utama karena tidak ikut berubah saat tampilan Glints diubah; nama kelas CSS Glints
// di-hash dan sering berganti, jadi DOM hanya dipakai untuk yang tidak ada di JSON-LD (kategori, ukuran perusahaan, gaji bila tampil).
// Mengembalikan null bila halaman ini bukan halaman lowongan Glints.
export function extractGlintsRaw(doc = document, pathname = globalThis.location.pathname) {
  const UUID = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const titleEl = doc.querySelector('h1[aria-label="Job Title"]');
  const idFromPath = (pathname.match(/\/opportunities\/jobs\/[^/]+\/([0-9a-f-]{36})/i) || [])[1] || null;
  const idFromAttr = doc.querySelector('[data-gtm-job-id]')?.getAttribute('data-gtm-job-id') || null;
  const externalId = [idFromPath, idFromAttr].find((v) => v && UUID.test(v)) || null;
  if (!titleEl || !externalId) return null;

  let ld = null;
  for (const tag of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const j = JSON.parse(tag.textContent);
      const list = Array.isArray(j) ? j : [j];
      const found = list.find((x) => x && x['@type'] === 'JobPosting');
      if (found) { ld = found; break; }
    } catch { /* blok JSON-LD lain atau rusak */ }
  }
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  // Deskripsi: dari DOM (sudah berupa HTML bersih) diubah ke teks dengan butir "- ", sama seperti JobStreet.
  const BLOCK = new Set(['P', 'DIV', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SECTION', 'TABLE', 'TR']);
  const walk = (node, out) => {
    if (node.nodeType === 3) { out.push(node.textContent.replace(/\s+/g, ' ')); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName;
    if (tag === 'BR') { out.push('\n'); return; }
    if (tag === 'LI') {
      const inner = [];
      node.childNodes.forEach((c) => walk(c, inner));
      out.push('\n- ' + inner.join('').replace(/\s+/g, ' ').trim());
      return;
    }
    const block = BLOCK.has(tag);
    if (block) out.push('\n\n');
    node.childNodes.forEach((c) => walk(c, out));
    if (block) out.push('\n\n');
  };
  const toText = (node) => {
    const out = [];
    walk(node, out);
    return out.join('').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  };
  let description = null;
  const descBox = doc.querySelector('[aria-label="Job Description"] [class*="DescriptionContainer"]');
  if (descBox) description = toText(descBox);
  if (!description && ld?.description) {
    const holder = doc.createElement('div');
    holder.innerHTML = ld.description;
    description = toText(holder);
  }

  // Jenis kerja: nilai schema.org → istilah yang dikenali mapEmployment().
  const JENIS = { FULL_TIME: 'Full time', PART_TIME: 'Part time', CONTRACTOR: 'Kontrak', TEMPORARY: 'Temporer', INTERN: 'Magang', VOLUNTEER: 'Freelance', OTHER: 'Full time' };
  const empLd = Array.isArray(ld?.employmentType) ? ld.employmentType[0] : ld?.employmentType;
  const workType = JENIS[String(empLd || '').toUpperCase()] || null;

  // Gaji: JSON-LD "baseSalary" kalau ada; kalau tidak, teks gaji di halaman bila berupa angka.
  const rp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
  const unit = { MONTH: 'per month', YEAR: 'per year', WEEK: 'per week', DAY: 'per day', HOUR: 'per hour' };
  let salaryText = null;
  const bs = ld?.baseSalary?.value;
  if (bs && (bs.minValue || bs.maxValue || bs.value)) {
    const lo = bs.minValue || bs.value;
    const hi = bs.maxValue && bs.maxValue !== lo ? bs.maxValue : null;
    salaryText = (hi ? rp(lo) + ' - ' + rp(hi) : rp(lo)) + ' ' + (unit[String(bs.unitText || 'MONTH').toUpperCase()] || 'per month');
  } else {
    const sal = text(doc.querySelector('[class*="SalaryJobOverview"]'));
    if (/^(Rp|IDR)\s*\d/i.test(sal)) salaryText = sal;
  }

  // Lokasi: kota dan provinsi dari alamat JSON-LD.
  const addr = ld?.jobLocation?.address || (Array.isArray(ld?.jobLocation) ? ld.jobLocation[0]?.address : null) || {};
  const location_ = [addr.addressLocality, addr.addressRegion].filter(Boolean).join(', ');

  // Kategori: "Kategori (Subkategori)" dari tautan di halaman, bukan occupationalCategory yang berbahasa Inggris.
  const cats = [...doc.querySelectorAll('a[href*="/job-category/"]')].map(text).filter(Boolean);
  const classification = cats.length > 1 ? `${cats[0]} (${cats[1]})` : (cats[0] || ld?.occupationalCategory || '');

  const industrySize = [...doc.querySelectorAll('[class*="CompanyIndustryAndSize"] span')].map(text).filter(Boolean);
  const companySize = industrySize.find((t) => /karyawan|employees/i.test(t)) || null;
  const companyIndustry = ld?.industry || industrySize.find((t) => t !== companySize) || null;

  const logoEl = doc.querySelector('img[alt="Company Logo"]');
  const logoUrl = ld?.hiringOrganization?.logo || (logoEl ? (logoEl.currentSrc || logoEl.src) : null);

  let postedDate = null;
  if (ld?.datePosted) {
    const d = new Date(ld.datePosted);
    if (!Number.isNaN(d.getTime())) {
      const p = (n) => String(n).padStart(2, '0');
      postedDate = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }
  }

  return {
    externalId,
    companyIndustry,
    companySize,
    logoUrl,
    title: text(titleEl) || ld?.title || null,
    company: text(doc.querySelector('[class*="JobOverViewCompanyName"] a')) || ld?.hiringOrganization?.name || null,
    location: location_,
    classification,
    workType,
    salaryText,
    postedDate,
    description,
    hrefs: [],
  };
}

// KitaLulus (Next.js, kelas Tailwind): daftar di kiri, klik kartu membuka panel detail di kanan (halaman detail
// /lowongan/detail/<slug> berisi blok yang sama). Tidak ada JSON-LD yang bisa diandalkan, jadi dibaca dari DOM
// berdasarkan struktur dan teks, bukan nama kelas. Mengembalikan null bila belum ada panel lowongan yang terbuka.
// Kartu di daftar memakai bentuk baris ikon yang sama dengan panel, jadi semua pencarian dibatasi ke elemen yang
// berada SETELAH judul (h1) panel di dokumen: kartu daftar selalu mendahuluinya.
export function extractKitalulusRaw(doc = document, pathname = globalThis.location.pathname) {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const live = doc === globalThis.document;
  const tampak = (el) => !live || el.getClientRects().length > 0;
  const sesudah = (acuan, el) => !!(acuan.compareDocumentPosition(el) & 4);   // el berada setelah acuan
  const sebelum = (acuan, el) => !!(acuan.compareDocumentPosition(el) & 2);   // el berada sebelum acuan

  // Panel = h1 yang diikuti kotak deskripsi (.html-content) dalam satu pembungkus yang hanya memuat satu h1.
  const punyaDeskripsi = (h) => {
    let n = h.parentElement;
    while (n && !n.querySelector('.html-content')) n = n.parentElement;
    return !!n && n.querySelectorAll('h1').length === 1;
  };
  const h1 = [...doc.querySelectorAll('h1')].find((h) => punyaDeskripsi(h) && tampak(h));
  if (!h1) return null;
  const descBox = [...doc.querySelectorAll('.html-content')].find((d) => sesudah(h1, d));
  if (!descBox) return null;
  const setelahJudul = (selector) => [...doc.querySelectorAll(selector)].filter((el) => sesudah(h1, el));
  const diAntara = (selector) => setelahJudul(selector).filter((el) => sebelum(descBox, el));

  const detailHref = setelahJudul('a[href*="/lowongan/detail/"]')[0]?.getAttribute('href') || pathname;
  const externalId = (detailHref.match(/\/lowongan\/detail\/([^/?#]+)/) || [])[1] || null;
  if (!externalId) return null;

  const BLOCK = new Set(['P', 'DIV', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SECTION']);
  const walk = (node, out) => {
    if (node.nodeType === 3) { out.push(node.textContent.replace(/\s+/g, ' ')); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName;
    if (tag === 'BR') { out.push('\n'); return; }
    if (tag === 'LI') {
      const inner = [];
      node.childNodes.forEach((c) => walk(c, inner));
      out.push('\n- ' + inner.join('').replace(/\s+/g, ' ').trim());
      return;
    }
    const block = BLOCK.has(tag);
    if (block) out.push('\n\n');
    node.childNodes.forEach((c) => walk(c, out));
    if (block) out.push('\n\n');
  };
  const out = [];
  walk(descBox, out);
  let description = out.join('').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  // Baris ikon di bawah judul (lokasi, pendidikan, jenis kerja, gaji): yang berada antara judul dan deskripsi.
  const baris = diAntara('div.flex.items-center')
    .filter((d) => d.querySelector('svg') && d.querySelector(':scope > p'))
    .map((d) => text(d.querySelector(':scope > p')))
    .filter(Boolean);
  const JENIS = /full[\s-]*time|part[\s-]*time|freelance|kontrak|magang|temporer|paruh|lepas|intern/i;
  const PENDIDIKAN = /sma|smk|sederajat|diploma|\bd[1-4]\b|\bs[1-3]\b|sarjana|pendidikan/i;
  const jenisRow = baris.find((t) => JENIS.test(t)) || null;
  const pendidikan = baris.find((t) => t !== jenisRow && PENDIDIKAN.test(t)) || null;
  const lokasi = baris[0] && baris[0] !== jenisRow && baris[0] !== pendidikan ? baris[0] : '';
  const gajiRow = baris.find((t) => t !== lokasi && t !== jenisRow && t !== pendidikan && /rp|idr|nego|\d/i.test(t)) || null;
  const sistemKerja = jenisRow && jenisRow.includes('•') ? jenisRow.split('•').slice(1).join('•').trim() : '';
  const workType = jenisRow ? jenisRow.split('•')[0].replace(/-/g, ' ').trim() : null; // "Full-Time" -> "Full Time"
  // Gaji berupa angka rupiah di situs ini selalu per bulan kecuali pekerjaan freelance (per tugas/hari): beri satuan
  // bulan hanya yang bukan freelance, supaya terbaca sebagai gaji minimum/maksimum dan bukan teks.
  const gajiTeks = gajiRow && /^(rp|idr)/i.test(gajiRow) && !/freelance|lepas/i.test(workType || '') && !/bulan|month|hari|minggu|jam|day|week|hour/i.test(gajiRow)
    ? gajiRow + ' per bulan' : gajiRow;

  // Hari/jam kerja, persyaratan rekruter, dan keahlian ditambahkan ke akhir deskripsi sebagai teks.
  const labelValue = (label) => {
    const p = setelahJudul('p').find((x) => text(x) === label);
    return p ? text(p.nextElementSibling) : '';
  };
  const badges = (judul) => {
    const h = setelahJudul('h3').find((x) => text(x) === judul);
    return h ? [...h.parentElement.querySelectorAll('[data-slot="badge"]')].map(text).filter(Boolean) : [];
  };
  const syarat = badges('Persyaratan dari rekruter');
  if (pendidikan && !syarat.includes(pendidikan)) syarat.unshift(pendidikan);
  const keahlian = badges('Keahlian yang dibutuhkan');
  const hari = labelValue('Hari Kerja');
  const jam = labelValue('Jam Kerja');
  const tambahan = [];
  if (sistemKerja) tambahan.push('Sistem kerja: ' + sistemKerja);
  if (hari) tambahan.push('Hari kerja: ' + hari);
  if (jam) tambahan.push('Jam kerja: ' + jam);
  const blok = [];
  if (tambahan.length) blok.push(tambahan.join('\n'));
  if (syarat.length) blok.push('Persyaratan dari rekruter:\n' + syarat.map((t) => '- ' + t).join('\n'));
  if (keahlian.length) blok.push('Keahlian yang dibutuhkan:\n' + keahlian.map((t) => '- ' + t).join('\n'));
  if (blok.length) description = [description, ...blok].filter(Boolean).join('\n\n');

  const perusahaanLink = diAntara('a[href^="/company/"]')[0] || null;
  const tentang = setelahJudul('p').find((x) => text(x) === 'Tentang Perusahaan');
  const companyIndustry = tentang ? text(tentang.parentElement.querySelector('h3')?.nextElementSibling) || null : null;

  // Logo: avatar di blok judul (satu tingkat di atas pembungkus h1). Next.js membungkus alamat aslinya di parameter "url".
  let logoUrl = null;
  const img = h1.parentElement?.parentElement?.querySelector('img[data-slot="avatar-image"]');
  if (img?.getAttribute('src')) {
    try { logoUrl = new URL(img.getAttribute('src'), 'https://kitalulus.com').searchParams.get('url') || null; } catch { /* abaikan */ }
  }
  const postedText = text(setelahJudul('p').find((x) => /^Terakhir diperbarui/i.test(text(x))));

  return {
    externalId,
    title: text(h1),
    company: text(perusahaanLink) || null,
    companyIndustry,
    companySize: null,
    logoUrl,
    location: lokasi,
    classification: keahlian.slice(0, 3).join(', '),
    workType,
    salaryText: gajiTeks,
    postedText,
    description,
    hrefs: [],
  };
}
