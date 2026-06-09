import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { UploadProvider } from './context/UploadContext.jsx';
import '../style.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <UploadProvider>
        <App />
      </UploadProvider>
    </AuthProvider>
  </StrictMode>
);
