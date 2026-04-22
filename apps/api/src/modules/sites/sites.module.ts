import { Module } from '@nestjs/common'
import { SitesController } from './sites.controller'
import { SitesService } from './sites.service'
import { ParcelsController } from './parcels.controller'
import { ParcelsService } from './parcels.service'

@Module({
  controllers: [SitesController, ParcelsController],
  providers: [SitesService, ParcelsService],
  exports: [SitesService],
})
export class SitesModule {}
