import React, { useState, useRef } from 'react';

export default function MenungguPembayaran({ navigate, back }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsUploading(false);
              setShowSuccessModal(true);
            }, 500); // small delay before showing success
            return 100;
          }
          return prev + 10; // increase by 10% each tick
        });
      }, 200);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('riwayat-transaksi');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('800912345678');
    alert('Nomor rekening berhasil disalin!');
  };

  return (
    <div className="mp-page-wrapper">
      <div className="mp-card">
        
        {/* Header & Timer */}
        <div className="mp-header-block">
          <h1 className="mp-title">Menunggu Pembayaran</h1>
          <div className="mp-subtitle-group">
            <p className="mp-subtitle">Selesaikan pembayaran sebelum:</p>
            <div className="mp-timer-box">
              <span className="mp-timer-text">Rabu, 4 Februari 2026, 15:14</span>
            </div>
          </div>
        </div>

        {/* Total Transfer Block */}
        <div className="mp-total-box">
          <p className="mp-total-label">Total Transfer</p>
          <div className="mp-amount-wrap">
            <p className="mp-amount">
              Rp 277.<span className="mp-amount-orange">623</span>
            </p>
            <div className="mp-copy-icon" onClick={() => { navigator.clipboard.writeText('277623'); alert('Nominal berhasil disalin!') }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#171e2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
          </div>
          <div className="mp-warning-box">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e46002" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="mp-warning-text">
              PENTING: Mohon transfer tepat hingga 3 digit terakhir (Kode Unik).
            </p>
          </div>
        </div>

        {/* Bank Details Block */}
        <div className="mp-bank-box">
          <div className="mp-bank-left">
            <div className="mp-bank-logo-wrap">
              <svg className="mp-bank-logo" viewBox="0 0 62 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M48.5 3C53.5 1.5 58.5 2.5 61.5 4.5C57.5 5.5 52.5 4.5 48.5 3Z" fill="#FDB813" />
                <path d="M46.5 5.5C51.5 4 56.5 5.5 60.5 7.5C56.5 7 51.5 6 46.5 5.5Z" fill="#F58220" />
                <text x="1" y="14" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="900" fontStyle="italic" fill="#003d79" letterSpacing="-0.3">mandiri</text>
              </svg>
            </div>
            <div className="mp-bank-info">
              <p className="mp-bank-name">Bank Transfer</p>
              <p className="mp-bank-holder">PT Arkademi Daya Indonesia</p>
            </div>
          </div>
          <div className="mp-bank-divider" />
          <div className="mp-bank-right">
            <p className="mp-acc-number">8009-1234-5678</p>
            <div className="mp-copy-icon" onClick={handleCopy}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#171e2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Petunjuk Pembayaran */}
        <div className="mp-instructions">
          <p className="mp-instructions-title">Petunjuk Pembayaran</p>
          <ol className="mp-instructions-list">
            <li>Lakukan transfer melalui ATM, Mobile Banking, atau Internet Banking.</li>
            <li>Masukkan nomor rekening di atas.</li>
            <li>Pastikan nominal transfer sesuai dengan total yang tertera (hingga 3 digit terakhir).</li>
            <li>Simpan bukti transfer Anda.</li>
            <li>Pembayaran akan diverifikasi otomatis dalam 10-20 menit.</li>
          </ol>
        </div>

        {/* Rincian Pesanan & Invoice */}
        <div className="mp-details">
          <div className="mp-details-header">
            <p className="mp-details-title">Rincian Pesanan & Invoice</p>
            <svg width="9" height="6" viewBox="0 0 24 24" fill="none" stroke="#7e8799" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          <div className="mp-details-body">
            <div className="mp-details-row">
              <p className="mp-details-label">No. Invoice</p>
              <p className="mp-details-value">INV/LUNA/2026/10024</p>
            </div>
            <div className="mp-details-row">
              <p className="mp-details-label">Elite Plan (1 Bulan)</p>
              <p className="mp-details-value">Rp 250.000</p>
            </div>
            <div className="mp-details-row">
              <p className="mp-details-label">PPN (11%)</p>
              <p className="mp-details-value">Rp 27.500</p>
            </div>
            <div className="mp-details-row">
              <p className="mp-details-label">Kode Unik</p>
              <p className="mp-details-value">Rp 123</p>
            </div>
          </div>
          
          <div className="mp-details-total">
            <p className="mp-details-total-label">Total</p>
            <p className="mp-details-total-value">Rp 277.623</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mp-actions">
          <button className="mp-btn-secondary" onClick={() => navigate('riwayat-transaksi')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19L5 12L12 5" />
            </svg>
            Kembali
          </button>
          <button className="mp-btn-primary" onClick={() => alert('Fitur unduh invoice belum tersedia.')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Unduh Invoice
          </button>
        </div>

      </div>
      
      {/* Link Upload */}
      <p className="mp-upload-link">
        Sudah melakukan pembayaran? <span className="mp-upload-link-action" onClick={handleUploadClick}>Unggah Bukti Pembayaran</span>
      </p>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" hidden />

      {/* Modal Upload Progress */}
      {isUploading && (
        <div className="mp-modal-overlay">
          <div className="mp-modal-box">
            <div className="mp-modal-icon uploading">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="mp-modal-title">Mengunggah Bukti Pembayaran</h3>
            <p className="mp-modal-desc">Mohon tunggu sebentar, file Anda sedang diunggah ke sistem kami.</p>
            <div className="mp-progress-container">
              <div className="mp-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <span className="mp-progress-text">{uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Modal Success */}
      {showSuccessModal && (
        <div className="mp-modal-overlay">
          <div className="mp-modal-box">
            <div className="mp-modal-icon success" style={{ backgroundColor: 'transparent', width: 'auto', height: 'auto', marginBottom: '20px' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#089F32"/>
                <path d="M19 33.5L27 41.5L46 22.5" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="mp-modal-title">Berhasil Diunggah!</h3>
            <p className="mp-modal-desc">Harap tunggu sampai pembayaran terverifikasi oleh sistem. Anda dapat memantau statusnya di Riwayat Transaksi.</p>
            <button className="mp-modal-btn" onClick={handleCloseSuccess}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
