import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { SitesModule } from './modules/sites/sites.module'
import { UtilitiesModule } from './modules/utilities/utilities.module'
import { PermitsModule } from './modules/permits/permits.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { ScoringModule } from './modules/scoring/scoring.module'
import { ForecastingModule } from './modules/forecasting/forecasting.module'
import { DocumentsModule } from './modules/documents/documents.module'
import { AuditModule } from './modules/audit/audit.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import appConfig from './config/app.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    SitesModule,
    UtilitiesModule,
    PermitsModule,
    TasksModule,
    ScoringModule,
    ForecastingModule,
    DocumentsModule,
    AuditModule,
    DashboardModule,
  ],
})
export class AppModule {}
