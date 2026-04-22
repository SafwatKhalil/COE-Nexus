import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { IsString, IsOptional, IsNumber } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateParcelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apn?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  acreage?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownershipType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  acquisitionDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  saleOptionExpiration?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zoningClassification?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  environmentalStatus?: string
}

@Injectable()
export class ParcelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, siteId: string, dto: CreateParcelDto) {
    await this.verifySiteOwnership(tenantId, siteId)
    return this.prisma.parcel.create({
      data: {
        siteId,
        ...dto,
        acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : undefined,
        saleOptionExpiration: dto.saleOptionExpiration
          ? new Date(dto.saleOptionExpiration)
          : undefined,
      },
    })
  }

  async findAll(tenantId: string, siteId: string) {
    await this.verifySiteOwnership(tenantId, siteId)
    return this.prisma.parcel.findMany({ where: { siteId } })
  }

  async update(tenantId: string, siteId: string, parcelId: string, dto: Partial<CreateParcelDto>) {
    await this.verifySiteOwnership(tenantId, siteId)
    return this.prisma.parcel.update({
      where: { id: parcelId, siteId },
      data: {
        ...dto,
        acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : undefined,
        saleOptionExpiration: dto.saleOptionExpiration
          ? new Date(dto.saleOptionExpiration)
          : undefined,
      },
    })
  }

  async remove(tenantId: string, siteId: string, parcelId: string) {
    await this.verifySiteOwnership(tenantId, siteId)
    return this.prisma.parcel.delete({ where: { id: parcelId, siteId } })
  }

  private async verifySiteOwnership(tenantId: string, siteId: string) {
    const site = await this.prisma.site.findFirst({ where: { id: siteId, tenantId, deletedAt: null } })
    if (!site) throw new NotFoundException(`Site ${siteId} not found`)
    return site
  }
}
