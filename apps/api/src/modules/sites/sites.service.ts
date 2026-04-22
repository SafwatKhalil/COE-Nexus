import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateSiteDto } from './dto/create-site.dto'
import { UpdateSiteDto } from './dto/update-site.dto'
import { QuerySiteDto } from './dto/query-site.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateSiteDto) {
    return this.prisma.site.create({
      data: {
        ...dto,
        tenantId,
        createdById: userId,
        lifecycleStage: dto.lifecycleStage ?? 'prospect',
        controlStatus: dto.controlStatus ?? 'prospect',
      },
    })
  }

  async findAll(tenantId: string, query: QuerySiteDto) {
    const { region, lifecycleStage, controlStatus, search, page = 1, pageSize = 20 } = query

    const where: Prisma.SiteWhereInput = {
      tenantId,
      deletedAt: null,
      ...(region && { region }),
      ...(lifecycleStage && { lifecycleStage }),
      ...(controlStatus && { controlStatus }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { siteCode: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { metro: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      this.prisma.site.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          readinessSnapshots: {
            orderBy: { computedAt: 'desc' },
            take: 1,
            select: { score: true, computedAt: true },
          },
          _count: { select: { utilities: true, permits: true, tasks: true } },
        },
      }),
      this.prisma.site.count({ where }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async findOne(tenantId: string, id: string) {
    const site = await this.prisma.site.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        parcels: true,
        utilities: { include: { powerDetails: true } },
        permits: true,
        environmentalConstraints: true,
        readinessSnapshots: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!site) throw new NotFoundException(`Site ${id} not found`)
    return site
  }

  async update(tenantId: string, id: string, dto: UpdateSiteDto) {
    await this.findOne(tenantId, id)
    return this.prisma.site.update({
      where: { id },
      data: dto,
    })
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id)
    return this.prisma.site.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}
