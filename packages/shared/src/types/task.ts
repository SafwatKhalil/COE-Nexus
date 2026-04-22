export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export interface Task {
  id: string
  siteId: string
  parentTaskId: string | null
  taskType: string | null
  name: string
  description: string | null
  ownerUserId: string | null
  status: TaskStatus
  plannedStartDate: string | null
  plannedEndDate: string | null
  actualStartDate: string | null
  actualEndDate: string | null
  durationDays: number | null
  percentComplete: number | null
  critical: boolean
  createdAt: string
  updatedAt: string
  dependencies?: TaskDependency[]
  children?: Task[]
}

export interface TaskDependency {
  id: string
  predecessorTaskId: string
  successorTaskId: string
  dependencyType: DependencyType
  lagDays: number
  createdAt: string
}

export interface CreateTaskDto {
  parentTaskId?: string
  taskType?: string
  name: string
  description?: string
  ownerUserId?: string
  status?: TaskStatus
  plannedStartDate?: string
  plannedEndDate?: string
  durationDays?: number
  percentComplete?: number
  critical?: boolean
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

export interface CreateTaskDependencyDto {
  predecessorTaskId: string
  dependencyType?: DependencyType
  lagDays?: number
}

export interface CriticalPathResult {
  criticalTasks: string[]
  totalFloat: Record<string, number>
  earliestStart: Record<string, string>
  earliestFinish: Record<string, string>
  latestStart: Record<string, string>
  latestFinish: Record<string, string>
}
