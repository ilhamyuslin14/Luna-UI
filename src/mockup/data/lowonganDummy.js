// Data contoh untuk mockup. Lima lowongan ini DISALIN dari tabel lowongan_eksternal (judul, perusahaan,
// logo, deskripsi, dan tautan JobStreet aslinya), tapi disimpan statis di sini: halaman mockup tidak
// membaca database sama sekali. Bentuknya sama dengan kartu lowongan di aplikasi
// (lihat toExternalJob di services/lowonganPublikService.js).

const HARI = 86400000;
const hariLalu = (n) => new Date(Date.now() - n * HARI - 3 * 3600000).toISOString();

const rupiah = (n) => n.toLocaleString('id-ID');
const gaji = (min, max) => (min != null ? `Rp ${rupiah(min)} – ${rupiah(max ?? min)} / Bulan` : 'Gaji tidak ditampilkan');

function lowongan(d) {
  const adaGaji = d.salary_min != null;
  return {
    key: `jobstreet:${d.id}`,
    id: d.id,
    kode: d.kode,
    source: 'jobstreet',
    source_label: 'JobStreet',
    is_external: true,
    title: d.title,
    company_name: d.company_name,
    company_slug: null,
    logo_url: d.logo_url,
    location: d.location,
    category: d.category,
    employment_type: d.employment_type ?? 'Waktu Tidak Tertentu',
    employment_label: d.employment_type_raw,
    experience_years: d.exp,
    experience_label: d.exp === 0 ? 'Fresh graduate' : d.exp + ' tahun',
    salary_min: d.salary_min ?? null,
    salary_max: d.salary_max ?? null,
    salary_cycle: adaGaji ? 'bulanan' : null,
    salary_label: gaji(d.salary_min, d.salary_max),
    salary_text_only: !adaGaji,
    posted_at: hariLalu(d.hariLalu),
    external_url: d.external_url,
    description: d.description,
    view_count: d.view_count,
    company_industry: d.company_industry ?? null,
    company_size: d.company_size ?? null,
  };
}

export const LOWONGAN_DUMMY = [
  lowongan({
    id: '299761bf-db77-4863-9883-4b0f573acd7e', kode: 'EXT-JS-95342526', exp: 1, hariLalu: 1, view_count: 128,
    title: 'Junior Business Analyst', company_name: 'PT Perangkat Lunak Indonesia',
    location: 'Jakarta Pusat, Jakarta Raya (Hibrid)', category: 'Analis Bisnis/Sistem (Teknologi Informasi & Komunikasi)',
    employment_type_raw: 'Full time', salary_min: 5500000, salary_max: 7000000,
    external_url: 'https://id.jobstreet.com/id/job/95342526',
    logo_url: 'https://image-service-cdn.seek.com.au/595c0df58f3c531c9a503462614cc3884b44f4e4/ee4dce1061f3f616224767ad58cb2fc751b8d2dc',
    company_industry: 'Software Development', company_size: '51-200 employees',
    description: "AGILIS Solutions, a software development company, is looking for candidates for Junior Business Analyst position, who meet the following requirements:\n\n- Candidate must possess at least SMK, Diploma or Bachelor's Degree in Information System or equivalent fields.\n- Required language(s): Bahasa Indonesia, English\n- At least 1 year of experience / internship / equivalent working experience in the related field for this position (fresh graduates are welcomed).\n\n- Good communication skill.\n- Good analytical skills.\n\nResponsibilities:\n\n- Conduct project meetings with project managers and end-users.\n- Create software design documents for development team.\n- Create project-related documents (testing scenario, user manual, training materials, etc.).\n- Involved in application testing process and creation of related documents.\n\nTechnical qualifications:\n\n- Familiar in creating documentation / design document for software projects.\n- Familiar in Database Operations (SELECT, JOIN, GROUP BY, AGGREGATE, and other basic queries)\n- Experienced in any programming language is an advantage.",
  }),
  lowongan({
    id: '92c55438-79b1-4bf6-9835-47d590386694', kode: 'EXT-JS-95411873', exp: 4, hariLalu: 2, view_count: 94,
    title: 'Product Implementation Manager', company_name: 'PT Rantai Dingin Asia ( Coldspace )',
    location: 'Jakarta Timur, Jakarta Raya', category: 'Manajemen & Pengembangan Produk (Teknologi Informasi & Komunikasi)',
    employment_type_raw: 'Full time', salary_min: null, salary_max: null,
    external_url: 'https://id.jobstreet.com/id/job/95411873',
    logo_url: 'https://image-service-cdn.seek.com.au/a07c71896aa73ead42a0cdce8f99ddfe42c6f5ab/ee4dce1061f3f616224767ad58cb2fc751b8d2dc',
    company_industry: 'Logistics & Supply Chain', company_size: '201-500 employees',
    description: "Kualifikasi:\n\n- 3–6 tahun pengalaman dalam implementasi atau rollout sistem bisnis (ERP, OMS, WMS, finance/accounting, atau platform operasional sejenis)\n- Kemampuan business analysis yang kuat: requirement elicitation, validasi, dan prioritisasi\n- Stakeholder management: mampu bekerja lintas tim ops, finance, dan teknis\n- Disiplin follow through: terbiasa men-track timeline, mendorong closure, dan mengelola change & adoption\n- Tegas sebagai gatekeeper: berani push back dengan argumentasi yang jelas\n- Owner's mindset: akuntabel atas outcome, bukan sekadar output\n\nDeskripsi Pekerjaan:\n\n- Menjadi penghubung utama antara pengguna bisnis (operasional, finance, dan sales admin) dengan tim pengembang sistem untuk memastikan solusi yang dibangun sesuai kebutuhan bisnis.\n- Melakukan observasi langsung terhadap proses operasional untuk memahami alur kerja, mengidentifikasi pain point, dan menemukan peluang perbaikan proses.\n- Mengumpulkan, menganalisis, memvalidasi, dan memprioritaskan kebutuhan bisnis serta permintaan pengembangan sistem.\n- Menjadi gatekeeper terhadap setiap permintaan perubahan atau pengembangan sistem dengan mempertimbangkan dampak jangka panjang, nilai bisnis, dan prioritas perusahaan.\n- Mengelola implementasi sistem bisnis mulai dari perencanaan, koordinasi, User Acceptance Test (UAT), pelatihan pengguna, hingga golive.\n- Memastikan sistem yang telah diimplementasikan digunakan secara optimal oleh pengguna melalui aktivitas monitoring, coaching, dan change management.\n- Menjadi titik koordinasi utama dalam penanganan bug, kendala penggunaan, maupun isu usability yang ditemukan oleh pengguna.\n- Memantau progress implementasi, memastikan timeline berjalan sesuai rencana, serta melakukan eskalasi terhadap hambatan yang berpotensi mengganggu target implementasi.\n- Menyusun dan memelihara dokumentasi kebutuhan bisnis, keputusan implementasi, status proyek, serta hasil evaluasi penggunaan sistem.\n- Mengukur tingkat adopsi dan efektivitas sistem serta memberikan rekomendasi perbaikan berkelanjutan berdasarkan data dan feedback.",
  }),
  lowongan({
    id: 'c9c1d1cc-442a-40e6-b6f2-ad84ff3eb31f', kode: 'EXT-JS-95329031', exp: 3, hariLalu: 3, view_count: 76,
    title: 'Corporate Investment & Finance Analyst', company_name: 'PT Akarsa Garment Indonesia',
    location: 'Jakarta Raya', category: 'Perbankan Finansial & Investasi Korporat (Perbankan & Layanan Finansial)',
    employment_type_raw: 'Full time', salary_min: 6000000, salary_max: 7000000,
    external_url: 'https://id.jobstreet.com/id/job/95329031',
    logo_url: 'https://image-service-cdn.seek.com.au/6909f1fbe2463481aa91803e762224fcaa7d67db/ee4dce1061f3f616224767ad58cb2fc751b8d2dc',
    company_industry: 'Manufacturing', company_size: '101-1,000 employees',
    description: "JOBDESC\n\n1. Mereview dan menganalisa Laporan Keuangan perusahaan\n2. Menyusun financial model, proyeksi dan cash flow forecast.\n3. Melakukan analisis valuasi menggunakan DCF, comparable company, ROI, IRR, NPV dan payback period.\n4. Membuat feasibility study, business plan dan analisis kelayakan proyek.\n5. Menyusun workplan dan prioritas analisis investasi perusahaan.\n6. Melakukan Pencatatan investasi, penggunaan dana, utang, risiko dan pencapaian milestone entitas.\n7. Menyusun investment memo, valuation report, dashboard, bahan presentasi Direksi/RUPS, serta memberikan rekomendasi kepada manajemen\n8. Menyusun laporan, dashboard, dan bahan presentasi untuk manajemen.\n\nKUALIFIKASI\n\n1. Minimal S1 Keuangan, Akuntansi, Ekonomi, Manajemen, atau bidang terkait.\n2. Pengalaman kerja minimal 2-4 tahun di Corporate Finance, Investment, Valuation, FP&A, M&A, Audit atau Management Consulting.\n3. Memiliki pengalaman memimpin atau mengawasi tim minimal 1–2 tahun.\n4. Menguasai financial modelling, financial projection, valuation dan investment analysis.\n5. Memahami laporan keuangan, cash flow, working capital, struktur modal, dan analisis risiko.\n6. Menguasai Microsoft Excel (Spreadsheet) dan PowerPoint atau Power BI\n7. Mampu menyusun laporan analisis dan presentasi untuk Direksi, pemegang saham, atau investor.\n8. Memiliki kemampuan leadership, problem solving, komunikasi, negosiasi dan koordinasi lintas entitas.\n9. Teliti, tegas, memiliki integritas tinggi, mampu bekerja dengan deadline, serta menjaga kerahasiaan informasi perusahaan.",
  }),
  lowongan({
    id: '06049a89-e75f-4051-84dc-102da5a81c9a', kode: 'EXT-JS-95426273', exp: 3, hariLalu: 4, view_count: 52,
    title: 'Admin Purchasing', company_name: 'PT Aplus Pacific',
    location: 'Jakarta Barat, Jakarta Raya', category: 'Pembelian, Pengadaan & Inventaris (Manufaktur, Transportasi & Logistik)',
    employment_type_raw: 'Full time', salary_min: null, salary_max: null,
    external_url: 'https://id.jobstreet.com/id/job/95426273',
    logo_url: 'https://image-service-cdn.seek.com.au/cd9b750ce318b362cc42d752420bbe0694a2cdb1/f3c5292cec0e05e4272d9bf9146f390d366481d0',
    company_industry: 'Manufacturing', company_size: '51-200 employees',
    description: "About the role\n\nAn administrative purchasing role responsible for managing purchase documentation, preparing document completeness for the finance division, and maintaining records of purchasing activities.\n\nKey responsibilities\n\n- Examine and prepare purchase document completeness before submission to the finance division\n- Manage purchasing purchase documents\n- Create periodic recaps and reports regarding PO document completeness status\n- Create administrative reports\n\nAbout you\n\n- Minimum D3 education\n- Minimum 3 years of work experience as Admin Purchasing\n- Able to operate Microsoft Office, especially Excel and Word\n- Understand basic procurement/purchasing processes, such as PR, PO, quotation, invoice, and goods receipt\n- Able to coordinate and communicate with warehouse, finance, and related departments\n- Able to input and check data accurately\n- Able to work with deadlines\n- Detail-oriented, neat, organized, and able to manage many documents well",
  }),
  lowongan({
    id: '8a418aea-1746-4c3d-94da-cf9ff3a07399', kode: 'EXT-JS-95402194', exp: 0, hariLalu: 5, view_count: 41,
    title: 'ADMINISTRASI PEMASARAN', company_name: 'PT Haleyora Powerindo',
    location: 'Jakarta Raya', category: 'Pengembangan Bisnis Baru (Penjualan)',
    employment_type_raw: 'Kontrak', employment_type: 'Waktu Tertentu', salary_min: 6000000, salary_max: 6500000,
    external_url: 'https://id.jobstreet.com/id/job/95402194',
    logo_url: 'https://image-service-cdn.seek.com.au/54b1bb86fa5824402a5e898522cd282cb10cdce5/ee4dce1061f3f616224767ad58cb2fc751b8d2dc',
    company_industry: 'Energy & Utilities', company_size: '1,001-5,000 employees',
    description: "Tanggung Jawab:\n\na. Mendukung kegiatan pemasaran\nb. Mencari dan memetakan calon pelanggan/pasar\nc. Monitoring Probing Kantor Pusat dan Cabang tersebar\nd. Mencari dan memetakan calon pelanggan/pasar\ne. Penyelesaian proses pengadaan project baru\nf. Memahami isi RKS, RAB, HPS dan Spesifikasi Kontrak\ng. Terbiasa membuat BOQ\nh. Melakukan proses negosiasi",
  }),
];

// Skor kecocokan yang sudah ada saat demo dimulai. Product Implementation Manager sengaja tidak punya skor
// ("belum dicek"): saat panel detailnya dibuka dan tombol cek ditekan, hasilnya muncul di HASIL_CEK.
export const SKOR_AWAL = {
  'jobstreet:92c55438-79b1-4bf6-9835-47d590386694': 78, // Product Implementation Manager -> Tinggi
  'jobstreet:299761bf-db77-4863-9883-4b0f573acd7e': 91, // Junior Business Analyst       -> Tinggi
  'jobstreet:c9c1d1cc-442a-40e6-b6f2-ad84ff3eb31f': 43, // Corporate Investment          -> Rendah
  'jobstreet:06049a89-e75f-4051-84dc-102da5a81c9a': 18, // Admin Purchasing              -> Tidak Sesuai
  'jobstreet:8a418aea-1746-4c3d-94da-cf9ff3a07399': 56, // Administrasi Pemasaran        -> Sedang
};

export const HASIL_CEK = {
  // dipakai hanya saat tombol hitung ulang ditekan
  'jobstreet:92c55438-79b1-4bf6-9835-47d590386694': 78, // Product Implementation Manager -> Tinggi
};
