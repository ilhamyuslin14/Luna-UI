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
