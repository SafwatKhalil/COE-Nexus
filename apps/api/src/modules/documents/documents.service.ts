import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters: { type?: string; search?: string; page: number; limit: number },
  ) {
    const { type, search, page, limit } = filters
    const skip = (page - 1) * limit

    const where: any = {
      tenantId,
      ...(type && { documentType: type }),
      ...(search && { fileName: { contains: search, mode: 'insensitive' } }),
    }

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: { links: { take: 3 }, uploadedBy: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async create(
    tenantId: string,
    userId: string,
    file: { originalname: string; mimetype: string; size: number },
    documentType?: string,
  ) {
    // In production, upload the file buffer to S3 and get back the storageKey.
    // For now we store metadata only.
    const storageKey = `${tenantId}/${Date.now()}-${file.originalname}`

    return this.prisma.document.create({
      data: {
        tenantId,
        uploadedById: userId,
        fileName: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        fileSize: BigInt(file.size),
        documentType: documentType ?? null,
      },
    })
  }

  async link(
    tenantId: string,
    documentId: string,
    dto: { entityType: string; entityId: string },
  ) {
    const doc = await this.prisma.document.findFirst({ where: { id: documentId, tenantId } })
    if (!doc) throw new NotFoundException(`Document ${documentId} not found`)

    return this.prisma.documentLink.create({
      data: {
        documentId,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    })
  }

  async findOne(tenantId: string, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, tenantId },
      include: { links: true },
    })
    if (!doc) throw new NotFoundException(`Document ${id} not found`)
    return doc
  }

  async findForEntity(tenantId: string, entityType: string, entityId: string) {
    return this.prisma.documentLink.findMany({
      where: { entityType, entityId, document: { tenantId } },
      include: { document: true },
    })
  }
}
