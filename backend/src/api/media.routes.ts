/**
 * Media Routes — Upload/listagem de arquivos via Cloudinary
 *
 * POST /api/media/upload     → faz upload para Cloudinary, salva URL no banco
 * GET  /api/media            → lista arquivos do tenant
 * DELETE /api/media/:id      → remove do banco e do Cloudinary
 * GET  /api/media/stats      → contagem e espaço usado
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate } from '../middleware/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
    pdf: 'application/pdf', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return map[ext] || 'application/octet-stream';
}

function getMediaType(mimetype: string): 'image' | 'video' | 'audio' | 'document' {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
}

function getCloudinaryResourceType(mimetype: string): 'image' | 'video' | 'raw' {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/') || mimetype.startsWith('audio/')) return 'video';
  return 'raw';
}

export async function registerMediaRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma as PrismaClient;

  // ── POST /api/media/upload ───────────────────────────────────────────────
  fastify.post('/api/media/upload', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const { tenantId, id: userId } = request.user;

      // Recebe multipart
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: 'Nenhum arquivo enviado' });

      const filename = data.filename || 'upload';
      const mimetype = data.mimetype || getMimeType(filename);
      const mediaType = getMediaType(mimetype);
      const resourceType = getCloudinaryResourceType(mimetype);

      // Lê o buffer do arquivo
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const sizeBytes = buffer.length;

      // Verifica limite de arquivos (1000 por tenant)
      const count = await prisma.mediaFile.count({ where: { tenantId } });
      if (count >= 1000) {
        return reply.status(400).send({ error: 'Limite de 1.000 arquivos atingido' });
      }

      // Upload para Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `sdr-juridico/${tenantId}`,
            resource_type: resourceType,
            public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`,
            use_filename: false,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(buffer);
      });

      // Salva no banco
      const mediaFile = await prisma.mediaFile.create({
        data: {
          tenantId,
          name: filename,
          type: mediaType,
          mimeType: mimetype,
          url: uploadResult.secure_url,
          size: sizeBytes,
          uploadedBy: userId,
          tags: [],
        },
      });

      return reply.status(201).send({
        id: mediaFile.id,
        name: mediaFile.name,
        type: mediaFile.type,
        url: mediaFile.url,
        size: mediaFile.size,
        createdAt: mediaFile.createdAt,
      });

    } catch (error: any) {
      fastify.log.error({ err: error.message }, 'Erro no upload de mídia');
      return reply.status(500).send({ error: 'Erro ao fazer upload', message: error.message });
    }
  });

  // ── GET /api/media ───────────────────────────────────────────────────────
  fastify.get('/api/media', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user;
      const { type, search, limit = 100, offset = 0 } = request.query as any;

      const files = await prisma.mediaFile.findMany({
        where: {
          tenantId,
          ...(type && type !== 'all' && { type }),
          ...(search && { name: { contains: search, mode: 'insensitive' as any } }),
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      });

      const total = await prisma.mediaFile.count({ where: { tenantId } });

      return reply.send({ files, total });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Erro ao listar arquivos' });
    }
  });

  // ── GET /api/media/stats ─────────────────────────────────────────────────
  fastify.get('/api/media/stats', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user;

      const files = await prisma.mediaFile.findMany({
        where: { tenantId },
        select: { size: true, type: true },
      });

      const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
      const byType = files.reduce((acc: any, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      }, {});

      return reply.send({
        totalFiles: files.length,
        totalBytes,
        totalGB: (totalBytes / (1024 * 1024 * 1024)).toFixed(2),
        byType,
        limits: { files: 1000, gb: 10 },
      });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Erro ao buscar stats' });
    }
  });

  // ── DELETE /api/media/:id ────────────────────────────────────────────────
  fastify.delete('/api/media/:id', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const { tenantId } = request.user;
      const { id } = request.params as any;

      const file = await prisma.mediaFile.findFirst({ where: { id, tenantId } });
      if (!file) return reply.status(404).send({ error: 'Arquivo não encontrado' });

      // Remove do Cloudinary
      try {
        const publicId = file.url.split('/').slice(-1)[0].split('.')[0];
        const folder = `sdr-juridico/${tenantId}`;
        const resourceType = getCloudinaryResourceType(file.mimeType);
        await cloudinary.uploader.destroy(`${folder}/${publicId}`, { resource_type: resourceType });
      } catch (err: any) {
        fastify.log.warn({ err: err.message }, 'Falha ao remover do Cloudinary');
      }

      // Remove do banco
      await prisma.mediaFile.delete({ where: { id } });

      return reply.send({ success: true });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Erro ao deletar arquivo' });
    }
  });
}
