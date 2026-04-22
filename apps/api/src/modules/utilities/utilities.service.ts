import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUtilityDto {
  @ApiProperty({ enum: ['power', 'fiber', 'water', 'wastewater', 'gas'] })
  @IsEnum(['power', 'fiber', 'water', 'wastewater', 'gas'])
  utilityType!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerName?: string

  @ApiPropertyOptional({ enum: ['unavailable', 'under_study', 'pending', 'committed', 'active', 'decommissioned'] })
  @IsOptional()
  @IsEnum(['unavailable', 'under_study', 'pending', 'committed', 'active', 'decommissioned'])
  status?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  availableCapacity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  committedCapacity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estimatedDeliveryDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  confidenceScore?: number

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high', 'critical'] })
  @IsOptional()
  @IsString()
  riskLevel?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional()
  @IsOptional()
  powerDetails?: {
    voltageLevel?: string
    substationName?: string
    feederStatus?: string
    queuePosition?: string
    interconnectionRequired?: boolean
    energizationDependency?: string
  }
}

@Injectable()
export class UtilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, siteId: string, dto: CreateUtilityDto) {
    await this.verifySiteOwnership(tenantId, siteId)
    const { powerDetails, estimatedDeliveryDate, ...rest } = dto

    return this.prisma.utility.create({
      data: {
        ...rest,
        siteId,
        status: dto.status ?? 'under_study',
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined,
        ...(powerDetails && dto.utilityType === 'power'
          ? { powerDetails: { create: powerDetails } }
          : {}),
      },
      include: { powerDetails: true },
    })
  }

  async findBySite(tenantId: string, siteId: string) {
    await this.verifySiteOwnership(tenantId, siteId)
    return this.prisma.utility.findMany({
      where: { siteId },
      include: { powerDetails: true },
      orderBy: { utilityType: 'asc' },
    })
  }

  async findOne(id: string) {
    const utility = await this.prisma.utility.findUnique({
      where: { id },
      include: { powerDetails: true },
    })
    if (!utility) throw new NotFoundException(`Utility ${id} not found`)
    return utility
  }

  async update(tenantId: string, id: string, dto: Partial<CreateUtilityDto>) {
    const utility = await this.findOne(id)
    await this.verifySiteOwnership(tenantId, utility.siteId)

    const { powerDetails, estimatedDeliveryDate, ...rest } = dto

    return this.prisma.utility.update({
      where: { id },
      data: {
        ...rest,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined,
        ...(powerDetails
          ? {
              powerDetails: {
                upsert: { create: powerDetails, update: powerDetails },
              },
            }
          : {}),
      },
      include: { powerDetails: true },
    })
  }

  private async verifySiteOwnership(tenantId: string, siteId: string) {
    const site = await this.prisma.site.findFirst({ where: { id: siteId, tenantId, deletedAt: null } })
    if (!site) throw new NotFoundException(`Site ${siteId} not found`)
    return site
  }
}
