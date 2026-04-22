import { Injectable } from '@nestjs/common'

interface TaskNode {
  id: string
  durationDays: number
  plannedStartDate: Date | null
  plannedEndDate: Date | null
}

interface DependencyEdge {
  predecessorTaskId: string
  successorTaskId: string
  dependencyType: string
  lagDays: number
}

interface CPMResult {
  criticalTasks: Set<string>
  earlyStart: Map<string, number>
  earlyFinish: Map<string, number>
  lateStart: Map<string, number>
  lateFinish: Map<string, number>
  totalFloat: Map<string, number>
}

@Injectable()
export class CriticalPathService {
  /**
   * Computes CPM (Critical Path Method) for a set of tasks.
   * Returns early start/finish, late start/finish, total float, and critical path.
   * All values are in days relative to project start (day 0).
   */
  compute(tasks: TaskNode[], dependencies: DependencyEdge[]): CPMResult {
    if (!tasks.length) {
      return {
        criticalTasks: new Set(),
        earlyStart: new Map(),
        earlyFinish: new Map(),
        lateStart: new Map(),
        lateFinish: new Map(),
        totalFloat: new Map(),
      }
    }

    const taskMap = new Map(tasks.map((t) => [t.id, t]))
    const successors = new Map<string, DependencyEdge[]>()
    const predecessors = new Map<string, DependencyEdge[]>()

    for (const t of tasks) {
      successors.set(t.id, [])
      predecessors.set(t.id, [])
    }

    for (const dep of dependencies) {
      successors.get(dep.predecessorTaskId)?.push(dep)
      predecessors.get(dep.successorTaskId)?.push(dep)
    }

    // Topological sort (Kahn's algorithm)
    const inDegree = new Map(tasks.map((t) => [t.id, predecessors.get(t.id)!.length]))
    const queue = tasks.filter((t) => inDegree.get(t.id) === 0).map((t) => t.id)
    const topoOrder: string[] = []

    while (queue.length) {
      const current = queue.shift()!
      topoOrder.push(current)
      for (const dep of successors.get(current) ?? []) {
        const newInDegree = (inDegree.get(dep.successorTaskId) ?? 0) - 1
        inDegree.set(dep.successorTaskId, newInDegree)
        if (newInDegree === 0) queue.push(dep.successorTaskId)
      }
    }

    // Forward pass — compute Early Start and Early Finish
    const earlyStart = new Map<string, number>()
    const earlyFinish = new Map<string, number>()

    for (const id of topoOrder) {
      const task = taskMap.get(id)!
      const duration = task.durationDays ?? 1
      const preds = predecessors.get(id) ?? []

      let es = 0
      for (const dep of preds) {
        const predEF = earlyFinish.get(dep.predecessorTaskId) ?? 0
        const effectiveEF = predEF + (dep.lagDays ?? 0)
        if (effectiveEF > es) es = effectiveEF
      }

      earlyStart.set(id, es)
      earlyFinish.set(id, es + duration)
    }

    const projectEnd = Math.max(...Array.from(earlyFinish.values()))

    // Backward pass — compute Late Start and Late Finish
    const lateStart = new Map<string, number>()
    const lateFinish = new Map<string, number>()

    for (const id of [...topoOrder].reverse()) {
      const task = taskMap.get(id)!
      const duration = task.durationDays ?? 1
      const succs = successors.get(id) ?? []

      let lf = projectEnd
      for (const dep of succs) {
        const succLS = lateStart.get(dep.successorTaskId) ?? projectEnd
        const effectiveLS = succLS - (dep.lagDays ?? 0)
        if (effectiveLS < lf) lf = effectiveLS
      }

      lateFinish.set(id, lf)
      lateStart.set(id, lf - duration)
    }

    // Total float and critical path
    const totalFloat = new Map<string, number>()
    const criticalTasks = new Set<string>()

    for (const t of tasks) {
      const tf = (lateStart.get(t.id) ?? 0) - (earlyStart.get(t.id) ?? 0)
      totalFloat.set(t.id, tf)
      if (tf === 0) criticalTasks.add(t.id)
    }

    return { criticalTasks, earlyStart, earlyFinish, lateStart, lateFinish, totalFloat }
  }

  detectCycles(tasks: { id: string }[], dependencies: DependencyEdge[]): boolean {
    const visited = new Set<string>()
    const stack = new Set<string>()
    const adj = new Map(tasks.map((t) => [t.id, [] as string[]]))

    for (const dep of dependencies) {
      adj.get(dep.predecessorTaskId)?.push(dep.successorTaskId)
    }

    const dfs = (node: string): boolean => {
      if (stack.has(node)) return true
      if (visited.has(node)) return false
      visited.add(node)
      stack.add(node)
      for (const neighbor of adj.get(node) ?? []) {
        if (dfs(neighbor)) return true
      }
      stack.delete(node)
      return false
    }

    return tasks.some((t) => dfs(t.id))
  }
}
