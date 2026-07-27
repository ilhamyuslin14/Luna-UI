import { useRef } from 'react';

/* ── OTP 6-box input (dipakai bareng oleh flow verifikasi WhatsApp & Email) ── */
export default function OTPInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        const next = [...value];
        next[i] = '';
        onChange(next);
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
      }
    }
  };

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    onChange(next);
    const focus = Math.min(pasted.length, 5);
    inputs.current[focus]?.focus();
  };

  return (
    <div className="lpotp-boxes">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          className={`lpotp-box${digit ? ' lpotp-box-filled' : ''}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
