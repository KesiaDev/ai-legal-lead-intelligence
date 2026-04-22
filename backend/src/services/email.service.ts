import nodemailer from 'nodemailer';
import { env } from '../config/env';

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const transporter = createTransporter();
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  if (!transporter) {
    // Em dev ou sem SMTP configurado, apenas loga o link
    console.log(`[EMAIL] Reset link para ${to}: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: `"SDR Jurídico" <${env.SMTP_FROM}>`,
    to,
    subject: 'Redefinição de senha — SDR Jurídico',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Redefinir sua senha</h2>
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no SDR Jurídico.</p>
        <p>Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>.</p>
        <a href="${resetUrl}" style="
          display: inline-block; margin: 20px 0;
          padding: 12px 24px; background: #2563eb; color: #fff;
          text-decoration: none; border-radius: 6px; font-weight: bold;
        ">Redefinir senha</a>
        <p style="color: #666; font-size: 13px;">
          Se você não solicitou isso, ignore este email — sua senha permanece a mesma.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">SDR Jurídico — suporte@sdrjuridico.com.br</p>
      </div>
    `,
  });
}
