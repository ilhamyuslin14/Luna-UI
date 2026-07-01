# LUNA - Panduan Brand & Identitas Visual

Berdasarkan pedoman desain terbaru, berikut adalah pengaturan desain (termasuk typography, warna, dll.) yang digunakan untuk platform LUNA (termasuk halaman Landing Page Revamp).

## 1. Display & Heading
**Font Family:** Plus Jakarta Sans
Digunakan untuk judul utama dan penekanan besar.

- **DISPLAY**
  - Font Weight: 600 (SemiBold)
  - Font Size: 40px
  - Line Height: 40px
  - Letter Spacing: -2.0%

- **H1**
  - Font Weight: 600 (SemiBold)
  - Font Size: 28px
  - Line Height: 30px
  - Letter Spacing: -1.8%

- **H2**
  - Font Weight: 600 (SemiBold)
  - Font Size: 20px
  - Line Height: 22px
  - Letter Spacing: -1.2%

- **H3**
  - Font Weight: 600 (SemiBold)
  - Font Size: 16px
  - Line Height: 19px
  - Letter Spacing: -0.5%

---

## 2. Body & UI
**Font Family:** Inter Tight
Digunakan untuk teks paragraf, deskripsi, dan elemen UI (tombol, input).

- **BODY**
  - Font Weight: 400 (Regular)
  - Font Size: 14px
  - Line Height: 21px
  - Letter Spacing: 0%

- **CAPTION**
  - Font Weight: 500 (Medium)
  - Font Size: 12px
  - Line Height: 17px
  - Letter Spacing: 0%

---

## 3. Mono / Kode
**Font Family:** JetBrains Mono
Digunakan untuk kode referensi, ID sistem, log, atau script.

- **MONO**
  - Font Weight: 400 (Regular)
  - Font Size: 13px
  - Line Height: 18px
  - Letter Spacing: 0%

---

## 4. Warna & Palet (Colors)

**Warna Utama: Luna Orange (Primer - Orange 400)**
- **HEX**: `#FF8D21`
- **RGB**: 255, 141, 33
- **CMYK**: 0, 53, 92, 0
- **PMS**: 1495 C

**Aturan Penggunaan Luna Orange:**
- **Satu oranye yang khas. Digunakan dengan terkendali.**
- Luna Orange adalah warna sinyal kami — dipakai untuk aksi utama, aksen, dan momen brand.
- **TIDAK PERNAH** jadi background-fill seluruh layar, dan tidak pernah jadi wash di belakang teks paragraf.
- CTA utama, aksen kunci, momen brand. Jangan dijadikan background penuh di belakang paragraf teks.

**Skala Warna & Penggunaan (Tints & Shades):**

| Tingkat | Nama | Kode HEX | Kategori | Penggunaan Utama |
|---|---|---|---|---|
| **050** | Cream | `#FFF4DF` | PERMUKAAN | Background bernuansa brand yang lembut, banner, info-alert, dan tahap onboarding. |
| **100** | Apricot | `#FFCD90` | PERMUKAAN | Background bernuansa brand yang lembut, banner, info-alert, dan tahap onboarding. |
| **200** | Peach | `#FFB76B` | AKSEN | Avatar, bentuk ilustratif, hover state, chip dan pill sekunder. |
| **300** | Mango | `#FFA652` | AKSEN | Avatar, bentuk ilustratif, hover state, chip dan pill sekunder. |
| **400** | Luna Orange (Primer) | `#FF8D21` | AKSI | Tombol utama, focus ring, link, momen brand kunci. Pakai secukupnya. |
| **500** | Ember | `#FF7B00` | AKSI | Tombol utama, focus ring, link, momen brand kunci. Pakai secukupnya. |

### Skala Ink (Netral Hangat)
Netral kami sedikit hangat — terbaca percaya diri dan modern saat berdampingan dengan Luna Orange tanpa saling bersaing. Jangan pakai `#000000` murni atau `#FFFFFF` murni untuk teks dan permukaan; pakai Ink 900 dan Ink 000.

| Tingkat | Kode HEX |
|---|---|
| **000** | `#FFFFFF` |
| **050** | `#F7F7F6` |
| **100** | `#EFEEEC` |
| **200** | `#DCDAD5` |
| **300** | `#B8B5AE` |
| **400** | `#8A8780` |
| **500** | `#5E5C56` |
| **600** | `#3D3B36` |
| **800** | `#15140F` |
| **900** | `#0A0908` |

**Aturan Teks di Latar Terang:**
- Body memakai Ink 700 *(Catatan: HEX Ink 700 tidak ada di referensi palet, perlu disepakati atau gunakan pendekatan)*.
- Heading naik ke Ink 900.
- Teks sekunder & helper memakai Ink 500.
- Jangan turun di bawah Ink 400 untuk teks yang harus dibaca.

**Aturan Teks di Latar Gelap:**
- Reverse di Ink 900.
- Body memakai Ink 050, teks sekunder memakai Ink 300.
- Sisakan putih murni (Ink 000) untuk heading dan momen sinyal.

### Warna Semantik

| Tipe | Kode HEX | Contoh | Penggunaan Utama |
|---|---|---|---|
| **Sukses** | `#1F8A4E` | Offer aktif · Disetujui | State sukses, kandidat diterima, offer terkirim, langkah selesai. Pasangkan dengan badge Aktif. |
| **Peringatan** | `#C97A0E` | Menunggu review · Risiko SLA | Menunggu review, deadline mendekat, aksi yang belum diverifikasi. Berbeda dari Luna Orange — jangan ditukar. |
| **Error** | `#C9342B` | Ditolak · Destruktif | Validasi gagal, konfirmasi destruktif, penolakan kandidat. Jangan dipakai untuk momen branding. |
| **Info** | `#1F6FB5` | Petunjuk · Notice netral | Petunjuk netral, tips, dan notice non-blocking. Pakai secukupnya — mayoritas momen informatif bisa pakai netral. |

---

## 5. Komponen UI (Components)

**Tombol (Buttons)**
- **Primer**: Digunakan untuk aksi utama (CTA). Bisa berupa warna Luna Orange dengan teks gelap, atau warna hitam (Ink 900) dengan teks putih.
- **Sekunder**: Latar putih dengan border abu-abu untuk aksi alternatif.
- **Ghost**: Hanya teks tanpa border atau background untuk aksi sekunder (misal: Batalkan).
- **Disabled**: Latar abu-abu terang dengan teks abu-abu redup (untuk tombol yang belum bisa di-klik).

**Badge Status (State Pipeline)**
Badge menggunakan *pill shape* dengan paduan warna latar (background) pastel/lembut dan sebuah titik (dot) solid di sebelah kiri teks:
- **Aktif**: Background hijau muda, teks & dot hijau gelap (Sukses).
- **Pending**: Background oranye/cokelat muda, teks & dot oranye gelap/cokelat (Peringatan).
- **Ditolak**: Background merah muda, teks & dot merah gelap (Error).
- **Draft**: Background abu-abu muda, teks & dot abu-abu gelap (Ink).
- **Baru**: Background solid Luna Orange dengan dot dan teks warna gelap/hitam.

**Input Form**
- **Default**: Memiliki border abu-abu tipis. Teks deskripsi (helper text) di bawah memakai warna abu-abu (Ink 500).
- **Focus**: Saat di-klik/aktif, form mendapat *ring* atau border berwarna Luna Orange.
- **Error**: Border berubah menjadi merah (Semantic Error), teks deskripsi/peringatan juga berwarna merah.

**Card Kandidat**
- Desain *clean* dengan border abu-abu tipis (Ink 200). 
- Memuat: Avatar bulat (dengan warna latar solid dan inisial), Nama kandidat (bold/Hitam), Jabatan & Lokasi (abu-abu), dan *Badge Status* di ujung kanan.

**Alert (Notifikasi)**
Kotak alert menggunakan kombinasi latar warna sangat lembut dan garis tebal (*border-left*) solid di sisi kiri sebagai penanda visual:
- **Brand / Notice**: Latar warna cream/oranye sangat muda (`050`), garis pinggir kiri Luna Orange.
- **Sukses**: Latar hijau sangat muda, garis pinggir kiri Hijau Semantic (`#1F8A4E`).
- **Error**: Latar merah sangat muda, garis pinggir kiri Merah Semantic (`#C9342B`).

---

## 6. Voice & Tone (Copywriting)

**Karakter Suara Utama:**
*"Seperti recruiter senior yang sudah melihat segalanya — dan masih percaya pada pekerjaannya."*
Luna bersuara hangat tapi tidak lebay, percaya diri tapi tidak korporat. Kami menulis dalam bahasa Indonesia dan Inggris yang sederhana — kalimat pendek, kata kerja nyata, tanpa basa-basi pengisi.

**Prinsip Suara:**
1. **Sederhana di atas keren:** Tulis seperti rekan tim yang bicara langsung. Lewati jargon marketing.
   - ✅ `Pindahkan ke interview`
   - ❌ `Memulai engagement journey`
2. **Kata kerja, bukan kata benda:** Mulai dengan aksi. User datang untuk melakukan sesuatu, bukan membaca tentang prosesnya.
   - ✅ `Pasang lowongan`
   - ❌ `Pembuatan posting lowongan`
3. **Lokal lebih dulu:** Konteks Indonesia adalah default kami (Bahasa yang natural, Rupiah, BPJS, WhatsApp, dsb).
   - ✅ `Kirim offer via WhatsApp`
   - ❌ `Dispatch via messaging integration`
4. **Jujur saat ada hambatan:** Saat sesuatu gagal atau lambat, sampaikan apa adanya dan beri tahu langkah selanjutnya.
   - ✅ `Server email tidak bisa dihubungi. Coba lagi sebentar.`
   - ❌ `An unexpected error has occurred.`

**Contoh Copy di Lapangan:**
- **Headline Hero:** `Rekrut rekan tim berikutnya, bukan masalah berikutnya.` (Memberi janji yang sederhana, sedikit humor, tanpa jargon).
- **Label Tombol:** Fokus ke tindakan. (Contoh: `Pindahkan ke interview`, bukan `Memulai engagement workflow`).
- **Pesan Error:** Harus spesifik dan jelas alasannya. (Contoh: `2 CV gagal di-import — keduanya lebih dari 10MB.`, hindari `Error 413: Request entity too large.`).
- **Empty State:** Mengarahkan ke aksi selanjutnya. (Contoh: `Belum ada kandidat. Pasang role-mu dan Luna mulai mencari.`, hindari `No data available at this time.`).
