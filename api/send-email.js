export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { Resend } = await import('resend');
    const { default: QRCode } = await import('qrcode');

    const { to, name, city, mode, code } = req.body || {};
    if (!to || !code) return res.status(400).json({ error: 'Missing to/code' });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const qr = await QRCode.toDataURL(code, { width: 220, margin: 1 });

    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif">
        <h2>Bienvenido/a a Argentina Salsa Congress</h2>
        <p>Hola ${name || ''}, confirmamos tu inscripción.</p>
        <p><b>Datos:</b> ${city || ''} · ${mode || ''}</p>
        <p><b>Código:</b> <code>${code}</code></p>
        <p><img src="${qr}" alt="QR ${code}" width="220" height="220"/></p>
      </div>`;
    const from = process.env.FROM_EMAIL || 'noreply@example.com';
    const subject = `ASC · Confirmación (${code})`;

    const r = await resend.emails.send({ from, to, subject, html });
    return res.status(200).json({ ok: true, id: r?.id || null });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}

