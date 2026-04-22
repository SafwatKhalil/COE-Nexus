import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { LifecycleStage, ControlStatus } from '@coe-nexus/shared'

export class CreateSiteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siteCode?: string

  @ApiProperty()
  @IsString()
  name!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metro?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional({ enum: ['prospect', 'feasibility', 'entitlement', 'development', 'construction', 'commissioning', 'operational', 'decommissioned'] })
  @IsOptional()
  @IsEnum(['prospect', 'feasibility', 'entitlement', 'development', 'construction', 'commissioning', 'operational', 'decommissioned'])
  lifecycleStage?: LifecycleStage

  @ApiPropertyOptional({ enum: ['prospect', 'loi', 'optioned', 'leased', 'owned', 'active'] })
  @IsOptional()
  @IsEnum(['prospect', 'loi', 'optioned', 'leased', 'owned', 'active'])
  controlStatus?: ControlStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zoningStatus?: string

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  strategicPriority?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  targetMw?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string
}
