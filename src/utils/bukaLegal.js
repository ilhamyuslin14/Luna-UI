// Membuka pop up Syarat & Ketentuan / Kebijakan Privasi dari mana saja (formulir daftar, footer, dst.).
// Pop up-nya dipasang sekali di App.jsx (components/legal/LegalModalHost.jsx) dan mendengarkan peristiwa ini.
//
// Pilihan `persetujuan` ({ setuju, onUbah }) dipakai formulir yang punya kotak ceklis persetujuan: pop up menampilkan
// kotak yang sama dan memanggil onUbah(nilaiBaru) saat diceklis, sehingga kotak di formulir ikut berubah.
// Tanpa itu (mis. dari footer) pop up hanya untuk dibaca.
export const EVENT_BUKA_LEGAL = 'luna:buka-legal';

export function bukaLegal(dokumen = 'syarat', persetujuan = null) {
  window.dispatchEvent(new CustomEvent(EVENT_BUKA_LEGAL, { detail: { dokumen, persetujuan } }));
}
