// /api/send-email.js
import { Resend } from 'resend';
import QRCode from 'qrcode';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { to, name, city, mode, code } = req.body || {};
    if (!to || !code) return res.status(400).json({ error: 'Missing to/code' });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const qrDataUrl = await QRCode.toDataURL(code, { width: 220, margin: 1 });

    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif">
        <h2 style="margin:0 0 8px 0">Bienvenido/a a Argentina Salsa Congress</h2>
        <p>Hola ${name||''}, confirmamos tu inscripción.</p>
        <p><b>Datos:</b> ${city||''} · ${mode||''}</p>
        <p><b>Código:</b> <code>${code}</code></p>
        <p><img src="${qrDataUrl}" alt="QR ${code}" style="width:220px;height:220px;"/></p>
        <p>Mostrá este QR o código en acreditación.</p>
      </div>`;

    const from = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
    const subject = `ASC · Confirmación de inscripción (${code})`;

    const resp = await resend.emails.send({ from, to, subject, html });
    return res.status(200).json({ ok: true, id: resp?.id || null });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}