import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { UploadProvider } from './context/UploadContext.jsx';
import { BuatLowonganPanduanProvider } from './context/BuatLowonganPanduanContext.jsx';
import '../style.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UploadProvider>
          <BuatLowonganPanduanProvider>
            <App />
          </BuatLowonganPanduanProvider>
        </UploadProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
