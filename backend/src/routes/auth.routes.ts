import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  tenantName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Registro (cria tenant + user)
  fastify.post('/register', async (request, reply) => {
    try {
      const data = registerSchema.parse(request.body);

      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email already registered' });
      }

      // Criar tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: data.tenantName,
          plan: 'free',
        },
      });

      // Criar usuário admin
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: 'admin',
        },
      });

      // Gerar token
      const token = fastify.jwt.sign({
        id: user.id,
        tenantId: tenant.id,
        email: user.email,
      });

      return reply.send({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid data', details: error.errors });
      }
      console.error('Register error:', error);
      return reply.status(500).send({ error: 'Registration failed' });
    }
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const data = loginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          tenant: true,
        },
      });

      if (!user || !user.isActive) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const token = fastify.jwt.sign({
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
      });

      return reply.send({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid data', details: error.errors });
      }
      console.error('Login error:', error);
      return reply.status(500).send({ error: 'Login failed' });
    }
  });

  // Verificar token
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenant: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
      },
    });

    return reply.send({ user });
  });
}
