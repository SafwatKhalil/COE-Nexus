import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface CreateAuditEventDto {
  tenantId: string
  actorUserId?: string
  entityType: string
  entityId: string
  action: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateAuditEventDto) {
    return this.prisma.auditEvent.create({
      data: {
        tenantId: dto.tenantId,
        actorUserId: dto.actorUserId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        action: dto.action,
        beforeState: dto.beforeState ?? null,
        afterState: dto.afterState ?? null,
      },
    })
  }

  async findForEntity(tenantId: string, entityType: string, entityId: string, limit = 50) {
    return this.prisma.auditEvent.findMany({
      where: { tenantId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actorUser: { select: { id: true, name: true, email: true } },
      },
    })
  }

  async findForTenant(
    tenantId: string,
    filters: { entityType?: string; action?: string; fromDate?: string; toDate?: string },
    page = 1,
    pageSize = 50,
  ) {
    const where = {
      tenantId,
      ...(filters.entityType && { entityType: filters.entityType }),
      ...(filters.action && { action: filters.action }),
      ...(filters.fromDate || filters.toDate
        ? {
            createdAt: {
              ...(filters.fromDate && { gte: new Date(filters.fromDate) }),
              ...(filters.toDate && { lte: new Date(filters.toDate) }),
            },
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      this.prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          actorUser: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditEvent.count({ where }),
    ])

    return { data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } }
  }
}
