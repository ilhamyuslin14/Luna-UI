// Data contoh untuk mockup: 5 lowongan, 3 dari JobStreet (disalin dari tabel lowongan_eksternal: judul, perusahaan,
// logo, deskripsi, dan tautan aslinya) dan 2 lowongan Luna (disalin dari tabel seleksi), semuanya disimpan statis di
// sini: halaman mockup tidak membaca database sama sekali. Bentuknya sama dengan kartu lowongan di aplikasi
// (lihat toExternalJob dan toLunaJob di services/lowonganPublikService.js).

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

const rpLabel = (a, b) => `Rp ${rupiah(a)} – ${rupiah(b)} / Bulan`;

// Lowongan Luna (bentuk toLunaJob). Pengalaman, pendidikan, dan level ikut tampil di panel detail.
function lunaJob(d) {
  return {
    key: `luna:${d.id}`,
    id: d.id,
    kode: d.kode,
    source: 'luna',
    source_label: 'Luna',
    is_external: false,
    title: d.title,
    company_name: d.company_name,
    company_slug: null,
    logo_url: d.logo_url,
    location: d.location,
    category: d.dept ?? null,
    departments: d.dept ? { name: d.dept } : null,
    employment_type: d.employment_type,
    employment_label: d.employment_type,
    level_jabatan: d.level_jabatan ?? null,
    pendidikan: d.pendidikan ?? null,
    experience_years: d.exp,
    experience_label: d.exp > 0 ? `${d.exp}+ tahun` : 'Fresh graduate',
    salary_min: d.salary_min,
    salary_max: d.salary_max,
    salary_cycle: 'bulanan',
    salary_label: rpLabel(d.salary_min, d.salary_max),
    salary_text_only: false,
    posted_at: hariLalu(d.hariLalu),
    external_url: null,
    deskripsi: d.deskripsi,
    view_count: d.view_count,
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
  lunaJob({
    id: '906cc925-150e-410e-82d8-24e236cb767f', kode: 'LUN-7163', exp: 3, hariLalu: 3, view_count: 63,
    title: 'Business Analyst', company_name: 'PT Sinergi Data', logo_url: "https://qxmkwfncpxcibjnwnmup.supabase.co/storage/v1/object/public/company_assets/a7738be0-e338-4149-b5c1-42a36d927158/logo/1788184745845_6fxv522.jpg",
    location: 'Jakarta Selatan', employment_type: 'Waktu Tidak Tertentu', level_jabatan: 'Staff/Junior',
    pendidikan: 'D4/S1 (Sarjana)', dept: 'Teknologi', salary_min: 12000000, salary_max: 21000000,
    deskripsi: "<p>DESKRIPSI PEKERJAAN</p><p>Kami mencari Business Analyst untuk menjembatani kebutuhan bisnis dengan solusi teknologi. Anda akan menganalisis proses bisnis, mengumpulkan requirements, dan memastikan solusi yang dibangun sesuai dengan kebutuhan stakeholder.</p><p><br></p><p>TUGAS DAN TANGGUNG JAWAB</p><ul><li>Mengumpulkan dan menganalisis kebutuhan bisnis dari stakeholder</li><li>Mendokumentasikan business requirements (BRD) dan functional requirements (FRD)</li><li>Membuat process flow, use case, dan user story</li><li>Berkolaborasi dengan Product Manager dan Engineer untuk solusi teknis</li><li>Melakukan gap analysis antara kondisi current dan target state</li><li>Memfasilitasi workshop dan diskusi dengan stakeholder</li><li>Memvalidasi solusi yang dibangun melalui UAT (User Acceptance Testing)</li><li>Mendukung change management dan training pengguna</li></ul><p><br></p><p>KUALIFIKASI</p><ul><li>Minimal S1 Sistem Informasi, Teknik Informatika, Manajemen Bisnis, atau bidang relevan</li><li>Pengalaman minimal 3 tahun sebagai Business Analyst atau System Analyst</li><li>Strong analytical dan critical thinking skills</li><li>Mahir dalam dokumentasi (BRD, FRD, FSD, user manual)</li><li>Pemahaman tentang BPMN, UML, atau metodologi modeling lainnya</li><li>Familiar dengan database dan SQL</li><li>Excellent komunikasi dan stakeholder management</li><li>Pengalaman dengan tools seperti Jira, Confluence, Visio, Lucidchart</li></ul><p><br></p><p>NILAI TAMBAH (NICE TO HAVE)</p><ul><li>Pengalaman di industri fintech, banking, atau enterprise</li><li>Sertifikasi CBAP, CCBA, atau PMI-PBA</li><li>Pengalaman dengan proyek implementasi ERP, CRM, atau core systems</li></ul><p><br></p><p>BENEFIT DAN FASILITAS</p><ul><li>Gaji kompetitif</li><li>BPJS lengkap + asuransi swasta</li><li>Hybrid working arrangement</li><li>Learning &amp; certification budget Rp 8.000.000 per tahun</li><li>Annual leave 14 hari</li><li>Performance bonus</li><li>Career development path yang jelas</li></ul>",
  }),
  lunaJob({
    id: '9d900975-0b59-43e8-beb9-c2a3c5d3d59d', kode: 'LUN-2580', exp: 3, hariLalu: 4, view_count: 47,
    title: 'Manajer Operasional Produk', company_name: 'PT Sinergi Data', logo_url: "https://qxmkwfncpxcibjnwnmup.supabase.co/storage/v1/object/public/company_assets/a7738be0-e338-4149-b5c1-42a36d927158/logo/1788184745845_6fxv522.jpg",
    location: 'Jakarta', employment_type: 'Waktu Tidak Tertentu', level_jabatan: 'Supervisor',
    pendidikan: 'D4/S1 (Sarjana)', dept: 'Operasional', salary_min: 15000000, salary_max: 25000000,
    deskripsi: "<p><strong>Tentang Peran</strong></p><p>Kami mencari Manajer Operasional Produk yang berdedikasi untuk bergabung dengan tim kami di perusahaan SaaS yang bergerak di bidang solusi produktivitas digital berbasis AI. Posisi ini krusial untuk mempercepat peluncuran fitur baru, mengurangi beban kerja tim yang sering overload, menstandarisasi alur kerja, dan meningkatkan performa metrik operasional utama.</p><p><strong>Tanggung Jawab</strong></p><ul><li>Menjalankan rutinitas operasional harian sesuai Standard Operating Procedure (SOP) dan memastikan target harian selesai tepat waktu.</li><li>Berkoordinasi lintas divisi (Produk, Operasional, Customer Service) untuk sinkronisasi proyek dan penyelesaian hambatan.</li><li>Memantau metrik performa dan data harian, serta menyusun laporan ringkas berkala untuk manajemen.</li><li>Menangani kendala teknis atau lapangan yang muncul mendadak dan mengusulkan inisiatif perbaikan alur kerja agar lebih efisien.</li><li>Mendukung percepatan peluncuran fitur baru untuk mencapai target kuartalan.</li><li>Meningkatkan performa metrik utama operasional setidaknya 20% dalam 6 bulan pertama.</li></ul><p><strong>Kualifikasi</strong></p><ul><li>Pendidikan minimal S1 dari jurusan terkait (misalnya Teknik Informatika, Sistem Informasi, Manajemen Bisnis, atau setara).</li><li>Pengalaman kerja relevan selama 3-5 tahun di bidang operasional produk, manajemen proyek, atau peran serupa di industri SaaS.</li><li>Memiliki pemahaman yang kuat tentang siklus hidup pengembangan produk SaaS dan metodologi manajemen proyek (misalnya Agile, Scrum).</li><li>Mampu menganalisis data operasional dan metrik performa untuk menghasilkan laporan yang actionable.</li><li>Terbiasa bekerja dengan tools manajemen alur kerja dan dashboard analitik.</li><li>Kemampuan komunikasi dan koordinasi yang baik untuk bekerja sama dengan tim lintas fungsi.</li><li>Proaktif dalam mengidentifikasi masalah dan mengusulkan solusi perbaikan.</li></ul><p><strong>Nilai Tambah</strong></p><ul><li>Pengalaman dalam mengelola atau mengintegrasikan solusi berbasis AI.</li><li>Memiliki sertifikasi di bidang manajemen proyek (misalnya PMP, Certified ScrumMaster).</li><li>Familiar dengan tools seperti Jira, Confluence, atau sejenisnya untuk dokumentasi dan pelacakan tugas.</li><li>Kemampuan dasar dalam pemahaman API dan integrasi sistem.</li></ul>",
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
];

// Skor kecocokan yang sudah ada saat demo dimulai: kelima lowongan sudah punya skor, jadi tidak ada state
// "belum dicek" saat presentasi. Business Analyst (Luna) sengaja bukan yang tertinggi: ia tetap di posisi
// teratas karena judulnya sejalan dengan preferensi posisi di profil (lihat aturan slot Luna di hook daftar).
export const SKOR_AWAL = {
  'luna:906cc925-150e-410e-82d8-24e236cb767f': 52,                 // Business Analyst (Luna)         -> Sedang
  'jobstreet:299761bf-db77-4863-9883-4b0f573acd7e': 91,            // Junior Business Analyst         -> Tinggi
  'jobstreet:92c55438-79b1-4bf6-9835-47d590386694': 78,            // Product Implementation Manager  -> Tinggi
  'luna:9d900975-0b59-43e8-beb9-c2a3c5d3d59d': 63,                 // Manajer Operasional Produk      -> Sedang
  'jobstreet:06049a89-e75f-4051-84dc-102da5a81c9a': 18,            // Admin Purchasing                -> Rendah
};

// Hasil saat tombol hitung ulang di kartu skor ditekan.
export const HASIL_CEK = {
  'luna:906cc925-150e-410e-82d8-24e236cb767f': 52,
  'jobstreet:299761bf-db77-4863-9883-4b0f573acd7e': 91,
  'jobstreet:92c55438-79b1-4bf6-9835-47d590386694': 78,
  'luna:9d900975-0b59-43e8-beb9-c2a3c5d3d59d': 63,
  'jobstreet:06049a89-e75f-4051-84dc-102da5a81c9a': 18,
};
