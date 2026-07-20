// ── extractTextFromFile.js ────────────────────────────────────────────────────
// Ekstraksi teks client-side dari PDF/DOCX/TXT, dipakai bareng oleh semua
// halaman Sandbox (Kriteria, CV Parsing, AI Scoring, Labs).
//
// PDF di-handle pakai pdfjs-dist langsung (bukan react-pdftotext) karena
// react-pdftotext menggabungkan semua text item dari pdf.js pakai `.join(' ')`
// tanpa mempertimbangkan posisi (x,y) antar item. Itu bikin kata yang di PDF-nya
// tersimpan sebagai beberapa text-run terpisah (umum terjadi pada teks bold/
// heading karena kerning manual) pecah jadi contoh: "Job Description" →
// "J ob Desc rip tion". Di sini spasi cuma disisipkan kalau jarak horizontal
// antar item cukup besar dibanding ukuran font — bukan disisipkan otomatis
// di setiap item seperti react-pdftotext.
// ─────────────────────────────────────────────────────────────────────────────

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

function joinTextItems(items) {
  let text = '';
  let lastItem = null;

  for (const item of items) {
    if (!('str' in item)) continue;

    if (item.str === '') {
      if (item.hasEOL) text += '\n';
      continue;
    }

    const [, , , scaleY, x, y] = item.transform;
    const fontSize = Math.abs(scaleY) || 10;

    if (lastItem) {
      const lastX = lastItem.transform[4] + lastItem.width;
      const lastY = lastItem.transform[5];
      const sameLine = Math.abs(y - lastY) < fontSize * 0.5;

      if (!sameLine) {
        text += '\n';
      } else {
        const gap = x - lastX;
        // Cuma anggap "spasi asli" kalau jaraknya signifikan dibanding ukuran
        // font — jarak kecil/negatif berarti item ini pecahan glyph dari kata
        // yang sama (efek kerning), bukan batas antar kata.
        if (gap > fontSize * 0.15) text += ' ';
      }
    }

    text += item.str;
    if (item.hasEOL) text += '\n';

    lastItem = item;
  }

  return text;
}

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    fullText += joinTextItems(textContent.items) + '\n\n';
  }

  return fullText.trim();
}

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    return await extractPdfText(file);
  }

  if (ext === 'docx') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
          resolve(result.value);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  if (ext === 'txt' || ext === 'doc') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  throw new Error('Format file tidak didukung. Harap unggah PDF, DOCX, atau TXT.');
}
