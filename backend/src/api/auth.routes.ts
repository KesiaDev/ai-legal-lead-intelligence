import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '../services/email.service';

export async function registerAuthRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma as PrismaClient;

  // POST /forgot-password
  fastify.post('/forgot-password', async (request: any, reply: any) => {
    const { email } = request.body as { email: string };

    if (!email) {
      return reply.status(400).send({ error: 'Email é obrigatório' });
    }

    // Sempre retorna 200 — não revela se email existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.isActive) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: token, passwordResetExpiry: expiry },
      });

      try {
        await sendPasswordResetEmail(email, user.name, token);
      } catch (err) {
        fastify.log.error({ err }, 'Erro ao enviar email de reset');
      }
    }

    return reply.send({
      message: 'Se este email estiver cadastrado, você receberá as instruções em breve.',
    });
  });

  // POST /reset-password
  fastify.post('/reset-password', async (request: any, reply: any) => {
    const { token, newPassword } = request.body as { token: string; newPassword: string };

    if (!token || !newPassword) {
      return reply.status(400).send({ error: 'Token e nova senha são obrigatórios' });
    }
    if (newPassword.length < 6) {
      return reply.status(400).send({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });

    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      return reply.status(400).send({ error: 'Link inválido ou expirado. Solicite um novo.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
    });

    return reply.send({ message: 'Senha redefinida com sucesso. Faça login.' });
  });
}
