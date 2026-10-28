// Isi halaman Syarat & Ketentuan dan Kebijakan Privasi (versi umum untuk prototype; strukturnya mengikuti
// dokumen sejenis di portal kerja: persetujuan, akun, penggunaan layanan, konten, data pribadi, tanggung jawab, perubahan).
// Tiap bagian: { judul, isi: [paragraf (string) | { daftar: [butir...] }] }.

export const TERAKHIR_DIPERBARUI = '28 Oktober 2026';

export const DOKUMEN_LEGAL = {
  syarat: {
    judul: 'Syarat & Ketentuan',
    ringkas: 'Aturan yang berlaku saat kamu memakai Luna sebagai pencari kerja.',
    bagian: [
      {
        judul: 'Persetujuan',
        isi: [
          'Dengan membuat akun, atau sekadar membuka dan memakai situs Luna, kamu menyetujui Syarat & Ketentuan ini beserta Kebijakan Privasi Luna. Kalau tidak setuju, mohon tidak mendaftar atau memakai layanan kami.',
          'Kamu harus berusia minimal 17 tahun, atau sudah diizinkan oleh orang tua atau wali untuk memakai layanan ini.',
        ],
      },
      {
        judul: 'Layanan Luna',
        isi: [
          'Luna membantu pencari kerja menemukan lowongan, mengelola profil dan CV, serta melamar pekerjaan. Lowongan di Luna berasal dari dua jalur: lowongan yang dipasang langsung oleh perusahaan lewat Luna, dan lowongan yang kami kumpulkan dari portal kerja lain beserta tautan ke sumber aslinya.',
          'Kami berusaha menjaga layanan tetap berjalan, tetapi tidak menjamin layanan selalu tersedia tanpa gangguan, bebas galat, atau cocok untuk setiap kebutuhan.',
        ],
      },
      {
        judul: 'Akun kamu',
        isi: [
          'Kamu bertanggung jawab atas kebenaran data yang kamu isi dan atas keamanan kata sandi akunmu. Semua kegiatan yang terjadi lewat akunmu dianggap dilakukan olehmu.',
          'Segera beri tahu kami kalau kamu menduga akunmu dipakai orang lain. Satu orang hanya boleh memiliki satu akun pelamar.',
        ],
      },
      {
        judul: 'Cara memakai Luna',
        isi: [
          'Kamu setuju untuk:',
          { daftar: [
            'mengisi profil, CV, dan lamaran dengan data yang benar dan tidak menyesatkan;',
            'memakai Luna hanya untuk mencari dan melamar pekerjaan secara sah;',
            'tidak menyalahgunakan layanan, misalnya mengambil data secara massal, mengganggu sistem, atau mencoba masuk ke akun orang lain;',
            'tidak mengunggah konten yang melanggar hukum, mengandung unsur SARA, pornografi, atau melanggar hak pihak lain.',
          ] },
          'Kami berhak membatasi atau menutup akun yang melanggar ketentuan ini.',
        ],
      },
      {
        judul: 'Lowongan dan lamaran',
        isi: [
          'Isi lowongan dibuat oleh perusahaan atau oleh sumber aslinya. Luna bukan pemberi kerja dan tidak menjamin kebenaran, kelengkapan, atau ketersediaan sebuah lowongan, maupun bahwa lamaranmu akan diterima.',
          'Lowongan dari portal kerja lain hanya kami tampilkan sebagai informasi. Saat kamu melamar lewat sumber tersebut, kamu meninggalkan Luna dan tunduk pada syarat dan kebijakan privasi portal itu.',
          'Waspadai lowongan yang meminta pembayaran atau data yang tidak wajar. Perusahaan yang sah tidak memungut biaya dari pelamar.',
        ],
      },
      {
        judul: 'Skor kecocokan dan saran otomatis',
        isi: [
          'Luna dapat menampilkan skor kecocokan dan rekomendasi lowongan berdasarkan profil, CV, dan preferensi kerjamu. Itu hanya perkiraan untuk membantumu memilih, bukan penilaian resmi, dan bukan keputusan perusahaan.',
        ],
      },
      {
        judul: 'Konten milikmu',
        isi: [
          'CV dan data yang kamu unggah tetap milikmu. Dengan mengunggahnya, kamu mengizinkan Luna menyimpan, memproses, dan menampilkannya untuk menjalankan layanan, termasuk membagikannya kepada perusahaan saat kamu melamar.',
          'Nama, logo, tampilan, dan perangkat lunak Luna adalah milik Luna dan tidak boleh disalin atau dipakai tanpa izin.',
        ],
      },
      {
        judul: 'Batas tanggung jawab',
        isi: [
          'Sejauh diizinkan hukum, Luna tidak bertanggung jawab atas kerugian yang timbul dari penggunaan layanan, isi lowongan, keputusan perusahaan, atau gangguan teknis. Tanggung jawab kami, kalau ada, terbatas pada hal yang diwajibkan oleh hukum yang berlaku.',
        ],
      },
      {
        judul: 'Perubahan ketentuan',
        isi: [
          'Kami dapat memperbarui Syarat & Ketentuan ini sewaktu-waktu. Versi terbaru selalu ada di halaman ini beserta tanggal pembaruannya. Kalau kamu terus memakai Luna setelah perubahan berlaku, kamu dianggap menerima versi yang baru.',
        ],
      },
      {
        judul: 'Hukum yang berlaku',
        isi: [
          'Ketentuan ini tunduk pada hukum Republik Indonesia. Kalau ada perselisihan, kita upayakan menyelesaikannya secara musyawarah terlebih dahulu.',
        ],
      },
      {
        judul: 'Hubungi kami',
        isi: [
          'Ada pertanyaan tentang ketentuan ini? Hubungi kami lewat halaman Bantuan di Luna.',
        ],
      },
    ],
  },

  privasi: {
    judul: 'Kebijakan Privasi',
    ringkas: 'Data apa yang kami kumpulkan, untuk apa, dan apa saja pilihanmu.',
    bagian: [
      {
        judul: 'Tentang kebijakan ini',
        isi: [
          'Kebijakan ini menjelaskan bagaimana Luna mengumpulkan, memakai, dan melindungi data pribadimu saat kamu memakai layanan kami sebagai pencari kerja.',
        ],
      },
      {
        judul: 'Data yang kami kumpulkan',
        isi: [
          { daftar: [
            'Data akun: nama lengkap, alamat email, dan kata sandi (disimpan dalam bentuk terenkripsi).',
            'Data profil dan CV: pengalaman kerja, pendidikan, keahlian, dan isi berkas CV yang kamu unggah.',
            'Preferensi kerja: posisi, lokasi, kisaran gaji, dan portal kerja lain yang kamu pakai, kalau kamu mengisinya.',
            'Data lamaran: lowongan yang kamu lamar dan status lamaranmu.',
            'Data penggunaan: halaman yang dibuka dan jenis perangkat atau peramban, untuk menjaga dan memperbaiki layanan.',
          ] },
        ],
      },
      {
        judul: 'Untuk apa data dipakai',
        isi: [
          { daftar: [
            'membuat dan mengelola akunmu, termasuk verifikasi email;',
            'membaca CV dan mengisi profilmu agar kamu tidak perlu mengetik ulang;',
            'menyarankan lowongan dan menghitung skor kecocokan yang sesuai denganmu;',
            'mengirim lamaranmu kepada perusahaan yang kamu tuju;',
            'mengirim pemberitahuan penting tentang akun dan lamaranmu;',
            'menjaga keamanan, mencegah penyalahgunaan, dan memperbaiki layanan.',
          ] },
        ],
      },
      {
        judul: 'Kepada siapa data dibagikan',
        isi: [
          'Kami tidak menjual data pribadimu. Data dibagikan hanya dalam keadaan berikut:',
          { daftar: [
            'kepada perusahaan, saat kamu melamar lowongan mereka lewat Luna;',
            'kepada penyedia layanan yang membantu kami menjalankan Luna, seperti penyimpanan data dan pengiriman email, dengan kewajiban menjaga kerahasiaannya;',
            'kepada pihak berwenang, bila diwajibkan oleh hukum.',
          ] },
          'Kalau kamu melamar lewat portal kerja lain dari tautan di Luna, data yang kamu berikan di sana dikelola oleh portal tersebut, bukan oleh Luna.',
        ],
      },
      {
        judul: 'Penyimpanan dan keamanan',
        isi: [
          'Kami menyimpan datamu selama akunmu aktif atau selama diperlukan untuk menjalankan layanan, lalu menghapus atau menganonimkannya kalau sudah tidak dibutuhkan. Kami memakai langkah pengamanan yang wajar untuk melindungi datamu, tetapi tidak ada sistem yang sepenuhnya bebas risiko. Jaga kerahasiaan kata sandimu.',
        ],
      },
      {
        judul: 'Cookie',
        isi: [
          'Luna memakai penyimpanan di peramban dan cookie seperlunya agar kamu tetap masuk dan pengaturanmu tersimpan. Kamu bisa menghapusnya lewat pengaturan peramban, tetapi sebagian fitur mungkin tidak berjalan semestinya.',
        ],
      },
      {
        judul: 'Perubahan kebijakan',
        isi: [
          'Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Versi terbaru selalu ada di halaman ini beserta tanggal pembaruannya.',
        ],
      },
      {
        judul: 'Hubungi kami',
        isi: [
          'Ada pertanyaan tentang kebijakan ini? Hubungi kami lewat halaman Bantuan di Luna.',
        ],
      },
    ],
  },
};
