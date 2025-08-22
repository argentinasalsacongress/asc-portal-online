export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { default: QRCode } = await import('qrcode');
    const nodemailer = await import('nodemailer');

    const { to, name, city, mode, code } = req.body || {};
    if (!to || !code) return res.status(400).json({ error: 'Missing to/code' });

    const qr = await QRCode.toDataURL(code, { width: 220, margin: 1 });

    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif">
        <h2>Bienvenido/a a Argentina Salsa Congress</h2>
        <p>Hola ${name || ''}, confirmamos tu inscripción.</p>
        <p><b>Datos:</b> ${city || ''} · ${mode || ''}</p>
        <p><b>Código:</b> <code>${code}</code></p>
        <p><img src="${qr}" alt="QR ${code}" width="220" height="220"/></p>
      </div>`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject: `ASC · Confirmación (${code})`,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
