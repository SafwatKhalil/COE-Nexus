import { Module } from '@nestjs/common'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { CriticalPathService } from './critical-path.service'

@Module({
  controllers: [TasksController],
  providers: [TasksService, CriticalPathService],
  exports: [TasksService],
})
export class TasksModule {}
