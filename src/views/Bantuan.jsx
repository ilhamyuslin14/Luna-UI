import { useState } from 'react';

export default function Bantuan() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="bantuan-view">
      <div className="bantuan-wrapper">
        <div className="bantuan-header-container">
          {/* Background Shapes as per Figma */}
          <div style={{ position: 'absolute', height: '661.879px', left: '-135px', top: '-115.75px', width: '815px', pointerEvents: 'none' }}>
            <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" style={{ display: 'block' }} viewBox="0 0 815 661.879" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="407.5" cy="330.939" rx="407.5" ry="330.939" fill="#033577"/>
            </svg>
          </div>
          <div style={{ position: 'absolute', height: '364.097px', left: '232px', top: '-242px', width: '448.328px', pointerEvents: 'none' }}>
            <svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" style={{ display: 'block' }} viewBox="0 0 448.328 364.097" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse opacity="0.5" cx="224.164" cy="182.048" rx="224.164" ry="182.048" fill="#033577"/>
            </svg>
          </div>

          <div className="bh-content">
            <h1 className="bh-title">Bantuan dan Dukungan Teknis</h1>
            <p className="bh-desc">
              Kami senang bisa membantu Anda memaksimalkan potensi LUNA AI. Tim kami akan memberikan solusi terbaik untuk kendala rekrutmen Anda.
            </p>
          </div>
          <div className="bh-benefit">
            <h3 className="bh-benefit-title">Support Benefit</h3>
            <ul className="bh-benefit-list">
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14b541" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Respon Cepat & Tanggap
              </li>
              <li>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14b541" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Panduan Langsung via WA
              </li>
            </ul>
          </div>
        </div>

        <div className="bantuan-cards-container">
          {/* Kartu Informasi Data Diri */}
          <div className="bantuan-card user-info-card">
            <div className="bc-header">
              <div className="bc-title-wrap">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0466a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <h2 className="bc-title">Informasi Data Diri</h2>
              </div>
              <button className="bc-edit-btn">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Edit
              </button>
            </div>

            <div className="bc-rows-container">
              <div className="bc-row">
                <div className="bc-field">
                  <span className="bc-label">Nama</span>
                  <span className="bc-value">Arif Berwin</span>
                </div>
                <div className="bc-field">
                  <span className="bc-label">Alamat Email</span>
                  <span className="bc-value">berwin.arif@example.com</span>
                </div>
              </div>

              <div className="bc-row">
                <div className="bc-field">
                  <span className="bc-label">Nomor Whatsapp</span>
                  <span className="bc-value">0812-3456-7890</span>
                </div>
                <div className="bc-field">
                  <span className="bc-label">Nama Perusahaan</span>
                  <span className="bc-value">PT. Teknologi Masa Depan</span>
                </div>
              </div>

              <div className="bc-row">
                <div className="bc-field">
                  <span className="bc-label">Industri</span>
                  <span className="bc-value">Teknologi & SaaS</span>
                </div>
                <div className="bc-field">
                  <span className="bc-label">Jumlah Karyawan</span>
                  <span className="bc-value">51-200 Orang</span>
                </div>
              </div>

              <div className="bc-row">
                <div className="bc-field">
                  <span className="bc-label">Lokasi</span>
                  <span className="bc-value">Jakarta Selatan, Indonesia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kartu Form Kendala */}
          {!isSubmitted ? (
            <div className="bantuan-card form-kendala-card">
              <div className="bc-header form-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0466a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                </svg>
                <h2 className="bc-title blue">Ceritakan kendala yang anda alami</h2>
              </div>
              
              <div className="bc-form">
                <div className="bcf-group">
                  <label>Subjek Singkat<span className="text-red">*</span></label>
                  <div className="bcf-select-wrapper">
                    <select className="bcf-select" defaultValue="">
                      <option value="" disabled hidden>Contoh : Tidak bisa upload CV.pdf</option>
                      <option value="upload">Kendala Upload File</option>
                      <option value="login">Kendala Login</option>
                      <option value="other">Lainnya</option>
                    </select>
                    <svg className="chevron-down" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
                
                <div className="bcf-group">
                  <label>Detail Pertanyaan<span className="text-red">*</span></label>
                  <textarea 
                    className="bcf-textarea" 
                    placeholder="Jelaskan kendala yang anda alami, atau langkah langkah yang anda lalui ketika mendapatkan kendala"
                  ></textarea>
                </div>

                <button className="bcf-submit-btn" onClick={() => setIsSubmitted(true)}>Kirim Pertanyaan</button>
              </div>
            </div>
          ) : (
            <div className="bantuan-card form-kendala-card success-state">
              <div className="success-content">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M35.3125 3.75H4.6875C2.10281 3.75 0 5.85281 0 8.4375V12.3043L17.2024 25.0997C18.0391 25.722 19.0195 26.0331 20 26.0331C20.9805 26.0331 21.9609 25.722 22.7976 25.0997L40 12.3043V8.4375C40 5.85281 37.8972 3.75 35.3125 3.75ZM36.875 10.7341L20.9326 22.5922C20.3748 23.0071 19.6252 23.0071 19.0675 22.5922L3.125 10.7341V8.4375C3.125 7.57594 3.82594 6.875 4.6875 6.875H35.3125C36.1741 6.875 36.875 7.57594 36.875 8.4375V10.7341ZM36.875 18.5234L40 16.199V31.5625C40 34.1472 37.8972 36.25 35.3125 36.25H4.6875C2.10281 36.25 0 34.1472 0 31.5625V16.199L3.125 18.5234V31.5625C3.125 32.4241 3.82594 33.125 4.6875 33.125H35.3125C36.1741 33.125 36.875 32.4241 36.875 31.5625V18.5234Z" fill="#0977BE"/>
                </svg>
                <h2 className="success-title">Pesan Terkirim ke Tim Support!</h2>
              </div>
              
              <p className="success-desc">
                Terima kasih! Kami telah menerima pertanyaan Anda. Harap tunggu Tim Support kami akan menghubungi anda terkait kendala tersebut melalui <strong>Whatsapp</strong>
              </p>
              
              <p className="success-time">
                Estimasi: Dalam 1 Jam<br/>
                09:00 - 18:00 (Senin - Jumat)
              </p>
              
              <button className="bcf-submit-btn" onClick={() => setIsSubmitted(false)}>
                Ajukan Pertanyaan Lainnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
